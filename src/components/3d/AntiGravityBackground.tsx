'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────
//  Shared mouse NDC (normalised device coords)
// ─────────────────────────────────────────────
const mouse = { x: 0, y: 0 };

// ─────────────────────────────────────────────
//  Gradient vertex-color helper
//  Paints the tube positions along its length,
//  cycling deep-blue → cyan → teal → white
// ─────────────────────────────────────────────
function applyTubeGradient(
  geo: THREE.TubeGeometry,
  colors: THREE.Color[],
) {
  const pos = geo.attributes.position;
  const count = pos.count;
  const colArr = new Float32Array(count * 3);

  // The tube geometry stores rings sequentially.
  // We use x position (mapped 0→1 along length) to lerp color.
  let minX = Infinity, maxX = -Infinity;
  for (let i = 0; i < count; i++) {
    const x = pos.getX(i);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }
  const range = maxX - minX || 1;

  const tmp = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const t = (pos.getX(i) - minX) / range; // 0 … 1 along length
    const seg = t * (colors.length - 1);
    const lo = Math.floor(seg);
    const hi = Math.min(lo + 1, colors.length - 1);
    tmp.lerpColors(colors[lo], colors[hi], seg - lo);
    colArr[i * 3]     = tmp.r;
    colArr[i * 3 + 1] = tmp.g;
    colArr[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
}

// ─────────────────────────────────────────────
//  Flowing Ribbon  — thick tube along a
//  CatmullRom S-curve crossing the viewport
// ─────────────────────────────────────────────
function Ribbon({
  yOffset   = 0,
  zOffset   = 0,
  radius    = 1.4,
  segments  = 400,
  radialSeg = 32,
  gradientColors,
  roughness = 0.08,
  metalness = 0.65,
  opacity   = 1.0,
  speed     = 0.12,
}: {
  yOffset?: number;
  zOffset?: number;
  radius?: number;
  segments?: number;
  radialSeg?: number;
  gradientColors: THREE.Color[];
  roughness?: number;
  metalness?: number;
  opacity?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Build the CatmullRom path once
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-16,  -4 + yOffset, -1 + zOffset),
      new THREE.Vector3(-11,   3 + yOffset,  2 + zOffset),
      new THREE.Vector3( -7,  -2 + yOffset,  4 + zOffset),
      new THREE.Vector3( -3,   5 + yOffset,  1 + zOffset),
      new THREE.Vector3(  1,  -0.5 + yOffset, -2 + zOffset),
      new THREE.Vector3(  5,   4 + yOffset,  3 + zOffset),
      new THREE.Vector3(  9,  -1 + yOffset,  1 + zOffset),
      new THREE.Vector3( 13,   2 + yOffset, -1 + zOffset),
      new THREE.Vector3( 17,  -3 + yOffset,  0 + zOffset),
    ]);
  }, [yOffset, zOffset]);

  // Build TubeGeometry + vertex colours
  const geometry = useMemo(() => {
    const geo = new THREE.TubeGeometry(curve, segments, radius, radialSeg, false);
    applyTubeGradient(geo, gradientColors);
    return geo;
  }, [curve, segments, radius, radialSeg, gradientColors]);

  // Float & react to mouse
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = Math.sin(t * speed) * 0.6;
    // Subtle mouse lean on the ribbon group
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      mouse.y * 0.08,
      0.04,
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      mouse.x * 0.06,
      0.04,
    );
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhysicalMaterial
        vertexColors
        roughness={roughness}
        metalness={metalness}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        transparent={opacity < 1}
        opacity={opacity}
        side={THREE.DoubleSide}
        envMapIntensity={2.5}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────
//  Floating Orb
// ─────────────────────────────────────────────
function FloatingOrb({
  position,
  radius,
  color,
  emissive,
  phase,
  speed,
}: {
  position: [number, number, number];
  radius: number;
  color: string;
  emissive: string;
  phase: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y =
      position[1] + Math.sin(t * speed + phase) * 0.55;
    meshRef.current.rotation.y += 0.003;
    // Subtle mouse shift
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      position[0] + mouse.x * 0.4,
      0.025,
    );
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 128, 128]} />
      <meshPhysicalMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.25}
        roughness={0.05}
        metalness={0.7}
        clearcoat={1.0}
        clearcoatRoughness={0.02}
        envMapIntensity={3.0}
        transmission={0.15}   // slight translucency / liquid glass
        ior={1.5}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────
//  Camera group that leans with the mouse
// ─────────────────────────────────────────────
function CameraRig({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -mouse.y * 0.04,
      0.03,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.x * 0.05,
      0.03,
    );
  });

  return <group ref={groupRef}>{children}</group>;
}

