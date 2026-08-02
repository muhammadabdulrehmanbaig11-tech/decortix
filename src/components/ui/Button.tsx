'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  fullWidth?: boolean;
}

const variants = {
  primary: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 0 20px rgba(59,130,246,0.3)',
  },
  ghost: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(255,255,255,0.15)',
    boxShadow: 'none',
  },
  outline: {
    background: 'transparent',
    color: '#60a5fa',
    border: '1px solid rgba(96,165,250,0.4)',
    boxShadow: '0 0 15px rgba(59,130,246,0.1)',
  },
};

const sizes = {
  sm: { padding: '8px 18px',  fontSize: 13, borderRadius: 8  },
  md: { padding: '12px 28px', fontSize: 15, borderRadius: 10 },
  lg: { padding: '16px 40px', fontSize: 17, borderRadius: 12 },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  style,
  ...props
}: ButtonProps) {
  const v = variants[variant];
  const s = sizes[size];

  return (
    <motion.button
      whileHover={{
        scale: 1.03,
        boxShadow: variant === 'primary'
          ? '0 0 35px rgba(59,130,246,0.55)'
          : '0 0 20px rgba(255,255,255,0.08)',
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        ...v,
        ...s,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        cursor: 'pointer',
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        letterSpacing: '0.01em',
        transition: 'all 0.2s ease',
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
