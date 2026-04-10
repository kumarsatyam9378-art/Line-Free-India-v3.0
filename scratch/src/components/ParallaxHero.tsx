import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';

/**
 * Feature #11: Parallax Scroll Hero Sections
 * Multi-layer parallax with depth effect on scroll
 */

interface ParallaxHeroProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  gradient?: string;
  height?: string;
  children?: ReactNode;
  className?: string;
}

export default function ParallaxHero({
  title,
  subtitle,
  emoji = '✨',
  gradient = 'from-rose-500 to-fuchsia-500',
  height = '280px',
  children,
  className = '',
}: ParallaxHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-b-3xl ${className}`}
      style={{ height, minHeight: height }}
    >
      {/* Parallax background layer */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgY }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
        
        {/* Floating decorative elements */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-8 right-8 w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
        />
        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-12 left-6 w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
        />
        <motion.div
          animate={{
            y: [0, -8, 0],
            x: [0, 5, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/3 w-8 h-8 rounded-lg bg-white/5 backdrop-blur-sm border border-white/8"
        />
      </motion.div>

      {/* Content layer */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center"
        style={{ y: textY, opacity, scale }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-4xl mb-3"
        >
          {emoji}
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="type-display text-2xl text-text"
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-text-dim text-sm mt-2 max-w-xs"
          >
            {subtitle}
          </motion.p>
        )}
        
        {children}
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
