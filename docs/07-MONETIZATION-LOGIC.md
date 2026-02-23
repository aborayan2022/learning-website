# Monetization Logic — Implementation Guide

## 1. Revenue Model Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     REVENUE STREAMS                               │
│                                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
│  │  Commission   │  │  Subscription │  │  Featured Listing    │  │
│  │  per Booking  │  │  Plans        │  │  Boost               │  │
│  │               │  │               │  │                      │  │
│  │  7% — 20%     │  │  Monthly/     │  │  One-time or         │  │
│  │  of each      │  │  Yearly       │  │  weekly fee          │  │
│  │  transaction  │  │  teacher fee  │  │  for top placement   │  │
│  └───────────────┘  └───────────────┘  └──────────────────────┘  │
│                                                                   │
│  Commission Rate decreases with higher subscription tier          │
│  Free: 20% → Basic: 15% → Premium: 10% → Enterprise: 7%        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Commission Service — Full Implementation

```php
<?php
// app/Services/Commission/CommissionService.php

namespace App\Services\Commission;

use App\Models\Booking;
use App\Models\Commission;
use App\Models\Payment;
use App\Models\TeacherProfile;
use App\Models\TeacherSubscription;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommissionService
{
    /**
     * Calculate and store commission for a completed payment.
     */
    public function calculateAndStore(Payment $payment): Commission
    {
        $booking = $payment->booking;

        if (!$booking) {
            throw new \DomainException('Payment is not linked to a booking.');
        }

        $teacherProfile = TeacherProfile::where('user_id', $booking->teacher_id)->firstOrFail();
        $commissionRate = $this->getCommissionRate($teacherProfile);

        $grossAmount = (float) $payment->amount;
        $commissionAmount = round($grossAmount * ($commissionRate / 100), 2);
        $netTeacherAmount = round($grossAmount - $commissionAmount, 2);

        return Commission::create([
            'payment_id' => $payment->id,
            'booking_id' => $booking->id,
            'teacher_id' => $booking->teacher_id,
            'gross_amount' => $grossAmount,
            'commission_rate' => $commissionRate,
            'commission_amount' => $commissionAmount,
            'net_teacher_amount' => $netTeacherAmount,
            'status' => 'pending',
        ]);
    }

    /**
     * Determine commission rate based on teacher's active subscription plan.
     */
    public function getCommissionRate(TeacherProfile $teacherProfile): float
    {
        $activeSubscription = TeacherSubscription::where('teacher_profile_id', $teacherProfile->id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->with('subscriptionPlan')
            ->latest('starts_at')
            ->first();

        if ($activeSubscription && $activeSubscription->subscriptionPlan) {
            return (float) $activeSubscription->subscriptionPlan->commission_rate;
        }

        // Default rate for non-subscribed (free tier) teachers
        return (float) config('commission.default_rate', 20.00);
    }

    /**
     * Get teacher earnings summary.
     */
    public function getTeacherEarnings(int $teacherId, ?Carbon $from = null, ?Carbon $to = null): array
    {
        $from = $from ?? now()->startOfMonth();
        $to = $to ?? now()->endOfMonth();

        $commissions = Commission::where('teacher_id', $teacherId)
            ->whereBetween('created_at', [$from, $to]);

        $stats = $commissions->selectRaw("
            COUNT(*) as total_sessions,
            SUM(gross_amount) as total_gross,
            SUM(commission_amount) as total_platform_fee,
            SUM(net_teacher_amount) as total_net_earnings,
            AVG(commission_rate) as avg_commission_rate
        ")->first();

        $pendingPayout = Commission::where('teacher_id', $teacherId)
            ->where('status', 'pending')
            ->sum('net_teacher_amount');

        $totalPaidOut = Commission::where('teacher_id', $teacherId)
            ->where('status', 'paid_out')
            ->sum('net_teacher_amount');

        return [
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'total_sessions' => (int) $stats->total_sessions,
            'total_gross' => (float) ($stats->total_gross ?? 0),
            'total_platform_fee' => (float) ($stats->total_platform_fee ?? 0),
            'total_net_earnings' => (float) ($stats->total_net_earnings ?? 0),
            'avg_commission_rate' => round((float) ($stats->avg_commission_rate ?? 0), 2),
            'pending_payout' => (float) $pendingPayout,
            'total_paid_out' => (float) $totalPaidOut,
        ];
    }

    /**
     * Process teacher payouts (batch settlement).
     * Called by scheduled command or admin action.
     */
    public function processPayouts(): array
    {
        $minPayout = config('commission.min_payout', 100.00);

        // Group pending commissions by teacher, only those meeting minimum threshold
        $teacherPayouts = Commission::where('status', 'pending')
            ->select('teacher_id', DB::raw('SUM(net_teacher_amount) as total_amount'))
            ->groupBy('teacher_id')
            ->having('total_amount', '>=', $minPayout)
            ->get();

        $processed = [];

        foreach ($teacherPayouts as $payout) {
            try {
                DB::transaction(function () use ($payout, &$processed) {
                    $payoutReference = 'PO-' . now()->format('Ymd') . '-' . $payout->teacher_id;

                    // Mark all pending commissions as settled
                    Commission::where('teacher_id', $payout->teacher_id)
                        ->where('status', 'pending')
                        ->update([
                            'status' => 'settled',
                            'settled_at' => now(),
                            'payout_reference' => $payoutReference,
                        ]);

                    $processed[] = [
                        'teacher_id' => $payout->teacher_id,
                        'amount' => (float) $payout->total_amount,
                        'reference' => $payoutReference,
                    ];

                    // TODO: Integrate with bank transfer API or payment gateway payout
                    // For now, mark as settled and admin handles manual payout
                });
            } catch (\Exception $e) {
                Log::error("Payout failed for teacher {$payout->teacher_id}", [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return [
            'processed_count' => count($processed),
            'total_amount' => collect($processed)->sum('amount'),
            'payouts' => $processed,
        ];
    }

    /**
     * Get platform-wide financial summary for admin dashboard.
     */
    public function getPlatformFinancials(?Carbon $from = null, ?Carbon $to = null): array
    {
        $from = $from ?? now()->startOfMonth();
        $to = $to ?? now()->endOfMonth();

        // Booking revenue
        $bookingRevenue = Commission::whereBetween('created_at', [$from, $to])
            ->selectRaw("
                SUM(gross_amount) as total_gross_revenue,
                SUM(commission_amount) as total_platform_commission,
                SUM(net_teacher_amount) as total_teacher_payouts,
                COUNT(*) as total_transactions
            ")->first();

        // Subscription revenue
        $subscriptionRevenue = Payment::where('type', 'subscription')
            ->where('status', 'completed')
            ->whereBetween('paid_at', [$from, $to])
            ->sum('amount');

        // Featured listing revenue
        $featuredRevenue = Payment::where('type', 'featured_listing')
            ->where('status', 'completed')
            ->whereBetween('paid_at', [$from, $to])
            ->sum('amount');

        // Time series for charts (daily revenue for the period)
        $dailyRevenue = Commission::whereBetween('created_at', [$from, $to])
            ->selectRaw("
                DATE(created_at) as date,
                SUM(commission_amount) as platform_revenue,
                SUM(gross_amount) as gross_volume,
                COUNT(*) as transaction_count
            ")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'booking_revenue' => [
                'gross_volume' => (float) ($bookingRevenue->total_gross_revenue ?? 0),
                'platform_commission' => (float) ($bookingRevenue->total_platform_commission ?? 0),
                'teacher_payouts' => (float) ($bookingRevenue->total_teacher_payouts ?? 0),
                'transaction_count' => (int) ($bookingRevenue->total_transactions ?? 0),
            ],
            'subscription_revenue' => (float) $subscriptionRevenue,
            'featured_listing_revenue' => (float) $featuredRevenue,
            'total_platform_revenue' => (float) (
                ($bookingRevenue->total_platform_commission ?? 0)
                + $subscriptionRevenue
                + $featuredRevenue
            ),
            'daily_breakdown' => $dailyRevenue,
        ];
    }
}
```

