import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  hasValidAdminSession,
  safeSecretEqual,
} from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: hasValidAdminSession(request) });
}

export async function POST(request: NextRequest) {
  const { pin } = await request.json().catch(() => ({ pin: '' }));
  const expectedPin = process.env.ADMIN_PIN ?? '';
  const token = createAdminSessionToken();
  if (typeof pin !== 'string' || !token || !safeSecretEqual(pin.trim(), expectedPin)) {
    return NextResponse.json({ error: 'PIN roastery tidak sesuai.' }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
