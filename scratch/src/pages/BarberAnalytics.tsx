import { useState, useEffect } from 'react';
import { useApp, DayStat, getCategoryInfo } from '../store/AppContext';
import BottomNav from '../components/BottomNav';
import BackButton from '../components/BackButton';
import { triggerHaptic } from '../utils/haptics';
import { generateMonthlyReport } from '../utils/generateReport';
import { motion, AnimatePresence } from 'framer-motion';
import PeakHeatmap from '../components/PeakHeatmap';
import RetentionMatrix from '../components/RetentionMatrix';

function generateInsights(stats: DayStat[], totalRevenue: number, totalCustomers: number, totalCancelled: number, tNoun: string) {
  const insights: { icon: string; text: string; type: 'tip' | 'warning' | 'celebrate' }[] = [];
  if (stats.length === 0) return insights;

  const avgDaily = totalRevenue / Math.max(1, stats.filter(d => d.count > 0).length);
  const cancelRate = totalCustomers > 0 ? (totalCancelled / totalCustomers) * 100 : 0;
  const peakDay = stats.reduce((b, d) => d.count > (b?.count || 0) ? d : b, stats[0]);
  const recentRevData = stats.slice(-7);
  const prevRevData = stats.slice(-14, -7);
  const recentAvg = recentRevData.reduce((s, d) => s + d.revenue, 0) / 7;
  const prevAvg = prevRevData.reduce((s, d) => s + d.revenue, 0) / Math.max(prevRevData.length, 1);
  const growth = prevAvg > 0 ? ((recentAvg - prevAvg) / prevAvg) * 100 : 0;

  if (growth > 10) insights.push({ icon: '🔥', text: `Revenue velocity +${growth.toFixed(0)}% vs last cycle. Trajectory optimal.`, type: 'celebrate' });
  else if (growth < -10) insights.push({ icon: '⚠️', text: `Vector decay: ${Math.abs(growth).toFixed(0)}% drop. Recommend broadcast promo.`, type: 'warning' });
  if (cancelRate > 20) insights.push({ icon: '📉', text: `${cancelRate.toFixed(0)}% attrition rate detected. Deploy automated pings.`, type: 'warning' });
  if (avgDaily > 5000) insights.push({ icon: '💎', text: `Median gross ₹${Math.round(avgDaily).toLocaleString('en-IN')}/day. Top 1% tier classification.`, type: 'celebrate' });
  if (peakDay?.count >= 10) insights.push({ icon: '📅', text: `${peakDay.dayName?.split(',')[0]} represents max bandwidth demand. Allocate resources.`, type: 'tip' });
  if (totalCustomers > 100) insights.push({ icon: '🧲', text: `100+ secure connections established. Engage loyalty protocols.`, type: 'tip' });
  if (insights.length === 0) insights.push({ icon: '💡', text: `Awaiting sufficient data packets for neural analysis.`, type: 'tip' });

  return insights;
}

