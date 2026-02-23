# Angular Frontend — Implementation Guide

## 1. Routing & Lazy Loading

### App Routes (Top Level)

```typescript
// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'teachers',
    loadChildren: () => import('./features/teacher-profile/teacher-profile.routes').then(m => m.TEACHER_ROUTES),
  },
  {
    path: 'bookings',
    canActivate: [authGuard],
    loadChildren: () => import('./features/booking/booking.routes').then(m => m.BOOKING_ROUTES),
  },
  {
    path: 'payments',
    canActivate: [authGuard],
    loadChildren: () => import('./features/payment/payment.routes').then(m => m.PAYMENT_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
```

### Feature Routes Example

```typescript
// src/app/features/booking/booking.routes.ts

import { Routes } from '@angular/router';

export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./booking-list/booking-list.component').then(m => m.BookingListComponent),
  },
  {
    path: 'create/:teacherId',
    loadComponent: () =>
      import('./booking-create/booking-create.component').then(m => m.BookingCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./booking-detail/booking-detail.component').then(m => m.BookingDetailComponent),
  },
];
```

```typescript
// src/app/features/dashboard/dashboard.routes.ts

import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard-router/dashboard-router.component').then(m => m.DashboardRouterComponent),
    children: [
      {
        path: 'parent',
        canActivate: [roleGuard],
        data: { roles: ['parent'] },
        loadComponent: () =>
          import('./parent-dashboard/parent-dashboard.component').then(m => m.ParentDashboardComponent),
      },
      {
        path: 'teacher',
        canActivate: [roleGuard],
        data: { roles: ['teacher'] },
        loadComponent: () =>
          import('./teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent),
      },
    ],
  },
];
```

---

## 2. Core Guards

### Auth Guard

```typescript
// src/app/core/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../store/auth/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: window.location.pathname },
  });
  return false;
};
```

### Role Guard

```typescript
// src/app/core/guards/role.guard.ts

import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../store/auth/auth.store';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as string[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const userRole = authStore.user()?.role;

  if (userRole && requiredRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
```

---

## 3. State Management (Angular Signals Store)

### Auth Store

```typescript
// src/app/store/auth/auth.store.ts

import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // State signals
  private readonly state = signal<AuthState>({
    user: null,
    token: localStorage.getItem('auth_token'),
    isLoading: false,
    error: null,
  });

  // Computed selectors
  readonly user = computed(() => this.state().user);
  readonly token = computed(() => this.state().token);
  readonly isAuthenticated = computed(() => !!this.state().token);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  readonly isTeacher = computed(() => this.state().user?.role === 'teacher');
  readonly isParent = computed(() => this.state().user?.role === 'parent');
  readonly isAdmin = computed(() => this.state().user?.role === 'admin');

  async login(email: string, password: string): Promise<void> {
    this.state.update(s => ({ ...s, isLoading: true, error: null }));

    try {
      const response = await this.authService.login({ email, password });
      localStorage.setItem('auth_token', response.token);
      this.state.update(s => ({
        ...s,
        user: response.user,
        token: response.token,
        isLoading: false,
      }));

      // Redirect based on role
      const redirectMap: Record<string, string> = {
        admin: '/admin',
        teacher: '/dashboard/teacher',
        parent: '/dashboard/parent',
      };
      this.router.navigate([redirectMap[response.user.role] || '/']);
    } catch (err: any) {
      this.state.update(s => ({
        ...s,
        isLoading: false,
        error: err?.error?.message || 'Login failed',
      }));
    }
  }

  async register(data: any): Promise<void> {
    this.state.update(s => ({ ...s, isLoading: true, error: null }));

    try {
      const response = await this.authService.register(data);
      localStorage.setItem('auth_token', response.token);
      this.state.update(s => ({
        ...s,
        user: response.user,
        token: response.token,
        isLoading: false,
      }));
    } catch (err: any) {
      this.state.update(s => ({
        ...s,
        isLoading: false,
        error: err?.error?.message || 'Registration failed',
      }));
    }
  }

  async loadProfile(): Promise<void> {
    if (!this.token()) return;

    try {
      const user = await this.authService.getProfile();
      this.state.update(s => ({ ...s, user }));
    } catch {
      this.logout();
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.state.update(s => ({ ...s, user: null, token: null }));
    this.router.navigate(['/auth/login']);
  }
}
```

