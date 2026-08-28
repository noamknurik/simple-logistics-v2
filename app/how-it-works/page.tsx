import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'How It Works | Capture, Organize & Find Shipment Proof',
  description: 'See how warehouse teams capture shipment photos, attach them to an order number, and retrieve proof fast for damage claims, shortages, and freight disputes.',
};

const steps = [
  ['Find the order', 'Search or scan the order number before the shipment leaves the warehouse.'],
  ['Capture the required photos', 'Photograph the package, seal, contents, label, or any checkpoints your operation requires.'],
  ['Submit the shipment record', 'Simple Logistics keeps the photos together under the correct order so there is no manual filing later.'],
  ['Search when a claim appears', 'Weeks or months later, your office team can search the order number and pull up the visual proof in seconds.'],
];

export default function HowItWorksPage() {
  return (
    <main className="marketing-site">
      <MarketingHeader />
      <section className="page-hero page-hero-with-photo">
        <div className="page-hero-photo how-photo" aria-hidden="true" />
        <div className="page-hero-overlay" />
        <div className="marketing-wrap page-hero-inner">
          <p className="marketing-kicker">A simple warehouse workflow</p>
          <h1>Capture it once. Find it when it matters.</h1>
          <p>Simple Logistics turns warehouse photos into structured shipment documentation, without forcing your team into a complicated system.</p>
          <div className="marketing-actions">
            <Link href="/login" className="marketing-primary">Request Access</Link>
            <Link href="/features" className="marketing-secondary">Explore Features</Link>
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-section-light">
        <div className="marketing-wrap">
          <div className="marketing-heading centered">
            <p className="marketing-kicker">Four simple steps</p>
            <h2>From warehouse floor to searchable shipment proof.</h2>
          </div>
          <div className="steps-grid">
            {steps.map(([title, body], index) => (
              <article className="step-card" key={title}>
                <div className="step-number">{index + 1}</div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-split">
        <div className="marketing-split-photo warehouse-detail" aria-hidden="true" />
        <div className="marketing-split-copy">
          <p className="marketing-kicker">Designed for speed</p>
          <h2>No photo naming. No folder hunting. No asking who has the picture.</h2>
          <p>The warehouse team captures the shipment record while the freight is still there. The office team retrieves the same record later by searching the order number.</p>
          <ul className="marketing-checklist">
            <li>Works around the order number your team already knows</li>
            <li>Creates consistent shipment documentation</li>
            <li>Keeps evidence together instead of scattered across devices</li>
            <li>Makes claims and disputes faster to investigate</li>
          </ul>
        </div>
      </section>

      <section className="marketing-section marketing-section-dark">
        <div className="marketing-wrap callout-row">
          <div>
            <p className="marketing-kicker">Ready when the question comes</p>
            <h2>Build a searchable record before the truck leaves.</h2>
          </div>
          <Link href="/pricing" className="marketing-primary">View Pricing</Link>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
