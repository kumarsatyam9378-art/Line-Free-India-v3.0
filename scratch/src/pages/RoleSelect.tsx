import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import FloatingThemeToggle from '../components/FloatingThemeToggle';
import { motion } from 'framer-motion';
import { FaUser, FaBriefcase, FaArrowRight } from 'react-icons/fa';

export default function RoleSelect() {
  const { setRole, t } = useApp();
  const nav = useNavigate();

  const select = (r: 'customer' | 'business') => {
    setRole(r);
    if (r === 'customer') nav('/customer/auth');
    else nav('/barber/auth');
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <FloatingThemeToggle />

      {/* Modern Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] rounded-full opacity-20 blur-[130px] bg-primary/20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] rounded-full opacity-20 blur-[130px] bg-secondary/20" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Brand Header */}
        <div className="mb-12 text-center group">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/20 relative overflow-hidden"
          >
            <span className="text-4xl font-black text-white relative z-10">L</span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity animate-skipLine" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl font-black tracking-tighter text-text mb-4"
          >
            Line Free India
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-[10px] font-black uppercase tracking-[6px] text-text-dim"
          >
            The Future of Business
          </motion.p>
        </div>

        {/* Action Grid */}
        <div className="w-full space-y-4">
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => select('customer')}
            className="w-full bg-card hover:bg-card-2 p-6 rounded-[2rem] border border-border flex items-center gap-5 transition-all group shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
               <FaUser />
            </div>
            <div className="flex-1 text-left">
               <p className="font-black text-lg text-text tracking-wide">Customer</p>
               <p className="text-[10px] text-text-dim font-bold uppercase tracking-wider">Join queues remotely</p>
            </div>
            <FaArrowRight className="text-text-dim group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </motion.button>

          <motion.button
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => select('business')}
            className="w-full bg-card hover:bg-card-2 p-6 rounded-[2rem] border border-border flex items-center gap-5 transition-all group shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary text-xl shadow-inner group-hover:bg-secondary group-hover:text-white transition-all">
               <FaBriefcase />
            </div>
            <div className="flex-1 text-left">
               <p className="font-black text-lg text-text tracking-wide">Business</p>
               <p className="text-[10px] text-text-dim font-bold uppercase tracking-wider">Manage your empire</p>
            </div>
            <FaArrowRight className="text-text-dim group-hover:text-secondary group-hover:translate-x-1 transition-all" />
          </motion.button>
        </div>

        {/* Footer Stats Strip */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.8 }}
           className="mt-12 py-4 px-8 bg-card-2 rounded-full border border-border flex items-center gap-8 shadow-sm"
        >
           <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-text">CLOUD</span>
              <span className="text-[8px] text-text-dim uppercase tracking-tighter">Status</span>
           </div>
           <div className="w-px h-6 bg-border" />
           <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-text">v3.0</span>
              <span className="text-[8px] text-text-dim uppercase tracking-tighter">Onyx</span>
           </div>
           <div className="w-px h-6 bg-border" />
           <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-text">200+</span>
              <span className="text-[8px] text-text-dim uppercase tracking-tighter">Industries</span>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
