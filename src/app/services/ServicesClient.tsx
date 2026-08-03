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

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// ── Web features ──
const webFeatures = [
  'Next.js & React — server-rendered, blazing fast',
  'Tailwind CSS & custom design systems',
  'Framer Motion micro-animations',
  'SEO-optimized with Core Web Vitals 95+',
  'CMS integration (Sanity, Contentful, Strapi)',
  'E-commerce (Shopify, custom storefronts)',
  'Fully responsive — mobile, tablet, desktop',
  'Auth, payments & third-party API integrations',
];

// ── App features ──
const appFeatures = [
  'React Native for iOS & Android',
  'Flutter for cross-platform excellence',
  'Native Swift / Kotlin when performance demands',
  'Offline-first architecture',
  'Push notifications & real-time sync',
  'App Store & Play Store deployment',
  'Backend: Node.js, Supabase, Firebase',
  'CI/CD pipeline for continuous delivery',
];

// ── Tech stack ──
const webStack  = ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Framer Motion', 'Node.js', 'PostgreSQL', 'Vercel'];
const appStack  = ['React Native', 'Flutter', 'Expo', 'Swift', 'Kotlin', 'Firebase', 'Supabase', 'GraphQL'];

// ── Process ──
const process = [
  { step: '01', title: 'Discovery',   desc: 'Deep-dive into your goals, users, and competition to define a clear roadmap.' },
  { step: '02', title: 'Design',      desc: 'High-fidelity wireframes and prototypes — reviewed with you before a single line of code.' },
  { step: '03', title: 'Build',       desc: 'Agile sprints with weekly demos. You see real progress from day one.' },
  { step: '04', title: 'Launch',      desc: 'Deployment, QA, and a 30-day post-launch support window — on us.' },
];

// ── Pricing ──
const pricing = [
  {
    tier: 'Starter',
    price: '$2,500',
    period: 'one-time',
    desc: 'Perfect for landing pages, portfolios, and small business sites.',
    features: ['Up to 5 pages', 'Responsive design', 'SEO foundation', 'Contact form', '2 revision rounds'],
    accent: '#3b82f6',
    popular: false,
  },
  {
    tier: 'Growth',
    price: '$8,000',
    period: 'one-time',
    desc: 'Full-featured web apps and mobile apps for growing businesses.',
    features: ['Unlimited pages', 'Full-stack app', 'CMS integration', 'Auth & payments', 'Analytics dashboard', '4 revision rounds'],
    accent: '#6d28d9',
    popular: true,
  },
  {
    tier: 'Enterprise',
    price: 'Custom',
    period: 'tailored',
    desc: 'Bespoke solutions for complex requirements at scale.',
    features: ['Custom architecture', 'Dedicated team', 'SLA guarantee', 'Priority support', 'Ongoing retainer', 'NDA available'],
    accent: '#0ea5e9',
    popular: false,
  },
];

