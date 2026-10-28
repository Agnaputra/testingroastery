import { NextRequest, NextResponse } from 'next/server';
import { hasValidAdminSession } from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';

async function forward(request: NextRequest, method: 'GET' | 'PATCH') {
  if (process.env.NEXT_PUBLIC_PRICE_TEST_MODE !== '1') {
    return NextResponse.json({ error: 'Price test mode unavailable' }, { status: 503 });
  }
  if (!hasValidAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }
  const key = process.env.ADMIN_API_KEY;
  if (!key) return NextResponse.json({ error: 'Konfigurasi admin tidak tersedia.' }, { status: 503 });
  try {
    const backend = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${backend}/api/catalog/prices`, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': key },
      body: method === 'PATCH' ? JSON.stringify(await request.json()) : undefined,
      cache: 'no-store',
    });
    return NextResponse.json(await response.json(), { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Harga katalog tidak tersedia.' }, { status: 503 });
  }
}

export const GET = (request: NextRequest) => forward(request, 'GET');
export const PATCH = (request: NextRequest) => forward(request, 'PATCH');
