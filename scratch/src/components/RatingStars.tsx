import { useState } from 'react';
import { motion } from 'framer-motion';

interface RatingStarsProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
}

export default function RatingStars({ value, onChange, size = 'md', readonly = false, showValue = true }: RatingStarsProps) {
  const [hover, setHover] = useState(0);
  const sizes = { sm: 'text-base', md: 'text-2xl', lg: 'text-4xl' };

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(star => (
        <motion.button
          key={star}
          whileTap={readonly ? {} : { scale: 1.3 }}
          whileHover={readonly ? {} : { scale: 1.2, y: -2 }}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange?.(star)}
          className={`${sizes[size]} transition-all ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          style={{
            filter: (hover || value) >= star ? 'none' : 'grayscale(1) opacity(0.3)',
            textShadow: (hover || value) >= star ? '0 0 10px rgba(255,215,0,0.5)' : 'none',
          }}
        >
          ⭐
        </motion.button>
      ))}
      {showValue && value > 0 && (
        <span className="ml-2 text-gold font-black text-sm">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
