import { NextRequest, NextResponse } from 'next/server';
import { hasValidAdminSession } from '../../../../../lib/admin-session';

export const dynamic = 'force-dynamic';

async function forward(request: NextRequest, path: string[] = []) {
  const imageRead = request.method === 'GET' && path.length === 2 && path[1] === 'image';
  if (!imageRead && !hasValidAdminSession(request)) {
    return NextResponse.json({ error: 'Sesi admin tidak valid.' }, { status: 401 });
  }
  const key = process.env.ADMIN_API_KEY;
  if (!imageRead && !key) return NextResponse.json({ error: 'Konfigurasi admin tidak tersedia.' }, { status: 503 });
  if (path.some((part) => !/^[a-z0-9-]+$/.test(part))) {
    return NextResponse.json({ error: 'Path tidak valid.' }, { status: 400 });
  }
  try {
    const backend = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';
    const contentType = request.headers.get('content-type');
    const response = await fetch(`${backend}/api/catalog/managed${path.length ? `/${path.join('/')}` : ''}`, {
      method: request.method,
      headers: {
        ...(!imageRead || hasValidAdminSession(request) && key ? { 'X-Admin-Key': key! } : {}),
        ...(contentType ? { 'Content-Type': contentType } : {}),
      },
      body: request.method === 'GET' ? undefined : await request.arrayBuffer(),
      cache: 'no-store',
    });
    if (imageRead && response.ok) return new NextResponse(response.body, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'image/webp', 'Cache-Control': 'private, no-store' },
    });
    return NextResponse.json(await response.json(), { status: response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Layanan katalog belum tersedia.' }, { status: 503 });
  }
}

type Context = { params: { path?: string[] } };
export const GET = (request: NextRequest, context: Context) => forward(request, context.params.path);
export const POST = (request: NextRequest, context: Context) => forward(request, context.params.path);
export const PUT = (request: NextRequest, context: Context) => forward(request, context.params.path);
export const PATCH = (request: NextRequest, context: Context) => forward(request, context.params.path);
export const DELETE = (request: NextRequest, context: Context) => forward(request, context.params.path);
