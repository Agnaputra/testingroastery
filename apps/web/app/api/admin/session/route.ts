import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_CREDENTIAL_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  adminCredentialsConfigured,
  createAdminCredentialToken,
  createAdminSessionToken,
  hasValidAdminCredential,
  hasAuthorizedAdminSession,
  hasAdminCustomerSessionToken,
  safeSecretEqual,
  verifyAdminCredentials,
  getExpectedAdminPin,
} from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: await hasAuthorizedAdminSession(request),
    credentialsRequired: true,
    credentialsVerified: hasValidAdminCredential(request),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (body.stage === 'credentials') {
    const token = createAdminCredentialToken();
    if (!token || !adminCredentialsConfigured()) {
      return NextResponse.json({ error: 'Konfigurasi credential admin belum lengkap.' }, { status: 503 });
    }
    if (typeof body.username !== 'string' || typeof body.password !== 'string'
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
  const expectedPin = getExpectedAdminPin();
  const token = createAdminSessionToken();
  if (!hasValidAdminCredential(request) || typeof pin !== 'string'
      || !token || !safeSecretEqual(pin.trim(), expectedPin)) {
    return NextResponse.json({ error: 'PIN roastery tidak sesuai.' }, { status: 401 });
  }
  const customerToken = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!customerToken) {
    return NextResponse.json({ error: 'Masuk ke akun website ber-role admin sebelum membuka portal.' }, { status: 403 });
  }
  if (!await hasAdminCustomerSessionToken(customerToken)) {
    return NextResponse.json({ error: 'Akun website ini tidak memiliki role admin atau sesi tidak dapat diverifikasi.' }, { status: 403 });
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
