import type { Metadata } from 'next';
import BuildYourOwnBlendLabPage from '../../../features/coffee-lab/build-your-own-blend/build-your-own-blend-page';

export const metadata: Metadata = {
  title: 'Build Your Own Blend (BYOB) | Coffee Lab 52 Coffee',
  description: 'Eksplorasi rasa kopi dengan memilih beans dan mengatur proporsi blend di Coffee Lab 52 Coffee.',
  alternates: { canonical: '/coffee-lab/build-your-own-blend' },
};

export default function Page() {
  return <BuildYourOwnBlendLabPage />;
}
