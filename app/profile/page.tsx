'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';

export default function ProfilePage() {
  const router = useRouter();
  const { loading, member, org, userEmail } = useCurrentMember();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading || !member || !org) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  const initials = (member.full_name ?? userEmail).slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-white pb-24">
      <MobileHeader title="Profile" />
      <div className="px-5 pt-4">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-brand-navy text-2xl font-bold text-white">
            {initials}
          </div>
          <p className="text-lg font-bold">{member.full_name ?? 'Unnamed User'}</p>
          <p className="text-sm text-gray-500">{userEmail}</p>
          <span className="mt-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-600">
            {member.role === 'admin' ? 'Admin' : 'Warehouse'}
          </span>
        </div>

        <div className="mb-5 divide-y divide-gray-100 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between p-4 text-sm">
            <span className="text-gray-400">Organization</span>
            <span className="font-medium">{org.name}</span>
          </div>
          {member.employee_id && (
            <div className="flex items-center justify-between p-4 text-sm">
              <span className="text-gray-400">Employee ID</span>
              <span className="font-medium">{member.employee_id}</span>
            </div>
          )}
        </div>

        <div className="mb-6 divide-y divide-gray-100 rounded-xl border border-gray-100">
          <button onClick={() => router.push('/profile/edit')} className="flex w-full items-center justify-between p-4 text-left text-sm font-medium">
            Edit Profile <span className="text-gray-300">&rsaquo;</span>
          </button>
          <button onClick={() => router.push('/profile/notifications')} className="flex w-full items-center justify-between p-4 text-left text-sm font-medium">
            Notifications <span className="text-gray-300">&rsaquo;</span>
          </button>
          {member.role === 'admin' && (
            <button onClick={() => router.push('/admin')} className="flex w-full items-center justify-between p-4 text-left text-sm font-medium">
              Admin Dashboard <span className="text-gray-300">&rsaquo;</span>
            </button>
          )}
        </div>

        <button onClick={handleSignOut} className="btn-outline w-full !border-red-200 !text-brand-red">
          Sign Out
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
