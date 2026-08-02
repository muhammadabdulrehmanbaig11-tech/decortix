'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────
//  Shared mouse NDC
// ─────────────────────────────────────────────────────
const mouse = { x: 0, y: 0 };

// ─────────────────────────────────────────────────────
//  Curve that matches the reference S-path:
//  enters upper-left, sweeps down through center,
//  exits lower-right — same trajectory as the reference.
// ─────────────────────────────────────────────────────
function buildCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-18,  7, -1),  // top-left entry
      new THREE.Vector3(-13,  3,  1),
      new THREE.Vector3( -9, -1,  3),
      new THREE.Vector3( -5, -5,  2),  // lower-left swing
      new THREE.Vector3( -1, -3,  0),
      new THREE.Vector3(  2,  1, -1),  // center rise
      new THREE.Vector3(  6, -1,  1),
      new THREE.Vector3( 10, -4,  0),
      new THREE.Vector3( 14, -6, -1),  // lower-right exit
      new THREE.Vector3( 18, -5, -2),
    ],
    false,
    'catmullrom',
    0.5,
  );
}

// ─────────────────────────────────────────────────────
//  Build a single FLAT ribbon layer along the curve.
//  - halfWidth: half the visible width of each strip
//  - binOffset: offset in the binormal (depth) direction
//               so layers are stacked front→back
// ─────────────────────────────────────────────────────
function buildRibbonLayer(
  pts: THREE.Vector3[],
  frames: { normals: THREE.Vector3[]; binormals: THREE.Vector3[] },
  halfWidth: number,
  binOffset: number,
  segs: number,
): THREE.BufferGeometry {
  const pos: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];

  for (let i = 0; i <= segs; i++) {
    const p  = pts[i];
    const n  = frames.normals[i];
    const bn = frames.binormals[i];

    // Shift the ribbon strip along the binormal
    const cx = p.x + bn.x * binOffset;
    const cy = p.y + bn.y * binOffset;
    const cz = p.z + bn.z * binOffset;

    // Left edge
    pos.push(cx - n.x * halfWidth, cy - n.y * halfWidth, cz - n.z * halfWidth);
    // Right edge
    pos.push(cx + n.x * halfWidth, cy + n.y * halfWidth, cz + n.z * halfWidth);

    const u = i / segs;
    uvs.push(u, 0, u, 1);
  }

  for (let i = 0; i < segs; i++) {
    const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
    idx.push(a, b, d, a, d, c); // two triangles per quad
  }

  const geo = new THREE.BufferGeometry();
  geo.setIndex(idx);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

// ─────────────────────────────────────────────────────
//  Colour ramp — matches reference:
//  back layers: deep navy/cobalt → front: bright cyan
// ─────────────────────────────────────────────────────
const RAMP: THREE.Color[] = [
  new THREE.Color('#020a2e'), // darkest back
  new THREE.Color('#03155a'),
  new THREE.Color('#042080'),
  new THREE.Color('#063399'),
  new THREE.Color('#0044bb'),
  new THREE.Color('#0055d4'),
  new THREE.Color('#0066ee'),
  new THREE.Color('#0080f8'),
  new THREE.Color('#009aff'),
  new THREE.Color('#00b2ff'),
  new THREE.Color('#00c8ff'),
  new THREE.Color('#00dcff'),
  new THREE.Color('#00edff'),
  new THREE.Color('#00f8ff'), // brightest front
];

const SEGMENTS   = 260;  // curve resolution
const HALF_WIDTH = 2.1;  // ribbon half-width
const LAYER_GAP  = 0.30; // binormal step between layers

