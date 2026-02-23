# Educational Marketplace Platform — System Architecture

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Angular SPA  │  │ Mobile App   │  │ Admin Dashboard (Angular)│  │
│  │ (Student/    │  │ (Future -    │  │                          │  │
│  │  Parent)     │  │  Capacitor)  │  │                          │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
└─────────┼─────────────────┼───────────────────────┼────────────────┘
          │                 │                       │
          ▼                 ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / LOAD BALANCER                       │
│              (Nginx / AWS ALB / Cloudflare)                         │
│         Rate Limiting · SSL Termination · CORS                      │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LARAVEL 12 API BACKEND                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ Auth Module │ │ Geo Module  │ │ Booking     │ │ Payment     │  │
│  │ (Sanctum)   │ │ (Spatial)   │ │ Module      │ │ Module      │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ Teacher     │ │ Review      │ │ Subscription│ │ Notification│  │
│  │ Module      │ │ Module      │ │ Module      │ │ Module      │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
└────────┬───────────────┬────────────────┬───────────────┬───────────┘
         │               │                │               │
         ▼               ▼                ▼               ▼
┌────────────────┐ ┌──────────┐  ┌────────────────┐ ┌────────────────┐
│  PostgreSQL    │ │  Redis   │  │  Queue Worker  │ │  File Storage  │
│  (PostGIS)     │ │  Cache   │  │  (Horizon)     │ │  (S3 / Minio)  │
│                │ │  Session │  │  Jobs / Events │ │  Avatars/Docs  │
└────────────────┘ └──────────┘  └────────────────┘ └────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ Mapbox / │ │ Stripe / │ │ Twilio / │ │ Mailgun /│             │
│  │ Google   │ │ Paymob   │ │ Vonage   │ │ SES      │             │
│  │ Maps API │ │          │ │ (SMS)    │ │ (Email)  │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
└────────────────────────────────────────────────────────────────────┘
```

## 2. Architecture Decision: Modular Monolith

**Decision: Modular Monolith (not Microservices)**

Rationale:
- Team size: likely small (1-5 devs initially)
- Deployment simplicity: single deployable artifact
- Shared database with domain boundaries via modules
- Easy extraction to microservices later if needed
- Lower operational cost than k8s-based microservices

The Laravel app is organized into domain modules under `app/Modules/`, each with its own Controllers, Services, Repositories, Models, Events, and Requests. Cross-module communication happens through Laravel Events (loosely coupled).

## 3. API Versioning Strategy

```
/api/v1/auth/login
/api/v1/teachers/nearby
/api/v1/bookings
/api/v2/teachers/nearby   ← future version
```

**Implementation:**

```php
// routes/api.php
Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(base_path('routes/api/v1/auth.php'));
    Route::prefix('teachers')->group(base_path('routes/api/v1/teachers.php'));
    Route::prefix('bookings')->group(base_path('routes/api/v1/bookings.php'));
    Route::prefix('payments')->group(base_path('routes/api/v1/payments.php'));
    Route::prefix('reviews')->group(base_path('routes/api/v1/reviews.php'));
    Route::prefix('admin')->group(base_path('routes/api/v1/admin.php'));
    Route::prefix('subscriptions')->group(base_path('routes/api/v1/subscriptions.php'));
});
```

Headers for version negotiation (future):
```
Accept: application/vnd.edumarket.v1+json
```

## 4. Laravel Folder Structure

```
backend/
├── app/
│   ├── Enums/
│   │   ├── BookingStatus.php
│   │   ├── PaymentStatus.php
│   │   ├── UserRole.php
│   │   └── VerificationStatus.php
│   ├── Exceptions/
│   │   └── Handler.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── V1/
│   │   │           ├── Auth/
│   │   │           │   ├── LoginController.php
│   │   │           │   ├── RegisterController.php
│   │   │           │   └── PasswordResetController.php
│   │   │           ├── Teacher/
│   │   │           │   ├── TeacherProfileController.php
│   │   │           │   ├── TeacherSearchController.php
│   │   │           │   └── TeacherAvailabilityController.php
│   │   │           ├── Booking/
│   │   │           │   └── BookingController.php
│   │   │           ├── Payment/
│   │   │           │   ├── PaymentController.php
│   │   │           │   └── WebhookController.php
│   │   │           ├── Review/
│   │   │           │   └── ReviewController.php
│   │   │           ├── Subscription/
│   │   │           │   └── SubscriptionController.php
│   │   │           └── Admin/
│   │   │               ├── DashboardController.php
│   │   │               ├── UserManagementController.php
│   │   │               ├── VerificationController.php
│   │   │               └── FinancialReportController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureUserHasRole.php
│   │   │   ├── EnsureTeacherVerified.php
│   │   │   └── TrackApiUsage.php
│   │   ├── Requests/
│   │   │   ├── Auth/
│   │   │   ├── Teacher/
│   │   │   ├── Booking/
│   │   │   └── Payment/
│   │   └── Resources/
│   │       ├── TeacherResource.php
│   │       ├── TeacherCollection.php
│   │       ├── BookingResource.php
│   │       └── ReviewResource.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── TeacherProfile.php
│   │   ├── Subject.php
│   │   ├── GradeLevel.php
│   │   ├── TeacherSubject.php
│   │   ├── Location.php
│   │   ├── Booking.php
│   │   ├── Payment.php
│   │   ├── Review.php
│   │   ├── SubscriptionPlan.php
│   │   ├── TeacherSubscription.php
│   │   ├── Commission.php
│   │   └── FeaturedListing.php
│   ├── Services/
│   │   ├── Auth/
│   │   │   └── AuthService.php
│   │   ├── Teacher/
│   │   │   ├── TeacherSearchService.php
│   │   │   └── TeacherProfileService.php
│   │   ├── Geo/
│   │   │   └── GeoLocationService.php
│   │   ├── Booking/
│   │   │   └── BookingService.php
│   │   ├── Payment/
│   │   │   ├── PaymentService.php
│   │   │   ├── StripeGateway.php
│   │   │   └── PaymobGateway.php
│   │   ├── Subscription/
│   │   │   └── SubscriptionService.php
│   │   ├── Commission/
│   │   │   └── CommissionService.php
│   │   └── Notification/
│   │       └── NotificationService.php
│   ├── Repositories/
│   │   ├── Contracts/
│   │   │   ├── TeacherRepositoryInterface.php
│   │   │   ├── BookingRepositoryInterface.php
│   │   │   └── PaymentRepositoryInterface.php
│   │   ├── TeacherRepository.php
│   │   ├── BookingRepository.php
│   │   └── PaymentRepository.php
│   ├── Events/
│   │   ├── BookingCreated.php
│   │   ├── BookingConfirmed.php
│   │   ├── BookingCancelled.php
│   │   ├── PaymentCompleted.php
│   │   └── TeacherVerified.php
│   ├── Listeners/
│   │   ├── SendBookingNotification.php
│   │   ├── ProcessCommission.php
│   │   ├── SendPaymentReceipt.php
│   │   └── NotifyTeacherVerification.php
│   ├── Jobs/
│   │   ├── ProcessPayment.php
│   │   ├── SendSmsNotification.php
│   │   ├── GenerateMonthlyReport.php
│   │   └── ExpireUnconfirmedBookings.php
│   ├── Notifications/
│   │   ├── BookingRequestNotification.php
│   │   ├── PaymentReceiptNotification.php
│   │   └── VerificationStatusNotification.php
│   └── Policies/
│       ├── BookingPolicy.php
│       ├── ReviewPolicy.php
│       └── TeacherProfilePolicy.php
├── config/
│   ├── geo.php               ← custom geolocation config
│   ├── payment.php            ← payment gateway config
│   └── commission.php         ← commission rules config
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── routes/
│   ├── api.php
│   └── api/
│       └── v1/
│           ├── auth.php
│           ├── teachers.php
│           ├── bookings.php
│           ├── payments.php
│           ├── reviews.php
│           ├── subscriptions.php
│           └── admin.php
└── tests/
    ├── Feature/
    │   ├── Auth/
    │   ├── Teacher/
    │   ├── Booking/
    │   └── Payment/
    └── Unit/
        ├── Services/
        └── Repositories/
