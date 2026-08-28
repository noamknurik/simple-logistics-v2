'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';

const TABS = ['General', 'Branding', 'Photo Storage', 'Integrations'] as const;
type Tab = (typeof TABS)[number];

const RETENTION_OPTIONS = [
  { value: null, label: 'Forever (recommended)' },
  { value: 365, label: '1 year' },
  { value: 180, label: '6 months' },
  { value: 90, label: '90 days' },
];

export default function SettingsPage() {
  const { org } = useCurrentMember();
  const [tab, setTab] = useState<Tab>('General');

  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#E31E24');
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [retention, setRetention] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (org) {
      setName(org.name);
      setPrimaryColor(org.primary_color);
      setShowPoweredBy(org.show_powered_by);
      setRetention(org.photo_retention_days);
    }
  }, [org]);

  async function save(fields: Record<string, any>) {
    if (!org) return;
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    await supabase.from('orgs').update(fields).eq('id', org.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!org) return <p className="text-gray-400">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Settings</h1>
      <p className="mb-6 text-sm text-gray-500">Organization-wide configuration.</p>

      <div className="mb-6 flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {saved && <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Saved.</div>}

      {tab === 'General' && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="label">Organization Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="label">Organization Slug</label>
            <div className="input bg-gray-50 text-gray-400">{org.slug}</div>
            <p className="mt-1.5 text-xs text-gray-400">Used internally — not shown to customers.</p>
          </div>
          <button className="btn-primary !px-4 !py-2 text-sm" disabled={saving} onClick={() => save({ name })}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {tab === 'Branding' && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="label">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-14 rounded border border-gray-200" />
              <input className="input flex-1" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">Used for buttons and status highlights across the app.</p>
          </div>
          <label className="mb-4 flex items-center gap-2.5 text-sm">
            <input type="checkbox" checked={showPoweredBy} onChange={(e) => setShowPoweredBy(e.target.checked)} className="h-4 w-4 accent-brand-red" />
            Show "Powered by Simple Logistics" on shared pages
          </label>
          <button className="btn-primary !px-4 !py-2 text-sm" disabled={saving} onClick={() => save({ primary_color: primaryColor, show_powered_by: showPoweredBy })}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {tab === 'Photo Storage' && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="label">How long should photos stay in Simple Logistics?</label>
          <p className="mb-3 text-xs text-gray-400">
            Photos are proof of what left the warehouse — kept forever by default so they're available whenever a dispute comes up, even
            months later. Set a limit only if storage cost matters more than long-term coverage for your org.
          </p>
          <div className="mb-4 space-y-2">
            {RETENTION_OPTIONS.map((opt) => (
              <label key={String(opt.value)} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 p-3 text-sm has-[:checked]:border-brand-red has-[:checked]:bg-red-50">
                <input
                  type="radio"
                  name="retention"
                  checked={retention === opt.value}
                  onChange={() => setRetention(opt.value)}
                  className="h-4 w-4 accent-brand-red"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <button className="btn-primary !px-4 !py-2 text-sm" disabled={saving} onClick={() => save({ photo_retention_days: retention })}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {tab === 'Integrations' && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
            <div>
              <p className="text-sm font-semibold">ShipStation</p>
              <p className="text-xs text-gray-400">Automatic order sync. Planned for a later phase — use CSV import for now.</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">Coming Soon</span>
          </div>
        </div>
      )}
    </div>
  );
}
