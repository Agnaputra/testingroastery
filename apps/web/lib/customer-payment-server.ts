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
  if (process.env.NEXT_PUBLIC_CUSTOMER_COMMERCE_TEST_MODE !== '1'
      || (process.env.NODE_ENV === 'production' && !operational)) return null;
  const account = process.env.PAYMENT_BCA_ACCOUNT ?? process.env.PAYMENT_TEST_BCA_ACCOUNT;
  const holder = process.env.PAYMENT_BCA_HOLDER ?? process.env.PAYMENT_TEST_BCA_HOLDER;
  const merchant = process.env.PAYMENT_QRIS_MERCHANT ?? process.env.PAYMENT_TEST_QRIS_MERCHANT;
  const file = process.env.PAYMENT_QRIS_PATH ?? process.env.PAYMENT_TEST_QRIS_PATH;
  if (!account || !/^\d{8,20}$/.test(account) || !holder || !merchant || !file) return null;
  const resolved = path.resolve(process.cwd(), file);
  const allowed = [path.resolve(process.cwd(), '.private', 'payment'), path.resolve(process.cwd(), 'public')];
  if (!allowed.some((root) => resolved.startsWith(root + path.sep))) return null;
  return { account, holder, merchant, file: resolved };
}

export async function paymentOrder(request: NextRequest, orderId: string): Promise<PaymentOrder | null> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  const token = request.cookies.get('52coffee_customer_session')?.value;
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