```

## 5. Angular Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                          ← Singleton services, guards, interceptors
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── role.guard.ts
│   │   │   │   └── teacher-verified.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── loading.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── geo-location.service.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   └── storage.service.ts
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── teacher.model.ts
│   │   │   │   ├── booking.model.ts
│   │   │   │   ├── payment.model.ts
│   │   │   │   └── api-response.model.ts
│   │   │   └── core.module.ts
│   │   ├── shared/                        ← Reusable components, pipes, directives
│   │   │   ├── components/
│   │   │   │   ├── map/
│   │   │   │   │   ├── map.component.ts
│   │   │   │   │   ├── map.component.html
│   │   │   │   │   └── map.component.scss
│   │   │   │   ├── teacher-card/
│   │   │   │   ├── rating-stars/
│   │   │   │   ├── booking-status-badge/
│   │   │   │   ├── pagination/
│   │   │   │   └── loading-spinner/
│   │   │   ├── pipes/
│   │   │   │   ├── distance.pipe.ts
│   │   │   │   └── currency-egp.pipe.ts
│   │   │   ├── directives/
│   │   │   │   └── click-outside.directive.ts
│   │   │   └── shared.module.ts
│   │   ├── features/                      ← Lazy-loaded feature modules
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── forgot-password/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.module.ts
│   │   │   ├── home/
│   │   │   │   ├── home.component.ts
│   │   │   │   ├── teacher-map/
│   │   │   │   ├── search-filters/
│   │   │   │   └── home.routes.ts
│   │   │   ├── teacher-profile/
│   │   │   │   ├── profile-view/
│   │   │   │   ├── profile-edit/
│   │   │   │   ├── availability-calendar/
│   │   │   │   └── teacher-profile.routes.ts
│   │   │   ├── booking/
│   │   │   │   ├── booking-create/
│   │   │   │   ├── booking-list/
│   │   │   │   ├── booking-detail/
│   │   │   │   └── booking.routes.ts
│   │   │   ├── payment/
│   │   │   │   ├── checkout/
│   │   │   │   ├── payment-history/
│   │   │   │   └── payment.routes.ts
│   │   │   ├── reviews/
│   │   │   │   ├── review-form/
│   │   │   │   ├── review-list/
│   │   │   │   └── reviews.routes.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── parent-dashboard/
│   │   │   │   ├── teacher-dashboard/
│   │   │   │   └── dashboard.routes.ts
│   │   │   └── admin/
│   │   │       ├── admin-dashboard/
│   │   │       ├── user-management/
│   │   │       ├── verification-queue/
│   │   │       ├── financial-reports/
│   │   │       └── admin.routes.ts
│   │   ├── store/                         ← State management (NgRx Signals)
│   │   │   ├── auth/
│   │   │   │   └── auth.store.ts
│   │   │   ├── teacher/
│   │   │   │   └── teacher.store.ts
│   │   │   ├── booking/
│   │   │   │   └── booking.store.ts
│   │   │   └── map/
│   │   │       └── map.store.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   ├── environment.staging.ts
│   │   └── environment.production.ts
│   ├── assets/
│   │   ├── icons/
│   │   ├── images/
│   │   └── map-markers/
│   └── styles/
│       ├── _variables.scss
│       ├── _mixins.scss
│       ├── _typography.scss
│       └── styles.scss
├── angular.json
├── tsconfig.json
├── tailwind.config.js
└── package.json
```
