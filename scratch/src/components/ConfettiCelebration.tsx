import { ReactNode, useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Feature #16: Confetti & Celebration Particles (Upgraded)
 * Rich particle celebration effects for achievements and milestones
 */

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
  shape: 'circle' | 'square' | 'star';
}

interface ConfettiCelebrationProps {
  trigger: boolean;
  type?: 'confetti' | 'stars' | 'explosion' | 'firework';
  duration?: number;
  particleCount?: number;
  children?: ReactNode;
  onComplete?: () => void;
}

const COLORS = [
  '#E11D48', '#D946EF', '#FB7185', '#FDE047', '#FDA4AF',
  '#10B981', '#3B82F6', '#F59E0B', '#A855F7', '#EC4899',
];

export default function ConfettiCelebration({
  trigger,
  type = 'confetti',
  duration = 2000,
  particleCount = 40,
  children,
  onComplete,
}: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = type === 'explosion' ? 150 + Math.random() * 200 : 80 + Math.random() * 120;

      newParticles.push({
        id: i,
        x: 0,
        y: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: type === 'stars' ? 8 + Math.random() * 6 : 4 + Math.random() * 8,
        vx: Math.cos(angle) * speed,
        vy: type === 'confetti'
          ? -200 - Math.random() * 300
          : Math.sin(angle) * speed * -1,
        rotation: Math.random() * 360,
        shape: type === 'stars' ? 'star' : Math.random() > 0.5 ? 'circle' : 'square',
      });
    }
    return newParticles;
  }, [particleCount, type]);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      setParticles(generateParticles());

      const timer = setTimeout(() => {
        setIsActive(false);
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, isActive, generateParticles, duration, onComplete]);

  return (
    <div ref={containerRef} className="relative">
      {children}
      <AnimatePresence>
        {isActive && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {particles.map(p => (
              <motion.div
                key={p.id}
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 1,
                  opacity: 1,
                  rotate: 0,
                }}
                animate={{
                  x: `calc(50% + ${p.vx}px)`,
                  y: `calc(50% + ${p.vy + 100}px)`,
                  scale: 0,
                  opacity: 0,
                  rotate: p.rotation + 720,
                }}
                transition={{
                  duration: duration / 1000,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{
                  position: 'absolute',
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'star' ? '2px' : '2px',
                  boxShadow: `0 0 ${p.size}px ${p.color}40`,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
