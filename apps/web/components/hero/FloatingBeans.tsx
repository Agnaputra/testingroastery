'use client';

import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, SphereGeometry } from 'three';
import type { SceneQuality } from './types';

const BEANS = [
  { position: [-1.55, 1.0, 0.65], rotation: [0.4, 0.7, -0.7], scale: 0.25, speed: 0.65, phase: 0.2 },
  { position: [1.33, 1.55, -0.6], rotation: [0.1, -0.3, 0.8], scale: 0.21, speed: 0.52, phase: 1.4 },
  { position: [-1.45, -1.2, 0.9], rotation: [0.9, -0.6, 0.5], scale: 0.27, speed: 0.48, phase: 3.3 },
  { position: [1.65, 0.1, -0.3], rotation: [-0.2, 0.8, -0.7], scale: 0.18, speed: 0.72, phase: 2.1 },
  { position: [-0.45, 1.88, -0.7], rotation: [0.3, 0.5, 0.2], scale: 0.14, speed: 0.43, phase: 4.5 },
  { position: [0.3, -1.8, 0.1], rotation: [0.6, -0.2, -0.9], scale: 0.13, speed: 0.58, phase: 5.2 },
];

function makeBean() {
  const geometry = new SphereGeometry(1, 24, 16);
  const points = geometry.attributes.position;
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i);
    const y = points.getY(i);
    const z = points.getZ(i);
    const groove = z > 0 ? 0.25 * Math.exp(-Math.pow((x - Math.sin(y * 2.8) * 0.1) * 10, 2)) * Math.sqrt(Math.max(0, 1 - y * y)) : 0;
    points.setXYZ(i, x * 0.66, y, (z - groove) * 0.48);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export const FloatingBeans = memo(function FloatingBeans({ quality, animate }: { quality: SceneQuality; animate: boolean }) {
  const refs = useRef<(Group | null)[]>([]);
  const elapsed = useRef(0);
  const geometry = useMemo(makeBean, []);
  const count = quality === 'desktop' ? 6 : quality === 'tablet' ? 4 : 3;
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (!animate) return;
    elapsed.current += Math.min(delta, 0.05);
    refs.current.forEach((bean, i) => {
      if (!bean) return;
      const spec = BEANS[i];
      const time = elapsed.current * spec.speed + spec.phase;
      const entry = Math.min(1, Math.max(0, (elapsed.current - i * 0.07) / 0.8));
      const ease = 1 - Math.pow(1 - entry, 3);
      bean.position.y = spec.position[1] + Math.sin(time) * 0.09 - (1 - ease) * 0.15;
      bean.rotation.z = spec.rotation[2] + Math.sin(time * 0.65) * 0.09;
      bean.scale.setScalar(spec.scale * (0.88 + 0.12 * ease));
    });
  });

  return <group name="floating-coffee-beans">
    {BEANS.slice(0, count).map((bean, index) => (
      <group key={index} ref={(node) => { refs.current[index] = node; }}
        position={bean.position as [number, number, number]} rotation={bean.rotation as [number, number, number]} scale={bean.scale}>
        <mesh geometry={geometry}>
          <meshStandardMaterial color={index % 2 ? '#5a3622' : '#422819'} roughness={0.75} metalness={0.02} />
        </mesh>
      </group>
    ))}
  </group>;
});
