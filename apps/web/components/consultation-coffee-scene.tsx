'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Group, PlaneGeometry, SRGBColorSpace } from 'three';

export interface CoffeePointer { x: number; y: number }

function Composition({ pointer, onReady }: { pointer: React.MutableRefObject<CoffeePointer>; onReady: () => void }) {
  const group = useRef<Group>(null);
  const { invalidate, gl } = useThree();
  const source = useTexture('/images/bag-maroon-geisha-cutout.png');
  const texture = useMemo(() => {
    const copy = source.clone();
    copy.colorSpace = SRGBColorSpace;
    copy.needsUpdate = true;
    return copy;
  }, [source]);
  const pouch = useMemo(() => {
    const geometry = new PlaneGeometry(4, 4, 24, 24);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i);
      // Shallow relief keeps the entire photo intact without inventing the unseen back.
      positions.setZ(i, .1 * (1 - (x / 2) ** 2) * (1 - (y / 2) ** 2));
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  useEffect(() => { onReady(); invalidate(); }, [onReady, invalidate]);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = () => onReady();
    canvas.addEventListener('webglcontextrestored', lost);
    return () => { canvas.removeEventListener('webglcontextrestored', lost); texture.dispose(); pouch.dispose(); };
  }, [gl, texture, pouch, onReady]);
  useFrame((_, delta) => {
    if (!group.current) return;
    const targetX = -pointer.current.y * Math.PI / 22.5;
    const targetY = pointer.current.x * Math.PI / 18;
    const alpha = 1 - Math.exp(-6 * Math.min(delta, .05));
    group.current.rotation.x += (targetX - group.current.rotation.x) * alpha;
    group.current.rotation.y += (targetY - group.current.rotation.y) * alpha;
    if (Math.abs(targetX - group.current.rotation.x) + Math.abs(targetY - group.current.rotation.y) > .0001) invalidate();
  });
  return <>
    <group ref={group}>
      <mesh geometry={pouch}><meshBasicMaterial map={texture} transparent alphaTest={.01} toneMapped={false} /></mesh>
    </group>
  </>;
}

function WakeOnPointer({ onUnavailable }: { onUnavailable: () => void }) {
  const invalidate = useThree(state => state.invalidate);
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const wake = () => invalidate();
    const lost = (event: Event) => { event.preventDefault(); onUnavailable(); };
    window.addEventListener('consultation-coffee-pointer', wake);
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => {
      window.removeEventListener('consultation-coffee-pointer', wake);
      gl.domElement.removeEventListener('webglcontextlost', lost);
    };
  }, [invalidate, gl, onUnavailable]);
  return null;
}

export default function ConsultationCoffeeScene({ pointer, onReady, onUnavailable }: { pointer: React.MutableRefObject<CoffeePointer>; onReady: () => void; onUnavailable: () => void }) {
  return <Canvas dpr={[1, 1.5]} frameloop="demand" camera={{ position: [0, 0, 6.6], fov: 34 }} gl={{ alpha: true, antialias: true }} fallback={null}>
    <WakeOnPointer onUnavailable={onUnavailable} />
    <Suspense fallback={null}><Composition pointer={pointer} onReady={onReady} /></Suspense>
  </Canvas>;
}
