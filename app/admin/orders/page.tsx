'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';
import type { OrderSummaryRow, OrderStatus } from '@/lib/types';

const PAGE_SIZE = 20;

export default function AllOrdersPage() {
  const { org } = useCurrentMember();
  const [rows, setRows] = useState<OrderSummaryRow[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!org) return;
    (async () => {
      setLoading(true);
      const supabase = createClient();
      let q = supabase.from('order_summary').select('*', { count: 'exact' }).eq('org_id', org.id);
      if (status !== 'all') q = q.eq('status', status);
      if (query.trim()) q = q.or(`order_number.ilike.%${query.trim()}%,customer_name.ilike.%${query.trim()}%`);
      q = q.order('created_at', { ascending: false }).range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      const { data, count: total } = await q;
      setRows(data ?? []);
      setCount(total ?? 0);
      setLoading(false);
    })();
  }, [org, query, status, page]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-gray-500">{count} order{count === 1 ? '' : 's'} in your organization.</p>
        </div>
        <Link href="/admin/import" className="btn-primary !px-4 !py-2 text-sm">
          + Import Orders
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="input max-w-xs"
          placeholder="Search order # or customer…"
          value={query}
          onChange={(e) => {
            setPage(0);
            setQuery(e.target.value);
          }}
        />
        {(['all', 'pending', 'documented', 'shipped'] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setPage(0);
              setStatus(s);
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ${
              status === s ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-2.5 font-medium">Order #</th>
              <th className="px-4 py-2.5 font-medium">Customer</th>
              <th className="px-4 py-2.5 font-medium">Photos</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${encodeURIComponent(o.order_number)}`} className="font-semibold text-brand-red">
                    {o.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{o.customer_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{o.photo_count}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      o.status === 'shipped'
                        ? 'bg-green-100 text-green-700'
                        : o.status === 'documented'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No orders match this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button className="btn-outline !px-3 !py-1.5 text-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <button
            className="btn-outline !px-3 !py-1.5 text-sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
