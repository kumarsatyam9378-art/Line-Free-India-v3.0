import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * Feature #15: Number Counter Roll-Up (Slot Machine Style) — Upgraded
 * Digits roll like a slot machine from 0 to target value
 */

interface AnimatedCounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
  variant?: 'default' | 'slot' | 'ticker';
  color?: string;
}

function SlotDigit({ digit, duration }: { digit: string; duration: number }) {
  const isNum = !isNaN(parseInt(digit));

  if (!isNum) {
    return <span className="inline-block">{digit}</span>;
  }

  const num = parseInt(digit);

  return (
    <span className="counter-slot relative" style={{ width: '0.65em' }}>
      <motion.span
        className="counter-digit inline-flex flex-col"
        initial={{ y: 0 }}
        animate={{ y: `${-num * 1.2}em` }}
        transition={{
          duration: duration * 0.8,
          ease: [0.34, 1.56, 0.64, 1],
          delay: Math.random() * 0.2,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <span key={n} style={{ height: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export default function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  duration = 1.5,
  className = '',
  decimals = 0,
  variant = 'default',
  color,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || variant !== 'default') return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration, variant]);

  // Slot machine variant
  if (variant === 'slot' || variant === 'ticker') {
    const formatted = target.toFixed(decimals);
    const digits = `${prefix}${formatted}${suffix}`.split('');

    return (
      <motion.span
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        className={`inline-flex items-center font-bold tabular-nums ${className}`}
        style={{ color }}
      >
        {isInView && digits.map((d, i) => (
          <SlotDigit key={`${i}-${d}`} digit={d} duration={duration} />
        ))}
      </motion.span>
    );
  }

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      className={`tabular-nums ${className}`}
      style={{ color }}
    >
      {prefix}{count.toFixed(decimals)}{suffix}
    </motion.span>
  );
}
