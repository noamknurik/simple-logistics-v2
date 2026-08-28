'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import type { OrderSummaryRow } from '@/lib/types';

export default function FindOrderPage() {
  const router = useRouter();
  const { loading, member, org } = useCurrentMember();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<OrderSummaryRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!org) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('order_summary')
        .select('*')
        .eq('org_id', org.id)
        .order('created_at', { ascending: false })
        .limit(6);
      setRecent(data ?? []);
    })();
  }, [org]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !org) return;
    setSearching(true);
    setError(null);
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select('order_number')
      .eq('org_id', org.id)
      .ilike('order_number', query.trim())
      .maybeSingle();
    setSearching(false);
    if (!data) {
      setError(`No order found for "${query.trim()}".`);
      return;
    }
    router.push(`/order/${encodeURIComponent(data.order_number)}`);
  }

  if (loading || !member || !org) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <MobileHeader />
      <div className="px-5 pt-4">
        <h1 className="mb-1 text-2xl font-bold">Find Order</h1>
        <p className="mb-5 text-sm text-gray-500">Scan a barcode or enter an order number to get started.</p>

        <div className="mb-5 rounded-xl bg-brand-red p-6 text-center text-white">
          <div className="mb-2 text-3xl">📷</div>
          <p className="font-semibold">Scan Barcode</p>
          <p className="text-sm text-white/80">Barcode scanning uses your device camera — not available in this preview.</p>
        </div>

        <div className="mb-4 flex items-center gap-3 text-xs font-medium text-gray-400">
          <div className="h-px flex-1 bg-gray-200" /> OR <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSearch}>
          <label className="label" htmlFor="orderNumber">Enter Order Number</label>
          <div className="mb-2 flex gap-2">
            <input
              id="orderNumber"
              className="input"
              placeholder="e.g. ORD-18472"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" disabled={searching} className="btn-primary !px-5">
              {searching ? '…' : 'Go'}
            </button>
          </div>
          {error && <p className="mb-2 text-sm text-brand-red">{error}</p>}
        </form>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent Orders</h2>
        </div>
        <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-100">
          {recent.length === 0 && <p className="p-4 text-sm text-gray-400">No orders yet.</p>}
          {recent.map((o) => (
            <button
              key={o.id}
              onClick={() => router.push(`/order/${encodeURIComponent(o.order_number)}`)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <div>
                <p className="font-semibold">{o.order_number}</p>
                <p className="text-xs text-gray-500">{o.customer_name ?? 'No customer name'}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  o.status === 'shipped' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {o.status === 'shipped' ? 'Shipped' : o.status === 'documented' ? 'Documented' : 'Pending'}
              </span>
            </button>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
