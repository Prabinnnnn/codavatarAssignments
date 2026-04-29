import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    const ok = login(values.email, values.password);
    if (!ok) {
      showToast('Invalid credentials', 'error');
      return;
    }
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to manage your saved events.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Password
              </label>
              <div className="mt-2 flex items-center rounded-lg border border-slate-200 px-3 py-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#185FA5]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#185FA5] px-4 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </button>

            <button
              type="button"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            No account yet?{' '}
            <Link to="/signup" className="font-semibold text-[#185FA5]">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
