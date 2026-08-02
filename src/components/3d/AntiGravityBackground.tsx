'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────
//  Shared mouse NDC
// ─────────────────────────────────────────────────────────
const mouse = { x: 0, y: 0 };

// ─────────────────────────────────────────────────────────
//  ORBS — custom GLSL gradient shader.
//  Colors blend based on the surface normal direction so
//  the gradient is smooth, continuous, and light-independent.
//  NO point light dots; the gradient is baked into the shader.
// ─────────────────────────────────────────────────────────
const ORB_VERT = /* glsl */`
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ORB_FRAG = /* glsl */`
  uniform vec3 uColorA;   // warm / gold side
  uniform vec3 uColorB;   // cool / cyan side
  uniform vec3 uLightDir; // direction that maps to colorB
  varying vec3 vNormal;

  void main() {
    vec3  n = normalize(vNormal);
    float t = dot(n, normalize(uLightDir)) * 0.5 + 0.5; // 0 = shadow, 1 = highlight
    t = smoothstep(0.0, 1.0, t);

    vec3 col = mix(uColorA, uColorB, t);

    // Soft Fresnel rim — brightens the edge for depth
    float rim = 1.0 - abs(dot(n, vec3(0.0, 0.0, 1.0)));
    col += uColorB * pow(rim, 3.0) * 0.4;

    // Specular pop — small hard highlight
    float spec = pow(max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0), 18.0) * 0.35;
    col += vec3(spec);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ─── Right orb uniforms (cyan → gold) ───
const RIGHT_UNIFORMS = {
  uColorA:   { value: new THREE.Color('#ffd700') },  // gold side
  uColorB:   { value: new THREE.Color('#00e8ff') },  // cyan highlight
  uLightDir: { value: new THREE.Vector3(-0.7, 0.7, 0.5) },
};

// ─── Left orb uniforms (cyan → teal → soft warm) ───
const LEFT_UNIFORMS = {
  uColorA:   { value: new THREE.Color('#0050aa') },  // deeper blue shadow
  uColorB:   { value: new THREE.Color('#00d8ff') },  // cyan highlight
  uLightDir: { value: new THREE.Vector3(-0.5, 0.6, 0.6) },
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
  const baseY   = position[1];

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader:   ORB_VERT,
        fragmentShader: ORB_FRAG,
        uniforms:       uniforms,
      }),
    [uniforms],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = baseY + Math.sin(t * speed + phase) * 0.5;
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      baseX + mouse.x * 0.4,
      0.022,
    );
  });

  return (
    <mesh ref={meshRef} position={position} material={material}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────
//  FLUID RIBBON — volumetric round TubeGeometry stack
//  Strategy: 8 thick round tubes follow the SAME S-curve but
//  each at a slightly different Y offset, creating stacked
//  concentric rings at every bend — the "layered silk" look.
//  Round cross-section (not flat strips) = fluid / silicone.
// ─────────────────────────────────────────────────────────
const TUBE_RADIUS = 0.55;   // radius of each individual tube
const TUBE_SEGS   = 320;    // path resolution  (smoothness)
const RADIAL_SEGS = 30;     // cross-section resolution

// Colour ramp from dark-navy (bottom) → bright-cyan (top)
const LAYERS: { yOff: number; color: string; rough: number }[] = [
  { yOff: -2.10, color: '#010820', rough: 0.58 },
  { yOff: -1.60, color: '#021540', rough: 0.56 },
  { yOff: -1.10, color: '#032870', rough: 0.54 },
  { yOff: -0.60, color: '#0540a0', rough: 0.52 },
  { yOff: -0.10, color: '#0a60cc', rough: 0.50 },
  { yOff:  0.40, color: '#1282e8', rough: 0.48 },
  { yOff:  0.90, color: '#00b8ff', rough: 0.46 },
  { yOff:  1.40, color: '#00e8ff', rough: 0.43 },
];

// ── Spine of the ribbon — sweeping S-curve left→right ──
const SPINE: THREE.Vector3[] = [
  new THREE.Vector3(-19,  7,  0),
  new THREE.Vector3(-14,  3,  1),
  new THREE.Vector3( -9, -1,  2),
  new THREE.Vector3( -4, -4,  1),
  new THREE.Vector3(  0, -2,  0),
  new THREE.Vector3(  4,  2, -1),
  new THREE.Vector3(  8, -1,  1),
  new THREE.Vector3( 12, -4,  0),
  new THREE.Vector3( 16, -5, -1),
  new THREE.Vector3( 20, -4, -2),
];

function FluidRibbon() {
  const groupRef = useRef<THREE.Group>(null);

  // Build all geometries once on mount
  const tubes = useMemo(() =>
    LAYERS.map(({ yOff, color, rough }) => {
      // Shift every control point by yOff on the Y axis
      const pts   = SPINE.map(p => new THREE.Vector3(p.x, p.y + yOff, p.z));
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
      const geo   = new THREE.TubeGeometry(curve, TUBE_SEGS, TUBE_RADIUS, RADIAL_SEGS, false);
      return { geo, color, rough };
    }),
  []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Gentle vertical float
    groupRef.current.position.y = Math.sin(t * 0.14) * 0.3;
    // Soft mouse lean
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, mouse.x * 0.035, 0.04,
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z, mouse.y * 0.035, 0.04,
    );
  });

  return (
    <group ref={groupRef}>
      {tubes.map(({ geo, color, rough }, i) => (
        <mesh key={i} geometry={geo}>
          {/* MeshPhysicalMaterial: smooth, silicone/silk appearance.
              clearcoat=1 adds a subtle gloss layer on top of the
              matte base, closely matching the reference image. */}
          <meshPhysicalMaterial
            color={color}
            roughness={rough}
            metalness={0.08}
            clearcoat={1.0}
            clearcoatRoughness={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────
//  Camera rig — scene sways gently with mouse
// ─────────────────────────────────────────────────────────
function CameraRig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -mouse.y * 0.020, 0.03);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y,  mouse.x * 0.028, 0.03);
  });
  return <group ref={ref}>{children}</group>;
}

