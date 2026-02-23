# Laravel Backend — Implementation Guide

## 1. Complete API Routes

```php
<?php
// routes/api/v1/auth.php

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [LoginController::class, 'me']);
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::put('/profile', [LoginController::class, 'updateProfile']);
    Route::post('/change-password', [LoginController::class, 'changePassword']);
    Route::post('/verify-phone', [LoginController::class, 'verifyPhone']);
});
```

```php
<?php
// routes/api/v1/teachers.php

use App\Http\Controllers\Api\V1\Teacher\TeacherProfileController;
use App\Http\Controllers\Api\V1\Teacher\TeacherSearchController;
use App\Http\Controllers\Api\V1\Teacher\TeacherAvailabilityController;
use Illuminate\Support\Facades\Route;

// Public teacher routes
Route::get('/nearby', [TeacherSearchController::class, 'nearby']);
Route::get('/map-markers', [TeacherSearchController::class, 'mapMarkers']);
Route::get('/subjects', [TeacherSearchController::class, 'subjects']);
Route::get('/grade-levels', [TeacherSearchController::class, 'gradeLevels']);
Route::get('/{id}', [TeacherProfileController::class, 'show']);
Route::get('/{id}/reviews', [TeacherProfileController::class, 'reviews']);
Route::get('/{id}/availability', [TeacherAvailabilityController::class, 'show']);
Route::get('/{id}/subjects', [TeacherProfileController::class, 'subjects']);

// Authenticated teacher routes (own profile management)
Route::middleware(['auth:sanctum', 'role:teacher'])->group(function () {
    Route::get('/profile/mine', [TeacherProfileController::class, 'myProfile']);
    Route::put('/profile/mine', [TeacherProfileController::class, 'updateMyProfile']);
    Route::post('/profile/mine/subjects', [TeacherProfileController::class, 'addSubject']);
    Route::delete('/profile/mine/subjects/{subjectId}', [TeacherProfileController::class, 'removeSubject']);
    Route::post('/profile/mine/locations', [TeacherProfileController::class, 'addLocation']);
    Route::put('/profile/mine/locations/{locationId}', [TeacherProfileController::class, 'updateLocation']);
    Route::delete('/profile/mine/locations/{locationId}', [TeacherProfileController::class, 'removeLocation']);
    Route::put('/profile/mine/availability', [TeacherAvailabilityController::class, 'update']);
    Route::post('/profile/mine/verification', [TeacherProfileController::class, 'submitVerification']);
});
```

```php
<?php
// routes/api/v1/bookings.php

use App\Http\Controllers\Api\V1\Booking\BookingController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/', [BookingController::class, 'index']);
    Route::post('/', [BookingController::class, 'store']);
    Route::get('/{booking}', [BookingController::class, 'show']);
    Route::post('/{booking}/confirm', [BookingController::class, 'confirm'])
        ->middleware('role:teacher');
    Route::post('/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::post('/{booking}/complete', [BookingController::class, 'complete'])
        ->middleware('role:teacher');
    Route::post('/{booking}/dispute', [BookingController::class, 'dispute']);
    Route::get('/upcoming', [BookingController::class, 'upcoming']);
    Route::get('/history', [BookingController::class, 'history']);
});
```

```php
<?php
// routes/api/v1/payments.php

use App\Http\Controllers\Api\V1\Payment\PaymentController;
use App\Http\Controllers\Api\V1\Payment\WebhookController;
use Illuminate\Support\Facades\Route;

// Webhooks (no auth — verified by signature)
Route::post('/webhooks/stripe', [WebhookController::class, 'handleStripe']);
Route::post('/webhooks/paymob', [WebhookController::class, 'handlePaymob']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/initiate', [PaymentController::class, 'initiate']);
    Route::get('/status/{paymentId}', [PaymentController::class, 'status']);
    Route::get('/history', [PaymentController::class, 'history']);
    Route::post('/{paymentId}/refund', [PaymentController::class, 'requestRefund']);
});
```

```php
<?php
// routes/api/v1/reviews.php

use App\Http\Controllers\Api\V1\Review\ReviewController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/', [ReviewController::class, 'store'])->middleware('role:parent');
    Route::put('/{review}', [ReviewController::class, 'update'])->middleware('role:parent');
    Route::delete('/{review}', [ReviewController::class, 'destroy']);
});
```

```php
<?php
// routes/api/v1/subscriptions.php

use App\Http\Controllers\Api\V1\Subscription\SubscriptionController;
use Illuminate\Support\Facades\Route;

// Public: view available plans
Route::get('/plans', [SubscriptionController::class, 'plans']);

Route::middleware(['auth:sanctum', 'role:teacher'])->group(function () {
    Route::get('/my-subscription', [SubscriptionController::class, 'current']);
    Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
    Route::post('/cancel', [SubscriptionController::class, 'cancel']);
    Route::post('/featured-listing', [SubscriptionController::class, 'purchaseFeaturedListing']);
});
```