---

## 3. Subscription Plans

### Plan Seeder

```php
<?php
// database/seeders/SubscriptionPlanSeeder.php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'Get started with basic visibility.',
                'price' => 0,
                'currency' => 'EGP',
                'duration_days' => 36500, // effectively forever
                'features' => json_encode([
                    'max_subjects' => 2,
                    'profile_listing' => true,
                    'basic_analytics' => false,
                    'featured_listing' => false,
                    'priority_support' => false,
                    'custom_schedule' => true,
                    'badge' => null,
                ]),
                'commission_rate' => 20.00,
                'max_subjects' => 2,
                'includes_featured' => false,
                'featured_days' => 0,
                'priority_support' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'Enhanced visibility and lower commission.',
                'price' => 149.00,
                'currency' => 'EGP',
                'duration_days' => 30,
                'features' => json_encode([
                    'max_subjects' => 5,
                    'profile_listing' => true,
                    'basic_analytics' => true,
                    'featured_listing' => false,
                    'priority_support' => false,
                    'custom_schedule' => true,
                    'badge' => 'basic',
                ]),
                'commission_rate' => 15.00,
                'max_subjects' => 5,
                'includes_featured' => false,
                'featured_days' => 0,
                'priority_support' => false,
                'sort_order' => 2,
            ],
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'description' => 'Maximum visibility, lowest commission, featured listing included.',
                'price' => 349.00,
                'currency' => 'EGP',
                'duration_days' => 30,
                'features' => json_encode([
                    'max_subjects' => 15,
                    'profile_listing' => true,
                    'basic_analytics' => true,
                    'advanced_analytics' => true,
                    'featured_listing' => true,
                    'priority_support' => true,
                    'custom_schedule' => true,
                    'badge' => 'premium',
                    'top_search_results' => true,
                ]),
                'commission_rate' => 10.00,
                'max_subjects' => 15,
                'includes_featured' => true,
                'featured_days' => 7,
                'priority_support' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'For learning centers and institutions. Lowest commission rate.',
                'price' => 799.00,
                'currency' => 'EGP',
                'duration_days' => 30,
                'features' => json_encode([
                    'max_subjects' => 999,
                    'profile_listing' => true,
                    'basic_analytics' => true,
                    'advanced_analytics' => true,
                    'featured_listing' => true,
                    'priority_support' => true,
                    'custom_schedule' => true,
                    'badge' => 'enterprise',
                    'top_search_results' => true,
                    'multiple_teachers' => true,
                    'bulk_booking' => true,
                    'api_access' => true,
                ]),
                'commission_rate' => 7.00,
                'max_subjects' => 999,
                'includes_featured' => true,
                'featured_days' => 30,
                'priority_support' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::create($plan);
        }
    }
}
```

