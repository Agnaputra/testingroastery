import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import type { NextRequest } from 'next/server';

export interface PaymentOrder {
  id: string;
  paymentMethod: 'qris_static' | 'bca_transfer';
  paymentStatus: string;
  total: number;
}

export function manualPaymentConfig() {
  const operational = process.env.CUSTOMER_COMMERCE_MODE === 'operational';
  const isTesting = process.env.NEXT_PUBLIC_CUSTOMER_COMMERCE_TEST_MODE === '1'
    || process.env.CUSTOMER_COMMERCE_MODE === 'testing'
    || process.env.CUSTOMER_COMMERCE_TEST_MODE === '1';
  const isLocalDev = process.env.NODE_ENV !== 'production';
  const isPreview = process.env.VERCEL_ENV === 'preview'
    || process.env.ENVIRONMENT === 'preview'
    || Boolean(process.env.VERCEL_URL && !process.env.VERCEL_PROJECT_PRODUCTION_URL?.includes(process.env.VERCEL_URL));

  // Allow in operational mode OR test mode in local/preview environments.
  const isAllowedEnv = operational || (isTesting && (isLocalDev || isPreview));
  if (!isAllowedEnv) return null;

  const defaultTestQris = ['apps/web/public/qris.jpg', 'public/qris.jpg'].find((candidate) =>
    existsSync(path.resolve(process.cwd(), candidate))
  ) ?? 'public/qris.jpg';

  const account = process.env.PAYMENT_BCA_ACCOUNT ?? process.env.PAYMENT_TEST_BCA_ACCOUNT ?? (isTesting ? '5200112233' : undefined);
  const holder = process.env.PAYMENT_BCA_HOLDER ?? process.env.PAYMENT_TEST_BCA_HOLDER ?? (isTesting ? '52 COFFEE TEST ROASTERY' : undefined);
  const merchant = process.env.PAYMENT_QRIS_MERCHANT ?? process.env.PAYMENT_TEST_QRIS_MERCHANT ?? (isTesting ? '52 COFFEE (PREVIEW TEST)' : undefined);
  const file = process.env.PAYMENT_QRIS_PATH ?? process.env.PAYMENT_TEST_QRIS_PATH ?? (isTesting ? defaultTestQris : undefined);

  if (!account || !/^\d{8,20}$/.test(account) || !holder || !merchant || !file) return null;
  let resolved = path.resolve(process.cwd(), file);
  if (!existsSync(resolved)) {
    resolved = path.resolve(process.cwd(), defaultTestQris);
  }
  const allowed = [
    path.resolve(process.cwd(), '.private', 'payment'),
    path.resolve(process.cwd(), 'public'),
    path.resolve(process.cwd(), 'apps', 'web', 'public'),
  ];
  if (!allowed.some((root) => resolved.startsWith(root + path.sep) || resolved === root)) return null;
  return { account, holder, merchant, file: resolved };
}

export async function paymentOrder(request: NextRequest, orderId: string): Promise<PaymentOrder | null> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  const token = request.cookies.get('52coffee_customer_session')?.value
    || request.cookies.get('52coffee_admin_session')?.value;
  const backend = process.env.AI_BACKEND_URL?.replace(/\/$/, '');
  if (!token || !backend) return null;
  try {
    const response = await fetch(`${backend}/api/customer/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    return response.ok ? await response.json() as PaymentOrder : null;
  } catch {
    return null;
  }
}

export async function qrisImage(file: string) {
  const bytes = await readFile(file);
  if (bytes.length < 100 || bytes.length > 2_000_000 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  return bytes;
}
