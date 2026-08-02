'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────
//  Shared mouse NDC
// ─────────────────────────────────────────────────────────
const mouse = { x: 0, y: 0 };

// ─────────────────────────────────────────────────────────
//  ORBS — Custom GLSL normal-based gradient shader
//  Paints smooth colour transitions directly on the sphere
//  surface based on the face normal direction. Zero point
//  light dots, zero specular artifacts.
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

    // Fresnel rim glow
    float rim = 1.0 - max(dot(n, vViewDir), 0.0);
    col += uColorB * pow(rim, 3.0) * 0.55;

    // Soft specular highlight
    vec3 h = normalize(vViewDir + normalize(uLightDir));
    float spec = pow(max(dot(n, h), 0.0), 32.0) * 0.45;
    col += vec3(spec);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Right orb: cyan highlight → gold shadow
const RIGHT_UNIFORMS = {
  uColorA: { value: new THREE.Color('#ffd700') },
  uColorB: { value: new THREE.Color('#00e8ff') },
  uLightDir: { value: new THREE.Vector3(-0.6, 0.6, 0.5) },
};

// Left orb: deep blue → bright cyan
const LEFT_UNIFORMS = {
  uColorA: { value: new THREE.Color('#0040aa') },
  uColorB: { value: new THREE.Color('#00e0ff') },
  uLightDir: { value: new THREE.Vector3(-0.5, 0.7, 0.5) },
};