```php
<?php
// routes/api/v1/admin.php

use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\UserManagementController;
use App\Http\Controllers\Api\V1\Admin\VerificationController;
use App\Http\Controllers\Api\V1\Admin\FinancialReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/charts', [DashboardController::class, 'charts']);

    // User Management
    Route::get('/users', [UserManagementController::class, 'index']);
    Route::get('/users/{user}', [UserManagementController::class, 'show']);
    Route::put('/users/{user}', [UserManagementController::class, 'update']);
    Route::post('/users/{user}/toggle-active', [UserManagementController::class, 'toggleActive']);

    // Teacher Verification
    Route::get('/verifications/pending', [VerificationController::class, 'pending']);
    Route::post('/verifications/{teacherProfileId}/approve', [VerificationController::class, 'approve']);
    Route::post('/verifications/{teacherProfileId}/reject', [VerificationController::class, 'reject']);

    // Financial Reports
    Route::get('/reports/revenue', [FinancialReportController::class, 'revenue']);
    Route::get('/reports/commissions', [FinancialReportController::class, 'commissions']);
    Route::get('/reports/payouts', [FinancialReportController::class, 'payouts']);
    Route::get('/reports/export', [FinancialReportController::class, 'export']);
});
```

---

## 2. Enums

```php
<?php
// app/Enums/UserRole.php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Parent = 'parent';
    case Teacher = 'teacher';
}
```

```php
<?php
// app/Enums/BookingStatus.php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case NoShow = 'no_show';
    case Disputed = 'disputed';

    public function canTransitionTo(self $newStatus): bool
    {
        return match ($this) {
            self::Pending => in_array($newStatus, [self::Confirmed, self::Cancelled]),
            self::Confirmed => in_array($newStatus, [self::InProgress, self::Cancelled, self::NoShow]),
            self::InProgress => in_array($newStatus, [self::Completed, self::Disputed]),
            self::Completed => in_array($newStatus, [self::Disputed]),
            default => false,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending Confirmation',
            self::Confirmed => 'Confirmed',
            self::InProgress => 'In Progress',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
            self::NoShow => 'No Show',
            self::Disputed => 'Disputed',
        };
    }
}
```

```php
<?php
// app/Enums/PaymentStatus.php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';
    case Refunded = 'refunded';
    case PartiallyRefunded = 'partially_refunded';
    case Disputed = 'disputed';
}
```

```php
<?php
// app/Enums/VerificationStatus.php

namespace App\Enums;

enum VerificationStatus: string
{
    case Pending = 'pending';
    case DocumentsSubmitted = 'documents_submitted';
    case UnderReview = 'under_review';
    case Verified = 'verified';
    case Rejected = 'rejected';
}
```

---

## 3. Models (Key Examples)

```php
<?php
// app/Models/User.php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'first_name', 'last_name', 'email', 'phone',
        'password', 'role', 'avatar_url', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function teacherProfile(): HasOne
    {
        return $this->hasOne(TeacherProfile::class);
    }

    public function bookingsAsParent(): HasMany
    {
        return $this->hasMany(Booking::class, 'parent_id');
    }

    public function bookingsAsTeacher(): HasMany
    {
        return $this->hasMany(Booking::class, 'teacher_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function isTeacher(): bool
    {
        return $this->role === UserRole::Teacher;
    }

    public function isParent(): bool
    {
        return $this->role === UserRole::Parent;
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
```

```php
<?php
// app/Models/TeacherProfile.php

namespace App\Models;

use App\Enums\VerificationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeacherProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'bio', 'education', 'certifications', 'languages',
        'experience_years', 'hourly_rate', 'currency',
        'verification_status', 'rejection_reason', 'verified_at',
        'is_featured', 'featured_until',
        'accepts_online', 'accepts_in_person', 'is_available',
    ];

    protected function casts(): array
    {
        return [
            'verification_status' => VerificationStatus::class,
            'certifications' => 'array',
            'languages' => 'array',
            'hourly_rate' => 'decimal:2',
            'avg_rating' => 'decimal:2',
            'verified_at' => 'datetime',
            'featured_until' => 'datetime',
            'is_featured' => 'boolean',
            'accepts_online' => 'boolean',
            'accepts_in_person' => 'boolean',
            'is_available' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    public function primaryLocation(): HasMany
    {
        return $this->hasMany(Location::class)->where('is_primary', true);
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'teacher_subjects')
            ->withPivot('grade_level_id', 'price_override')
            ->withTimestamps();
    }

    public function teacherSubjects(): HasMany
    {
        return $this->hasMany(TeacherSubject::class);
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(TeacherAvailability::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(TeacherSubscription::class);
    }

    public function activeSubscription(): HasMany
    {
        return $this->hasMany(TeacherSubscription::class)
            ->where('status', 'active')
            ->where('ends_at', '>', now());
    }

    public function featuredListings(): HasMany
    {
        return $this->hasMany(FeaturedListing::class);
    }

    public function isVerified(): bool
    {
        return $this->verification_status === VerificationStatus::Verified;
    }

    public function isCurrentlyFeatured(): bool
    {
        return $this->is_featured && $this->featured_until?->isFuture();
    }

    /**
     * Recalculate average rating from reviews.
     */
    public function recalculateRating(): void
    {
        $stats = Review::where('teacher_id', $this->user_id)
            ->where('is_visible', true)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_reviews')
            ->first();

        $this->update([
            'avg_rating' => round($stats->avg_rating ?? 0, 2),
            'total_reviews' => $stats->total_reviews ?? 0,
        ]);
    }
}
```

