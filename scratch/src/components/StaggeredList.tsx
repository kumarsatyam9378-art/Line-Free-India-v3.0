import { ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * Feature #12: Staggered List Entry Animations
 * Wrapper component that animates children with staggered delays
 */

interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
  animation?: 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'fadeIn';
}

const animations = {
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

export default function StaggeredList({
  children,
  staggerDelay = 0.05,
  className = '',
  animation = 'slideUp',
}: StaggeredListProps) {
  const variants = animations[animation];

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={variants}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
