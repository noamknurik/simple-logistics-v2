'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import type { OrgMember, OrgRole } from '@/lib/types';

export default function EmployeesPage() {
  const { org, member: currentMember } = useCurrentMember();
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('warehouse');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  async function refresh() {
    if (!org) return;
    const supabase = createClient();
    const { data } = await supabase.from('org_members').select('*').eq('org_id', org.id).order('created_at', { ascending: true });
    setMembers(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError(null);
    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), fullName: inviteName.trim(), role: inviteRole }),
    });
    const body = await res.json();
    setInviting(false);
    if (!res.ok) {
      setInviteError(body.error ?? 'Could not send invite.');
      return;
    }
    setInviteSuccess(true);
    setInviteEmail('');
    setInviteName('');
    setInviteRole('warehouse');
  }

  async function toggleActive(m: OrgMember) {
    if (m.id === currentMember?.id) return;
    const supabase = createClient();
    await supabase.from('org_members').update({ is_active: !m.is_active }).eq('id', m.id);
    refresh();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-gray-500">Everyone with access to this organization.</p>
        </div>
        <button className="btn-primary !px-4 !py-2 text-sm" onClick={() => setShowInvite((s) => !s)}>
          {showInvite ? 'Cancel' : '+ Invite Employee'}
        </button>
      </div>

      {showInvite && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          {inviteError && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{inviteError}</div>}
          {inviteSuccess && <div className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Invite sent.</div>}
          <form onSubmit={handleInvite} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Full Name</label>
              <input className="input" required value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as OrgRole)}>
                <option value="warehouse">Warehouse</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn-primary w-full !py-2.5 text-sm" disabled={inviting}>
                {inviting ? 'Sending…' : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-medium">{m.full_name ?? '(pending — no name set yet)'}</td>
                <td className="px-4 py-3 capitalize text-gray-600">{m.role}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {m.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {m.id !== currentMember?.id && (
                    <button onClick={() => toggleActive(m)} className="text-xs font-medium text-gray-400 hover:text-brand-red">
                      {m.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No employees yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
