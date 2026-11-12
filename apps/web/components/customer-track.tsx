'use client';

import { LoadingState } from '@/components/ui/loading-state';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomerApiError, customerApi } from '../lib/customer-api';
import { paymentLabels, fulfillmentLabels } from '../lib/customer-order-labels';
import type { CustomerOrder } from '../lib/customer-types';

export function CustomerTrack() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('order');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    customerApi<CustomerOrder[]>(orderId ? `orders/${orderId}` : 'orders')
      .then((result) => setOrders(Array.isArray(result) ? result : [result]))
      .catch((cause) => {
        if (cause instanceof CustomerApiError && cause.status === 401) {
          router.replace('/login?next=' + encodeURIComponent(orderId ? `/track?order=${orderId}` : '/track'));
        } else setError(cause instanceof Error ? cause.message : 'Status pesanan belum dapat dimuat.');
      }).finally(() => setLoading(false));
  }, [orderId, router]);
  return <main className="nav-offset site-container page-section max-w-3xl">
    <p className="font-mono text-xs uppercase tracking-widest text-brand-maroon">52 Coffee & Roastery</p>
    <h1 className="mt-2 font-editorial text-3xl font-bold">Lacak pesanan</h1>
    <p className="mt-2 text-sm text-on-surface-variant">Hanya pesanan milik akun yang sedang masuk yang ditampilkan.</p>
    {loading && <LoadingState label="Memuat status…" />}
    {error && <p role="alert" className="mt-8 text-brand-maroon">{error}</p>}
    {!loading && !error && !orders.length && <p className="mt-8">Belum ada pesanan.</p>}
    <ul className="mt-8 space-y-4">{orders.map((order) => <li key={order.id} className="rounded-xl border border-border-subtle bg-white p-5">
      <Link href={`/account/orders/${order.id}`} className="font-semibold text-brand-navy underline">Order #{order.id.slice(0, 8)}</Link>
      <p className="mt-2 text-sm">Pembayaran: <strong>{paymentLabels[order.paymentStatus]}</strong></p>
      <p className="text-sm">Pengiriman: <strong>{fulfillmentLabels[order.fulfillmentStatus]}</strong></p>
      {order.rejectionReason && <p className="mt-2 text-sm text-brand-maroon">Bukti ditolak: {order.rejectionReason}</p>}
      {order.trackingNumber && <p className="mt-2 text-sm">Nomor resi: {order.trackingNumber}</p>}
    </li>)}</ul>
  </main>;
}
