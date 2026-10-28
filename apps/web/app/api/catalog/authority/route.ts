import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NEXT_PUBLIC_PRICE_TEST_MODE !== '1') {
    return NextResponse.json({ error: 'Price test mode unavailable' }, { status: 503 });
  }
  try {
    const backend = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${backend}/api/catalog/authority`, { cache: 'no-store' });
    if (!response.ok) throw new Error('authority unavailable');
    return NextResponse.json(await response.json(), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Harga katalog tidak tersedia.' }, { status: 503 });
  }
}
