import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/auth.store';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const registerSchema = z
  .object({
    first_name: z.string().min(2, 'First name is required'),
    last_name: z.string().min(2, 'Last name is required'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
    role: z.enum(['parent', 'teacher'], { message: 'Please select a role' }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const defaultRole = searchParams.get('role') as 'parent' | 'teacher' | null;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole || 'parent',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      navigate(data.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/parent');
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="w-full max-w-lg px-6 py-8">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <svg width="39" height="28" viewBox="0 0 39 28" fill="none">
            <circle cx="25" cy="14" r="14" fill="#393939" />
            <circle cx="14" cy="14" r="14" fill="#D9D9D9" />
          </svg>
          <span className="font-['Poppins'] font-semibold text-[20px] text-white">Utopia</span>
        </Link>
        <h1 className="font-['Source_Sans_Pro'] font-bold text-3xl text-white mb-2">
          {t('auth.createAccount')}
        </h1>
        <p className="text-gray-400 font-['Poppins']">{t('auth.joinCommunity')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
            <button onClick={clearError} className="float-right text-red-400 hover:text-red-300">
              &times;
            </button>
          </div>
        )}

        {/* Role Selection */}
        <div>
          <label className="block text-gray-300 text-sm font-['Poppins'] mb-2">{t('auth.iAmA')}</label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition font-['Poppins'] ${
                selectedRole === 'parent'
                  ? 'border-white bg-white/10 text-white'
                  : 'border-gray-600 text-gray-400 hover:border-gray-400'
              }`}
            >
              <input {...register('role')} type="radio" value="parent" className="hidden" />
              <span>🎓 {t('auth.parentStudent')}</span>
            </label>
            <label
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition font-['Poppins'] ${
                selectedRole === 'teacher'
                  ? 'border-white bg-white/10 text-white'
                  : 'border-gray-600 text-gray-400 hover:border-gray-400'
              }`}
            >
              <input {...register('role')} type="radio" value="teacher" className="hidden" />
              <span>📚 {t('auth.teacher')}</span>
            </label>
          </div>
          {errors.role && <p className="mt-1 text-red-400 text-xs">{errors.role.message}</p>}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-300 text-sm font-['Poppins'] mb-2">{t('auth.firstName')}</label>
            <input
              {...register('first_name')}
              className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition font-['Poppins']"
              placeholder={t('auth.firstNamePlaceholder')}
            />
            {errors.first_name && (
              <p className="mt-1 text-red-400 text-xs">{errors.first_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-['Poppins'] mb-2">{t('auth.lastName')}</label>
            <input
              {...register('last_name')}
              className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition font-['Poppins']"
              placeholder={t('auth.lastNamePlaceholder')}
            />
            {errors.last_name && (
              <p className="mt-1 text-red-400 text-xs">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-300 text-sm font-['Poppins'] mb-2">{t('auth.emailAddress')}</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition font-['Poppins']"
            placeholder={t('auth.emailPlaceholder')}
          />
          {errors.email && (
            <p className="mt-1 text-red-400 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-300 text-sm font-['Poppins'] mb-2">
            {t('auth.phone')} <span className="text-gray-600">({t('auth.optional')})</span>
          </label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition font-['Poppins']"
            placeholder={t('auth.phonePlaceholder')}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-300 text-sm font-['Poppins'] mb-2">{t('auth.password')}</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition font-['Poppins'] pr-12"
              placeholder={t('auth.minPasswordPlaceholder')}
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
            className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition font-['Poppins']"
            placeholder={t('auth.repeatPassword')}
          />
          {errors.password_confirmation && (
            <p className="mt-1 text-red-400 text-xs">{errors.password_confirmation.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-white text-[#131313] font-['Poppins'] font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400 font-['Poppins'] text-sm">
        {t('auth.hasAccount')}{' '}
        <Link to="/auth/login" className="text-white hover:underline">
          {t('auth.signInLink')}
        </Link>
      </p>
    </div>
  );
}
