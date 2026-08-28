import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'Pricing | Simple Logistics Warehouse Photo Documentation',
  description: 'Flexible pricing for warehouse photo documentation and shipment proof. Plans are based on shipment volume, team size, and operational needs.',
};

const plans = [
  {
    name: 'Starter',
    eyebrow: 'For smaller warehouse teams',
    price: 'Custom quote',
    body: 'A simple way to replace camera-roll photos and manual folders with searchable shipment proof.',
    bullets: ['Shipment photo capture', 'Order-number search', 'Shared team access', 'Searchable shipment history'],
  },
  {
    name: 'Operations',
    eyebrow: 'For growing shipping teams',
    price: 'Custom quote',
    body: 'More structure for higher shipment volume, multiple users, and a repeatable warehouse documentation process.',
    bullets: ['Everything in Starter', 'Guided photo workflows', 'Higher shipment volume', 'Priority onboarding'],
    featured: true,
  },
  {
    name: 'Enterprise',
    eyebrow: 'For larger operations',
    price: 'Talk to us',
    body: 'A tailored setup for organizations with larger teams, more locations, or custom operational requirements.',
    bullets: ['Everything in Operations', 'Multi-location support', 'Custom workflow planning', 'Dedicated implementation support'],
  },
];

export default function PricingPage() {
  return (
    <main className="marketing-site">
      <MarketingHeader />
      <section className="pricing-hero">
        <div className="pricing-hero-photo" aria-hidden="true" />
        <div className="pricing-hero-overlay" />
        <div className="marketing-wrap pricing-hero-inner">
          <p className="marketing-kicker">Simple, flexible pricing</p>
          <h1>Pay for the shipment proof your operation needs.</h1>
          <p>Pricing is based on shipment volume, team size, and workflow needs. No made-up feature bundles or unnecessary software you will never use.</p>
        </div>
      </section>

      <section className="marketing-section marketing-section-light">
        <div className="marketing-wrap">
          <div className="pricing-grid">
            {plans.map((plan) => (
              <article className={`pricing-card${plan.featured ? ' featured' : ''}`} key={plan.name}>
                {plan.featured && <div className="pricing-badge">Most popular</div>}
                <p className="pricing-eyebrow">{plan.eyebrow}</p>
                <h2>{plan.name}</h2>
                <div className="pricing-price">{plan.price}</div>
                <p className="pricing-body">{plan.body}</p>
                <ul className="pricing-list">
                  {plan.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
                <Link href="/login" className={plan.featured ? 'marketing-primary pricing-button' : 'marketing-dark-button pricing-button'}>
                  Request Pricing
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-explainer">
        <div className="marketing-wrap pricing-explainer-grid">
          <div>
            <p className="marketing-kicker">What affects pricing?</p>
            <h2>A plan that matches your warehouse.</h2>
          </div>
          <div className="pricing-factors">
            <div><strong>Shipment volume</strong><span>How many outbound orders you document each month.</span></div>
            <div><strong>Team size</strong><span>How many warehouse and operations users need access.</span></div>
            <div><strong>Locations</strong><span>Whether you are documenting shipments at one warehouse or several.</span></div>
            <div><strong>Workflow needs</strong><span>The capture steps and evidence your team needs for each shipment.</span></div>
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-section-dark">
        <div className="marketing-wrap callout-row">
          <div>
            <p className="marketing-kicker">Get a real number</p>
            <h2>Tell us how your warehouse ships.</h2>
            <p>We will recommend the simplest plan that fits your volume and workflow.</p>
          </div>
          <Link href="/login" className="marketing-primary">Request Access</Link>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
