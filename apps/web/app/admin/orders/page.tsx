'use client';

import { useAdminPortalContext } from '../../../components/admin/admin-context';
import { AdminOrdersTab } from '../../../components/admin/tabs/admin-orders-tab';

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
