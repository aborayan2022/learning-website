import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/auth.store';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const returnUrl = (location.state as { returnUrl?: string })?.returnUrl;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const redirectPath = await login(data.email, data.password);
      navigate(returnUrl || redirectPath);
    } catch {
      // Error is handled in store
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
          Welcome Back
        </h1>
        <p className="text-gray-400 font-['Poppins']">
          Sign in to continue your learning journey
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
            <button onClick={clearError} className="float-right text-red-400 hover:text-red-300">
              &times;
            </button>
          </div>
        )}

        <div>
          <label className="block text-gray-300 text-sm font-['Poppins'] mb-2">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition font-['Poppins']"
          />
          {errors.email && (
            <p className="mt-1 text-red-400 text-xs">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-['Poppins'] mb-2">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition font-['Poppins'] pr-12"
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
            <input type="checkbox" className="rounded border-gray-600" />
            Remember me
          </label>
          <Link
            to="/auth/forgot-password"
            className="text-gray-400 text-sm hover:text-white transition"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-white text-[#131313] font-['Poppins'] font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-8 text-center text-gray-400 font-['Poppins'] text-sm">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-white hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
