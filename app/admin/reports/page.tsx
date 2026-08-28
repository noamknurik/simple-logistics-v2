'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import type { OrderStatus } from '@/lib/types';

function toCsv(rows: any[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
}

export default function ReportsPage() {
  const { org } = useCurrentMember();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [generating, setGenerating] = useState(false);
  const [rowCount, setRowCount] = useState<number | null>(null);

  async function handleExport() {
    if (!org) return;
    setGenerating(true);
    setRowCount(null);
    const supabase = createClient();
    let q = supabase
      .from('order_summary')
      .select('order_number, customer_name, status, photo_count, documented_at, shipped_at, created_at')
      .eq('org_id', org.id);
    if (status !== 'all') q = q.eq('status', status);
    if (from) q = q.gte('created_at', from);
    if (to) q = q.lte('created_at', `${to}T23:59:59`);
    const { data } = await q.order('created_at', { ascending: false });
    setGenerating(false);
    setRowCount(data?.length ?? 0);

    const csv = toCsv(data ?? []);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simple-logistics-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-2xl font-bold">Reports & Export</h1>
      <p className="mb-6 text-sm text-gray-500">Export order records as CSV — useful for disputes, audits, or a customer's own paperwork.</p>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="label">From</label>
            <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="mb-5">
          <label className="label">Status</label>
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'documented', 'shipped'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ${
                  status === s ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary !px-4 !py-2 text-sm" disabled={generating} onClick={handleExport}>
          {generating ? 'Preparing…' : '⬇ Export CSV'}
        </button>
        {rowCount !== null && <p className="mt-2 text-xs text-gray-400">{rowCount} rows exported. Note: this includes order records, not the photos themselves.</p>}
      </div>
    </div>
  );
}
