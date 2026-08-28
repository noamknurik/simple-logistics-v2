'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import { resolvePhotoUrls } from '@/lib/signedPhotoUrl';
import { REQUIRED_PHOTO_TYPES } from '@/lib/types';
import type { Order, OrderPhoto } from '@/lib/types';

type AuditRow = { id: string; action: string; details: string | null; created_at: string; actor_id: string | null };

export default function AdminOrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const router = useRouter();
  const { org } = useCurrentMember();
  const [order, setOrder] = useState<Order | null | 'not-found'>(null);
  const [photos, setPhotos] = useState<OrderPhoto[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const orderNumber = decodeURIComponent(params.orderNumber);

  useEffect(() => {
    if (!org) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from('orders').select('*').eq('org_id', org.id).eq('order_number', orderNumber).maybeSingle();
      if (!data) {
        setOrder('not-found');
        return;
      }
      setOrder(data);
      const [{ data: photoRows }, { data: auditRows }] = await Promise.all([
        supabase.from('order_photos').select('*').eq('order_id', data.id).order('created_at', { ascending: true }),
        supabase.from('order_audit_log').select('*').eq('order_id', data.id).order('created_at', { ascending: false }),
      ]);
      setPhotos(photoRows ?? []);
      setPhotoUrls(await resolvePhotoUrls((photoRows ?? []).map((p) => p.photo_url)));
      setAudit(auditRows ?? []);
    })();
  }, [org, orderNumber]);

  async function handleDelete() {
    if (!order || order === 'not-found' || !org) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('orders').delete().eq('id', order.id);
    router.push('/admin/orders');
  }

  if (order === 'not-found') {
    return <p className="text-gray-500">No order matches "{orderNumber}" in your organization.</p>;
  }
  if (!order) {
    return <p className="text-gray-400">Loading…</p>;
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="mb-3 inline-block text-sm text-gray-400">&lsaquo; All Orders</Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
              order.status === 'shipped' ? 'bg-green-100 text-green-700' : order.status === 'documented' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {order.status}
          </span>
        </div>
        <button
          onClick={() => (confirmDelete ? handleDelete() : setConfirmDelete(true))}
          disabled={deleting}
          className="btn-outline !border-red-200 !py-2 text-sm !text-brand-red"
        >
          {confirmDelete ? 'Click again to permanently delete' : 'Delete Order'}
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-4">
        <div>
          <p className="text-xs text-gray-400">Customer</p>
          <p className="font-medium">{order.customer_name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Reference</p>
          <p className="font-medium">{order.reference ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Carrier</p>
          <p className="font-medium">{order.carrier ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Tracking #</p>
          <p className="break-all font-medium">{order.tracking_number ?? '—'}</p>
        </div>
      </div>

      {order.notes && (
        <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-1 text-sm font-semibold">Notes</p>
          <p className="text-sm text-gray-600">{order.notes}</p>
        </div>
      )}

      <div className="mb-5">
        <h2 className="mb-2 text-sm font-semibold">Photos ({photos.length} of {REQUIRED_PHOTO_TYPES.length})</h2>
        {photos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">Not documented yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((p) => {
              const url = photoUrls[p.photo_url];
              const label = REQUIRED_PHOTO_TYPES.find((t) => t.type === p.photo_type)?.label ?? p.photo_type;
              return (
                <a key={p.id} href={url ?? '#'} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <div className="aspect-square bg-gray-100">
                    {url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={label} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <p className="p-2 text-xs font-medium text-gray-600">{label}</p>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">Audit Log</h2>
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {audit.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <div>
                <span className="font-medium capitalize">{a.action.replace(/_/g, ' ')}</span>
                {a.details && <span className="text-gray-400"> — {a.details}</span>}
              </div>
              <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</span>
            </div>
          ))}
          {audit.length === 0 && <p className="px-4 py-4 text-sm text-gray-400">No activity recorded.</p>}
        </div>
      </div>
    </div>
  );
}
