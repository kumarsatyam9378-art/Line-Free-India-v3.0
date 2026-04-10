import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'intro' | 'speed' | 'reveal'>('intro');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('speed'), 800);
    const timer2 = setTimeout(() => setPhase('reveal'), 2500);
    const timer3 = setTimeout(onComplete, 4500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[10000] bg-[#020203] flex items-center justify-center overflow-hidden">
      {/* Background Particles / Energy Field */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={phase === 'speed' ? {
              x: [null, window.innerWidth / 2],
              y: [null, window.innerHeight / 2],
              opacity: [0, 1, 0],
              scale: [0, 4, 0]
            } : { opacity: 0 }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              delay: Math.random() * 2,
              ease: "circIn" 
            }}
            className="absolute w-1 h-1 bg-primary rounded-full blur-[1px]"
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-white italic shadow-[0_20px_60px_rgba(16,185,129,0.4)]">
              L
            </div>
          </motion.div>
        )}

        {phase === 'speed' && (
          <motion.div
            key="speed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="relative">
              {/* Sonic Boom Rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.1, opacity: 0 }}
                  animate={{ scale: 4, opacity: [0, 0.4, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  className="absolute inset-0 border-2 border-primary rounded-full"
                />
              ))}
              <div className="text-6xl font-black italic text-white tracking-tighter flex items-center gap-1">
                <motion.span animate={{ x: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 0.1 }}>S</motion.span>
                <motion.span animate={{ x: [10, -10, 10] }} transition={{ repeat: Infinity, duration: 0.1 }}>K</motion.span>
                <motion.span animate={{ x: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 0.1 }}>I</motion.span>
                <motion.span animate={{ x: [10, -10, 10] }} transition={{ repeat: Infinity, duration: 0.1 }}>P</motion.span>
              </div>
            </div>
            <p className="mt-8 text-primary font-black uppercase tracking-[1em] animate-pulse">Wait Time 0s</p>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-[3rem] flex items-center justify-center mb-12 shadow-[0_30px_90px_rgba(16,185,129,0.5)] border border-white/20"
            >
              <span className="text-7xl font-black text-white italic tracking-tighter">L</span>
            </motion.div>
            
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-5xl font-black text-white tracking-[0.15em]">LINE FREE</h1>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-10 bg-primary px-8 flex items-center justify-center rounded-2xl shadow-xl overflow-hidden"
              >
                <span className="text-sm font-black text-white tracking-[0.6em] whitespace-nowrap">INDIA</span>
              </motion.div>
            </div>

            <p className="mt-16 text-[10px] font-bold text-text-dim uppercase tracking-[0.5em] opacity-60">Bina Line ke Zindagi Fine</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed Streaks */}
      <div className="absolute inset-0 pointer-events-none">
        {phase === 'speed' && [...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: '-100%', y: `${Math.random() * 100}%` }}
            animate={{ x: '200%' }}
            transition={{ 
              duration: 0.4 + Math.random() * 0.4, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 1
            }}
            className="absolute h-1 w-64 bg-gradient-to-r from-transparent via-primary to-transparent opacity-40 rounded-full blur-[1px]"
          />
        ))}
      </div>
    </div>
  );
}