### Teacher Search Store (Map State)

```typescript
// src/app/store/teacher/teacher.store.ts

import { computed, inject, Injectable, signal } from '@angular/core';
import { TeacherSearchService } from '../../core/services/teacher-search.service';
import { Teacher, TeacherSearchFilters, MapMarker } from '../../core/models/teacher.model';

interface TeacherSearchState {
  teachers: Teacher[];
  mapMarkers: MapMarker[];
  selectedTeacher: Teacher | null;
  filters: TeacherSearchFilters;
  userLocation: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class TeacherStore {
  private readonly searchService = inject(TeacherSearchService);

  private readonly state = signal<TeacherSearchState>({
    teachers: [],
    mapMarkers: [],
    selectedTeacher: null,
    filters: {
      radius: 10000,
      subjectId: null,
      gradeLevelId: null,
      minRating: null,
      maxPrice: null,
      acceptsOnline: null,
    },
    userLocation: null,
    isLoading: false,
    error: null,
    pagination: { page: 1, perPage: 20, total: 0, totalPages: 0 },
  });

  // Selectors
  readonly teachers = computed(() => this.state().teachers);
  readonly mapMarkers = computed(() => this.state().mapMarkers);
  readonly selectedTeacher = computed(() => this.state().selectedTeacher);
  readonly filters = computed(() => this.state().filters);
  readonly userLocation = computed(() => this.state().userLocation);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly pagination = computed(() => this.state().pagination);

  setUserLocation(lat: number, lng: number): void {
    this.state.update(s => ({ ...s, userLocation: { lat, lng } }));
    this.searchNearby();
  }

  updateFilters(filters: Partial<TeacherSearchFilters>): void {
    this.state.update(s => ({
      ...s,
      filters: { ...s.filters, ...filters },
      pagination: { ...s.pagination, page: 1 },
    }));
    this.searchNearby();
  }

  selectTeacher(teacher: Teacher | null): void {
    this.state.update(s => ({ ...s, selectedTeacher: teacher }));
  }

  async searchNearby(page?: number): Promise<void> {
    const location = this.state().userLocation;
    if (!location) return;

    this.state.update(s => ({ ...s, isLoading: true, error: null }));

    try {
      const { filters, pagination } = this.state();
      const result = await this.searchService.searchNearby({
        lat: location.lat,
        lng: location.lng,
        radius: filters.radius,
        subject_id: filters.subjectId,
        grade_level_id: filters.gradeLevelId,
        min_rating: filters.minRating,
        max_price: filters.maxPrice,
        accepts_online: filters.acceptsOnline,
        page: page ?? pagination.page,
        per_page: pagination.perPage,
      });

      this.state.update(s => ({
        ...s,
        teachers: result.data,
        isLoading: false,
        pagination: result.meta,
      }));
    } catch (err: any) {
      this.state.update(s => ({
        ...s,
        isLoading: false,
        error: err?.message || 'Search failed',
      }));
    }
  }

  async loadMapMarkers(): Promise<void> {
    const location = this.state().userLocation;
    if (!location) return;

    try {
      const { filters } = this.state();
      const markers = await this.searchService.getMapMarkers({
        lat: location.lat,
        lng: location.lng,
        radius: filters.radius * 2, // wider radius for map
        subject_id: filters.subjectId,
      });

      this.state.update(s => ({ ...s, mapMarkers: markers }));
    } catch {
      // Silently fail for map markers, list is primary
    }
  }
}
```

---

## 4. Core Services

### API Service (Base HTTP Client)

