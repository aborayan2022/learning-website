# Security Architecture & DevOps Strategy

## 1. Role-Based Access Control (RBAC)

### Permission Matrix

| Resource | Admin | Teacher | Parent | Guest |
|---|---|---|---|---|
| View teacher listings | ✅ | ✅ | ✅ | ✅ |
| View teacher profile | ✅ | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ | ❌ |
| Create booking | ❌ | ❌ | ✅ | ❌ |
| Confirm/reject booking | ❌ | ✅ (own) | ❌ | ❌ |
| Cancel booking | ✅ | ✅ (own) | ✅ (own) | ❌ |
| Leave review | ❌ | ❌ | ✅ (own bookings) | ❌ |
| Manage teacher profile | ❌ | ✅ (own) | ❌ | ❌ |
| Submit verification | ❌ | ✅ (own) | ❌ | ❌ |
| Approve verification | ✅ | ❌ | ❌ | ❌ |
| View all users | ✅ | ❌ | ❌ | ❌ |
| View financial reports | ✅ | ✅ (own) | ❌ | ❌ |
| Manage subscriptions | ✅ | ✅ (own) | ❌ | ❌ |
| Deactivate users | ✅ | ❌ | ❌ | ❌ |

### Policy Implementation

```php
<?php
// app/Policies/BookingPolicy.php

namespace App\Policies;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // Users see their own bookings (scoped in controller)
    }

    public function view(User $user, Booking $booking): bool
    {
        return $user->isAdmin()
            || $user->id === $booking->parent_id
            || $user->id === $booking->teacher_id;
    }

    public function create(User $user): bool
    {
        return $user->isParent();
    }

    public function confirm(User $user, Booking $booking): bool
    {
        return $user->id === $booking->teacher_id
            && $booking->status === BookingStatus::Pending;
    }

    public function cancel(User $user, Booking $booking): bool
    {
        if ($user->isAdmin()) return true;

        $isParticipant = $user->id === $booking->parent_id || $user->id === $booking->teacher_id;
        $isCancellable = $booking->status->canTransitionTo(BookingStatus::Cancelled);

        return $isParticipant && $isCancellable;
    }

    public function complete(User $user, Booking $booking): bool
    {
        return $user->id === $booking->teacher_id
            && $booking->status === BookingStatus::Confirmed;
    }
}
```

```php
<?php
// app/Policies/ReviewPolicy.php

namespace App\Policies;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function create(User $user, Booking $booking): bool
    {
        return $user->isParent()
            && $user->id === $booking->parent_id
            && $booking->status === BookingStatus::Completed
            && !$booking->review()->exists();
    }

    public function update(User $user, Review $review): bool
    {
        return $user->id === $review->reviewer_id
            && $review->created_at->diffInDays(now()) <= 7; // Editable for 7 days
    }

    public function delete(User $user, Review $review): bool
    {
        return $user->isAdmin() || $user->id === $review->reviewer_id;
    }
}
```

---

## 2. Teacher Verification Workflow

```
┌──────────┐    ┌────────────────┐    ┌──────────────┐    ┌──────────┐
│  Teacher  │    │   Documents    │    │  Admin Queue  │    │ Verified │
│ Registers │───▶│   Submitted    │───▶│  Under Review │───▶│   ✅     │
│           │    │                │    │               │    │          │
│ status:   │    │ status:        │    │ status:       │    │ status:  │
│ pending   │    │ docs_submitted │    │ under_review  │    │ verified │
└──────────┘    └────────────────┘    └───────┬───────┘    └──────────┘
                                              │
                                              ▼ (if rejected)
                                     ┌──────────────┐
                                     │   Rejected   │
                                     │ with reason  │
                                     │              │
                                     │ Can resubmit │
                                     └──────────────┘
```

### Verification Controller

```php
<?php
// app/Http/Controllers/Api/V1/Admin/VerificationController.php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Enums\VerificationStatus;
use App\Events\TeacherVerified;
use App\Models\TeacherProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function pending(): JsonResponse
    {
        $pending = TeacherProfile::with('user:id,first_name,last_name,email,phone')
            ->whereIn('verification_status', [
                VerificationStatus::DocumentsSubmitted,
                VerificationStatus::UnderReview,
            ])
            ->orderBy('updated_at')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $pending]);
    }

    public function approve(int $teacherProfileId): JsonResponse
    {
        $profile = TeacherProfile::findOrFail($teacherProfileId);

        $profile->update([
            'verification_status' => VerificationStatus::Verified,
            'verified_at' => now(),
            'rejection_reason' => null,
        ]);

        event(new TeacherVerified($profile));

        return response()->json([
            'success' => true,
            'message' => 'Teacher profile verified successfully.',
        ]);
    }

    public function reject(Request $request, int $teacherProfileId): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $profile = TeacherProfile::findOrFail($teacherProfileId);

        $profile->update([
            'verification_status' => VerificationStatus::Rejected,
            'rejection_reason' => $validated['reason'],
        ]);

        // Notify teacher of rejection
        $profile->user->notify(new \App\Notifications\VerificationStatusNotification(
            $profile, 'rejected'
        ));

        return response()->json([
            'success' => true,
            'message' => 'Teacher profile rejected.',
        ]);
    }
}
```

