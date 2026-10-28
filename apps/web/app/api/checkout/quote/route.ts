import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_PRICE_TEST_MODE !== '1') {
    return NextResponse.json({ error: 'Checkout harga test tidak aktif.' }, { status: 503 });
  }
  try {
    const backend = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${backend}/api/checkout/quote`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(await request.json()), cache: 'no-store',
    });
    return NextResponse.json(await response.json(), { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Harga checkout tidak tersedia.' }, { status: 503 });
  }
}
