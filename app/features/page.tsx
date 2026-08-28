import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'Features | Shipment Photo Proof & Warehouse Documentation',
  description: 'Capture order-linked shipment photos, standardize warehouse documentation, search proof instantly, and keep evidence ready for freight claims and customer disputes.',
};

const features = [
  ['Shipment photo capture', 'Take clear warehouse photos before freight leaves the dock so you have a visual record of the condition and contents.'],
  ['Order-number search', 'Tie every image to the shipment or order number so office staff can find the right proof without digging through phones or folders.'],
  ['Guided capture flow', 'Use a repeatable photo checklist for package condition, seal, contents, labels, and any other proof your operation requires.'],
  ['Searchable history', 'Retrieve older shipment records fast when a customer dispute, shortage claim, or carrier question appears weeks later.'],
  ['Team access', 'Give warehouse and operations teams one shared source of truth instead of scattered camera rolls, chats, email threads, and shared drives.'],
  ['Long-term evidence', 'Keep documentation organized and accessible for as long as your business needs it.'],
];

export default function FeaturesPage() {
  return (
    <main className="marketing-site">
      <MarketingHeader />
      <section className="page-hero page-hero-with-photo">
        <div className="page-hero-photo warehouse-feature-photo" aria-hidden="true" />
        <div className="page-hero-overlay" />
        <div className="marketing-wrap page-hero-inner">
          <p className="marketing-kicker">Warehouse documentation software</p>
          <h1>Shipment photo proof that stays organized.</h1>
          <p>Capture proof before freight leaves the warehouse, connect it to the order, and retrieve the record in seconds when you need to defend a shipment.</p>
          <div className="marketing-actions">
            <Link href="/login" className="marketing-primary">Request Access</Link>
            <Link href="/how-it-works" className="marketing-secondary">See How It Works</Link>
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-section-light">
        <div className="marketing-wrap">
          <div className="marketing-heading">
            <p className="marketing-kicker">Core features</p>
            <h2>Everything you need to document outbound shipments.</h2>
            <p>Built around the warehouse workflow: capture, organize, search, and retrieve proof without adding unnecessary complexity.</p>
          </div>
          <div className="feature-card-grid">
            {features.map(([title, body], index) => (
              <article className="feature-card" key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-split reverse">
        <div className="marketing-split-copy">
          <p className="marketing-kicker">Built for claims and disputes</p>
          <h2>When someone asks what shipped, you have the answer.</h2>
          <p>Damage claims, missing-item complaints, chargebacks, and freight disputes are easier to handle when the shipment record is already captured and attached to the order.</p>
          <ul className="marketing-checklist">
            <li>Proof of shipment condition</li>
            <li>Photos of packed contents</li>
            <li>Seal and label documentation</li>
            <li>Searchable order history</li>
          </ul>
        </div>
        <div className="marketing-split-photo truck-crop" aria-hidden="true" />
      </section>

      <section className="marketing-section marketing-section-dark">
        <div className="marketing-wrap callout-row">
          <div>
            <p className="marketing-kicker">One record per shipment</p>
            <h2>Replace scattered photos with structured proof.</h2>
          </div>
          <Link href="/login" className="marketing-primary">Request Access</Link>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
