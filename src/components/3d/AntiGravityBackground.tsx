'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────
//  Shared mouse NDC
// ─────────────────────────────────────────────────────────
const mouse = { x: 0, y: 0 };

// ─────────────────────────────────────────────────────────
//  Build a CatmullRom S-curve across the viewport
//  yOffset / zOffset let us layer multiple ribbons
// ─────────────────────────────────────────────────────────
function buildCurve(yOffset: number, zOffset: number): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-20,  -3 + yOffset, -2 + zOffset),
    new THREE.Vector3(-14,   2 + yOffset,  1 + zOffset),
    new THREE.Vector3( -8,  -2 + yOffset,  3 + zOffset),
    new THREE.Vector3( -3,   4 + yOffset,  0 + zOffset),
    new THREE.Vector3(  2,  -1 + yOffset, -1 + zOffset),
    new THREE.Vector3(  7,   3.5 + yOffset,  2 + zOffset),
    new THREE.Vector3( 13,  -1.5 + yOffset,  0 + zOffset),
    new THREE.Vector3( 18,   2 + yOffset, -2 + zOffset),
    new THREE.Vector3( 22,  -2 + yOffset,  1 + zOffset),
  ], false, 'catmullrom', 0.5);
}

// ─────────────────────────────────────────────────────────
//  Flowing Ribbon — satin matte MeshStandardMaterial
// ─────────────────────────────────────────────────────────
function Ribbon({
  yOffset    = 0,
  zOffset    = 0,
  radius     = 1.3,
  color      = '#00a8e8',
  emissive   = '#003a5e',
  roughness  = 0.42,
  metalness  = 0.12,
  opacity    = 1.0,
  floatSpeed = 0.14,
  floatAmp   = 0.5,
  phase      = 0,
}: {
  yOffset?:    number;
  zOffset?:    number;
  radius?:     number;
  color?:      string;
  emissive?:   string;
  roughness?:  number;
  metalness?:  number;
  opacity?:    number;
  floatSpeed?: number;
  floatAmp?:   number;
  phase?:      number;
}) {
  const meshRef  = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const curve = buildCurve(yOffset, zOffset);
    return new THREE.TubeGeometry(curve, 500, radius, 36, false);
  }, [yOffset, zOffset, radius]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Gentle vertical float
    meshRef.current.position.y =
      Math.sin(t * floatSpeed + phase) * floatAmp;

    // Subtle mouse-driven lean — keeps shape intact while giving "alive" feel
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      mouse.y * 0.06,
      0.035,
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      mouse.x * 0.04,
      0.035,
    );
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.4}
        roughness={roughness}
        metalness={metalness}
        transparent={opacity < 1}
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────
//  Floating orb
// ─────────────────────────────────────────────────────────
function Orb({
  position,
  radius,
  color,
  emissive,
  roughness = 0.35,
  metalness = 0.15,
  phase     = 0,
  speed     = 0.22,
}: {
  position:  [number, number, number];
  radius:    number;
  color:     string;
  emissive:  string;
  roughness?: number;
  metalness?: number;
  phase?:    number;
  speed?:    number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseY   = position[1];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = baseY + Math.sin(t * speed + phase) * 0.6;
    // Subtle mouse drift on X
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      position[0] + mouse.x * 0.5,
      0.02,
    );
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 96, 96]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.5}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────
//  Camera rig — whole scene sways with mouse
// ─────────────────────────────────────────────────────────
function CameraRig({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, -mouse.y * 0.03, 0.03,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,  mouse.x * 0.04, 0.03,
    );
  });

  return <group ref={groupRef}>{children}</group>;
}

// ─────────────────────────────────────────────────────────
//  Full Scene
// ─────────────────────────────────────────────────────────
function Scene() {
  return (
    <CameraRig>
      {/* ── Lighting: cyan + deep blue point lights for soft gradient shading ── */}
      <ambientLight intensity={0.35} color="#b3e5fc" />

      {/* Key light — bright cyan from upper left */}
      <pointLight
        position={[-12, 10, 6]}
        intensity={60}
        color="#00f0ff"
        distance={45}
        decay={2}
      />
      {/* Fill light — deep blue from right */}
      <pointLight
        position={[12, -6, 4]}
        intensity={40}
        color="#0040ff"
        distance={40}
        decay={2}
      />
      {/* Rim light — soft teal from behind */}
      <pointLight
        position={[0, 0, -8]}
        intensity={25}
        color="#007acc"
        distance={30}
        decay={2}
      />
      {/* Top fill for orbs */}
      <directionalLight position={[0, 12, 6]} intensity={1.5} color="#80d8ff" />

      {/* ── PRIMARY ribbon — main, thick, ocean blue/cyan ── */}
      <Ribbon
        yOffset={0}
        zOffset={0}
        radius={1.5}
        color="#0097c4"
        emissive="#003a5e"
        roughness={0.40}
        metalness={0.12}
        floatSpeed={0.13}
        floatAmp={0.5}
        phase={0}
      />

      {/* ── SECONDARY ribbon — above, slightly thinner, brighter cyan ── */}
      <Ribbon
        yOffset={2.8}
        zOffset={-2.5}
        radius={0.9}
        color="#00c8e8"
        emissive="#004466"
        roughness={0.45}
        metalness={0.10}
        opacity={0.85}
        floatSpeed={0.18}
        floatAmp={0.4}
        phase={1.4}
      />

      {/* ── ACCENT ribbon — below, deepest blue, semi-transparent ── */}
      <Ribbon
        yOffset={-3.2}
        zOffset={1.5}
        radius={0.65}
        color="#0068a8"
        emissive="#001f3a"
        roughness={0.50}
        metalness={0.08}
        opacity={0.70}
        floatSpeed={0.10}
        floatAmp={0.55}
        phase={2.8}
      />

      {/* ── Bottom-left orb: turquoise with warm edge (emissive warm teal) ── */}
      <Orb
        position={[-10, -5, -3]}
        radius={3.2}
        color="#0077a8"
        emissive="#00b4cc"
        roughness={0.30}
        metalness={0.20}
        phase={0}
        speed={0.20}
      />

      {/* ── Top-right large orb: pale blue-white, peeking from edge ── */}
      <Orb
        position={[11, 5, -5]}
        radius={3.8}
        color="#1a6fa0"
        emissive="#80d4f0"
        roughness={0.25}
        metalness={0.18}
        phase={2.1}
        speed={0.16}
      />

      {/* ── Small accent orb bottom-right ── */}
      <Orb
        position={[13, -6.5, -1]}
        radius={1.6}
        color="#005f8a"
        emissive="#00c8e8"
        roughness={0.38}
        metalness={0.12}
        phase={4.2}
        speed={0.30}
      />
    </CameraRig>
  );
}

// ─────────────────────────────────────────────────────────
//  Export — full-viewport fixed canvas, camera pulled back
// ─────────────────────────────────────────────────────────
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
        // Camera pulled back to z=18 — ribbon fills background without crowding text
        camera={{ position: [0, 0, 18], fov: 58 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          // Standard linear tone mapping for accurate satin colours
          toneMapping: THREE.LinearToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
