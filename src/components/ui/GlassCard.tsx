'use client';

import { motion } from 'framer-motion';
import { ReactNode, CSSProperties } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  style,
  hover = true,
  glow = false,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        background: 'rgba(255, 255, 255, 0.035)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        boxShadow: glow
          ? '0 0 40px rgba(59,130,246,0.12), 0 8px 32px rgba(0,0,0,0.4)'
          : '0 4px 24px rgba(0,0,0,0.3)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      className={`glass-card ${className}`}
    >
      {children}
    </motion.div>
  );
}
