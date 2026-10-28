'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '../lib/data';
import { CustomerApiError, customerApi, customerJson } from '../lib/customer-api';
import type { CustomerAddress, CustomerOrder, CustomerPayment, CustomerUser } from '../lib/customer-types';

type AddressForm = Omit<CustomerAddress, 'id'>;
const emptyAddress: AddressForm = {
  recipientName: '', whatsapp: '', province: '', city: '', district: '',
  postalCode: '', fullAddress: '', notes: '', isDefault: false,
};

export function CustomerAccount({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [form, setForm] = useState<AddressForm>(emptyAddress);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerApi<CustomerUser>('auth/me').then(async (person) => {
      setUser(person); setName(person.displayName); setWhatsapp(person.whatsapp);
      const saved = await customerApi<CustomerAddress[]>('addresses');
      setAddresses(saved);
      const [history, paymentHistory] = await Promise.all([
        customerApi<CustomerOrder[]>('orders'),
        customerApi<CustomerPayment[]>('payments'),
      ]);
      setOrders(history); setPayments(paymentHistory);
    }).catch((cause) => {
      if (cause instanceof CustomerApiError && cause.status === 401) router.replace('/login?next=%2Faccount');
      else setError(cause instanceof Error ? cause.message : 'Akun belum dapat dimuat.');
    }).finally(() => setLoading(false));
  }, [router]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      await customerApi('profile', customerJson('PUT', { displayName: name, whatsapp: whatsapp || null }));
      setUser((person) => person ? { ...person, displayName: name, whatsapp } : person);
      setNotice('Profil tersimpan.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Profil gagal disimpan.'); }
    finally { setBusy(false); }
  }

  async function saveAddress(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      await customerApi(editing ? `addresses/${editing}` : 'addresses', customerJson(editing ? 'PUT' : 'POST', form));
      setAddresses(await customerApi<CustomerAddress[]>('addresses'));
      setForm(emptyAddress); setEditing(null); setNotice('Alamat tersimpan.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Alamat gagal disimpan.'); }
    finally { setBusy(false); }
  }

  async function deleteAddress(id: string) {
    setBusy(true); setError(''); setNotice('');
    try {
      await customerApi(`addresses/${id}`, { method: 'DELETE' });
      setAddresses(await customerApi<CustomerAddress[]>('addresses'));
      setNotice('Alamat dihapus.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Alamat gagal dihapus.'); }
    finally { setBusy(false); }
  }

  async function logout() {
    await customerApi('auth/logout', { method: 'POST' }).catch(() => undefined);
    router.replace('/login'); router.refresh();
  }

  if (loading) return <main className="nav-offset site-container page-section" role="status">Memuat akun…</main>;
  if (!user) return <main className="nav-offset site-container page-section" role={error ? 'alert' : 'status'}>{error || 'Mengalihkan ke login…'}</main>;
  return <main className="nav-offset site-container page-section max-w-5xl">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="font-mono text-xs uppercase tracking-widest text-brand-maroon">My Account</p>
        <h1 className="mt-2 font-editorial text-3xl font-bold text-brand-charcoal">Halo, {user.displayName}</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Akun dibuat {new Date(user.createdAt).toLocaleDateString('id-ID')}</p></div>
      <button type="button" onClick={logout} className="min-h-11 rounded-lg border border-border-subtle px-4 text-sm font-semibold">Keluar</button>
    </div>
    {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-brand-maroon">{error}</p>}
    {notice && <p role="status" className="mt-5 rounded-lg bg-brand-mist p-3 text-sm text-brand-navy">{notice}</p>}
    <div className="mt-8 grid gap-7 lg:grid-cols-2">
      <section className="rounded-xl border border-border-subtle bg-white p-5 sm:p-7">
        <h2 className="font-editorial text-xl font-bold">Profil</h2>
        <p className="mt-2 text-sm text-on-surface-variant">{user.email} · {user.emailVerified ? 'Email terverifikasi' : 'Belum terverifikasi'}</p>
        <form onSubmit={saveProfile} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold">Nama tampilan<input className="field-control mt-2 w-full" required minLength={2} maxLength={100}
            value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label className="block text-sm font-semibold">WhatsApp (format 62…)<input className="field-control mt-2 w-full"
            pattern="[1-9][0-9]{7,14}" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} /></label>
          <button disabled={busy} className="min-h-11 rounded-lg bg-brand-charcoal px-5 text-sm font-bold text-white disabled:opacity-50">Simpan profil</button>
        </form>
        {googleEnabled && (user.googleLinked ? <p className="mt-5 text-sm text-on-surface-variant">Akun Google terhubung.</p>
          : <a href="/api/customer/google/start?link=1&next=%2Faccount"
            className="mt-5 inline-block text-sm text-brand-navy underline">Hubungkan akun Google</a>)}
      </section>
      <section className="rounded-xl border border-border-subtle bg-white p-5 sm:p-7">
        <h2 className="font-editorial text-xl font-bold">Alamat tersimpan</h2>
        {addresses.length ? <ul className="mt-4 space-y-3">{addresses.map((address) => <li key={address.id} className="rounded-lg border border-border-subtle p-3 text-sm">
          <strong>{address.recipientName}{address.isDefault ? ' · Utama' : ''}</strong>
          <p>{address.fullAddress}, {address.district}, {address.city}, {address.province} {address.postalCode}</p>
          <div className="mt-2 flex gap-4"><button type="button" onClick={() => { setEditing(address.id); setForm(address); }}
            className="text-brand-navy underline">Ubah</button>
            <button type="button" disabled={busy} onClick={() => deleteAddress(address.id)} className="text-brand-maroon underline">Hapus</button></div>
        </li>)}</ul> : <p className="mt-4 text-sm text-on-surface-variant">Belum ada alamat.</p>}
        <form onSubmit={saveAddress} className="mt-6 space-y-3 border-t pt-5">
          <h3 className="font-semibold">{editing ? 'Ubah alamat' : 'Tambah alamat'}</h3>
          {([
            ['recipientName', 'Nama penerima'], ['whatsapp', 'WhatsApp penerima (62…)'],
            ['province', 'Provinsi'], ['city', 'Kota/Kabupaten'], ['district', 'Kecamatan'],
            ['postalCode', 'Kode pos'], ['fullAddress', 'Alamat lengkap'], ['notes', 'Catatan (opsional)'],
          ] as const).map(([key, label]) => <label key={key} className="block text-sm">{label}
            <input className="field-control mt-1 w-full" required={key !== 'notes'} maxLength={key === 'fullAddress' || key === 'notes' ? 500 : 100}
              value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} />
          </label>)}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault}
            onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))} /> Jadikan alamat utama</label>
          <div className="flex gap-3"><button disabled={busy} className="min-h-11 rounded-lg bg-brand-charcoal px-5 text-sm font-bold text-white disabled:opacity-50">Simpan alamat</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyAddress); }} className="min-h-11 text-sm underline">Batal</button>}</div>
        </form>
      </section>
    </div>
    <section className="mt-7 rounded-xl border border-border-subtle bg-white p-5 sm:p-7">
      <h2 className="font-editorial text-xl font-bold">Pesanan saya</h2>
      {orders.length ? <ul className="mt-4 divide-y">{orders.map((order) => <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
        <div><Link href={`/account/orders/${order.id}`} className="font-semibold text-brand-navy underline">#{order.id.slice(0, 8)}</Link>
          <p className="text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString('id-ID')} · Pembayaran {order.paymentStatus} · Pengiriman {order.fulfillmentStatus}</p></div>
        <strong>{formatRupiah(order.total)}</strong>
      </li>)}</ul> : <p className="mt-4 text-sm text-on-surface-variant">Belum ada pesanan database.</p>}
    </section>
    <section className="mt-7 rounded-xl border border-border-subtle bg-white p-5 sm:p-7">
      <h2 className="font-editorial text-xl font-bold">Riwayat pembayaran</h2>
      {payments.length ? <ul className="mt-4 divide-y">{payments.map((payment) => <li key={payment.orderId} className="py-3 text-sm">
        <Link href={`/account/orders/${payment.orderId}`} className="font-semibold text-brand-navy underline">#{payment.orderId.slice(0, 8)}</Link>
        <p>{payment.method === 'qris_static' ? 'QRIS statis' : 'Transfer BCA'} · {payment.status} · {formatRupiah(payment.total)}</p>
        {payment.rejectionReason && <p className="text-brand-maroon">Alasan ditolak: {payment.rejectionReason}</p>}
      </li>)}</ul> : <p className="mt-4 text-sm text-on-surface-variant">Belum ada pembayaran.</p>}
    </section>
  </main>;
}
