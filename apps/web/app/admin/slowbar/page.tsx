'use client';

import { useAdminPortalContext } from '../../../components/admin/admin-context';
import { AdminSlowbarTab } from '../../../components/admin/tabs/admin-slowbar-tab';

export default function AdminSlowbarPage() {
  const { slowbarOutOfStock, handleToggleSlowbarStock } = useAdminPortalContext();

  return (
    <AdminSlowbarTab
      slowbarOutOfStock={slowbarOutOfStock}
      onToggleSlowbarStock={handleToggleSlowbarStock}
    />
  );
}
