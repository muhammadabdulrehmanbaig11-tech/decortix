'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';

const AntiGravityBackground = dynamic(
  () => import('@/components/3d/AntiGravityBackground'),
  { ssr: false }
);

// Stagger animation helpers
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

// ── Stats ──
const stats = [
  { value: '50+',  label: 'Projects Delivered' },
  { value: '12+',  label: 'Industries Served'  },
  { value: '100%', label: 'Client Satisfaction' },
  { value: '24/7', label: 'Support Provided'   },
];

// ── Feature cards ──
const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    desc: 'Optimized, production-ready code that loads in milliseconds and scores 95+ on Core Web Vitals.',
  },
  {
    icon: '🎨',
    title: 'Premium Design',
    desc: 'Pixel-perfect UIs crafted with modern design systems — your brand deserves to stand out.',
  },
  {
    icon: '📈',
    title: 'Built to Scale',
    desc: 'From MVP to millions of users. Architectures that grow seamlessly with your business.',
  },
];

export default function HomePage() {
  return (
    // NOTE: NO background on main — the fixed Canvas at z-0 shows through
    <main style={{ minHeight: '100vh', background: 'transparent', position: 'relative', zIndex: 10 }}>
      {/* Fixed 3D Background */}
      <AntiGravityBackground />

      <Navbar />

      {/* ─────────────── HERO ─────────────── */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 24px 80px',
          position: 'relative',
          overflow: 'hidden',
          // Transparent — 3D canvas shows through from behind
          background: 'transparent',
        }}
      >
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '8%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{ maxWidth: 820, textAlign: 'center', zIndex: 1 }}
        >
          {/* Badge */}
          <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 100,
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
              fontSize: 13, fontWeight: 500,
              color: '#93c5fd', letterSpacing: '0.02em',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
              Premium Software Studio
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            style={{
              fontSize: 'clamp(42px, 7vw, 88px)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: 28,
            }}
          >
            We Build{' '}
            <span className="gradient-text">Exceptional</span>
            <br />
            Websites &amp; Apps
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.7,
              maxWidth: 580,
              margin: '0 auto 48px',
            }}
          >
            Decortix turns bold ideas into premium digital products.
            From pixel-perfect websites to powerful mobile apps — we deliver experiences that convert.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/services" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg">
                Explore Services →
              </Button>
            </Link>
            <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="lg">
                Get in Touch
              </Button>
            </Link>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            variants={fadeUp}
            style={{ marginTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.4 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              style={{ width: 1, height: 48, background: 'linear-gradient(180deg, rgba(255,255,255,0.6), transparent)' }}
            />
            <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Scroll</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ─────────────── STATS ─────────────── */}
      <section
        className="page-content"
        style={{ padding: '0 24px', position: 'relative', zIndex: 10 }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="gradient-divider" style={{ marginBottom: -1 }} />
          <GlassCard style={{ padding: '40px 24px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 32,
              textAlign: 'center',
            }}>
              {stats.map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="gradient-text-blue" style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.02em' }}>
                    {value}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 6 }}>{label}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
          <div className="gradient-divider" style={{ marginTop: -1 }} />
        </div>
      </section>

      {/* ─────────────── FEATURES ─────────────── */}
      <section
        className="page-content"
        style={{ padding: '100px 24px', position: 'relative', zIndex: 10 }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <p style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Why Decortix
            </p>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Crafted for{' '}
              <span className="gradient-text">Excellence</span>
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}>
            {features.map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <GlassCard glow style={{ padding: '36px 32px', height: '100%' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, marginBottom: 20,
                  }}>
                    {icon}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontSize: 15 }}>{desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── BOTTOM CTA ─────────────── */}
      <section
        className="page-content"
        style={{ padding: '80px 24px 120px', position: 'relative', zIndex: 10 }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <GlassCard glow style={{ padding: '64px 48px', position: 'relative', overflow: 'hidden' }}>
            {/* Background gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
                Ready to build something{' '}
                <span className="gradient-text">remarkable?</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>
                Let's discuss your project and create a digital experience your users will love.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/contact" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg">Start Your Project</Button>
                </Link>
                <Link href="/services" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="lg">View Services</Button>
                </Link>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="page-content"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '32px 24px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: 14,
          zIndex: 10,
          position: 'relative',
        }}
      >
        © {new Date().getFullYear()} Decortix. All rights reserved.
      </footer>
    </main>
  );
}
