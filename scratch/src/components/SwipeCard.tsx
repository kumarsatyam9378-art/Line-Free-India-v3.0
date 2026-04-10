import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useState } from 'react';

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
}

export default function SwipeCard({ children, onSwipeLeft, onSwipeRight, leftLabel = '✕', rightLabel = '✓', leftColor = '#FF4444', rightColor = '#00C851' }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const leftOpacity = useTransform(x, [-150, -50], [1, 0]);
  const rightOpacity = useTransform(x, [50, 150], [0, 1]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.x < -100) {
      onSwipeLeft?.();
    } else if (info.offset.x > 100) {
      onSwipeRight?.();
    }
  };

  return (
    <div className="relative">
      {/* Swipe indicators */}
      <motion.div
        style={{ opacity: leftOpacity }}
        className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none"
      >
        <span className="text-4xl font-black px-4 py-2 rounded-xl" style={{ color: leftColor, border: `3px solid ${leftColor}` }}>
          {leftLabel}
        </span>
      </motion.div>
      <motion.div
        style={{ opacity: rightOpacity }}
        className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none"
      >
        <span className="text-4xl font-black px-4 py-2 rounded-xl" style={{ color: rightColor, border: `3px solid ${rightColor}` }}>
          {rightLabel}
        </span>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x, rotate }}
        className="relative z-20 cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}
