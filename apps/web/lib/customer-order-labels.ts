import type { CustomerOrder } from './customer-types';

export const paymentLabels: Record<CustomerOrder['paymentStatus'], string> = {
  pending: 'Menunggu pembayaran',
  awaiting_verification: 'Menunggu verifikasi pembayaran',
  paid: 'Pembayaran terverifikasi',
  rejected: 'Bukti pembayaran ditolak',
  cancelled: 'Pembayaran dibatalkan',
};
export const fulfillmentLabels: Record<CustomerOrder['fulfillmentStatus'], string> = {
  pending: 'Menunggu diproses', processing: 'Sedang diproses',
  roasting: 'Sedang disangrai dan dikemas', shipped: 'Dalam pengiriman',
  completed: 'Pesanan selesai', cancelled: 'Pengiriman dibatalkan',
};
