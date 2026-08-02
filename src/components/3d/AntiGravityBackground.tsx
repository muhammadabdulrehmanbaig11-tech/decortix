'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────
//  Shared mouse NDC
// ─────────────────────────────────────────────────────────
const mouse = { x: 0, y: 0 };

// ─────────────────────────────────────────────────────────
//  ORBS — GLSL normal-based gradient
// ─────────────────────────────────────────────────────────
const ORB_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const ORB_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uLightDir;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 n = normalize(vNormal);
    float t = dot(n, normalize(uLightDir)) * 0.5 + 0.5;
    t = smoothstep(0.05, 0.95, t);
    vec3 col = mix(uColorA, uColorB, t);

    float rim = 1.0 - max(dot(n, vViewDir), 0.0);
    col += uColorB * pow(rim, 3.0) * 0.5;

    vec3 h = normalize(vViewDir + normalize(uLightDir));
    float spec = pow(max(dot(n, h), 0.0), 28.0) * 0.4;
    col += vec3(spec);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const RIGHT_UNIFORMS = {
  uColorA: { value: new THREE.Color('#ffd700') },
  uColorB: { value: new THREE.Color('#00e8ff') },
  uLightDir: { value: new THREE.Vector3(-0.6, 0.6, 0.5) },
};
const LEFT_UNIFORMS = {
  uColorA: { value: new THREE.Color('#0040aa') },
  uColorB: { value: new THREE.Color('#00e0ff') },
  uLightDir: { value: new THREE.Vector3(-0.5, 0.7, 0.5) },
};

function GradientOrb({
  position, radius, uniforms, phase, speed, baseX,
}: {
  position: [number, number, number];
  radius: number;
  uniforms: typeof RIGHT_UNIFORMS;
  phase: number;
  speed: number;
  baseX: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseY = position[1];
  const material = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: ORB_VERT,
      fragmentShader: ORB_FRAG,
      uniforms,
    }),
    [uniforms],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = baseY + Math.sin(t * speed + phase) * 0.4;
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x, baseX + mouse.x * 0.3, 0.02,
    );
  });

  return (
    <mesh ref={meshRef} position={position} material={material}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────
//  RIBBON CLUSTER — stacked thick TubeGeometry
//
//  Reference image key observations:
//  • Main ribbon flows from UPPER-LEFT → center → right,
//    with its visual mass centered/slightly-left-of-center
//  • Layers are THICK (radius ~1.2), FEW (7-8 visible),
//    and WELL-SPACED (not thin parallel cables)
//  • Dramatic S-curve with large Y amplitude (~7 units)
//  • Lower-right ribbon is smaller and more elegant
//  • Colors: deep blue (back) → vibrant cyan (front)
//  • Each layer is offset not just in Y but slightly in Z
//    to create depth fanning at curves
// ─────────────────────────────────────────────────────────

// ── Main upper-left ribbon ──
// Big dramatic S-curve centered around x=-2
const UPPER_POINTS = [
  new THREE.Vector3(-20,  10,  -4),
  new THREE.Vector3(-14,   5,   2),
  new THREE.Vector3( -8,  -1,   5),
  new THREE.Vector3( -3,  -5,   2),
  new THREE.Vector3(  1,  -2,  -2),
  new THREE.Vector3(  5,   4,  -4),
  new THREE.Vector3(  8,   2,   0),
  new THREE.Vector3( 11,  -3,   3),
];

// ── Lower-right ribbon ──
// Smaller, elegant sweep from center-right downward
const LOWER_POINTS = [
  new THREE.Vector3(  6,   0,  -2),
  new THREE.Vector3( 10,  -3,   1),
  new THREE.Vector3( 14,  -7,   3),
  new THREE.Vector3( 18,  -9,   1),
  new THREE.Vector3( 22,  -7,  -2),
];

interface LayerDef {
  yOff: number;
  zOff: number;
  color: string;
  radius: number;
}

// 8 layers for upper cluster — thick, well-spaced
const UPPER_LAYERS: LayerDef[] = [
  { yOff: -3.8, zOff: -1.5, color: '#0430a0', radius: 1.25 },
  { yOff: -2.7, zOff: -1.0, color: '#0548b8', radius: 1.20 },
  { yOff: -1.6, zOff: -0.5, color: '#0760d0', radius: 1.15 },
  { yOff: -0.5, zOff:  0.0, color: '#0978e8', radius: 1.15 },
  { yOff:  0.6, zOff:  0.4, color: '#0c90f0', radius: 1.10 },
  { yOff:  1.7, zOff:  0.8, color: '#10a8f8', radius: 1.05 },
  { yOff:  2.8, zOff:  1.2, color: '#30c8ff', radius: 1.00 },
  { yOff:  3.9, zOff:  1.6, color: '#55e0ff', radius: 0.95 },
];

// 6 layers for lower cluster — slightly thicker
const LOWER_LAYERS: LayerDef[] = [
  { yOff: -2.5, zOff: -1.0, color: '#0440a8', radius: 1.30 },
  { yOff: -1.5, zOff: -0.5, color: '#0660cc', radius: 1.25 },
  { yOff: -0.5, zOff:  0.0, color: '#0880e8', radius: 1.20 },
  { yOff:  0.5, zOff:  0.4, color: '#0ea0f5', radius: 1.15 },
  { yOff:  1.5, zOff:  0.8, color: '#25c0ff', radius: 1.10 },
  { yOff:  2.5, zOff:  1.2, color: '#50e0ff', radius: 1.05 },
];

function RibbonCluster({
  points,
  layers,
}: {
  points: THREE.Vector3[];
  layers: LayerDef[];
}) {
  const groupRef = useRef<THREE.Group>(null);

  const tubes = useMemo(() =>
    layers.map(({ yOff, zOff, color, radius }) => {
      // Offset each layer in Y AND Z for depth fanning
      const pts = points.map(p =>
        new THREE.Vector3(p.x, p.y + yOff, p.z + zOff),
      );
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.35);
      const geo = new THREE.TubeGeometry(curve, 300, radius, 48, false);
      return { geo, color };
    }),
  [points, layers]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.12) * 0.3;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, mouse.x * 0.035, 0.025,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, -mouse.y * 0.025, 0.025,
    );
  });

  return (
    <group ref={groupRef}>
      {tubes.map(({ geo, color }, i) => (
        <mesh key={i} geometry={geo}>
          <meshPhysicalMaterial
            color={color}
            roughness={0.28}
            metalness={0.05}
            clearcoat={0.9}
            clearcoatRoughness={0.1}
            flatShading={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────
//  Camera rig
// ─────────────────────────────────────────────────────────
function CameraRig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x, -mouse.y * 0.01, 0.02,
    );
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y, mouse.x * 0.015, 0.02,
    );
  });
  return <group ref={ref}>{children}</group>;
}