---

## 4. Subscription Service

```php
<?php
// app/Services/Subscription/SubscriptionService.php

namespace App\Services\Subscription;

use App\Enums\PaymentStatus;
use App\Models\FeaturedListing;
use App\Models\Payment;
use App\Models\SubscriptionPlan;
use App\Models\TeacherProfile;
use App\Models\TeacherSubscription;
use App\Services\Payment\PaymentService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SubscriptionService
{
    public function __construct(
        private readonly PaymentService $paymentService,
    ) {}

    /**
     * Subscribe a teacher to a plan.
     */
    public function subscribe(TeacherProfile $teacherProfile, int $planId, string $gateway = 'paymob'): array
    {
        $plan = SubscriptionPlan::where('is_active', true)->findOrFail($planId);

        // Check if already subscribed to same or higher plan
        $existingActive = TeacherSubscription::where('teacher_profile_id', $teacherProfile->id)
            ->where('status', 'active')
            ->where('ends_at', '>', now())
            ->with('subscriptionPlan')
            ->first();

        if ($existingActive) {
            throw ValidationException::withMessages([
                'plan' => "You already have an active '{$existingActive->subscriptionPlan->name}' subscription until {$existingActive->ends_at->format('M d, Y')}.",
            ]);
        }

        // Free plan — no payment needed
        if ($plan->price <= 0) {
            return $this->activateSubscription($teacherProfile, $plan, null);
        }

        // Create payment record
        $payment = Payment::create([
            'reference' => 'SUB-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6)),
            'user_id' => $teacherProfile->user_id,
            'amount' => $plan->price,
            'currency' => $plan->currency,
            'gateway' => $gateway,
            'status' => PaymentStatus::Pending,
            'type' => 'subscription',
            'metadata' => [
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'teacher_profile_id' => $teacherProfile->id,
            ],
        ]);

        // Initiate payment via gateway
        $gatewayResponse = $this->paymentService->initiatePayment(
            // We create a virtual "booking" wrapper or handle subscription payments directly
            // For simplicity, directly call gateway
            new class($payment) {
                public function __construct(public $payment) {}
                public $parent;
                public $id;
                public $reference;
                public $agreed_price;
                public $currency;

                public function __get($name) {
                    return match($name) {
                        'parent' => $this->payment->user,
                        'id' => $this->payment->id,
                        'reference' => $this->payment->reference,
                        'agreed_price' => $this->payment->amount,
                        'currency' => $this->payment->currency,
                        default => null,
                    };
                }
            },
            $gateway
        );

        return [
            'subscription_pending' => true,
            'plan' => $plan->only(['id', 'name', 'price', 'currency', 'duration_days']),
            'payment' => $gatewayResponse,
        ];
    }

    /**
     * Activate subscription after successful payment.
     */
    public function activateSubscription(
        TeacherProfile $teacherProfile,
        SubscriptionPlan $plan,
        ?Payment $payment
    ): array {
        return DB::transaction(function () use ($teacherProfile, $plan, $payment) {
            $subscription = TeacherSubscription::create([
                'teacher_profile_id' => $teacherProfile->id,
                'subscription_plan_id' => $plan->id,
                'payment_id' => $payment?->id,
                'starts_at' => now(),
                'ends_at' => now()->addDays($plan->duration_days),
                'status' => 'active',
                'auto_renew' => false,
            ]);

            // If plan includes featured listing, auto-create it
            if ($plan->includes_featured && $plan->featured_days > 0) {
                FeaturedListing::create([
                    'teacher_profile_id' => $teacherProfile->id,
                    'payment_id' => $payment?->id,
                    'plan_type' => 'premium_boost',
                    'priority_score' => match ($plan->slug) {
                        'premium' => 5,
                        'enterprise' => 10,
                        default => 1,
                    },
                    'starts_at' => now(),
                    'ends_at' => now()->addDays($plan->featured_days),
                    'is_active' => true,
                ]);

                $teacherProfile->update([
                    'is_featured' => true,
                    'featured_until' => now()->addDays($plan->featured_days),
                ]);
            }

            return [
                'subscription' => $subscription,
                'plan' => $plan,
                'starts_at' => $subscription->starts_at->toIso8601String(),
                'ends_at' => $subscription->ends_at->toIso8601String(),
                'commission_rate' => $plan->commission_rate,
            ];
        });
    }

    /**
     * Handle subscription expiration (called by scheduler).
     */
    public function expireSubscriptions(): int
    {
        $expired = TeacherSubscription::where('status', 'active')
            ->where('ends_at', '<', now())
            ->get();

        foreach ($expired as $subscription) {
            $subscription->update(['status' => 'expired']);

            // Remove featured status if no other active featured listing
            $hasActiveFeatured = FeaturedListing::where('teacher_profile_id', $subscription->teacher_profile_id)
                ->where('is_active', true)
                ->where('ends_at', '>', now())
                ->exists();

            if (!$hasActiveFeatured) {
                TeacherProfile::where('id', $subscription->teacher_profile_id)
                    ->update([
                        'is_featured' => false,
                        'featured_until' => null,
                    ]);
            }

            // TODO: Send expiry notification, offer renewal discount
        }

        return $expired->count();
    }
}
```

