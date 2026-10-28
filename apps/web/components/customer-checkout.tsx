'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatRupiah, WHATSAPP_URL } from '../lib/data';
import { useCartStore } from '../lib/store/useCartStore';
import { CustomerApiError, customerApi, customerJson } from '../lib/customer-api';
import type { CustomerAddress, CustomerOrder, CustomerUser } from '../lib/customer-types';

function sku(item: { productId: string; slug: string; weightGrams: number; weightLabel: string; grindLabel: string }) {
  if (item.productId.startsWith('addon-')) return item.productId;
  if (item.productId.startsWith('byob-')) return `byob:${item.productId}`;
  const kind = item.weightGrams === 1 && item.grindLabel.startsWith('Slowbar') ? 'cup' : 'beans';
  return `${item.slug}:${kind}:${item.weightGrams}:${encodeURIComponent(item.weightLabel)}`;
}

type ShippingOption = { id: string; courier: string; service: string; duration: string; price: number };
type CheckoutPolicy = { shippingCost: number; shippingPolicy: string; shippingOptions: ShippingOption[];
  paymentHours: number; mode: 'testing' | 'operational' };

export function CustomerCheckout() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [policy, setPolicy] = useState<CheckoutPolicy | null>(null);
  const [shippingOptionId, setShippingOptionId] = useState('');
  const [addressId, setAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<CustomerAddress, 'id'>>({
    recipientName: '', whatsapp: '', province: '', city: '', district: '',
    postalCode: '', fullAddress: '', notes: '', isDefault: true,
  });
  const [addressError, setAddressError] = useState('');
  const [method, setMethod] = useState<'qris_static' | 'bca_transfer'>('qris_static');
  const [voucherCode, setVoucherCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const unsupportedItems = items.filter((item) => item.productId.startsWith('byob-') && !item.blendComponents?.length);
  const lines = useMemo(() => items.map((item) => ({
    skuId: sku(item), quantity: item.quantity, unitPrice: item.unitPrice, grindLabel: item.grindLabel,
    ...(item.productId.startsWith('byob-') ? { weightGrams: item.weightGrams, blendComponents: item.blendComponents } : {}),
  })), [items]);
  const selectedShipping = policy?.shippingOptions.find((option) => option.id === shippingOptionId);
  const manualShipping = selectedShipping?.id === 'manual-confirmation';
  const destination = addresses.find((address) => address.id === addressId);
  const shippingRequest = `Halo 52 Coffee, saya ingin meminta konfirmasi ongkir JNE/J&T sebelum membayar.\n\nTujuan: ${destination?.district ?? ''}, ${destination?.city ?? ''}, ${destination?.province ?? ''} ${destination?.postalCode ?? ''}\nProduk:\n${items.map((item) => `- ${item.name} ${item.weightLabel} × ${item.quantity}`).join('\n')}\nTotal berat isi yang tertera: ${items.reduce((sum, item) => sum + item.weightGrams * item.quantity, 0)} gram (berat paket akhir perlu ditimbang).\n\nMohon info tarif dan langkah pemesanan. Terima kasih.`;

  useEffect(() => {
    customerApi<CustomerUser>('auth/me').then(async (person) => {
      setUser(person);
      const saved = await customerApi<CustomerAddress[]>('addresses');
      setAddresses(saved);
      setAddressId(saved.find((item) => item.isDefault)?.id ?? saved[0]?.id ?? '');
    }).catch((cause) => {
      if (cause instanceof CustomerApiError && cause.status === 401) router.replace('/login?next=%2Fcheckout');
      else setError(cause instanceof Error ? cause.message : 'Checkout testing belum tersedia.');
    }).finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!user || !addressId || !lines.length || unsupportedItems.length) return;
    let active = true;
    setPolicy(null); setShippingOptionId('');
    setError('');
    customerApi<CheckoutPolicy>('checkout-policy', customerJson('POST', { addressId, items: lines }))
      .then((result) => { if (active) { setPolicy(result); setShippingOptionId(result.shippingOptions[0]?.id ?? ''); } })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Ongkir belum tersedia.'); });
    return () => { active = false; };
  }, [user, addressId, lines, unsupportedItems.length]);

  async function saveAddress() {
    const value = Object.fromEntries(Object.entries(newAddress).map(([key, field]) =>
      [key, typeof field === 'string' ? field.trim() : field])) as Omit<CustomerAddress, 'id'>;
    if (value.recipientName.length < 2 || !/^[1-9]\d{7,14}$/.test(value.whatsapp)
        || [value.province, value.city, value.district].some((field) => field.length < 2)
        || !/^\d{5}$/.test(value.postalCode) || value.fullAddress.length < 5) {
      setAddressError('Lengkapi alamat dan gunakan nomor WhatsApp internasional serta kode pos 5 digit.');
      return;
    }
    setBusy(true); setAddressError('');
    try {
      const saved = await customerApi<CustomerAddress>('addresses', customerJson('POST', value));
      setAddresses((current) => [...current, saved]);
      setPolicy(null);
      setAddressId(saved.id);
      setShowAddressForm(false);
    } catch (cause) {
      setAddressError(cause instanceof Error ? cause.message : 'Alamat belum dapat disimpan.');
    } finally { setBusy(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!addressId || !items.length || !policy || !selectedShipping || manualShipping) return;
    const fingerprint = JSON.stringify({ addressId, lines, method, voucherCode, shippingOptionId });
    if (!attempt.current || attempt.current.fingerprint !== fingerprint) {
      attempt.current = { fingerprint, key: crypto.randomUUID() };
    }
    setBusy(true); setError('');
    try {
      const order = await customerApi<CustomerOrder>('orders', customerJson('POST', {
        idempotencyKey: attempt.current.key, addressId, items: lines, paymentMethod: method,
        voucherCode: voucherCode.trim().toUpperCase(),
        shippingOptionId, shippingQuotedPrice: selectedShipping.price,
      }));
      clearCart();
      router.push(`/account/orders/${order.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Pesanan belum dapat dibuat.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <main className="nav-offset site-container page-section" role="status">Memeriksa akun dan alamat…</main>;
  if (!user && !error) return <main className="nav-offset site-container page-section" role="status">Mengalihkan ke login…</main>;
  if (!user) return <main className="nav-offset site-container page-section" role="alert">{error}</main>;
  return <main className="nav-offset site-container page-section max-w-4xl">
    <Link href="/catalog" className="text-sm text-brand-navy underline">Kembali ke katalog</Link>
    <h1 className="mt-5 font-editorial text-3xl font-bold text-brand-charcoal">{policy?.mode === 'operational' ? 'Checkout operasional lokal' : 'Checkout testing'}</h1>
    <p className="mt-2 text-sm text-on-surface-variant">{policy?.mode === 'operational'
      ? 'Pesanan memakai stok dan ongkir yang diverifikasi admin. Pembayaran tetap dikonfirmasi manual.'
      : 'Mode pengujian lokal. Jangan melakukan transfer dana sungguhan. Pesanan dan pembayaran di sini hanya untuk uji alur.'}</p>
    {items.length === 0 ? <p className="mt-8">Keranjang kosong. <Link href="/catalog" className="underline">Pilih produk</Link>.</p>
      : <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-7">
          <section className="rounded-xl border border-border-subtle bg-white p-5">
            <h2 className="font-editorial text-xl font-bold">Alamat pengiriman</h2>
            {addresses.length ? <div className="mt-4 space-y-3">
              {addresses.map((address) => <label key={address.id} className="flex cursor-pointer gap-3 rounded-lg border p-4 text-sm">
                <input type="radio" name="address" checked={addressId === address.id} onChange={() => { setPolicy(null); setShippingOptionId(''); setAddressId(address.id); }} />
                <span><strong>{address.recipientName}</strong><br />{address.fullAddress}, {address.district}, {address.city}, {address.province} {address.postalCode}</span>
              </label>)}
            </div> : <p className="mt-3 text-sm">Tambahkan alamat di sini untuk melanjutkan.</p>}
            {!addresses.length || showAddressForm ? <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {([
                ['recipientName', 'Nama penerima'], ['whatsapp', 'WhatsApp (format 62...)'],
                ['province', 'Provinsi'], ['city', 'Kota/Kabupaten'], ['district', 'Kecamatan'],
                ['postalCode', 'Kode pos'], ['fullAddress', 'Alamat lengkap'], ['notes', 'Catatan (opsional)'],
              ] as const).map(([key, label]) => <label key={key} className={`block text-sm ${key === 'fullAddress' || key === 'notes' ? 'sm:col-span-2' : ''}`}>
                {label}<input className="field-control mt-1 w-full" value={newAddress[key]}
                  maxLength={key === 'fullAddress' || key === 'notes' ? 500 : 100}
                  inputMode={key === 'whatsapp' || key === 'postalCode' ? 'numeric' : undefined}
                  autoComplete={key === 'postalCode' ? 'postal-code' : key === 'fullAddress' ? 'street-address' : undefined}
                  onChange={(event) => setNewAddress((current) => ({ ...current, [key]: event.target.value }))} />
              </label>)}
              {addressError && <p role="alert" className="text-sm text-brand-maroon sm:col-span-2">{addressError}</p>}
              <button type="button" disabled={busy} onClick={saveAddress}
                className="min-h-11 rounded-lg bg-brand-charcoal px-5 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2">
                {busy ? 'Menyimpan alamat…' : 'Simpan dan gunakan alamat'}
              </button>
            </div> : <button type="button" onClick={() => setShowAddressForm(true)} className="mt-4 min-h-11 text-sm font-semibold text-brand-navy underline">Tambah alamat lain</button>}
          </section>
          <section className="rounded-xl border border-border-subtle bg-white p-5">
            <h2 className="font-editorial text-xl font-bold">Metode pembayaran manual</h2>
            <div className="mt-4 space-y-3 text-sm">
              <label className="flex min-h-12 items-center gap-3"><input type="radio" checked={method === 'qris_static'} onChange={() => setMethod('qris_static')} /> QRIS statis</label>
              <label className="flex min-h-12 items-center gap-3"><input type="radio" checked={method === 'bca_transfer'} onChange={() => setMethod('bca_transfer')} /> Transfer BCA manual</label>
            </div>
            <p className="mt-3 text-xs text-on-surface-variant">Nomor rekening atau QRIS ditampilkan setelah order tersimpan. Jangan membayar tanpa memastikan Order ID dan total.</p>
          </section>
        </div>
        <aside className="h-fit rounded-xl border border-border-subtle bg-white p-5">
          <h2 className="font-editorial text-xl font-bold">Ringkasan</h2>
          <ul className="mt-4 space-y-3 text-sm">{items.map((item) => <li key={item.id} className="flex justify-between gap-3">
            <span>{item.name} · {item.weightLabel} × {item.quantity}</span><strong>{formatRupiah(item.unitPrice * item.quantity)}</strong>
          </li>)}</ul>
          <p className="mt-5 border-t pt-4 text-sm">Subtotal katalog: <strong>{formatRupiah(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}</strong></p>
          <label className="mt-4 block text-sm font-semibold" htmlFor="checkout-voucher">Kode promo</label>
          <input id="checkout-voucher" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)}
            maxLength={32} autoComplete="off" className="field-control mt-2 w-full" placeholder="Opsional" />
          {policy && policy.shippingOptions.length > 1 && <fieldset className="mt-5 space-y-2"><legend className="mb-2 text-sm font-semibold">Pilih layanan kurir</legend>
            {policy.shippingOptions.map((option) => <label key={option.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <span className="flex items-center gap-2"><input type="radio" name="shippingOption" checked={shippingOptionId === option.id} onChange={() => setShippingOptionId(option.id)} />
                <span><strong>{option.courier} {option.service}</strong>{option.duration && <small className="block text-on-surface-variant">{option.duration}</small>}</span></span>
              <strong>{formatRupiah(option.price)}</strong>
            </label>)}
          </fieldset>}
          {selectedShipping && policy?.shippingOptions.length === 1 && <p className="mt-4 text-sm">Layanan: <strong>{selectedShipping.courier} · {selectedShipping.service}</strong></p>}
          {manualShipping ? <p className="mt-2 text-sm">Ongkir dan total akhir akan dikonfirmasi sebelum pembayaran. Berat isi dari produk di keranjang dihitung otomatis; kurir memakai berat paket setelah dikemas.</p>
            : selectedShipping && <p className="mt-2 text-sm">Ongkir: <strong>{policy?.mode === 'operational' && selectedShipping.price === 0 ? 'Gratis' : formatRupiah(selectedShipping.price)}</strong><br />Estimasi total sebelum validasi harga server: <strong>{formatRupiah(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) + selectedShipping.price)}</strong></p>}
          <p className="mt-2 text-xs text-on-surface-variant">{policy?.shippingPolicy ?? 'Kebijakan ongkir belum tersedia.'} Harga produk divalidasi ulang oleh server. Pembayaran pending berlaku {policy?.paymentHours ?? '—'} jam.</p>
          {unsupportedItems.length > 0 && <p role="alert" className="mt-4 text-sm text-brand-maroon">Racikan lama perlu dibuat ulang agar komposisinya dapat divalidasi server. Item tetap di keranjang sampai Anda menghapusnya.</p>}
          {error && <p role="alert" className="mt-4 text-sm text-brand-maroon">{error}</p>}
          {!addressId && <p className="mt-4 text-xs text-on-surface-variant">Simpan alamat pengiriman agar tombol pembuatan pesanan aktif.</p>}
          {manualShipping && unsupportedItems.length === 0 ? <a href={`${WHATSAPP_URL}?text=${encodeURIComponent(shippingRequest)}`} target="_blank" rel="noopener noreferrer" className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-brand-charcoal px-4 text-center font-bold text-white">Minta konfirmasi ongkir via WhatsApp</a>
            : <button type="submit" disabled={busy || !addressId || !selectedShipping || unsupportedItems.length > 0 || manualShipping} className="mt-5 min-h-12 w-full rounded-xl bg-brand-charcoal px-4 font-bold text-white disabled:opacity-50">
              {manualShipping ? 'Perbaiki keranjang dahulu' : busy ? 'Menyimpan pesanan…' : 'Buat pesanan pending'}
            </button>}
        </aside>
      </form>}
  </main>;
}