---

## 3. Secure Payment Handling

### Webhook Verification

```php
<?php
// app/Http/Controllers/Api/V1/Payment/WebhookController.php

namespace App\Http\Controllers\Api\V1\Payment;

use App\Http\Controllers\Controller;
use App\Services\Payment\Gateways\PaymobGateway;
use App\Services\Payment\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService,
    ) {}

    /**
     * Handle Paymob webhook callback.
     * This endpoint has NO auth middleware — verified by HMAC.
     */
    public function handlePaymob(Request $request, PaymobGateway $gateway): JsonResponse
    {
        $data = $request->all();

        // Verify HMAC signature
        $receivedHmac = $request->query('hmac', '');

        if (!$gateway->verifyWebhookSignature($data['obj'] ?? [], $receivedHmac)) {
            Log::warning('Paymob webhook: Invalid HMAC signature', [
                'ip' => $request->ip(),
            ]);
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        $transactionData = $data['obj'] ?? [];
        $isSuccess = ($transactionData['success'] ?? false) === true;

        if ($isSuccess) {
            try {
                $this->paymentService->handlePaymentSuccess(
                    (string) $transactionData['id'],
                    'paymob',
                    [
                        'order_id' => (string) ($transactionData['order']['id'] ?? ''),
                        'amount_cents' => $transactionData['amount_cents'] ?? 0,
                        'currency' => $transactionData['currency'] ?? 'EGP',
                    ]
                );
            } catch (\Exception $e) {
                Log::error('Paymob webhook processing failed', [
                    'error' => $e->getMessage(),
                    'transaction_id' => $transactionData['id'] ?? null,
                ]);
                return response()->json(['error' => 'Processing failed'], 500);
            }
        } else {
            Log::info('Paymob webhook: Payment not successful', [
                'transaction_id' => $transactionData['id'] ?? null,
            ]);
        }

        return response()->json(['status' => 'received']);
    }

    /**
     * Handle Stripe webhook.
     */
    public function handleStripe(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('payment.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\Exception $e) {
            Log::warning('Stripe webhook: Invalid signature', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        match ($event->type) {
            'payment_intent.succeeded' => $this->paymentService->handlePaymentSuccess(
                $event->data->object->id,
                'stripe',
                (array) $event->data->object->metadata
            ),
            'charge.refunded' => Log::info('Stripe refund webhook received', ['event' => $event->id]),
            default => Log::info("Unhandled Stripe event: {$event->type}"),
        };

        return response()->json(['status' => 'received']);
    }
}
```

---

## 4. Rate Limiting

```php
// bootstrap/app.php

->withMiddleware(function (Middleware $middleware) {
    // ...

    // Custom rate limiters
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });

    RateLimiter::for('auth', function (Request $request) {
        return Limit::perMinute(5)->by($request->ip());
    });

    RateLimiter::for('search', function (Request $request) {
        return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
    });

    RateLimiter::for('payments', function (Request $request) {
        return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
    });

    RateLimiter::for('bookings', function (Request $request) {
        return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
    });
})
```

Apply in routes:

```php
// routes/api/v1/auth.php
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:auth');
Route::post('/register', [RegisterController::class, 'register'])->middleware('throttle:auth');

// routes/api/v1/teachers.php
Route::get('/nearby', [TeacherSearchController::class, 'nearby'])->middleware('throttle:search');
```

---

## 5. Input Validation & Sanitization

```php
<?php
// app/Http/Requests/Teacher/SearchTeachersRequest.php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class SearchTeachersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    public function rules(): array
    {
        return [
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'radius' => ['nullable', 'integer', 'min:1000', 'max:50000'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'grade_level_id' => ['nullable', 'integer', 'exists:grade_levels,id'],
            'min_rating' => ['nullable', 'numeric', 'between:1,5'],
            'max_price' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'min_experience' => ['nullable', 'integer', 'min:0', 'max:50'],
            'accepts_online' => ['nullable', 'boolean'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'lat.required' => 'Latitude is required for location-based search.',
            'lng.required' => 'Longitude is required for location-based search.',
            'lat.between' => 'Invalid latitude value.',
            'lng.between' => 'Invalid longitude value.',
        ];
    }
}
```

