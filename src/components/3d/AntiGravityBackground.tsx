'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ───────────── Types ─────────────
interface FloatConfig {
  position: [number, number, number];
  shape: 'sphere' | 'torus' | 'torusKnot' | 'octahedron' | 'icosahedron';
  scale: number;
  color: string;
  emissive: string;
  phase: number;
  freq: number;
  amplitude: number;
  opacity: number;
  speed: number;
}

// ───────────── Shared mouse NDC ref (module-level, safe) ─────────────
const mouseNDC = { x: 0, y: 0 };

// ───────────── Individual Floating Mesh ─────────────
function FloatingObject({ cfg }: { cfg: FloatConfig }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velRef = useRef(new THREE.Vector3(0, 0, 0));
  const basePos = useRef(new THREE.Vector3(...cfg.position));
  const raycaster = useRef(new THREE.Raycaster());
  const { camera } = useThree();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const mesh = meshRef.current;

    // ── Baseline sine float ──
    const floatY = Math.sin(t * cfg.freq + cfg.phase) * cfg.amplitude;

    // ── Mouse repulsion via ray projection ──
    const mouseVec = new THREE.Vector2(mouseNDC.x, mouseNDC.y);
    raycaster.current.setFromCamera(mouseVec, camera);
    const ray = raycaster.current.ray;

    const toMesh = mesh.position.clone().sub(ray.origin);
    const along = toMesh.dot(ray.direction);
    const closestOnRay = ray.origin
      .clone()
      .add(ray.direction.clone().multiplyScalar(Math.max(along, 0)));
    const distToRay = mesh.position.distanceTo(closestOnRay);

    const repulsionRadius = 3.2;
    if (distToRay < repulsionRadius && along > 0) {
      const strength = ((repulsionRadius - distToRay) / repulsionRadius) * 0.07;
      const force = mesh.position
        .clone()
        .sub(closestOnRay)
        .normalize()
        .multiplyScalar(strength);
      velRef.current.add(force);
    }

    // ── Spring back to rest ──
    const springForce = basePos.current
      .clone()
      .setY(basePos.current.y + floatY)
      .sub(mesh.position)
      .multiplyScalar(0.03);
    velRef.current.add(springForce);

    // ── Dampen ──
    velRef.current.multiplyScalar(0.88);

    // ── Apply velocity ──
    mesh.position.add(velRef.current);

    // ── Gentle rotation ──
    mesh.rotation.x += cfg.speed * 0.5;
    mesh.rotation.y += cfg.speed;
    mesh.rotation.z += cfg.speed * 0.3;
  });

  const geometry = useMemo(() => {
    switch (cfg.shape) {
      case 'sphere':      return <sphereGeometry args={[1, 32, 32]} />;
      case 'torus':       return <torusGeometry args={[1, 0.35, 16, 60]} />;
      case 'torusKnot':   return <torusKnotGeometry args={[0.8, 0.2, 128, 16]} />;
      case 'octahedron':  return <octahedronGeometry args={[1, 0]} />;
      case 'icosahedron': return <icosahedronGeometry args={[1, 1]} />;
    }
  }, [cfg.shape]);

  return (
    <mesh ref={meshRef} position={cfg.position} scale={cfg.scale}>
      {geometry}
      <meshStandardMaterial
        color={cfg.color}
        emissive={cfg.emissive}
        emissiveIntensity={0.6}
        transparent
        opacity={cfg.opacity}
        roughness={0.25}
        metalness={0.4}
        wireframe={cfg.shape === 'icosahedron'}
      />
    </mesh>
  );
}

