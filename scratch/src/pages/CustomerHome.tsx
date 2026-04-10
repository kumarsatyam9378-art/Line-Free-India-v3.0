import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import BottomNav from '../components/BottomNav';
import { triggerHaptic } from '../utils/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_BUSINESS_NICHE_ROWS } from '../config/businessRegistry.data';
import { FaSearch, FaMagic, FaHeart, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import FlashDealTimer from '../components/FlashDealTimer';

export default function CustomerHome() {
  const { user, customerProfile, allSalons, isFavorite, toggleFavorite } = useApp();
  const nav = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const filteredSalons = useMemo(() => {
    let list = [...allSalons];
    
    // 1. Category Filtering
    if (activeCategory !== 'all') {
      const niche = ALL_BUSINESS_NICHE_ROWS.find(n => n.id === activeCategory);
      if (niche) {
        // Match via template type (e.g. 'men_salon') OR the raw businessType matching the niche id
        list = list.filter(b => 
          b.businessType === niche.template || 
          b.businessType === activeCategory ||
          b.businessType === niche.id
        );
      } else {
        // Direct category match
        list = list.filter(b => b.businessType === activeCategory);
      }
    }

    // 2. Search Query Filtering
    if (searchQuery) {
      list = list.filter(b =>
        b.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.businessType?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 3. Advanced Sorting (Trends)
    list.sort((a, b) => {
      // Prioritize Open status
      if (a.isOpen && !b.isOpen) return -1;
      if (!a.isOpen && b.isOpen) return 1;

      // Prioritize Popularity (Rating * Count)
      const aScore = (a.rating || 0) * (a.totalReviews || 0);
      const bScore = (b.rating || 0) * (b.totalReviews || 0);
      if (bScore !== aScore) return bScore - aScore;

      // Fallback: Newest first
      return ((b.createdAt as number) || 0) - ((a.createdAt as number) || 0);
    });

    return list;
  }, [allSalons, activeCategory, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-bg text-text font-sans selection:bg-primary/30 relative overflow-hidden">
      {/* 👑 Elite Aurora Mesh Background */}
      <div className="aurora-mesh-v2">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
      </div>

      <div className="fixed inset-0 pointer-events-none -z-10 bg-black/40" />

      {/* ── Fixed Header ── */}
      <div className="px-6 pt-14 pb-6 sticky top-0 z-30 bg-bg/80 backdrop-blur-xl border-b border-white/5 flex-shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-1"
            >
              <span className="type-elite-label">{greeting}</span>
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="text-4xl type-elite-display mb-1"
            >
              {customerProfile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Explorer'}
            </motion.h1>
          </div>
          <motion.button 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => nav('/customer/profile')}
            className="w-14 h-14 rounded-3xl p-[2px] bg-gradient-to-tr from-white/20 to-transparent elite-glass spatial-card"
          >
            <div className="w-full h-full rounded-[20px] bg-[#0a0a0b] flex items-center justify-center overflow-hidden">
              {(customerProfile?.photoURL || user?.photoURL)
                ? <img src={customerProfile?.photoURL || user?.photoURL || ''} className="w-full h-full object-cover" alt="" />
                : <span className="text-2xl text-primary">⚡</span>}
            </div>
          </motion.button>
        </div>

        {/* Premium Search */}
        {/* 💎 Elite Search Interaction */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="relative group spatial-perspective"
        >
          <div className="absolute -inset-1 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
          <div className="relative elite-glass border-white/10 overflow-hidden shadow-2xl" style={{ borderRadius: '24px' }}>
             <div className="flex items-center px-6">
               <FaSearch className="text-primary text-lg pointer-events-none" />
               <input
                type="text"
                placeholder="Find premium excellence..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-5 px-4 text-sm font-bold text-white outline-none placeholder:text-white/20"
              />
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary/40 text-[10px] font-black tracking-tighter elite-glass">
                CMD+K
              </div>
             </div>
          </div>
        </motion.div>
      </div>
      
      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-40">
        {/* 📡 Live Pulse Feed (Following) */}
        {customerProfile?.following && customerProfile.following.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-6 my-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] shadow-inner border border-primary/20">📡</div>
              <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-text-dim">Pulse Feed: Following</h2>
            </div>
            <div className="flex flex-col gap-2">
              {allSalons.filter(s => customerProfile.following?.includes(s.uid) && s.announcement).map((followed, fi) => (
                <motion.button 
                  key={followed.uid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: fi * 0.1 }}
                  onClick={() => nav(`/customer/salon/${followed.uid}`)}
                  className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-xl p-3 flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                    <img src={followed.photoURL} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[9px] font-black text-text uppercase tracking-widest truncate mb-0.5">{followed.businessName}</p>
                    <p className="text-[10px] text-text-dim truncate italic opacity-60">"{followed.announcement}"</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        <div className="space-y-10 pt-4">
          {/* 🚀 Discovery Section */}
          <section className="px-5 spatial-perspective">
            <div className="flex items-baseline justify-between mb-6 px-1">
              <h2 className="type-elite-label opacity-40">Discovery Portal</h2>
              <button 
                onClick={() => nav('/customer/search')} 
                className="text-[9px] font-black text-primary/60 uppercase tracking-widest hover:text-primary transition-colors"
              >
                Unlock Universe →
              </button>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-8 custom-scrollbar no-scrollbar -mx-5 px-5" style={{ touchAction: 'pan-x' }}>
              <motion.button
                whileHover={{ y: -8, rotateX: 5 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => { triggerHaptic('light'); setActiveCategory('all'); }}
                className="flex-shrink-0 w-24 flex flex-col items-center gap-3"
              >
                <div className={`w-20 h-24 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all duration-500 elite-glass spatial-card ${activeCategory === 'all' ? 'border-primary ring-4 ring-primary/20 bg-primary/10 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.3)]' : 'hover:border-white/20 shadow-xl'}`}>
                  <div className={`text-3xl ${activeCategory === 'all' ? 'text-primary' : 'text-white/40'}`}>
                    <FaMagic className={activeCategory === 'all' ? 'animate-pulse' : ''} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest text-center px-1 ${activeCategory === 'all' ? 'text-primary' : 'text-white/40'}`}>Trends</span>
                </div>
              </motion.button>

              {ALL_BUSINESS_NICHE_ROWS.map((niche, i) => {
                const isActive = activeCategory === niche.id;
                return (
                  <motion.button
                    whileHover={{ y: -8, rotateX: 5 }}
                    whileTap={{ scale: 0.92 }}
                    key={niche.id}
                    onClick={() => { triggerHaptic('light'); setActiveCategory(niche.id); }}
                    className="flex-shrink-0 w-24 flex flex-col items-center gap-3"
                  >
                    <div className={`w-20 h-24 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all duration-500 elite-glass spatial-card ${isActive ? 'border-primary ring-4 ring-primary/20 bg-primary/10 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.3)]' : 'hover:border-white/20 shadow-xl'}`}>
                      <div className={`text-3xl ${isActive ? 'text-primary' : 'text-white/40'}`}>
                        {niche.icon}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest text-center truncate w-full px-2 ${isActive ? 'text-primary' : 'text-white/40'}`}>
                        {niche.label.split('/')[0]}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* 💎 Featured Aurora Glass Card */}
          {!searchQuery && activeCategory === 'all' && filteredSalons.length > 0 && (
            <section className="px-5">
               <FlashDealTimer />
               <motion.div
                layoutId="featuredSalon"
                onClick={() => nav(`/customer/salon/${filteredSalons[0].uid}`)}
                className="relative mt-6 rounded-[2rem] overflow-hidden h-72 group cursor-pointer border border-white/5"
              >
                <img
                  src={filteredSalons[0].bannerImageURL || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200"}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[20s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-4">
                     <div className="px-3 py-1 bg-primary/20 backdrop-blur-md rounded-full text-[9px] font-black text-primary border border-primary/30 uppercase tracking-[0.15em]">DIAMOND PARTNER</div>
                     <div className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-full text-[9px] font-black text-white flex items-center gap-1.5 border border-white/10 uppercase tracking-[0.15em]">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                       Live Now
                     </div>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-tight transition-transform group-hover:translate-x-1">{filteredSalons[0].businessName}</h3>
                  <div className="flex items-center gap-3 text-text-dim text-[10px] font-black uppercase tracking-widest opacity-80">
                    <span>📍 {filteredSalons[0].location || 'Universal Platform'}</span>
                    <span>•</span>
                    <span className="text-primary">⭐ {filteredSalons[0].rating || 5.0}</span>
                  </div>
                </div>
              </motion.div>
            </section>
          )}

          {/* 🏢 Business Catalog */}
          <section className="px-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                {searchQuery ? 'Search Results' : 'Recommended'}
              </h2>
              <p className="text-[9px] font-bold text-text-dim uppercase tracking-[0.15em]">
                {filteredSalons.length} Businesses Found
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredSalons.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="py-20 text-center bg-white/[0.02] border border-white/[0.05] rounded-[2rem]"
                  >
                    <FaMagic className="text-4xl mx-auto mb-4 text-primary opacity-20" />
                    <p className="font-black text-white text-lg">Nothing here yet</p>
                    <p className="text-[10px] text-text-dim mt-2 tracking-widest uppercase font-black opacity-50">Try adjusting yours filters</p>
                  </motion.div>
                ) : (
                  filteredSalons.map((business, i) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      key={business.uid}
                      onClick={() => nav(`/customer/salon/${business.uid}`)}
                      className="group relative elite-glass hover:bg-white/[0.08] border-white/5 hover:border-white/20 p-5 flex gap-6 active:scale-[0.98] transition-all cursor-pointer rounded-[2.5rem] spatial-perspective"
                    >
                      <div className="w-28 h-28 rounded-[2rem] bg-black/40 flex-shrink-0 overflow-hidden relative border border-white/10 shadow-2xl spatial-card">
                        {business.bannerImageURL
                          ? <img src={business.bannerImageURL} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt="" />
                          : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">✨</div>}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="bg-primary/20 backdrop-blur-md border border-primary/40 px-2 py-0.5 rounded-lg text-[9px] font-black flex items-center justify-center gap-1 text-primary">
                            ⭐ {business.rating || 4.9}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-black text-white text-lg leading-tight tracking-tight group-hover:text-primary transition-colors truncate uppercase">{business.businessName}</h3>
                          <button
                            onClick={e => { e.stopPropagation(); toggleFavorite(business.uid); }}
                            className={`flex-shrink-0 w-10 h-10 rounded-2xl elite-glass border-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-125 ${isFavorite(business.uid) ? 'text-primary' : 'text-white/20'}`}
                          >
                            {isFavorite(business.uid) ? '❤️' : '🤍'}
                          </button>
                        </div>
                        <p className="type-elite-label opacity-40 text-[8px] mb-4 truncate italic">📍 {business.location || 'Universal Platform'}</p>
                        
                        <div className="flex items-center gap-3">
                           <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl elite-glass border-white/5 text-[8px] font-black uppercase tracking-widest ${business.isOpen ? 'text-primary' : 'text-white/20'}`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${business.isOpen ? 'bg-primary shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.6)] animate-pulse' : 'bg-white/20'}`} />
                             {business.isOpen ? 'Online' : 'Offline'}
                           </div>
                           {business.services?.length > 0 && (
                             <div className="px-4 py-1.5 elite-glass bg-white/[0.02] border-white/5 rounded-xl text-white/60 text-[8px] font-black uppercase tracking-widest">
                                ₹{Math.min(...business.services.map((s: any) => s.price))} +
                             </div>
                           )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
