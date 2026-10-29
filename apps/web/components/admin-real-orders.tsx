'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Copy, FileText, MapPin, Phone, Search } from 'lucide-react';
import { PRODUCTS, formatRupiah, getProductDisplayImage } from '../lib/data';
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

const fulfillmentLabels: Record<CustomerOrder['fulfillmentStatus'], string> = {
  pending: 'Menunggu Pembayaran',
  processing: 'Sedang Diproses',
  roasting: 'Sedang Disangrai & Packing',
  shipped: 'Dalam Pengiriman Kurir',
  completed: 'Pesanan Selesai',
  cancelled: 'Pesanan Dibatalkan',
};

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

function getOrderItemImage(item: CustomerOrder['items'][number]) {
  const product = PRODUCTS.find((entry) =>
    item.skuId.startsWith(entry.id) || entry.name.toLowerCase() === item.productName.toLowerCase());
  return product ? getProductDisplayImage(product) : '/images/bag-prau.jpg';
}

export function AdminVerifiedPayments() {
  const productionCommerce = process.env.NEXT_PUBLIC_CUSTOMER_COMMERCE_MODE === 'operational';
  const [summary, setSummary] = useState<{ paidCount: number; paidTotal: number } | null>(null);
  useEffect(() => {
    customerApi<{ paidCount: number; paidTotal: number }>('admin/payment-summary')
      .then(setSummary).catch(() => setSummary(null));
  }, []);
  return (
    <section className="rounded-sm border border-border-subtle bg-white p-5 shadow-2xs text-sm">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-brand-teal" />
        <h2 className="font-headline text-base font-bold text-brand-charcoal">Pembayaran database</h2>
      </div>
      <p className="mt-2 text-on-surface-variant leading-relaxed">
        {summary
          ? `${summary.paidCount} order berstatus paid · ${formatRupiah(summary.paidTotal)} disetujui admin${productionCommerce ? '.' : ' dalam pengujian lokal.'}`
          : 'Masuk dengan akun admin untuk melihat pembayaran database.'}
      </p>
      <p className="mt-1 font-mono text-[10px] text-on-surface-variant">
        Terpisah dari metrik demo. Persetujuan admin dilakukan setelah dana benar-benar diperiksa.
      </p>
    </section>
  );
}

