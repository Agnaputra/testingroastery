'use client';

import { useAdminPortalContext } from '../../features/admin/admin-context';
import { AdminOverviewTab } from '../../features/admin/tabs/admin-overview-tab';

export default function AdminOverviewPage() {
  const { metrics, catalogStats } = useAdminPortalContext();
  return <AdminOverviewTab metrics={metrics} catalogStats={catalogStats} />;
}
