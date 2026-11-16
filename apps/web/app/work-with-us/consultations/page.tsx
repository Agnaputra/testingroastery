import type { Metadata } from 'next';
import ConsultationsPage from '../../../features/partnerships/consultations/consultations-page';
import './consultations.css';
export const metadata: Metadata = {
  title: 'Consultations & Custom Blend | 52 Coffee & Roastery',
  description: 'Konsultasi custom coffee blend, formulir kemitraan, dan pricing calculator HPP untuk kafe, restoran, hotel, dan kebutuhan wholesale.',
  alternates: { canonical: '/work-with-us/consultations' },
};

export default function Page() {
  return <ConsultationsPage />;
}
