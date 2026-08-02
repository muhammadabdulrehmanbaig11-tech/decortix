'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ───────────── Types ─────────────
interface FloatConfig {
  position: [number, number, number];
  shape: 'sphere' | 'torus' | 'torusKnot' | 'octahedron' | 'icosahedron';
  scale: number;
  color: string;
  phase: number;
  freq: number;
  amplitude: number;
  opacity: number;
  speed: number;
}

// ───────────── Mouse tracker (shared ref) ─────────────
const mouseNDC = { x: 0, y: 0 };

if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

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

    // ── Mouse repulsion ──
    const mouseVec = new THREE.Vector2(mouseNDC.x, mouseNDC.y);
    raycaster.current.setFromCamera(mouseVec, camera);
    const ray = raycaster.current.ray;

    // Project mesh position onto the ray and compute perpendicular distance
    const toMesh = mesh.position.clone().sub(ray.origin);
    const along = toMesh.dot(ray.direction);
    const closestOnRay = ray.origin.clone().add(ray.direction.clone().multiplyScalar(Math.max(along, 0)));
    const distToRay = mesh.position.distanceTo(closestOnRay);

    const repulsionRadius = 3.0;
    if (distToRay < repulsionRadius && along > 0) {
      const strength = ((repulsionRadius - distToRay) / repulsionRadius) * 0.06;
      const force = mesh.position.clone().sub(closestOnRay).normalize().multiplyScalar(strength);
      velRef.current.add(force);
    }

    // ── Spring back to base ──
    const springForce = basePos.current
      .clone()
      .setY(basePos.current.y + floatY)
      .sub(mesh.position)
      .multiplyScalar(0.03);
    velRef.current.add(springForce);

    // ── Dampen ──
    velRef.current.multiplyScalar(0.88);

    // ── Apply ──
    mesh.position.add(velRef.current);

    // ── Gentle rotation ──
    mesh.rotation.x += cfg.speed * 0.5;
    mesh.rotation.y += cfg.speed;
    mesh.rotation.z += cfg.speed * 0.3;
  });

  const geometry = useMemo(() => {
    switch (cfg.shape) {
      case 'sphere':       return <sphereGeometry args={[1, 32, 32]} />;
      case 'torus':        return <torusGeometry args={[1, 0.35, 16, 60]} />;
      case 'torusKnot':    return <torusKnotGeometry args={[0.8, 0.2, 128, 16]} />;
      case 'octahedron':   return <octahedronGeometry args={[1, 0]} />;
      case 'icosahedron':  return <icosahedronGeometry args={[1, 1]} />;
    }
  }, [cfg.shape]);

  return (
    <mesh ref={meshRef} position={cfg.position} scale={cfg.scale}>
      {geometry}
      <meshStandardMaterial
        color={cfg.color}
        transparent
        opacity={cfg.opacity}
        roughness={0.1}
        metalness={0.8}
        envMapIntensity={1.5}
        wireframe={cfg.shape === 'icosahedron'}
      />
    </mesh>
  );
}