```php
<?php
// app/Models/Booking.php

namespace App\Models;

use App\Enums\BookingStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference', 'parent_id', 'teacher_id', 'subject_id', 'grade_level_id',
        'scheduled_at', 'duration_minutes', 'status', 'location_type',
        'meeting_address', 'meeting_lat', 'meeting_lng', 'meeting_link',
        'agreed_price', 'currency', 'notes',
        'cancellation_reason', 'cancelled_by',
        'confirmed_at', 'completed_at', 'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => BookingStatus::class,
            'scheduled_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'agreed_price' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            $booking->reference = $booking->reference
                ?? 'BK-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
        });
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function gradeLevel(): BelongsTo
    {
        return $this->belongsTo(GradeLevel::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function commission(): HasOne
    {
        return $this->hasOne(Commission::class);
    }
}
```

---

## 4. Services Layer (Business Logic)

### BookingService

```php
<?php
// app/Services/Booking/BookingService.php

namespace App\Services\Booking;

use App\Enums\BookingStatus;
use App\Events\BookingCancelled;
use App\Events\BookingConfirmed;
use App\Events\BookingCreated;
use App\Models\Booking;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingService
{
    /**
     * Create a new booking request.
     */
    public function createBooking(User $parent, array $data): Booking
    {
        // Validate teacher exists and is available
        $teacher = User::findOrFail($data['teacher_id']);
        $teacherProfile = $teacher->teacherProfile;

        if (!$teacherProfile?->isVerified()) {
            throw ValidationException::withMessages([
                'teacher_id' => 'This teacher is not verified.',
            ]);
        }

        if (!$teacherProfile->is_available) {
            throw ValidationException::withMessages([
                'teacher_id' => 'This teacher is not currently available.',
            ]);
        }

        // Check for scheduling conflicts
        $hasConflict = Booking::where('teacher_id', $data['teacher_id'])
            ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::Pending])
            ->where('scheduled_at', $data['scheduled_at'])
            ->exists();

        if ($hasConflict) {
            throw ValidationException::withMessages([
                'scheduled_at' => 'This time slot is already booked.',
            ]);
        }

        // Determine price
        $agreedPrice = $data['agreed_price'] ?? $this->calculatePrice(
            $teacherProfile,
            $data['subject_id'],
            $data['duration_minutes'] ?? 60
        );

        $booking = DB::transaction(function () use ($parent, $teacher, $data, $agreedPrice) {
            return Booking::create([
                'parent_id' => $parent->id,
                'teacher_id' => $teacher->id,
                'subject_id' => $data['subject_id'],
                'grade_level_id' => $data['grade_level_id'] ?? null,
                'scheduled_at' => $data['scheduled_at'],
                'duration_minutes' => $data['duration_minutes'] ?? 60,
                'status' => BookingStatus::Pending,
                'location_type' => $data['location_type'] ?? 'in_person',
                'meeting_address' => $data['meeting_address'] ?? null,
                'meeting_link' => $data['meeting_link'] ?? null,
                'agreed_price' => $agreedPrice,
                'currency' => $data['currency'] ?? 'EGP',
                'notes' => $data['notes'] ?? null,
            ]);
        });

        event(new BookingCreated($booking));

        return $booking->load(['teacher', 'parent', 'subject']);
    }

    /**
     * Teacher confirms a booking.
     */
    public function confirmBooking(Booking $booking, User $teacher): Booking
    {
        if ($booking->teacher_id !== $teacher->id) {
            abort(403, 'You are not the teacher for this booking.');
        }

        if (!$booking->status->canTransitionTo(BookingStatus::Confirmed)) {
            throw ValidationException::withMessages([
                'status' => "Cannot confirm a booking with status: {$booking->status->label()}",
            ]);
        }

        $booking->update([
            'status' => BookingStatus::Confirmed,
            'confirmed_at' => now(),
        ]);

        event(new BookingConfirmed($booking));

        return $booking->fresh();
    }

    /**
     * Cancel a booking.
     */
    public function cancelBooking(Booking $booking, User $user, string $reason): Booking
    {
        if (!$booking->status->canTransitionTo(BookingStatus::Cancelled)) {
            throw ValidationException::withMessages([
                'status' => "Cannot cancel a booking with status: {$booking->status->label()}",
            ]);
        }

        $cancelledBy = match (true) {
            $user->id === $booking->parent_id => 'parent',
            $user->id === $booking->teacher_id => 'teacher',
            $user->isAdmin() => 'admin',
            default => abort(403),
        };

        $booking->update([
            'status' => BookingStatus::Cancelled,
            'cancellation_reason' => $reason,
            'cancelled_by' => $cancelledBy,
            'cancelled_at' => now(),
        ]);

        event(new BookingCancelled($booking));

        return $booking->fresh();
    }

    /**
     * Mark a booking as completed and trigger commission calculation.
     */
    public function completeBooking(Booking $booking, User $teacher): Booking
    {
        if ($booking->teacher_id !== $teacher->id) {
            abort(403);
        }

        if (!$booking->status->canTransitionTo(BookingStatus::Completed)) {
            throw ValidationException::withMessages([
                'status' => "Cannot complete a booking with status: {$booking->status->label()}",
            ]);
        }

        $booking->update([
            'status' => BookingStatus::Completed,
            'completed_at' => now(),
        ]);

        // Increment teacher's booking count
        $teacher->teacherProfile?->increment('total_bookings');

        return $booking->fresh();
    }

    /**
     * Calculate session price based on teacher rate and duration.
     */
    private function calculatePrice(TeacherProfile $profile, int $subjectId, int $durationMinutes): float
    {
        $teacherSubject = $profile->teacherSubjects()
            ->where('subject_id', $subjectId)
            ->first();

        $hourlyRate = $teacherSubject?->price_override ?? $profile->hourly_rate;

        return round($hourlyRate * ($durationMinutes / 60), 2);
    }
}
```

