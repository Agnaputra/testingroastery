import { NextRequest, NextResponse } from 'next/server';
import { hasValidAdminSession } from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SESSION_COOKIE = '52coffee_event_session';

function hasSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    return parsed.host === host && (parsed.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && parsed.protocol === 'http:'));
  } catch {
    return false;
  }
}

async function proxy(request: NextRequest, context: { params: { path: string[] } }) {
  const path = context.params.path.join('/');
  const method = request.method;
  if (method !== 'GET' && !hasSameOrigin(request)) {
    return NextResponse.json({ detail: 'Origin tidak valid.' }, { status: 403 });
  }
  const admin = path.startsWith('admin/');
  if (admin && !hasValidAdminSession(request)) {
    return NextResponse.json({ detail: 'Akses admin diperlukan.' }, { status: 403 });
  }
  const backend = (process.env.AI_BACKEND_URL ?? '').replace(/\/$/, '');
  if (!backend) return NextResponse.json({ detail: 'Event service belum dikonfigurasi.' }, { status: 503 });
  const headers = new Headers();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip');
  if (clientIp) headers.set('X-Forwarded-For', clientIp);
  if (admin && process.env.ADMIN_API_KEY) headers.set('X-Admin-Key', process.env.ADMIN_API_KEY);
  if (method !== 'GET') headers.set('Content-Type', 'application/json');
  let upstream: Response;
  try {
    upstream = await fetch(`${backend}/api/events/${path}${request.nextUrl.search}`, {
      method,
      headers,
      body: method === 'GET' ? undefined : await request.text(),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return NextResponse.json({ detail: 'Event service tidak tersedia.' }, { status: 503 });
  }
  if (path.startsWith('images/')) {
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
        'Cache-Control': upstream.ok ? 'public, max-age=3600' : 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
  const data = await upstream.json().catch(() => ({ detail: 'Respons event service tidak valid.' }));
  if (upstream.ok && (path === 'auth/login' || path === 'auth/register')) {
    const { token: sessionToken, ...safeData } = data;
    const response = NextResponse.json(safeData);
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }
  const response = NextResponse.json(data, { status: upstream.status });
  if (path === 'auth/logout') response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
