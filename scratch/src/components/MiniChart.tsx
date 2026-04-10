import { motion } from 'framer-motion';

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function MiniChart({ data, color = '#6C63FF', height = 60 }: MiniChartProps) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height={height} viewBox={`0 0 ${data.length * 20} ${height}`} preserveAspectRatio="none">
        {/* Area fill */}
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          d={`M0,${height} ${data.map((d, i) => `L${i * 20 + 10},${height - ((d - min) / range) * (height * 0.85)}`).join(' ')} L${(data.length - 1) * 20 + 10},${height} Z`}
          fill={`url(#grad-${color.replace('#','')})`}
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          d={data.map((d, i) => `${i === 0 ? 'M' : 'L'}${i * 20 + 10},${height - ((d - min) / range) * (height * 0.85)}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Dots */}
        {data.map((d, i) => (
          <motion.circle
            key={i}
            initial={{ r: 0 }}
            animate={{ r: 3 }}
            transition={{ delay: 1.5 + i * 0.05 }}
            cx={i * 20 + 10}
            cy={height - ((d - min) / range) * (height * 0.85)}
            fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
          />
        ))}
      </svg>
    </div>
  );
}
