'use client';

import { FormEvent, useEffect, useState } from 'react';
import { formatRupiah } from '../lib/data';
import { customerApi, customerJson } from '../lib/customer-api';

type Balance = { resourceId: string; unit: 'gram' | 'unit'; availableQuantity: number; verified: boolean };
type Package = { skuId: string; slug: string; name: string; variant: string; weightGrams: number };
type Movement = { resourceId: string; delta: number; reason: string; createdAt: string };
type Origin = { name: string; fullAddress: string; city: string; province: string; postalCode: string };
type Rate = { province: string; city: string; district: string; amountIdr: number;
  courierCode: 'jne' | 'jnt'; serviceName: string; maxWeightGrams: number; sourceUrl: string; verifiedAt?: string };
type ShippingProduct = { skuId: string; label: string };
const emptyOrigin: Origin = { name: '', fullAddress: '', city: '', province: '', postalCode: '' };
const emptyRate: Rate = { province: '', city: '', district: '', amountIdr: 0,
  courierCode: 'jne', serviceName: '', maxWeightGrams: 1000, sourceUrl: '' };

export function AdminOperationalCommerce() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [origin, setOrigin] = useState<Origin>(emptyOrigin);
  const [rates, setRates] = useState<Rate[]>([]);
  const [shippingProducts, setShippingProducts] = useState<ShippingProduct[]>([]);
  const [shippingWeights, setShippingWeights] = useState<Record<string, number>>({});
  const [weightSku, setWeightSku] = useState('');
  const [packedWeight, setPackedWeight] = useState('');
  const [adjustResource, setAdjustResource] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [packSku, setPackSku] = useState('');
  const [packQuantity, setPackQuantity] = useState('');
  const [rate, setRate] = useState<Rate>(emptyRate);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refresh() {
    const [inventory, history, shipping, weights] = await Promise.all([
      customerApi<{ balances: Balance[]; packages: Package[] }>('admin/inventory'),
      customerApi<Movement[]>('admin/inventory/movements'),
      customerApi<{ origin: Origin | null; rates: Rate[] }>('admin/shipping'),
      customerApi<{ products: ShippingProduct[]; weights: Record<string, number> }>('admin/shipping/weights'),
    ]);
    setBalances(inventory.balances); setPackages(inventory.packages); setMovements(history);
    setOrigin(shipping.origin ?? emptyOrigin); setRates(shipping.rates);
    setShippingProducts(weights.products); setShippingWeights(weights.weights);
    setReady(true);
  }

  useEffect(() => { void refresh().catch((cause) => setError(
    cause instanceof Error && cause.message === 'Not Found'
      ? 'Backend yang berjalan belum memuat API stok dan ongkir terbaru. Restart npm run ai:start, lalu muat ulang halaman ini.'
      : cause instanceof Error ? cause.message : 'Konfigurasi operasional belum tersedia.'));
  }, []);

  async function save(event: FormEvent, path: string, value: unknown, method: 'POST' | 'PUT', message: string) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      await customerApi(`admin/${path}`, customerJson(method, value));
      await refresh(); setNotice(message);
      if (path === 'inventory/adjust') { setQuantity(''); setReason(''); }
      if (path === 'inventory/pack') setPackQuantity('');
      if (path === 'shipping/rate') setRate(emptyRate);
      if (path === 'shipping/weights') { setWeightSku(''); setPackedWeight(''); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Perubahan belum tersimpan.'); }
    finally { setBusy(false); }
  }

  const resources = Array.from(new Set([
    ...balances.map((row) => row.resourceId), ...packages.map((item) => `pack:${item.skuId}`),
  ])).sort();

  if (!ready) return <section className="rounded-xl border border-border-subtle bg-white p-5 sm:p-6" aria-live="polite">
    <h3 className="font-headline text-lg font-bold text-brand-charcoal">Stok & ongkir operasional</h3>
    <p className="mt-2 text-sm text-on-surface-variant">Memuat saldo stok, asal pengiriman, dan tarif kurir yang dicatat admin.</p>
    {error && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-brand-charcoal">{error}</p>}
  </section>;

  return <section className="rounded-xl border border-border-subtle bg-white p-5 sm:p-6">
    <h3 className="font-headline text-lg font-bold text-brand-charcoal">Stok & ongkir operasional</h3>
    <p className="mt-2 text-sm text-on-surface-variant">Saldo lama berlabel belum terverifikasi. Masukkan hasil hitung fisik sebagai saldo tersedia di luar reservasi. Pengemasan baru harus memakai konversi curah ke kemasan.</p>
    {(!balances.some((row) => row.verified) || !origin.name) && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm">Checkout operasional belum siap: stok fisik dan alamat asal harus diverifikasi sebelum mode operasional diaktifkan.</p>}
    <p className="mt-3 text-sm text-on-surface-variant">Tujuan Pulau Jawa mendapat gratis ongkir; biaya kurir ditanggung usaha. Tujuan di luar Jawa memakai tarif JNE/J&T yang admin catat dari kalkulator resmi sesuai berat paket. Tarif bukan hasil pengecekan live dan harus diperbarui bila berubah.</p>
    {error && <p role="alert" className="mt-4 text-sm text-brand-maroon">{error}</p>}
    {notice && <p role="status" className="mt-4 text-sm text-brand-navy">{notice}</p>}
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <form className="space-y-3 rounded-lg border border-border-subtle p-4" onSubmit={(event) => save(event, 'inventory/adjust', {
        resourceId: adjustResource, availableQuantity: Number(quantity), reason,
      }, 'POST', 'Saldo stok tersimpan dan diaudit.')}>
        <h4 className="font-semibold">Catat stok fisik / koreksi</h4>
        <label className="block text-sm">Sumber stok
          <select className="field-control mt-1 w-full" required value={adjustResource} onChange={(event) => setAdjustResource(event.target.value)}>
            <option value="">Pilih sumber</option>
            {resources.map((resource) => <option key={resource} value={resource}>{resource}</option>)}
          </select>
        </label>
        <label className="block text-sm">Saldo tersedia (gram untuk curah, unit untuk kemasan/aksesori)
          <input className="field-control mt-1 w-full" type="number" min="0" max="1000000" step="1" required value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </label>
        <label className="block text-sm">Alasan dan sumber hitung fisik
          <input className="field-control mt-1 w-full" minLength={3} maxLength={500} required value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>
        <button disabled={busy} className="min-h-11 rounded-lg bg-brand-charcoal px-4 text-sm font-semibold text-white disabled:opacity-50">Simpan saldo</button>
      </form>
      <form className="space-y-3 rounded-lg border border-border-subtle p-4" onSubmit={(event) => save(event, 'inventory/pack', {
        skuId: packSku, quantity: Number(packQuantity),
      }, 'POST', 'Curah dikurangi dan kemasan ditambah dalam satu transaksi.')}>
        <h4 className="font-semibold">Konversi curah menjadi kemasan</h4>
        <label className="block text-sm">SKU kemasan
          <select className="field-control mt-1 w-full" required value={packSku} onChange={(event) => setPackSku(event.target.value)}>
            <option value="">Pilih kemasan</option>
            {packages.map((item) => <option key={item.skuId} value={item.skuId}>{item.name} · {item.variant}</option>)}
          </select>
        </label>
        <label className="block text-sm">Jumlah kemasan
          <input className="field-control mt-1 w-full" type="number" min="1" max="10000" step="1" required value={packQuantity} onChange={(event) => setPackQuantity(event.target.value)} />
        </label>
        <button disabled={busy} className="min-h-11 rounded-lg bg-brand-charcoal px-4 text-sm font-semibold text-white disabled:opacity-50">Catat pengemasan</button>
      </form>
      <form className="space-y-3 rounded-lg border border-border-subtle p-4" onSubmit={(event) => save(event, 'shipping/origin', origin, 'PUT', 'Alamat asal pengiriman tersimpan.')}>
        <h4 className="font-semibold">Alamat asal pengiriman</h4>
        {([['name', 'Nama lokasi'], ['fullAddress', 'Alamat lengkap'], ['city', 'Kota'], ['province', 'Provinsi'], ['postalCode', 'Kode pos']] as const).map(([key, label]) =>
          <label key={key} className="block text-sm">{label}<input className="field-control mt-1 w-full" required value={origin[key]}
            minLength={key === 'fullAddress' ? 5 : key === 'postalCode' ? 5 : 2} maxLength={key === 'fullAddress' ? 500 : 100}
            onChange={(event) => setOrigin((current) => ({ ...current, [key]: event.target.value }))} /></label>)}
        <button disabled={busy} className="min-h-11 rounded-lg bg-brand-charcoal px-4 text-sm font-semibold text-white disabled:opacity-50">Simpan asal</button>
      </form>
      <form className="space-y-3 rounded-lg border border-border-subtle p-4" onSubmit={(event) => save(event, 'shipping/rate', rate, 'PUT', 'Tarif tujuan tersimpan.')}>
        <h4 className="font-semibold">Tarif dari website resmi JNE/J&T</h4>
        <p className="text-xs text-on-surface-variant">Periksa asal, tujuan, layanan, dan berat paket di <a className="underline" href="https://www.jne.co.id/shipping-fee" target="_blank" rel="noopener noreferrer">JNE</a> atau <a className="underline" href="https://jet.co.id/rates" target="_blank" rel="noopener noreferrer">J&T</a>, lalu salin tarif yang tampil.</p>
        {([['province', 'Provinsi'], ['city', 'Kota/Kabupaten'], ['district', 'Kecamatan']] as const).map(([key, label]) =>
          <label key={key} className="block text-sm">{label}<input className="field-control mt-1 w-full" required minLength={2} maxLength={100} value={rate[key]}
            onChange={(event) => setRate((current) => ({ ...current, [key]: event.target.value }))} /></label>)}
        <label className="block text-sm">Kurir
          <select className="field-control mt-1 w-full" value={rate.courierCode} onChange={(event) => setRate((current) => ({ ...current, courierCode: event.target.value as Rate['courierCode'], sourceUrl: '' }))}>
            <option value="jne">JNE</option><option value="jnt">J&T</option>
          </select>
        </label>
        <label className="block text-sm">Nama layanan
          <input className="field-control mt-1 w-full" required minLength={2} maxLength={100} value={rate.serviceName}
            onChange={(event) => setRate((current) => ({ ...current, serviceName: event.target.value }))} placeholder="Contoh: REG atau EZ" />
        </label>
        <label className="block text-sm">Batas berat paket pada tarif ini (gram)
          <input className="field-control mt-1 w-full" type="number" min="1" max="100000" step="1" required value={rate.maxWeightGrams}
            onChange={(event) => setRate((current) => ({ ...current, maxWeightGrams: Number(event.target.value) }))} />
        </label>
        <label className="block text-sm">Tarif rupiah
          <input className="field-control mt-1 w-full" type="number" min="0" max="1000000" step="1" required value={rate.amountIdr}
            onChange={(event) => setRate((current) => ({ ...current, amountIdr: Number(event.target.value) }))} />
        </label>
        <label className="block text-sm">URL kalkulator resmi yang diperiksa
          <input className="field-control mt-1 w-full" type="url" required maxLength={500} value={rate.sourceUrl}
            onChange={(event) => setRate((current) => ({ ...current, sourceUrl: event.target.value }))} placeholder={rate.courierCode === 'jne' ? 'https://www.jne.co.id/shipping-fee' : 'https://jet.co.id/rates'} />
        </label>
        <button disabled={busy} className="min-h-11 rounded-lg bg-brand-charcoal px-4 text-sm font-semibold text-white disabled:opacity-50">Simpan tarif</button>
      </form>
      <form className="space-y-3 rounded-lg border border-border-subtle p-4" onSubmit={(event) => save(event, 'shipping/weights', {
        skuId: weightSku, packedWeightGrams: Number(packedWeight),
      }, 'PUT', 'Berat paket terverifikasi tersimpan.')}>
        <h4 className="font-semibold">Berat paket siap kirim</h4>
        <p className="text-xs text-on-surface-variant">Timbang produk beserta kemasan dan pelindungnya. Tarif JNE/J&T harus cocok dengan total berat keranjang.</p>
        <label className="block text-sm">Produk / varian
          <select className="field-control mt-1 w-full" required value={weightSku} onChange={(event) => {
            setWeightSku(event.target.value); setPackedWeight(String(shippingWeights[event.target.value] ?? ''));
          }}><option value="">Pilih produk</option>{shippingProducts.map((item) =>
            <option key={item.skuId} value={item.skuId}>{item.label}</option>)}</select>
        </label>
        <label className="block text-sm">Berat paket per unit (gram)
          <input className="field-control mt-1 w-full" type="number" min="1" max="100000" step="1" required value={packedWeight}
            onChange={(event) => setPackedWeight(event.target.value)} />
        </label>
        <button disabled={busy} className="min-h-11 rounded-lg bg-brand-charcoal px-4 text-sm font-semibold text-white disabled:opacity-50">Simpan berat paket</button>
      </form>
    </div>
    <details className="mt-6 rounded-lg border border-border-subtle p-4 text-sm"><summary className="cursor-pointer font-semibold">Saldo, tarif, dan riwayat mutasi</summary>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div><h4 className="font-semibold">Saldo stok</h4><ul className="mt-2 max-h-72 space-y-2 overflow-auto">{balances.map((row) =>
          <li key={row.resourceId} className="flex justify-between gap-3 border-b pb-1"><span className="break-all">{row.resourceId}</span><span className="shrink-0">{row.availableQuantity} {row.unit} · {row.verified ? 'terverifikasi' : 'belum'}</span></li>)}</ul></div>
        <div><h4 className="font-semibold">Tarif tujuan</h4><ul className="mt-2 max-h-72 space-y-2 overflow-auto">{rates.map((row) =>
          <li key={`${row.province}/${row.city}/${row.district}/${row.courierCode}/${row.serviceName}/${row.maxWeightGrams}`} className="flex justify-between gap-3 border-b pb-1"><span>{row.courierCode.toUpperCase()} {row.serviceName} · {row.district}, {row.city}, {row.province} · sampai {row.maxWeightGrams} g<br /><a className="text-xs underline" href={row.sourceUrl} target="_blank" rel="noopener noreferrer">Sumber resmi</a></span><span>{formatRupiah(row.amountIdr)}</span></li>)}</ul></div>
      </div>
      <h4 className="mt-5 font-semibold">Mutasi terbaru</h4><ul className="mt-2 max-h-72 space-y-2 overflow-auto">{movements.map((row, index) =>
        <li key={`${row.createdAt}-${index}`} className="border-b pb-1">{row.resourceId}: {row.delta > 0 ? '+' : ''}{row.delta} · {row.reason}</li>)}</ul>
    </details>
  </section>;
}
