# Geolocation Logic — Implementation Guide

## 1. Coordinate Storage Strategy

### PostgreSQL + PostGIS (Recommended)

Store coordinates as a PostGIS `GEOGRAPHY` type for accurate Earth-surface distance calculations.

```sql
-- Enable PostGIS extension (run once)
CREATE EXTENSION IF NOT EXISTS postgis;

-- The locations table already has:
-- coordinates GEOGRAPHY(POINT, 4326)
-- with a GiST index for spatial queries

-- Insert a location
INSERT INTO locations (teacher_profile_id, label, address_line_1, city, governorate, latitude, longitude)
VALUES (1, 'Home', '15 Tahrir Street', 'Cairo', 'Cairo', 30.0444, 31.2357);
-- The trigger auto-populates coordinates from lat/lng
```

### MySQL Alternative (if PostGIS unavailable)

```sql
-- MySQL 8+ with spatial support
ALTER TABLE locations ADD COLUMN coordinates POINT NOT NULL SRID 4326;
CREATE SPATIAL INDEX idx_locations_coordinates ON locations(coordinates);

-- Insert
UPDATE locations SET coordinates = ST_GeomFromText('POINT(31.2357 30.0444)', 4326)
WHERE id = 1;
```

---

## 2. Nearest Teacher Query — PostGIS (Production)

### Raw SQL: Find teachers within radius

```sql
-- Find all verified teachers within 10km of a given point
-- Ordered by distance (nearest first), with featured teachers boosted

SELECT
    tp.id AS teacher_profile_id,
    u.first_name,
    u.last_name,
    tp.hourly_rate,
    tp.avg_rating,
    tp.total_reviews,
    tp.is_featured,
    tp.accepts_online,
    tp.accepts_in_person,
    l.city,
    l.governorate,
    l.latitude,
    l.longitude,
    ST_Distance(
        l.coordinates,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
    ) AS distance_meters,
    ROUND(
        ST_Distance(
            l.coordinates,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
        ) / 1000.0, 2
    ) AS distance_km
FROM teacher_profiles tp
INNER JOIN users u ON u.id = tp.user_id
INNER JOIN locations l ON l.teacher_profile_id = tp.id AND l.is_primary = true AND l.is_active = true
WHERE tp.verification_status = 'verified'
  AND tp.is_available = true
  AND u.is_active = true
  AND ST_DWithin(
      l.coordinates,
      ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
      :radius_meters  -- e.g., 10000 for 10km
  )
ORDER BY
    tp.is_featured DESC,
    distance_meters ASC
LIMIT :limit OFFSET :offset;
```

### With Subject & Grade Filtering

```sql
SELECT
    tp.id,
    u.first_name,
    u.last_name,
    tp.hourly_rate,
    tp.avg_rating,
    s.name AS subject_name,
    gl.name AS grade_level,
    COALESCE(ts.price_override, tp.hourly_rate) AS effective_price,
    ROUND(ST_Distance(
        l.coordinates,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
    ) / 1000.0, 2) AS distance_km
FROM teacher_profiles tp
INNER JOIN users u ON u.id = tp.user_id
INNER JOIN locations l ON l.teacher_profile_id = tp.id AND l.is_primary = true
INNER JOIN teacher_subjects ts ON ts.teacher_profile_id = tp.id
INNER JOIN subjects s ON s.id = ts.subject_id
INNER JOIN grade_levels gl ON gl.id = ts.grade_level_id
WHERE tp.verification_status = 'verified'
  AND tp.is_available = true
  AND u.is_active = true
  AND s.slug = :subject_slug
  AND gl.slug = :grade_slug
  AND ST_DWithin(
      l.coordinates,
      ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
      :radius_meters
  )
ORDER BY
    tp.is_featured DESC,
    distance_km ASC,
    tp.avg_rating DESC
LIMIT 20;
```

---

## 3. Laravel Eloquent Implementation

### GeoLocationService

