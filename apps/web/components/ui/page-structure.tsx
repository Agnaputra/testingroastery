import type { ReactNode } from 'react';
import clsx from 'clsx';
import { FiftyTwoLogo } from '../logo';

type Alignment = 'left' | 'center';
type Tone = 'light' | 'dark';

interface PageIntroProps {
  title: ReactNode;
  description?: ReactNode;
  kicker?: ReactNode;
  icon?: ReactNode;
  visual?: ReactNode;
  tone?: Tone;
  align?: Alignment;
  compact?: boolean;
  className?: string;
}

export function PageIntro({
  title,
  description,
  kicker,
  icon,
  visual,
  tone = 'light',
  align = 'left',
  compact = false,
  className,
}: PageIntroProps) {
  return (
    <section
      className={clsx('page-intro', className)}
      data-tone={tone}
      data-align={align}
      data-compact={compact || undefined}
    >
      <div className="page-intro__wash" aria-hidden="true" />
      <div className={clsx('site-container page-intro__inner', visual && 'page-intro__inner--split')}>
        <div className="page-intro__copy">
          {kicker && (
            <div className="page-kicker">
              {icon && <span className="page-kicker__icon" aria-hidden="true">{icon}</span>}
              <span>{kicker}</span>
            </div>
          )}
          <h1 className="page-display">{title}</h1>
          {description && <p className="page-lead">{description}</p>}
        </div>
        {visual && <div className="page-intro__visual">{visual}</div>}
      </div>
    </section>
  );
}

interface SectionIntroProps {
  title: ReactNode;
  description?: ReactNode;
  kicker?: ReactNode;
  action?: ReactNode;
  align?: Alignment;
  className?: string;
}

export function SectionIntro({
  title,
  description,
  kicker,
  action,
  align = 'left',
  className,
}: SectionIntroProps) {
  return (
    <div className={clsx('section-intro', className)} data-align={align}>
      <div className="section-intro__copy">
        {kicker && <p className="section-kicker">{kicker}</p>}
        <h2 className="section-display">{title}</h2>
        {description && <p className="section-lead">{description}</p>}
      </div>
      {action && <div className="section-intro__action">{action}</div>}
    </div>
  );
}

interface SurfaceProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside';
  muted?: boolean;
}

export function Surface({ children, className, as: Element = 'div', muted = false }: SurfaceProps) {
  return (
    <Element className={clsx('ui-surface', muted && 'ui-surface--muted', className)}>
      {children}
    </Element>
  );
}

export function BrandPanel({ label = 'Disangrai dengan presisi di Malang' }: { label?: string }) {
  return (
    <div className="brand-panel">
      <FiftyTwoLogo size="lg" textColor="light" />
      <p>{label}</p>
    </div>
  );
}
