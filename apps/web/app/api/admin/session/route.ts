import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, hasAuthorizedAdminSession } from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: await hasAuthorizedAdminSession(request) });
}

export async function DELETE(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Origin tidak valid.' }, { status: 403 });
  }
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    const backend = process.env.AI_BACKEND_URL?.replace(/\/$/, '');
    if (backend) {
      await fetch(`${backend}/api/customer/auth/logout`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store', signal: AbortSignal.timeout(10000),
      }).catch(() => undefined);
    }
  }
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  response.cookies.set('52coffee_admin_credentials', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
