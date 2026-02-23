import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../core/services/auth.service';
import { useState } from 'react';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md px-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="font-['Source_Sans_Pro'] font-bold text-2xl text-white mb-2">
          Check Your Email
        </h1>
        <p className="text-gray-400 font-['Poppins'] mb-6">
          We've sent a password reset link to your email address.
        </p>
        <Link
          to="/auth/login"
          className="text-white hover:underline font-['Poppins'] flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-6">
      <div className="text-center mb-8">
        <h1 className="font-['Source_Sans_Pro'] font-bold text-3xl text-white mb-2">
          Forgot Password?
        </h1>
        <p className="text-gray-400 font-['Poppins']">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-gray-300 text-sm font-['Poppins'] mb-2">Email Address</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition font-['Poppins']"
          />
          {errors.email && <p className="mt-1 text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-white text-[#131313] font-['Poppins'] font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="text-gray-400 hover:text-white transition font-['Poppins'] text-sm flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </p>
    </div>
  );
}