export function AdminRealOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [search, setSearch] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('');
  const [copiedId, setCopiedId] = useState('');
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
      const saved = await customerApi<CustomerOrder[]>('admin/orders');
      setOrders(saved);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Order database tidak dapat dimuat.');
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

  const query = search.trim().toLowerCase();
  const filtered = orders.filter((order) =>
    (!query || [order.id, order.customerName, order.customerEmail, order.shipping.whatsapp,
      order.shipping.city, order.trackingNumber ?? ''].some((value) => value.toLowerCase().includes(query)))
    && (!fulfillmentFilter || order.fulfillmentStatus === fulfillmentFilter));

  function copy(text: string, id: string) {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(''), 1800);
  }

  return (
    <section className="space-y-6">

      {error && (
        <p role="alert" className="mt-4 rounded-xs border border-brand-maroon/20 bg-brand-maroon/5 p-3 text-sm text-brand-maroon">
          {error} <Link href="/login?next=%2Fadmin%2Forders" className="underline font-semibold">Login admin</Link>
        </p>
      )}

      <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative max-w-md flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <span className="sr-only">Cari pesanan</span>
            <input
              className="h-10 w-full rounded-md border border-border-subtle bg-slate-50/70 pl-9 pr-3 text-xs text-brand-charcoal placeholder:text-on-surface-variant focus:border-brand-navy focus:bg-white focus:outline-none"
              placeholder="Cari ID pesanan, nama pemesan, no HP, kota, resi..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap rounded-lg border border-border-subtle bg-slate-100/60 p-0.5 font-mono text-xs">
            {(['', 'pending', 'processing', 'roasting', 'shipped', 'completed', 'cancelled'] as const).map((status) => {
              const labels = { '': 'Semua', pending: 'Menunggu', processing: 'Diproses', roasting: 'Sangrai & Pack', shipped: 'Dikirim', completed: 'Selesai', cancelled: 'Batal' };
              const count = status ? orders.filter((order) => order.fulfillmentStatus === status).length : orders.length;
              return (
                <button key={status || 'all'} type="button" onClick={() => setFulfillmentFilter(status)}
                  className={`rounded-md px-3 py-1.5 transition ${fulfillmentFilter === status ? 'bg-white font-semibold text-brand-charcoal shadow-xs' : 'text-on-surface-variant hover:text-brand-charcoal'}`}>
                  {labels[status]} <span className="text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {!error && filtered.length === 0 && (
        <div className="mt-8 rounded-xs border border-dashed border-border-subtle p-8 text-center text-sm text-on-surface-variant">
          Belum ada order yang cocok dengan filter pencarian.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filtered.map((order) => (
          <article
            key={order.id}
            className="flex flex-col rounded-xl border border-border-subtle bg-white p-5 shadow-xs transition-colors hover:border-brand-navy/30 text-sm"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold tracking-tight text-brand-charcoal">{order.id}</span>
                  <button type="button" onClick={() => copy(order.id, order.id)} aria-label="Salin Order ID" title="Salin Order ID" className="p-0.5 text-on-surface-variant hover:text-brand-charcoal">
                    {copiedId === order.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">{formatOrderDate(order.createdAt)}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${getStatusBadge(order.fulfillmentStatus)}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />{fulfillmentLabels[order.fulfillmentStatus]}
              </span>
            </div>

            <div className="mt-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand-charcoal">{order.customerName}</p>
                <a href={`https://wa.me/${order.shipping.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-[11px] text-brand-navy hover:underline">
                  <Phone size={11} />{order.shipping.whatsapp}
                </a>
              </div>
              <p className="flex items-start gap-1.5 text-[11px] text-on-surface-variant">
                <MapPin size={13} className="mt-0.5 shrink-0" />
                <span>{order.shipping.fullAddress}, {order.shipping.district}, {order.shipping.city}, {order.shipping.province} {order.shipping.postalCode}</span>
              </p>
              {order.shipping.notes && <p className="flex items-start gap-1.5 rounded-md border border-amber-200/50 bg-amber-50/60 p-2 text-[11px] text-amber-900"><FileText size={12} className="mt-0.5 shrink-0" />Catatan: {order.shipping.notes}</p>}
              {order.rejectionReason && <p className="font-semibold text-brand-maroon">Alasan penolakan: {order.rejectionReason}</p>}
            </div>

            <div className="mt-4 rounded-lg border border-border-subtle bg-slate-50/70 p-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Item Pesanan ({order.items.reduce((total, item) => total + item.quantity, 0)} item)
              </p>
              <ul className="divide-y divide-border-subtle/60 text-xs">
                {order.items.map((item, index) => (
                  <li key={index} className="flex items-center justify-between gap-3 py-2 first:pt-1 last:pb-0">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Image src={getOrderItemImage(item)} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-md border border-border-subtle bg-white object-cover" unoptimized />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-brand-charcoal"><span className="mr-1.5 rounded border border-border-subtle bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold">{item.quantity}x</span>{item.productName}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-on-surface-variant">{item.variantLabel} · {item.grindLabel || 'Biji utuh'}</p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-xs font-semibold">{formatRupiah(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md border border-border-subtle p-2.5">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">Pembayaran</span>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-medium text-brand-charcoal">{order.paymentMethod === 'qris_static' ? 'QRIS' : 'BCA Manual'}</span>
                  <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold ${getStatusBadge(order.paymentStatus)}`}>{order.paymentStatus === 'paid' ? 'Lunas' : order.paymentStatus}</span>
                </div>
              </div>
              <div className="rounded-md border border-border-subtle p-2.5">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">Kurir &amp; Resi</span>
                <p className="mt-1 truncate text-[11px] font-medium text-brand-charcoal">{order.shipping.courierName || order.shipping.courierService || 'Belum ditentukan'}</p>
                {order.trackingNumber ? <button type="button" onClick={() => copy(order.trackingNumber!, `track-${order.id}`)} className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-brand-navy hover:underline">{order.trackingNumber}{copiedId === `track-${order.id}` ? <Check size={10} /> : <Copy size={10} />}</button> : <p className="mt-0.5 font-mono text-[10px] text-amber-800">Resi belum diinput</p>}
              </div>
            </div>

            <div className="mt-3.5 flex items-baseline justify-between border-t border-border-subtle pt-3">
              <span className="text-xs font-medium text-on-surface-variant">Total Pembayaran:</span>
              <strong className="font-mono text-base text-brand-charcoal">{formatRupiah(order.total)}</strong>
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
