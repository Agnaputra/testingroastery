import { NextRequest, NextResponse } from 'next/server';
import { hasValidAdminSession } from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SESSION_COOKIE = '52coffee_customer_session';

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    const url = new URL(origin);
    return url.host === host && (url.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && url.protocol === 'http:'));
  } catch {
    return false;
  }
}

async function proxy(request: NextRequest, context: { params: { path: string[] } }) {
  const path = context.params.path.join('/');
  const method = request.method;
  if (method !== 'GET' && !sameOrigin(request)) {
    return NextResponse.json({ detail: 'Origin tidak valid.' }, { status: 403 });
  }
  const admin = path.startsWith('admin/');
  if (admin && !hasValidAdminSession(request)) {
    return NextResponse.json({ detail: 'Akses admin diperlukan.' }, { status: 403 });
  }
  const backend = process.env.AI_BACKEND_URL?.replace(/\/$/, '');
  if (!backend) return NextResponse.json({ detail: 'Layanan pelanggan belum dikonfigurasi.' }, { status: 503 });
  const headers = new Headers();
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (session) headers.set('Authorization', `Bearer ${session}`);
  if (admin && process.env.ADMIN_API_KEY) headers.set('X-Admin-Key', process.env.ADMIN_API_KEY);
  const contentType = request.headers.get('content-type');
  if (method !== 'GET' && contentType) headers.set('Content-Type', contentType);
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > 6_000_000) return NextResponse.json({ detail: 'Berkas terlalu besar.' }, { status: 413 });
  let upstream: Response;
  try {
    upstream = await fetch(`${backend}/api/customer/${path}${request.nextUrl.search}`, {
      method, headers,
      body: method === 'GET' ? undefined : await request.arrayBuffer(),
      cache: 'no-store', signal: AbortSignal.timeout(20000),
    });
  } catch {
    return NextResponse.json({ detail: 'Layanan pelanggan tidak tersedia.' }, { status: 503 });
  }
  if (path.endsWith('/proof-file') || path === 'payments/qris-image') {
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
  const data = await upstream.json().catch(() => ({ detail: 'Respons tidak valid.' }));
  if (upstream.ok && (path === 'auth/login' || path === 'auth/google')) {
    const { token, ...safeData } = data as { token: string };
    const response = NextResponse.json(safeData);
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
      path: '/', maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }
  const response = NextResponse.json(data, { status: upstream.status });
  if (path === 'auth/logout') response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
