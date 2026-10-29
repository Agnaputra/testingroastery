import { NextRequest, NextResponse } from 'next/server';
import { manualPaymentConfig, paymentOrder } from '../../../../lib/customer-payment-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const config = manualPaymentConfig();
  if (!config) return NextResponse.json({ detail: 'Pembayaran belum tersedia.' }, { status: 503 });
  const order = await paymentOrder(request, request.nextUrl.searchParams.get('order') ?? '');
  if (!order) return NextResponse.json({ detail: 'Pesanan tidak ditemukan.' }, { status: 404 });
  if (!['pending', 'rejected'].includes(order.paymentStatus)) {
    return NextResponse.json({ detail: 'Instruksi pembayaran tidak berlaku pada status ini.' }, { status: 409 });
  }
  const instructions = order.paymentMethod === 'bca_transfer'
    ? { method: 'bca_transfer', bank: 'BCA', account: config.account, holder: config.holder }
    : { method: 'qris_static', merchant: config.merchant,
        imageUrl: `/api/customer/payment-instructions/image?order=${encodeURIComponent(order.id)}` };
  return NextResponse.json({ orderId: order.id, total: order.total, status: order.paymentStatus, ...instructions },
    { headers: { 'Cache-Control': 'no-store' } });
}
