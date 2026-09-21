import CatalogContent from '../../components/catalog-content';

export const metadata = {
  title: 'Slowbar | 52 Coffee & Roastery',
  description: 'Menu specialty coffee 52 Coffee & Roastery yang tersedia untuk dinikmati di lokasi.',
};

export default function SlowbarPage() {
  return <CatalogContent initialCategory="slowbar" />;
}
