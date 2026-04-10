import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, 
  Users, 
  Volume2, 
  VolumeX, 
  Clock, 
  Bell, 
  Play, 
  AlertCircle 
} from 'lucide-react';

const TVDashboard: React.FC = () => {
  const { user, businessProfile, getSalonTokens } = useApp();
  const [tokens, setTokens] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [lastAnnounced, setLastAnnounced] = useState<number | null>(null);
  const prevServingToken = useRef<number | null>(null);

  const fetchTokens = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const data = await getSalonTokens(user.uid, today);
    setTokens(data.sort((a,b) => a.tokenNumber - b.tokenNumber));
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 5000); // 5s polling for TV mode
    return () => clearInterval(interval);
  }, [user]);

  const serving = tokens.filter(t => t.status === 'serving').slice(0, 3);
  const waiting = tokens.filter(t => t.status === 'waiting').slice(0, 10);
  const currentTokenNumber = serving[0]?.tokenNumber || null;

  // Voice Announcement Logic
  useEffect(() => {
    if (currentTokenNumber && currentTokenNumber !== prevServingToken.current && !isMuted) {
      announceToken(currentTokenNumber);
      prevServingToken.current = currentTokenNumber;
    }
  }, [currentTokenNumber, isMuted]);

  const announceToken = (num: number) => {
    const text = `Token number ${num}, please proceed to the counter. टोकन नंबर ${num}, कृपया काउंटर पर आएं।`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  if (!businessProfile) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-10 font-[sans-serif] overflow-hidden">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
            <Tv size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-6xl font-black tracking-tight">{businessProfile.businessName}</h1>
            <p className="text-2xl text-white/50 font-medium mt-2 tracking-widest uppercase">Live Queue Status • लाइव टोकन जानकारी</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-6 rounded-3xl border transition-all ${isMuted ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-white/10 bg-white/5 text-white'}`}
          >
            {isMuted ? <VolumeX size={40} /> : <Volume2 size={40} />}
          </button>
          <div className="text-right">
            <p className="text-5xl font-mono font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-xl text-primary font-bold mt-1 tracking-widest">REAL-TIME</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12 h-[calc(100vh-250px)]">
        
        {/* LEFT: NOW SERVING (HERO AREA) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
          <div className="flex-1 bg-gradient-to-br from-green-600/20 to-green-900/10 rounded-[60px] border border-green-500/30 p-12 relative overflow-hidden flex flex-col items-center justify-center group">
            <div className="absolute top-0 right-0 p-12">
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="flex items-center gap-4 bg-green-500 text-black px-8 py-3 rounded-full font-black text-2xl uppercase tracking-widest"
               >
                 <Play fill="black" size={24} /> Serving
               </motion.div>
            </div>
            
            <h2 className="text-4xl text-green-400 font-black uppercase tracking-[10px] mb-8">Now Serving</h2>
            <div className="relative">
              <motion.span 
                key={currentTokenNumber}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[280px] font-black leading-none drop-shadow-[0_0_80px_rgba(34,197,94,0.4)]"
              >
                {currentTokenNumber || '--'}
              </motion.span>
            </div>
            <p className="text-4xl font-bold text-white/70 mt-4 h-12">
              {serving[0]?.customerName || 'Waiting for next...'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 flex items-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <Users size={40} />
              </div>
              <div>
                <p className="text-6xl font-black">{waiting.length}</p>
                <p className="text-xl text-white/40 uppercase font-black tracking-widest leading-none mt-2">Waiting</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 flex items-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                <Clock size={40} />
              </div>
              <div>
                <p className="text-6xl font-black">{waiting[0]?.estimatedWaitMinutes || '--'}</p>
                <p className="text-xl text-white/40 uppercase font-black tracking-widest leading-none mt-2">Next (min)</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: UP NEXT LIST */}
        <div className="col-span-12 lg:col-span-5 bg-white/5 border border-white/10 rounded-[60px] p-10 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Users size={24} />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-widest">Up Next (कतार)</h3>
          </div>

          <div className="flex-1 space-y-4 overflow-hidden">
            <AnimatePresence>
              {waiting.length > 0 ? (
                waiting.map((token, idx) => (
                  <motion.div
                    key={token.id}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex justify-between items-center p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.06] transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-black">
                        {token.tokenNumber}
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{token.customerName}</p>
                        <p className="text-sm text-white/30 uppercase font-black tracking-widest mt-1">
                          {token.selectedServices[0]?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-mono text-primary font-bold">~{token.estimatedWaitMinutes}m</p>
                      <p className="text-xs text-white/20 uppercase font-bold tracking-widest">Wait Time</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <AlertCircle size={80} className="mb-4" />
                  <p className="text-3xl font-black">No Tokens</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-3xl flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center animate-bounce">
              <Bell size={24} className="text-white" />
            </div>
            <p className="text-xl font-bold">
              Join queue from your phone by scanning the QR code at the entrance!
            </p>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default TVDashboard;
