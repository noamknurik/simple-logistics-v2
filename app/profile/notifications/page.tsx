'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import { MobileHeader } from '@/components/MobileHeader';

type Prefs = { new_order_assigned: boolean; daily_summary: boolean };

const DEFAULT_PREFS: Prefs = { new_order_assigned: true, daily_summary: false };

export default function NotificationsPage() {
  const { loading, member } = useCurrentMember();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (member) {
      setPrefs({ ...DEFAULT_PREFS, ...((member as any).notification_prefs ?? {}) });
    }
  }, [member]);

  async function toggle(key: keyof Prefs) {
    if (!member) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    const supabase = createClient();
    await supabase.from('org_members').update({ notification_prefs: next }).eq('id', member.id);
    setSaving(false);
  }

  if (loading || !member) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <MobileHeader title="Notifications" back />
      <div className="px-5 py-4">
        <p className="mb-5 text-sm text-gray-500">Choose what you want to hear about. These only affect notifications to you.</p>

        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          <label className="flex cursor-pointer items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold">New order assigned</p>
              <p className="text-xs text-gray-400">When an order is ready for you to document.</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.new_order_assigned}
              onChange={() => toggle('new_order_assigned')}
              className="h-5 w-5 accent-brand-red"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold">Daily summary</p>
              <p className="text-xs text-gray-400">A recap of what you documented each day.</p>
            </div>
            <input
              type="checkbox"
              checked={prefs.daily_summary}
              onChange={() => toggle('daily_summary')}
              className="h-5 w-5 accent-brand-red"
            />
          </label>
        </div>
        {saving && <p className="mt-2 text-xs text-gray-400">Saving…</p>}
      </div>
    </div>
  );
}
