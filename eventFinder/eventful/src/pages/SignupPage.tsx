import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

const schema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    signup(values);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Join Eventful to save and register for events.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  First name
                </label>
                <input
                  {...register('firstName')}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Last name
                </label>
                <input
                  {...register('lastName')}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

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
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Confirm password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#185FA5] px-4 py-3 text-sm font-semibold text-white"
            >
              Create account
            </button>

            <button
              type="button"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#185FA5]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
