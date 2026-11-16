'use client';

import { useAdminPortalContext } from '../../../features/admin/admin-context';
import { AdminOrdersTab } from '../../../features/admin/tabs/admin-orders-tab';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, openShippingModal } = useAdminPortalContext();

  return (
    <AdminOrdersTab
      orders={orders}
      updateOrderStatus={updateOrderStatus}
      onOpenShippingModal={openShippingModal}
    />
  );
}
