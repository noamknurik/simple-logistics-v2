import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'Simple Logistics | Warehouse Photo Documentation & Proof of Shipment',
  description: 'Capture order-linked shipment photos before freight leaves the warehouse. Find proof in seconds for damage claims, shortages, chargebacks, and customer disputes.',
};

const benefits = [
  ['Order-linked photo proof', 'Every image stays attached to the order number, not buried in a camera roll.'],
  ['Faster claim resolution', 'Pull up shipment evidence in seconds when a damage, shortage, or freight claim arrives.'],
  ['Consistent documentation', 'Give warehouse teams a repeatable capture flow so every shipment has the proof you expect.'],
];

export default function LandingPage() {
  return (
    <main className="marketing-site">
      <MarketingHeader />

      <section className="home-hero">
        <div className="home-hero-photo" aria-hidden="true" />
        <div className="home-hero-shade" />
        <div className="marketing-wrap home-hero-inner">
          <div className="home-hero-copy">
            <p className="marketing-kicker">Warehouse photo documentation</p>
            <h1>Know exactly <span>what left the warehouse.</span></h1>
            <p className="home-hero-lead">
              Simple Logistics creates searchable proof of shipment before an order leaves your dock. Capture the photos once, tie them to the order, and find them fast when a claim or dispute shows up.
            </p>
            <div className="marketing-actions">
              <Link href="/login" className="marketing-primary">Request Access</Link>
              <Link href="/how-it-works" className="marketing-secondary">See How It Works</Link>
            </div>
          </div>
        </div>
        <div className="home-proof-strip">
          <div className="marketing-wrap home-proof-grid">
            <div><strong>Photo proof</strong><span>Captured before shipment</span></div>
            <div><strong>Search by order</strong><span>Evidence in seconds</span></div>
            <div><strong>Built for claims</strong><span>Damage, shortage & disputes</span></div>
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-section-light">
        <div className="marketing-wrap">
          <div className="marketing-heading centered">
            <p className="marketing-kicker">Proof you can actually use</p>
            <h2>Stop losing shipment photos in phones, chats, and folders.</h2>
            <p>Simple Logistics gives warehouse and shipping teams one place to capture, organize, and retrieve shipment documentation.</p>
          </div>
          <div className="benefit-grid">
            {benefits.map(([title, body], index) => (
              <article className="benefit-card" key={title}>
                <span className="benefit-index">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-split">
        <div className="marketing-split-photo warehouse-crop" aria-hidden="true" />
        <div className="marketing-split-copy">
          <p className="marketing-kicker">Made for busy warehouse teams</p>
          <h2>Capture proof while the shipment is still in front of you.</h2>
          <p>Workers search or scan the order, take the required shipment photos, and submit. The record is organized automatically so office staff can retrieve it later without asking who took the picture or where it was saved.</p>
          <Link href="/features" className="marketing-text-link">Explore all features →</Link>
        </div>
      </section>

      <section className="marketing-section marketing-section-dark">
        <div className="marketing-wrap callout-row">
          <div>
            <p className="marketing-kicker">Shipment evidence, without the mess</p>
            <h2>Make every claim easier to answer.</h2>
            <p>Give your team a clean record of what was packed, sealed, labeled, and shipped.</p>
          </div>
          <div className="marketing-actions">
            <Link href="/pricing" className="marketing-primary">View Pricing</Link>
            <Link href="/login" className="marketing-secondary">Request Access</Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