```typescript
// src/app/core/services/api.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return firstValueFrom(
      this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams })
    );
  }

  async post<T>(path: string, body: any): Promise<T> {
    return firstValueFrom(
      this.http.post<T>(`${this.baseUrl}${path}`, body)
    );
  }

  async put<T>(path: string, body: any): Promise<T> {
    return firstValueFrom(
      this.http.put<T>(`${this.baseUrl}${path}`, body)
    );
  }

  async patch<T>(path: string, body: any): Promise<T> {
    return firstValueFrom(
      this.http.patch<T>(`${this.baseUrl}${path}`, body)
    );
  }

  async delete<T>(path: string): Promise<T> {
    return firstValueFrom(
      this.http.delete<T>(`${this.baseUrl}${path}`)
    );
  }
}
```

### Auth Service

```typescript
// src/app/core/services/auth.service.ts

import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role: 'parent' | 'teacher';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  login(payload: LoginPayload): Promise<AuthResponse> {
    return this.api.post('/v1/auth/login', payload);
  }

  register(payload: RegisterPayload): Promise<AuthResponse> {
    return this.api.post('/v1/auth/register', payload);
  }

  getProfile(): Promise<User> {
    return this.api.get<{ data: User }>('/v1/auth/me').then(r => r.data);
  }

  logout(): Promise<void> {
    return this.api.post('/v1/auth/logout', {});
  }

  forgotPassword(email: string): Promise<void> {
    return this.api.post('/v1/auth/forgot-password', { email });
  }

  resetPassword(data: { token: string; email: string; password: string; password_confirmation: string }): Promise<void> {
    return this.api.post('/v1/auth/reset-password', data);
  }
}
```

### Teacher Search Service

```typescript
// src/app/core/services/teacher-search.service.ts

import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Teacher, MapMarker } from '../models/teacher.model';

interface SearchParams {
  lat: number;
  lng: number;
  radius?: number;
  subject_id?: number | null;
  grade_level_id?: number | null;
  min_rating?: number | null;
  max_price?: number | null;
  accepts_online?: boolean | null;
  page?: number;
  per_page?: number;
}

interface SearchResponse {
  success: boolean;
  data: Teacher[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    search_radius_km: number;
  };
}

@Injectable({ providedIn: 'root' })
export class TeacherSearchService {
  private readonly api = inject(ApiService);

  async searchNearby(params: SearchParams): Promise<SearchResponse> {
    return this.api.get<SearchResponse>('/v1/teachers/nearby', params);
  }

  async getMapMarkers(params: Pick<SearchParams, 'lat' | 'lng' | 'radius' | 'subject_id'>): Promise<MapMarker[]> {
    const response = await this.api.get<{ data: MapMarker[] }>('/v1/teachers/map-markers', params);
    return response.data;
  }

  async getTeacherProfile(id: number): Promise<Teacher> {
    const response = await this.api.get<{ data: Teacher }>(`/v1/teachers/${id}`);
    return response.data;
  }

  async getTeacherReviews(teacherId: number, page = 1): Promise<any> {
    return this.api.get(`/v1/teachers/${teacherId}/reviews`, { page });
  }

  async getTeacherAvailability(teacherId: number): Promise<any> {
    return this.api.get(`/v1/teachers/${teacherId}/availability`);
  }
}
```

### GeoLocation Service (Browser)

