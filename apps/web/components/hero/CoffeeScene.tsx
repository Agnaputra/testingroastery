'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, Shadow } from '@react-three/drei';
import { Group, MathUtils } from 'three';
import { CoffeeModel } from './CoffeeModel';
import { CoffeeCup } from './CoffeeCup';
import { FloatingBeans } from './FloatingBeans';
import { CoffeeLeaf } from './CoffeeLeaf';
import { AromaParticles } from './AromaParticles';
import type { CoffeeSceneProps } from './types';

function StudioComposition({ motionInput, quality, animate, active, onReady, onUnavailable }: CoffeeSceneProps) {
  const composition = useRef<Group>(null);
  const pouch = useRef<Group>(null);
  const time = useRef(0);
  const announced = useRef(false);
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    // Keep the foreground cup and beans inside narrow tablet/mobile canvases.
    const aspect = size.width / Math.max(size.height, 1);
    camera.position.z = Math.max(7.8, 0.9 + 4.2 / (2 * Math.tan(35 * Math.PI / 360) * aspect));
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);

  useEffect(() => {
    const canvas = gl.domElement;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      onUnavailable();
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    return () => canvas.removeEventListener('webglcontextlost', onContextLost);
  }, [gl, onUnavailable]);

  // Demand mode renders a still frame after a motion/accessibility preference changes.
  useEffect(() => {
    if (!animate && composition.current && pouch.current) {
      composition.current.rotation.set(0, 0, 0);
      composition.current.position.y = 0;
      composition.current.scale.setScalar(1);
      pouch.current.position.y = 0.15;
      pouch.current.rotation.set(0.06, -0.28, -0.10);
    }
    invalidate();
  }, [animate, active, quality, invalidate]);

  useFrame((_, delta) => {
    if (!announced.current) {
      announced.current = true;
      // Ready is reported only once the suspended scene can render.
      onReady();
    }
    if (!animate || !active || !composition.current || !pouch.current) return;
    time.current += Math.min(delta, 0.05);
    const t = time.current;
    const input = motionInput.current;
    const intensity = quality === 'desktop' ? 1 : quality === 'tablet' ? 0.45 : 0;
    const damping = 1 - Math.exp(-3 * Math.min(delta, 0.05));
    const enter = 1 - Math.pow(1 - Math.min(1, t / 1.25), 3);

    composition.current.rotation.y = MathUtils.lerp(composition.current.rotation.y, input.pointerX * 0.065 * intensity, damping);
    composition.current.rotation.x = MathUtils.lerp(composition.current.rotation.x, input.pointerY * 0.035 * intensity, damping);
    composition.current.position.y = MathUtils.lerp(composition.current.position.y, input.scroll * 0.18, damping);
    composition.current.scale.setScalar(1 - input.scroll * 0.025);
    pouch.current.position.y = 0.15 + Math.sin(t * 0.65) * 0.065 - (1 - enter) * 0.12;
    pouch.current.rotation.x = 0.06 + Math.sin(t * 0.48) * 0.018;
    pouch.current.rotation.y = -0.28 + Math.sin(t * 0.4) * 0.045 + (1 - enter) * 0.16;
    pouch.current.rotation.z = -0.10 + Math.sin(t * 0.5) * 0.025 - input.scroll * 0.045;
  });

  return (
    <>
      <ambientLight intensity={quality === 'mobile' ? 1.1 : 0.7} />
      <hemisphereLight args={['#fff4df', '#8c7866', 1.3]} />
      <directionalLight position={[-3.5, 5, 5]} intensity={3.1} color="#fff3df" />
      {quality !== 'mobile' && <directionalLight position={[4, 2, -2]} intensity={1.8} color="#dce8eb" />}

      {quality === 'desktop' && (
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={2.7} position={[-3, 3, 4]} scale={[5, 5, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={1.3} position={[4, 1, 2]} scale={[2, 5, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={2} position={[0, 4, -3]} scale={[3, 2, 1]} target={[0, 0, 0]} />
        </Environment>
      )}

      <group ref={composition} name="coffee-hero-composition">
        <group ref={pouch} name="floating-coffee-pouch" position={[0, 0.15, 0]} rotation={[0.06, -0.28, -0.10]}>
          <CoffeeModel />
        </group>
        <FloatingBeans quality={quality} animate={animate && active} />
        <CoffeeCup />
        {quality !== 'mobile' && <CoffeeLeaf animate={animate && active} />}
        <AromaParticles quality={quality} animate={animate && active} />
      </group>

      {quality === 'desktop' ? (
        <ContactShadows position={[0, -2.02, 0]} opacity={0.22} scale={7} blur={3} far={4.5} resolution={256} frames={1} color="#5b4230" />
      ) : (
        <Shadow position={[0, -1.96, 0]} scale={[3.1, 1.7, 1]} color="#735c46" opacity={0.13} />
      )}
    </>
  );
}

export default function CoffeeScene(props: CoffeeSceneProps) {
  const { quality, animate, active } = props;
  const dpr: [number, number] = [1, quality === 'desktop' ? 1.5 : quality === 'tablet' ? 1.25 : 1];

  return (
    <Canvas
      camera={{ position: [0, 0.2, 7.8], fov: 35, near: 0.1, far: 30 }}
      dpr={dpr}
      frameloop={animate && active ? 'always' : 'demand'}
      gl={{ alpha: true, antialias: quality !== 'mobile', stencil: false, powerPreference: quality === 'mobile' ? 'low-power' : 'high-performance' }}
      fallback={<span />}
      style={{ pointerEvents: 'none' }}
    >
      <Suspense fallback={null}><StudioComposition {...props} /></Suspense>
    </Canvas>
  );
}
