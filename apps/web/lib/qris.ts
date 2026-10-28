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
  // 1. Strip existing CRC (last 8 chars: '6304xxxx')
  let base = baseStatic.slice(0, -8);

  // 2. Change Point of Initiation Method (Tag 01) from Static ('010211') to Dynamic ('010212')
  base = base.replace('010211', '010212');

  // 3. Format Tag 54 (Transaction Amount)
  const cleanAmount = Math.max(1, Math.round(amount));
  const amountStr = cleanAmount.toString();
  const amountTag = `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;

  // 4. Inject Tag 54 immediately after Currency Tag 53 ('5303360')
  const currencyTag = '5303360';
  const tag53Idx = base.indexOf(currencyTag);

  if (tag53Idx === -1) {
    throw new Error('QRIS Payload Format Invalid: Tag 53 (Currency) not found.');
  }

  const insertPos = tag53Idx + currencyTag.length;
  let dynamicPayload = base.slice(0, insertPos) + amountTag + base.slice(insertPos);

  // 5. Append Tag 63 (CRC checksum indicator)
  dynamicPayload += '6304';

  // 6. Calculate & Append CRC-16
  const checksum = calculateCrc16(dynamicPayload);
  return dynamicPayload + checksum;
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
