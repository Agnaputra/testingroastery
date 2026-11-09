import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ConsultationExperience } from '../../../components/consultation-experience';
import './consultations.css';

export const metadata: Metadata = {
  title: 'Consultations & Custom Blend | 52 Coffee & Roastery',
  description: 'Konsultasi custom coffee blend, formulir kemitraan, dan pricing calculator HPP untuk kafe, restoran, hotel, dan kebutuhan wholesale.',
  alternates: { canonical: '/work-with-us/consultations' },
};

export default function ConsultationsPage() {
  return (
    <main className="page-shell consultation-page relative bg-surface-bright">
      <ConsultationExperience />

      <aside className="border-t border-border-subtle bg-white"><div className="site-container flex flex-col gap-4 py-9 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-brand-maroon">Wholesale &amp; Partnership</p><p className="mt-2 text-sm text-on-surface-variant">Butuh pasokan rutin setelah racikanmu siap?</p></div><Link href="/work-with-us#wholesale-partnership" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-navy underline underline-offset-4">Lihat skema pasokan <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></aside>
    </main>
  );
}
