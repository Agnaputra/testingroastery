import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import { CartDrawer } from '../components/cart-drawer';
import { VirtualBaristaWidget } from '../components/virtual-barista';

export const metadata: Metadata = {
  title: '52 Coffee & Roastery — Artisanal Roasting, Precision Extraction (Malang)',
  description:
    'Specialty coffee roastery berbasis di Malang, Indonesia. Kurasi biji kopi Ijen Series, Sunda Series, Java Exotic, dan Grand Reserve Micro-Lot dengan panduan seduh presisi & AI Virtual Barista.',
  keywords: [
    '52 Coffee & Roastery',
    'Specialty Coffee Malang',
    'Biji Kopi Ijen',
    'Kopi Puntang',
    'Grand Reserve Geisha',
    'Virtual Barista AI',
    'Slowbar Coffee Malang',
  ],
  authors: [{ name: '52 Coffee & Roastery' }],
  openGraph: {
    title: '52 Coffee & Roastery — Artisanal Roasting, Precision Extraction',
    description:
      'Kurasi biji kopi artisanal dari lereng Ijen hingga micro-lot Colombia, disangrai presisi di Malang.',
    url: 'https://52coffee.id',
    siteName: '52 Coffee & Roastery',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,400..900;1,400..900&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-roastery-cream text-roastery-dark min-h-screen flex flex-col selection:bg-roastery-caramel selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <VirtualBaristaWidget />
      </body>
    </html>
  );
}
