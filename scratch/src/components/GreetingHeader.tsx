import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GreetingHeaderProps {
  name: string;
  avatar?: string;
  subtitle?: string;
}

export default function GreetingHeader({ name, avatar, subtitle }: GreetingHeaderProps) {
  const [greeting, setGreeting] = useState('');
  const [emoji, setEmoji] = useState('');

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 5) { setGreeting('Good Night'); setEmoji('🌙'); }
    else if (hr < 12) { setGreeting('Good Morning'); setEmoji('☀️'); }
    else if (hr < 17) { setGreeting('Good Afternoon'); setEmoji('🌤️'); }
    else if (hr < 21) { setGreeting('Good Evening'); setEmoji('🌅'); }
    else { setGreeting('Good Night'); setEmoji('🌙'); }
  }, []);

  const firstName = name?.split(' ')[0] || 'User';

  return (
    <div className="flex items-center justify-between">
      <div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 mb-1"
        >
          <div className="status-orb status-live" style={{ width: '6px', height: '6px' }} />
          <p className="text-[9px] font-black uppercase tracking-[3px]" style={{ color: '#00F0FF' }}>
            {greeting}
          </p>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-black tracking-tight text-white"
        >
          {firstName}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] mt-0.5 font-medium uppercase tracking-wider"
            style={{ color: '#52525B' }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="w-12 h-12 rounded-full overflow-hidden cursor-pointer"
        style={{
          border: '2px solid rgba(0,240,255,0.15)',
          boxShadow: '0 0 20px rgba(0,240,255,0.1)'
        }}
      >
        {avatar ? (
          <img src={avatar} className="w-12 h-12 object-cover" alt="" />
        ) : (
          <div 
            className="w-12 h-12 flex items-center justify-center text-lg font-black"
            style={{ background: 'rgba(0,240,255,0.08)', color: '#00F0FF' }}
          >
            {firstName[0]?.toUpperCase()}
          </div>
        )}
      </motion.div>
    </div>
  );
}
