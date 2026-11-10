'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { BlendBuilderExperience } from './blend-builder-experience';
import type { CoffeePointer } from './consultation-coffee-scene';

const Scene = dynamic(() => import('./consultation-coffee-scene'), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function ConsultationExperience() {
  const [eligible, setEligible] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const visual = useRef<HTMLDivElement>(null);
  const pointer = useRef<CoffeePointer>({ x: 0, y: 0 });
  const onReady = useCallback(() => setReady(true), []);
  const onUnavailable = useCallback(() => { setFailed(true); setReady(false); }, []);
  useEffect(() => {
    const query = matchMedia('(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const sync = () => { setEligible(query.matches); setReady(false); };
    sync(); query.addEventListener('change', sync);
    const node = visual.current;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && !document.hidden));
    if (node) observer.observe(node);
    const visibility = () => setVisible(!document.hidden && Boolean(node && node.getBoundingClientRect().bottom > 0));
    document.addEventListener('visibilitychange', visibility);
    return () => { query.removeEventListener('change', sync); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  function move(x: number, y: number) {
    pointer.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
    window.dispatchEvent(new Event('consultation-coffee-pointer'));
  }
  return <>
    <section className="consultation-header coffee-editorial-hero" aria-labelledby="consultation-title">
      <div className="site-container coffee-editorial-grid">
        <div><nav aria-label="Breadcrumb" className="consultation-breadcrumb"><Link href="/work-with-us">Partnerships</Link><span aria-hidden="true"> / </span><span aria-current="page">Consultations</span></nav>
          <h1 id="consultation-title">Rancang kopi untuk bisnismu.</h1>
          {<><p>Pilih beans, atur komposisi, dan hitung estimasi biaya.</p><ul className="coffee-editorial-highlights"><li>Pilih dan racik beans</li><li>Hitung HPP &amp; margin</li><li>Konsultasi bisnis</li></ul></>}
        </div>
        <div ref={visual} className="coffee-editorial-visual" onPointerMove={event => { const rect = event.currentTarget.getBoundingClientRect(); move((event.clientX - rect.left) / rect.width * 2 - 1, (event.clientY - rect.top) / rect.height * 2 - 1); }} onPointerLeave={() => move(0, 0)} role="img" aria-label="Kemasan asli 52 Coffee Grand Reserve dengan efek kedalaman">
          <Image src="/images/bag-maroon-geisha-cutout.png" alt="" fill sizes="(min-width: 901px) 400px, 180px" className={ready && eligible && visible && !failed ? 'coffee-poster coffee-poster--hidden' : 'coffee-poster'} priority />
          {eligible && visible && !failed && <div className="coffee-editorial-canvas" aria-hidden="true"><SceneBoundary onError={onUnavailable}><Scene pointer={pointer} onReady={onReady} onUnavailable={onUnavailable} /></SceneBoundary></div>}
        </div>
      </div>
    </section>
    <section id="byob" className="consultation-workspace site-container scroll-mt-28"><BlendBuilderExperience mode="partnership" guided /></section>
  </>;
}
