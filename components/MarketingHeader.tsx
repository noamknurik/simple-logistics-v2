import Link from 'next/link';
import { Logo } from '@/components/Logo';

const nav = [
  ['/features', 'Features'],
  ['/how-it-works', 'How It Works'],
  ['/pricing', 'Pricing'],
] as const;

export function MarketingHeader() {
  return (
    <header className="marketing-header">
      <div className="marketing-wrap marketing-header-inner">
        <Link href="/" className="marketing-logo" aria-label="Simple Logistics home">
          <Logo size={40} dark />
        </Link>
        <nav className="marketing-nav" aria-label="Main navigation">
          {nav.map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <div className="marketing-header-actions">
          <Link href="/login" className="marketing-signin">Sign In</Link>
          <Link href="/login" className="marketing-primary">Request Access</Link>
        </div>
      </div>
    </header>
  );
}
