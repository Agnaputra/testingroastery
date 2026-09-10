'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { Center, RoundedBox, useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Box3, BufferGeometry, CanvasTexture, Float32BufferAttribute, PlaneGeometry, SRGBColorSpace, Vector3 } from 'three';

/** Set this to '/models/coffee-bag.glb' when the final, locally hosted model is ready. */
export const COFFEE_MODEL_URL: string | null = null;

const PROFILE = [
  [-1.35, 0.76, 0.27],
  [-1.20, 0.87, 0.39],
  [-0.55, 0.90, 0.43],
  [0.55, 0.84, 0.34],
  [1.10, 0.79, 0.08],
  [1.30, 0.80, 0.045],
];

function pouchProfile(y: number) {
  for (let i = 1; i < PROFILE.length; i++) {
    if (y <= PROFILE[i][0]) {
      const a = PROFILE[i - 1];
      const b = PROFILE[i];
      const t = Math.min(1, Math.max(0, (y - a[0]) / (b[0] - a[0])));
      const eased = t * t * (3 - 2 * t);
      return { width: a[1] + (b[1] - a[1]) * eased, depth: a[2] + (b[2] - a[2]) * eased };
    }
  }
  return { width: 0.8, depth: 0.045 };
}

function makePouch() {
  const rows = 40;
  const segments = 56;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const softSquare = (n: number) => Math.sign(n) * Math.pow(Math.abs(n), 0.38);

  for (let row = 0; row <= rows; row++) {
    const y = -1.35 + (row / rows) * 2.65;
    const { width, depth } = pouchProfile(y);
    for (let segment = 0; segment <= segments; segment++) {
      const angle = (segment / segments) * Math.PI * 2;
      const x = width * softSquare(Math.cos(angle));
      const fold = 0.009 * Math.sin(y * 17 + x * 8) * Math.pow(Math.sin(angle), 2);
      const z = depth * softSquare(Math.sin(angle)) + fold;
      positions.push(x, y, z);
      uvs.push(segment / segments, row / rows);
      if (row < rows && segment < segments) {
        const a = row * (segments + 1) + segment;
        const b = a + segments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  // Close the gusset and the sealed shoulder without leaving open geometry.
  for (const [row, reverse] of [[0, true], [rows, false]] as const) {
    const centerIndex = positions.length / 3;
    positions.push(0, row === 0 ? -1.35 : 1.30, 0);
    uvs.push(0.5, 0.5);
    for (let segment = 0; segment < segments; segment++) {
      const a = row * (segments + 1) + segment;
      indices.push(...(reverse ? [centerIndex, a, a + 1] : [centerIndex, a + 1, a]));
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeLabelSurface() {
  const geometry = new PlaneGeometry(1.32, 1.48, 16, 24);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i) - 0.18;
    positions.setY(i, y);
    positions.setZ(i, pouchProfile(y).depth + 0.019);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function drawLabel(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  ctx.fillStyle = '#eee8da';
  ctx.fillRect(0, 0, w, canvas.height);
  ctx.fillStyle = '#465c70';
  ctx.fillRect(0, 0, w, 22);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2c3136';
  ctx.font = '600 162px Raleway, sans-serif';
  ctx.fillText('52', w / 2, 225);
  ctx.font = '600 41px Montserrat, sans-serif';
  ctx.fillText('COFFEE & ROASTERY', w / 2, 296);
  ctx.font = '400 21px Montserrat, sans-serif';
  ctx.fillText('M A L A N G,  I N D O N E S I A', w / 2, 341);
  ctx.strokeStyle = '#b7b1a3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(75, 405);
  ctx.lineTo(w - 75, 405);
  ctx.stroke();
  ctx.fillStyle = '#465c70';
  ctx.font = '600 25px Montserrat, sans-serif';
  ctx.fillText('THE ORIGIN COLLECTION', w / 2, 467);
  ctx.fillStyle = '#342b25';
  ctx.font = '600 74px Raleway, sans-serif';
  ctx.fillText('Coffee,', w / 2, 583);
  ctx.fillText('made personal.', w / 2, 666);
  ctx.fillStyle = '#617281';
  ctx.font = '400 24px Montserrat, sans-serif';
  ctx.fillText('SPECIALTY COFFEE · WHOLE BEANS', w / 2, 764);
  ctx.fillStyle = '#8fb9bc';
  ctx.fillRect(75, 813, w - 150, 5);
  ctx.fillStyle = '#465c70';
  ctx.font = '500 23px Montserrat, sans-serif';
  ctx.fillText('THOUGHTFULLY ROASTED', w / 2, 870);
}

function ProceduralCoffeeBag() {
  const invalidate = useThree((state) => state.invalidate);
  const geometry = useMemo(makePouch, []);
  const labelGeometry = useMemo(makeLabelSurface, []);
  const label = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 832;
    canvas.height = 932;
    drawLabel(canvas);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);

  useEffect(() => {
    let disposed = false;
    document.fonts.ready.then(() => {
      if (!disposed) {
        drawLabel(label.image);
        label.needsUpdate = true;
        invalidate();
      }
    });
    return () => {
      disposed = true;
      geometry.dispose();
      labelGeometry.dispose();
      label.dispose();
    };
  }, [geometry, labelGeometry, label, invalidate]);

  return (
    <group name="52-coffee-procedural-pouch">
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#3e2c23" roughness={0.57} metalness={0.06} envMapIntensity={0.7} />
      </mesh>
      <mesh geometry={labelGeometry}>
        <meshStandardMaterial map={label} roughness={0.88} metalness={0} />
      </mesh>
      <RoundedBox args={[1.63, 0.14, 0.085]} position={[0, 1.31, 0]} radius={0.025} smoothness={3}>
        <meshStandardMaterial color="#36251f" roughness={0.66} />
      </RoundedBox>
      {[1.275, 1.315, 1.355].map((y) => (
        <mesh key={y} position={[0, y, 0.049]}>
          <boxGeometry args={[1.55, 0.008, 0.008]} />
          <meshStandardMaterial color="#634736" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.85, 0.245]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.076, 0.076, 0.014, 24]} />
        <meshStandardMaterial color="#2e221c" roughness={0.75} />
      </mesh>
      <RoundedBox args={[1.45, 0.06, 0.46]} position={[0, -1.33, 0]} radius={0.025} smoothness={3}>
        <meshStandardMaterial color="#39271f" roughness={0.75} />
      </RoundedBox>
    </group>
  );
}

function ImportedCoffeeBag({ url }: { url: string }) {
  // No remote Draco decoder: final GLB should be self-contained and uncompressed.
  const { scene } = useGLTF(url, false, false);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const scale = useMemo(() => {
    const size = new Box3().setFromObject(clone).getSize(new Vector3());
    return 2.75 / Math.max(size.y, 0.001);
  }, [clone]);
  return <group scale={scale}><Center><primitive object={clone} /></Center></group>;
}

export function CoffeeModel({ modelUrl = COFFEE_MODEL_URL }: { modelUrl?: string | null }) {
  return (
    <Suspense fallback={<ProceduralCoffeeBag />}>
      {modelUrl ? <ImportedCoffeeBag url={modelUrl} /> : <ProceduralCoffeeBag />}
    </Suspense>
  );
}
