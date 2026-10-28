'use client';

import { useAdminPortalContext } from '../../components/admin/admin-context';
import { AdminOverviewTab } from '../../components/admin/tabs/admin-overview-tab';

export default function AdminOverviewPage() {
  const { metrics, catalogStats } = useAdminPortalContext();
  return <AdminOverviewTab metrics={metrics} catalogStats={catalogStats} />;
}
