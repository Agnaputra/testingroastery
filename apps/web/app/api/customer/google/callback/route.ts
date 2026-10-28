import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const fallback = new URL('/login?error=google', request.url);
  const fail = (reason: string, status?: number) => {
    console.warn('customer_google_callback_failure', { reason, ...(status ? { status } : {}) });
    fallback.searchParams.set('reason', reason);
    const response = NextResponse.redirect(fallback);
    response.cookies.set('52coffee_google_flow', '', { httpOnly: true, path: '/', maxAge: 0 });
    return response;
  };
  const raw = request.cookies.get('52coffee_google_flow')?.value;
  let flow: { state: string; nonce: string; verifier: string; next: string; link: boolean };
  try {
    flow = JSON.parse(raw ?? '');
  } catch {
    return fail('flow_cookie_missing');
  }
  if (!flow || typeof flow.state !== 'string' || typeof flow.nonce !== 'string'
      || typeof flow.verifier !== 'string' || typeof flow.next !== 'string' || typeof flow.link !== 'boolean') {
    return fail('flow_cookie_invalid');
  }
  const state = request.nextUrl.searchParams.get('state');
  const code = request.nextUrl.searchParams.get('code');
  if (!state || state !== flow.state) return fail('state_mismatch');
  if (!code) return fail(request.nextUrl.searchParams.has('error') ? 'google_denied' : 'code_missing');
  if (!flow.verifier || !flow.nonce) return fail('flow_cookie_invalid');
  const backend = process.env.AI_BACKEND_URL?.replace(/\/$/, '');
  const redirectUri = process.env.CUSTOMER_GOOGLE_REDIRECT_URI;
  if (!backend) return fail('backend_not_configured');
  if (!redirectUri || redirectUri !== new URL('/api/customer/google/callback', request.url).href) return fail('redirect_mismatch');
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const session = request.cookies.get('52coffee_customer_session')?.value;
  if (flow.link && session) headers.set('Authorization', `Bearer ${session}`);
  try {
    const result = await fetch(`${backend}/api/customer/auth/google`, {
      method: 'POST', headers, cache: 'no-store', signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        code, codeVerifier: flow.verifier, nonce: flow.nonce,
        redirectUri, link: flow.link,
      }),
    });
    if (!result.ok) {
      const reported = result.headers.get('X-Customer-OAuth-Reason');
      const reason = reported && /^(configuration_missing|redirect_mismatch|invalid_client|invalid_grant|unauthorized_client|invalid_request|provider_error|jwks_unavailable|provider_unavailable|invalid_id_token|account_link_required)$/.test(reported)
        ? reported : result.status === 409 ? 'account_conflict' : 'backend_rejected';
      return fail(reason, result.status);
    }
    const data = await result.json() as { token?: string; linked?: boolean };
    if (flow.link ? data.linked !== true : !/^[0-9a-f]{64}$/.test(data.token ?? '')) return fail('backend_response_invalid');
    const next = flow.next.startsWith('/') && new URL(flow.next, request.url).origin === request.nextUrl.origin
      ? flow.next : '/account';
    const response = NextResponse.redirect(new URL(next, request.url));
    response.cookies.set('52coffee_google_flow', '', { httpOnly: true, path: '/', maxAge: 0 });
    if (!flow.link && data.token) {
      response.cookies.set('52coffee_customer_session', data.token, {
        httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
        path: '/', maxAge: 60 * 60 * 24 * 7,
      });
    }
    return response;
  } catch {
    return fail('backend_unavailable');
  }
}