// ─────────────────────────────────────────────────────────
//  Scene
// ─────────────────────────────────────────────────────────
function Scene() {
  return (
    <CameraRig>
      {/* Soft ambient */}
      <hemisphereLight args={['#001030', '#0088cc', 0.9]} />

      {/* Cyan key from top-left */}
      <directionalLight position={[-10, 14, 8]} intensity={3.5} color="#00eeff" />

      {/* Blue fill from right */}
      <directionalLight position={[12, -5, 5]} intensity={1.5} color="#0055ff" />

      {/* Soft front fill for readability */}
      <directionalLight position={[0, 2, 16]} intensity={0.8} color="#88ddff" />

      {/* ── UPPER-LEFT ribbon (main, larger) ── */}
      <RibbonCluster points={UPPER_POINTS} layers={UPPER_LAYERS} />

      {/* ── LOWER-RIGHT ribbon (secondary, smaller) ── */}
      <RibbonCluster points={LOWER_POINTS} layers={LOWER_LAYERS} />

      {/* ── RIGHT ORB — large, partially cut off at right edge ── */}
      <GradientOrb
        position={[14, 1.5, -6]}
        radius={4.2}
        uniforms={RIGHT_UNIFORMS}
        phase={0}
        speed={0.14}
        baseX={14}
      />

      {/* ── LEFT ORB — smaller, bottom-left ── */}
      <GradientOrb
        position={[-9, -5.5, 2]}
        radius={2.0}
        uniforms={LEFT_UNIFORMS}
        phase={1.5}
        speed={0.2}
        baseX={-9}
      />
    </CameraRig>
  );
}

// ─────────────────────────────────────────────────────────
//  Export
// ─────────────────────────────────────────────────────────
export default function AntiGravityBackground() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
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
        camera={{ position: [0, 0, 24], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.LinearToneMapping,
          toneMappingExposure: 1.0,
        }}
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}