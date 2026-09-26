'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Eye, Route } from 'lucide-react';
import { SENSORY_PROFILES } from './spectrum-data';
import styles from './SensorySection.module.css';

const WHEEL_CENTER = { x: 619.5, y: 634.5 };
const INNER_RADIUS = 137;
const OUTER_RADIUS = 558;

function createSectorPath(angle: number) {
  const point = (radius: number, degrees: number) => {
    const radians = (degrees * Math.PI) / 180;
    return {
      x: WHEEL_CENTER.x + radius * Math.cos(radians),
      y: WHEEL_CENTER.y + radius * Math.sin(radians),
    };
  };
  const start = point(OUTER_RADIUS, angle - 22.5);
  const end = point(OUTER_RADIUS, angle + 22.5);
  const innerEnd = point(INNER_RADIUS, angle + 22.5);
  const innerStart = point(INNER_RADIUS, angle - 22.5);

  return [
    `M ${innerStart.x} ${innerStart.y}`,
    `L ${start.x} ${start.y}`,
    `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

const VALUE_POINTS = [
  {
    title: 'Quality',
    description: 'Kami memahami dan menghargai setiap karakter rasa dalam biji kopi.',
    Icon: BadgeCheck,
  },
  {
    title: 'Transparency',
    description: 'Profil rasa ditampilkan secara jujur sesuai karakter aslinya.',
    Icon: Eye,
  },
  {
    title: 'Traceability',
    description: 'Kami menelusuri perjalanan dan karakter kopi hingga ke cangkir Anda.',
    Icon: Route,
  },
];

export function SensorySection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeProfile = SENSORY_PROFILES.find(({ id }) => id === (hoveredId ?? selectedId));
  const selectProfile = (id: string) => setSelectedId((currentId) => currentId === id ? null : id);

  return (
    <section id="sensory-spectrum" aria-labelledby="sensory-heading" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.mainGrid}>
          <figure className={styles.visual}>
            <div className={styles.wheelStage}>
              <Image
                src="/images/coffee-tasting-wheel-interactive.png"
                alt="Peta sensori 52 Coffee dengan delapan kategori rasa"
                fill
                priority={false}
                quality={90}
                sizes="(min-width: 1280px) 640px, (min-width: 768px) 600px, 94vw"
                className={styles.artwork}
                draggable={false}
              />
              <svg
                className={styles.hotspotMap}
                viewBox="0 0 1239 1269"
                aria-label="Pilih kategori rasa untuk membaca penjelasannya"
                aria-describedby="sensory-instructions sensory-readout"
              >
                {SENSORY_PROFILES.map((profile) => {
                  const isActive = activeProfile?.id === profile.id;
                  return (
                    <path
                      key={profile.id}
                      d={createSectorPath(profile.rotation)}
                      className={styles.hotspot}
                      style={{ color: profile.color }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Tampilkan penjelasan rasa ${profile.name}`}
                      aria-pressed={selectedId === profile.id}
                      data-active={isActive}
                      onMouseEnter={() => setHoveredId(profile.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onFocus={() => setHoveredId(profile.id)}
                      onBlur={() => setHoveredId(null)}
                      onClick={() => selectProfile(profile.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          selectProfile(profile.id);
                        }
                      }}
                    />
                  );
                })}
              </svg>
            </div>
            <figcaption id="sensory-instructions" className={styles.visualHint}>
              Arahkan kursor, gunakan Tab, atau sentuh kategori rasa.
            </figcaption>
          </figure>

          <div className={styles.intro}>
            <h2 id="sensory-heading" className={styles.heading}>
              <span>Coffee</span>
              <span>Tasting Notes</span>
            </h2>
            <p className={styles.supportingHeading}>Explore a World of Flavor</p>
            <p className={styles.description}>
              Setiap kopi memiliki cerita, dan setiap rasa adalah bagian dari perjalanan itu. Jelajahi
              berbagai karakter rasa yang dapat muncul dalam secangkir kopi — dari fruity yang cerah
              hingga roasted yang hangat — dan kenali lebih dalam profil sensori kopi bersama 52 Coffee.
            </p>
          </div>

          <div
            id="sensory-readout"
            className={styles.flavorReadout}
            data-visible={Boolean(activeProfile)}
            aria-live="polite"
          >
            {activeProfile ? (
              <>
                <div className={styles.flavorReadoutHeader}>
                  <span style={{ backgroundColor: activeProfile.color }} aria-hidden="true" />
                  <p>{activeProfile.name}</p>
                  <small>{activeProfile.notes}</small>
                </div>
                <p className={styles.flavorDescription}>{activeProfile.description}</p>
                <p className={styles.flavorCue}>
                  <strong>Cara mengenali</strong>
                  {activeProfile.cue}
                </p>
              </>
            ) : (
              <p className={styles.flavorPrompt}>
                Pilih salah satu area rasa pada wheel untuk mengenali karakter sensorinya.
              </p>
            )}
          </div>

          <div className={styles.actions}>
            <Link href="/catalog" className={styles.primaryAction}>
              Jelajahi kopi kami <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <ul className={styles.values} aria-label="Nilai sensori 52 Coffee">
          {VALUE_POINTS.map(({ title, description, Icon }) => (
            <li key={title} className={styles.valueItem}>
              <div className={styles.valueIconWrapper}>
                <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <p className={styles.valueTitle}>{title}</p>
              <p className={styles.valueDescription}>{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
