'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8">
        <div className="mb-6 flex justify-center"><Logo /></div>
        {sent ? (
          <div className="text-center">
            <h2 className="mb-2 text-xl font-bold">Check your email</h2>
            <p className="mb-6 text-sm text-gray-500">
              We sent a password reset link to <strong>{email}</strong>. It expires in 60 minutes.
            </p>
            <Link href="/login" className="text-sm font-medium text-brand-red">&lsaquo; Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="mb-1 text-xl font-bold">Forgot your password?</h2>
            <p className="mb-6 text-sm text-gray-500">
              Enter your email and we&apos;ll send you a link to reset it.
            </p>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red">{error}</div>}
            <label className="label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              className="input mb-6"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm font-medium text-brand-red">&lsaquo; Back to Sign In</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
