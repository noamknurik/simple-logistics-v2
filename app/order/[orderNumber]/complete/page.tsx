'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import type { Order } from '@/lib/types';

export default function OrderCompletePage({ params }: { params: { orderNumber: string } }) {
  const router = useRouter();
  const { loading: memberLoading, member, org } = useCurrentMember();
  const [order, setOrder] = useState<Order | null>(null);

  const orderNumber = decodeURIComponent(params.orderNumber);

  useEffect(() => {
    if (!org) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from('orders').select('*').eq('org_id', org.id).eq('order_number', orderNumber).maybeSingle();
      setOrder(data);
    })();
  }, [org, orderNumber]);

  if (memberLoading || !member || !order) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">✓</div>
      <h1 className="mb-2 text-2xl font-bold">Order Documented</h1>
      <p className="mb-1 text-gray-500">
        <strong className="text-gray-900">{order.order_number}</strong> is marked as shipped.
      </p>
      <p className="mb-8 max-w-xs text-sm text-gray-400">
        Photos are permanently attached to this order and searchable anytime as proof of what left the warehouse.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <button className="btn-primary w-full" onClick={() => router.push('/find-order')}>
          Document Another Order
        </button>
        <button className="btn-outline w-full" onClick={() => router.push(`/order/${encodeURIComponent(order.order_number)}`)}>
          View Order Details
        </button>
      </div>
    </div>
  );
}