### PaymentService

```php
<?php
// app/Services/Payment/PaymentService.php

namespace App\Services\Payment;

use App\Enums\PaymentStatus;
use App\Events\PaymentCompleted;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\Payment\Gateways\PaymentGatewayInterface;
use App\Services\Payment\Gateways\PaymobGateway;
use App\Services\Payment\Gateways\StripeGateway;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentService
{
    /**
     * Initiate payment for a booking.
     */
    public function initiatePayment(Booking $booking, string $gateway = 'paymob'): array
    {
        $payment = Payment::create([
            'reference' => 'PAY-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6)),
            'booking_id' => $booking->id,
            'user_id' => $booking->parent_id,
            'amount' => $booking->agreed_price,
            'currency' => $booking->currency,
            'gateway' => $gateway,
            'status' => PaymentStatus::Pending,
            'type' => 'booking_payment',
        ]);

        $gatewayInstance = $this->resolveGateway($gateway);
        $paymentIntent = $gatewayInstance->createPaymentIntent([
            'amount' => $booking->agreed_price,
            'currency' => $booking->currency,
            'reference' => $payment->reference,
            'description' => "Booking {$booking->reference} - Tutoring Session",
            'customer_email' => $booking->parent->email,
            'customer_phone' => $booking->parent->phone,
            'metadata' => [
                'booking_id' => $booking->id,
                'payment_id' => $payment->id,
            ],
        ]);

        $payment->update([
            'status' => PaymentStatus::Processing,
            'gateway_order_id' => $paymentIntent['order_id'] ?? null,
            'gateway_response' => $paymentIntent,
        ]);

        return [
            'payment_id' => $payment->id,
            'payment_reference' => $payment->reference,
            'gateway' => $gateway,
            'payment_url' => $paymentIntent['payment_url'] ?? null,
            'client_secret' => $paymentIntent['client_secret'] ?? null,
            'iframe_id' => $paymentIntent['iframe_id'] ?? null,
        ];
    }

    /**
     * Handle successful payment callback/webhook.
     */
    public function handlePaymentSuccess(string $gatewayTransactionId, string $gateway, array $metadata = []): Payment
    {
        return DB::transaction(function () use ($gatewayTransactionId, $gateway, $metadata) {
            $payment = Payment::where('gateway', $gateway)
                ->where(function ($q) use ($gatewayTransactionId, $metadata) {
                    $q->where('gateway_transaction_id', $gatewayTransactionId)
                      ->orWhere('gateway_order_id', $metadata['order_id'] ?? '');
                })
                ->firstOrFail();

            $payment->update([
                'status' => PaymentStatus::Completed,
                'gateway_transaction_id' => $gatewayTransactionId,
                'paid_at' => now(),
                'gateway_response' => array_merge(
                    $payment->gateway_response ?? [],
                    ['callback' => $metadata]
                ),
            ]);

            event(new PaymentCompleted($payment));

            return $payment;
        });
    }

    /**
     * Process refund.
     */
    public function processRefund(Payment $payment, float $amount, string $reason): Payment
    {
        if ($payment->status !== PaymentStatus::Completed) {
            throw new \DomainException('Can only refund completed payments.');
        }

        $gatewayInstance = $this->resolveGateway($payment->gateway);

        $refundResult = $gatewayInstance->refund(
            $payment->gateway_transaction_id,
            $amount,
            $payment->currency
        );

        $isFullRefund = $amount >= $payment->amount;

        $payment->update([
            'status' => $isFullRefund ? PaymentStatus::Refunded : PaymentStatus::PartiallyRefunded,
            'refunded_at' => now(),
            'refund_amount' => $amount,
            'refund_reason' => $reason,
            'gateway_response' => array_merge(
                $payment->gateway_response ?? [],
                ['refund' => $refundResult]
            ),
        ]);

        return $payment;
    }

    private function resolveGateway(string $gateway): PaymentGatewayInterface
    {
        return match ($gateway) {
            'stripe' => app(StripeGateway::class),
            'paymob' => app(PaymobGateway::class),
            default => throw new \InvalidArgumentException("Unsupported gateway: {$gateway}"),
        };
    }
}
```