export default function ServicesClient() {
  return (
    <main style={{ minHeight: '100vh', background: 'transparent', position: 'relative', zIndex: 10 }}>
      <AntiGravityBackground />
      <Navbar />

      {/* ─────────────── HERO ─────────────── */}
      <section
        className="page-content hero-gradient"
        style={{ padding: 'clamp(100px, 20vw, 160px) 20px clamp(60px, 10vw, 100px)', textAlign: 'center' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 700, margin: '0 auto' }}
        >
          <p style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            What We Do
          </p>
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 24,
          }}>
            Our <span className="gradient-text">Services</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 18, lineHeight: 1.7 }}>
            From concept to launch — we handle every pixel, every endpoint, every interaction.
          </p>
        </motion.div>
      </section>

      {/* ─────────────── WEBSITE BUILDING ─────────────── */}
      <section className="page-content" style={{ padding: '80px 24px', zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 40, alignItems: 'center',
          }}>
            {/* Left: copy */}
            <motion.div
              initial="hidden" whileInView="show" variants={fadeUp} viewport={{ once: true }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '8px 16px', borderRadius: 100,
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                marginBottom: 24,
              }}>
                <span style={{ fontSize: 18 }}>🌐</span>
                <span style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>
                  WEBSITE BUILDING
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, marginBottom: 20, letterSpacing: '-0.02em' }}>
                Websites that{' '}
                <span className="gradient-text">convert</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: 16, marginBottom: 32 }}>
                We build high-performance websites that look stunning and drive real business results.
                Every project starts with your goals and ends with a product you're proud to share.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {webFeatures.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
                    <span style={{ color: '#60a5fa', fontSize: 16, marginTop: 2, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 40 }}>
                <Link href="/contact" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="md">Start a Web Project →</Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: glass card with tech stack */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <GlassCard glow style={{ padding: '40px 36px' }}>
                <p style={{ color: '#60a5fa', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24 }}>
                  Tech Stack
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {webStack.map((tech) => (
                    <motion.span
                      key={tech}
                      whileHover={{ scale: 1.08, borderColor: 'rgba(96,165,250,0.5)' }}
                      style={{
                        padding: '7px 14px', borderRadius: 8,
                        background: 'rgba(59,130,246,0.08)',
                        border: '1px solid rgba(59,130,246,0.15)',
                        color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500,
                        cursor: 'default',
                      }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>

                {/* Sample metrics */}
                <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Avg Load Time', value: '< 1s' },
                    { label: 'Lighthouse Score', value: '97+' },
                    { label: 'SEO Score', value: '100' },
                    { label: 'Uptime SLA', value: '99.9%' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      padding: '16px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      textAlign: 'center',
                    }}>
                      <div className="gradient-text-blue" style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{value}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="page-content" style={{ padding: '0 24px', zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="gradient-divider" />
        </div>
      </div>

      {/* ─────────────── APP BUILDING ─────────────── */}
      <section className="page-content" style={{ padding: '80px 24px', zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 40, alignItems: 'center',
          }}>
            {/* Left: glass card (reversed on desktop via order) */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              style={{ order: 0 }}
            >
              <GlassCard glow style={{ padding: '40px 36px' }}>
                <p style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24 }}>
                  Tech Stack
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {appStack.map((tech) => (
                    <motion.span
                      key={tech}
                      whileHover={{ scale: 1.08, borderColor: 'rgba(167,139,250,0.5)' }}
                      style={{
                        padding: '7px 14px', borderRadius: 8,
                        background: 'rgba(109,40,217,0.1)',
                        border: '1px solid rgba(109,40,217,0.2)',
                        color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500,
                        cursor: 'default',
                      }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>

                {/* App Store badges placeholder */}
                <div style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {['iOS App Store', 'Google Play'].map((store) => (
                    <div key={store} style={{
                      padding: '12px 20px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 13, fontWeight: 500,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ fontSize: 18 }}>{store === 'iOS App Store' ? '🍎' : '▶'}</span>
                      {store}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Right: copy */}
            <motion.div
              initial="hidden" whileInView="show" variants={fadeUp} viewport={{ once: true }}
              style={{ order: 1 }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '8px 16px', borderRadius: 100,
                background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.25)',
                marginBottom: 24,
              }}>
                <span style={{ fontSize: 18 }}>📱</span>
                <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>
                  APP BUILDING
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, marginBottom: 20, letterSpacing: '-0.02em' }}>
                Apps users{' '}
                <span className="gradient-text">love</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: 16, marginBottom: 32 }}>
                We craft mobile apps that feel native, perform flawlessly, and keep users coming back.
                One codebase, two platforms, zero compromise on quality.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {appFeatures.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
                    <span style={{ color: '#a78bfa', fontSize: 16, marginTop: 2, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 40 }}>
                <Link href="/contact" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="md" style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #3b82f6 100%)' }}>
                    Start an App Project →
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────── PROCESS ─────────────── */}
      <section className="page-content" style={{ padding: '80px 24px 100px', zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <p style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              How We Work
            </p>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Our <span className="gradient-text">Process</span>
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {process.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <GlassCard style={{ padding: '32px 28px', height: '100%' }}>
                  <div style={{ color: 'rgba(59,130,246,0.4)', fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16 }}>
                    {step}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── PRICING ─────────────── */}
      <section className="page-content" style={{ padding: '0 24px 120px', zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <p style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Investment
            </p>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Transparent <span className="gradient-text">Pricing</span>
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {pricing.map(({ tier, price, period, desc, features, accent, popular }, i) => (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                viewport={{ once: true }}
                style={{ position: 'relative' }}
              >
                {popular && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    padding: '4px 16px', borderRadius: 100,
                    background: `linear-gradient(135deg, ${accent} 0%, #3b82f6 100%)`,
                    fontSize: 11, fontWeight: 700, color: '#fff',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    zIndex: 1, whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </div>
                )}
                <GlassCard
                  glow={popular}
                  style={{
                    padding: '40px 32px',
                    border: popular ? `1px solid ${accent}40` : undefined,
                    height: '100%',
                    boxShadow: popular ? `0 0 40px ${accent}20` : undefined,
                  }}
                >
                  <p style={{ color: accent, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                    {tier}
                  </p>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.02em' }}>{price}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginLeft: 8 }}>/ {period}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>{desc}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
                    {features.map((f) => (
                      <li key={f} style={{ display: 'flex', gap: 10, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                        <span style={{ color: accent, flexShrink: 0 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact" style={{ textDecoration: 'none', display: 'block' }}>
                    <Button
                      variant={popular ? 'primary' : 'ghost'}
                      size="md"
                      fullWidth
                      style={popular ? { background: `linear-gradient(135deg, ${accent} 0%, #3b82f6 100%)` } : undefined}
                    >
                      Get Started
                    </Button>
                  </Link>
                </GlassCard>
              </motion.div>
            ))}
          </div>
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
