import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { AuthGuard } from './core/guards/AuthGuard';
import { GuestGuard } from './core/guards/GuestGuard';
import { RoleGuard } from './core/guards/RoleGuard';
import LoadingSpinner from './components/shared/LoadingSpinner';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { Toaster } from 'sonner';

// Lazy-loaded pages
const HomePage = lazy(() => import('../imports/HomePage'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage'));
const TeacherSearchPage = lazy(() => import('./features/teachers/TeacherSearchPage'));
const TeacherProfilePage = lazy(() => import('./features/teachers/TeacherProfilePage'));
const BookingCreatePage = lazy(() => import('./features/bookings/BookingCreatePage'));
const BookingListPage = lazy(() => import('./features/bookings/BookingListPage'));
const BookingDetailPage = lazy(() => import('./features/bookings/BookingDetailPage'));
const ParentDashboard = lazy(() => import('./features/dashboard/parent/ParentDashboard'));
const TeacherDashboard = lazy(() => import('./features/dashboard/teacher/TeacherDashboard'));
const AdminDashboard = lazy(() => import('./features/dashboard/admin/AdminDashboard'));
const SubscriptionPlansPage = lazy(() => import('./features/subscriptions/SubscriptionPlansPage'));
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage'));
const PaymentPage = lazy(() => import('./features/payment/PaymentPage'));
const NotFoundPage = lazy(() => import('./features/not-found/NotFoundPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
const AboutPage = lazy(() => import('./features/about/AboutPage'));
const HelpPage = lazy(() => import('./features/help/HelpPage'));
const ContactPage = lazy(() => import('./features/contact/ContactPage'));
const PrivacyPage = lazy(() => import('./features/legal/PrivacyPage'));
const TermsPage = lazy(() => import('./features/legal/TermsPage'));

function Fallback() {
  return <LoadingSpinner fullPage text="Loading..." />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Fallback />}>
          <Routes>
            {/* ── Home page (self-contained Figma export – has its own navbar) ── */}
            <Route path="/" element={<HomePage />} />

          {/* ── Public routes with MainLayout ── */}
          <Route element={<MainLayout />}>
            <Route path="/teachers" element={<TeacherSearchPage />} />
            <Route path="/teachers/:id" element={<TeacherProfilePage />} />
            <Route path="/plans" element={<SubscriptionPlansPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>

          {/* ── Auth routes (guest only) ── */}
          <Route element={<GuestGuard><AuthLayout /></GuestGuard>}>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* ── Protected routes with MainLayout ── */}
          <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* Payment */}
            <Route path="/payment" element={<PaymentPage />} />

            {/* Bookings */}
            <Route path="/bookings" element={<BookingListPage />} />
            <Route path="/bookings/:id" element={<BookingDetailPage />} />
            <Route path="/bookings/create/:teacherId" element={<BookingCreatePage />} />

            {/* Parent Dashboard */}
            <Route
              path="/dashboard/parent"
              element={
                <RoleGuard roles={['parent']}>
                  <ParentDashboard />
                </RoleGuard>
              }
            />

            {/* Teacher Dashboard */}
            <Route
              path="/dashboard/teacher"
              element={
                <RoleGuard roles={['teacher']}>
                  <TeacherDashboard />
                </RoleGuard>
              }
            />

            {/* Admin Dashboard */}
            <Route
              path="/admin/*"
              element={
                <RoleGuard roles={['admin']}>
                  <AdminDashboard />
                </RoleGuard>
              }
            />
          </Route>

          {/* Catch-all → 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
    </ErrorBoundary>
  );
}
