import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, getCategoryInfo, BUSINESS_CATEGORIES } from '../store/AppContext';
import BottomNav from '../components/BottomNav';
import SalonsMap from '../components/SalonsMap';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerSearch() {
  const { allSalons, isFavorite, getUserLocation } = useApp();
  const nav = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);

  // Haversine formula
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  useEffect(() => {
    getUserLocation().then(loc => { if(loc) setUserLoc(loc); });
  }, []);

  const getFiltered = () => {
    let results = [...allSalons];

    // Text search
    if (query.trim()) {
      const lower = query.toLowerCase();
      results = results.filter(s => {
        const catInfo = getCategoryInfo(s.businessType);
        return s.businessName?.toLowerCase().includes(lower) ||
          s.name?.toLowerCase().includes(lower) ||
          s.location?.toLowerCase().includes(lower) ||
          catInfo.label.toLowerCase().includes(lower) ||
          s.services?.some(svc => svc.name.toLowerCase().includes(lower));
      });
    }

    // Filter Logic
    if (filter === 'open') {
      results = results.filter(s => s.isOpen && !s.isBreak && !s.isStopped);
    } else if (filter === 'lightning') {
      // Open Now + Wait < 15 mins
      results = results.filter(s => s.isOpen && !s.isBreak && !s.isStopped && (s.queueDelayMinutes || 0) < 15);
    } else if (filter === 'trending') {
      // High rating + Busy (totalTokensToday > 0)
      results = results.filter(s => (s.rating || 0) > 4.2 || (s.totalTokensToday || 0) > 5)
        .sort((a, b) => (b.totalTokensToday || 0) - (a.totalTokensToday || 0));
    } else if (filter === 'rated') {
      results = results.filter(s => (s.rating || 0) > 0).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filter === 'favorites') {
      results = results.filter(s => isFavorite(s.uid));
    } else if (filter === 'nearby' && userLoc) {
      results = results.filter(s => s.lat && s.lng).map(s => {
        const dist = getDistanceKm(userLoc.lat, userLoc.lng, s.lat!, s.lng!);
        return { ...s, tempDistance: dist };
      }).sort((a: any, b: any) => a.tempDistance - b.tempDistance);
    } else if (filter !== 'all') {
      results = results.filter(s => s.businessType === filter);
    }

    return results;
  };

  const toggleCompare = (id: string) => {
    triggerHaptic('light');
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const results = getFiltered();

  return (
    <div className="h-full flex flex-col bg-bg text-text font-sans relative overflow-hidden">
      {/* Premium Sticky Header */}
      <div className="z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-2xl safe-top">
        <div className="p-6 pb-2">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-between items-center mb-6"
          >
            <div>
              <h1 className="text-3xl font-black text-text bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Explore</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-dim mt-1">Discover the best nearby</p>
            </div>
            <div className="flex bg-card-2 border border-white/5 rounded-2xl p-1 shadow-inner">
              <button 
                onClick={() => setViewMode('list')} 
                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-text-dim'}`}
              >
                📋
              </button>
              <button 
                onClick={() => setViewMode('map')} 
                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${viewMode === 'map' ? 'bg-primary text-white shadow-lg' : 'text-text-dim'}`}
              >
                🗺️
              </button>
            </div>
          </motion.div>
          
          {/* Robust Search Option */}
          <div className="relative group mb-2">
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative flex gap-3">
              <div className="flex-1 relative">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search name, category, or service..."
                  className="w-full bg-card border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xl placeholder:text-text-dim/50"
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl filter grayscale group-focus-within:grayscale-0 transition-all">🔍</span>
                {query && (
                  <button 
                    onClick={() => setQuery('')} 
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 bg-card-2 rounded-full flex items-center justify-center text-[10px] text-text border border-white/10"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Chips - Enhanced Interactivity */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-4 -mx-6 px-6">
            {[
              { id: 'all' as const, label: '🎯 All', count: allSalons.length },
              { id: 'nearby' as const, label: '📍 Nearby', count: userLoc ? allSalons.filter(s => s.lat && s.lng).length : 0 },
              { id: 'lightning' as const, label: '⚡ Lightning', count: allSalons.filter(s => s.isOpen && (s.queueDelayMinutes || 0) < 15).length },
              { id: 'trending' as const, label: '🔥 Trending', count: allSalons.filter(s => (s.rating || 0) > 4.2).length },
              { id: 'open' as const, label: '🟢 Open Now', count: allSalons.filter(s => s.isOpen && !s.isBreak && !s.isStopped).length },
              { id: 'rated' as const, label: '⭐ Top Rated', count: allSalons.filter(s => (s.rating || 0) > 0).length },
              ...BUSINESS_CATEGORIES.map(c => ({ id: c.id, label: `${c.icon} ${c.label}`, count: allSalons.filter(s => s.businessType === c.id).length }))
            ].map(f => (
              <motion.button
                key={f.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (f.id === 'nearby' && !userLoc) {
                    getUserLocation().then(loc => { if(loc) { setUserLoc(loc); setFilter('nearby'); } });
                  } else {
                    setFilter(f.id);
                  }
                }}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 border ${
                  filter === f.id 
                    ? 'bg-primary border-transparent text-white shadow-[0_10px_20px_rgba(16,185,129,0.3)]' 
                    : 'bg-card border-white/5 text-text-dim hover:border-primary/30 shadow-sm'
                }`}
              >
                {f.label} 
                <span className={`opacity-60 font-medium`}>{f.count}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area - Scroll Managed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="p-6 pb-40">
          {viewMode === 'map' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[calc(100vh-340px)] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative"
            >
              <SalonsMap salons={results} userLoc={userLoc} />
            </motion.div>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-between items-center mb-2 px-1">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
                <div className="w-10 h-[1px] bg-white/10" />
              </div>

              {/* Smart Recommendations Section */}
              {filter === 'all' && !query && (
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent text-xl shadow-lg border border-accent/20">✨</div>
                    <div>
                      <h3 className="text-sm font-black text-text">Recommended for You</h3>
                      <p className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em]">Based on your preferences</p>
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
                    {allSalons.filter(s => (s.rating || 0) > 4.5 || isFavorite(s.uid)).slice(0, 5).map((rec, ri) => (
                      <motion.button 
                        key={rec.uid}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: ri * 0.1 }}
                        onClick={() => nav(`/customer/salon/${rec.uid}`)}
                        className="flex-shrink-0 w-64 bg-card rounded-[2.5rem] p-4 border border-white/5 relative overflow-hidden group shadow-2xl"
                      >
                         <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                           ⭐ {rec.rating || 5.0}
                         </div>
                         <div className="w-full h-32 rounded-3xl overflow-hidden mb-4 relative">
                            <img src={rec.bannerImageURL || rec.photoURL} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3">
                               <p className="text-[10px] font-black text-primary uppercase tracking-widest">{getCategoryInfo(rec.businessType).label}</p>
                            </div>
                         </div>
                         <h4 className="font-black text-text truncate group-hover:text-primary transition-colors">{rec.businessName}</h4>
                         <p className="text-[10px] text-text-dim/60 truncate italic mt-1">Perfect match for you!</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {results.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-24 bg-card/30 rounded-[3rem] border border-white/5 shadow-inner"
                  >
                    <span className="text-8xl block mb-6 animate-float">🛸</span>
                    <p className="text-2xl font-black text-text">No matches found</p>
                    <p className="text-text-dim text-sm mt-2 mb-10">Try adjusting your search criteria</p>
                    <button onClick={() => { setQuery(''); setFilter('all'); }} className="px-10 py-5 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">
                      Reset Discovery
                    </button>
                  </motion.div>
                ) : (
                  (() => {
                    // Locality Grouping
                    const grouped: Record<string, any[]> = {};
                    results.forEach(s => {
                      const locality = s.location?.split(',')[0] || 'Nearby';
                      if (!grouped[locality]) grouped[locality] = [];
                      grouped[locality].push(s);
                    });

                    return Object.entries(grouped).map(([locality, salons], gIdx) => (
                      <div key={locality} className="mb-10 animate-slideUp" style={{ animationDelay: `${gIdx * 0.1}s` }}>
                        <h3 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-text-dim px-2 mb-6 opacity-60">
                          <span className="w-8 h-[1px] bg-white/10" />
                          📍 {locality} ({salons.length})
                        </h3>
                        <div className="space-y-5">
                          {salons.map((business, i) => {
                            const catInfo = getCategoryInfo(business.businessType);
                            const isTrending = (business.totalTokensToday || 0) > 5 || (business.rating || 0) > 4.5;
                            return (
                              <motion.button
                                key={business.uid}
                                onClick={() => nav(`/customer/salon/${business.uid}`)}
                                className="w-full p-5 rounded-[2.5rem] bg-card border border-white/5 text-left flex items-start gap-4 hover:border-primary/40 transition-all active:scale-[0.98] shadow-2xl group hover:shadow-primary/5 relative overflow-hidden"
                              >
                                {isTrending && (
                                  <div className="absolute top-0 right-0 py-1.5 px-3 bg-gradient-to-l from-orange-500 to-red-600 rounded-bl-2xl text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                    <span className="animate-pulse">🔥</span> TRENDING
                                  </div>
                                )}
                                <div className="w-20 h-20 rounded-2xl bg-card-2 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10 relative">
                                  {business.bannerImageURL ? (
                                    <img src={business.bannerImageURL} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                  ) : <span className="text-3xl">{catInfo.icon}</span>}
                                  {!business.isOpen && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                      <span className="text-[8px] font-black text-white bg-danger/80 px-2 py-0.5 rounded uppercase">Closed</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 pr-4">
                                  <p className="font-black text-text group-hover:text-primary transition-colors truncate">{business.businessName}</p>
                                  <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest mb-2">{catInfo.label}</p>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-1 text-[10px] font-black text-gold bg-gold/5 px-2 py-0.5 rounded-lg border border-gold/10">⭐ {business.rating || 'New'}</div>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-text-dim"><span className="text-accent text-xs">⏳</span> {business.queueDelayMinutes || 0}m</div>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-text-dim opacity-40 truncate">📍 {business.location?.split(',')[0]}</div>
                                  </div>
                                </div>
                                <div className="self-center flex flex-col items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-card-2 border border-white/5 flex items-center justify-center text-text-dim group-hover:bg-primary group-hover:text-white transition-all">›</div>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleCompare(business.uid); }}
                                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${compareList.includes(business.uid) ? 'bg-accent border-transparent text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-card-2 border-white/10 text-text-dim'}`}
                                  >
                                    <span className="text-xs">{compareList.includes(business.uid) ? '✅' : '⚖️'}</span>
                                  </button>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Compare Selection HUD */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 inset-x-6 z-[1100]"
          >
             <div className="bg-card/80 backdrop-blur-2xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center justify-between">
                <div className="flex gap-2">
                   {compareList.map(id => {
                     const b = allSalons.find(s => s.uid === id);
                     return (
                       <div key={id} className="relative w-12 h-12 rounded-xl bg-card-2 border border-white/10 overflow-hidden shadow-lg">
                          <img src={b?.bannerImageURL || b?.photoURL} className="w-full h-full object-cover" alt="" />
                          <button onClick={() => toggleCompare(id)} className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full text-[8px] text-white flex items-center justify-center">✕</button>
                       </div>
                     );
                   })}
                   {compareList.length < 2 && (
                     <div className="w-12 h-12 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-text-dim/40 text-[8px] font-black uppercase text-center leading-tight">
                       Pick<br/>One More
                     </div>
                   )}
                </div>
                
                <button 
                  disabled={compareList.length < 2}
                  onClick={() => { triggerHaptic('success'); nav(`/customer/compare?id1=${compareList[0]}&id2=${compareList[1]}`); }}
                  className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${compareList.length === 2 ? 'bg-primary text-white shadow-[0_10px_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-text-dim/40'}`}
                >
                  {compareList.length === 2 ? 'Compare Now →' : 'Select 2 to Compare'}
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <BottomNav />
    </div>
  );
}
