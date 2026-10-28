import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET(request: NextRequest) {
  const clientId = process.env.CUSTOMER_GOOGLE_CLIENT_ID;
  const redirectUri = process.env.CUSTOMER_GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json({ detail: 'Google OAuth belum dikonfigurasi.' }, { status: 503 });
  }
  let configuredOrigin = '';
  try { configuredOrigin = new URL(redirectUri).origin; } catch { /* invalid configuration */ }
  if (configuredOrigin !== request.nextUrl.origin) {
    return NextResponse.json({ detail: 'Hostname Google OAuth tidak sesuai konfigurasi.' }, { status: 503 });
  }
  const nextParam = request.nextUrl.searchParams.get('next') ?? '/account';
  const next = nextParam.startsWith('/') && new URL(nextParam, request.url).origin === request.nextUrl.origin
    ? nextParam : '/account';
  const state = randomBytes(24).toString('base64url');
  const nonce = randomBytes(24).toString('base64url');
  const verifier = randomBytes(48).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const link = request.nextUrl.searchParams.get('link') === '1';
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri, response_type: 'code',
    scope: 'openid email profile', state, nonce,
    code_challenge: challenge, code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set('52coffee_google_flow', JSON.stringify({ state, nonce, verifier, next, link }), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: 600,
  });
  return response;
}
