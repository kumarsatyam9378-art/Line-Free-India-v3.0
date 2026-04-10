import { useApp } from '../store/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingThemeToggle() {
  const { theme, toggleTheme } = useApp();
  
  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-[60] w-11 h-11 flex items-center justify-center text-lg cursor-pointer"
      style={{
        borderRadius: '14px',
        background: 'rgba(20, 20, 22, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '8px 8px 16px rgba(9,9,10,0.8), -8px -8px 16px rgba(27,27,30,0.3)'
      }}
      whileTap={{ scale: 0.85, rotate: 180 }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          initial={{ y: -15, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 15, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