---

## 5. Featured Listing Logic

### Purchase Featured Listing Independently

```php
<?php
// app/Http/Controllers/Api/V1/Subscription/SubscriptionController.php (partial)

/**
 * POST /api/v1/subscriptions/featured-listing
 *
 * Purchase a featured listing boost independently of subscription.
 */
public function purchaseFeaturedListing(Request $request): JsonResponse
{
    $validated = $request->validate([
        'plan_type' => 'required|in:basic_boost,premium_boost,top_teacher',
        'duration_days' => 'required|integer|in:7,14,30',
        'gateway' => 'nullable|string|in:stripe,paymob',
    ]);

    $teacherProfile = $request->user()->teacherProfile;

    if (!$teacherProfile?->isVerified()) {
        return response()->json([
            'success' => false,
            'message' => 'Only verified teachers can purchase featured listings.',
        ], 403);
    }

    // Pricing table
    $pricing = [
        'basic_boost' => ['7' => 49, '14' => 89, '30' => 149],
        'premium_boost' => ['7' => 99, '14' => 179, '30' => 299],
        'top_teacher' => ['7' => 199, '14' => 349, '30' => 599],
    ];

    $price = $pricing[$validated['plan_type']][$validated['duration_days']] ?? null;

    if (!$price) {
        return response()->json(['success' => false, 'message' => 'Invalid plan configuration.'], 422);
    }

    $priorityScore = match ($validated['plan_type']) {
        'basic_boost' => 3,
        'premium_boost' => 7,
        'top_teacher' => 10,
    };

    // Create payment
    $payment = Payment::create([
        'reference' => 'FT-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6)),
        'user_id' => $request->user()->id,
        'amount' => $price,
        'currency' => 'EGP',
        'gateway' => $validated['gateway'] ?? 'paymob',
        'status' => PaymentStatus::Pending,
        'type' => 'featured_listing',
        'metadata' => [
            'plan_type' => $validated['plan_type'],
            'duration_days' => $validated['duration_days'],
            'priority_score' => $priorityScore,
            'teacher_profile_id' => $teacherProfile->id,
        ],
    ]);

    // After payment success (via webhook), create the featured listing:
    // FeaturedListing::create([...])

    return response()->json([
        'success' => true,
        'data' => [
            'price' => $price,
            'currency' => 'EGP',
            'plan_type' => $validated['plan_type'],
            'duration_days' => $validated['duration_days'],
            'payment_reference' => $payment->reference,
            // 'payment_url' => ... (from gateway)
        ],
    ]);
}
```

