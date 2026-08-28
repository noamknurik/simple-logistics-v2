'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import { REQUIRED_PHOTO_TYPES } from '@/lib/types';
import { resolvePhotoUrls } from '@/lib/signedPhotoUrl';
import type { Order, OrderPhoto } from '@/lib/types';

export default function OrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const router = useRouter();
  const { loading: memberLoading, member, org } = useCurrentMember();
  const [order, setOrder] = useState<Order | null | 'not-found'>(null);
  const [photos, setPhotos] = useState<OrderPhoto[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const orderNumber = decodeURIComponent(params.orderNumber);

  useEffect(() => {
    if (!org) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('org_id', org.id)
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (!data) {
        setOrder('not-found');
        setLoading(false);
        return;
      }
      setOrder(data);

      const { data: photoRows } = await supabase
        .from('order_photos')
        .select('*')
        .eq('order_id', data.id)
        .order('created_at', { ascending: true });
      setPhotos(photoRows ?? []);
      setPhotoUrls(await resolvePhotoUrls((photoRows ?? []).map((p) => p.photo_url)));
      setLoading(false);
    })();
  }, [org, orderNumber]);

  if (memberLoading || loading || !member) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  if (order === 'not-found') {
    return (
      <div className="min-h-screen bg-white pb-24">
        <MobileHeader title="Order Not Found" back />
        <div className="px-5 py-10 text-center text-gray-500">
          No order matches <strong>{orderNumber}</strong> in your organization.
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-white pb-24">
      <MobileHeader title="Order Details" back />
      <div className="px-5 py-4">
        <div className="card mb-5">
          <p className="text-xs font-medium text-gray-400">Order Number</p>
          <p className="mb-2 text-xl font-bold">{order.order_number}</p>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
              order.status === 'shipped'
                ? 'bg-green-100 text-green-700'
                : order.status === 'documented'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {order.status === 'shipped' ? '✓ Shipped' : order.status === 'documented' ? 'Ready to Ship' : 'Ready to Capture'}
          </span>

          {order.customer_name && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400">Customer</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-gray-400">Reference</p>
                <p className="font-medium">{order.reference ?? '—'}</p>
              </div>
            </div>
          )}
        </div>

        {order.items?.length > 0 && (
          <div className="mb-5">
            <h2 className="mb-2 text-sm font-semibold">Shipment Items ({order.items.length})</h2>
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                  </div>
                  <span className="text-sm text-gray-500">Qty: {item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div className="mb-5">
            <h2 className="mb-2 text-sm font-semibold">Photos Captured ({photos.length} of {REQUIRED_PHOTO_TYPES.length})</h2>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((p) => {
                const url = photoUrls[p.photo_url];
                return (
                  <a
                    key={p.id}
                    href={url ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-square overflow-hidden rounded-lg bg-gray-100"
                  >
                    {url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={p.photo_type} className="h-full w-full object-cover" />
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {order.status === 'shipped' && (
          <div className="card mb-5">
            <h2 className="mb-2 text-sm font-semibold">Shipping Info</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400">Carrier</p>
                <p className="font-medium">{order.carrier ?? '—'}</p>
              </div>
              <div>
                <p className="text-gray-400">Tracking #</p>
                <p className="break-all font-medium">{order.tracking_number ?? '—'}</p>
              </div>
            </div>
          </div>
        )}

        {order.notes && (
          <div className="card mb-5">
            <h2 className="mb-1 text-sm font-semibold">Notes</h2>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}

        {order.status === 'pending' && (
          <button className="btn-primary w-full" onClick={() => router.push(`/order/${encodeURIComponent(order.order_number)}/capture`)}>
            📷 Capture Photos
          </button>
        )}
        {order.status === 'documented' && (
          <button className="btn-primary w-full" onClick={() => router.push(`/order/${encodeURIComponent(order.order_number)}/ship`)}>
            Continue to Ship
          </button>
        )}
        {order.status === 'shipped' && (
          <p className="text-center text-xs text-gray-400">
            Documented {order.documented_at ? new Date(order.documented_at).toLocaleString() : ''} · Shipped{' '}
            {order.shipped_at ? new Date(order.shipped_at).toLocaleString() : ''}
          </p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
