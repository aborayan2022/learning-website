import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../core/services/auth.service';
import { Eye, EyeOff, Loader2, CheckCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Rate limiting: track attempts
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    // Check if locked
    if (lockedUntil && Date.now() < lockedUntil) {
      const timeout = setTimeout(() => setLockedUntil(null), lockedUntil - Date.now());
      return () => clearTimeout(timeout);
    }
  }, [lockedUntil]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  // Invalid link — no token or email
  if (!token || !email) {
    return (
      <div className="w-full max-w-md px-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="font-['Source_Sans_Pro'] font-bold text-2xl text-white mb-2">
          {t('auth.resetPassword')}
        </h1>
        <p className="text-gray-400 font-['Poppins'] mb-6">
          {t('auth.invalidResetLink')}
        </p>
        <Link
          to="/auth/forgot-password"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#131313] rounded-lg font-['Poppins'] font-semibold hover:bg-gray-100 transition"
        >
          {t('auth.sendResetLink')}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md px-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="font-['Source_Sans_Pro'] font-bold text-2xl text-white mb-2">
          {t('auth.resetSuccess')}
        </h1>
        <p className="text-gray-400 font-['Poppins'] mb-6">
          {t('auth.resetSuccessMessage')}
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#131313] rounded-lg font-['Poppins'] font-semibold hover:bg-gray-100 transition"
        >
          {t('auth.signIn')}
        </Link>
      </div>
    );
  }

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const onSubmit = async (data: ResetFormData) => {
    // Client-side rate limiting
    if (isLocked) return;
    if (attempts >= 5) {
      setLockedUntil(Date.now() + 60_000); // Lock for 1 minute
      setError('Too many attempts. Please wait 1 minute.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAttempts((prev) => prev + 1);

    try {
      await authService.resetPassword({
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError?.response?.data?.message || 'Failed to reset password. The link may have expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <svg width="39" height="28" viewBox="0 0 39 28" fill="none">
            <circle cx="25" cy="14" r="14" fill="#393939" />
            <circle cx="14" cy="14" r="14" fill="#D9D9D9" />
          </svg>
          <span className="font-['Poppins'] font-semibold text-[20px] text-white">Utopia</span>
        </Link>
        <h1 className="font-['Source_Sans_Pro'] font-bold text-3xl text-white mb-2">
          {t('auth.resetPassword')}
        </h1>
        <p className="text-gray-400 font-['Poppins']">
          {t('auth.resetPasswordSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* New Password */}
        <div>
          <label className="block text-gray-300 text-sm font-['Poppins'] mb-2">
            {t('auth.newPassword')}
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.newPasswordPlaceholder')}
              className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition font-['Poppins'] pr-12"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-red-400 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-gray-300 text-sm font-['Poppins'] mb-2">
            {t('auth.confirmPassword')}
          </label>
          <input
            {...register('password_confirmation')}
            type="password"
            placeholder={t('auth.repeatPassword')}
            className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition font-['Poppins']"
            autoComplete="new-password"
          />
          {errors.password_confirmation && (
            <p className="mt-1 text-red-400 text-xs">
              {errors.password_confirmation.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || isLocked}
          className="w-full py-3 bg-white text-[#131313] font-['Poppins'] font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {isLoading ? t('auth.resetting') : t('auth.resetNow')}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="text-gray-400 hover:text-white transition font-['Poppins'] text-sm flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  );
}