```php
<?php
// app/Services/Geo/GeoLocationService.php

namespace App\Services\Geo;

use App\Models\Location;
use App\Models\TeacherProfile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class GeoLocationService
{
    /**
     * Default search radius in meters.
     */
    private const DEFAULT_RADIUS = 10000; // 10km

    /**
     * Maximum allowed radius in meters.
     */
    private const MAX_RADIUS = 50000; // 50km

    /**
     * Find nearby teachers using PostGIS spatial queries.
     *
     * @param float $latitude   User's latitude
     * @param float $longitude  User's longitude
     * @param int   $radius     Search radius in meters
     * @param array $filters    Optional filters (subject_id, grade_level_id, min_rating, max_price, etc.)
     * @param int   $page       Page number
     * @param int   $perPage    Results per page
     * @return array{data: Collection, total: int, radius_km: float}
     */
    public function findNearbyTeachers(
        float $latitude,
        float $longitude,
        int $radius = self::DEFAULT_RADIUS,
        array $filters = [],
        int $page = 1,
        int $perPage = 20
    ): array {
        $radius = min($radius, self::MAX_RADIUS);
        $offset = ($page - 1) * $perPage;

        $point = "ST_SetSRID(ST_MakePoint({$longitude}, {$latitude}), 4326)::geography";

        $query = DB::table('teacher_profiles as tp')
            ->select([
                'tp.id as teacher_profile_id',
                'u.id as user_id',
                'u.first_name',
                'u.last_name',
                'u.avatar_url',
                'tp.bio',
                'tp.hourly_rate',
                'tp.currency',
                'tp.avg_rating',
                'tp.total_reviews',
                'tp.total_bookings',
                'tp.experience_years',
                'tp.is_featured',
                'tp.accepts_online',
                'tp.accepts_in_person',
                'l.city',
                'l.governorate',
                'l.latitude',
                'l.longitude',
                DB::raw("ROUND(ST_Distance(l.coordinates, {$point}) / 1000.0, 2) AS distance_km"),
            ])
            ->join('users as u', 'u.id', '=', 'tp.user_id')
            ->join('locations as l', function ($join) {
                $join->on('l.teacher_profile_id', '=', 'tp.id')
                     ->where('l.is_primary', true)
                     ->where('l.is_active', true);
            })
            ->where('tp.verification_status', 'verified')
            ->where('tp.is_available', true)
            ->where('u.is_active', true)
            ->whereNull('tp.deleted_at')
            ->whereRaw("ST_DWithin(l.coordinates, {$point}, ?)", [$radius]);

        // Apply optional filters
        if (!empty($filters['subject_id'])) {
            $query->join('teacher_subjects as ts', 'ts.teacher_profile_id', '=', 'tp.id')
                  ->where('ts.subject_id', $filters['subject_id']);

            if (!empty($filters['grade_level_id'])) {
                $query->where('ts.grade_level_id', $filters['grade_level_id']);
            }

            // Use subject-specific price if available
            $query->addSelect(DB::raw('COALESCE(ts.price_override, tp.hourly_rate) AS effective_price'));
        }

        if (!empty($filters['min_rating'])) {
            $query->where('tp.avg_rating', '>=', $filters['min_rating']);
        }

        if (!empty($filters['max_price'])) {
            $query->where('tp.hourly_rate', '<=', $filters['max_price']);
        }

        if (!empty($filters['min_experience'])) {
            $query->where('tp.experience_years', '>=', $filters['min_experience']);
        }

        if (isset($filters['accepts_online']) && $filters['accepts_online']) {
            $query->where('tp.accepts_online', true);
        }

        // Get total count before pagination
        $total = $query->count();

        // Apply ordering: featured first, then by distance, then by rating
        $results = $query
            ->orderByDesc('tp.is_featured')
            ->orderBy('distance_km')
            ->orderByDesc('tp.avg_rating')
            ->offset($offset)
            ->limit($perPage)
            ->get();

        return [
            'data' => $results,
            'total' => $total,
            'radius_km' => $radius / 1000,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => (int) ceil($total / $perPage),
        ];
    }

    /**
     * Get teachers for map display (minimal data, larger radius).
     * Returns only coordinates + basic info for map markers.
     */
    public function getTeachersForMap(
        float $latitude,
        float $longitude,
        int $radius = 20000, // 20km default for map view
        array $filters = []
    ): Collection {
        $point = "ST_SetSRID(ST_MakePoint({$longitude}, {$latitude}), 4326)::geography";

        $query = DB::table('teacher_profiles as tp')
            ->select([
                'tp.id',
                'u.first_name',
                'u.last_name',
                'tp.hourly_rate',
                'tp.avg_rating',
                'tp.is_featured',
                'l.latitude',
                'l.longitude',
                DB::raw("ROUND(ST_Distance(l.coordinates, {$point}) / 1000.0, 2) AS distance_km"),
            ])
            ->join('users as u', 'u.id', '=', 'tp.user_id')
            ->join('locations as l', function ($join) {
                $join->on('l.teacher_profile_id', '=', 'tp.id')
                     ->where('l.is_primary', true)
                     ->where('l.is_active', true);
            })
            ->where('tp.verification_status', 'verified')
            ->where('tp.is_available', true)
            ->where('u.is_active', true)
            ->whereNull('tp.deleted_at')
            ->whereRaw("ST_DWithin(l.coordinates, {$point}, ?)", [$radius]);

        // Apply subject/grade filters if provided
        if (!empty($filters['subject_id'])) {
            $query->join('teacher_subjects as ts', 'ts.teacher_profile_id', '=', 'tp.id')
                  ->where('ts.subject_id', $filters['subject_id']);
        }

        return $query
            ->orderByDesc('tp.is_featured')
            ->orderBy('distance_km')
            ->limit(200) // Cap for map performance
            ->get();
    }

    /**
     * Haversine formula fallback for MySQL or non-PostGIS databases.
     * Less accurate than PostGIS but works everywhere.
     */
    public function findNearbyTeachersHaversine(
        float $latitude,
        float $longitude,
        int $radiusKm = 10,
        int $limit = 20
    ): Collection {
        $haversine = "(
            6371 * acos(
                cos(radians(?)) *
                cos(radians(l.latitude)) *
                cos(radians(l.longitude) - radians(?)) +
                sin(radians(?)) *
                sin(radians(l.latitude))
            )
        )";

        return DB::table('teacher_profiles as tp')
            ->select([
                'tp.id',
                'u.first_name',
                'u.last_name',
                'tp.hourly_rate',
                'tp.avg_rating',
                'l.latitude',
                'l.longitude',
                DB::raw("{$haversine} AS distance_km"),
            ])
            ->join('users as u', 'u.id', '=', 'tp.user_id')
            ->join('locations as l', function ($join) {
                $join->on('l.teacher_profile_id', '=', 'tp.id')
                     ->where('l.is_primary', true);
            })
            ->where('tp.verification_status', 'verified')
            ->where('tp.is_available', true)
            ->whereRaw("{$haversine} <= ?", [$latitude, $longitude, $latitude, $radiusKm])
            // Bounding box pre-filter for performance
            ->whereBetween('l.latitude', [
                $latitude - ($radiusKm / 111.0),
                $latitude + ($radiusKm / 111.0),
            ])
            ->whereBetween('l.longitude', [
                $longitude - ($radiusKm / (111.0 * cos(deg2rad($latitude)))),
                $longitude + ($radiusKm / (111.0 * cos(deg2rad($latitude)))),
            ])
            ->orderBy('distance_km')
            ->limit($limit)
            ->setBindings([$latitude, $longitude, $latitude, $radiusKm])
            ->get();
    }
}
```

