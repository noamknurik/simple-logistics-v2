import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function AdminOverviewPage() {
  const { org } = await requireAdmin();
  const supabase = createClient();

  const [{ data: summary }, { data: recent }, { count: memberCount }] = await Promise.all([
    supabase.from('order_summary').select('*').eq('org_id', org.id),
    supabase
      .from('order_summary')
      .select('*')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('org_members').select('*', { count: 'exact', head: true }).eq('org_id', org.id).eq('is_active', true),
  ]);

  const rows = summary ?? [];
  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === 'pending').length,
    documented: rows.filter((r) => r.status === 'documented').length,
    shipped: rows.filter((r) => r.status === 'shipped').length,
    todayShipped: rows.filter((r) => r.shipped_at && new Date(r.shipped_at).toDateString() === new Date().toDateString()).length,
  };

  const cards = [
    { label: 'Total Orders', value: stats.total, tone: 'text-gray-900' },
    { label: 'Awaiting Capture', value: stats.pending, tone: 'text-gray-600' },
    { label: 'Documented', value: stats.documented, tone: 'text-amber-600' },
    { label: 'Shipped', value: stats.shipped, tone: 'text-green-600' },
    { label: 'Shipped Today', value: stats.todayShipped, tone: 'text-brand-red' },
    { label: 'Active Employees', value: memberCount ?? 0, tone: 'text-gray-900' },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Overview</h1>
      <p className="mb-6 text-sm text-gray-500">What's shipping out of {org.name}, at a glance.</p>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className={`text-2xl font-bold ${c.tone}`}>{c.value}</p>
            <p className="text-xs text-gray-400">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
        <Link href="/admin/orders" className="text-sm font-medium text-brand-red">
          View all orders &rsaquo;
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-2.5 font-medium">Order #</th>
              <th className="px-4 py-2.5 font-medium">Customer</th>
              <th className="px-4 py-2.5 font-medium">Photos</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(recent ?? []).map((o) => (
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
            {(!recent || recent.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No orders yet. <Link href="/admin/import" className="text-brand-red">Import your first batch &rsaquo;</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
