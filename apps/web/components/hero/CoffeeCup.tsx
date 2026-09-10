'use client';

import { useMemo } from 'react';
import { Vector2 } from 'three';

export function CoffeeCup() {
  const profile = useMemo(() => [
    [0, 0], [0.26, 0], [0.31, 0.04], [0.36, 0.12], [0.40, 0.38],
    [0.42, 0.51], [0.41, 0.55], [0.37, 0.55], [0.36, 0.48], [0.31, 0.16], [0, 0.12],
  ].map(([x, y]) => new Vector2(x, y)), []);

  return (
    <group name="ceramic-coffee-cup" position={[1.03, -1.48, 0.9]} rotation={[0.32, -0.24, 0.10]} scale={1.05}>
      <mesh>
        <latheGeometry args={[profile, 40]} />
        <meshStandardMaterial color="#dadfd7" roughness={0.3} metalness={0} />
      </mesh>
      <mesh position={[0.41, 0.29, 0]} scale={[0.75, 1, 1]}>
        <torusGeometry args={[0.21, 0.057, 10, 28]} />
        <meshStandardMaterial color="#dadfd7" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.487, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.357, 40]} />
        <meshStandardMaterial color="#2f170c" roughness={0.42} metalness={0} envMapIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0.489, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.342, 0.357, 40]} />
        <meshStandardMaterial color="#97633a" roughness={0.35} />
      </mesh>
    </group>
  );
}
