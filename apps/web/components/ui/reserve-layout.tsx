import type { ReactNode } from 'react';

type ReserveDetail = {
  icon: ReactNode;
  title: string;
  description: string;
};

type ReserveLayoutProps = {
  id?: string;
  kicker: string;
  title: string;
  description: string;
  details: readonly ReserveDetail[];
  children: ReactNode;
  tone?: 'navy' | 'maroon';
  workspaceClassName?: string;
};

export function ReserveLayout({
  id,
  kicker,
  title,
  description,
  details,
  children,
  tone = 'navy',
  workspaceClassName = '',
}: ReserveLayoutProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-36 py-12 sm:py-16 lg:py-20 ${tone === 'maroon' ? 'bg-brand-maroon' : 'bg-brand-navy'}`}
    >
      <div className="editorial-reveal-list site-container grid items-start gap-8 lg:grid-cols-[minmax(250px,0.72fr)_minmax(0,1.55fr)] lg:gap-12">
        <aside className="text-white lg:sticky lg:top-32">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-brand-mist">
            • {kicker} •
          </p>
          <h2 className="mt-6 max-w-md font-editorial text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            {title}
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/75 sm:text-base">
            {description}
          </p>

          <div className="mt-9 divide-y divide-white/15 border-y border-white/15">
            {details.map((detail) => (
              <div key={detail.title} className="grid grid-cols-[42px_1fr] gap-3 py-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-navy">
                  {detail.icon}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">{detail.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-white/65">{detail.description}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className={`min-w-0 rounded-2xl bg-white p-5 shadow-editorial sm:p-8 ${workspaceClassName}`}>
          {children}
        </div>
      </div>
    </section>
  );
}
