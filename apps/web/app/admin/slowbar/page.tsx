'use client';

import { useAdminPortalContext } from '../../../features/admin/admin-context';
import { AdminSlowbarTab } from '../../../features/admin/tabs/admin-slowbar-tab';

export default function AdminSlowbarPage() {
  const { slowbarOutOfStock, handleToggleSlowbarStock } = useAdminPortalContext();

  return (
    <AdminSlowbarTab
      slowbarOutOfStock={slowbarOutOfStock}
      onToggleSlowbarStock={handleToggleSlowbarStock}
    />
  );
}