### Featured Teacher Query Integration

Featured teachers are automatically prioritized in search results through the `ORDER BY tp.is_featured DESC` clause in geolocation queries. Additionally, the `priority_score` from `featured_listings` determines ranking among featured teachers:

```sql
-- Featured teacher ordering in search
SELECT tp.*, fl.priority_score
FROM teacher_profiles tp
LEFT JOIN featured_listings fl ON fl.teacher_profile_id = tp.id
    AND fl.is_active = true
    AND fl.ends_at > NOW()
WHERE tp.verification_status = 'verified'
ORDER BY
    CASE WHEN fl.id IS NOT NULL THEN 1 ELSE 0 END DESC,  -- Featured first
    COALESCE(fl.priority_score, 0) DESC,                   -- Higher boost first
    tp.avg_rating DESC,                                     -- Then by rating
    distance_km ASC;                                        -- Then by proximity
```

---

## 6. Financial Reporting System

### Admin Financial Report Controller

```php
<?php
// app/Http/Controllers/Api/V1/Admin/FinancialReportController.php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\Commission\CommissionService;
use App\Models\Commission;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialReportController extends Controller
{
    public function __construct(
        private readonly CommissionService $commissionService,
    ) {}

    /**
     * GET /api/v1/admin/reports/revenue
     *
     * Platform-wide revenue summary with time series.
     */
    public function revenue(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'granularity' => 'nullable|in:daily,weekly,monthly',
        ]);

        $from = Carbon::parse($validated['from'] ?? now()->startOfMonth());
        $to = Carbon::parse($validated['to'] ?? now()->endOfMonth());

        $financials = $this->commissionService->getPlatformFinancials($from, $to);

        return response()->json([
            'success' => true,
            'data' => $financials,
        ]);
    }

    /**
     * GET /api/v1/admin/reports/commissions
     *
     * Detailed commission breakdown per teacher.
     */
    public function commissions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'status' => 'nullable|in:pending,settled,paid_out',
            'teacher_id' => 'nullable|integer|exists:users,id',
        ]);

        $from = Carbon::parse($validated['from'] ?? now()->startOfMonth());
        $to = Carbon::parse($validated['to'] ?? now()->endOfMonth());

        $query = Commission::with(['teacher:id,first_name,last_name', 'booking:id,reference'])
            ->whereBetween('created_at', [$from, $to]);

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['teacher_id'])) {
            $query->where('teacher_id', $validated['teacher_id']);
        }

        // Summary stats
        $summary = (clone $query)->selectRaw("
            COUNT(*) as total_records,
            SUM(gross_amount) as total_gross,
            SUM(commission_amount) as total_commission,
            SUM(net_teacher_amount) as total_net,
            AVG(commission_rate) as avg_rate
        ")->first();

        // Per-teacher breakdown
        $perTeacher = (clone $query)
            ->select('teacher_id', DB::raw("
                COUNT(*) as sessions,
                SUM(gross_amount) as gross,
                SUM(commission_amount) as platform_fee,
                SUM(net_teacher_amount) as net,
                AVG(commission_rate) as avg_rate
            "))
            ->groupBy('teacher_id')
            ->with('teacher:id,first_name,last_name')
            ->orderByDesc('gross')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'by_teacher' => $perTeacher,
            ],
        ]);
    }

    /**
     * GET /api/v1/admin/reports/payouts
     *
     * Pending and completed teacher payouts.
     */
    public function payouts(Request $request): JsonResponse
    {
        $pending = Commission::where('status', 'pending')
            ->select('teacher_id', DB::raw("
                SUM(net_teacher_amount) as pending_amount,
                COUNT(*) as pending_sessions,
                MIN(created_at) as oldest_pending
            "))
            ->groupBy('teacher_id')
            ->having('pending_amount', '>', 0)
            ->with('teacher:id,first_name,last_name,email')
            ->orderByDesc('pending_amount')
            ->get();

        $recentPayouts = Commission::where('status', 'paid_out')
            ->select('teacher_id', 'payout_reference', DB::raw("
                SUM(net_teacher_amount) as payout_amount,
                COUNT(*) as session_count,
                MAX(paid_out_at) as paid_at
            "))
            ->groupBy('teacher_id', 'payout_reference')
            ->with('teacher:id,first_name,last_name')
            ->orderByDesc('paid_at')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'pending' => $pending,
                'recent_payouts' => $recentPayouts,
                'total_pending' => $pending->sum('pending_amount'),
            ],
        ]);
    }

    /**
     * GET /api/v1/admin/reports/export
     *
     * Export financial data as CSV.
     */
    public function export(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:commissions,payments,payouts',
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
            'format' => 'nullable|in:csv,xlsx',
        ]);

        $from = Carbon::parse($validated['from']);
        $to = Carbon::parse($validated['to']);

        $data = match ($validated['type']) {
            'commissions' => Commission::whereBetween('created_at', [$from, $to])
                ->with(['teacher:id,first_name,last_name', 'booking:id,reference'])
                ->get()
                ->map(fn ($c) => [
                    'Date' => $c->created_at->format('Y-m-d'),
                    'Booking' => $c->booking?->reference,
                    'Teacher' => $c->teacher?->first_name . ' ' . $c->teacher?->last_name,
                    'Gross (EGP)' => $c->gross_amount,
                    'Commission Rate' => $c->commission_rate . '%',
                    'Platform Fee (EGP)' => $c->commission_amount,
                    'Teacher Net (EGP)' => $c->net_teacher_amount,
                    'Status' => $c->status,
                ]),
            'payments' => Payment::whereBetween('created_at', [$from, $to])
                ->where('status', 'completed')
                ->get()
                ->map(fn ($p) => [
                    'Date' => $p->paid_at?->format('Y-m-d'),
                    'Reference' => $p->reference,
                    'Type' => $p->type,
                    'Amount (EGP)' => $p->amount,
                    'Gateway' => $p->gateway,
                    'Status' => $p->status->value,
                ]),
            default => collect(),
        };

        // Generate CSV response
        $filename = "{$validated['type']}_{$from->format('Ymd')}_{$to->format('Ymd')}.csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($data) {
            $file = fopen('php://output', 'w');

            if ($data->isNotEmpty()) {
                fputcsv($file, array_keys($data->first()));
                foreach ($data as $row) {
                    fputcsv($file, array_values($row));
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
```

