'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import { MobileHeader } from '@/components/MobileHeader';
import { REQUIRED_PHOTO_TYPES } from '@/lib/types';
import type { Order, OrderPhoto } from '@/lib/types';

const CARRIERS = ['UPS', 'FedEx', 'Purolator', 'Canada Post', 'DHL', 'Other'];

export default function ShipOrderPage({ params }: { params: { orderNumber: string } }) {
  const router = useRouter();
  const { loading: memberLoading, member, org } = useCurrentMember();
  const [order, setOrder] = useState<Order | null>(null);
  const [photos, setPhotos] = useState<OrderPhoto[]>([]);
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderNumber = decodeURIComponent(params.orderNumber);

  useEffect(() => {
    if (!org) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from('orders').select('*').eq('org_id', org.id).eq('order_number', orderNumber).maybeSingle();
      setOrder(data);
      setNotes(data?.notes ?? '');
      if (data) {
        const { data: photoRows } = await supabase.from('order_photos').select('*').eq('order_id', data.id);
        setPhotos(photoRows ?? []);
      }
    })();
  }, [org, orderNumber]);

  async function handleShip() {
    if (!order || !org || !member) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    try {
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          status: 'shipped',
          carrier: carrier || null,
          tracking_number: tracking.trim() || null,
          notes: notes.trim() || null,
          shipped_at: new Date().toISOString(),
        })
        .eq('id', order.id);
      if (updateErr) throw updateErr;

      await supabase.from('order_audit_log').insert({
        order_id: order.id,
        org_id: org.id,
        action: 'marked_shipped',
        actor_id: member.id,
        details: carrier ? `${carrier}${tracking ? ` · ${tracking}` : ''}` : null,
      });

      router.push(`/order/${encodeURIComponent(order.order_number)}/complete`);
    } catch (e: any) {
      setError(e.message ?? 'Could not mark this order as shipped. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (memberLoading || !member || !order) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-28">
      <MobileHeader title="Mark as Shipped" back />
      <div className="px-5 py-4">
        <p className="mb-1 text-xs font-medium text-gray-400">Order {order.order_number}</p>

        <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>✓</span>
          <span>{photos.length} of {REQUIRED_PHOTO_TYPES.length} required photos captured</span>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red">{error}</div>}

        <div className="mb-4">
          <label className="label">Carrier <span className="font-normal text-gray-400">(optional)</span></label>
          <div className="grid grid-cols-3 gap-2">
            {CARRIERS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCarrier(c)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  carrier === c ? 'border-brand-red bg-red-50 text-brand-red' : 'border-gray-200 text-gray-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="label" htmlFor="tracking">Tracking Number <span className="font-normal text-gray-400">(optional)</span></label>
          <input id="tracking" className="input" placeholder="e.g. 1Z999AA10123456784" value={tracking} onChange={(e) => setTracking(e.target.value)} />
        </div>

        <div className="mb-2">
          <label className="label" htmlFor="notes">Notes <span className="font-normal text-gray-400">(optional)</span></label>
          <textarea
            id="notes"
            className="input min-h-[90px] resize-none"
            placeholder="Anything worth flagging about this shipment…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white p-4">
        <button className="btn-primary w-full" disabled={saving} onClick={handleShip}>
          {saving ? 'Marking as Shipped…' : '✓ Mark as Shipped'}
        </button>
      </div>
    </div>
  );
}
