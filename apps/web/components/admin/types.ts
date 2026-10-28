import type { OwnerCatalogProduct } from '../../lib/catalog-master';
import type { CourierType } from '../../lib/store/useOrderStore';

export type AdminTab =
  | 'overview'
  | 'catalog'
  | 'orders'
  | 'slowbar'
  | 'financials';

export interface AdminMetrics {
  totalGrossRevenue: number;
  estimatedNetProfit: number;
  totalOrdersCount: number;
  avgOrderValue: number;
  pendingOrdersCount: number;
  shippedOrdersCount: number;
}

export interface AdminCatalogStats {
  published: number;
  draft: number;
  review: number;
  total: number;
}
