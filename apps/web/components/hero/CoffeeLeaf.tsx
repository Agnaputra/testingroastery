'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, Group } from 'three';

function makeLeafGeometry() {
  const segments = 24;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments; // 0 (stem) to 1 (tip)
    const y = (t - 0.5) * 1.55;
    // Organic leaf envelope: tapered base, broad middle, elegant tip
    const width = Math.sin(t * Math.PI) * (0.34 + 0.08 * Math.sin(t * Math.PI * 0.5));
    const arch = -Math.sin(t * Math.PI) * 0.12;

    // Left edge
    positions.push(-width, y, arch + 0.04 * Math.sin(t * Math.PI * 2));
    uvs.push(0, t);
    // Center spine
    positions.push(0, y, arch - 0.025);
    uvs.push(0.5, t);
    // Right edge
    positions.push(width, y, arch + 0.04 * Math.sin(t * Math.PI * 2));
    uvs.push(1, t);

    if (i < segments) {
      const base = i * 3;
      const next = (i + 1) * 3;
      indices.push(base, next, base + 1);
      indices.push(base + 1, next, next + 1);
      indices.push(base + 1, next + 1, base + 2);
      indices.push(base + 2, next + 1, next + 2);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function CoffeeLeaf({ animate = true }: { animate?: boolean }) {
  const groupRef = useRef<Group>(null);
  const time = useRef(0);
  const geometry = useMemo(makeLeafGeometry, []);

  useFrame((_, delta) => {
    if (!animate || !groupRef.current) return;
    time.current += Math.min(delta, 0.05);
    const t = time.current;
    groupRef.current.position.y = 1.15 + Math.sin(t * 0.52 + 1.2) * 0.06;
    groupRef.current.rotation.z = -0.38 + Math.sin(t * 0.42) * 0.05;
    groupRef.current.rotation.x = 0.25 + Math.cos(t * 0.48) * 0.04;
  });

  return (
    <group
      ref={groupRef}
      name="floating-coffee-leaf"
      position={[1.28, 1.15, -0.35]}
      rotation={[0.25, 0.32, -0.38]}
      scale={0.78}
    >
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#344838"
          roughness={0.42}
          metalness={0.04}
          side={2}
        />
      </mesh>
    </group>
  );
}