### TeacherSearchController

```php
<?php
// app/Http/Controllers/Api/V1/Teacher/TeacherSearchController.php

namespace App\Http\Controllers\Api\V1\Teacher;

use App\Http\Controllers\Controller;
use App\Services\Geo\GeoLocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherSearchController extends Controller
{
    public function __construct(
        private readonly GeoLocationService $geoService
    ) {}

    /**
     * GET /api/v1/teachers/nearby
     *
     * Query params:
     *   lat (required)        - User latitude
     *   lng (required)        - User longitude
     *   radius (optional)     - Search radius in meters (default: 10000)
     *   subject_id (optional) - Filter by subject
     *   grade_level_id (opt)  - Filter by grade
     *   min_rating (optional) - Minimum teacher rating
     *   max_price (optional)  - Maximum hourly rate
     *   page (optional)       - Page number
     */
    public function nearby(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1000|max:50000',
            'subject_id' => 'nullable|integer|exists:subjects,id',
            'grade_level_id' => 'nullable|integer|exists:grade_levels,id',
            'min_rating' => 'nullable|numeric|between:1,5',
            'max_price' => 'nullable|numeric|min:0',
            'min_experience' => 'nullable|integer|min:0',
            'accepts_online' => 'nullable|boolean',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $result = $this->geoService->findNearbyTeachers(
            latitude: (float) $validated['lat'],
            longitude: (float) $validated['lng'],
            radius: (int) ($validated['radius'] ?? 10000),
            filters: array_filter([
                'subject_id' => $validated['subject_id'] ?? null,
                'grade_level_id' => $validated['grade_level_id'] ?? null,
                'min_rating' => $validated['min_rating'] ?? null,
                'max_price' => $validated['max_price'] ?? null,
                'min_experience' => $validated['min_experience'] ?? null,
                'accepts_online' => $validated['accepts_online'] ?? null,
            ]),
            page: (int) ($validated['page'] ?? 1),
            perPage: (int) ($validated['per_page'] ?? 20),
        );

        return response()->json([
            'success' => true,
            'data' => $result['data'],
            'meta' => [
                'total' => $result['total'],
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'total_pages' => $result['total_pages'],
                'search_radius_km' => $result['radius_km'],
            ],
        ]);
    }

    /**
     * GET /api/v1/teachers/map-markers
     *
     * Lightweight endpoint for map marker rendering.
     */
    public function mapMarkers(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1000|max:50000',
            'subject_id' => 'nullable|integer|exists:subjects,id',
        ]);

        $markers = $this->geoService->getTeachersForMap(
            latitude: (float) $validated['lat'],
            longitude: (float) $validated['lng'],
            radius: (int) ($validated['radius'] ?? 20000),
            filters: array_filter([
                'subject_id' => $validated['subject_id'] ?? null,
            ]),
        );

        return response()->json([
            'success' => true,
            'data' => $markers,
            'count' => $markers->count(),
        ]);
    }
}
```