// ───────────── Scene ─────────────
function Scene() {
  const objects: FloatConfig[] = useMemo(() => [
    // Large background spheres
    { position: [-8, 3, -12],  shape: 'sphere',      scale: 2.2,  color: '#1d4ed8', phase: 0,    freq: 0.3, amplitude: 0.8, opacity: 0.3, speed: 0.003 },
    { position: [9,  -2, -14], shape: 'sphere',      scale: 1.8,  color: '#2563eb', phase: 1.5,  freq: 0.25,amplitude: 1.0, opacity: 0.25,speed: 0.004 },
    { position: [0,  6,  -16], shape: 'sphere',      scale: 3.0,  color: '#1e3a8a', phase: 3,    freq: 0.2, amplitude: 0.6, opacity: 0.2, speed: 0.002 },
    // Medium tori
    { position: [-5, -4, -8],  shape: 'torus',       scale: 1.2,  color: '#60a5fa', phase: 0.8,  freq: 0.4, amplitude: 0.9, opacity: 0.45,speed: 0.006 },
    { position: [6,  2, -7],   shape: 'torus',       scale: 0.9,  color: '#93c5fd', phase: 2.2,  freq: 0.5, amplitude: 0.7, opacity: 0.4, speed: 0.007 },
    { position: [-3, 5, -10],  shape: 'torus',       scale: 1.5,  color: '#3b82f6', phase: 4.1,  freq: 0.35,amplitude: 1.1, opacity: 0.35,speed: 0.005 },
    // Torus knots
    { position: [4,  -5, -9],  shape: 'torusKnot',   scale: 0.65, color: '#a78bfa', phase: 1.2,  freq: 0.45,amplitude: 0.8, opacity: 0.5, speed: 0.008 },
    { position: [-7, 1, -11],  shape: 'torusKnot',   scale: 0.8,  color: '#7c3aed', phase: 3.5,  freq: 0.38,amplitude: 0.9, opacity: 0.4, speed: 0.009 },
    { position: [2,  7, -13],  shape: 'torusKnot',   scale: 0.55, color: '#8b5cf6', phase: 5.0,  freq: 0.52,amplitude: 0.6, opacity: 0.45,speed: 0.007 },
    // Octahedra
    { position: [8,  -1, -6],  shape: 'octahedron',  scale: 0.7,  color: '#bfdbfe', phase: 0.3,  freq: 0.6, amplitude: 0.5, opacity: 0.5, speed: 0.005 },
    { position: [-4, -6, -7],  shape: 'octahedron',  scale: 0.5,  color: '#dbeafe', phase: 2.8,  freq: 0.55,amplitude: 0.7, opacity: 0.45,speed: 0.006 },
    { position: [1,  -3, -5],  shape: 'octahedron',  scale: 0.55, color: '#60a5fa', phase: 4.4,  freq: 0.7, amplitude: 0.4, opacity: 0.4, speed: 0.007 },
    // Icosahedra (wireframe)
    { position: [-9, -2, -9],  shape: 'icosahedron', scale: 1.1,  color: '#93c5fd', phase: 1.7,  freq: 0.32,amplitude: 1.0, opacity: 0.35,speed: 0.004 },
    { position: [5,  6, -11],  shape: 'icosahedron', scale: 0.8,  color: '#60a5fa', phase: 3.9,  freq: 0.42,amplitude: 0.8, opacity: 0.3, speed: 0.005 },
    // Near-camera accent pieces
    { position: [-2, 0, -4],   shape: 'torus',       scale: 0.45, color: '#e0f2fe', phase: 0.6,  freq: 0.8, amplitude: 0.3, opacity: 0.55,speed: 0.010 },
    { position: [3,  -1, -4],  shape: 'octahedron',  scale: 0.35, color: '#bfdbfe', phase: 2.1,  freq: 0.9, amplitude: 0.25,opacity: 0.6, speed: 0.012 },
    { position: [-1, 2, -3],   shape: 'sphere',      scale: 0.3,  color: '#93c5fd', phase: 5.2,  freq: 1.0, amplitude: 0.2, opacity: 0.55,speed: 0.008 },
  ], []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} color="#1e3a8a" />
      <pointLight position={[-10, 10, 5]}  intensity={2.5} color="#3b82f6" distance={40} decay={2} />
      <pointLight position={[10,  -8, -5]} intensity={1.8} color="#6d28d9" distance={35} decay={2} />
      <pointLight position={[0,   0,  10]} intensity={0.8} color="#60a5fa" distance={25} decay={2} />
      {/* Fog */}
      <fog attach="fog" args={['#050913', 20, 50]} />
      {/* Objects */}
      {objects.map((cfg, i) => (
        <FloatingObject key={i} cfg={cfg} />
      ))}
    </>
  );
}

// ───────────── Export ─────────────
export default function AntiGravityBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
