'use client';

import { useAdminPortalContext } from '../../../components/admin/admin-context';
import { AdminCatalogTab } from '../../../components/admin/tabs/admin-catalog-tab';

export default function AdminCatalogPage() {
  const portal = useAdminPortalContext();

  return (
    <AdminCatalogTab
      filteredCatalog={portal.filteredCatalog}
      catalogSearch={portal.catalogSearch}
      setCatalogSearch={portal.setCatalogSearch}
      catalogStatusFilter={portal.catalogStatusFilter}
      setCatalogStatusFilter={portal.setCatalogStatusFilter}
      catalogStats={portal.catalogStats}
      catalogSyncError={portal.catalogSyncError}
      publishedRows={portal.publishedRows}
      publicationLoaded={portal.publicationLoaded}
      updatingRow={portal.updatingRow}
      priceRevision={portal.priceRevision}
      effectivePrices={portal.effectivePrices}
      openEditModal={portal.openEditModal}
      handleTogglePublish={portal.handleTogglePublish}
    />
  );
}
