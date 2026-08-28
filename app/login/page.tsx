'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'no-org'
      ? 'Your account isn’t linked to an organization yet. Contact an admin for an invite.'
      : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setError('Incorrect email or password.');
      setLoading(false);
      return;
    }

    const { data: member } = await supabase
      .from('org_members')
      .select('role')
      .eq('user_id', data.user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!member) {
      router.push('/login?error=no-org');
      setLoading(false);
      return;
    }

    router.push(member.role === 'admin' ? '/admin' : '/find-order');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-brand-navy p-12 text-white lg:flex">
        <Logo dark size={32} />
        <div>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight">
            Proof of what left the warehouse.
          </h1>
          <p className="max-w-sm text-white/70">
            Simple Logistics documents every shipment so your team has an answer, instantly, whenever
            a dispute comes in.
          </p>
        </div>
        <p className="text-sm text-white/40">Secure sign-in. Your data is protected.</p>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="mb-1 text-2xl font-bold">Welcome back</h2>
          <p className="mb-6 text-sm text-gray-500">Sign in to your Simple Logistics account</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red">{error}</div>
          )}

          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            className="input mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />

          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            className="input mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mb-6 text-right">
            <Link href="/forgot-password" className="text-sm font-medium text-brand-red">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
