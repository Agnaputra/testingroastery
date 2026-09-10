'use client';

import { Component, useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MessageCircle, Pause, Play } from 'lucide-react';
import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { openVirtualBarista } from '../../lib/virtual-barista-events';
import type { HeroMotionInput, SceneQuality } from './types';
import styles from './HeroSection.module.css';

const CoffeeScene = dynamic(() => import('./CoffeeScene'), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const motionInput = useRef<HeroMotionInput>({ pointerX: 0, pointerY: 0, scroll: 0 });
  const reducedMotion = useReducedMotion();
  const inView = useInView(sectionRef, { margin: '80px 0px 80px 0px' });
  const [quality, setQuality] = useState<SceneQuality>('mobile');
  const [canPoint, setCanPoint] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [paused, setPaused] = useState(false);
  const animate = mounted && !reducedMotion && !paused;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.9, 0.8]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1100px)');
    const tablet = window.matchMedia('(min-width: 768px)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => {
      setQuality(desktop.matches ? 'desktop' : tablet.matches ? 'tablet' : 'mobile');
      setCanPoint(pointer.matches);
    };
    const visibility = () => setPageVisible(!document.hidden);
    update();
    visibility();
    setMounted(true);
    [desktop, tablet, pointer].forEach((query) => query.addEventListener('change', update));
    document.addEventListener('visibilitychange', visibility);
    return () => {
      [desktop, tablet, pointer].forEach((query) => query.removeEventListener('change', update));
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  useEffect(() => {
    if (!animate || !canPoint) {
      motionInput.current.pointerX = 0;
      motionInput.current.pointerY = 0;
      motionInput.current.scroll = 0;
    }
  }, [animate, canPoint]);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    motionInput.current.scroll = animate ? Math.min(1, Math.max(0, value)) : 0;
  });

  const handlePointer = (event: PointerEvent<HTMLElement>) => {
    if (!animate || !canPoint || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    motionInput.current.pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    motionInput.current.pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };
  const onReady = useCallback(() => setReady(true), []);
  const onUnavailable = useCallback(() => { setUnavailable(true); setReady(false); }, []);

  return (
    <section ref={sectionRef} className={styles.hero} lang="en" aria-labelledby="hero-heading"
      onPointerMove={handlePointer}
      onPointerLeave={() => { motionInput.current.pointerX = 0; motionInput.current.pointerY = 0; }}
      data-hero-quality={quality} data-hero-motion={animate ? 'enabled' : 'paused'}>
      <div className={`site-container ${styles.layout}`}>
        <motion.div className={styles.copy} style={animate ? { y: copyY, opacity: copyOpacity } : undefined}>
          <div className={styles.entrance}>
            <p className={styles.eyebrow}>SPECIALTY COFFEE FOR A BRIGHTER DAY</p>
            <h1 id="hero-heading" className={styles.headline}>Coffee,<span>made personal.</span></h1>
            <p className={styles.description}>Discover coffee that fits your taste. From carefully sourced beans to your perfect brew, we&apos;re here to make every cup meaningful.</p>
            <div className={styles.actions}>
              <Link href="/catalog" className="btn-primary min-h-12 gap-5 rounded-xl text-sm">Shop Coffee<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
              <button type="button" onClick={openVirtualBarista} className={styles.secondary}>
                <MessageCircle aria-hidden="true" className="h-4 w-4 shrink-0" />Chat with Virtual Barista
              </button>
            </div>
            <p className={styles.signature}>Thoughtfully roasted in Malang, Indonesia.</p>
          </div>
        </motion.div>

        <div className={styles.visual}>
          <div className={styles.fallback} data-hidden={ready} aria-hidden="true">
            <Image src="/images/bag-sumbing-cutout.png" alt="" fill sizes="(min-width: 1024px) 500px, 80vw" priority />
          </div>
          <div className={styles.canvas} data-ready={ready} aria-hidden="true">
            {mounted && !unavailable && (
              <SceneBoundary onUnavailable={onUnavailable}>
                <CoffeeScene motionInput={motionInput} quality={quality} animate={animate}
                  active={inView && pageVisible} onReady={onReady} onUnavailable={onUnavailable} />
              </SceneBoundary>
            )}
          </div>
          <div className={styles.visualFooter}>
            <span>52 Coffee &amp; Roastery</span>
            {ready && !reducedMotion && (
              <button type="button" onClick={() => setPaused((value) => !value)} className={styles.motionToggle}
                aria-label={paused ? 'Play coffee animation' : 'Pause coffee animation'} aria-pressed={paused}>
                {paused ? <Play aria-hidden="true" size={13} /> : <Pause aria-hidden="true" size={13} />}
                {paused ? 'Play motion' : 'Pause motion'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
