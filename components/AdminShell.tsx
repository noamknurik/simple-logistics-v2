'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from './Logo';
import type { Org, OrgMember } from '@/lib/types';

const NAV = [
  { href: '/admin', label: 'Overview', icon: '📊', exact: true },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/import', label: 'Import', icon: '⬆️' },
  { href: '/admin/reports', label: 'Reports', icon: '📈' },
  { href: '/admin/employees', label: 'Employees', icon: '👥' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export function AdminShell({
  org,
  member,
  userEmail,
  children,
}: {
  org: Org;
  member: OrgMember;
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="border-b border-gray-100 px-5 py-5">
          <Logo size={24} />
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? 'bg-red-50 text-brand-red' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-100 p-3">
          <Link href="/find-order" className="mb-1 block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            📷 Warehouse App
          </Link>
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold">{member.full_name ?? userEmail}</p>
            <p className="truncate text-xs text-gray-400">{org.name}</p>
          </div>
          <button onClick={handleSignOut} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-500 hover:bg-gray-50">
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col md:pl-60">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <Logo size={20} />
          <button onClick={handleSignOut} className="text-xs font-medium text-gray-500">
            Sign Out
          </button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 md:hidden">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  active ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
