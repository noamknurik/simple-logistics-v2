'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCurrentMember } from '@/lib/useCurrentMember';

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ''));
    return row;
  });
}

export default function ImportOrdersPage() {
  const router = useRouter();
  const { org } = useCurrentMember();
  const fileInput = useRef<HTMLInputElement>(null);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; error: string | null } | null>(null);

  const [manual, setManual] = useState({ orderNumber: '', customerName: '', reference: '' });
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setResult(null);
    const text = await file.text();
    setCsvRows(parseCsv(text));
  }

  async function handleImport() {
    if (!org || csvRows.length === 0) return;
    setImporting(true);
    setResult(null);
    const supabase = createClient();
    const rows = csvRows
      .filter((r) => r.order_number)
      .map((r) => ({
        org_id: org.id,
        order_number: r.order_number,
        customer_name: r.customer_name || null,
        reference: r.reference || null,
        ship_to_name: r.ship_to_name || null,
        ship_to_address: r.ship_to_address || null,
        imported_from: 'csv',
      }));
    const { error, data } = await supabase.from('orders').upsert(rows, { onConflict: 'org_id,order_number' }).select('id');
    setImporting(false);
    if (error) {
      setResult({ ok: 0, error: error.message });
      return;
    }
    setResult({ ok: data?.length ?? 0, error: null });
    setCsvRows([]);
    setFileName('');
    if (fileInput.current) fileInput.current.value = '';
  }

  async function handleManualAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!org || !manual.orderNumber.trim()) return;
    setManualSaving(true);
    setManualError(null);
    const supabase = createClient();
    const { error } = await supabase.from('orders').insert({
      org_id: org.id,
      order_number: manual.orderNumber.trim(),
      customer_name: manual.customerName.trim() || null,
      reference: manual.reference.trim() || null,
      imported_from: 'manual',
    });
    setManualSaving(false);
    if (error) {
      setManualError(error.message.includes('duplicate') ? 'An order with this number already exists.' : error.message);
      return;
    }
    router.push(`/admin/orders/${encodeURIComponent(manual.orderNumber.trim())}`);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Import Orders</h1>
      <p className="mb-6 text-sm text-gray-500">Bring orders in from a CSV export, or add one manually.</p>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 text-sm font-semibold">CSV Upload</h2>
        <p className="mb-3 text-xs text-gray-400">
          Columns: order_number (required), customer_name, reference, ship_to_name, ship_to_address. Existing order numbers are updated, not duplicated.
        </p>
        <input ref={fileInput} type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="mb-3 text-sm" />
        {fileName && <p className="mb-3 text-xs text-gray-500">{csvRows.length} rows parsed from {fileName}.</p>}
        {result?.error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{result.error}</div>}
        {result && !result.error && <div className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Imported {result.ok} orders.</div>}
        <button className="btn-primary !px-4 !py-2 text-sm" disabled={csvRows.length === 0 || importing} onClick={handleImport}>
          {importing ? 'Importing…' : `Import ${csvRows.length || ''} Orders`}
        </button>
      </div>

      <div className="mb-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
        <p className="mb-1 font-semibold text-gray-700">ShipStation Sync</p>
        <p>Automatic order sync from ShipStation is planned for a later phase. CSV import and manual entry cover it for now.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold">Add One Manually</h2>
        {manualError && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-red">{manualError}</div>}
        <form onSubmit={handleManualAdd} className="space-y-3">
          <div>
            <label className="label">Order Number</label>
            <input className="input" required value={manual.orderNumber} onChange={(e) => setManual((m) => ({ ...m, orderNumber: e.target.value }))} />
          </div>
          <div>
            <label className="label">Customer Name</label>
            <input className="input" value={manual.customerName} onChange={(e) => setManual((m) => ({ ...m, customerName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Reference</label>
            <input className="input" value={manual.reference} onChange={(e) => setManual((m) => ({ ...m, reference: e.target.value }))} />
          </div>
          <button className="btn-primary !px-4 !py-2 text-sm" disabled={manualSaving}>
            {manualSaving ? 'Adding…' : 'Add Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
