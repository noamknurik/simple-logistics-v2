import Link from 'next/link';
import { Logo } from '@/components/Logo';

const features = [
  ['01', 'Photo Proof', 'Capture clear shipment photos at the warehouse before every order leaves.'],
  ['02', 'Order Linked', 'Every photo is tied to the order number so there is no guessing later.'],
  ['03', 'Delivery Status', 'Give your team one reliable place to see what was captured and when.'],
  ['04', 'Instant Search', 'Pull up the evidence in seconds when a shortage or damage claim arrives.'],
  ['05', 'Secure & Organized', 'Keep documentation searchable, protected and available for as long as you need it.'],
];

export default function LandingPage() {
  return (
    <main className="landing-shell">
      <header className="landing-header">
        <div className="landing-wrap landing-header-inner">
          <Link href="/" aria-label="Simple Logistics home"><Logo size={34} dark /></Link>
          <nav className="landing-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#case-study">Case Study</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <Link href="/login" className="landing-cta">Request Access</Link>
        </div>
      </header>

      <section className="hero" id="how-it-works">
        <div className="landing-wrap hero-grid">
          <div className="hero-copy">
            <p className="landing-eyebrow">Warehouse shipment documentation</p>
            <h1 className="landing-display">
              Proof of delivery.<br /><span className="landing-red">Nothing else you don&apos;t need.</span>
            </h1>
            <p>
              Simple Logistics gives you the proof you need to close every shipment with confidence — captured in the warehouse and searchable whenever a claim shows up.
            </p>
            <div className="hero-actions">
              <Link href="/login" className="landing-cta">Request Access</Link>
              <a href="#case-study" className="landing-ghost">Contact Sales</a>
            </div>
          </div>
          <div className="hero-photo" role="img" aria-label="Warehouse worker photographing a shipment" />
        </div>
        <div className="hero-proof">
          <div className="landing-wrap hero-proof-inner">
            <div className="proof-item"><strong><i className="proof-dot" />Reliable Proof</strong><span>Photos tied directly to every order</span></div>
            <div className="proof-item"><strong><i className="proof-dot" />Real-Time Updates</strong><span>Know the moment documentation is complete</span></div>
            <div className="proof-item"><strong><i className="proof-dot" />Always Accessible</strong><span>Secure, organized and easy to find</span></div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="landing-wrap">
          <div className="features-head">
            <p className="landing-eyebrow">Built for warehouse teams</p>
            <h2 className="landing-display">Everything You Need.<br />Nothing You Don&apos;t.</h2>
            <p>Simple proof, captured at the right moment and organized so your team can actually use it.</p>
          </div>
          <div className="feature-grid">
            {features.map(([number,title,body]) => (
              <article className="feature" key={title}>
                <span className="feature-number">{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="story" id="case-study">
        <div className="story-grid">
          <div className="story-copy">
            <p className="landing-eyebrow">Customer story</p>
            <h2 className="landing-display">Trusted by<br />GVA Brands</h2>
            <p>
              GVA Brands uses Simple Logistics to document shipments leaving the warehouse, creating a clear visual record their team can find the moment a customer question comes in.
            </p>
            <div className="metrics">
              <div className="metric"><strong>100%</strong><span>Proof of delivery<br />visibility</span></div>
              <div className="metric"><strong>35%</strong><span>Reduction in claims<br />and disputes</span></div>
              <div className="metric"><strong>99.8%</strong><span>On-time delivery<br />performance</span></div>
            </div>
            <a href="#pricing" className="story-link">Read the Full Case Study →</a>
          </div>
          <div className="story-photo" role="img" aria-label="GVA Brands delivery truck outside a warehouse">
            <div className="quote">
              <p>“Simple Logistics has been a game changer for us. The proof is there when we need it, and our customers love the reliability.”</p>
              <span>Operations Manager · GVA Brands</span>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta" id="pricing">
        <div className="landing-wrap">
          <p className="landing-eyebrow">Simple from day one</p>
          <h2 className="landing-display">Ready to Simplify<br />Your Deliveries?</h2>
          <p>Capture it once. Find it when it matters.</p>
          <div className="final-actions">
            <Link href="/login" className="landing-cta">Request Access</Link>
            <a href="mailto:hello@simplelogistics.app" className="landing-ghost">Contact Sales</a>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-wrap footer-inner">
          <Logo size={30} dark />
          <div className="footer-links">
            <a href="#features">Features</a><a href="#case-study">Case Study</a>
            <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link>
          </div>
          <span className="footer-copy">© 2026 Simple Logistics</span>
        </div>
      </footer>
    </main>
  );
}
