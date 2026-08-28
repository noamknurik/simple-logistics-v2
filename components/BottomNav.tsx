'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/find-order', label: 'Find Order', icon: '🔍' },
  { href: '/recent', label: 'Recent', icon: '🕘' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-md justify-around py-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 text-xs font-medium ${
                active ? 'text-brand-red' : 'text-gray-500'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
