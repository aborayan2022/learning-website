# Database Design — ERD & Schema

## Entity Relationship Diagram (Textual)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │       │ teacher_profiles  │       │   subjects   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK)      │──1:1─▶│ id (PK)          │       │ id (PK)      │
│ role (enum)  │       │ user_id (FK→users)│       │ name         │
│ email        │       │ bio              │       │ slug         │
│ phone        │       │ hourly_rate      │       │ icon         │
│ password     │       │ experience_years │       │ is_active    │
│ first_name   │       │ verification_stat│       └──────┬───────┘
│ last_name    │       │ education        │              │
│ avatar_url   │       │ certifications   │              │
│ is_active    │       │ avg_rating       │    ┌─────────┴─────────┐
│ email_verified│      │ total_reviews    │    │ teacher_subjects   │
│ phone_verified│      │ is_featured      │    ├───────────────────┤
│ created_at   │       │ featured_until   │    │ id (PK)           │
│ updated_at   │       └────────┬─────────┘    │ teacher_profile_id│
└──────┬───────┘                │              │ subject_id (FK)   │
       │                        │              │ grade_level_id(FK)│
       │               ┌───────┴────────┐     │ price_override    │
       │               │   locations    │     └───────────────────┘
       │               ├────────────────┤
       │               │ id (PK)        │     ┌──────────────────┐
       │               │ teacher_prof_id│     │  grade_levels    │
       │               │ label          │     ├──────────────────┤
       │               │ address_line1  │     │ id (PK)          │
       │               │ address_line2  │     │ name             │
       │               │ city           │     │ slug             │
       │               │ governorate    │     │ sort_order       │
       │               │ postal_code    │     └──────────────────┘
       │               │ coordinates    │◀── PostGIS POINT(lng, lat)
       │               │ is_primary     │
       │               └────────────────┘
       │
       │        ┌──────────────────┐      ┌──────────────────┐
       ├──1:N──▶│    bookings      │      │    payments      │
       │        ├──────────────────┤      ├──────────────────┤
       │        │ id (PK)          │──1:1▶│ id (PK)          │
       │        │ parent_id (FK)   │      │ booking_id (FK)  │
       │        │ teacher_id (FK)  │      │ amount           │
       │        │ subject_id (FK)  │      │ currency         │
       │        │ scheduled_at     │      │ gateway          │
       │        │ duration_minutes │      │ gateway_txn_id   │
       │        │ status (enum)    │      │ status (enum)    │
       │        │ location_type    │      │ paid_at          │
       │        │ meeting_address  │      │ refunded_at      │
       │        │ meeting_link     │      │ metadata (JSON)  │
       │        │ notes            │      └──────────────────┘
       │        │ cancellation_rsn │
       │        │ cancelled_by     │      ┌──────────────────┐
       │        └──────────────────┘      │   commissions    │
       │                                  ├──────────────────┤
       │        ┌──────────────────┐      │ id (PK)          │
       └──1:N──▶│    reviews       │      │ payment_id (FK)  │
                ├──────────────────┤      │ teacher_id (FK)  │
                │ id (PK)          │      │ booking_id (FK)  │
                │ booking_id (FK)  │      │ gross_amount     │
                │ reviewer_id (FK) │      │ commission_rate  │
                │ teacher_id (FK)  │      │ commission_amount│
                │ rating (1-5)     │      │ net_teacher_amt  │
                │ comment          │      │ status (enum)    │
                │ is_visible       │      │ settled_at       │
                │ admin_approved   │      └──────────────────┘
                └──────────────────┘
                                          ┌──────────────────┐
┌──────────────────┐                      │ featured_listings│
│subscription_plans│                      ├──────────────────┤
├──────────────────┤                      │ id (PK)          │
│ id (PK)          │                      │ teacher_id (FK)  │
│ name             │                      │ plan_type        │
│ slug             │                      │ starts_at        │
│ price            │                      │ ends_at          │
│ currency         │                      │ priority_score   │
│ duration_days    │                      │ payment_id (FK)  │
│ features (JSON)  │                      │ is_active        │
│ commission_rate  │                      └──────────────────┘
│ max_subjects     │
│ is_active        │    ┌──────────────────────┐
│ sort_order       │    │ teacher_subscriptions │
└────────┬─────────┘    ├──────────────────────┤
         │              │ id (PK)              │
         └──1:N────────▶│ teacher_id (FK)      │
                        │ plan_id (FK)         │
                        │ starts_at            │
                        │ ends_at              │
                        │ status (enum)        │
                        │ payment_id (FK)      │
                        │ auto_renew           │
                        └──────────────────────┘