```typescript
// src/app/core/services/geo-location.service.ts

import { Injectable, signal } from '@angular/core';

interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

@Injectable({ providedIn: 'root' })
export class GeoLocationService {
  readonly currentPosition = signal<GeoPosition | null>(null);
  readonly permissionStatus = signal<'prompt' | 'granted' | 'denied'>('prompt');
  readonly isLocating = signal(false);
  readonly error = signal<string | null>(null);

  // Default to Cairo, Egypt
  private readonly defaultPosition: GeoPosition = {
    lat: 30.0444,
    lng: 31.2357,
    accuracy: 0,
  };

  async requestLocation(): Promise<GeoPosition> {
    if (!navigator.geolocation) {
      this.error.set('Geolocation is not supported by your browser');
      this.currentPosition.set(this.defaultPosition);
      return this.defaultPosition;
    }

    this.isLocating.set(true);
    this.error.set(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        });
      });

      const geoPos: GeoPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      this.currentPosition.set(geoPos);
      this.permissionStatus.set('granted');
      return geoPos;
    } catch (err: any) {
      let message = 'Unable to determine your location';
      switch (err.code) {
        case err.PERMISSION_DENIED:
          message = 'Location access denied. Please enable location services.';
          this.permissionStatus.set('denied');
          break;
        case err.POSITION_UNAVAILABLE:
          message = 'Location information unavailable.';
          break;
        case err.TIMEOUT:
          message = 'Location request timed out.';
          break;
      }
      this.error.set(message);
      this.currentPosition.set(this.defaultPosition);
      return this.defaultPosition;
    } finally {
      this.isLocating.set(false);
    }
  }

  /**
   * Watch position for continuous updates (e.g., moving user).
   */
  watchPosition(): number {
    return navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition.set({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 60000 }
    );
  }

  clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }
}
```

---

## 5. HTTP Interceptors

### Auth Interceptor

```typescript
// src/app/core/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../store/auth/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.token();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
  }

  return next(req);
};
```

### Error Interceptor

```typescript
// src/app/core/interceptors/error.interceptor.ts

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../../store/auth/auth.store';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          authStore.logout();
          break;
        case 403:
          notifications.error('You do not have permission to perform this action.');
          break;
        case 422:
          // Validation errors — let components handle them
          break;
        case 429:
          notifications.error('Too many requests. Please slow down.');
          break;
        case 500:
          notifications.error('Server error. Please try again later.');
          break;
      }
      return throwError(() => error);
    })
  );
};
```

### App Config

```typescript
// src/app/app.config.ts

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions()
    ),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
  ],
};
```

---

## 6. Map Component (Mapbox GL)