---

## 7. Scheduled Commands for Monetization

```php
// routes/console.php (Laravel 12)

use App\Jobs\ExpireUnconfirmedBookings;
use App\Services\Subscription\SubscriptionService;
use App\Services\Commission\CommissionService;
use Illuminate\Support\Facades\Schedule;

// Every hour: Expire unconfirmed bookings
Schedule::job(new ExpireUnconfirmedBookings)->hourly();

// Every 5 min: Refresh geo cache
Schedule::command('geo:refresh-cache')->everyFiveMinutes();

// Daily at midnight: Expire subscriptions & featured listings
Schedule::call(function () {
    $subscriptionService = app(SubscriptionService::class);
    $expired = $subscriptionService->expireSubscriptions();
    logger()->info("Expired {$expired} subscriptions.");
})->dailyAt('00:00');

// Daily: Deactivate expired featured listings
Schedule::call(function () {
    $count = \App\Models\FeaturedListing::where('is_active', true)
        ->where('ends_at', '<', now())
        ->update(['is_active' => false]);
    logger()->info("Deactivated {$count} expired featured listings.");
})->dailyAt('00:05');

// Weekly (Sunday midnight): Process teacher payouts
Schedule::call(function () {
    $commissionService = app(CommissionService::class);
    $result = $commissionService->processPayouts();
    logger()->info("Processed {$result['processed_count']} payouts, total: {$result['total_amount']} EGP");
})->weeklyOn(0, '00:00');

// Monthly: Generate financial reports
Schedule::command('reports:generate-monthly')->monthlyOn(1, '02:00');
```

