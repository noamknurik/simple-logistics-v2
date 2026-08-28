'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords don’t match.');

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) return setError(err.message);
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <h2 className="mb-1 text-xl font-bold">Set a new password</h2>
        <p className="mb-6 text-sm text-gray-500">Create a new password for your Simple Logistics account.</p>
        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red">{error}</div>}
        <label className="label" htmlFor="password">New Password</label>
        <input id="password" type="password" required className="input mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label className="label" htmlFor="confirm">Confirm New Password</label>
        <input id="confirm" type="password" required className="input mb-6" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Saving…' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
