export const ADMIN_SESSION_COOKIE = '52coffee_admin_session';
export const CUSTOMER_SESSION_COOKIE = '52coffee_customer_session';

export async function hasAuthorizedAdminSession(request: { cookies: { get(name: string): { value: string } | undefined } }): Promise<boolean> {
  return hasAdminBackendSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function hasAdminBackendSessionToken(token?: string): Promise<boolean> {
  const backend = process.env.AI_BACKEND_URL?.replace(/\/$/, '');
  if (!token || !/^[0-9a-f]{64}$/.test(token) || !backend) return false;
  try {
    const response = await fetch(`${backend}/api/customer/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return false;
    const user = await response.json() as { role?: string; emailVerified?: boolean };
    return user.role === 'admin' && user.emailVerified === true;
  } catch {
    return false;
  }
}
