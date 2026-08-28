import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#how-it-works" className="hover:text-gray-900">How It Works</a>
            <a href="#case-study" className="hover:text-gray-900">Case Study</a>
          </nav>
          <Link href="/login" className="btn-primary !py-2.5 !px-5 text-sm">
            Sign In
          </Link>
        </div>
      </header>

      <section className="bg-brand-navy py-20 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-3 text-sm font-semibold tracking-wide text-brand-red">
            WAREHOUSE SHIPMENT DOCUMENTATION
          </p>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
            Proof of what left the warehouse. Searchable in seconds, kept as long as you need it.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/70">
            Simple Logistics photographs every shipment before it leaves the warehouse, ties it
            permanently to the order number, and gives your team an instant answer when a damage
            claim or shortage dispute shows up weeks or months later.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/login" className="btn-primary">Sign In</Link>
            <a href="#how-it-works" className="btn-outline !bg-transparent !text-white !border-white/30 hover:!bg-white/10">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-10 text-2xl font-bold">Everything it needs to do. Nothing it doesn&apos;t.</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { title: 'Scan or Search', body: 'Find any order by barcode scan or order number — no memorizing what you’re packing.' },
              { title: 'Structured Capture', body: 'Four required photo types — full package, seal, contents, label — so every order has comparable evidence.' },
              { title: 'Search Later', body: 'Admin searches an order number and gets the proof back instantly, whenever the dispute comes in.' },
              { title: 'Kept, Not Lost', body: 'No silent expiry. Evidence stays retrievable in the app for as long as your org needs it.' },
            ].map((f) => (
              <div key={f.title} className="card">
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="case-study" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-2 text-sm font-semibold text-brand-red">CUSTOMER STORY</p>
          <h2 className="mb-3 text-2xl font-bold">Trusted by GVA Brands</h2>
          <p className="max-w-2xl text-gray-600">
            GVA Brands, a Canadian powersports distributor, uses Simple Logistics to document every
            shipment leaving their Richmond, BC warehouse — giving their team an answer in seconds
            when a customer disputes what arrived.
          </p>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-gray-500">
          <Logo size={20} />
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
