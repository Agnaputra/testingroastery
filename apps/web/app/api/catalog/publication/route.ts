import { NextRequest, NextResponse } from 'next/server';
import { hasValidAdminSession } from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';

const backendUrl = () => process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const response = await fetch(`${backendUrl()}/api/catalog/publication`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Publication service unavailable');
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: 'Status katalog tidak tersedia.' }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!hasValidAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }

  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: 'Konfigurasi admin belum tersedia.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  try {
    const response = await fetch(`${backendUrl()}/api/catalog/publication`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Status katalog gagal disimpan.' }, { status: 503 });
  }
}
