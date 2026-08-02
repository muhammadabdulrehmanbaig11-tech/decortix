'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import GlassCard from '@/components/ui/GlassCard';

const AntiGravityBackground = dynamic(
  () => import('@/components/3d/AntiGravityBackground'),
  { ssr: false }
);

// ── Animation variants ──────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } } };

// ── Stats ───────────────────────────────────────────────
const stats = [
  { value: '50+',  label: 'Projects Delivered'  },
  { value: '12+',  label: 'Industries Served'   },
  { value: '100%', label: 'Client Satisfaction'  },
  { value: '24/7', label: 'Support Provided'    },
];

// ── Feature cards ───────────────────────────────────────
const features = [
  { icon: '⚡', title: 'Lightning Fast',  desc: 'Optimized, production-ready code that loads in milliseconds and scores 95+ on Core Web Vitals.'   },
  { icon: '🎨', title: 'Premium Design',  desc: 'Pixel-perfect UIs crafted with modern design systems — your brand deserves to stand out.'           },
  { icon: '📈', title: 'Built to Scale',  desc: 'From MVP to millions of users. Architectures that grow seamlessly with your business.'              },
];

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'transparent', position: 'relative', zIndex: 10 }}>

      {/* ── Fixed 3D ribbon background ── */}
      <AntiGravityBackground />

      <Navbar />

      {/* ════════════════════ HERO ════════════════════ */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 24px 80px',
          position: 'relative',
          overflow: 'hidden',
          background: 'transparent',
        }}
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{ maxWidth: 900, width: '100%', textAlign: 'center', zIndex: 1, position: 'relative' }}
        >
          {/* ── Bebas Neue headline — PURE WHITE, no gradients ── */}
          <motion.h1
            variants={fadeUp}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(56px, 10.5vw, 124px)',
              fontWeight: 400,
              lineHeight: 0.94,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#ffffff',
              textShadow:
                '0 2px 4px rgba(0,0,0,0.8), 0 0 60px rgba(0,120,200,0.15)',
              marginBottom: 28,
            }}
          >
            WE BUILD EXCEPTIONAL
            <br />
            WEBSITES &amp; APPS
          </motion.h1>

          {/* ── Subtitle ── */}
          <motion.p
            variants={fadeUp}
            style={{
              fontSize: 'clamp(15px, 1.8vw, 19px)',
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.75,
              maxWidth: 560,
              margin: '0 auto 48px',
              fontWeight: 300,
            }}
          >
            Decortix turns bold ideas into premium digital products.
            From pixel-perfect websites to powerful mobile apps —&nbsp;
            we deliver experiences that convert.
          </motion.p>

          {/* ── Pill CTAs ── */}
          <motion.div
            variants={fadeUp}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {/* Primary — white fill */}
            <Link href="/services" style={{ textDecoration: 'none' }}>
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Explore Services
              </motion.button>
            </Link>

            {/* Secondary — glass border */}
            <Link href="/contact" style={{ textDecoration: 'none' }}>
              <motion.button
                className="btn-ghost"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Get in Touch
              </motion.button>
            </Link>
          </motion.div>

          {/* ── Scroll indicator ── */}
          <motion.div
            variants={fadeUp}
            style={{ marginTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.35 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              style={{ width: 1, height: 44, background: 'linear-gradient(180deg, rgba(255,255,255,0.7), transparent)' }}
            />
            <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════ STATS ════════════════════ */}
      <section className="page-content" style={{ padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="gradient-divider" style={{ marginBottom: -1 }} />
          <GlassCard style={{ padding: '40px 24px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 32, textAlign: 'center',
            }}>
              {stats.map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="gradient-text-cyan" style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.02em' }}>
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

      {/* ════════════════════ FEATURES ════════════════════ */}
      <section className="page-content" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <p style={{ color: '#00a8e8', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
              Why Decortix
            </p>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(40px, 5vw, 68px)',
              fontWeight: 400, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1,
            }}>
              Crafted for{' '}
              <span className="gradient-text-cyan">Excellence</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {features.map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <GlassCard style={{ padding: '36px 32px', height: '100%' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'rgba(0,168,232,0.1)',
                    border: '1px solid rgba(0,168,232,0.2)',
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

      {/* ════════════════════ BOTTOM CTA ════════════════════ */}
      <section className="page-content" style={{ padding: '60px 24px 120px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <GlassCard style={{ padding: '64px 48px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,168,232,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }} viewport={{ once: true }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(36px, 4.5vw, 56px)',
                fontWeight: 400, letterSpacing: '0.04em', textTransform: 'uppercase',
                marginBottom: 16, lineHeight: 1,
              }}>
                Ready to Build Something{' '}
                <span className="gradient-text-cyan">Remarkable?</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>
                Let&apos;s discuss your project and create a digital experience your users will love.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/contact" style={{ textDecoration: 'none' }}>
                  <motion.button className="btn-primary" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    Start Your Project
                  </motion.button>
                </Link>
                <Link href="/services" style={{ textDecoration: 'none' }}>
                  <motion.button className="btn-ghost" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    View Services
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="page-content"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '32px 24px', textAlign: 'center',
          color: 'rgba(255,255,255,0.28)', fontSize: 13,
        }}
      >
        © {new Date().getFullYear()} Decortix. All rights reserved.
      </footer>
    </main>
  );
}
