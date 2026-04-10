import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, Lang } from '../store/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LanguageSelect() {
  const { setLang, user, role } = useApp();
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [splash, setSplash] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (user && role) {
      const homePath = role === 'business' ? '/barber/home' : '/customer/home';
      nav(homePath, { replace: true });
      return;
    }
    setTimeout(() => setSplash(false), 2200);
    setTimeout(() => setShow(true), 2500);
  }, [user, role, nav]);

  const select = (l: Lang) => {
    setLang(l);
    setToast(l === 'en' ? '✅ English Selected' : '✅ हिंदी चयनित');
    setTimeout(() => nav('/role'), 1500);
  };

  if (splash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: '#0C0C0E' }}>
        {/* Ambient orbs */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full"
          style={{ background: 'radial-gradient(circle, #00F0FF 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full"
          style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)', filter: 'blur(100px)' }}
        />

        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 80 }}
          className="text-center"
        >
          <div 
            className="w-28 h-28 flex items-center justify-center mx-auto mb-6 holo-card"
            style={{ 
              borderRadius: '36px',
              boxShadow: '0 0 60px rgba(0,240,255,0.2), 0 0 120px rgba(0,240,255,0.08), inset 0 0 30px rgba(0,240,255,0.05)',
              border: '1px solid rgba(0,240,255,0.2)'
            }}
          >
            <motion.span 
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl"
              style={{ filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.5))' }}
            >
              💠
            </motion.span>
          </div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-black type-display"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF, #00F0FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.15))'
            }}
          >
            Line Free India
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[10px] mt-3 uppercase tracking-[5px] font-bold"
            style={{ color: '#52525B' }}
          >
            Universal SuperApp
          </motion.p>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 flex gap-2 justify-center"
          >
            {[0, 1, 2].map(i => (
              <motion.div 
                key={i}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#00F0FF' }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: '#0C0C0E' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 -z-10">
        <motion.div
          animate={{ x:['-5%','5%','-5%'], y:['-5%','5%','-5%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="ambient-orb cyan"
          style={{ top: '-15%', right: '-10%', width: '250px', height: '250px' }}
        />
      </div>

      <div className={`transition-all duration-700 w-full max-w-sm relative z-10 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {/* Logo */}
        <div className="mb-10 text-center">
          <div 
            className="w-20 h-20 flex items-center justify-center mx-auto mb-4 holo-card"
            style={{ 
              borderRadius: '28px',
              boxShadow: '0 0 40px rgba(0,240,255,0.15), inset 0 0 20px rgba(0,240,255,0.04)',
              border: '1px solid rgba(0,240,255,0.15)'
            }}
          >
            <span className="text-4xl" style={{ filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.4))' }}>💠</span>
          </div>
          <h1 
            className="text-3xl font-black type-display"
            style={{
              background: 'linear-gradient(135deg, #fff, #00F0FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Line Free India
          </h1>
          <p className="text-[10px] mt-1 uppercase tracking-[4px] font-bold" style={{ color: '#52525B' }}>Universal SuperApp</p>
        </div>

        <h2 className="text-center text-base font-black mb-6 uppercase tracking-[2px]" style={{ color: '#A1A1AA' }}>Select Language</h2>

        <div className="space-y-3">
          <button
            onClick={() => select('en')}
            className="w-full p-5 flex items-center gap-4 active:scale-[0.97] transition-all group neu-panel"
            style={{ borderRadius: '20px' }}
          >
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform"
              style={{ background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.1)' }}
            >
              <span className="text-3xl">🇬🇧</span>
            </div>
            <div className="text-left flex-1">
              <p className="font-black text-lg text-white tracking-wide">English</p>
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#52525B' }}>Continue in English</p>
            </div>
            <motion.span 
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ color: '#00F0FF', fontSize: '18px' }}
            >→</motion.span>
          </button>

          <button
            onClick={() => select('hi')}
            className="w-full p-5 flex items-center gap-4 active:scale-[0.97] transition-all group neu-panel"
            style={{ borderRadius: '20px' }}
          >
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.1)' }}
            >
              <span className="text-3xl">🇮🇳</span>
            </div>
            <div className="text-left flex-1">
              <p className="font-black text-lg text-white tracking-wide">हिंदी</p>
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#52525B' }}>हिंदी में जारी रखें</p>
            </div>
            <motion.span 
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              style={{ color: '#F59E0B', fontSize: '18px' }}
            >→</motion.span>
          </button>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: '✨', label: 'Premium', color: '#00F0FF' },
            { icon: '💆', label: 'Wellness', color: '#8B5CF6' },
            { icon: '⚡', label: 'Instant', color: '#10B981' },
          ].map((f, i) => (
            <div 
              key={i} 
              className="p-3 text-center neu-panel"
              style={{ borderRadius: '16px' }}
            >
              <span className="text-lg block" style={{ filter: `drop-shadow(0 0 8px ${f.color}50)` }}>{f.icon}</span>
              <p className="text-[8px] mt-1 font-black uppercase tracking-[2px]" style={{ color: '#52525B' }}>{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 shadow-2xl font-bold flex items-center gap-2 z-50"
            style={{
              borderRadius: '50px',
              background: 'rgba(16,185,129,0.9)',
              color: '#fff',
              boxShadow: '0 0 30px rgba(16,185,129,0.3)'
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
