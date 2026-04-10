import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * Feature #19: Animated Progress Rings & Gauges
 * SVG-based animated circular progress with color transitions
 */

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  value?: string;
  colorStart?: string;
  colorEnd?: string;
  className?: string;
  showPercentage?: boolean;
}

export default function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 6,
  label,
  value,
  colorStart,
  colorEnd,
  className = '',
  showPercentage = true,
}: ProgressRingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;

  // Determine colors based on progress
  const getColor = () => {
    if (colorStart) return colorStart;
    if (progress >= 75) return '#10B981';
    if (progress >= 50) return '#F59E0B';
    if (progress >= 25) return '#FB923C';
    return '#EF4444';
  };

  const getGradientEnd = () => {
    if (colorEnd) return colorEnd;
    if (progress >= 75) return '#34D399';
    if (progress >= 50) return '#FCD34D';
    if (progress >= 25) return '#FDBA74';
    return '#F87171';
  };

  useEffect(() => {
    if (!isInView) return;
    let raf: number;
    const start = performance.now();
    const duration = 1200;

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedProgress(eased * progress);
      if (t < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isInView, progress]);

  const gradientId = `ring-grad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div ref={ref} className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getColor()} />
              <stop offset="100%" stopColor={getGradientEnd()} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="progress-ring-track"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 0.1s ease-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {value ? (
            <span className="text-base font-bold text-text">{value}</span>
          ) : showPercentage ? (
            <span className="text-base font-bold text-text">
              {Math.round(animatedProgress)}%
            </span>
          ) : null}
        </div>
      </div>
      {label && (
        <span className="text-xs text-text-dim font-medium text-center">{label}</span>
      )}
    </div>
  );
}
