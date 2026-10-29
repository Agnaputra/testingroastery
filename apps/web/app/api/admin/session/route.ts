import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_CREDENTIAL_COOKIE,
  adminCredentialsConfigured,
  createAdminCredentialToken,
  createAdminSessionToken,
  hasValidAdminCredential,
  hasValidAdminSession,
  safeSecretEqual,
  verifyAdminCredentials,
} from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: hasValidAdminSession(request),
    credentialsRequired: adminCredentialsConfigured(),
    credentialsVerified: hasValidAdminCredential(request),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (body.stage === 'credentials') {
    const token = createAdminCredentialToken();
    if (!token || !adminCredentialsConfigured()
        || typeof body.username !== 'string' || typeof body.password !== 'string'
        || !verifyAdminCredentials(body.username, body.password)) {
      return NextResponse.json({ error: 'Username atau password tidak sesuai.' }, { status: 401 });
    }
    const response = NextResponse.json({ credentialsVerified: true });
    response.cookies.set(ADMIN_CREDENTIAL_COOKIE, token, {
      httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production',
      path: '/', maxAge: 60 * 10,
    });
    return response;
  }

  const { pin } = body;
  const expectedPin = process.env.ADMIN_PIN ?? '';
  const token = createAdminSessionToken();
  if ((adminCredentialsConfigured() && !hasValidAdminCredential(request))
      || typeof pin !== 'string' || !token || !safeSecretEqual(pin.trim(), expectedPin)) {
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
  response.cookies.set(ADMIN_CREDENTIAL_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
