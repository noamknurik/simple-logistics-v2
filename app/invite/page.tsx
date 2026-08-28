'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';

export default function AcceptInvitePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
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
    const { error: updateErr } = await supabase.auth.updateUser({
      password,
      data: { full_name: fullName },
    });
    if (updateErr) {
      setLoading(false);
      return setError(updateErr.message);
    }

    const res = await fetch('/api/accept-invite', { method: 'POST' });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) return setError(body.error ?? 'Something went wrong.');

    router.push(body.role === 'admin' ? '/admin' : '/find-order');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <p className="mb-1 text-xs font-semibold tracking-wide text-brand-red">YOU&apos;RE INVITED</p>
        <h2 className="mb-6 text-xl font-bold">Accept your invitation</h2>
        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red">{error}</div>}
        <label className="label" htmlFor="fullName">Full Name</label>
        <input id="fullName" required className="input mb-4" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <label className="label" htmlFor="password">Create Password</label>
        <input id="password" type="password" required className="input mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label className="label" htmlFor="confirm">Confirm Password</label>
        <input id="confirm" type="password" required className="input mb-6" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account…' : 'Create Account & Continue'}
        </button>
      </form>
    </div>
  );
}