function GradientOrb({
  position,
  radius,
  uniforms,
  phase,
  speed,
  baseX,
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
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ORB_VERT,
        fragmentShader: ORB_FRAG,
        uniforms,
      }),
    [uniforms],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = baseY + Math.sin(t * speed + phase) * 0.45;
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      baseX + mouse.x * 0.35,
      0.02,
    );
  });

  return (
    <mesh ref={meshRef} position={position} material={material}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────
//  RIBBON BUILDER — parametric twisted multi-layer stack
//
//  Each "ribbon cluster" is a group of thin flat layers
//  following a CatmullRomCurve3 3D path, stacked with small
//  offsets along the curve's binormal. The twist rotates
//  the ribbon's width around the tangent, so at bends the
//  layers fan out and create the "folded satin" look.
//
//  Two clusters: upper-left and lower-right.
// ─────────────────────────────────────────────────────────
const LEN_SEGS = 300;
const WID_SEGS = 6;

interface RibbonClusterConfig {
  points: THREE.Vector3[];
  halfWidth: number;
  layerCount: number;
  layerGap: number;
  colors: string[];
  twist: number;       // total twist radians over the path
  twistOffset: number; // starting twist angle
}

function buildLayer(
  curve: THREE.CatmullRomCurve3,
  layerIdx: number,
  config: RibbonClusterConfig,
): THREE.BufferGeometry {
  const { halfWidth, layerCount, layerGap, twist, twistOffset } = config;
  const offset = (layerIdx - (layerCount - 1) / 2) * layerGap;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Pre-compute Frenet frames
  const frames = curve.computeFrenetFrames(LEN_SEGS, false);

  for (let i = 0; i <= LEN_SEGS; i++) {
    const u = i / LEN_SEGS;
    const pt = curve.getPointAt(u);
    const N = frames.normals[i];
    const B = frames.binormals[i];

    // Apply twist rotation around the tangent
    const twistAngle = twistOffset + u * twist;
    const cosT = Math.cos(twistAngle);
    const sinT = Math.sin(twistAngle);

    // Rotated normal and binormal
    const rN = new THREE.Vector3(
      N.x * cosT + B.x * sinT,
      N.y * cosT + B.y * sinT,
      N.z * cosT + B.z * sinT,
    );
    const rB = new THREE.Vector3(
      -N.x * sinT + B.x * cosT,
      -N.y * sinT + B.y * cosT,
      -N.z * sinT + B.z * cosT,
    );

    for (let j = 0; j <= WID_SEGS; j++) {
      const v = (j / WID_SEGS) * 2 - 1; // -1 to +1

      // Position = point on curve + width along rotated normal + layer offset along rotated binormal
      const x = pt.x + v * halfWidth * rN.x + offset * rB.x;
      const y = pt.y + v * halfWidth * rN.y + offset * rB.y;
      const z = pt.z + v * halfWidth * rN.z + offset * rB.z;

      positions.push(x, y, z);
      uvs.push(u, (v + 1) / 2);
    }
  }

  const W = WID_SEGS + 1;
  for (let i = 0; i < LEN_SEGS; i++) {
    for (let j = 0; j < WID_SEGS; j++) {
      const a = i * W + j;
      const b = a + 1;
      const c = (i + 1) * W + j;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setIndex(indices);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

// ── Upper-left ribbon cluster config ──
const UPPER_CONFIG: RibbonClusterConfig = {
  points: [
    new THREE.Vector3(-18, 8, -2),
    new THREE.Vector3(-13, 4, 4),
    new THREE.Vector3(-8, 0, 5),
    new THREE.Vector3(-4, -3, 2),
    new THREE.Vector3(0, -1, -1),
    new THREE.Vector3(4, 3, -3),
    new THREE.Vector3(7, 1, 0),
    new THREE.Vector3(10, -2, 3),
    new THREE.Vector3(13, -4, 1),
  ],
  halfWidth: 2.0,
  layerCount: 14,
  layerGap: 0.38,
  colors: [
    '#010820', '#021038', '#021855', '#032470',
    '#043090', '#0540a8', '#0750c0', '#0960d5',
    '#1078e8', '#1890f0', '#20a8f8', '#30c0ff',
    '#50d8ff', '#70eeff',
  ],
  twist: Math.PI * 2.2,
  twistOffset: 0,
};

// ── Lower-right ribbon cluster config ──
const LOWER_CONFIG: RibbonClusterConfig = {
  points: [
    new THREE.Vector3(4, 2, -3),
    new THREE.Vector3(8, -1, 0),
    new THREE.Vector3(12, -5, 3),
    new THREE.Vector3(15, -8, 5),
    new THREE.Vector3(18, -6, 2),
    new THREE.Vector3(22, -8, -1),
  ],
  halfWidth: 2.2,
  layerCount: 12,
  layerGap: 0.36,
  colors: [
    '#010820', '#021540', '#032060', '#043088',
    '#0540a8', '#0755c5', '#0968dd', '#1080f0',
    '#1898f8', '#30b8ff', '#50d4ff', '#70eeff',
  ],
  twist: Math.PI * 1.8,
  twistOffset: Math.PI * 0.3,
};

function RibbonCluster({ config }: { config: RibbonClusterConfig }) {
  const groupRef = useRef<THREE.Group>(null);

  const layers = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(config.points, false, 'catmullrom', 0.45);
    return config.colors.map((color, i) => ({
      geo: buildLayer(curve, i, config),
      color,
    }));
  }, [config]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.12) * 0.3;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.x * 0.04,
      0.03,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -mouse.y * 0.04,
      0.03,
    );
  });

  return (
    <group ref={groupRef}>
      {layers.map(({ geo, color }, i) => (
        <mesh key={i} geometry={geo}>
          <meshPhysicalMaterial
            color={color}
            emissive="#001133"
            emissiveIntensity={0.2}
            roughness={0.35}
            metalness={0.08}
            clearcoat={0.7}
            clearcoatRoughness={0.15}
            flatShading={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────
//  Camera rig — subtle mouse parallax
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
//  Scene — two ribbon clusters + two gradient orbs + lighting
// ─────────────────────────────────────────────────────────
function Scene() {
  return (
    <CameraRig>
      {/* Hemisphere: deep navy sky → bright cyan ground.
          Gives the entire scene a smooth ambient colour wash. */}
      <hemisphereLight args={['#001030', '#0088cc', 0.8]} />

      {/* Cyan key from top-left — washes the ribbon highlights */}
      <directionalLight position={[-8, 12, 6]} intensity={3.0} color="#00eeff" />

      {/* Blue fill from bottom-right — colours the shadow side */}
      <directionalLight position={[10, -6, 4]} intensity={1.8} color="#0044ff" />

      {/* Soft front fill — keeps geometry readable */}
      <directionalLight position={[0, 0, 12]} intensity={0.8} color="#80d0ff" />

      {/* ── UPPER-LEFT RIBBON CLUSTER ── */}
      <RibbonCluster config={UPPER_CONFIG} />

      {/* ── LOWER-RIGHT RIBBON CLUSTER ── */}
      <RibbonCluster config={LOWER_CONFIG} />

      {/* ── RIGHT ORB — large, mid-right, cyan → gold ── */}
      <GradientOrb
        position={[13, 1, -5]}
        radius={4.0}
        uniforms={RIGHT_UNIFORMS}
        phase={0}
        speed={0.14}
        baseX={13}
      />

      {/* ── LEFT ORB — smaller, bottom-left, blue → cyan ── */}
      <GradientOrb
        position={[-10, -6, 1]}
        radius={2.2}
        uniforms={LEFT_UNIFORMS}
        phase={1.5}
        speed={0.2}
        baseX={-10}
      />

      {/* ── SMALL CYAN ACCENT ORB — far right mid ── */}
      <GradientOrb
        position={[16, -2, -8]}
        radius={1.4}
        uniforms={LEFT_UNIFORMS}
        phase={2.8}
        speed={0.18}
        baseX={16}
      />
    </CameraRig>
  );
}

// ─────────────────────────────────────────────────────────
//  Export — fixed full-viewport canvas, transparent bg
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