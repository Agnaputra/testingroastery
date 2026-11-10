/**
 * 52 Coffee & Roastery — Dynamic QRIS (QRIS Dinamis) Generator
 * Conforms to Bank Indonesia / ASPI (Asosiasi Sistem Pembayaran Indonesia) EMVCo MPM Standard.
 *
 * Base Merchant Configuration (Extracted from apps/web/public/qris.jpg):
 * - Merchant Name: nana store (ShopeePay / PT AirPay International Indonesia)
 * - NMID: ID1026579452370
 * - Merchant City: PROBOLINGGO
 * - Merchant Criteria: UMI (Usaha Mikro)
 * - Currency: IDR (360)
 */

import { generateQrSvg, generateQrDataUrl } from './qr-generator';

export const BASE_STATIC_QRIS =
  '00020101021126610016ID.CO.SHOPEE.WWW01189360091800235814090208235814090303UMI51440014ID.CO.QRIS.WWW0215ID10265794523700303UMI5204481453033605802ID5910nana store6011PROBOLINGGO61056721762070703A016304C7C2';

export interface QrisDetails {
  merchantName: string;
  nmid: string;
  acquirer: string;
  terminalId: string;
  city: string;
  postalCode: string;
  amount: number;
  currency: string;
  payload: string;
  svg: string;
}

/**
 * Calculates CRC-16-CCITT (False) checksum
 * Polynomial: 0x1021, Initial Value: 0xFFFF
 */
export function calculateCrc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates an authentic Dynamic QRIS (QRIS Dinamis) string from ShopeePay static QRIS
 * @param amount Exact transaction amount in IDR (integer without decimals)
 * @param baseStatic Base static QRIS string (defaults to merchant's Shopee QRIS)
 */
export function generateDynamicQrisPayload(
  amount: number,
  baseStatic: string = BASE_STATIC_QRIS
): string {
  if (!Number.isSafeInteger(amount) || amount <= 0 || String(amount).length > 13) {
    throw new Error('Invalid QRIS transaction amount.');
  }
  if (!/^[\x20-\x7E]+$/.test(baseStatic) || !/6304[0-9A-F]{4}$/.test(baseStatic)
    || calculateCrc16(baseStatic.slice(0, -4)) !== baseStatic.slice(-4)) {
    throw new Error('Invalid QRIS payload checksum.');
  }
  const fields = new Map<string, string>();
  let offset = 0;
  while (offset < baseStatic.length) {
    const header = baseStatic.slice(offset, offset + 4);
    if (!/^\d{4}$/.test(header)) throw new Error('Invalid QRIS field.');
    const tag = header.slice(0, 2);
    const length = Number(header.slice(2));
    const value = baseStatic.slice(offset + 4, offset + 4 + length);
    if (!length || value.length !== length || fields.has(tag)) throw new Error('Invalid QRIS field length.');
    fields.set(tag, value);
    offset += 4 + length;
  }
  if (fields.get('00') !== '01' || !['11', '12'].includes(fields.get('01') ?? '')
    || fields.get('53') !== '360' || fields.get('58') !== 'ID'
    || !fields.get('59') || !fields.get('60')
    || !Array.from(fields.keys()).some(tag => Number(tag) >= 26 && Number(tag) <= 51)) {
    throw new Error('Invalid QRIS merchant configuration.');
  }
  // Fee-bearing QR codes require an acquirer integration to reconcile the total.
  if (['55', '56', '57'].some(tag => fields.has(tag))) throw new Error('QRIS fees are not supported.');
  fields.set('01', '12');
  fields.set('54', String(amount));
  fields.delete('63');
  const body = Array.from(fields).sort(([a], [b]) => Number(a) - Number(b))
    .map(([tag, value]) => `${tag}${String(value.length).padStart(2, '0')}${value}`).join('') + '6304';
  return body + calculateCrc16(body);
}

/**
 * Complete helper that produces the dynamic QR string, metadata, and SVG vector markup
 */
export function createDynamicQris(amount: number): QrisDetails {
  const payload = generateDynamicQrisPayload(amount);
  const svg = generateQrSvg(payload, {
    width: 280,
    margin: 3,
  });

  return {
    merchantName: 'nana store',
    nmid: 'ID1026579452370',
    acquirer: 'ShopeePay (AirPay)',
    terminalId: 'A01',
    city: 'PROBOLINGGO',
    postalCode: '67217',
    amount: Math.round(amount),
    currency: 'IDR',
    payload,
    svg,
  };
}

export { generateQrDataUrl };
