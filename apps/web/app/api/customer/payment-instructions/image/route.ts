import { NextRequest, NextResponse } from 'next/server';
import { manualPaymentConfig, paymentOrder, qrisImage } from '../../../../../lib/customer-payment-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const config = manualPaymentConfig();
  if (!config) return NextResponse.json({ detail: 'QRIS tidak tersedia.' }, { status: 503 });
  const order = await paymentOrder(request, request.nextUrl.searchParams.get('order') ?? '');
  if (!order || order.paymentMethod !== 'qris_static' || !['pending', 'rejected'].includes(order.paymentStatus)) {
    return NextResponse.json({ detail: 'Pesanan tidak ditemukan.' }, { status: 404 });
  }
  try {
    const bytes = await qrisImage(config.file);
    if (!bytes) return NextResponse.json({ detail: 'QRIS tidak valid.' }, { status: 503 });
    return new NextResponse(bytes, {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff', 'Content-Disposition': 'inline' },
    });
  } catch {
    return NextResponse.json({ detail: 'QRIS tidak tersedia.' }, { status: 503 });
  }
}