// ─────────────────────────────────────────────────────────
//  Scene — ribbon + orbs + SOFT lighting only
// ─────────────────────────────────────────────────────────
function Scene() {
  return (
    <CameraRig>
      {/* ── Soft ambient — sets the shadow-side base tone ── */}
      <ambientLight intensity={0.25} color="#0a1a40" />

      {/* ── Key light: large soft cyan from upper-left.
           Large radius + low decay = smooth wrap, no harsh dots ── */}
      <pointLight
        position={[-14, 12, 10]}
        intensity={120}
        color="#40d8ff"
        distance={65}
        decay={1.8}
      />

      {/* ── Fill: deep-blue from the right to keep shadow areas colorful ── */}
      <pointLight
        position={[14, -6, 8]}
        intensity={60}
        color="#0030aa"
        distance={55}
        decay={1.8}
      />

      {/* ── Under-bounce: warm teal from below ribbon ── */}
      <pointLight
        position={[0, -14, 6]}
        intensity={35}
        color="#00668a"
        distance={45}
        decay={2.0}
      />

      {/* ── Fluid ribbon ── */}
      <FluidRibbon />

      {/* ── Right orb — large, mid-right edge, cyan→gold gradient ── */}
      <GradientOrb
        position={[11, 1.5, -4]}
        radius={3.5}
        uniforms={RIGHT_UNIFORMS}
        phase={0}
        speed={0.18}
        baseX={11}
      />

      {/* ── Left orb — smaller, bottom-left, blurry/foreground feel ──
           Positioned close in Z so it's "in front" of the ribbon.
           The shader's Fresnel + rim light fakes the soft blur. ── */}
      <GradientOrb
        position={[-9.5, -5, 0.5]}
        radius={2.4}
        uniforms={LEFT_UNIFORMS}
        phase={1.6}
        speed={0.23}
        baseX={-9.5}
      />
    </CameraRig>
  );
}

// ─────────────────────────────────────────────────────────
//  Export — fixed full-viewport canvas, transparent
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
        // Camera pulled back so the ribbon fills the background elegantly
        camera={{ position: [0, 0, 18], fov: 58 }}
        gl={{
          antialias:             true,
          alpha:                 true,
          powerPreference:       'high-performance',
          // LinearToneMapping preserves the ribbon's true colours
          // without the warm/yellow shift that ACES introduces
          toneMapping:           THREE.LinearToneMapping,
          toneMappingExposure:   1.0,
        }}
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
