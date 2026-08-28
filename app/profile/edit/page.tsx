'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import { MobileHeader } from '@/components/MobileHeader';

export default function EditProfilePage() {
  const router = useRouter();
  const { loading, member, userEmail } = useCurrentMember();
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFullName(member.full_name ?? '');
      setEmployeeId(member.employee_id ?? '');
    }
  }, [member]);

  async function handleSave() {
    if (!member) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const supabase = createClient();
    const { error: updateErr } = await supabase
      .from('org_members')
      .update({ full_name: fullName.trim() || null, employee_id: employeeId.trim() || null })
      .eq('id', member.id);
    setSaving(false);
    if (updateErr) {
      setError(updateErr.message);
      return;
    }
    setSaved(true);
  }

  if (loading || !member) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <MobileHeader title="Edit Profile" back />
      <div className="px-5 py-4">
        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red">{error}</div>}
        {saved && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Profile updated.</div>}

        <div className="mb-4">
          <label className="label" htmlFor="fullName">Full Name</label>
          <input id="fullName" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="mb-4">
          <label className="label" htmlFor="employeeId">Employee ID</label>
          <input id="employeeId" className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
        </div>

        <div className="mb-6">
          <label className="label">Email</label>
          <div className="input bg-gray-50 text-gray-400">{userEmail}</div>
        </div>

        <div className="mb-6">
          <label className="label">Role</label>
          <div className="input bg-gray-50 capitalize text-gray-400">{member.role === 'admin' ? 'Admin' : 'Warehouse'}</div>
          <p className="mt-1.5 text-xs text-gray-400">Only an admin can change your role.</p>
        </div>

        <button className="btn-primary mb-3 w-full" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button className="btn-outline w-full" onClick={() => router.push('/forgot-password')}>
          Change Password
        </button>
      </div>
    </div>
  );
}