---

## 4. Performance Optimization for Large Datasets

### Strategy 1: Bounding Box Pre-filter

Always apply a rectangular bounding box BEFORE the expensive distance calculation:

```sql
-- Pre-filter with bounding box (fast B-tree index), then refine with precise distance
WHERE l.latitude BETWEEN (:lat - :delta_lat) AND (:lat + :delta_lat)
  AND l.longitude BETWEEN (:lng - :delta_lng) AND (:lng + :delta_lng)
  AND ST_DWithin(l.coordinates, ST_MakePoint(:lng, :lat)::geography, :radius)
```

PostGIS `ST_DWithin` with GiST index already does this internally, but for MySQL/Haversine this is critical.

### Strategy 2: Redis Geospatial Caching

```php
<?php
// app/Services/Geo/GeoCache.php

namespace App\Services\Geo;

use Illuminate\Support\Facades\Redis;

class GeoCache
{
    private const GEO_KEY = 'teacher:locations';
    private const TTL = 3600; // 1 hour

    /**
     * Index all active teacher locations in Redis.
     * Run via scheduled command every hour.
     */
    public function indexTeacherLocations(): void
    {
        $locations = \DB::table('locations as l')
            ->join('teacher_profiles as tp', 'tp.id', '=', 'l.teacher_profile_id')
            ->join('users as u', 'u.id', '=', 'tp.user_id')
            ->where('tp.verification_status', 'verified')
            ->where('tp.is_available', true)
            ->where('u.is_active', true)
            ->where('l.is_primary', true)
            ->select('tp.id', 'l.longitude', 'l.latitude')
            ->get();

        // Clear old data
        Redis::del(self::GEO_KEY);

        // Batch add to Redis geo set
        $pipeline = Redis::pipeline();
        foreach ($locations as $loc) {
            $pipeline->geoadd(
                self::GEO_KEY,
                $loc->longitude,
                $loc->latitude,
                "teacher:{$loc->id}"
            );
        }
        $pipeline->execute();
    }

    /**
     * Fast proximity lookup from Redis (O(log(N)+M) complexity).
     * Returns teacher IDs sorted by distance.
     */
    public function findNearbyTeacherIds(
        float $longitude,
        float $latitude,
        float $radiusKm = 10,
        int $limit = 50
    ): array {
        $results = Redis::georadius(
            self::GEO_KEY,
            $longitude,
            $latitude,
            $radiusKm,
            'km',
            'WITHCOORD',
            'WITHDIST',
            'ASC',
            'COUNT',
            $limit
        );

        return collect($results)->map(function ($item) {
            return [
                'teacher_profile_id' => (int) str_replace('teacher:', '', $item[0]),
                'distance_km' => (float) $item[1],
                'longitude' => (float) $item[2][0],
                'latitude' => (float) $item[2][1],
            ];
        })->toArray();
    }
}
```

