'use client';

import dynamic from 'next/dynamic';
import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';

const AntiGravityBackground = dynamic(
  () => import('@/components/3d/AntiGravityBackground'),
  { ssr: false }
);

type FormState = {
  name: string;
  email: string;
  projectType: string;
  details: string;
};

type Status = 'idle' | 'sending' | 'success' | 'error';

const contactInfo = [
  { icon: '✉️',  label: 'Email',         value: 'hello@decortix.com'       },
  { icon: '📍',  label: 'Location',      value: 'Available Worldwide'       },
  { icon: '⏱️',  label: 'Response Time', value: 'Within 24 hours'           },
];

const socials = [
  { label: 'LinkedIn', icon: 'in', href: '#' },
  { label: 'GitHub',   icon: 'GH', href: '#' },
  { label: 'Twitter',  icon: '𝕏',  href: '#' },
];

export default function ContactClient() {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', projectType: '', details: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim())   e.name  = 'Name is required';
    if (!form.email.trim())  e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.projectType)   e.projectType = 'Please select a project type';
    if (!form.details.trim() || form.details.trim().length < 20)
      e.details = 'Please describe your project (min. 20 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    // Simulate API call (replace with real endpoint)
    await new Promise((res) => setTimeout(res, 1800));
    setStatus('success');
  };

  const inputStyle = (field: keyof FormState) => ({
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${errors[field] ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 10,
    color: '#fff',
    padding: '14px 18px',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  });

  return (
    <main style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <AntiGravityBackground />
      <Navbar />

      {/* ─────────────── HERO ─────────────── */}
      <section
        className="page-content hero-gradient"
        style={{ padding: '160px 24px 80px', textAlign: 'center' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 640, margin: '0 auto' }}
        >
          <p style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Contact Us
          </p>
          <h1 style={{
            fontSize: 'clamp(38px, 5.5vw, 68px)',
            fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 24,
          }}>
            Let&apos;s Build Something{' '}
            <span className="gradient-text">Great</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, lineHeight: 1.7 }}>
            Tell us about your project and we&apos;ll get back to you within 24 hours with a tailored proposal.
          </p>
        </motion.div>
      </section>

      {/* ─────────────── MAIN CONTENT ─────────────── */}
      <section className="page-content" style={{ padding: '40px 24px 120px', zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 40,
          }}>
            {/* ── Contact Form ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{ flex: '1 1 500px', maxWidth: 640 }}
            >
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <GlassCard glow style={{ padding: '64px 48px', textAlign: 'center' }}>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ fontSize: 56, marginBottom: 24 }}
                      >
                        🎉
                      </motion.div>
                      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Message Sent!</h2>
                      <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 32 }}>
                        Thanks for reaching out. We&apos;ll review your project details and get back to you within 24 hours.
                      </p>
                      <Button variant="ghost" onClick={() => { setStatus('idle'); setForm({ name: '', email: '', projectType: '', details: '' }); }}>
                        Send Another Message
                      </Button>
                    </GlassCard>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <GlassCard style={{ padding: '48px 40px' }}>
                      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>Tell Us About Your Project</h2>
                      <form onSubmit={handleSubmit} noValidate>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                          {/* Name */}
                          <div>
                            <label htmlFor="name" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8, letterSpacing: '0.02em' }}>
                              Full Name *
                            </label>
                            <input
                              id="name"
                              type="text"
                              placeholder="Jane Smith"
                              value={form.name}
                              onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                              style={inputStyle('name')}
                            />
                            {errors.name && <p style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{errors.name}</p>}
                          </div>

                          {/* Email */}
                          <div>
                            <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                              Email Address *
                            </label>
                            <input
                              id="email"
                              type="email"
                              placeholder="jane@company.com"
                              value={form.email}
                              onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                              style={inputStyle('email')}
                            />
                            {errors.email && <p style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{errors.email}</p>}
                          </div>

                          {/* Project Type */}
                          <div>
                            <label htmlFor="projectType" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                              Project Type *
                            </label>
                            <select
                              id="projectType"
                              value={form.projectType}
                              onChange={(e) => { setForm({ ...form, projectType: e.target.value }); setErrors({ ...errors, projectType: '' }); }}
                              style={{
                                ...inputStyle('projectType'),
                                color: form.projectType ? '#fff' : 'rgba(255,255,255,0.35)',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="" disabled style={{ background: '#0A0E1A' }}>Select a type…</option>
                              <option value="website"  style={{ background: '#0A0E1A' }}>Website Building</option>
                              <option value="app"      style={{ background: '#0A0E1A' }}>App Building</option>
                              <option value="both"     style={{ background: '#0A0E1A' }}>Website + App</option>
                              <option value="other"    style={{ background: '#0A0E1A' }}>Other / Not sure</option>
                            </select>
                            {errors.projectType && <p style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{errors.projectType}</p>}
                          </div>

                          {/* Details */}
                          <div>
                            <label htmlFor="details" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                              Project Details *
                            </label>
                            <textarea
                              id="details"
                              rows={5}
                              placeholder="Tell us about your project — goals, timeline, budget range, and any specific requirements…"
                              value={form.details}
                              onChange={(e) => { setForm({ ...form, details: e.target.value }); setErrors({ ...errors, details: '' }); }}
                              style={{ ...inputStyle('details'), resize: 'vertical', minHeight: 120 }}
                            />
                            {errors.details && <p style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{errors.details}</p>}
                          </div>

                          {/* Submit */}
                          <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            disabled={status === 'sending'}
                          >
                            {status === 'sending' ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <motion.span
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                  style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                                />
                                Sending…
                              </span>
                            ) : 'Send Message →'}
                          </Button>
                        </div>
                      </form>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Right Side Info ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              {/* Contact info card */}
              <GlassCard style={{ padding: '36px 32px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Contact Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {contactInfo.map(({ icon, label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                      }}>
                        {icon}
                      </div>
                      <div>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                          {label}
                        </p>
                        <p style={{ fontSize: 15, fontWeight: 500 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Social links */}
              <GlassCard style={{ padding: '32px' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'rgba(255,255,255,0.8)' }}>
                  Find Us Online
                </h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  {socials.map(({ label, icon, href }) => (
                    <motion.a
                      key={label}
                      href={href}
                      aria-label={label}
                      whileHover={{ scale: 1.12, borderColor: 'rgba(96,165,250,0.5)' }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 13,
                        textDecoration: 'none', cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {icon}
                    </motion.a>
                  ))}
                </div>
              </GlassCard>

              {/* Promise card */}
              <GlassCard glow style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>🤝</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>Our Promise</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7 }}>
                    No generic templates. No offshore shortcuts. Every project is built with care,
                    shipped on time, and backed by our satisfaction guarantee.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
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
