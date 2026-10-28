import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AdminProvider } from '../../components/admin/admin-context';

export const metadata: Metadata = {
  title: 'Portal Admin & Roastery | 52 Coffee',
  description: 'Portal internal manajemen roastery, master katalog, pesanan, dan slowbar 52 Coffee.',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>;
}
