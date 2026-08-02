'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * AntiGravityBackground
 * ---------------------
 * Full-viewport fixed 3D background using vanilla Three.js in useEffect.
 *
 * ALIGNMENT NOTE:
 * The curve points and sphere positions below are not arbitrary — they were
 * derived by reading pixel coordinates directly off the reference image
 * (899x508) and converting them into this scene's world space using the
 * camera's actual fov/distance:
 *   worldX = (px / 899) * 21.94 - 10.97
 *   worldY = 6.2 - (py / 508) * 12.4
 * (visible half-height = tan(fov/2) * camZ = tan(22.5deg) * 15 ≈ 6.2,
 *  visible half-width = half-height * aspect(899/508) ≈ 10.97)
 * That's why there's no extra static rotation.x tilt anymore — the previous
 * -0.35 rad tilt was rotating the whole group away from the mapping above,
 * which is what threw the alignment off.
 */
export default function AntiGravityBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer / Scene / Camera ──
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Group everything for unified rotation ──
    const group = new THREE.Group();
    scene.add(group);

    // ── Procedural equirectangular env map (fake reflections) ──
    function buildEnvTexture(): THREE.CanvasTexture {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d')!;

      const grad = ctx.createLinearGradient(0, 0, 0, c.height);
      grad.addColorStop(0.0, '#e0ffff');
      grad.addColorStop(0.12, '#00d8ff');
      grad.addColorStop(0.3, '#1eb1db');
      grad.addColorStop(0.5, '#0b4f7a');
      grad.addColorStop(0.75, '#03264d');
      grad.addColorStop(1.0, '#010712');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, c.width, c.height);

      // Warm champagne/gold glint — right sphere rim light (#d4c496 → #e8ddb5)
      const glint = ctx.createRadialGradient(380, 55, 5, 380, 55, 100);
      glint.addColorStop(0, 'rgba(232,221,181,0.9)');
      glint.addColorStop(0.4, 'rgba(212,196,150,0.5)');
      glint.addColorStop(1, 'rgba(212,196,150,0)');
      ctx.fillStyle = glint;
      ctx.fillRect(0, 0, c.width, c.height);

      // Cyan specular glint — top-left sphere highlight
      const glint2 = ctx.createRadialGradient(100, 40, 5, 100, 40, 80);
      glint2.addColorStop(0, 'rgba(0,216,255,0.85)');
      glint2.addColorStop(0.5, 'rgba(0,216,255,0.3)');
      glint2.addColorStop(1, 'rgba(0,216,255,0)');
      ctx.fillStyle = glint2;
      ctx.fillRect(0, 0, c.width, c.height);

      // Sea-green bounce on bottom — left orb underside (#4a8282)
      const glint3 = ctx.createRadialGradient(150, 220, 5, 150, 220, 90);
      glint3.addColorStop(0, 'rgba(74,130,130,0.6)');
      glint3.addColorStop(1, 'rgba(74,130,130,0)');
      ctx.fillStyle = glint3;
      ctx.fillRect(0, 0, c.width, c.height);

      const tex = new THREE.CanvasTexture(c);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.needsUpdate = true;
      return tex;
    }
    const envTex = buildEnvTexture();

    // ── Ribbon strand texture (striped bands = multi-layer illusion) ──
    function buildRibbonTexture(): THREE.CanvasTexture {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 512;
      const ctx = c.getContext('2d')!;

      const bands = 18;
      const bandH = c.height / bands;
      const palette = [
        '#021844',   // Deep shadow — indigo valley
        '#052b75',   // Shadow — dark navy valley
        '#0b53d1',   // Midtone — vibrant royal blue
        '#116af2',   // Midtone — bright cobalt
        '#00bfff',   // Highlight — brilliant cyan
        '#00e5ff',   // Highlight — saturated aqua
        '#c4fbff',   // Edge highlight — icy white-blue
        '#116af2',   // Midtone return
        '#052b75',   // Shadow return
        '#021844',   // Deep shadow return
      ];

      for (let i = 0; i < bands; i++) {
        const color = palette[i % palette.length];
        ctx.fillStyle = color;
        ctx.fillRect(0, i * bandH, c.width, bandH);
        // Thin highlight line = strand seam
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(0, i * bandH, c.width, 2);
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(10, 1);
      tex.needsUpdate = true;
      return tex;
    }
    const ribbonTex = buildRibbonTexture();

    // ── Ribbon geometry (wavy 3D curve → tube) ──
    // Each point below corresponds to a traced pixel position along the
    // ribbon's centerline in the reference image, converted to world space
    // (see note above). It enters top-left, weaves behind the headline,
    // and exits bottom-right — matching the reference's diagonal drift.
    const curvePoints = [
      new THREE.Vector3(-11.46, 2.78, -1.5),
      new THREE.Vector3(-8.77, 3.76, 1.3),
      new THREE.Vector3(-6.58, 0.59, -1.2),
      new THREE.Vector3(-4.14, 2.29, 1.4),
      new THREE.Vector3(-1.94, -0.15, -1.3),
      new THREE.Vector3(0.25, -1.61, 1.3),
      new THREE.Vector3(2.69, 0.1, -1.4),
      new THREE.Vector3(4.89, -2.34, 1.3),
      new THREE.Vector3(7.33, -1.12, -1.3),
      new THREE.Vector3(9.78, -4.05, 1.2),
      new THREE.Vector3(11.47, -5.03, -1.0),
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.55);
    const tubeGeo = new THREE.TubeGeometry(curve, 400, 1.3, 24, false);

    const ribbonMat = new THREE.MeshPhysicalMaterial({
      map: ribbonTex,
      color: 0xffffff,
      metalness: 0.35,
      roughness: 0.35,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      envMap: envTex,
      envMapIntensity: 1.1,
    });

    const ribbon = new THREE.Mesh(tubeGeo, ribbonMat);
    // No offset — the curve points already encode the correct on-screen position.
    ribbon.position.set(0, 0, 0);
    group.add(ribbon);

    // ── Glossy spheres ──
    // Positions/radii also mapped from the reference image's pixel coordinates:
    //   big sphere    ≈ (835,195) r≈65px  → top-right, clipped by the frame
    //   medium sphere ≈ (85,420)  r≈45px  → bottom-left
    //   small sphere  ≈ (35,465)  r≈30px  → bottom-left corner, lower/smaller
    function makeSphere(
      radius: number,
      color: number,
      x: number,
      y: number,
      z: number,
    ): THREE.Mesh {
      const geo = new THREE.SphereGeometry(radius, 64, 64);
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.3,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMap: envTex,
        envMapIntensity: 1.6,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      return mesh;
    }

    // Right orb: vibrant cyan/cerulean base (#1eb1db) — catches warm gold rim
    const sphereBig = makeSphere(1.9, 0x1eb1db, 9.4, 1.4, 0);
    // Left orbs: deep teal/navy base (#03264d) — catches cyan specular + sea-green bounce
    const sphereSmall1 = makeSphere(1.1, 0x03264d, -8.9, -4.05, 0);
    const sphereSmall2 = makeSphere(0.75, 0x03264d, -10.12, -5.15, 0);
    group.add(sphereBig, sphereSmall1, sphereSmall2);

    // ── Lights — cool-to-warm dual lighting ──
    const ambient = new THREE.AmbientLight(0x0b2040, 0.6);
    // Cyan key from upper-left — drives the cyan specular highlights
    const keyLight = new THREE.PointLight(0x00d8ff, 3.5, 60);
    keyLight.position.set(6, 7, 10);
    // Warm fill from lower-right — creates the champagne rim on right sphere
    const fillLight = new THREE.PointLight(0xe8ddb5, 1.0, 60);
    fillLight.position.set(-8, -3, 8);
    // Cool rim from behind — subtle depth separation
    const rimLight = new THREE.DirectionalLight(0x18527a, 0.5);
    rimLight.position.set(-5, 4, -6);
    scene.add(ambient, keyLight, fillLight, rimLight);

    // ── Interaction: mouse parallax + idle rotation ──
    const parallaxTarget = { x: 0, y: 0 };
    const parallaxCurrent = { x: 0, y: 0 };

    function onPointerMove(e: MouseEvent | TouchEvent) {
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const nx = (cx / window.innerWidth) * 2 - 1;
      const ny = (cy / window.innerHeight) * 2 - 1;
      // Small parallax range so it stays close to the mapped alignment.
      parallaxTarget.y = nx * 0.08;
      parallaxTarget.x = ny * 0.05;
    }

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove as EventListener, { passive: true });

    // ── Resize ──
    function handleResize() {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    // ── Animate ──
    let rafId: number;
    let elapsed = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      elapsed += 0.008;
      parallaxCurrent.x += (parallaxTarget.x - parallaxCurrent.x) * 0.05;
      parallaxCurrent.y += (parallaxTarget.y - parallaxCurrent.y) * 0.05;
      // Only a tiny sway now — no static tilt, so the base pose stays
      // aligned with the mapped reference positions.
      group.rotation.x = parallaxCurrent.x + Math.sin(elapsed * 0.4) * 0.01;
      group.rotation.y = parallaxCurrent.y + Math.sin(elapsed * 0.3) * 0.012;
      renderer.render(scene, camera);
    }
    animate();

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove as EventListener);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      tubeGeo.dispose();
      ribbonMat.dispose();
      ribbonTex.dispose();
      envTex.dispose();
      sphereBig.geometry.dispose();
      (sphereBig.material as THREE.Material).dispose();
      sphereSmall1.geometry.dispose();
      (sphereSmall1.material as THREE.Material).dispose();
      sphereSmall2.geometry.dispose();
      (sphereSmall2.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}