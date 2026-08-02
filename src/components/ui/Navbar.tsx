'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/',          label: 'Home'     },
  { href: '/services',  label: 'Services' },
  { href: '/contact',   label: 'Contact'  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.4s ease, border-color 0.4s ease',
          background: scrolled
            ? 'rgba(5, 9, 19, 0.85)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid transparent',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            {/* Logo Image */}
            <Image 
              src="/logo.jpg" 
              alt="Decortix Logo" 
              width={36} 
              height={36} 
              style={{ borderRadius: '8px' }} 
            />
            <span className="gradient-text" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
              Decortix
            </span>
          </motion.div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
             className="hidden md:flex">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ color: '#60a5fa' }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                    background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#60a5fa',
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
          <Link href="/contact" style={{ textDecoration: 'none', marginLeft: 8 }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(59,130,246,0.5)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '9px 22px',
                borderRadius: '9px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Get Started
            </motion.button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            color: '#fff',
          }}
          className="flex md:hidden flex-col gap-[5px]"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            style={{ display: 'block', width: 22, height: 2, background: '#fff', borderRadius: 2 }}
          />
          <motion.span
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            style={{ display: 'block', width: 22, height: 2, background: '#fff', borderRadius: 2 }}
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            style={{ display: 'block', width: 22, height: 2, background: '#fff', borderRadius: 2 }}
          />
        </button>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              top: 72,
              left: 0,
              right: 0,
              zIndex: 99,
              background: 'rgba(5, 9, 19, 0.97)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              padding: '16px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {navLinks.map(({ href, label }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    color: pathname === href ? '#60a5fa' : 'rgba(255,255,255,0.8)',
                    fontWeight: pathname === href ? 600 : 400,
                    fontSize: 16,
                    background: pathname === href ? 'rgba(59,130,246,0.1)' : 'transparent',
                  }}>
                    {label}
                  </div>
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              style={{ marginTop: 8 }}>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  Get Started
                </button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