### Payment Gateway Interface & Paymob Implementation

```php
<?php
// app/Services/Payment/Gateways/PaymentGatewayInterface.php

namespace App\Services\Payment\Gateways;

interface PaymentGatewayInterface
{
    public function createPaymentIntent(array $data): array;
    public function verifyPayment(string $transactionId): array;
    public function refund(string $transactionId, float $amount, string $currency): array;
}
```

```php
<?php
// app/Services/Payment/Gateways/PaymobGateway.php

namespace App\Services\Payment\Gateways;

use Illuminate\Support\Facades\Http;

class PaymobGateway implements PaymentGatewayInterface
{
    private string $apiKey;
    private string $integrationId;
    private string $iframeId;
    private string $hmacSecret;
    private string $baseUrl = 'https://accept.paymob.com/api';

    public function __construct()
    {
        $this->apiKey = config('payment.paymob.api_key');
        $this->integrationId = config('payment.paymob.integration_id');
        $this->iframeId = config('payment.paymob.iframe_id');
        $this->hmacSecret = config('payment.paymob.hmac_secret');
    }

    public function createPaymentIntent(array $data): array
    {
        // Step 1: Authentication
        $authResponse = Http::post("{$this->baseUrl}/auth/tokens", [
            'api_key' => $this->apiKey,
        ]);
        $authToken = $authResponse->json('token');

        // Step 2: Create Order
        $orderResponse = Http::post("{$this->baseUrl}/ecommerce/orders", [
            'auth_token' => $authToken,
            'delivery_needed' => false,
            'amount_cents' => (int) ($data['amount'] * 100),
            'currency' => $data['currency'],
            'merchant_order_id' => $data['reference'],
            'items' => [
                [
                    'name' => $data['description'],
                    'amount_cents' => (int) ($data['amount'] * 100),
                    'quantity' => 1,
                ],
            ],
        ]);
        $orderId = $orderResponse->json('id');

        // Step 3: Payment Key
        $paymentKeyResponse = Http::post("{$this->baseUrl}/acceptance/payment_keys", [
            'auth_token' => $authToken,
            'amount_cents' => (int) ($data['amount'] * 100),
            'expiration' => 3600,
            'order_id' => $orderId,
            'billing_data' => [
                'email' => $data['customer_email'],
                'phone_number' => $data['customer_phone'] ?? 'NA',
                'first_name' => 'NA',
                'last_name' => 'NA',
                'street' => 'NA',
                'building' => 'NA',
                'floor' => 'NA',
                'apartment' => 'NA',
                'city' => 'NA',
                'state' => 'NA',
                'country' => 'EG',
                'postal_code' => 'NA',
                'shipping_method' => 'NA',
            ],
            'currency' => $data['currency'],
            'integration_id' => $this->integrationId,
        ]);

        $paymentKey = $paymentKeyResponse->json('token');

        return [
            'order_id' => (string) $orderId,
            'payment_key' => $paymentKey,
            'iframe_id' => $this->iframeId,
            'payment_url' => "https://accept.paymob.com/api/acceptance/iframes/{$this->iframeId}?payment_token={$paymentKey}",
        ];
    }

    public function verifyPayment(string $transactionId): array
    {
        $authResponse = Http::post("{$this->baseUrl}/auth/tokens", [
            'api_key' => $this->apiKey,
        ]);

        $response = Http::withToken($authResponse->json('token'))
            ->get("{$this->baseUrl}/acceptance/transactions/{$transactionId}");

        return $response->json();
    }

    public function refund(string $transactionId, float $amount, string $currency): array
    {
        $authResponse = Http::post("{$this->baseUrl}/auth/tokens", [
            'api_key' => $this->apiKey,
        ]);

        $response = Http::post("{$this->baseUrl}/acceptance/void_refund/refund", [
            'auth_token' => $authResponse->json('token'),
            'transaction_id' => $transactionId,
            'amount_cents' => (int) ($amount * 100),
        ]);

        return $response->json();
    }

    /**
     * Verify Paymob webhook HMAC signature.
     */
    public function verifyWebhookSignature(array $data, string $receivedHmac): bool
    {
        // Paymob sends specific fields for HMAC calculation
        $concatenated = $data['amount_cents']
            . $data['created_at']
            . $data['currency']
            . $data['error_occured']
            . $data['has_parent_transaction']
            . $data['id']
            . $data['integration_id']
            . $data['is_3d_secure']
            . $data['is_auth']
            . $data['is_capture']
            . $data['is_refunded']
            . $data['is_standalone_payment']
            . $data['is_voided']
            . $data['order']['id']
            . $data['owner']
            . $data['pending']
            . ($data['source_data']['pan'] ?? '')
            . ($data['source_data']['sub_type'] ?? '')
            . ($data['source_data']['type'] ?? '')
            . $data['success'];

        $calculatedHmac = hash_hmac('sha512', $concatenated, $this->hmacSecret);

        return hash_equals($calculatedHmac, $receivedHmac);
    }
}
```