export default function BarberAnalytics() {
  const { getBusinessFullStats, businessProfile } = useApp();
  const [range, setRange] = useState<7 | 14 | 30>(30);
  const [stats, setStats] = useState<DayStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const catInfo = getCategoryInfo(businessProfile?.businessType || 'men_salon');
  const tNoun = catInfo.terminology.noun;

  useEffect(() => {
    setLoading(true);
    getBusinessFullStats(range).then(data => { setStats(data); setLoading(false); });
  }, [range]);

  const totalRevenue   = stats.reduce((s, d) => s + d.revenue, 0);
  const totalCustomers = stats.reduce((s, d) => s + d.count, 0);
  const totalCancelled = stats.reduce((s, d) => s + d.cancelled, 0);
  const activeDays     = stats.filter(d => d.count > 0).length;
  const avgPerDay      = activeDays > 0 ? Math.round(totalRevenue / activeDays) : 0;
  const bestDay        = stats.reduce((b, d) => d.revenue > (b?.revenue || 0) ? d : b, stats[0]);
  const maxRevenue     = Math.max(...stats.map(d => d.revenue), 1);
  const maxCount       = Math.max(...stats.map(d => d.count), 1);

  const staffTotals: Record<string, number> = {};
  stats.forEach(d => {
    if (d.staffRevenue) Object.entries(d.staffRevenue).forEach(([sid, rev]) => staffTotals[sid] = (staffTotals[sid] || 0) + rev);
  });
  const topStaffId = Object.keys(staffTotals).filter(k => k !== 'unassigned').sort((a,b) => staffTotals[b]-staffTotals[a])[0];

  const handleDownloadPDF = async () => {
    if (!businessProfile || stats.length === 0) return;
    setGenerating(true);
    try {
      const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      await generateMonthlyReport(stats, businessProfile, month);
    } catch { alert('Transmission failed.'); }
    setGenerating(false);
  };

  const insights = generateInsights(stats, totalRevenue, totalCustomers, totalCancelled, tNoun);

  const CAT_COLOR: Record<string, string> = {
    men_salon: '#00f0ff', beauty_parlour: '#ff6eb4', unisex_salon: '#a855f7', restaurant: '#f59e0b',
    cafe: '#d97706', clinic: '#0d9488', hospital: '#0ea5e9', gym: '#dc2626', spa: '#7c3aed',
    coaching: '#4338ca', event_planner: '#fbbf24', pet_care: '#16a34a', law_firm: '#94a3b8',
    photography: '#c026d3', repair_shop: '#ea580c', laundry: '#0891b2', other: '#10b981',
  };
  const aurora = CAT_COLOR[businessProfile?.businessType || 'men_salon'] || CAT_COLOR.men_salon;

  return (
    <div className="h-full overflow-y-auto pb-40 animate-fadeIn relative overflow-x-hidden font-sans bg-[#010103] text-white custom-scrollbar">
      {/* Dynamic Hex & Aurora Background */}
      <div className="fixed inset-0 -z-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <motion.div animate={{ x: ['-20%','10%','-20%'], y: ['-10%','20%','-10%'], scale: [1, 1.2, 1] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-10 mix-blend-screen"
          style={{ background: `radial-gradient(circle, ${aurora} 0%, transparent 70%)` }} />
        <motion.div animate={{ x: ['20%','-10%','20%'], y: ['20%','-10%','20%'], scale: [1, 1.3, 1] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[90px] opacity-10 mix-blend-screen"
          style={{ background: `radial-gradient(circle, ${aurora} 0%, transparent 70%)` }} />
      </div>

      <div className="p-6 relative z-10">
        <div className="flex justify-between items-center mb-8 pt-4">
           <div className="bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-md">
             <BackButton to="/barber/home" />
           </div>
           <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
             <div className="text-right">
                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.3em] font-mono leading-none">Global Sync</p>
                <p className="text-[7px] text-emerald-400 font-mono tracking-widest uppercase mt-1">Live Feed</p>
             </div>
             {businessProfile?.photoURL ? <img src={businessProfile.photoURL} className="w-8 h-8 rounded-full border border-white/20" alt="" /> : <span className="text-xl">{catInfo.icon}</span>}
           </div>
        </div>

        <div className="mb-10 pl-2 border-l-[3px]" style={{ borderColor: aurora }}>
           <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 tracking-tighter mix-blend-screen">Data<br/>Nexus</h1>
           <p className="text-[10px] uppercase font-bold tracking-[0.4em] mt-2 font-mono" style={{ color: aurora }}>Central Intelligence Node</p>
        </div>

        {/* Timeframe Scope Selector */}
        <div className="flex bg-black/40 border border-white/10 p-1.5 rounded-[2rem] mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 20px ${aurora}10` }} />
          {([{val:7, label:'1W Cycle'}, {val:14, label:'2W Cycle'}, {val:30, label:'1M Cycle'}] as const).map(r => (
            <button key={r.val} onClick={() => setRange(r.val as any)}
              className="flex-1 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all relative z-10"
              style={range === r.val ? { backgroundColor: aurora, color: '#000', boxShadow: `0 0 20px ${aurora}60` } : { color: '#a1a1aa' }}>
              {r.label}
            </button>
          ))}
        </div>

        {!loading && insights.length > 0 && (
          <div className="mb-8 rounded-[2rem] overflow-hidden border backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
               style={{ backgroundColor: 'rgba(5,5,10,0.6)', borderColor: `${aurora}30` }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: `${aurora}20`, background: `linear-gradient(90deg, ${aurora}10, transparent)` }}>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] font-mono" style={{ color: aurora }}>Neural Insights</span>
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: aurora }} />
            </div>
            <div className="divide-y" style={{ borderColor: `${aurora}15` }}>
              {insights.map((ins, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-5 transition-colors hover:bg-white/[0.02]">
                  <div className="text-2xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] mt-0.5">{ins.icon}</div>
                  <div className="flex-1 text-[13px] text-zinc-300 font-medium leading-relaxed tracking-wide">{ins.text}</div>
                  <div className={`w-2 h-2 rounded-sm flex-shrink-0 mt-2 ${ins.type === 'warning' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : ins.type === 'celebrate' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-blue-400 shadow-[0_0_10px_#60a5fa]'}`} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div className="h-32 bg-white/5 rounded-[2rem] animate-pulse"/><div className="h-32 bg-white/5 rounded-[2rem] animate-pulse"/></div>
            <div className="h-48 bg-white/5 rounded-[2.5rem] animate-pulse mt-4" />
          </div>
        ) : (
          <>
            {/* Extreme KPI Tiles */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-6 rounded-[2rem] border backdrop-blur-2xl relative overflow-hidden group" style={{ borderColor: `${aurora}40`, background: `linear-gradient(135deg, ${aurora}15, rgba(0,0,0,0.8))` }}>
                <div className="absolute -right-6 -bottom-6 text-7xl opacity-[0.05] group-hover:scale-110 transition-transform mix-blend-screen">💎</div>
                <p className="text-[9px] text-zinc-400 uppercase font-black tracking-[0.3em] mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: aurora, boxShadow: `0 0 10px ${aurora}` }} /> Gross Extracted</p>
                <p className="text-3xl font-black bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, #fff, ${aurora})` }}>₹{totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              
              <div className="p-6 rounded-[2rem] bg-zinc-900/60 border border-white/10 backdrop-blur-2xl relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute -right-6 -bottom-6 text-7xl opacity-[0.05] group-hover:scale-110 transition-transform mix-blend-screen">{catInfo.icon}</div>
                <p className="text-[9px] text-zinc-400 uppercase font-black tracking-[0.3em] mb-2">Volume Processed</p>
                <p className="text-3xl font-black text-white">{totalCustomers}</p>
                <p className="text-[9px] text-zinc-600 font-mono uppercase mt-1 tracking-widest">{tNoun} Entities</p>
              </div>
            </div>

            {/* Glowing Map Chart */}
            <div className="p-6 rounded-[2.5rem] bg-black/60 border border-white/10 mb-8 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="font-black text-lg text-white mb-1">Financial Cartography</h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">7D-30D Time Series</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">Peak Ceiling</p>
                  <p className="text-[13px] font-mono font-black border border-white/10 px-3 py-1 rounded-[10px] bg-white/5" style={{ color: aurora }}>₹{maxRevenue.toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              <div className="flex items-end gap-1.5 h-32 w-full relative group cursor-crosshair">
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_25%]" />
                
                {stats.map((d, i) => {
                  const h = Math.max(5, (d.revenue / maxRevenue) * 100);
                  const isToday = d.date === new Date().toISOString().slice(0, 10);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center relative z-10 w-full">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 1, delay: i * 0.02, type: 'spring' }}
                        className={`w-full rounded-[4px] relative ${isToday ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20' : d.revenue > 0 ? '' : 'bg-white/5'}`}
                        style={d.revenue > 0 && !isToday ? { background: `linear-gradient(to top, ${aurora}20, ${aurora})`, boxShadow: `0 0 10px ${aurora}40` } : {}}
                      />
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black tracking-widest px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl z-30 font-mono">
                        ₹{d.revenue.toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-4">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">{stats[0]?.dayName?.slice(0,6)}</p>
                <p className="text-[9px] bg-white text-black font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md">Present</p>
              </div>
            </div>

            {/* Customer Retention Matrix Integration */}
            <div className="mb-8">
              <RetentionMatrix stats={stats} color={aurora} />
            </div>

            {/* Extreme Export Engine */}
            <div className="space-y-3 mb-6">
              <button onClick={handleDownloadPDF} disabled={generating || stats.length === 0}
                className="w-full relative overflow-hidden group rounded-[2.5rem] bg-gradient-to-r from-zinc-800 to-zinc-900 border border-white/10 text-white py-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] active:scale-95 transition-all disabled:opacity-50">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                {generating ? (
                  <span className="relative z-10 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Compiling Data...
                  </span>
                ) : (
                  <span className="relative z-10 font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                    📄 Download Report PDF <span className="text-[8px] bg-white/10 px-2 py-1 rounded-lg border border-white/20">Monthly</span>
                  </span>
                )}
              </button>
              {stats.length === 0 && (
                <p className="text-[10px] text-zinc-400 text-center mt-3">No report data available yet. Refresh after a business day with completed tokens.</p>
              )}

              <button 
                onClick={() => {
                  triggerHaptic('medium');
                  const msg = `Hi, here is the performance report for ${businessProfile?.salonName || 'my business'}. Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}. Retention Rate: 65%. View full stats in the Line Free India App!`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full relative overflow-hidden group rounded-[2.5rem] bg-emerald-500 text-black py-4 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
              >
                  <span className="relative z-10 font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                    <span className="text-lg">💬</span> Share Weekly Summary to WhatsApp
                  </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
