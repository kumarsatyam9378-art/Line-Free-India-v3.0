import { useNavigate } from 'react-router-dom';
import { useApp, getCategoryInfo } from '../store/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickActionsProps {
  onClose: () => void;
}

export default function QuickActions({ onClose }: QuickActionsProps) {
  const nav = useNavigate();
  const { businessProfile } = useApp();
  const catType = businessProfile?.businessType || 'men_salon';
  const catInfo = getCategoryInfo(catType);

  const actions = [
    { icon: '📋', label: 'Queue', path: '/barber/customers', color: '#00F0FF' },
    { icon: '📊', label: 'Analytics', path: '/barber/analytics', color: '#10B981' },
    { icon: '💬', label: 'Messages', path: '/barber/messages', color: '#8B5CF6' },
    { icon: '📢', label: 'WhatsApp CRM', path: '/barber/whatsapp-crm', color: '#25D366' },
    { icon: '💳', label: 'UPI Payment', path: '/barber/upi-payment', color: '#F59E0B' },
    { icon: '📋', label: 'Dashboard', path: '/barber/dashboard', color: '#EC4899' },
    { icon: '🎨', label: 'QR Code', path: '/barber/qr', color: '#06B6D4' },
    { icon: '👥', label: 'Staff', path: '/barber/staff', color: '#F43F5E' },
    { icon: '⚙️', label: 'Settings', path: '/barber/profile', color: '#71717A' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70]"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={e => e.stopPropagation()}
          className="absolute bottom-24 left-4 right-4 max-w-[460px] mx-auto p-6"
          style={{
            borderRadius: '28px',
            background: 'rgba(18, 18, 20, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <span className="text-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.4))' }}>⚡</span>
              <h3 className="text-base font-black uppercase tracking-[2px] text-white">Quick Actions</h3>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center transition-all active:scale-90"
              style={{ 
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#52525B'
              }}
            >
              ✕
            </button>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-3 gap-3">
            {actions.map((a, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 200 }}
                onClick={() => { nav(a.path); onClose(); }}
                className="flex flex-col items-center gap-2.5 p-3 transition-all active:scale-90"
                style={{ borderRadius: '18px' }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center text-xl transition-transform"
                  style={{ 
                    borderRadius: '16px',
                    background: `${a.color}08`, 
                    border: `1px solid ${a.color}18`,
                    boxShadow: `0 0 15px ${a.color}08`
                  }}
                >
                  {a.icon}
                </div>
                <span 
                  className="text-[9px] font-black text-center leading-tight uppercase tracking-wider"
                  style={{ color: '#71717A' }}
                >
                  {a.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