```typescript
// src/app/shared/components/map/map.component.ts

import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../../environments/environment';
import { MapMarker } from '../../../core/models/teacher.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper">
      <div #mapContainer class="map-container"></div>

      <!-- Map Controls Overlay -->
      <div class="map-controls">
        <button (click)="centerOnUser()" class="btn-locate" title="Center on my location">
          <span class="material-icons">my_location</span>
        </button>
        <div class="radius-control">
          <label>Radius: {{ radiusKm() }}km</label>
          <input
            type="range"
            [min]="1"
            [max]="50"
            [value]="radiusKm()"
            (input)="onRadiusChange($event)"
          />
        </div>
      </div>

      <!-- Selected Teacher Popup -->
      @if (selectedMarker()) {
        <div class="teacher-popup">
          <h4>{{ selectedMarker()!.first_name }} {{ selectedMarker()!.last_name }}</h4>
          <p>{{ selectedMarker()!.distance_km }}km away</p>
          <p>{{ selectedMarker()!.hourly_rate }} EGP/hr</p>
          <p>★ {{ selectedMarker()!.avg_rating }}</p>
          <button (click)="viewProfile.emit(selectedMarker()!.id)">View Profile</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .map-wrapper { position: relative; width: 100%; height: 100%; min-height: 400px; }
    .map-container { width: 100%; height: 100%; border-radius: 12px; }
    .map-controls {
      position: absolute; top: 12px; right: 12px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .btn-locate {
      width: 40px; height: 40px; border-radius: 50%;
      background: white; border: none; cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
    }
    .radius-control {
      background: white; padding: 8px 12px; border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .teacher-popup {
      position: absolute; bottom: 20px; left: 50%;
      transform: translateX(-50%);
      background: white; padding: 16px; border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 250px;
    }
  `],
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  // Inputs
  readonly markers = input<MapMarker[]>([]);
  readonly userLat = input<number>(30.0444);
  readonly userLng = input<number>(31.2357);
  readonly radius = input<number>(10000); // meters

  // Outputs
  readonly viewProfile = output<number>();
  readonly radiusChanged = output<number>();
  readonly mapMoved = output<{ lat: number; lng: number; zoom: number }>();

  // Internal state
  readonly selectedMarker = computed(() => {
    // Will be set by marker click
    return this._selectedMarker();
  });
  readonly radiusKm = computed(() => Math.round(this.radius() / 1000));

  private map!: mapboxgl.Map;
  private userMarker!: mapboxgl.Marker;
  private teacherMarkers: mapboxgl.Marker[] = [];
  private _selectedMarker = input<MapMarker | null>(null);

  constructor() {
    // React to marker data changes
    effect(() => {
      const currentMarkers = this.markers();
      if (this.map && currentMarkers) {
        this.renderTeacherMarkers(currentMarkers);
      }
    });
  }

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initializeMap(): void {
    (mapboxgl as any).accessToken = environment.mapboxToken;

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [this.userLng(), this.userLat()],
      zoom: 13,
    });

    this.map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    // Add user location marker
    this.userMarker = new mapboxgl.Marker({ color: '#4285F4' })
      .setLngLat([this.userLng(), this.userLat()])
      .addTo(this.map);

    // Draw radius circle
    this.map.on('load', () => {
      this.drawRadiusCircle();
    });

    // Emit map move events
    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      this.mapMoved.emit({
        lat: center.lat,
        lng: center.lng,
        zoom: this.map.getZoom(),
      });
    });
  }

  private renderTeacherMarkers(markers: MapMarker[]): void {
    // Clear existing markers
    this.teacherMarkers.forEach(m => m.remove());
    this.teacherMarkers = [];

    markers.forEach(teacher => {
      const el = document.createElement('div');
      el.className = teacher.is_featured ? 'marker-featured' : 'marker-teacher';
      el.style.cssText = `
        width: ${teacher.is_featured ? '40px' : '32px'};
        height: ${teacher.is_featured ? '40px' : '32px'};
        background: ${teacher.is_featured ? '#FFD700' : '#4CAF50'};
        border-radius: 50%;
        border: 3px solid white;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: bold; color: white;
      `;
      el.textContent = `${teacher.avg_rating}`;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([teacher.longitude, teacher.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <strong>${teacher.first_name} ${teacher.last_name}</strong><br>
              ${teacher.distance_km}km away<br>
              ${teacher.hourly_rate} EGP/hr<br>
              ★ ${teacher.avg_rating}<br>
              <button onclick="window.dispatchEvent(new CustomEvent('viewTeacher', {detail: ${teacher.id}}))"
                      style="margin-top:8px; padding:4px 12px; background:#1976D2; color:white; border:none; border-radius:4px; cursor:pointer;">
                View Profile
              </button>
            </div>
          `)
        )
        .addTo(this.map);

      this.teacherMarkers.push(marker);
    });
  }

  private drawRadiusCircle(): void {
    const radiusInKm = this.radius() / 1000;
    const center = [this.userLng(), this.userLat()] as [number, number];

    // Generate circle GeoJSON
    const points = 64;
    const coords = [];
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = radiusInKm * Math.cos(angle);
      const dy = radiusInKm * Math.sin(angle);
      const lat = center[1] + (dy / 111.32);
      const lng = center[0] + (dx / (111.32 * Math.cos(center[1] * (Math.PI / 180))));
      coords.push([lng, lat]);
    }
    coords.push(coords[0]); // close the circle

    if (this.map.getSource('radius-circle')) {
      (this.map.getSource('radius-circle') as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [coords] },
        properties: {},
      });
    } else {
      this.map.addSource('radius-circle', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [coords] },
          properties: {},
        },
      });
      this.map.addLayer({
        id: 'radius-circle-fill',
        type: 'fill',
        source: 'radius-circle',
        paint: {
          'fill-color': '#4285F4',
          'fill-opacity': 0.08,
        },
      });
      this.map.addLayer({
        id: 'radius-circle-border',
        type: 'line',
        source: 'radius-circle',
        paint: {
          'line-color': '#4285F4',
          'line-width': 2,
          'line-dasharray': [3, 2],
        },
      });
    }
  }

  centerOnUser(): void {
    this.map.flyTo({
      center: [this.userLng(), this.userLat()],
      zoom: 13,
      essential: true,
    });
  }

  onRadiusChange(event: Event): void {
    const km = +(event.target as HTMLInputElement).value;
    this.radiusChanged.emit(km * 1000);
  }
}
```

---

## 7. Booking Flow Component

```typescript
// src/app/features/booking/booking-create/booking-create.component.ts

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherSearchService } from '../../../core/services/teacher-search.service';
import { BookingService } from '../../../core/services/booking.service';
import { Teacher } from '../../../core/models/teacher.model';

type BookingStep = 'select-subject' | 'select-time' | 'select-location' | 'confirm' | 'payment';

@Component({
  selector: 'app-booking-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="booking-flow">
      <!-- Progress Steps -->
      <div class="steps">
        @for (step of steps; track step.key) {
          <div class="step" [class.active]="currentStep() === step.key" [class.completed]="isStepCompleted(step.key)">
            <span class="step-number">{{ $index + 1 }}</span>
            <span class="step-label">{{ step.label }}</span>
          </div>
        }
      </div>

      @if (teacher(); as t) {
        <div class="teacher-summary">
          <img [src]="t.avatar_url || '/assets/images/default-avatar.png'" [alt]="t.first_name" />
          <div>
            <h3>{{ t.first_name }} {{ t.last_name }}</h3>
            <p>★ {{ t.avg_rating }} · {{ t.total_reviews }} reviews</p>
          </div>
        </div>
      }

      <!-- Step Content -->
      @switch (currentStep()) {
        @case ('select-subject') {
          <div class="step-content">
            <h3>Select Subject & Grade</h3>
            <div class="subject-grid">
              @for (subject of teacherSubjects(); track subject.subject_id) {
                <button
                  class="subject-card"
                  [class.selected]="bookingForm.get('subject_id')?.value === subject.subject_id"
                  (click)="selectSubject(subject)"
                >
                  <span class="material-icons">{{ subject.icon }}</span>
                  <span>{{ subject.name }}</span>
                  <span class="price">{{ subject.effective_price }} EGP/hr</span>
                </button>
              }
            </div>
            <button class="btn-next" [disabled]="!bookingForm.get('subject_id')?.valid" (click)="nextStep()">
              Continue
            </button>
          </div>
        }
        @case ('select-time') {
          <div class="step-content">
            <h3>Choose Date & Time</h3>
            <input type="date" formControlName="date" [min]="minDate" />
            <div class="time-slots">
              @for (slot of availableSlots(); track slot.start) {
                <button
                  class="time-slot"
                  [class.selected]="selectedSlot()?.start === slot.start"
                  (click)="selectSlot(slot)"
                >
                  {{ slot.start }} - {{ slot.end }}
                </button>
              }
            </div>
            <div class="duration-select">
              <label>Duration</label>
              <select formControlName="duration_minutes">
                <option [value]="60">1 hour</option>
                <option [value]="90">1.5 hours</option>
                <option [value]="120">2 hours</option>
              </select>
            </div>
            <button class="btn-next" (click)="nextStep()">Continue</button>
          </div>
        }
        @case ('select-location') {
          <div class="step-content">
            <h3>Session Location</h3>
            <div class="location-options">
              <button
                class="location-option"
                [class.selected]="bookingForm.get('location_type')?.value === 'online'"
                (click)="bookingForm.patchValue({location_type: 'online'})"
              >
                <span class="material-icons">videocam</span>
                <span>Online Session</span>
              </button>
              <button
                class="location-option"
                [class.selected]="bookingForm.get('location_type')?.value === 'in_person'"
                (click)="bookingForm.patchValue({location_type: 'in_person'})"
              >
                <span class="material-icons">place</span>
                <span>In Person</span>
              </button>
              <button
                class="location-option"
                [class.selected]="bookingForm.get('location_type')?.value === 'teacher_location'"
                (click)="bookingForm.patchValue({location_type: 'teacher_location'})"
              >
                <span class="material-icons">school</span>
                <span>At Teacher's Location</span>
              </button>
            </div>
            @if (bookingForm.get('location_type')?.value === 'in_person') {
              <input type="text" formControlName="meeting_address" placeholder="Enter meeting address" />
            }
            <button class="btn-next" (click)="nextStep()">Continue</button>
          </div>
        }
        @case ('confirm') {
          <div class="step-content">
            <h3>Booking Summary</h3>
            <div class="summary-card">
              <div class="summary-row"><span>Subject:</span> <span>{{ selectedSubjectName() }}</span></div>
              <div class="summary-row"><span>Date:</span> <span>{{ bookingForm.get('date')?.value }}</span></div>
              <div class="summary-row"><span>Time:</span> <span>{{ selectedSlot()?.start }}</span></div>
              <div class="summary-row"><span>Duration:</span> <span>{{ bookingForm.get('duration_minutes')?.value }} min</span></div>
              <div class="summary-row"><span>Location:</span> <span>{{ bookingForm.get('location_type')?.value }}</span></div>
              <hr />
              <div class="summary-row total"><span>Total:</span> <span>{{ totalPrice() }} EGP</span></div>
            </div>
            <textarea formControlName="notes" placeholder="Any notes for the teacher (optional)"></textarea>
            <button class="btn-submit" [disabled]="isSubmitting()" (click)="submitBooking()">
              {{ isSubmitting() ? 'Booking...' : 'Confirm & Pay' }}
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class BookingCreateComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly teacherService = inject(TeacherSearchService);
  private readonly bookingService = inject(BookingService);

  readonly teacher = signal<Teacher | null>(null);
  readonly teacherSubjects = signal<any[]>([]);
  readonly availableSlots = signal<{ start: string; end: string }[]>([]);
  readonly selectedSlot = signal<{ start: string; end: string } | null>(null);
  readonly currentStep = signal<BookingStep>('select-subject');
  readonly isSubmitting = signal(false);

  readonly steps: { key: BookingStep; label: string }[] = [
    { key: 'select-subject', label: 'Subject' },
    { key: 'select-time', label: 'Date & Time' },
    { key: 'select-location', label: 'Location' },
    { key: 'confirm', label: 'Confirm' },
  ];

  readonly minDate = new Date().toISOString().split('T')[0];

  bookingForm!: FormGroup;

  readonly selectedSubjectName = computed(() => {
    const subjectId = this.bookingForm?.get('subject_id')?.value;
    return this.teacherSubjects().find(s => s.subject_id === subjectId)?.name || '';
  });

  readonly totalPrice = computed(() => {
    const subjectId = this.bookingForm?.get('subject_id')?.value;
    const duration = this.bookingForm?.get('duration_minutes')?.value || 60;
    const subject = this.teacherSubjects().find(s => s.subject_id === subjectId);
    const hourlyRate = subject?.effective_price || this.teacher()?.hourly_rate || 0;
    return Math.round(hourlyRate * (duration / 60));
  });

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      teacher_id: [null, Validators.required],
      subject_id: [null, Validators.required],
      grade_level_id: [null],
      date: [null, Validators.required],
      time: [null, Validators.required],
      duration_minutes: [60, [Validators.required, Validators.min(30)]],
      location_type: ['in_person', Validators.required],
      meeting_address: [''],
      notes: [''],
    });

    const teacherId = +this.route.snapshot.params['teacherId'];
    this.loadTeacher(teacherId);
  }

  private async loadTeacher(id: number): Promise<void> {
    const teacher = await this.teacherService.getTeacherProfile(id);
    this.teacher.set(teacher);
    this.bookingForm.patchValue({ teacher_id: teacher.id });
    // Load subjects this teacher offers
    // this.teacherSubjects.set(teacher.subjects);
  }

  selectSubject(subject: any): void {
    this.bookingForm.patchValue({
      subject_id: subject.subject_id,
      grade_level_id: subject.grade_level_id,
    });
  }

  selectSlot(slot: { start: string; end: string }): void {
    this.selectedSlot.set(slot);
    this.bookingForm.patchValue({ time: slot.start });
  }

  nextStep(): void {
    const stepOrder: BookingStep[] = ['select-subject', 'select-time', 'select-location', 'confirm'];
    const currentIndex = stepOrder.indexOf(this.currentStep());
    if (currentIndex < stepOrder.length - 1) {
      this.currentStep.set(stepOrder[currentIndex + 1]);
    }
  }

  isStepCompleted(step: BookingStep): boolean {
    const stepOrder: BookingStep[] = ['select-subject', 'select-time', 'select-location', 'confirm'];
    return stepOrder.indexOf(step) < stepOrder.indexOf(this.currentStep());
  }

  async submitBooking(): Promise<void> {
    if (this.bookingForm.invalid) return;

    this.isSubmitting.set(true);
    try {
      const booking = await this.bookingService.createBooking({
        ...this.bookingForm.value,
        scheduled_at: `${this.bookingForm.value.date}T${this.bookingForm.value.time}:00`,
        agreed_price: this.totalPrice(),
      });

      this.router.navigate(['/payments/checkout', booking.id]);
    } catch (err) {
      this.isSubmitting.set(false);
    }
  }
}
```

---

## 8. Models

```typescript
// src/app/core/models/user.model.ts

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'parent' | 'teacher';
  avatar_url?: string;
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
}

export interface TeacherProfile extends User {
  teacher_profile: {
    id: number;
    bio: string;
    hourly_rate: number;
    currency: string;
    experience_years: number;
    avg_rating: number;
    total_reviews: number;
    verification_status: string;
    is_featured: boolean;
    accepts_online: boolean;
    accepts_in_person: boolean;
  };
}
```

```typescript
// src/app/core/models/teacher.model.ts

export interface Teacher {
  id: number;
  teacher_profile_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  hourly_rate: number;
  currency: string;
  avg_rating: number;
  total_reviews: number;
  total_bookings: number;
  experience_years: number;
  is_featured: boolean;
  accepts_online: boolean;
  accepts_in_person: boolean;
  city: string;
  governorate: string;
  distance_km: number;
  subjects?: TeacherSubject[];
}

export interface TeacherSubject {
  subject_id: number;
  subject_name: string;
  grade_level_id: number;
  grade_level_name: string;
  effective_price: number;
}

export interface MapMarker {
  id: number;
  first_name: string;
  last_name: string;
  hourly_rate: number;
  avg_rating: number;
  is_featured: boolean;
  latitude: number;
  longitude: number;
  distance_km: number;
}

export interface TeacherSearchFilters {
  radius: number;
  subjectId: number | null;
  gradeLevelId: number | null;
  minRating: number | null;
  maxPrice: number | null;
  acceptsOnline: boolean | null;
}
```

```typescript
// src/app/core/models/booking.model.ts

export interface Booking {
  id: number;
  reference: string;
  parent_id: number;
  teacher_id: number;
  subject_id: number;
  subject_name?: string;
  teacher_name?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: BookingStatus;
  location_type: 'online' | 'in_person' | 'teacher_location';
  meeting_address?: string;
  meeting_link?: string;
  agreed_price: number;
  currency: string;
  notes?: string;
  created_at: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'disputed';
```

```typescript
// src/app/core/models/api-response.model.ts

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}
```

---

## 9. Environment Configuration

```typescript
// src/environments/environment.ts

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  mapboxToken: 'YOUR_MAPBOX_DEV_TOKEN',
  stripePublicKey: 'pk_test_...',
  paymobIframeId: 'PAYMOB_IFRAME_ID',
  sentryDsn: '',
};
```

```typescript
// src/environments/environment.production.ts

export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',
  mapboxToken: 'YOUR_MAPBOX_PROD_TOKEN',
  stripePublicKey: 'pk_live_...',
  paymobIframeId: 'PAYMOB_PROD_IFRAME_ID',
  sentryDsn: 'https://xxx@sentry.io/yyy',
};
```