// ─────────────────────────────────────────────────────
//  RibbonStack — 14 flat strips stacked front→back
// ─────────────────────────────────────────────────────
function RibbonStack() {
  const groupRef = useRef<THREE.Group>(null);

  // Build all layer geometries once
  const layers = useMemo(() => {
    const curve  = buildCurve();
    const frames = curve.computeFrenetFrames(SEGMENTS, false);
    const pts    = curve.getSpacedPoints(SEGMENTS);
    const n      = RAMP.length;
    const half   = ((n - 1) * LAYER_GAP) / 2;

    return RAMP.map((color, i) => {
      const offset = -half + i * LAYER_GAP; // spread layers symmetrically
      const geo    = buildRibbonLayer(pts, frames, HALF_WIDTH, offset, SEGMENTS);
      return { geo, color };
    });
  }, []);

  // Float + react to mouse
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.14) * 0.35;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z, mouse.y * 0.05, 0.04,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, mouse.x * 0.04, 0.04,
    );
  });

  return (
    <group ref={groupRef}>
      {layers.map(({ geo, color }, i) => (
        <mesh key={i} geometry={geo} renderOrder={i}>
          <meshStandardMaterial
            color={color}
            roughness={0.62}
            metalness={0.08}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────
//  Floating sphere — neutral grey/white material;
//  lighting provides the cyan↔gold gradient sheen.
// ─────────────────────────────────────────────────────
function Orb({
  position,
  radius,
  phase,
  speed,
}: {
  position: [number, number, number];
  radius: number;
  phase: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseY   = position[1];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = baseY + Math.sin(t * speed + phase) * 0.55;
    // Subtle mouse drift
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      position[0] + mouse.x * 0.35,
      0.022,
    );
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        color="#aaaaaa"
        roughness={0.20}
        metalness={0.50}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────
//  Camera rig — whole scene sways gently with mouse
// ─────────────────────────────────────────────────────
function CameraRig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -mouse.y * 0.022, 0.03);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y,  mouse.x * 0.030, 0.03);
  });
  return <group ref={ref}>{children}</group>;
}

// ─────────────────────────────────────────────────────
//  Full Scene
// ─────────────────────────────────────────────────────
function Scene() {
  return (
    <CameraRig>
      {/* ── Ambient (very dim, so point lights dominate) ── */}
      <ambientLight intensity={0.18} color="#0d1f40" />

      {/* ─── RIBBON LIGHTS ─────────────────────────────── */}
      {/* Cyan key from upper-left */}
      <pointLight position={[-12,  9,  8]} intensity={90} color="#00ccff" distance={50} decay={2} />
      {/* Deep-blue fill from right */}
      <pointLight position={[ 12, -5,  6]} intensity={55} color="#0044ff" distance={42} decay={2} />
      {/* Teal under-bounce */}
      <pointLight position={[  0, -9,  5]} intensity={35} color="#006699" distance={35} decay={2} />

      {/* ─── ORB 1: Bottom-Left ────────────────────────── */}
      {/* Cyan hits the left-bottom face directly */}
      <pointLight position={[-12, -9,  5]} intensity={55} color="#00ffff" distance={20} decay={2} />
      {/* Warm gold specular on top-right of the orb */}
      <pointLight position={[ -6, -2,  6]} intensity={40} color="#ffe066" distance={16} decay={2} />

      {/* ─── ORB 2: Mid-Right ──────────────────────────── */}
      {/* Gold/yellow from top-right — creates the warm highlight seen in reference */}
      <pointLight position={[ 16,  5,  7]} intensity={60} color="#ffdd88" distance={22} decay={2} />
      {/* Cyan from lower-left for the teal face */}
      <pointLight position={[  7, -3,  6]} intensity={40} color="#00ffff" distance={18} decay={2} />

      {/* ─── Geometry ─────────────────────────────────── */}
      <RibbonStack />

      {/* Orb 1 — bottom-left */}
      <Orb position={[-9.5, -5.5, -0.5]} radius={2.6} phase={0}   speed={0.20} />
      {/* Orb 2 — mid-right, large, partially behind ribbon */}
      <Orb position={[ 10.5,  1.5, -3.0]} radius={3.4} phase={1.8} speed={0.17} />
    </CameraRig>
  );
}

// ─────────────────────────────────────────────────────
//  Export — fixed full-viewport canvas
// ─────────────────────────────────────────────────────
export default function AntiGravityBackground() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 18], fov: 58 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.LinearToneMapping,
          toneMappingExposure: 1.05,
        }}
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
