'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import type { OrderSummaryRow } from '@/lib/types';

type Filter = 'all' | 'documented' | 'shipped';

export default function RecentCapturesPage() {
  const router = useRouter();
  const { loading, member, org } = useCurrentMember();
  const [orders, setOrders] = useState<OrderSummaryRow[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!org || !member) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('order_summary')
        .select('*')
        .eq('org_id', org.id)
        .eq('documented_by', member.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setOrders(data ?? []);
      setFetching(false);
    })();
  }, [org, member]);

  const filtered = orders.filter((o) => filter === 'all' || o.status === filter);

  if (loading || !member) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <MobileHeader title="Recent Captures" />
      <div className="px-5 pt-4">
        <p className="mb-4 text-sm text-gray-500">Orders you've documented, most recent first.</p>

        <div className="mb-4 flex gap-2">
          {(['all', 'documented', 'shipped'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ${
                filter === f ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {fetching && <p className="py-8 text-center text-sm text-gray-400">Loading orders…</p>}
        {!fetching && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">No captures yet in this view.</p>
        )}

        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          {filtered.map((o) => (
            <button
              key={o.id}
              onClick={() => router.push(`/order/${encodeURIComponent(o.order_number)}`)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <div>
                <p className="font-semibold">{o.order_number}</p>
                <p className="text-xs text-gray-500">
                  {o.customer_name ?? 'No customer name'} · {o.photo_count} photo{o.photo_count === 1 ? '' : 's'}
                </p>
                <p className="text-[11px] text-gray-400">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  o.status === 'shipped' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {o.status === 'shipped' ? 'Shipped' : 'Documented'}
              </span>
            </button>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