```php
<?php
// app/Http/Requests/Booking/CreateBookingRequest.php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isParent();
    }

    public function rules(): array
    {
        return [
            'teacher_id' => ['required', 'integer', 'exists:users,id'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'grade_level_id' => ['nullable', 'integer', 'exists:grade_levels,id'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['required', 'integer', Rule::in([30, 45, 60, 90, 120])],
            'location_type' => ['required', Rule::in(['online', 'in_person', 'teacher_location'])],
            'meeting_address' => ['required_if:location_type,in_person', 'nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Sanitize text inputs
        if ($this->has('notes')) {
            $this->merge([
                'notes' => strip_tags($this->notes),
            ]);
        }
        if ($this->has('meeting_address')) {
            $this->merge([
                'meeting_address' => strip_tags($this->meeting_address),
            ]);
        }
    }
}
```

### CORS Configuration

```php
<?php
// config/cors.php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:4200')),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### Security Headers Middleware

```php
<?php
// app/Http/Middleware/SecurityHeaders.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->remove('X-Powered-By');

        return $response;
    }
}
```

---

## 6. DevOps & Deployment Strategy

### Environment Separation

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging      │    │   Production    │
│                 │    │                  │    │                 │
│ Local Docker    │    │ DigitalOcean     │    │ AWS / Hetzner   │
│ SQLite/Postgres │    │ 1 server         │    │ Load Balanced   │
│ Mailpit         │    │ Staging DB       │    │ RDS PostgreSQL  │
│ Minio (S3)      │    │ Same stack       │    │ ElastiCache     │
│ Redis           │    │ Seed data        │    │ S3              │
│                 │    │                  │    │ CloudFront CDN  │
│ .env.local      │    │ .env.staging     │    │ .env.production │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Docker Setup

```yaml
# docker-compose.yml

services:
  # Laravel API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/var/www/html
    environment:
      - APP_ENV=local
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    networks:
      - edumarket

  # Angular Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "4200:4200"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - edumarket

  # PostgreSQL + PostGIS
  postgres:
    image: postgis/postgis:16-3.4
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: edumarket
      POSTGRES_USER: edumarket
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - edumarket

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - edumarket

  # Queue Worker (Laravel Horizon)
  queue:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: php artisan horizon
    volumes:
      - ./backend:/var/www/html
    depends_on:
      - postgres
      - redis
    networks:
      - edumarket

  # Scheduler
  scheduler:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: >
      sh -c "while true; do php artisan schedule:run --no-interaction; sleep 60; done"
    volumes:
      - ./backend:/var/www/html
    depends_on:
      - postgres
      - redis
    networks:
      - edumarket

  # Minio (S3-compatible storage)
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    networks:
      - edumarket

  # Mailpit (dev email)
  mailpit:
    image: axllent/mailpit
    ports:
      - "1025:1025"
      - "8025:8025"
    networks:
      - edumarket

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./docker/nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
      - frontend
    networks:
      - edumarket

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  edumarket:
    driver: bridge
```

### Laravel Dockerfile

```dockerfile
# backend/Dockerfile

FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    supervisor

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        gd \
        zip \
        mbstring \
        intl \
        bcmath \
        opcache \
        pcntl

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

### Angular Dockerfile

```dockerfile
# frontend/Dockerfile

# Build stage
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx SPA Config

```nginx
# frontend/docker/nginx-spa.conf

server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;
}
```

---

## 7. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Backend Tests
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:16-3.4
        env:
          POSTGRES_DB: edumarket_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: [5432:5432]
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
      redis:
        image: redis:7-alpine
        ports: [6379:6379]
    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.3
          extensions: pdo_pgsql, redis, gd, zip, bcmath
          coverage: xdebug

      - name: Install dependencies
        working-directory: backend
        run: composer install --no-interaction --prefer-dist

      - name: Run tests
        working-directory: backend
        env:
          DB_CONNECTION: pgsql
          DB_HOST: 127.0.0.1
          DB_DATABASE: edumarket_test
          DB_USERNAME: test
          DB_PASSWORD: test
          REDIS_HOST: 127.0.0.1
        run: |
          php artisan migrate --force
          php artisan test --coverage --min=80

      - name: Run static analysis
        working-directory: backend
        run: vendor/bin/phpstan analyse --level=6

  # Frontend Tests
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Lint
        working-directory: frontend
        run: npm run lint

      - name: Test
        working-directory: frontend
        run: npm run test -- --watch=false --browsers=ChromeHeadless --code-coverage

      - name: Build
        working-directory: frontend
        run: npm run build -- --configuration=production

  # Deploy to Staging
  deploy-staging:
    needs: [backend-tests, frontend-tests]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: |
          echo "Deploy to staging server via SSH/rsync"
          # ssh deploy@staging.yourdomain.com "cd /var/www/staging && git pull && ./deploy.sh"

  # Deploy to Production
  deploy-production:
    needs: [backend-tests, frontend-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: |
          echo "Deploy to production via zero-downtime deployment"
          # Use Laravel Envoy, Deployer, or custom script
```

