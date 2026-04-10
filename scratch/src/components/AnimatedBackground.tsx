import { motion } from 'framer-motion';

/**
 * Feature #2: Dynamic Gradient Mesh Backgrounds (Upgraded)
 * Multi-layer animated gradient blobs with context-aware colors
 */

interface AnimatedBackgroundProps {
  variant?: 'customer' | 'business' | 'auth' | 'default';
}

const colorSets = {
  customer: {
    c1: 'rgba(225,29,72,0.25)',
    c2: 'rgba(217,70,239,0.20)',
    c3: 'rgba(251,113,133,0.18)',
    c4: 'rgba(253,164,175,0.12)',
  },
  business: {
    c1: 'rgba(225,29,72,0.20)',
    c2: 'rgba(217,70,239,0.18)',
    c3: 'rgba(251,113,133,0.15)',
    c4: 'rgba(190,18,60,0.10)',
  },
  auth: {
    c1: 'rgba(225,29,72,0.30)',
    c2: 'rgba(217,70,239,0.25)',
    c3: 'rgba(253,164,175,0.20)',
    c4: 'rgba(251,113,133,0.15)',
  },
  default: {
    c1: 'rgba(225,29,72,0.20)',
    c2: 'rgba(217,70,239,0.15)',
    c3: 'rgba(253,164,175,0.12)',
    c4: 'rgba(251,113,133,0.08)',
  },
};

export default function AnimatedBackground({ variant = 'default' }: AnimatedBackgroundProps) {
  const colors = colorSets[variant];

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Primary blob - top left */}
      <motion.div
        animate={{
          x: ['-15%', '15%', '-10%', '10%', '-15%'],
          y: ['-15%', '10%', '-5%', '15%', '-15%'],
          scale: [1, 1.15, 1.05, 1.2, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full liquid-blob"
        style={{
          background: colors.c1,
          filter: 'blur(80px)',
          opacity: 0.6,
          mixBlendMode: 'screen',
        }}
      />

      {/* Secondary blob - bottom right */}
      <motion.div
        animate={{
          x: ['15%', '-15%', '10%', '-10%', '15%'],
          y: ['15%', '-10%', '5%', '-15%', '15%'],
          scale: [1, 1.3, 1.1, 1.25, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-15%] right-[-10%] w-[65vw] h-[65vw] rounded-full liquid-blob"
        style={{
          background: colors.c2,
          filter: 'blur(100px)',
          opacity: 0.5,
          mixBlendMode: 'screen',
        }}
      />

      {/* Tertiary blob - center floating */}
      <motion.div
        animate={{
          y: ['-8%', '8%', '-5%', '10%', '-8%'],
          x: ['-5%', '5%', '-8%', '3%', '-5%'],
          scale: [1, 1.1, 0.95, 1.15, 1],
          opacity: [0.4, 0.6, 0.3, 0.55, 0.4],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[25%] left-[20%] w-[45vw] h-[45vw] rounded-full liquid-blob"
        style={{
          background: colors.c3,
          filter: 'blur(90px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Fourth blob - subtle accent */}
      <motion.div
        animate={{
          x: ['10%', '-10%', '5%', '-5%', '10%'],
          y: ['5%', '-5%', '10%', '-10%', '5%'],
          scale: [0.9, 1.1, 1, 1.2, 0.9],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[60%] right-[20%] w-[35vw] h-[35vw] rounded-full"
        style={{
          background: colors.c4,
          filter: 'blur(70px)',
          opacity: 0.4,
          mixBlendMode: 'screen',
        }}
      />

      {/* Soft noise overlay for texture */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, var(--color-bg) 80%)',
          opacity: 0.4,
        }}
      />
    </div>
  );
}
