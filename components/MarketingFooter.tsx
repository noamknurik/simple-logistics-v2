import Link from 'next/link';
import { Logo } from '@/components/Logo';

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="marketing-wrap marketing-footer-grid">
        <div className="marketing-footer-brand">
          <Logo size={34} dark />
          <p>Warehouse photo documentation that keeps shipment proof organized, searchable, and ready when a claim appears.</p>
        </div>
        <div>
          <h4>Product</h4>
          <Link href="/features">Features</Link>
          <Link href="/how-it-works">How It Works</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link href="/login">Request Access</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
      <div className="marketing-wrap marketing-footer-bottom">© 2026 Simple Logistics</div>
    </footer>
  );
}
