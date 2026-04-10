import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp, TokenEntry, ServiceItem, getCategoryInfo } from '../store/AppContext';
import { getCategoryTheme } from '../config/categoryThemes';
import { useTheme } from '../hooks/useTheme';
import BottomNav from '../components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBolt, 
  FaChartBar, 
  FaBell,
  FaPowerOff,
  FaWalking,
  FaArrowRight,
  FaCoffee,
  FaStopCircle,
  FaPlayCircle,
  FaUsers,
  FaTimes,
  FaSun,
  FaMoon
} from 'react-icons/fa';

export default function BarberHome() {
  const { 
    businessProfile, 
    user, 
    signOutUser, 
    toggleSalonOpen, 
    toggleSalonBreak, 
    toggleSalonStop, 
    unreadCount, 
    addWalkInCustomer, 
    nextCustomer, 
    loading, 
    theme: globalTheme,
    toggleTheme
  } = useApp();
  
  const nav = useNavigate();
  const [todayTokens, setTodayTokens] = useState<TokenEntry[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInServices, setWalkInServices] = useState<ServiceItem[]>([]);
  const [addingWalkIn, setAddingWalkIn] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const catType = businessProfile?.businessType || 'men_salon';
  const theme = getCategoryTheme(catType);

  useTheme(catType);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tokens'), where('salonId', '==', user.uid), where('date', '==', today));
    const unsub = onSnapshot(q, (snap) => {
      const tks = snap.docs.map(d => ({ id: d.id, ...d.data() } as TokenEntry));
      tks.sort((a, b) => a.tokenNumber - b.tokenNumber);
      setTodayTokens(tks);
      setEarnings(tks.filter(t => t.status === 'done').reduce((a, c) => a + (c.totalPrice || 0), 0));
    }, err => console.error('Dashboard tokens:', err));
    return () => unsub();
  }, [user, today]);

  const handleLogout = async () => {
    await signOutUser();
    nav('/', { replace: true });
  };

  const bp = businessProfile;
  
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg p-6">
       <div className="w-16 h-16 bg-primary rounded-3xl animate-bounce flex items-center justify-center shadow-2xl">
          <span className="text-2xl">✨</span>
       </div>
       <p className="mt-4 text-text-dim font-black uppercase tracking-widest text-[10px]">Syncing Universe...</p>
    </div>
  );

  if (!bp) return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 shadow-2xl">🚀</div>
      <h2 className="text-3xl font-black text-text mb-4">Start Your Empire</h2>
      <p className="text-text-dim mb-10">Welcome to Line Free India. Setup your profile to start managing your business.</p>
      <button onClick={() => nav('/barber/setup')} className="w-full max-w-xs bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">Launch Base →</button>
    </div>
  );

  const waitingCount = todayTokens.filter(t => t.status === 'waiting').length;
  const servingToken = todayTokens.find(t => t.status === 'serving');
  const accent = theme.accentColor || '#10B981';

  return (
    <div className="h-full overflow-y-auto bg-bg text-text pb-32 overflow-x-hidden custom-scrollbar">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full opacity-10 blur-[120px]" style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-5 blur-[100px]" style={{ background: `radial-gradient(circle, #6366f1 0%, transparent 70%)` }} />
      </div>

      {/* 👑 Elite Aurora Mesh Background */}
      <div className="aurora-mesh-v2 opacity-10">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
      </div>

      <div className="p-6 pt-14">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="type-elite-label opacity-40">Command Center</span>
              <div className={`w-1.5 h-1.5 rounded-full ${bp.isOpen ? 'bg-primary animate-pulse' : 'bg-danger shadow-[0_0_10px_#f43f5e]'}`} />
            </div>
            <h1 className="text-4xl type-elite-display">
               {bp.businessName}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => { toggleTheme(); showFeedback("Cosmos Shifted"); }} className="w-14 h-14 elite-glass rounded-3xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 text-text-dim border-white/5">
              {globalTheme === 'dark' ? <FaSun className="text-primary" /> : <FaMoon className="text-primary" />}
            </button>
            <button onClick={() => nav('/barber/notifications')} className="relative w-14 h-14 elite-glass rounded-3xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-white/5">
              <FaBell className="text-text-dim" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-2xl text-[10px] flex items-center justify-center font-black text-black border-4 border-bg">{unreadCount}</span>}
            </button>
          </div>
        </div>

        {/* Action Feedback Toast */}
        <AnimatePresence>
           {feedback && (
             <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-10 left-1/2 -translate-x-1/2 z-[3000] elite-glass bg-white/5 border-primary/20 px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl flex items-center gap-3 text-primary">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" /> {feedback}
             </motion.div>
           )}
        </AnimatePresence>

        {/* Stats Dashboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="elite-glass rounded-[3rem] p-8 mb-10 spatial-perspective">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl elite-glass flex items-center justify-center shadow-lg border-primary/20 text-primary">
                 <FaBolt className="animate-pulse" />
              </div>
              <div>
                 <h3 className="type-elite-label opacity-60">System Intel</h3>
                 <p className="text-[10px] font-black text-primary uppercase tracking-tighter">AI Node Active</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[24px] font-black text-white/10 tracking-widest">v4.0</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div className="flex flex-col gap-1 spatial-card">
                <p className="type-elite-label text-[8px] opacity-40">Queue Status</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-5xl font-black type-elite-display tracking-tighter">{waitingCount}</span>
                   <span className="text-[10px] font-black text-primary uppercase">Elite</span>
                </div>
             </div>
             <div className="flex flex-col gap-1 spatial-card">
                <p className="type-elite-label text-[8px] opacity-40">Revenue Flow</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl type-elite-display text-primary tracking-tighter">₹{earnings}</span>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Universal Control Center */}
        <div className="space-y-6 mb-12">
           <div className="flex gap-4">
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => { await nextCustomer(); showFeedback(servingToken ? "Syncing Universe..." : "Transmission Sent"); }} 
                disabled={!servingToken && waitingCount === 0}
                className="flex-[2] h-24 bg-primary text-black rounded-[2.5rem] font-black text-xl shadow-[0_20px_40px_rgba(var(--color-primary-rgb),0.3)] flex items-center justify-center gap-4 disabled:opacity-30 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center gap-2">
                  {servingToken ? <><FaBolt /> FINISH CORE</> : <><FaArrowRight /> NEXT GUEST</>}
                </span>
              </motion.button>
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWalkInModal(true)} 
                className="flex-1 h-24 elite-glass rounded-[2.5rem] border-white/5 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                <FaWalking className="text-primary text-xl" />
                <span className="type-elite-label text-[7px] text-white">Guest +</span>
              </motion.button>
           </div>

           <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={async () => { await toggleSalonOpen(); showFeedback(`${bp.businessName} ${!bp.isOpen ? 'Opened' : 'Closed'}`); }} 
                className={`h-20 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 transition-all elite-glass ${bp.isOpen ? 'active ring-2 ring-primary/20' : 'opacity-40'}`}
              >
                <FaPowerOff className={bp.isOpen ? 'text-primary' : 'text-danger'} />
                <span className="type-elite-label text-[7px] text-white">{bp.isOpen ? 'Open' : 'Closed'}</span>
              </button>
              <button onClick={async () => { await toggleSalonBreak(); showFeedback(!bp.isBreak ? "Stasis Initiated" : "Stasis Ended"); }} className={`h-20 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 transition-all elite-glass ${bp.isBreak ? 'active ring-2 ring-warning/20' : 'opacity-40'}`}>
                 <FaCoffee className={bp.isBreak ? 'text-warning' : 'text-white/40'} />
                 <span className="type-elite-label text-[7px] text-white">{bp.isBreak ? 'Break' : 'Active'}</span>
              </button>
              <button onClick={async () => { await toggleSalonStop(); showFeedback(bp.isStopped ? "Token Resume" : "Token Pause"); }} className={`h-20 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 transition-all elite-glass ${bp.isStopped ? 'active ring-2 ring-danger/20' : 'opacity-40'}`}>
                 {bp.isStopped ? <FaPlayCircle className="text-primary" /> : <FaStopCircle className="text-danger" />}
                 <span className="type-elite-label text-[7px] text-white">{bp.isStopped ? 'Token Resume' : 'Token Pause'}</span>
              </button>
           </div>
        </div>

        {/* Business Tools Section */}
        <div className="mb-12">
          <h3 className="type-elite-label opacity-40 mb-6 px-1">Executive Suite</h3>
          <div className="grid grid-cols-2 gap-6">
             <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { triggerHaptic('medium'); nav('/barber/crm'); }} 
              className="elite-glass p-8 rounded-[3rem] border-white/5 flex flex-col items-center gap-4 transition-all shadow-xl active:scale-95 group relative overflow-hidden"
             >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
                   <FaUsers className="text-2xl" />
                </div>
                <span className="type-elite-label text-[9px] text-white">Customers</span>
             </motion.button>
             <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { triggerHaptic('medium'); nav('/barber/analytics'); }} 
              className="elite-glass p-8 rounded-[3rem] border-white/5 flex flex-col items-center gap-4 transition-all shadow-xl active:scale-95 group relative overflow-hidden"
             >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
                   <FaChartBar className="text-2xl" />
                </div>
                <span className="type-elite-label text-[9px] text-white">Analytics</span>
             </motion.button>
          </div>
          <div className="mt-8 px-1">
            <button 
              onClick={() => { triggerHaptic('light'); nav('/barber/tools'); }} 
              className="w-full py-6 elite-glass border-white/10 rounded-3xl type-elite-label text-[8px] text-primary hover:bg-primary/5 transition-all shadow-2xl"
            >
              Access Business OS Terminal →
            </button>
          </div>
        </div>

        {/* Operational Health Summary - Replaces "Live bala" section */}
        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-card-2 to-card border border-border mb-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4">
              <div className="w-2 h-2 rounded-full bg-success animate-ping" />
           </div>
           <h3 className="text-sm font-black uppercase tracking-widest text-text mb-6">Operational Continuity</h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Network Status</span>
                 <span className="text-[10px] font-black text-success uppercase tracking-widest">Connected</span>
              </div>
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-success" />
              </div>
              <p className="text-[9px] text-text-dim font-medium italic mt-4 opacity-50">
                All systems nominal. Customer sync interval: 5s. Cloud encryption active.
              </p>
           </div>
        </div>

        <button onClick={handleLogout} className="w-full p-5 rounded-2xl text-[10px] font-black uppercase tracking-[4px] text-danger bg-danger/5 border border-danger/20 active:scale-95 transition-transform mt-4">Safe Logout</button>
        <div className="h-32" />
      </div>

      {/* Walk-in Modal */}
      <AnimatePresence>
        {showWalkInModal && (
          <div className="fixed inset-0 z-[2000] flex items-end justify-center px-4 pb-24">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowWalkInModal(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative bg-card w-full max-w-lg rounded-[3rem] p-8 border border-border shadow-2xl overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-text">Walk-in Hub</h2>
                  <button onClick={() => setShowWalkInModal(false)} className="w-10 h-10 rounded-full bg-card-2 flex items-center justify-center hover:bg-danger/10 hover:text-danger transition-colors">
                    <FaTimes />
                  </button>
               </div>
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-text-dim mb-3 block tracking-widest">Guest Name</label>
                    <input 
                      value={walkInName} 
                      onChange={e => setWalkInName(e.target.value)} 
                      placeholder="Enter guest name..." 
                      className="w-full bg-card-2 border border-border rounded-2xl p-4 font-black outline-none focus:ring-2 ring-primary/30 text-text" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-text-dim mb-3 block tracking-widest">Service Bundle</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                       {(bp.services || []).map(s => {
                         const sel = walkInServices.some(ws => ws.id === s.id);
                         return (
                           <button 
                             key={s.id} 
                             onClick={() => setWalkInServices(sel ? walkInServices.filter(ws => ws.id !== s.id) : [...walkInServices, s])} 
                             className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${sel ? 'bg-primary border-transparent text-white shadow-lg' : 'bg-bg border-border text-text-dim hover:border-primary/20 hover:text-text'}`}
                           >
                             {s.name} <br/> <span className="text-[9px] opacity-60">₹{s.price}</span>
                           </button>
                         );
                       })}
                    </div>
                  </div>
                  <div className="pt-6 flex gap-3">
                     <button onClick={() => setShowWalkInModal(false)} className="flex-1 p-5 rounded-2xl bg-card-2 font-black text-xs uppercase tracking-widest text-text-dim">Discard</button>
                     <button 
                       disabled={!walkInName || !walkInServices.length || addingWalkIn} 
                       onClick={async () => {
                         setAddingWalkIn(true);
                         const tid = await addWalkInCustomer(walkInName, walkInServices);
                         setAddingWalkIn(false);
                         if (tid) {
                           showFeedback("Walk-in Added");
                           setShowWalkInModal(false);
                           setWalkInName('');
                           setWalkInServices([]);
                         } else {
                           showFeedback("Error Adding Guest");
                         }
                       }}
                       className="flex-[2] p-5 rounded-2xl bg-text text-bg font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-30 active:scale-95 transition-all"
                     >
                       {addingWalkIn ? 'Processing...' : 'Confirm Entry →'}
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
