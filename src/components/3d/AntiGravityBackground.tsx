'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────
//  Shared mouse NDC
// ─────────────────────────────────────────────────────────
const mouse = { x: 0, y: 0 };

// ─────────────────────────────────────────────────────────
//  ORBS — Custom GLSL gradient shader (normal-based blend)
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

    // Fresnel rim
    float rim = 1.0 - max(dot(n, vViewDir), 0.0);
    col += uColorB * pow(rim, 3.0) * 0.5;

    // Specular
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
//  FLOWING RIBBONS — thick, smooth TubeGeometry layers
//
//  The reference shows thick, rounded, smooth flowing bands
//  stacked on top of each other. Each band is a TubeGeometry
//  with radius ~1.0, following a gentle CatmullRom curve.
//
//  Layers are offset in Y to stack them. Colors go from
//  mid-blue at the back to bright vibrant cyan at the front.
//
//  HIGH segment counts prevent any visible faceting:
//    - 300 tubular segments (path smoothness)
//    - 64 radial segments (cross-section roundness)
// ─────────────────────────────────────────────────────────

// ── Upper-left ribbon cluster ──
// Gentle S-curve from upper-left through center
const UPPER_SPINE = [
  new THREE.Vector3(-22,  9,  -2),
  new THREE.Vector3(-16,  6,   3),
  new THREE.Vector3(-10,  2,   5),
  new THREE.Vector3( -5, -2,   3),
  new THREE.Vector3(  0, -4,   0),
  new THREE.Vector3(  5, -1,  -2),
  new THREE.Vector3(  9,  3,  -1),
  new THREE.Vector3( 12,  1,   2),
  new THREE.Vector3( 15, -2,   3),
];

// ── Lower-right ribbon cluster ──
// Flowing from mid area down to lower-right
const LOWER_SPINE = [
  new THREE.Vector3(  5,   1,  -1),
  new THREE.Vector3(  9,  -2,   2),
  new THREE.Vector3( 13,  -5,   4),
  new THREE.Vector3( 16,  -8,   3),
  new THREE.Vector3( 19,  -6,   0),
  new THREE.Vector3( 23,  -9,  -2),
];

// Each ribbon cluster's layer config:
// { yOffset, color, radius }
// Colors: BRIGHT. Mostly cyan/blue. Back layers slightly darker.
const UPPER_LAYERS = [
  { yOff: -3.5, color: '#0538a0', radius: 1.05 },
  { yOff: -2.8, color: '#0648b8', radius: 1.05 },
  { yOff: -2.1, color: '#0858cc', radius: 1.0 },
  { yOff: -1.4, color: '#0a68dd', radius: 1.0 },
  { yOff: -0.7, color: '#0c80ee', radius: 0.95 },
  { yOff:  0.0, color: '#0e98f8', radius: 0.95 },
  { yOff:  0.7, color: '#10b0ff', radius: 0.90 },
  { yOff:  1.4, color: '#20c8ff', radius: 0.90 },
  { yOff:  2.1, color: '#40dcff', radius: 0.85 },
  { yOff:  2.8, color: '#60eeff', radius: 0.85 },
];

const LOWER_LAYERS = [
  { yOff: -2.4, color: '#0540a0', radius: 1.1 },
  { yOff: -1.7, color: '#0758c0', radius: 1.05 },
  { yOff: -1.0, color: '#0970dd', radius: 1.0 },
  { yOff: -0.3, color: '#0c88ee', radius: 0.95 },
  { yOff:  0.4, color: '#10a0f8', radius: 0.95 },
  { yOff:  1.1, color: '#20b8ff', radius: 0.90 },
  { yOff:  1.8, color: '#40d4ff', radius: 0.85 },
  { yOff:  2.5, color: '#60eaff', radius: 0.85 },
];

function RibbonCluster({
  spine,
  layers,
}: {
  spine: THREE.Vector3[];
  layers: typeof UPPER_LAYERS;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const tubes = useMemo(() =>
    layers.map(({ yOff, color, radius }) => {
      const pts = spine.map(p => new THREE.Vector3(p.x, p.y + yOff, p.z));
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
      const geo = new THREE.TubeGeometry(curve, 300, radius, 64, false);
      return { geo, color };
    }),
  [spine, layers]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.12) * 0.3;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, mouse.x * 0.04, 0.03,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, -mouse.y * 0.03, 0.03,
    );
  });

  return (
    <group ref={groupRef}>
      {tubes.map(({ geo, color }, i) => (
        <mesh key={i} geometry={geo}>
          <meshPhysicalMaterial
            color={color}
            roughness={0.3}
            metalness={0.08}
            clearcoat={0.8}
            clearcoatRoughness={0.12}
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
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -mouse.y * 0.012, 0.025);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, mouse.x * 0.018, 0.025);
  });
  return <group ref={ref}>{children}</group>;
}

// ─────────────────────────────────────────────────────────
//  Scene
// ─────────────────────────────────────────────────────────
function Scene() {
  return (
    <CameraRig>
      {/* Hemisphere: dark navy sky, bright cyan ground */}
      <hemisphereLight args={['#001030', '#0088cc', 0.9]} />

      {/* Cyan key — washes highlights from top-left */}
      <directionalLight position={[-8, 12, 8]} intensity={3.5} color="#00eeff" />

      {/* Blue fill from bottom-right */}
      <directionalLight position={[10, -6, 4]} intensity={1.5} color="#0044ff" />

      {/* Soft front fill */}
      <directionalLight position={[0, 0, 14]} intensity={0.9} color="#80d0ff" />

      {/* ── Upper-left ribbon cluster ── */}
      <RibbonCluster spine={UPPER_SPINE} layers={UPPER_LAYERS} />

      {/* ── Lower-right ribbon cluster ── */}
      <RibbonCluster spine={LOWER_SPINE} layers={LOWER_LAYERS} />

      {/* ── Right orb — large, cyan→gold ── */}
      <GradientOrb
        position={[13, 1, -5]}
        radius={4.0}
        uniforms={RIGHT_UNIFORMS}
        phase={0}
        speed={0.14}
        baseX={13}
      />

      {/* ── Left orb — smaller, bottom-left ── */}
      <GradientOrb
        position={[-10, -6, 1]}
        radius={2.2}
        uniforms={LEFT_UNIFORMS}
        phase={1.5}
        speed={0.2}
        baseX={-10}
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
        camera={{ position: [0, 0, 22], fov: 52 }}
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