'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatRupiah, WHATSAPP_URL } from '../lib/data';
import { CustomerApiError, customerApi } from '../lib/customer-api';
import type { CustomerOrder } from '../lib/customer-types';
import { QrisDynamicCard } from './ui/qris-dynamic-card';

type Instructions = {
  orderId: string; total: number; status: string;
} & ({ method: 'qris_static'; merchant: string; imageUrl: string }
  | { method: 'bca_transfer'; bank: string; account: string; holder: string });

function whatsappText(order: CustomerOrder) {
  return [
    'Halo 52 Coffee & Roastery,',
    'Saya ingin mengonfirmasi pesanan berikut:',
    `Order ID: ${order.id}`,
    `Nama: ${order.customerName}`,
    '',
    'Detail Pesanan:',
    ...order.items.map((item) => `${item.productName} — ${item.variantLabel} × ${item.quantity}`),
    '',
    `Subtotal: ${formatRupiah(order.subtotal)}`,
    `Ongkir: ${formatRupiah(order.shippingCost)}`,
    `Total: ${formatRupiah(order.total)}`,
    `Metode Pembayaran: ${order.paymentMethod === 'qris_static' ? 'QRIS statis' : 'Transfer BCA manual'}`,
    'Bukti Pembayaran: Sudah Diunggah',
    `Status: ${order.paymentStatus === 'paid' ? 'Pembayaran terverifikasi' : 'Menunggu verifikasi'}`,
    '',
    'Mohon konfirmasi pesanan saya. Terima kasih.',
  ].join('\n');
}

