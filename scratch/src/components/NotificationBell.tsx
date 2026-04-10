import { motion } from 'framer-motion';

interface NotificationBellProps {
  count: number;
  onClick: () => void;
}

export default function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      whileHover={{ rotate: [0, -15, 15, -10, 10, 0] }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className="relative w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover-glow"
    >
      <span className="text-lg">🔔</span>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger flex items-center justify-center text-[9px] font-black text-white"
          style={{ boxShadow: '0 0 8px rgba(255,68,68,0.5)' }}
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </motion.button>
  );
}
