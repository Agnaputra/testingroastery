import { LoaderCircle } from 'lucide-react';
import { FiftyTwoLogo } from '../logo';

export function LoadingState({ label = 'Memuat halaman…', fullPage = false }: {
  label?: string;
  fullPage?: boolean;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true"
      className={`flex flex-col items-center justify-center gap-6 px-6 text-center ${fullPage ? 'min-h-[100svh] bg-surface-bright pb-16 pt-32' : 'min-h-48 py-10'}`}>
      <div aria-hidden="true"><FiftyTwoLogo size="lg" /></div>
      <LoaderCircle aria-hidden="true" className="h-6 w-6 text-brand-navy motion-safe:animate-spin" />
      <p className="max-w-sm text-sm text-on-surface-variant">{label}</p>
    </div>
  );
}
