import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  hasAdminBackendSessionToken,
} from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (await hasAdminBackendSessionToken(adminToken)) {
    return NextResponse.json({ authenticated: true });
  }

  const customerToken = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (customerToken && (await hasAdminBackendSessionToken(customerToken))) {
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, customerToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return response;
  }

  return NextResponse.json({ authenticated: false });
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
