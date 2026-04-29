import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8">
          {!submitted ? (
            <>
              <h1 className="text-2xl font-semibold text-slate-900">
                Reset your password
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                We will send a reset link to your email.
              </p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmitted(true);
                }}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#185FA5] px-4 py-3 text-sm font-semibold text-white"
                >
                  Send reset link
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold text-slate-900">
                Check your email
              </h1>
              <p className="text-sm text-slate-500">
                Reset link sent. Follow the instructions to update your
                password.
              </p>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="font-semibold text-[#185FA5]">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
