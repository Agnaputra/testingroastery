'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './home-page.module.css';

export function RoasteryProcess({
  reducedMotion,
  processRef,
  processStep,
  activeProcess,
  setActiveProcess,
  PROCESS_STEPS,
}: {
  reducedMotion: boolean | null;
  processRef: React.RefObject<HTMLElement>;
  processStep: { id: string; number: string; word: string; title: string; description: string; detail: string; imageUrl: string; imageAlt: string; imagePosition: string; actionHref: string; actionLabel: string };
  activeProcess: number;
  setActiveProcess: React.Dispatch<React.SetStateAction<number>>;
  PROCESS_STEPS: { id: string; number: string; word: string }[]
}) {
  return (
    <section ref={processRef} className={styles.process} aria-labelledby="process-heading">
      <div className={styles.processSticky}>
        <div className={styles.processStage}>
          <div className={styles.processMedia}>
            <AnimatePresence initial={false} mode="wait">
              <motion.figure
                key={processStep.id}
                initial={reducedMotion ? false : { opacity: .72, scale: 1.035, clipPath: 'inset(0 0 100% 0)' }}
                animate={{ opacity: 1, scale: 1, clipPath: 'inset(0 0 0% 0)' }}
                exit={reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: .985, clipPath: 'inset(100% 0 0 0)' }}
                transition={{ duration: reducedMotion ? 0 : .46, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={processStep.imageUrl}
                  alt={processStep.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 42vw, (min-width: 768px) 48vw, calc(100vw - 36px)"
                  style={{ objectPosition: processStep.imagePosition }}
                  className={styles.coverImage}
                />
                <figcaption>{processStep.number} / {processStep.word}</figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <AnimatePresence initial={false} mode="wait">
            <motion.article
              key={processStep.id}
              id="process-panel"
              role="region"
              aria-labelledby="process-heading"
              className={styles.processCopy}
              initial={reducedMotion ? false : { opacity: 0, x: 34 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
              transition={{ duration: reducedMotion ? 0 : .38, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className={styles.eyebrow}>Jelajahi 52 / {processStep.number}</p>
              <h2 id="process-heading">{processStep.title}</h2>
              <p className={styles.leadCopy}>{processStep.description}</p>
              <p className={styles.processDetail}>{processStep.detail}</p>
              <Link href={processStep.actionHref} className={styles.inverseLink}>
                {processStep.actionLabel} <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className={styles.processSteps} aria-label="Jelajahi Background, Roasters, dan Slowbar">
          {PROCESS_STEPS.map((step, index) => (
            <button
              type="button"
              key={step.id}
              aria-pressed={activeProcess === index}
              aria-controls="process-panel"
              onClick={() => setActiveProcess(index)}
            >
              <span>{step.number}</span>
              <strong>{step.word}</strong>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
