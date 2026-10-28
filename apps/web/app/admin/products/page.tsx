import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, hasValidAdminSessionCookie } from '../../../lib/admin-session';
import { AdminProductManager } from '../../../components/admin-product-manager';
import { BackButton } from '../../../components/ui/back-button';

export const dynamic = 'force-dynamic';

export default function AdminProductsPage({ searchParams }: { searchParams: { edit?: string; new?: string } }) {
  if (!hasValidAdminSessionCookie(cookies().get(ADMIN_SESSION_COOKIE)?.value)) redirect('/admin');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h1 className="font-headline text-2xl font-bold text-brand-charcoal sm:text-3xl">Kelola Produk</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Edit detail, varian, stok siap jual, dan foto produk di halaman ini.
          </p>
        </div>
        <BackButton fallbackHref="/admin/catalog" label="Kembali ke Katalog" />
      </div>
      <AdminProductManager initialSlug={searchParams.edit} createOnLoad={searchParams.new === '1'} />
    </div>
  );
}
