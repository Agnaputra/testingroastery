'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatRupiah } from '../lib/data';
import { customerApi, customerJson } from '../lib/customer-api';
import type { CustomerOrder } from '../lib/customer-types';

const transitions: Record<CustomerOrder['fulfillmentStatus'], CustomerOrder['fulfillmentStatus'][]> = {
  pending: ['processing', 'cancelled'],
  processing: ['roasting', 'cancelled'],
  roasting: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: [], cancelled: [],
};

function getStatusBadge(status: string) {
  if (status === 'paid' || status === 'completed') {
    return 'bg-brand-teal/15 text-brand-charcoal border border-brand-teal/40';
  }
  if (status === 'awaiting_verification' || status === 'roasting' || status === 'processing' || status === 'shipped') {
    return 'bg-brand-navy/10 text-brand-navy border border-brand-navy/20';
  }
  if (status === 'rejected' || status === 'cancelled') {
    return 'bg-brand-maroon/10 text-brand-maroon border border-brand-maroon/20';
  }
  return 'bg-slate-100 text-slate-700 border border-slate-300';
}

export function AdminVerifiedPayments() {
  const [summary, setSummary] = useState<{ paidCount: number; paidTotal: number } | null>(null);
  useEffect(() => {
    customerApi<{ paidCount: number; paidTotal: number }>('admin/payment-summary')
      .then(setSummary).catch(() => setSummary(null));
  }, []);
  return (
    <section className="rounded-sm border border-border-subtle bg-white p-5 shadow-2xs text-sm">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-brand-teal" />
        <h2 className="font-headline text-base font-bold text-brand-charcoal">Pembayaran database testing</h2>
      </div>
      <p className="mt-2 text-on-surface-variant leading-relaxed">
        {summary
          ? `${summary.paidCount} order berstatus paid · ${formatRupiah(summary.paidTotal)} disetujui admin dalam pengujian lokal.`
          : 'Masuk dengan akun admin untuk melihat pembayaran database testing.'}
      </p>
      <p className="mt-1 font-mono text-[10px] text-on-surface-variant">
        Terpisah dari metrik demo. Persetujuan bukti sintetis bukan penerimaan dana nyata.
      </p>
    </section>
  );
}