### Zero-Downtime Deploy Script

```bash
#!/bin/bash
# deploy.sh — Production deployment script

set -e

APP_DIR="/var/www/edumarket"
RELEASE_DIR="$APP_DIR/releases/$(date +%Y%m%d%H%M%S)"
SHARED_DIR="$APP_DIR/shared"
CURRENT_LINK="$APP_DIR/current"

echo "🚀 Deploying new release..."

# Clone/copy new release
mkdir -p "$RELEASE_DIR"
git clone --depth 1 --branch main git@github.com:yourorg/edumarket.git "$RELEASE_DIR"

# Backend setup
cd "$RELEASE_DIR/backend"
composer install --no-dev --optimize-autoloader --no-interaction
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Link shared resources
ln -nfs "$SHARED_DIR/.env" "$RELEASE_DIR/backend/.env"
ln -nfs "$SHARED_DIR/storage" "$RELEASE_DIR/backend/storage"

# Run migrations
php artisan migrate --force

# Frontend build
cd "$RELEASE_DIR/frontend"
npm ci --production
npm run build -- --configuration=production

# Swap symlink (atomic operation)
ln -nfs "$RELEASE_DIR" "$CURRENT_LINK"

# Restart services
sudo systemctl reload php8.3-fpm
sudo systemctl reload nginx
php "$CURRENT_LINK/backend/artisan" horizon:terminate
php "$CURRENT_LINK/backend/artisan" queue:restart

# Cleanup old releases (keep last 5)
cd "$APP_DIR/releases"
ls -dt */ | tail -n +6 | xargs rm -rf

echo "✅ Deployment complete!"
```

---

## 8. Production Hosting Recommendation

### Budget-Conscious (Egypt-focused)

| Component | Provider | Spec | Est. Cost/mo |
|---|---|---|---|
| App Server | Hetzner Cloud | CPX31 (4 vCPU, 8GB) | $15 |
| Database | Hetzner Cloud (self-managed) | CPX21 (3 vCPU, 4GB) | $10 |
| Redis | Same server (small scale) | - | $0 |
| File Storage | Cloudflare R2 | 10GB | $0.015/GB |
| CDN | Cloudflare (free tier) | - | $0 |
| Domain + SSL | Cloudflare | - | $10/yr |
| **Total** | | | **~$25-35/mo** |

### Scale-Ready (AWS)

| Component | Service | Spec | Est. Cost/mo |
|---|---|---|---|
| App Server | EC2 / ECS Fargate | 2x t3.medium | $70 |
| Database | RDS PostgreSQL | db.t3.medium | $70 |
| Cache | ElastiCache Redis | cache.t3.micro | $15 |
| Storage | S3 | - | $5 |
| CDN | CloudFront | - | $10 |
| Load Balancer | ALB | - | $20 |
| Queue | SQS or Redis | - | $5 |
| **Total** | | | **~$200/mo** |

---

## 9. Scalability Plan

### Phase 1: Launch (0-1000 users)
- Single server (monolith)
- PostgreSQL on same server
- Redis on same server
- Cloudflare CDN

### Phase 2: Growth (1K-10K users)
- Separate database server
- Separate Redis server
- Queue workers on dedicated servers
- Add read replicas for PostgreSQL
- Implement Redis geo caching

### Phase 3: Scale (10K-100K users)
- Load balancer + 2-3 app servers
- PostgreSQL primary + read replicas
- Redis cluster
- Move to managed services (RDS, ElastiCache)
- CDN for static assets
- Consider extracting payment microservice

### Phase 4: Enterprise (100K+ users)
- Kubernetes orchestration
- Database sharding by region
- Elasticsearch for search
- Event-driven architecture (Kafka/RabbitMQ)
- Microservices extraction
- Multi-region deployment