---

## 5. Events, Listeners & Queued Jobs

### Events

```php
<?php
// app/Events/BookingCreated.php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Booking $booking) {}
}
```

```php
<?php
// app/Events/PaymentCompleted.php

namespace App\Events;

use App\Models\Payment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentCompleted
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Payment $payment) {}
}
```

### Event → Listener Mapping

```php
<?php
// app/Providers/EventServiceProvider.php (or bootstrap/app.php in Laravel 12)

// In Laravel 12, register in bootstrap/app.php:
// ->withEvents(discover: [__DIR__.'/../app/Listeners'])

// Alternatively, explicit mapping:
use App\Events\BookingCreated;
use App\Events\BookingConfirmed;
use App\Events\BookingCancelled;
use App\Events\PaymentCompleted;
use App\Events\TeacherVerified;
use App\Listeners\SendBookingNotification;
use App\Listeners\ProcessCommission;
use App\Listeners\SendPaymentReceipt;
use App\Listeners\NotifyTeacherVerification;

// Event => Listeners
// BookingCreated => [SendBookingNotification::class]         — notify teacher of new booking request
// BookingConfirmed => [SendBookingNotification::class]        — notify parent of confirmation
// BookingCancelled => [SendBookingNotification::class]        — notify both parties
// PaymentCompleted => [ProcessCommission::class, SendPaymentReceipt::class]
// TeacherVerified => [NotifyTeacherVerification::class]
```

### Listener: Process Commission

```php
<?php
// app/Listeners/ProcessCommission.php

namespace App\Listeners;

use App\Events\PaymentCompleted;
use App\Services\Commission\CommissionService;
use Illuminate\Contracts\Queue\ShouldQueue;

class ProcessCommission implements ShouldQueue
{
    public string $queue = 'payments';

    public function __construct(
        private readonly CommissionService $commissionService
    ) {}

    public function handle(PaymentCompleted $event): void
    {
        $payment = $event->payment;

        if ($payment->type !== 'booking_payment' || !$payment->booking_id) {
            return;
        }

        $this->commissionService->calculateAndStore($payment);
    }
}
```

### Listener: Send Booking Notification

```php
<?php
// app/Listeners/SendBookingNotification.php

namespace App\Listeners;

use App\Events\BookingCancelled;
use App\Events\BookingConfirmed;
use App\Events\BookingCreated;
use App\Notifications\BookingRequestNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendBookingNotification implements ShouldQueue
{
    public string $queue = 'notifications';

    public function handle(BookingCreated|BookingConfirmed|BookingCancelled $event): void
    {
        $booking = $event->booking->load(['parent', 'teacher', 'subject']);

        match (true) {
            $event instanceof BookingCreated => $booking->teacher->notify(
                new BookingRequestNotification($booking, 'new_request')
            ),
            $event instanceof BookingConfirmed => $booking->parent->notify(
                new BookingRequestNotification($booking, 'confirmed')
            ),
            $event instanceof BookingCancelled => $this->notifyBothParties($booking),
        };
    }

    private function notifyBothParties($booking): void
    {
        $booking->parent->notify(new BookingRequestNotification($booking, 'cancelled'));
        $booking->teacher->notify(new BookingRequestNotification($booking, 'cancelled'));
    }
}
```

### Notification Class

```php
<?php
// app/Notifications/BookingRequestNotification.php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingRequestNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Booking $booking,
        private readonly string $type
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['mail', 'database'];

        // Add SMS for confirmed bookings if phone is verified
        if ($this->type === 'confirmed' && $notifiable->phone_verified_at) {
            $channels[] = 'vonage'; // or custom SMS channel
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return match ($this->type) {
            'new_request' => (new MailMessage)
                ->subject('New Booking Request')
                ->greeting("Hello {$notifiable->first_name}!")
                ->line("You have a new booking request for {$this->booking->subject->name}.")
                ->line("Date: {$this->booking->scheduled_at->format('M d, Y h:i A')}")
                ->line("Duration: {$this->booking->duration_minutes} minutes")
                ->line("Price: {$this->booking->agreed_price} {$this->booking->currency}")
                ->action('View Booking', url("/dashboard/teacher/bookings/{$this->booking->id}"))
                ->line('Please confirm or decline within 24 hours.'),

            'confirmed' => (new MailMessage)
                ->subject('Booking Confirmed!')
                ->greeting("Hello {$notifiable->first_name}!")
                ->line("Your booking has been confirmed.")
                ->line("Subject: {$this->booking->subject->name}")
                ->line("Date: {$this->booking->scheduled_at->format('M d, Y h:i A')}")
                ->action('View Details', url("/bookings/{$this->booking->id}")),

            'cancelled' => (new MailMessage)
                ->subject('Booking Cancelled')
                ->greeting("Hello {$notifiable->first_name}!")
                ->line("Booking {$this->booking->reference} has been cancelled.")
                ->line("Reason: {$this->booking->cancellation_reason}"),
        };
    }

    public function toArray(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'booking_reference' => $this->booking->reference,
            'type' => $this->type,
            'subject' => $this->booking->subject->name ?? '',
            'scheduled_at' => $this->booking->scheduled_at->toIso8601String(),
            'message' => $this->getMessage(),
        ];
    }

    private function getMessage(): string
    {
        return match ($this->type) {
            'new_request' => "New booking request for {$this->booking->subject->name}",
            'confirmed' => "Your booking {$this->booking->reference} has been confirmed",
            'cancelled' => "Booking {$this->booking->reference} has been cancelled",
        };
    }
}
```