export function AdminRealOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [summary, setSummary] = useState<{ paidCount: number; paidTotal: number } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('');
  const [decision, setDecision] = useState<{ orderId: string; action: 'approve' | 'reject' | 'shipped' } | null>(null);
  const [reason, setReason] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [receiptConfirmed, setReceiptConfirmed] = useState(false);

  function openDecision(orderId: string, action: 'approve' | 'reject' | 'shipped') {
    setDecision({ orderId, action });
    setReason('');
    setTrackingNumber('');
    setReceiptConfirmed(false);
    setError('');
  }

  async function refresh() {
    try {
      const [saved, totals] = await Promise.all([
        customerApi<CustomerOrder[]>('admin/orders'),
        customerApi<{ paidCount: number; paidTotal: number }>('admin/payment-summary'),
      ]);
      setOrders(saved); setSummary(totals);
      setError('');
    } catch {
      setError('Masuk dengan akun berperan admin untuk melihat order database.');
    }
  }
  useEffect(() => { void refresh(); }, []);

  async function payment(order: CustomerOrder, action: 'approve' | 'reject') {
    setBusy(order.id); setError('');
    try {
      await customerApi(`admin/orders/${order.id}/payment`, customerJson('POST', {
        action, reason: action === 'reject' ? reason.trim() : '', receiptConfirmed: action === 'approve' && receiptConfirmed,
      }));
      await refresh();
      setDecision(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Verifikasi gagal.'); }
    finally { setBusy(''); }
  }

  async function fulfillment(order: CustomerOrder, status: CustomerOrder['fulfillmentStatus']) {
    setBusy(order.id); setError('');
    try {
      await customerApi(`admin/orders/${order.id}/fulfillment`, customerJson('POST', { status, trackingNumber: status === 'shipped' ? trackingNumber.trim() : '' }));
      await refresh();
      setDecision(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Status gagal diperbarui.'); }
    finally { setBusy(''); }
  }

  const filtered = orders.filter((order) =>
    (!search || order.id.toLowerCase().includes(search.toLowerCase()))
    && (!paymentFilter || order.paymentStatus === paymentFilter)
    && (!fulfillmentFilter || order.fulfillmentStatus === fulfillmentFilter));

  return (
    <section className="rounded-sm border border-border-subtle bg-white p-5 shadow-2xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h3 className="font-headline text-lg font-bold text-brand-charcoal">
            Order Database Testing
          </h3>
          <p className="mt-1 text-xs text-on-surface-variant">
            Terpisah dari data demo browser. Hanya pembayaran yang disetujui setelah cek dana yang berstatus paid.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="min-h-9 rounded-xs border border-border-subtle bg-white px-3.5 text-xs font-semibold text-brand-charcoal hover:border-brand-navy/40 hover:text-brand-navy transition-colors"
        >
          Muat ulang
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xs border border-brand-maroon/20 bg-brand-maroon/5 p-3 text-sm text-brand-maroon">
          {error} <Link href="/login?next=%2Fadmin" className="underline font-semibold">Login admin</Link>
        </p>
      )}

      {!error && summary && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xs border border-brand-teal/30 bg-brand-teal/5 p-3 font-mono text-xs text-brand-charcoal">
          <span>Transaksi testing terverifikasi: <strong>{summary.paidCount}</strong></span>
          <span className="text-border-subtle">|</span>
          <span>Total pembayaran disetujui: <strong>{formatRupiah(summary.paidTotal)}</strong></span>
          <span className="text-[10px] text-on-surface-variant">(Pending dan rejected tidak dihitung)</span>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3 text-xs">
        <input
          className="min-h-10 rounded-xs border border-border-subtle bg-white px-3 text-xs focus:border-brand-maroon focus:outline-none flex-1 min-w-[200px]"
          placeholder="Cari Order ID..."
          aria-label="Cari Order ID"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="min-h-10 rounded-xs border border-border-subtle bg-white px-3 text-xs focus:border-brand-maroon focus:outline-none font-mono"
          aria-label="Filter pembayaran"
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
        >
          <option value="">Semua status pembayaran</option>
          {['pending', 'awaiting_verification', 'paid', 'rejected', 'cancelled'].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <select
          className="min-h-10 rounded-xs border border-border-subtle bg-white px-3 text-xs focus:border-brand-maroon focus:outline-none font-mono"
          aria-label="Filter pengiriman"
          value={fulfillmentFilter}
          onChange={(event) => setFulfillmentFilter(event.target.value)}
        >
          <option value="">Semua status pengiriman</option>
          {['pending', 'processing', 'roasting', 'shipped', 'completed', 'cancelled'].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>

      {!error && filtered.length === 0 && (
        <div className="mt-8 rounded-xs border border-dashed border-border-subtle p-8 text-center text-sm text-on-surface-variant">
          Belum ada order yang cocok dengan filter pencarian.
        </div>
      )}

      <div className="mt-5 space-y-4">
        {filtered.map((order) => (
          <article
            key={order.id}
            className="rounded-sm border border-border-subtle bg-white p-4 shadow-2xs hover:border-brand-navy/40 transition-colors text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-brand-charcoal">{order.id}</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${getStatusBadge(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${getStatusBadge(order.fulfillmentStatus)}`}>
                  {order.fulfillmentStatus}
                </span>
              </div>
              <strong className="font-mono text-base font-bold text-brand-charcoal">
                {formatRupiah(order.total)}
              </strong>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
              <div>
                <p className="font-semibold text-brand-charcoal">{order.customerName}</p>
                <p className="text-on-surface-variant font-mono">{order.customerEmail}</p>
                <p className="mt-1 text-on-surface-variant leading-relaxed">
                  {order.shipping.recipientName}, {order.shipping.fullAddress}, {order.shipping.district}, {order.shipping.city}, {order.shipping.province} {order.shipping.postalCode}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-on-surface-variant">
                  Metode: <strong className="text-brand-charcoal">{order.paymentMethod === 'qris_static' ? 'QRIS statis' : 'BCA manual'}</strong>
                </p>
                <p className="text-on-surface-variant">
                  Subtotal: {formatRupiah(order.subtotal)} · Ongkir: {formatRupiah(order.shippingCost)}
                </p>
                {order.shipping.courierName && (
                  <p className="text-on-surface-variant">
                    Pengiriman: <strong className="text-brand-charcoal">{order.shipping.courierName} ({order.shipping.courierService})</strong>
                  </p>
                )}
                {order.trackingNumber && (
                  <p className="font-mono text-brand-teal font-semibold">Resi: {order.trackingNumber}</p>
                )}
                {order.rejectionReason && (
                  <p className="text-brand-maroon font-semibold">Alasan penolakan: {order.rejectionReason}</p>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-xs bg-[#F8FAFC] p-2.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Item Dipesan
              </p>
              <ul className="space-y-1 text-xs">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between font-mono text-xs">
                    <span>{item.quantity}x {item.productName} ({item.variantLabel})</span>
                    <span className="font-bold">{formatRupiah(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="font-mono text-[10px] text-on-surface-variant">
                {order.checkoutMode === 'testing' ? 'Order pengujian lokal.' : 'Order terverifikasi.'}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {order.paymentStatus !== 'pending' && (
                  <a
                    href={`/api/customer/admin/orders/${order.id}/proof-file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-8 items-center rounded-xs border border-border-subtle bg-white px-3 text-xs font-semibold text-brand-charcoal hover:border-brand-navy/40 hover:text-brand-navy transition-colors"
                  >
                    Lihat bukti
                  </a>
                )}

                {order.paymentStatus === 'awaiting_verification' && (
                  <>
                    <button
                      type="button"
                      disabled={busy === order.id}
                      onClick={() => openDecision(order.id, 'approve')}
                      className="min-h-8 rounded-xs bg-brand-teal px-3 text-xs font-bold text-white hover:bg-brand-teal/90 transition-colors disabled:opacity-50"
                    >
                      Setujui pembayaran
                    </button>
                    <button
                      type="button"
                      disabled={busy === order.id}
                      onClick={() => openDecision(order.id, 'reject')}
                      className="min-h-8 rounded-xs border border-brand-maroon/30 bg-brand-maroon/5 px-3 text-xs font-semibold text-brand-maroon hover:bg-brand-maroon/10 transition-colors disabled:opacity-50"
                    >
                      Tolak bukti
                    </button>
                  </>
                )}

                {transitions[order.fulfillmentStatus].filter((value) => value === 'cancelled' ? order.paymentStatus !== 'paid' : order.paymentStatus === 'paid').length > 0 && (
                  <select
                    aria-label={`Ubah status order ${order.id}`}
                    className="min-h-8 rounded-xs border border-border-subtle bg-white px-2 text-xs font-semibold text-brand-charcoal"
                    value=""
                    disabled={busy === order.id}
                    onChange={(event) => {
                      const next = event.target.value as CustomerOrder['fulfillmentStatus'];
                      if (next === 'shipped') openDecision(order.id, 'shipped');
                      else void fulfillment(order, next);
                    }}
                  >
                    <option value="">Ubah pengiriman…</option>
                    {transitions[order.fulfillmentStatus].filter((value) => value === 'cancelled' ? order.paymentStatus !== 'paid' : order.paymentStatus === 'paid').map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {decision?.orderId === order.id && (
              <form
                className="mt-4 space-y-3 rounded-xs border border-border-subtle bg-[#F8FAFC] p-4 text-xs"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (decision.action === 'shipped') void fulfillment(order, 'shipped');
                  else void payment(order, decision.action);
                }}
              >
                <h4 className="font-headline font-bold text-sm text-brand-charcoal">
                  {decision.action === 'approve' ? 'Verifikasi Dana Masuk' : decision.action === 'reject' ? 'Tolak Bukti Pembayaran' : 'Catat Pengiriman Resi'}
                </h4>

                {decision.action === 'approve' && (
                  <label className="flex items-start gap-3 text-xs leading-relaxed text-brand-charcoal cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded accent-brand-navy"
                      required
                      checked={receiptConfirmed}
                      onChange={(event) => setReceiptConfirmed(event.target.checked)}
                    />
                    <span>Saya sudah mencocokkan nominal dan order ini dengan mutasi bank atau QRIS, serta memastikan dana benar-benar diterima.</span>
                  </label>
                )}

                {decision.action === 'reject' && (
                  <label className="block text-xs">
                    <span className="block mb-1 font-semibold text-brand-charcoal">Alasan Penolakan</span>
                    <textarea
                      className="w-full rounded-xs border border-border-subtle bg-white p-2.5 text-xs focus:border-brand-maroon focus:outline-none"
                      required
                      minLength={3}
                      maxLength={1000}
                      rows={3}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                    />
                  </label>
                )}

                {decision.action === 'shipped' && (
                  <label className="block text-xs">
                    <span className="block mb-1 font-semibold text-brand-charcoal">Nomor Resi Pengiriman</span>
                    <input
                      className="w-full rounded-xs border border-border-subtle bg-white p-2.5 font-mono text-xs font-bold text-brand-charcoal focus:border-brand-maroon focus:outline-none"
                      required
                      maxLength={100}
                      value={trackingNumber}
                      onChange={(event) => setTrackingNumber(event.target.value)}
                      placeholder="JNE-1234567890"
                    />
                  </label>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={busy === order.id || (decision.action === 'approve' && !receiptConfirmed)}
                    className="min-h-9 rounded-xs bg-brand-charcoal px-4 text-xs font-semibold text-white hover:bg-brand-navy transition-colors disabled:opacity-50"
                  >
                    {busy === order.id ? 'Menyimpan…' : 'Simpan keputusan'}
                  </button>
                  <button
                    type="button"
                    disabled={busy === order.id}
                    onClick={() => setDecision(null)}
                    className="min-h-9 rounded-xs border border-border-subtle bg-white px-4 text-xs font-semibold text-brand-charcoal hover:bg-black/[0.04] transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