export function CustomerOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [instructions, setInstructions] = useState<Instructions | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    customerApi<CustomerOrder>(`orders/${orderId}`).then(async (saved) => {
      setOrder(saved);
      const payment = await fetch(`/api/customer/payment-instructions?order=${encodeURIComponent(orderId)}`, { cache: 'no-store' })
        .then((response) => response.ok ? response.json() as Promise<Instructions> : null)
        .catch(() => null);
      setInstructions(payment);
    }).catch((cause) => {
      if (cause instanceof CustomerApiError && cause.status === 401) {
        router.replace('/login?next=' + encodeURIComponent(`/account/orders/${orderId}`));
      } else setLoadError(cause instanceof Error ? cause.message : 'Pesanan belum dapat dimuat.');
    })
      .finally(() => setLoading(false));
  }, [orderId, router]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError(''); setFile(null); setPreview('');
    if (!selected) return;
    if (selected.size > 5_000_000 || !['image/jpeg', 'image/png', 'application/pdf'].includes(selected.type)) {
      setError('Pilih JPG, PNG, atau PDF maksimal 5 MB.');
      return;
    }
    setFile(selected);
    if (selected.type.startsWith('image/')) setPreview(URL.createObjectURL(selected));
  }

  async function upload() {
    if (!file || !order) return;
    setBusy(true); setError('');
    const body = new FormData();
    body.append('file', file);
    try {
      const response = await fetch(`/api/customer/orders/${order.id}/proof`, { method: 'POST', body });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.detail ?? 'Upload gagal.');
      }
      setFile(null); setPreview('');
      setOrder(await customerApi<CustomerOrder>(`orders/${order.id}`));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Koneksi upload terputus. Coba lagi.');
    } finally { setBusy(false); }
  }

  if (loading) return <main className="nav-offset site-container page-section" role="status">Memuat pesanan…</main>;
  if (!order) return <main className="nav-offset site-container page-section" role={loadError ? 'alert' : 'status'}>{loadError || 'Mengalihkan ke login…'}</main>;
  const canUpload = order.paymentStatus === 'pending' || order.paymentStatus === 'rejected';
  const paymentInstructions = canUpload ? instructions : null;
  return <main className="nav-offset site-container page-section max-w-4xl">
    <Link href="/account" className="text-sm text-brand-navy underline">Kembali ke akun</Link>
    <p className="mt-6 font-mono text-xs uppercase tracking-widest text-brand-maroon">Order ID</p>
    <h1 className="mt-1 break-all font-editorial text-2xl font-bold text-brand-charcoal sm:text-3xl">{order.id}</h1>
    <p className="mt-3 text-sm text-on-surface-variant">Pembayaran: <strong>{order.paymentStatus}</strong> · Pengiriman: <strong>{order.fulfillmentStatus}</strong></p>
    {order.checkoutMode === 'testing' && <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-brand-charcoal">Order testing lokal. Jangan melakukan transfer dana sungguhan ke QRIS atau rekening yang ditampilkan.</p>}
    {order.expiresAt && ['pending', 'rejected'].includes(order.paymentStatus) && <p className="mt-2 text-sm text-on-surface-variant">Batas unggah bukti: {new Date(order.expiresAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB.</p>}
    {order.rejectionReason && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-brand-maroon">Bukti ditolak: {order.rejectionReason}</p>}
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-border-subtle bg-white p-5">
        <h2 className="font-editorial text-xl font-bold">Detail pesanan</h2>
        <ul className="mt-4 space-y-3 text-sm">{order.items.map((item, index) => <li key={index} className="flex justify-between gap-3">
          <span>{item.productName} · {item.variantLabel} · {item.grindLabel} × {item.quantity}</span>
          <strong>{formatRupiah(item.lineTotal)}</strong>
        </li>)}</ul>
        <div className="mt-5 space-y-2 border-t pt-4 text-sm">
          <p>Subtotal: {formatRupiah(order.subtotal)}</p>
          <p>Diskon: {formatRupiah(order.discount)}</p>
          <p>Ongkir{order.checkoutMode === 'testing' ? ' testing' : ''}: {order.checkoutMode === 'operational' && order.shippingCost === 0 ? 'Gratis' : formatRupiah(order.shippingCost)}</p>
          <p className="text-lg font-bold">Total: {formatRupiah(order.total)}</p>
        </div>
        <h3 className="mt-6 font-semibold">Dikirim ke</h3>
        <p className="mt-2 text-sm">{order.shipping.recipientName}<br />{order.shipping.fullAddress}, {order.shipping.district}, {order.shipping.city}, {order.shipping.province} {order.shipping.postalCode}</p>
        <p className="mt-3 text-xs text-on-surface-variant">{order.shipping.shippingPolicy}</p>
        {order.shipping.courierName && <p className="mt-2 text-sm">Layanan: {order.shipping.courierName} · {order.shipping.courierService}</p>}
        {order.trackingNumber && <p className="mt-4 text-sm font-semibold">Nomor resi: {order.trackingNumber}</p>}
      </section>
      <div className="space-y-6">
        <section className="rounded-xl border border-border-subtle bg-white p-5">
          <h2 className="font-editorial text-xl font-bold">Instruksi pembayaran testing</h2>
          {!paymentInstructions ? <p className="mt-3 text-sm text-on-surface-variant">{order.paymentStatus === 'paid' ? 'Pembayaran testing telah disetujui admin.' : order.paymentStatus === 'awaiting_verification' ? 'Bukti sedang menunggu verifikasi admin. Jangan membayar ulang.' : order.paymentStatus === 'cancelled' ? 'Pesanan dibatalkan. Jangan melakukan pembayaran.' : 'Instruksi belum tersedia. Jangan melakukan pembayaran.'}</p>
            : paymentInstructions.method === 'qris_static' ? <div className="mt-4 space-y-4 text-sm">
              <QrisDynamicCard amount={order.total} orderId={order.id} />
              <p className="text-center text-xs text-on-surface-variant">Merchant ShopeePay: <strong>{paymentInstructions.merchant}</strong>. Nominal di atas telah terkunci otomatis.</p>
            </div> : <div className="mt-4 space-y-3 text-sm">
              <p>Bank: <strong>{paymentInstructions.bank}</strong></p>
              <p>Nomor rekening: <strong className="font-mono text-lg">{paymentInstructions.account}</strong></p>
              <button type="button" onClick={() => navigator.clipboard.writeText(paymentInstructions.account).then(() => setCopied(true))}
                className="min-h-11 rounded-lg border border-border-subtle px-4 text-sm font-semibold">
                {copied ? 'Tersalin' : 'Salin nomor rekening'}
              </button>
              <p>Atas nama: <strong>{paymentInstructions.holder}</strong></p>
              <p>Transfer tepat <strong>{formatRupiah(order.total)}</strong>, simpan bukti, lalu unggah di bawah. Ini transfer manual, bukan virtual account.</p>
            </div>}
          {['pending', 'rejected'].includes(order.paymentStatus) && <p className="mt-4 text-xs text-on-surface-variant">Order belum lunas sampai admin memverifikasi penerimaan dana.</p>}
        </section>
        {canUpload && paymentInstructions && <section className="rounded-xl border border-border-subtle bg-white p-5">
          <h2 className="font-editorial text-xl font-bold">{order.paymentStatus === 'rejected' ? 'Unggah ulang bukti' : 'Unggah bukti pembayaran'}</h2>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" onChange={selectFile}
            className="mt-4 block w-full text-sm" aria-label="Pilih bukti pembayaran" />
          {preview && <Image unoptimized src={preview} alt="Pratinjau bukti pembayaran" width={240} height={240} className="mt-3 h-auto max-h-60 w-auto max-w-full" />}
          {file?.type === 'application/pdf' && <p className="mt-2 text-sm">PDF: {file.name}</p>}
          {busy && <p role="status" className="mt-3 text-sm">Mengunggah buktiâ€¦</p>}
          {error && <p role="alert" className="mt-3 text-sm text-brand-maroon">{error}</p>}
          <button type="button" disabled={!file || busy} onClick={upload}
            className="mt-4 min-h-11 rounded-lg bg-brand-charcoal px-5 text-sm font-bold text-white disabled:opacity-50">
            {busy ? 'Mengunggah…' : 'Kirim bukti untuk verifikasi'}
          </button>
        </section>}
        {['awaiting_verification', 'paid'].includes(order.paymentStatus) && <section className="rounded-xl border border-border-subtle bg-white p-5">
          <h2 className="font-editorial text-xl font-bold">Konfirmasi via WhatsApp</h2>
          <p className="mt-2 text-sm">Tautan ini membuka draft pesan. Anda tetap perlu menekan Send sendiri.</p>
          <a href={`${WHATSAPP_URL}?text=${encodeURIComponent(whatsappText(order))}`} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-brand-charcoal px-5 text-sm font-bold text-white">
            Buka draft WhatsApp
          </a>
        </section>}
      </div>
    </div>
  </main>;
}
