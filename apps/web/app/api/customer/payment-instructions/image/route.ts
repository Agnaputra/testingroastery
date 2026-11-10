import { NextRequest, NextResponse } from 'next/server';
import { manualPaymentConfig, paymentOrder, qrisImage } from '../../../../../lib/customer-payment-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const config = manualPaymentConfig('qris_static');
  if (!config) return NextResponse.json({ detail: 'QRIS tidak tersedia.' }, { status: 503 });
  const order = await paymentOrder(request, request.nextUrl.searchParams.get('order') ?? '');
  if (!order || order.paymentMethod !== 'qris_static' || !['pending', 'rejected'].includes(order.paymentStatus)) {
    return NextResponse.json({ detail: 'Pesanan tidak ditemukan.' }, { status: 404 });
  }
  try {
    const bytes = await qrisImage(config.payload, order.total);
    if (!bytes) return NextResponse.json({ detail: 'QRIS tidak valid.' }, { status: 503 });
    return new NextResponse(new Uint8Array(bytes), {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': request.nextUrl.searchParams.get('download') === '1'
          ? 'attachment; filename="52coffee-qris.png"' : 'inline' },
    });
  } catch {
    return NextResponse.json({ detail: 'QRIS tidak tersedia.' }, { status: 503 });
  }
}
