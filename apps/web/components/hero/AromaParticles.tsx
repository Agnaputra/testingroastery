'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, SphereGeometry } from 'three';
import type { SceneQuality } from './types';

const PARTICLES = [
  { position: [0.85, -0.65, 0.45], speed: 0.8, phase: 0.1, scale: 0.026 },
  { position: [1.12, -0.4, 0.7], speed: 0.65, phase: 1.4, scale: 0.022 },
  { position: [0.95, -0.15, 0.55], speed: 0.72, phase: 2.8, scale: 0.03 },
  { position: [-0.95, 0.45, 0.3], speed: 0.55, phase: 3.5, scale: 0.02 },
  { position: [1.4, 0.7, -0.2], speed: 0.6, phase: 4.2, scale: 0.024 },
  { position: [-0.7, -0.85, 0.6], speed: 0.5, phase: 5.0, scale: 0.025 },
];

export function AromaParticles({ quality, animate = true }: { quality: SceneQuality; animate?: boolean }) {
  const groupRef = useRef<Group>(null);
  const time = useRef(0);
  const sphereGeo = useMemo(() => new SphereGeometry(1, 12, 12), []);
  const count = quality === 'desktop' ? PARTICLES.length : quality === 'tablet' ? 4 : 2;

  useFrame((_, delta) => {
    if (!animate || !groupRef.current) return;
    time.current += Math.min(delta, 0.05);
    const t = time.current;

    groupRef.current.children.forEach((child, i) => {
      const spec = PARTICLES[i];
      if (!spec) return;
      child.position.y = spec.position[1] + Math.sin(t * spec.speed + spec.phase) * 0.08;
      child.position.x = spec.position[0] + Math.cos(t * 0.4 + spec.phase) * 0.03;
    });
  });

  return (
    <group ref={groupRef} name="subtle-aroma-particles">
      {PARTICLES.slice(0, count).map((p, i) => (
        <mesh
          key={i}
          geometry={sphereGeo}
          position={p.position as [number, number, number]}
          scale={p.scale}
        >
          <meshStandardMaterial
            color="#e2c8a0"
            roughness={0.4}
            metalness={0.1}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}
    </group>
  );
}