### Strategy 3: Materialized View for Hot Queries

```sql
-- PostgreSQL materialized view for search-optimized teacher data
CREATE MATERIALIZED VIEW mv_searchable_teachers AS
SELECT
    tp.id AS teacher_profile_id,
    u.id AS user_id,
    u.first_name,
    u.last_name,
    u.avatar_url,
    tp.hourly_rate,
    tp.currency,
    tp.avg_rating,
    tp.total_reviews,
    tp.experience_years,
    tp.is_featured,
    tp.featured_until,
    tp.accepts_online,
    tp.accepts_in_person,
    l.latitude,
    l.longitude,
    l.coordinates,
    l.city,
    l.governorate,
    array_agg(DISTINCT s.id) AS subject_ids,
    array_agg(DISTINCT gl.id) AS grade_level_ids,
    min(COALESCE(ts.price_override, tp.hourly_rate)) AS min_price
FROM teacher_profiles tp
INNER JOIN users u ON u.id = tp.user_id AND u.is_active = true
INNER JOIN locations l ON l.teacher_profile_id = tp.id AND l.is_primary = true AND l.is_active = true
LEFT JOIN teacher_subjects ts ON ts.teacher_profile_id = tp.id
LEFT JOIN subjects s ON s.id = ts.subject_id
LEFT JOIN grade_levels gl ON gl.id = ts.grade_level_id
WHERE tp.verification_status = 'verified'
  AND tp.is_available = true
  AND tp.deleted_at IS NULL
GROUP BY tp.id, u.id, l.id;

-- Indexes on materialized view
CREATE INDEX idx_mv_teachers_coordinates ON mv_searchable_teachers USING GIST(coordinates);
CREATE INDEX idx_mv_teachers_rating ON mv_searchable_teachers (avg_rating DESC);
CREATE INDEX idx_mv_teachers_featured ON mv_searchable_teachers (is_featured DESC, avg_rating DESC);

-- Refresh periodically (every 5 minutes via cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_searchable_teachers;
```

### Strategy 4: Scheduled Laravel Command

```php
<?php
// app/Console/Commands/RefreshGeoCache.php

namespace App\Console\Commands;

use App\Services\Geo\GeoCache;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RefreshGeoCache extends Command
{
    protected $signature = 'geo:refresh-cache';
    protected $description = 'Refresh Redis geo cache and materialized view';

    public function handle(GeoCache $geoCache): int
    {
        $this->info('Refreshing Redis geo index...');
        $geoCache->indexTeacherLocations();

        $this->info('Refreshing materialized view...');
        DB::statement('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_searchable_teachers');

        $this->info('Geo cache refreshed successfully.');
        return self::SUCCESS;
    }
}
```

```php
// app/Console/Kernel.php (or routes/console.php in Laravel 12)
Schedule::command('geo:refresh-cache')->everyFiveMinutes();
```

---

## 5. Custom Configuration

```php
<?php
// config/geo.php

return [
    'default_radius_meters' => env('GEO_DEFAULT_RADIUS', 10000),
    'max_radius_meters' => env('GEO_MAX_RADIUS', 50000),
    'map_max_markers' => env('GEO_MAP_MAX_MARKERS', 200),
    'cache_ttl_minutes' => env('GEO_CACHE_TTL', 5),
    'use_postgis' => env('GEO_USE_POSTGIS', true),
    'use_redis_geo' => env('GEO_USE_REDIS', true),
    'srid' => 4326,
];
```
