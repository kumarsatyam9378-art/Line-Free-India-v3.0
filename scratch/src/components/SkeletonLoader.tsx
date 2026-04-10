import { motion } from 'framer-motion';

/**
 * Feature #10: Premium Loading States & Skeleton Shimmer (Upgraded)
 * Contextual skeleton loaders that match the shape of actual content
 */

interface SkeletonProps {
  variant?: 'card' | 'avatar' | 'text' | 'image' | 'stat' | 'salon-card' | 'dashboard' | 'list-item' | 'profile';
  count?: number;
}

export default function SkeletonLoader({ variant = 'card', count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'avatar') {
    return (
      <div className="flex gap-3">
        {items.map(i => (
          <div key={i} className="w-12 h-12 rounded-full shimmer-premium skeleton-wave" />
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-3">
        {items.map(i => (
          <div key={i} className="space-y-2">
            <div className="h-3 shimmer-premium skeleton-wave" style={{ width: '85%' }} />
            <div className="h-3 shimmer-premium skeleton-wave" style={{ width: '65%' }} />
            <div className="h-3 shimmer-premium skeleton-wave" style={{ width: '75%' }} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'image') {
    return (
      <div className="space-y-3">
        {items.map(i => (
          <div key={i} className="w-full h-48 rounded-2xl shimmer-premium skeleton-wave" />
        ))}
      </div>
    );
  }

  if (variant === 'stat') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {items.map(i => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-2xl shimmer-premium skeleton-wave h-24"
          />
        ))}
      </div>
    );
  }

  if (variant === 'salon-card') {
    return (
      <div className="space-y-4">
        {items.map(i => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl overflow-hidden"
          >
            {/* Image placeholder */}
            <div className="w-full h-40 shimmer-premium skeleton-wave" />
            {/* Content */}
            <div className="p-4 space-y-3" style={{ background: 'var(--color-card)' }}>
              <div className="flex justify-between items-center">
                <div className="h-4 w-2/3 shimmer-premium skeleton-wave rounded-lg" />
                <div className="h-6 w-12 shimmer-premium skeleton-wave rounded-full" />
              </div>
              <div className="h-3 w-1/2 shimmer-premium skeleton-wave rounded-lg" />
              <div className="flex gap-2">
                <div className="h-7 w-16 shimmer-premium skeleton-wave rounded-full" />
                <div className="h-7 w-20 shimmer-premium skeleton-wave rounded-full" />
                <div className="h-7 w-14 shimmer-premium skeleton-wave rounded-full" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-5 w-32 shimmer-premium skeleton-wave rounded-lg" />
            <div className="h-3 w-24 shimmer-premium skeleton-wave rounded-lg" />
          </div>
          <div className="w-10 h-10 rounded-full shimmer-premium skeleton-wave" />
        </div>
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 rounded-2xl shimmer-premium skeleton-wave h-20"
            />
          ))}
        </div>
        {/* Chart placeholder */}
        <div className="h-40 rounded-2xl shimmer-premium skeleton-wave" />
        {/* List items */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            className="flex gap-3 items-center"
          >
            <div className="w-12 h-12 rounded-xl shimmer-premium skeleton-wave flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 shimmer-premium skeleton-wave rounded-lg" />
              <div className="h-3 w-1/2 shimmer-premium skeleton-wave rounded-lg" />
            </div>
            <div className="h-8 w-16 shimmer-premium skeleton-wave rounded-lg" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'list-item') {
    return (
      <div className="space-y-3">
        {items.map(i => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex gap-3 items-center p-3 rounded-xl"
            style={{ background: 'var(--color-card)' }}
          >
            <div className="w-11 h-11 rounded-xl shimmer-premium skeleton-wave flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-3/5 shimmer-premium skeleton-wave rounded-lg" />
              <div className="h-2.5 w-2/5 shimmer-premium skeleton-wave rounded-lg" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="w-24 h-24 rounded-full shimmer-premium skeleton-wave" />
        <div className="h-5 w-36 shimmer-premium skeleton-wave rounded-lg" />
        <div className="h-3 w-24 shimmer-premium skeleton-wave rounded-lg" />
        <div className="w-full grid grid-cols-3 gap-3 mt-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-16 shimmer-premium skeleton-wave rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Default: card
  return (
    <div className="space-y-3">
      {items.map(i => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="p-4 rounded-2xl shimmer-premium skeleton-wave h-24"
        />
      ))}
    </div>
  );
}
