import type { OwnerCatalogProduct } from '../../lib/catalog-master';
import type { CourierType } from '../../lib/store/useOrderStore';
import type { CustomerOrder } from '../../lib/customer-types';

export type AdminTab =
  | 'overview'
  | 'catalog'
  | 'orders'
  | 'slowbar'
  | 'financials';

export interface AdminMetrics {
  totalGrossRevenue: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  shippedOrdersCount: number;
  completedCount: number;
  roastingCount: number;
  processingCount: number;
  waitingPaymentCount: number;
  paidCount: number;
  productRevenue: number;
  nonOperationalCount: number;
}

export interface AdminOverview {
  metrics: AdminMetrics;
  topProducts: Array<{ skuId: string; name: string; variant: string; quantity: number; grossTotal: number }>;
  recentOrders: CustomerOrder[];
}

export interface AdminCatalogStats {
  published: number;
  draft: number;
  review: number;
  total: number;
}
