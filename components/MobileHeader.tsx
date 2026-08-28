'use client';

import { useRouter } from 'next/navigation';
import { Logo } from './Logo';

export function MobileHeader({ title, back }: { title?: string; back?: boolean }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
      {back ? (
        <button onClick={() => router.back()} className="text-sm font-medium text-gray-600">
          &lsaquo; Back
        </button>
      ) : (
        <Logo size={22} />
      )}
      {title && <span className="text-[15px] font-semibold">{title}</span>}
      <span className="w-8" />
    </header>
  );
}