### Queued Job: Expire Unconfirmed Bookings

```php
<?php
// app/Jobs/ExpireUnconfirmedBookings.php

namespace App\Jobs;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExpireUnconfirmedBookings implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $expiredCount = Booking::where('status', BookingStatus::Pending)
            ->where('created_at', '<', now()->subHours(24))
            ->update([
                'status' => BookingStatus::Cancelled,
                'cancelled_by' => 'system',
                'cancellation_reason' => 'Booking expired - teacher did not respond within 24 hours.',
                'cancelled_at' => now(),
            ]);

        Log::info("Expired {$expiredCount} unconfirmed bookings.");
    }
}
```

```php
// Schedule in routes/console.php (Laravel 12)
use App\Jobs\ExpireUnconfirmedBookings;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new ExpireUnconfirmedBookings)->hourly();
Schedule::command('geo:refresh-cache')->everyFiveMinutes();
```

---

## 6. Repository Pattern

```php
<?php
// app/Repositories/Contracts/TeacherRepositoryInterface.php

namespace App\Repositories\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;

interface TeacherRepositoryInterface
{
    public function findById(int $id): ?object;
    public function search(array $filters, int $perPage = 20): LengthAwarePaginator;
    public function getPopular(int $limit = 10): \Illuminate\Support\Collection;
    public function updateRating(int $teacherProfileId): void;
}
```

```php
<?php
// app/Repositories/TeacherRepository.php

namespace App\Repositories;

use App\Models\TeacherProfile;
use App\Repositories\Contracts\TeacherRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class TeacherRepository implements TeacherRepositoryInterface
{
    public function findById(int $id): ?object
    {
        return TeacherProfile::with([
            'user:id,first_name,last_name,email,avatar_url',
            'locations' => fn ($q) => $q->where('is_active', true),
            'subjects',
            'availabilities',
        ])->find($id);
    }

    public function search(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = TeacherProfile::query()
            ->with(['user:id,first_name,last_name,avatar_url', 'locations'])
            ->where('verification_status', 'verified')
            ->where('is_available', true)
            ->whereHas('user', fn ($q) => $q->where('is_active', true));

        if (!empty($filters['subject_id'])) {
            $query->whereHas('teacherSubjects', fn ($q) =>
                $q->where('subject_id', $filters['subject_id'])
            );
        }

        if (!empty($filters['min_rating'])) {
            $query->where('avg_rating', '>=', $filters['min_rating']);
        }

        if (!empty($filters['max_price'])) {
            $query->where('hourly_rate', '<=', $filters['max_price']);
        }

        if (!empty($filters['governorate'])) {
            $query->whereHas('locations', fn ($q) =>
                $q->where('governorate', $filters['governorate'])->where('is_primary', true)
            );
        }

        $sortBy = $filters['sort_by'] ?? 'avg_rating';
        $sortDir = $filters['sort_dir'] ?? 'desc';

        return $query->orderByDesc('is_featured')
                     ->orderBy($sortBy, $sortDir)
                     ->paginate($perPage);
    }

    public function getPopular(int $limit = 10): Collection
    {
        return TeacherProfile::with('user:id,first_name,last_name,avatar_url')
            ->where('verification_status', 'verified')
            ->where('is_available', true)
            ->orderByDesc('is_featured')
            ->orderByDesc('avg_rating')
            ->orderByDesc('total_bookings')
            ->limit($limit)
            ->get();
    }

    public function updateRating(int $teacherProfileId): void
    {
        TeacherProfile::findOrFail($teacherProfileId)->recalculateRating();
    }
}
```

### Service Provider Binding

```php
<?php
// app/Providers/RepositoryServiceProvider.php

namespace App\Providers;

use App\Repositories\Contracts\TeacherRepositoryInterface;
use App\Repositories\TeacherRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public array $bindings = [
        TeacherRepositoryInterface::class => TeacherRepository::class,
    ];
}
```

---

## 7. Middleware

### Role Middleware

```php
<?php
// app/Http/Middleware/EnsureUserHasRole.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role->value, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Required role: ' . implode(' or ', $roles),
            ], 403);
        }

        return $next($request);
    }
}
```

### Verified Teacher Middleware