// ─────────────────────────────────────────────
//  Full Scene
// ─────────────────────────────────────────────
function Scene() {
  // ── Colour palettes ──────────────────────────
  // Primary ribbon: deep navy → electric blue → bright cyan
  const primaryColors = useMemo(() => [
    new THREE.Color('#0a1628'), // deep navy
    new THREE.Color('#0d3b7a'), // mid blue
    new THREE.Color('#0e6ead'), // ocean blue
    new THREE.Color('#00b4d8'), // bright cyan
    new THREE.Color('#00e5ff'), // electric cyan
    new THREE.Color('#90e0ef'), // pale cyan
    new THREE.Color('#00b4d8'), // back to ocean
    new THREE.Color('#0d3b7a'), // close with blue
  ], []);

  // Secondary ribbon: teal → white-cyan
  const secondaryColors = useMemo(() => [
    new THREE.Color('#023e8a'),
    new THREE.Color('#0077b6'),
    new THREE.Color('#00b4d8'),
    new THREE.Color('#caf0f8'),
    new THREE.Color('#00b4d8'),
    new THREE.Color('#0077b6'),
  ], []);

  // Accent ribbon: deeper tones
  const accentColors = useMemo(() => [
    new THREE.Color('#03045e'),
    new THREE.Color('#0d3b7a'),
    new THREE.Color('#023e8a'),
    new THREE.Color('#0077b6'),
    new THREE.Color('#00b4d8'),
    new THREE.Color('#0077b6'),
    new THREE.Color('#023e8a'),
  ], []);

  return (
    <CameraRig>
      {/* ── Environment for physical material reflections ── */}
      <Environment preset="city" />

      {/* ── Directional lights — blue & cyan tints ── */}
      <ambientLight intensity={0.4} color="#b3e5fc" />
      <directionalLight
        position={[-8, 6, 4]}
        intensity={6}
        color="#00e5ff"
        castShadow
      />
      <directionalLight
        position={[8, -4, 6]}
        intensity={4}
        color="#0d47a1"
      />
      <pointLight position={[0, 8, 4]}  intensity={5} color="#00b4d8" distance={30} decay={2} />
      <pointLight position={[0, -8, 2]} intensity={3} color="#1565c0" distance={25} decay={2} />
      <spotLight
        position={[-6, 10, 8]}
        angle={0.4}
        penumbra={0.8}
        intensity={8}
        color="#00e5ff"
        distance={40}
        decay={2}
      />

      {/* ── PRIMARY ribbon — thick, centre stage ── */}
      <Ribbon
        yOffset={0}
        zOffset={0}
        radius={1.55}
        segments={500}
        radialSeg={40}
        gradientColors={primaryColors}
        roughness={0.06}
        metalness={0.70}
        speed={0.14}
      />

      {/* ── SECONDARY ribbon — behind & above, thinner ── */}
      <Ribbon
        yOffset={2.5}
        zOffset={-3}
        radius={0.95}
        segments={400}
        radialSeg={28}
        gradientColors={secondaryColors}
        roughness={0.10}
        metalness={0.65}
        opacity={0.88}
        speed={0.18}
      />

      {/* ── ACCENT ribbon — below & forward ── */}
      <Ribbon
        yOffset={-2.8}
        zOffset={1.5}
        radius={0.65}
        segments={350}
        radialSeg={24}
        gradientColors={accentColors}
        roughness={0.12}
        metalness={0.60}
        opacity={0.75}
        speed={0.10}
      />

      {/* ── Floating orbs ── */}
      {/* Bottom-left large orb */}
      <FloatingOrb
        position={[-9, -4, -2]}
        radius={2.8}
        color="#0077b6"
        emissive="#00b4d8"
        phase={0}
        speed={0.22}
      />
      {/* Top-right large orb */}
      <FloatingOrb
        position={[8.5, 3.5, -4]}
        radius={2.4}
        color="#0d3b7a"
        emissive="#00e5ff"
        phase={1.8}
        speed={0.28}
      />
      {/* Small bottom-right accent orb */}
      <FloatingOrb
        position={[10, -5, -1]}
        radius={1.4}
        color="#023e8a"
        emissive="#90e0ef"
        phase={3.4}
        speed={0.35}
      />
    </CameraRig>
  );
}

// ─────────────────────────────────────────────
//  Export — full-viewport fixed canvas
// ─────────────────────────────────────────────
export default function AntiGravityBackground() {
  // Mouse tracking with cleanup
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
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
        dpr={[1, 2]}
        shadows
      >
        <Scene />
      </Canvas>
    </div>
  );
}