// ───────────── Scene ─────────────
function Scene() {
  const objects: FloatConfig[] = useMemo(() => [
    // ── Large background spheres ──
    { position: [-8,  3,  -12], shape: 'sphere',     scale: 2.2,  color: '#2563eb', emissive: '#1d4ed8', phase: 0,   freq: 0.30, amplitude: 0.8, opacity: 0.75, speed: 0.003 },
    { position: [ 9, -2,  -14], shape: 'sphere',     scale: 1.8,  color: '#3b82f6', emissive: '#2563eb', phase: 1.5, freq: 0.25, amplitude: 1.0, opacity: 0.70, speed: 0.004 },
    { position: [ 0,  6,  -16], shape: 'sphere',     scale: 3.0,  color: '#1d4ed8', emissive: '#1e3a8a', phase: 3.0, freq: 0.20, amplitude: 0.6, opacity: 0.65, speed: 0.002 },
    // ── Tori ──
    { position: [-5, -4,   -8], shape: 'torus',      scale: 1.2,  color: '#60a5fa', emissive: '#3b82f6', phase: 0.8, freq: 0.40, amplitude: 0.9, opacity: 0.80, speed: 0.006 },
    { position: [ 6,  2,   -7], shape: 'torus',      scale: 0.9,  color: '#93c5fd', emissive: '#60a5fa', phase: 2.2, freq: 0.50, amplitude: 0.7, opacity: 0.78, speed: 0.007 },
    { position: [-3,  5,  -10], shape: 'torus',      scale: 1.5,  color: '#3b82f6', emissive: '#2563eb', phase: 4.1, freq: 0.35, amplitude: 1.1, opacity: 0.72, speed: 0.005 },
    // ── Torus knots ──
    { position: [ 4, -5,   -9], shape: 'torusKnot',  scale: 0.65, color: '#a78bfa', emissive: '#7c3aed', phase: 1.2, freq: 0.45, amplitude: 0.8, opacity: 0.82, speed: 0.008 },
    { position: [-7,  1,  -11], shape: 'torusKnot',  scale: 0.80, color: '#c4b5fd', emissive: '#7c3aed', phase: 3.5, freq: 0.38, amplitude: 0.9, opacity: 0.78, speed: 0.009 },
    { position: [ 2,  7,  -13], shape: 'torusKnot',  scale: 0.55, color: '#8b5cf6', emissive: '#6d28d9', phase: 5.0, freq: 0.52, amplitude: 0.6, opacity: 0.75, speed: 0.007 },
    // ── Octahedra ──
    { position: [ 8, -1,   -6], shape: 'octahedron', scale: 0.70, color: '#bfdbfe', emissive: '#60a5fa', phase: 0.3, freq: 0.60, amplitude: 0.5, opacity: 0.85, speed: 0.005 },
    { position: [-4, -6,   -7], shape: 'octahedron', scale: 0.50, color: '#dbeafe', emissive: '#93c5fd', phase: 2.8, freq: 0.55, amplitude: 0.7, opacity: 0.82, speed: 0.006 },
    { position: [ 1, -3,   -5], shape: 'octahedron', scale: 0.55, color: '#60a5fa', emissive: '#3b82f6', phase: 4.4, freq: 0.70, amplitude: 0.4, opacity: 0.80, speed: 0.007 },
    // ── Wireframe icosahedra ──
    { position: [-9, -2,   -9], shape: 'icosahedron',scale: 1.10, color: '#93c5fd', emissive: '#60a5fa', phase: 1.7, freq: 0.32, amplitude: 1.0, opacity: 0.80, speed: 0.004 },
    { position: [ 5,  6,  -11], shape: 'icosahedron',scale: 0.80, color: '#60a5fa', emissive: '#3b82f6', phase: 3.9, freq: 0.42, amplitude: 0.8, opacity: 0.75, speed: 0.005 },
    // ── Near-camera accent pieces ──
    { position: [-2,  0,   -4], shape: 'torus',      scale: 0.45, color: '#e0f2fe', emissive: '#7dd3fc', phase: 0.6, freq: 0.80, amplitude: 0.3, opacity: 0.88, speed: 0.010 },
    { position: [ 3, -1,   -4], shape: 'octahedron', scale: 0.35, color: '#bfdbfe', emissive: '#93c5fd', phase: 2.1, freq: 0.90, amplitude: 0.25,opacity: 0.90, speed: 0.012 },
    { position: [-1,  2,   -3], shape: 'sphere',     scale: 0.30, color: '#93c5fd', emissive: '#60a5fa', phase: 5.2, freq: 1.00, amplitude: 0.2, opacity: 0.88, speed: 0.008 },
  ], []);

  return (
    <>
      {/* ── Lighting — bright enough to illuminate metallic surfaces ── */}
      <ambientLight intensity={1.2} color="#ffffff" />
      <pointLight position={[-10, 10,  8]}  intensity={4.0} color="#60a5fa" distance={50} decay={2} />
      <pointLight position={[ 10, -8, -5]}  intensity={3.0} color="#a78bfa" distance={45} decay={2} />
      <pointLight position={[  0,  0, 12]}  intensity={2.0} color="#93c5fd" distance={35} decay={2} />
      <pointLight position={[  0,  0,  5]}  intensity={1.5} color="#ffffff" distance={20} decay={2} />
      {/* Subtle fog to give depth without hiding objects */}
      <fog attach="fog" args={['#050913', 25, 60]} />
      {/* Objects */}
      {objects.map((cfg, i) => (
        <FloatingObject key={i} cfg={cfg} />
      ))}
    </>
  );
}

// ───────────── Canvas Wrapper ─────────────
export default function AntiGravityBackground() {
  // Attach mouse listener inside the component so it is properly cleaned up
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseNDC.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    // FIX: fixed, full-viewport, z-0, NO background color (transparent by default)
    // pointer-events none so it never blocks UI clicks
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
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{
          antialias: true,
          alpha: true,           // transparent WebGL context
          powerPreference: 'high-performance',
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: 'transparent', // must be transparent — no canvas background
        }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