```php
<?php
// app/Http/Middleware/EnsureTeacherVerified.php

namespace App\Http\Middleware;

use App\Enums\VerificationStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeacherVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->isTeacher() &&
            $user->teacherProfile?->verification_status !== VerificationStatus::Verified
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Your teacher profile must be verified to perform this action.',
                'verification_status' => $user->teacherProfile?->verification_status?->value,
            ], 403);
        }

        return $next($request);
    }
}
```

Register in `bootstrap/app.php`:

```php
// bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        'teacher.verified' => \App\Http\Middleware\EnsureTeacherVerified::class,
    ]);

    $middleware->api([
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        'throttle:api',
    ]);
})
```

---

## 8. API Resources (Transformers)

```php
<?php
// app/Http/Resources/TeacherResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'first_name' => $this->user->first_name,
            'last_name' => $this->user->last_name,
            'full_name' => $this->user->full_name,
            'avatar_url' => $this->user->avatar_url,
            'bio' => $this->bio,
            'education' => $this->education,
            'experience_years' => $this->experience_years,
            'hourly_rate' => (float) $this->hourly_rate,
            'currency' => $this->currency,
            'avg_rating' => (float) $this->avg_rating,
            'total_reviews' => $this->total_reviews,
            'total_bookings' => $this->total_bookings,
            'is_featured' => $this->is_featured,
            'accepts_online' => $this->accepts_online,
            'accepts_in_person' => $this->accepts_in_person,
            'verification_status' => $this->verification_status->value,
            'languages' => $this->languages ?? [],
            'certifications' => $this->when(
                $request->routeIs('teachers.show'),
                $this->certifications
            ),
            'location' => $this->whenLoaded('locations', function () {
                $primary = $this->locations->firstWhere('is_primary', true);
                return $primary ? [
                    'city' => $primary->city,
                    'governorate' => $primary->governorate,
                    'latitude' => $primary->latitude,
                    'longitude' => $primary->longitude,
                ] : null;
            }),
            'subjects' => $this->whenLoaded('subjects', fn () =>
                $this->subjects->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'grade_level_id' => $s->pivot->grade_level_id,
                    'price' => $s->pivot->price_override ?? $this->hourly_rate,
                ])
            ),
            'distance_km' => $this->when(isset($this->distance_km), $this->distance_km),
        ];
    }
}
```

```php
<?php
// app/Http/Resources/BookingResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'subject' => [
                'id' => $this->subject->id,
                'name' => $this->subject->name,
            ],
            'teacher' => [
                'id' => $this->teacher->id,
                'name' => $this->teacher->full_name,
                'avatar_url' => $this->teacher->avatar_url,
            ],
            'parent' => $this->when($request->user()?->isAdmin() || $request->user()?->isTeacher(), [
                'id' => $this->parent->id,
                'name' => $this->parent->full_name,
            ]),
            'scheduled_at' => $this->scheduled_at->toIso8601String(),
            'duration_minutes' => $this->duration_minutes,
            'location_type' => $this->location_type,
            'meeting_address' => $this->when(
                $this->location_type === 'in_person',
                $this->meeting_address
            ),
            'meeting_link' => $this->when(
                $this->location_type === 'online' && $this->status->value === 'confirmed',
                $this->meeting_link
            ),
            'agreed_price' => (float) $this->agreed_price,
            'currency' => $this->currency,
            'notes' => $this->notes,
            'payment_status' => $this->whenLoaded('payment', fn () => $this->payment?->status?->value),
            'has_review' => $this->whenLoaded('review', fn () => (bool) $this->review),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
```

---

## 9. Payment Configuration

```php
<?php
// config/payment.php

return [
    'default_gateway' => env('PAYMENT_DEFAULT_GATEWAY', 'paymob'),

    'stripe' => [
        'public_key' => env('STRIPE_PUBLIC_KEY'),
        'secret_key' => env('STRIPE_SECRET_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    'paymob' => [
        'api_key' => env('PAYMOB_API_KEY'),
        'integration_id' => env('PAYMOB_INTEGRATION_ID'),
        'iframe_id' => env('PAYMOB_IFRAME_ID'),
        'hmac_secret' => env('PAYMOB_HMAC_SECRET'),
    ],
];
```

```php
<?php
// config/commission.php

return [
    // Default platform commission rate (percentage)
    'default_rate' => env('COMMISSION_DEFAULT_RATE', 15.00),

    // Commission rates by subscription plan
    // Lower commission for premium subscribers
    'plan_rates' => [
        'free' => 20.00,      // 20% for free-tier teachers
        'basic' => 15.00,     // 15% for basic plan
        'premium' => 10.00,   // 10% for premium
        'enterprise' => 7.00, // 7% for enterprise/centers
    ],

    // Minimum payout amount (EGP)
    'min_payout' => env('COMMISSION_MIN_PAYOUT', 100.00),

    // Payout schedule
    'payout_schedule' => env('COMMISSION_PAYOUT_SCHEDULE', 'weekly'), // daily, weekly, monthly
];
```