┌────────────────────────┐
│ teacher_availabilities │
├────────────────────────┤
│ id (PK)                │
│ teacher_profile_id(FK) │
│ day_of_week (0-6)      │
│ start_time             │
│ end_time               │
│ is_active              │
└────────────────────────┘
```

---

## Full Migration Set

### Migration 1: Users Table

```php
<?php
// database/migrations/2026_01_01_000001_create_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email', 255)->unique();
            $table->string('phone', 20)->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['admin', 'parent', 'teacher'])->default('parent');
            $table->string('avatar_url', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('role');
            $table->index('is_active');
            $table->index(['role', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

### Migration 2: Subjects Table

```php
<?php
// database/migrations/2026_01_01_000002_create_subjects_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('name_ar', 100)->nullable(); // Arabic name
            $table->string('slug', 100)->unique();
            $table->string('icon', 50)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
```

### Migration 3: Grade Levels Table

```php
<?php
// database/migrations/2026_01_01_000003_create_grade_levels_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grade_levels', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);          // e.g., "Grade 1", "University"
            $table->string('name_ar', 100)->nullable();
            $table->string('slug', 100)->unique();
            $table->string('stage', 50);           // primary, preparatory, secondary, university
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('stage');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grade_levels');
    }
};
```

### Migration 4: Teacher Profiles Table

```php
<?php
// database/migrations/2026_01_01_000004_create_teacher_profiles_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('bio')->nullable();
            $table->text('education')->nullable();
            $table->json('certifications')->nullable();       // [{name, issuer, year, file_url}]
            $table->json('languages')->nullable();             // ["Arabic", "English"]
            $table->unsignedSmallInteger('experience_years')->default(0);
            $table->decimal('hourly_rate', 10, 2);
            $table->string('currency', 3)->default('EGP');
            $table->enum('verification_status', [
                'pending', 'documents_submitted', 'under_review', 'verified', 'rejected'
            ])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->decimal('avg_rating', 3, 2)->default(0);
            $table->unsignedInteger('total_reviews')->default(0);
            $table->unsignedInteger('total_bookings')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('featured_until')->nullable();
            $table->boolean('accepts_online')->default(false);
            $table->boolean('accepts_in_person')->default(true);
            $table->boolean('is_available')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->unique('user_id');
            $table->index('verification_status');
            $table->index('is_featured');
            $table->index('avg_rating');
            $table->index('hourly_rate');
            $table->index(['verification_status', 'is_available']);
            $table->index(['is_featured', 'avg_rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_profiles');
    }
};
```

### Migration 5: Teacher Subjects Pivot Table

```php
<?php
// database/migrations/2026_01_01_000005_create_teacher_subjects_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('grade_level_id')->constrained()->cascadeOnDelete();
            $table->decimal('price_override', 10, 2)->nullable(); // override hourly_rate per subject
            $table->timestamps();

            $table->unique(['teacher_profile_id', 'subject_id', 'grade_level_id'], 'teacher_subject_grade_unique');
            $table->index('subject_id');
            $table->index('grade_level_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_subjects');
    }
};
```

### Migration 6: Locations Table (PostGIS Spatial)

```php
<?php
// database/migrations/2026_01_01_000006_create_locations_table.php

use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_profile_id')->constrained()->cascadeOnDelete();
            $table->string('label', 100)->default('Primary'); // "Home", "Office", "Center"
            $table->string('address_line_1', 255);
            $table->string('address_line_2', 255)->nullable();
            $table->string('city', 100);
            $table->string('governorate', 100);              // Egyptian governorate
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 2)->default('EG');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('teacher_profile_id');
            $table->index(['latitude', 'longitude']);
            $table->index('city');
            $table->index('governorate');
        });

        // Add PostGIS spatial column and index
        // For PostgreSQL with PostGIS extension:
        DB::statement('ALTER TABLE locations ADD COLUMN coordinates GEOGRAPHY(POINT, 4326)');
        DB::statement('CREATE INDEX locations_coordinates_gist ON locations USING GIST(coordinates)');

        // Trigger to auto-populate coordinates from lat/lng
        DB::statement("
            CREATE OR REPLACE FUNCTION update_location_coordinates()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.coordinates = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        ");

        DB::statement("
            CREATE TRIGGER trg_update_location_coordinates
            BEFORE INSERT OR UPDATE OF latitude, longitude ON locations
            FOR EACH ROW
            EXECUTE FUNCTION update_location_coordinates();
        ");
    }

    public function down(): void
    {
        DB::statement('DROP TRIGGER IF EXISTS trg_update_location_coordinates ON locations');
        DB::statement('DROP FUNCTION IF EXISTS update_location_coordinates()');
        Schema::dropIfExists('locations');
    }
};
```

### Migration 7: Teacher Availability

```php
<?php
// database/migrations/2026_01_01_000007_create_teacher_availabilities_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_profile_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week'); // 0=Sunday, 6=Saturday
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['teacher_profile_id', 'day_of_week']);
            $table->unique(['teacher_profile_id', 'day_of_week', 'start_time'], 'teacher_avail_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_availabilities');
    }
};
```

### Migration 8: Bookings Table

```php
<?php
// database/migrations/2026_01_01_000008_create_bookings_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 20)->unique();       // BK-20260222-XXXX
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained();
            $table->foreignId('grade_level_id')->nullable()->constrained();
            $table->dateTime('scheduled_at');
            $table->unsignedSmallInteger('duration_minutes')->default(60);
            $table->enum('status', [
                'pending',          // parent requested
                'confirmed',        // teacher accepted
                'in_progress',      // session started
                'completed',        // session finished
                'cancelled',        // either party cancelled
                'no_show',          // teacher/student didn't show
                'disputed'          // dispute raised
            ])->default('pending');
            $table->enum('location_type', ['online', 'in_person', 'teacher_location'])->default('in_person');
            $table->text('meeting_address')->nullable();
            $table->decimal('meeting_lat', 10, 8)->nullable();
            $table->decimal('meeting_lng', 11, 8)->nullable();
            $table->string('meeting_link', 500)->nullable();  // for online sessions
            $table->decimal('agreed_price', 10, 2);
            $table->string('currency', 3)->default('EGP');
            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->enum('cancelled_by', ['parent', 'teacher', 'admin', 'system'])->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('parent_id');
            $table->index('teacher_id');
            $table->index('status');
            $table->index('scheduled_at');
            $table->index(['teacher_id', 'status']);
            $table->index(['parent_id', 'status']);
            $table->index(['scheduled_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
```

### Migration 9: Payments Table

```php
<?php
// database/migrations/2026_01_01_000009_create_payments_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();        // PAY-20260222-XXXX
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained();       // who paid
            $table->decimal('amount', 12, 2);
            $table->decimal('platform_fee', 10, 2)->default(0);
            $table->string('currency', 3)->default('EGP');
            $table->enum('gateway', ['stripe', 'paymob', 'wallet', 'manual'])->default('paymob');
            $table->string('gateway_transaction_id', 255)->nullable();
            $table->string('gateway_order_id', 255)->nullable();
            $table->enum('status', [
                'pending',
                'processing',
                'completed',
                'failed',
                'refunded',
                'partially_refunded',
                'disputed'
            ])->default('pending');
            $table->enum('type', ['booking_payment', 'subscription', 'featured_listing', 'refund'])->default('booking_payment');
            $table->json('gateway_response')->nullable();      // raw gateway response
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->decimal('refund_amount', 12, 2)->nullable();
            $table->text('refund_reason')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('booking_id');
            $table->index('status');
            $table->index('gateway');
            $table->index('gateway_transaction_id');
            $table->index(['status', 'gateway']);
            $table->index('paid_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
```

### Migration 10: Reviews Table

```php
<?php
// database/migrations/2026_01_01_000010_create_reviews_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');            // 1-5
            $table->text('comment')->nullable();
            $table->unsignedTinyInteger('teaching_quality')->nullable();  // 1-5
            $table->unsignedTinyInteger('punctuality')->nullable();       // 1-5
            $table->unsignedTinyInteger('communication')->nullable();     // 1-5
            $table->boolean('is_visible')->default(true);
            $table->boolean('admin_approved')->default(true);
            $table->text('admin_note')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // One review per booking
            $table->unique('booking_id');
            $table->index('teacher_id');
            $table->index('reviewer_id');
            $table->index(['teacher_id', 'is_visible']);
            $table->index('rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
```

### Migration 11: Subscription Plans

```php
<?php
// database/migrations/2026_01_01_000011_create_subscription_plans_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('EGP');
            $table->unsignedSmallInteger('duration_days');     // 30, 90, 365
            $table->json('features');                          // {"max_subjects": 10, "featured_days": 7, ...}
            $table->decimal('commission_rate', 5, 2);          // platform commission % for this plan
            $table->unsignedSmallInteger('max_subjects')->default(5);
            $table->boolean('includes_featured')->default(false);
            $table->unsignedSmallInteger('featured_days')->default(0);
            $table->boolean('priority_support')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
```

### Migration 12: Teacher Subscriptions

```php
<?php
// database/migrations/2026_01_01_000012_create_teacher_subscriptions_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_plan_id')->constrained()->restrictOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->enum('status', ['active', 'expired', 'cancelled', 'suspended'])->default('active');
            $table->boolean('auto_renew')->default(false);
            $table->timestamps();

            $table->index(['teacher_profile_id', 'status']);
            $table->index('ends_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_subscriptions');
    }
};
```

### Migration 13: Commissions Table

```php
<?php
// database/migrations/2026_01_01_000013_create_commissions_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('gross_amount', 12, 2);            // total payment
            $table->decimal('commission_rate', 5, 2);          // e.g., 15.00 = 15%
            $table->decimal('commission_amount', 12, 2);       // platform takes
            $table->decimal('net_teacher_amount', 12, 2);      // teacher receives
            $table->enum('status', ['pending', 'settled', 'paid_out'])->default('pending');
            $table->timestamp('settled_at')->nullable();
            $table->timestamp('paid_out_at')->nullable();
            $table->string('payout_reference')->nullable();
            $table->timestamps();

            $table->index('teacher_id');
            $table->index('status');
            $table->index(['teacher_id', 'status']);
            $table->index('settled_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
```

### Migration 14: Featured Listings

```php
<?php
// database/migrations/2026_01_01_000014_create_featured_listings_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('featured_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('plan_type', ['basic_boost', 'premium_boost', 'top_teacher']);
            $table->unsignedSmallInteger('priority_score')->default(1); // higher = more visible
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'ends_at']);
            $table->index(['is_active', 'priority_score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('featured_listings');
    }
};
```

---

## Indexing Strategy Summary

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| `users` | `(role, is_active)` | Composite B-tree | Filter active users by role |
| `locations` | `coordinates` | GiST (Spatial) | Geospatial proximity queries |
| `locations` | `(latitude, longitude)` | Composite B-tree | Fallback distance calc |
| `teacher_profiles` | `(verification_status, is_available)` | Composite B-tree | Search verified+available |
| `teacher_profiles` | `(is_featured, avg_rating)` | Composite B-tree | Featured sort |
| `bookings` | `(teacher_id, status)` | Composite B-tree | Teacher booking lookup |
| `bookings` | `(scheduled_at, status)` | Composite B-tree | Calendar queries |
| `payments` | `(status, gateway)` | Composite B-tree | Payment reconciliation |
| `commissions` | `(teacher_id, status)` | Composite B-tree | Teacher earnings |
| `reviews` | `(teacher_id, is_visible)` | Composite B-tree | Public review display |

---

## Seeder Example

```php
<?php
// database/seeders/SubjectSeeder.php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            ['name' => 'Mathematics', 'name_ar' => 'رياضيات', 'slug' => 'mathematics', 'icon' => 'calculate'],
            ['name' => 'Arabic Language', 'name_ar' => 'اللغة العربية', 'slug' => 'arabic', 'icon' => 'translate'],
            ['name' => 'English Language', 'name_ar' => 'اللغة الإنجليزية', 'slug' => 'english', 'icon' => 'language'],
            ['name' => 'Physics', 'name_ar' => 'فيزياء', 'slug' => 'physics', 'icon' => 'science'],
            ['name' => 'Chemistry', 'name_ar' => 'كيمياء', 'slug' => 'chemistry', 'icon' => 'biotech'],
            ['name' => 'Biology', 'name_ar' => 'أحياء', 'slug' => 'biology', 'icon' => 'eco'],
            ['name' => 'Computer Science', 'name_ar' => 'علوم الحاسب', 'slug' => 'computer-science', 'icon' => 'computer'],
            ['name' => 'French Language', 'name_ar' => 'اللغة الفرنسية', 'slug' => 'french', 'icon' => 'language'],
            ['name' => 'History', 'name_ar' => 'تاريخ', 'slug' => 'history', 'icon' => 'history_edu'],
            ['name' => 'Geography', 'name_ar' => 'جغرافيا', 'slug' => 'geography', 'icon' => 'public'],
        ];

        foreach ($subjects as $i => $subject) {
            Subject::create(array_merge($subject, ['sort_order' => $i + 1]));
        }
    }
}
```

```php
<?php
// database/seeders/GradeLevelSeeder.php

namespace Database\Seeders;

use App\Models\GradeLevel;
use Illuminate\Database\Seeder;

class GradeLevelSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            ['name' => 'KG 1', 'name_ar' => 'تمهيدي 1', 'slug' => 'kg-1', 'stage' => 'kindergarten'],
            ['name' => 'KG 2', 'name_ar' => 'تمهيدي 2', 'slug' => 'kg-2', 'stage' => 'kindergarten'],
            ['name' => 'Grade 1', 'name_ar' => 'الصف الأول الابتدائي', 'slug' => 'grade-1', 'stage' => 'primary'],
            ['name' => 'Grade 2', 'name_ar' => 'الصف الثاني الابتدائي', 'slug' => 'grade-2', 'stage' => 'primary'],
            ['name' => 'Grade 3', 'name_ar' => 'الصف الثالث الابتدائي', 'slug' => 'grade-3', 'stage' => 'primary'],
            ['name' => 'Grade 4', 'name_ar' => 'الصف الرابع الابتدائي', 'slug' => 'grade-4', 'stage' => 'primary'],
            ['name' => 'Grade 5', 'name_ar' => 'الصف الخامس الابتدائي', 'slug' => 'grade-5', 'stage' => 'primary'],
            ['name' => 'Grade 6', 'name_ar' => 'الصف السادس الابتدائي', 'slug' => 'grade-6', 'stage' => 'primary'],
            ['name' => 'Grade 7', 'name_ar' => 'الصف الأول الإعدادي', 'slug' => 'grade-7', 'stage' => 'preparatory'],
            ['name' => 'Grade 8', 'name_ar' => 'الصف الثاني الإعدادي', 'slug' => 'grade-8', 'stage' => 'preparatory'],
            ['name' => 'Grade 9', 'name_ar' => 'الصف الثالث الإعدادي', 'slug' => 'grade-9', 'stage' => 'preparatory'],
            ['name' => 'Grade 10', 'name_ar' => 'الصف الأول الثانوي', 'slug' => 'grade-10', 'stage' => 'secondary'],
            ['name' => 'Grade 11', 'name_ar' => 'الصف الثاني الثانوي', 'slug' => 'grade-11', 'stage' => 'secondary'],
            ['name' => 'Grade 12', 'name_ar' => 'الصف الثالث الثانوي', 'slug' => 'grade-12', 'stage' => 'secondary'],
            ['name' => 'University', 'name_ar' => 'جامعي', 'slug' => 'university', 'stage' => 'university'],
        ];

        foreach ($levels as $i => $level) {
            GradeLevel::create(array_merge($level, ['sort_order' => $i + 1]));
        }
    }
}
```
