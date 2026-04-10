import { motion } from 'framer-motion';

interface PremiumBannerProps {
  title: string;
  subtitle: string;
  cta: string;
  onAction: () => void;
  variant?: 'gradient' | 'glass' | 'gold' | 'neon';
}

export default function PremiumBanner({ title, subtitle, cta, onAction, variant = 'gradient' }: PremiumBannerProps) {
  const styles: Record<string, string> = {
    gradient: 'bg-gradient-to-r from-primary via-accent to-secondary',
    glass: 'aurora-glass',
    gold: 'bg-gradient-to-r from-gold via-amber-400 to-orange-500',
    neon: 'bg-card border-2 border-primary',
  };

  const textColor = variant === 'gold' ? 'text-gray-900' : 'text-white';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onAction}
      className={`p-5 rounded-3xl cursor-pointer relative overflow-hidden ${styles[variant]}`}
    >
      {/* Animated shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmer 3s infinite', backgroundSize: '200% 100%' }} />
      
      <div className="relative z-10">
        <h3 className={`text-lg font-black ${textColor}`}>{title}</h3>
        <p className={`text-sm mt-1 ${variant === 'gold' ? 'text-gray-700' : 'text-white/70'}`}>{subtitle}</p>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-sm font-bold text-white">
          {cta} →
        </div>
      </div>
    </motion.div>
  );
}
