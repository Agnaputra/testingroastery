import type { Metadata } from 'next';
import CoffeeExperimentsPage from '../../../features/coffee-lab/coffee-experiments/coffee-experiments-page';

export const metadata: Metadata = {
  title: 'Cupping Events | Coffee Lab 52 Coffee',
  description: 'Temukan sesi cupping 52 Coffee dan komunitas kopi, lihat detail event, lalu hubungi organizer melalui WhatsApp.',
  alternates: { canonical: '/coffee-lab/coffee-experiments' },
};

export default function Page() {
  return <CoffeeExperimentsPage />;
}
