'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import { MobileHeader } from '@/components/MobileHeader';
import { REQUIRED_PHOTO_TYPES } from '@/lib/types';
import type { PhotoType, Order } from '@/lib/types';

type SlotState = Record<PhotoType, { file: File | null; previewUrl: string | null }>;

export default function CapturePhotosPage({ params }: { params: { orderNumber: string } }) {
  const router = useRouter();
  const { loading: memberLoading, member, org } = useCurrentMember();
  const [order, setOrder] = useState<Order | null>(null);
  const [slots, setSlots] = useState<SlotState>(
    Object.fromEntries(REQUIRED_PHOTO_TYPES.map((t) => [t.type, { file: null, previewUrl: null }])) as SlotState
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: REQUIRED_PHOTO_TYPES.length });
  const [error, setError] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const orderNumber = decodeURIComponent(params.orderNumber);

  useEffect(() => {
    if (!org) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from('orders').select('*').eq('org_id', org.id).eq('order_number', orderNumber).maybeSingle();
      setOrder(data);
    })();
  }, [org, orderNumber]);

  function handleFile(type: PhotoType, file: File | null) {
    if (!file) return;
    setSlots((prev) => ({ ...prev, [type]: { file, previewUrl: URL.createObjectURL(file) } }));
  }

  const allCaptured = REQUIRED_PHOTO_TYPES.every((t) => slots[t.type].file);

  async function handleContinue() {
    if (!allCaptured || !order || !org || !member) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    try {
      const rows = [];
      let i = 0;
      for (const t of REQUIRED_PHOTO_TYPES) {
        i += 1;
        setProgress({ current: i, total: REQUIRED_PHOTO_TYPES.length });
        const file = slots[t.type].file!;
        const path = `${org.id}/${order.id}/${t.type}-${Date.now()}.jpg`;
        const { error: uploadErr } = await supabase.storage.from('order-photos').upload(path, file, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });
        if (uploadErr) throw uploadErr;

        // order-photos is a private bucket — we store the object path here, not a
        // public URL (there isn't one). Signed URLs are generated on read instead.
        rows.push({
          order_id: order.id,
          org_id: org.id,
          photo_type: t.type,
          photo_url: path,
          uploaded_by: member.id,
        });
      }

      const { error: insertErr } = await supabase.from('order_photos').insert(rows);
      if (insertErr) throw insertErr;

      await supabase
        .from('orders')
        .update({ status: 'documented', documented_by: member.id, documented_at: new Date().toISOString() })
        .eq('id', order.id);

      await supabase.from('order_audit_log').insert({
        order_id: order.id,
        org_id: org.id,
        action: 'documentation_started',
        actor_id: member.id,
        details: `${REQUIRED_PHOTO_TYPES.length} photos captured`,
      });

      router.push(`/order/${encodeURIComponent(order.order_number)}/ship`);
    } catch (e: any) {
      setError(e.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  if (memberLoading || !member || !order) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-28">
      <MobileHeader title="Capture Photos" back />
      <div className="px-5 py-4">
        <p className="mb-1 text-xs font-medium text-gray-400">Order {order.order_number}</p>
        <div className="mb-5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Capture all four required photos before continuing.
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red">{error}</div>}

        <div className="space-y-4">
          {REQUIRED_PHOTO_TYPES.map((t, idx) => {
            const slot = slots[t.type];
            return (
              <div key={t.type} className="flex gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-red text-sm font-bold text-white">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-semibold">{t.label}</p>
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-brand-red">Required</span>
                  </div>
                  <p className="mb-2 text-sm text-gray-500">{t.helper}</p>
                  {slot.previewUrl ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slot.previewUrl} alt={t.label} className="h-32 w-full rounded-lg border border-green-300 object-cover" />
                      <button
                        type="button"
                        className="btn-outline mt-2 !py-2 text-sm"
                        onClick={() => fileInputs.current[t.type]?.click()}
                      >
                        📷 Retake Photo
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="btn-outline !py-2 text-sm" onClick={() => fileInputs.current[t.type]?.click()}>
                      📷 Take Photo
                    </button>
                  )}
                  <input
                    ref={(el) => {
                      fileInputs.current[t.type] = el;
                    }}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFile(t.type, e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white p-4">
        {uploading && (
          <p className="mb-2 text-center text-xs text-gray-500">
            Uploading photo {progress.current} of {progress.total}…
          </p>
        )}
        <button className="btn-primary w-full" disabled={!allCaptured || uploading} onClick={handleContinue}>
          {uploading ? 'Uploading…' : 'Continue to Review'}
        </button>
      </div>
    </div>
  );
}
