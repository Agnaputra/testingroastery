import QRCode from 'qrcode';
import { BASE_STATIC_QRIS, generateDynamicQrisPayload } from './qris';
import type { NextRequest } from 'next/server';

export interface PaymentOrder {
  id: string;
  paymentMethod: 'qris_static' | 'bca_transfer';
  paymentStatus: string;
  total: number;
}

export type PaymentMethod = PaymentOrder['paymentMethod'];

type BcaConfig = { method: 'bca_transfer'; account: string; holder: string };
type QrisConfig = { method: 'qris_static'; merchant: string; payload: string };
export function manualPaymentConfig(method: 'bca_transfer'): BcaConfig | null;
export function manualPaymentConfig(method: 'qris_static'): QrisConfig | null;
export function manualPaymentConfig(method: PaymentMethod): BcaConfig | QrisConfig | null;
export function manualPaymentConfig(method: PaymentMethod) {
  const operational = process.env.CUSTOMER_COMMERCE_MODE === 'operational';
  const isTesting = process.env.NEXT_PUBLIC_CUSTOMER_COMMERCE_TEST_MODE === '1'
    || process.env.CUSTOMER_COMMERCE_MODE === 'testing'
    || process.env.CUSTOMER_COMMERCE_TEST_MODE === '1';
  const isLocalDev = process.env.NODE_ENV !== 'production';
  const isPreview = process.env.VERCEL_ENV === 'preview'
    || process.env.ENVIRONMENT === 'preview';

  // Allow in operational mode OR test mode in local/preview environments.
  const isAllowedEnv = (operational && !isTesting && !isPreview) || (!operational && isTesting && (isLocalDev || isPreview));
  if (!isAllowedEnv) return null;
  const enabled = (process.env.CUSTOMER_PAYMENT_METHODS ?? (operational ? '' : 'bca_transfer,qris_static'))
    .split(',').map((value) => value.trim());
  if (!enabled.includes(method)) return null;

  if (method === 'bca_transfer') {
    const account = process.env.PAYMENT_BCA_ACCOUNT ?? (!operational ? process.env.PAYMENT_TEST_BCA_ACCOUNT : undefined) ?? (!operational && isTesting ? '0392046176' : undefined);
    const holder = process.env.PAYMENT_BCA_HOLDER ?? (!operational ? process.env.PAYMENT_TEST_BCA_HOLDER : undefined) ?? (!operational && isTesting ? 'Agna Putra Prawira' : undefined);
    return account && /^\d{8,20}$/.test(account) && holder?.trim() ? { method, account, holder } : null;
  }

  const merchant = process.env.PAYMENT_QRIS_MERCHANT ?? (!operational ? process.env.PAYMENT_TEST_QRIS_MERCHANT : undefined) ?? (!operational && isTesting ? 'NANA STORE - TELECOMMUNICATION' : undefined);
  const payload = process.env.PAYMENT_QRIS_PAYLOAD
    ?? (!operational ? process.env.PAYMENT_TEST_QRIS_PAYLOAD : undefined)
    ?? (!operational && isTesting ? BASE_STATIC_QRIS : undefined);
  if (!merchant?.trim() || !payload) return null;
  try {
    generateDynamicQrisPayload(1, payload);
    return { method, merchant, payload };
  } catch {
    return null;
  }
}

export async function availablePaymentMethods(): Promise<PaymentMethod[]> {
  const methods: PaymentMethod[] = [];
  if (manualPaymentConfig('bca_transfer')) methods.push('bca_transfer');
  const qris = manualPaymentConfig('qris_static');
  if (qris) methods.push('qris_static');
  return methods;
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

export async function qrisImage(payload: string, total: number) {
  return QRCode.toBuffer(generateDynamicQrisPayload(total, payload), {
    type: 'png', width: 640, margin: 4, errorCorrectionLevel: 'M',
  });
}
