'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * AntiGravityBackground
 * ---------------------
 * Full-viewport fixed 3D background using vanilla Three.js in useEffect.
 *
 * Uses the user-provided proven technique:
 *  - SINGLE TubeGeometry along a wavy CatmullRomCurve3
 *  - Striped canvas texture painted on the tube to create the
 *    illusion of multiple stacked ribbon layers/strands
 *  - Three glossy spheres with MeshPhysicalMaterial + procedural envMap
 *  - Mouse-move parallax tilt + idle auto-rotation
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
      grad.addColorStop(0.0, '#eaffff');
      grad.addColorStop(0.18, '#8fe9ff');
      grad.addColorStop(0.4, '#1fb6e0');
      grad.addColorStop(0.62, '#0b4f7a');
      grad.addColorStop(0.85, '#031224');
      grad.addColorStop(1.0, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, c.width, c.height);

      // Warm glint (soft yellow highlight on the big sphere)
      const glint = ctx.createRadialGradient(360, 60, 5, 360, 60, 90);
      glint.addColorStop(0, 'rgba(255,244,214,0.95)');
      glint.addColorStop(1, 'rgba(255,244,214,0)');
      ctx.fillStyle = glint;
      ctx.fillRect(0, 0, c.width, c.height);

      // Secondary cool glint
      const glint2 = ctx.createRadialGradient(120, 190, 5, 120, 190, 110);
      glint2.addColorStop(0, 'rgba(200,255,255,0.6)');
      glint2.addColorStop(1, 'rgba(200,255,255,0)');
      ctx.fillStyle = glint2;
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
        '#062a45',
        '#0c5f8f',
        '#12a0c9',
        '#5fe3e8',
        '#0c5f8f',
        '#083a5c',
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
    const curvePoints = [
      new THREE.Vector3(-11, 0.8, -1.2),
      new THREE.Vector3(-8.5, -2.2, 1.4),
      new THREE.Vector3(-6, 2.1, -1.6),
      new THREE.Vector3(-3.3, -1.6, 1.8),
      new THREE.Vector3(-0.8, 1.3, -1.4),
      new THREE.Vector3(1.6, -2.0, 1.6),
      new THREE.Vector3(4.2, 1.9, -1.8),
      new THREE.Vector3(6.8, -1.3, 1.3),
      new THREE.Vector3(9.2, 1.1, -1.0),
      new THREE.Vector3(11.5, -1.8, 1.1),
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.55);
    const tubeGeo = new THREE.TubeGeometry(curve, 400, 0.95, 24, false);

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
    ribbon.position.set(0, 0.3, 0);
    group.add(ribbon);

    // ── Glossy spheres ──
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

    const sphereBig = makeSphere(2.3, 0x1c6f96, 11.5, 0.8, -2);
    const sphereSmall1 = makeSphere(1.15, 0x1c8fae, -10, -4.5, 1.5);
    const sphereSmall2 = makeSphere(0.7, 0x1c8fae, -8.5, -6, 2);
    group.add(sphereBig, sphereSmall1, sphereSmall2);

    // ── Lights ──
    const ambient = new THREE.AmbientLight(0x224466, 0.7);
    const keyLight = new THREE.PointLight(0x6fd6ff, 3, 60);
    keyLight.position.set(6, 6, 10);
    const fillLight = new THREE.PointLight(0xffffff, 1.4, 60);
    fillLight.position.set(-8, -3, 8);
    const rimLight = new THREE.DirectionalLight(0x2a6f99, 0.6);
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
      parallaxTarget.y = nx * 0.28;
      parallaxTarget.x = ny * 0.14;
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
      // Initial tilt (-0.35 rad X) shows the textured face of the ribbon
      // instead of the round tube side. Subtle sway keeps it alive.
      group.rotation.x = -0.35 + parallaxCurrent.x + Math.sin(elapsed * 0.4) * 0.015;
      group.rotation.y = parallaxCurrent.y + Math.sin(elapsed * 0.3) * 0.02;
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