---

## 8. Revenue Tracking Dashboard Data

### Admin Dashboard Stats Endpoint

```php
<?php
// app/Http/Controllers/Api/V1/Admin/DashboardController.php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Commission;
use App\Models\Payment;
use App\Models\TeacherProfile;
use App\Models\TeacherSubscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'users' => [
                    'total' => User::count(),
                    'parents' => User::where('role', 'parent')->count(),
                    'teachers' => User::where('role', 'teacher')->count(),
                    'new_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
                ],
                'teachers' => [
                    'verified' => TeacherProfile::where('verification_status', 'verified')->count(),
                    'pending_verification' => TeacherProfile::whereIn('verification_status', [
                        'documents_submitted', 'under_review'
                    ])->count(),
                    'active_subscribers' => TeacherSubscription::where('status', 'active')
                        ->where('ends_at', '>', now())->count(),
                ],
                'bookings' => [
                    'total' => Booking::count(),
                    'this_month' => Booking::where('created_at', '>=', now()->startOfMonth())->count(),
                    'pending' => Booking::where('status', 'pending')->count(),
                    'completed' => Booking::where('status', 'completed')->count(),
                ],
                'revenue' => [
                    'total_gross' => Payment::where('status', 'completed')->sum('amount'),
                    'this_month_gross' => Payment::where('status', 'completed')
                        ->where('paid_at', '>=', now()->startOfMonth())->sum('amount'),
                    'total_commission' => Commission::sum('commission_amount'),
                    'this_month_commission' => Commission::where('created_at', '>=', now()->startOfMonth())
                        ->sum('commission_amount'),
                    'pending_payouts' => Commission::where('status', 'pending')
                        ->sum('net_teacher_amount'),
                ],
            ],
        ]);
    }

    public function charts(): JsonResponse
    {
        // Last 30 days revenue
        $dailyRevenue = Payment::where('status', 'completed')
            ->where('paid_at', '>=', now()->subDays(30))
            ->selectRaw("DATE(paid_at) as date, SUM(amount) as amount, COUNT(*) as count")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Bookings by status
        $bookingsByStatus = Booking::selectRaw("status, COUNT(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status');

        // Top subjects
        $topSubjects = DB::table('bookings')
            ->join('subjects', 'subjects.id', '=', 'bookings.subject_id')
            ->selectRaw('subjects.name, COUNT(*) as booking_count')
            ->groupBy('subjects.name')
            ->orderByDesc('booking_count')
            ->limit(10)
            ->get();

        // Top governorates
        $topGovernorates = DB::table('locations')
            ->join('teacher_profiles', 'teacher_profiles.id', '=', 'locations.teacher_profile_id')
            ->where('teacher_profiles.verification_status', 'verified')
            ->where('locations.is_primary', true)
            ->selectRaw('locations.governorate, COUNT(*) as teacher_count')
            ->groupBy('locations.governorate')
            ->orderByDesc('teacher_count')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'daily_revenue' => $dailyRevenue,
                'bookings_by_status' => $bookingsByStatus,
                'top_subjects' => $topSubjects,
                'top_governorates' => $topGovernorates,
            ],
        ]);
    }
}
```
