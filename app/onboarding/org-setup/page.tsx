'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';

const COLORS = ['#E31E24', '#F97316', '#F59E0B', '#22C55E', '#14B8A6', '#3B82F6', '#8B5CF6', '#111827'];

export default function OrgSetupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/onboarding/create-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, logoUrl, primaryColor: color, showPoweredBy }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) return setError(body.error);
    router.push('/admin');
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/3 flex-col justify-between bg-brand-navy p-10 text-white lg:flex">
        <Logo dark />
        <div>
          <h1 className="text-2xl font-bold">Let&apos;s set up your organization.</h1>
          <p className="mt-3 text-sm text-white/60">
            This information personalizes your Simple Logistics experience — you can change it anytime.
          </p>
        </div>
        <div />
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <h2 className="mb-1 text-2xl font-bold">Organization Setup</h2>
          <p className="mb-6 text-sm text-gray-500">Customize your organization profile.</p>
          {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red">{error}</div>}

          <label className="label" htmlFor="name">Organization Name</label>
          <input id="name" required className="input mb-5" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. GVA Brands" />

          <label className="label" htmlFor="logoUrl">Logo URL (optional)</label>
          <input id="logoUrl" className="input mb-5" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…" />

          <label className="label">Primary Brand Color</label>
          <div className="mb-5 flex gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className="h-9 w-9 rounded-full border-2"
                style={{ backgroundColor: c, borderColor: color === c ? '#111827' : 'transparent' }}
                aria-label={c}
              />
            ))}
          </div>

          <label className="mb-6 flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <span className="text-sm">
              <span className="block font-medium">Powered by Simple Logistics</span>
              <span className="text-gray-500">Show attribution in your portal&apos;s footer.</span>
            </span>
            <input type="checkbox" checked={showPoweredBy} onChange={(e) => setShowPoweredBy(e.target.checked)} className="h-5 w-5 accent-brand-red" />
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving…' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
