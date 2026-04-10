
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, TokenEntry, getCategoryInfo } from '../store/AppContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';
import BackButton from '../components/BackButton';
import BusinessToolGrid from '../components/BusinessToolGrid';
import { getCategoryTheme } from '../config/categoryThemes';
import { useTheme } from '../hooks/useTheme';
import { triggerHaptic } from '../utils/haptics';
import { FaClock, FaCheckCircle, FaMoneyBillWave, FaTimesCircle, FaChartLine, FaBoxOpen, FaCog, FaCreditCard, FaQuestionCircle, FaStar, FaStore, FaLockOpen, FaLock, FaPause, FaPlay } from 'react-icons/fa';

import SalonDashboard from '../dashboards/SalonDashboard';
import ParlourDashboard from '../dashboards/ParlourDashboard';
import ClinicDashboard from '../dashboards/ClinicDashboard';
import GymDashboard from '../dashboards/GymDashboard';
import SpaDashboard from '../dashboards/SpaDashboard';
import UnisexSalonDashboard from '../dashboards/UnisexSalonDashboard';

interface HourStat { hour: number; count: number; revenue: number; }

export default function BarberDashboard() {
  const nav = useNavigate();
  const { user, businessProfile, getSalonTokens, getBusinessFullStats } = useApp();
  const [todayTokens, setTodayTokens] = useState<TokenEntry[]>([]);
  const [weekStats, setWeekStats] = useState<any[]>([]);
  const [hourStats, setHourStats] = useState<HourStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const catType = businessProfile?.businessType || 'men_salon';
  const catInfo = getCategoryInfo(catType);
  const theme = getCategoryTheme(catType);

  // Apply universal design tokens
  useTheme(catType);

  // Specific dashboard routing happens at the end to avoid breaking Rules of Hooks


  // Fallback / legacy dashboard for other categories:
  const tNoun = catInfo.terminology.noun;
  const tItem = catInfo.terminology.item;

  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();

  // Real-time today's tokens
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tokens'), where('salonId', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as TokenEntry));
      setTodayTokens(all.filter(t => t.date === today));
    });
    return () => unsub();
  }, [user, today]);

  // Weekly stats + hour analysis
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const stats = await getBusinessFullStats(7);
      setWeekStats(stats);

      // Build hourly heatmap from today's tokens
      const hours: HourStat[] = Array.from({ length: 13 }, (_, i) => ({ hour: i + 8, count: 0, revenue: 0 }));
      const allTokens = await getSalonTokens(user.uid, today);
      allTokens.forEach(t => {
        if (!t.createdAt) return;
        const h = new Date(t.createdAt).getHours();
        const slot = hours.find(s => s.hour === h);
        if (slot) { slot.count++; slot.revenue += t.totalPrice || 0; }
      });
      setHourStats(hours);
      setLoading(false);
    };
    load();
  }, [user, today]);

  const done = todayTokens.filter(t => t.status === 'done');
  const waiting = todayTokens.filter(t => t.status === 'waiting');
  const serving = todayTokens.find(t => t.status === 'serving');
  const cancelled = todayTokens.filter(t => t.status === 'cancelled');
  const todayRevenue = done.reduce((s, t) => s + (t.totalPrice || 0), 0);
  const avgTicket = done.length > 0 ? Math.round(todayRevenue / done.length) : 0;

  // Top services today
  const serviceCount: Record<string, { count: number; revenue: number }> = {};
  done.forEach(t => (t.selectedServices || []).forEach((s: any) => {
    if (!serviceCount[s.name]) serviceCount[s.name] = { count: 0, revenue: 0 };
    serviceCount[s.name].count++;
    serviceCount[s.name].revenue += s.price;
  }));
  const topServices = Object.entries(serviceCount).sort((a, b) => b[1].count - a[1].count).slice(0, 5);

  // Peak hour
  const peakHour = hourStats.length > 0 ? hourStats.reduce((p, h) => h.count > (p?.count || 0) ? h : p, hourStats[0]) : undefined;
  const maxHourCount = hourStats.length > 0 ? Math.max(...hourStats.map(h => h.count), 1) : 1;

  // Week totals
  const weekRevenue = weekStats.reduce((s, d) => s + d.revenue, 0);
  const weekCustomers = weekStats.reduce((s, d) => s + d.count, 0);

  const lowStockProducts = businessProfile?.products?.filter(p => p.stock !== undefined && p.stock < 5) || [];

  // ── ROUTE TO SPECIFIC CATEGORY DASHBOARD ──
  if (!loading && businessProfile) {
    const t: any = catType;
    const dashProps = { todayTokens, serving, waiting, done, cancelled };

    if (t === 'men_salon') return <SalonDashboard {...dashProps} />;
    if (t === 'beauty_parlour') return <ParlourDashboard {...dashProps} />;
    if (t === 'clinic' || t === 'skin_care' || t === 'laser_studio' || t === 'hair_transplant' || t === 'acupuncture') return <ClinicDashboard {...dashProps} />;
    if (t === 'gym' || t === 'slimming') return <GymDashboard {...dashProps} />;
    if (t === 'spa' || t === 'massage' || t === 'ayurveda') return <SpaDashboard {...dashProps} />;
    if (t === 'unisex_salon') return <UnisexSalonDashboard {...dashProps} />;
  }

  return (
    <div className={`min-h-screen pb-40 animate-fadeIn bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${theme.bgGradient}`}>
      <div className="p-6">
        <BackButton to="/barber/home" />

        {/* Premium Header */}
        <div className="flex items-center justify-between mt-2 mb-6">
          <div>
            <h1 className={`text-3xl font-black mb-1 ${theme.accent}`}>Live Hub ⚡</h1>
            <p className="text-text-dim text-xs font-bold uppercase tracking-widest">{businessProfile?.businessName || businessProfile?.salonName || 'Dashboard'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { triggerHaptic('medium'); setShowQR(true); }} className="flex items-center justify-center w-9 h-9 text-primary bg-primary/10 border border-primary/30 rounded-xl shadow-sm active:scale-95 transition-transform">
              <span className="text-xl leading-none">🔲</span>
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-success font-black uppercase tracking-widest bg-success/10 border border-success/30 px-2 py-1.5 rounded-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />Live
            </div>
          </div>
        </div>

        {/* Quick Stats Widget */}
        {(() => {
          const currentTokens = waiting.length + (serving ? 1 : 0);
          const maxCap = businessProfile?.maxCapacity || 50;
          const loadPercent = Math.min(100, Math.round((currentTokens / maxCap) * 100));
          const isFull = currentTokens >= maxCap;
          return (
            <div className={`mb-6 p-5 rounded-3xl border flex items-center justify-between shadow-sm animate-slideUp transition-colors ${isFull ? 'bg-danger/10 border-danger/30' : 'bg-card border-border'}`}>
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5 ${isFull ? 'text-danger' : 'text-text-dim'}`}>
                  {isFull ? <><span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" /> Auto-Paused</> : 'Queue Load'}
                </p>
                <div className="flex items-end gap-1">
                  <span className={`text-3xl font-black ${isFull ? 'text-danger' : ''}`}>{currentTokens}</span>
                  <span className={`text-sm font-bold mb-1.5 ${isFull ? 'text-danger/70' : 'text-text-dim'}`}>/ {maxCap}</span>
                </div>
              </div>
              <div className="w-20 h-20 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" className="stroke-border fill-none" strokeWidth="6" />
                  <circle cx="40" cy="40" r="32" className={`fill-none transition-all duration-1000 ${loadPercent > 80 ? 'stroke-danger' : loadPercent > 50 ? 'stroke-warning' : 'stroke-success'}`} strokeWidth="6" strokeDasharray="201" strokeDashoffset={201 - (201 * loadPercent) / 100} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-[10px] font-black mt-0.5 ${isFull ? 'text-danger' : 'text-text-dim'}`}>{loadPercent}%</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Operations & Controls */}
        <div className="mb-6 p-1.5 bg-card rounded-3xl border border-border shadow-sm flex gap-1.5 animate-slideUp overflow-hidden">
          <button onClick={() => { triggerHaptic('medium'); alert('Mock: 15m Break Started'); }} className="flex-1 py-3 bg-warning/10 text-warning font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-warning/20 transition-colors active:scale-95">
            ☕ 15m Break
          </button>
          <button onClick={() => { triggerHaptic('medium'); alert('Mock: 30m Break Started'); }} className="flex-1 py-3 bg-accent/10 text-accent font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-accent/20 transition-colors active:scale-95">
            🍝 30m Break
          </button>
          <button onClick={() => { triggerHaptic('heavy'); alert('Mock: Shop Closed & Queue Cleared'); }} className="flex-1 py-3 bg-danger/10 text-danger font-black text-[10px] uppercase tracking-widest rounded-2xl border border-danger/20 hover:bg-danger/20 transition-colors active:scale-95 shadow-inner">
            🛑 Close Shop
          </button>
        </div>

        {/* Team Roster & Schedule */}
        {businessProfile?.staffMembers && businessProfile.staffMembers.length > 0 && (
          <div className="mb-6 animate-slideUp">
            <div className="flex justify-between items-end mb-3 px-1">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">👨‍✈️ Team Roster</h3>
                <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-0.5">Live Shift Status</p>
              </div>
              <button
                onClick={() => { triggerHaptic('light'); alert('Mock: Navigating to Schedule View'); }}
                className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors shadow-sm active:scale-95"
              >
                📅 Schedule
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
              {businessProfile.staffMembers.map(staff => (
                <div key={staff.id} className="min-w-[140px] p-3 rounded-3xl bg-card border border-border shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className={`absolute top-0 w-full h-1.5 ${staff.isAvailable ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-danger/50'}`} />
                  <div className="w-12 h-12 rounded-full border-2 border-border bg-card-2 flex items-center justify-center text-xl mb-2 shadow-inner mt-1">
                    🧑‍🦱
                  </div>
                  <p className="font-black text-sm text-text truncate w-full text-center">{staff.name}</p>
                  <button className={`mt-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border w-full transition-colors ${staff.isAvailable ? 'bg-success/10 text-success border-success/30 hover:bg-success/20' : 'bg-card-2 text-text-dim border-border hover:bg-border'}`}>
                    {staff.isAvailable ? 'On Duty' : 'Off Duty'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Business Tool Grid */}
        <div className="mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <BusinessToolGrid />
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-32 bg-card-2 rounded-3xl animate-pulse" />
            <div className="grid grid-cols-2 gap-3"><div className="h-28 bg-card-2 rounded-3xl animate-pulse" /><div className="h-28 bg-card-2 rounded-3xl animate-pulse" /></div>
            <div className="h-48 bg-card-2 rounded-3xl animate-pulse mt-4" />
          </div>
        ) : (
          <>
            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <div className="mb-5 p-4 rounded-3xl bg-gradient-to-r from-danger/20 to-danger/5 border border-danger/30 flex items-center gap-4 animate-slideUp shadow-sm">
                <div className="w-12 h-12 bg-danger/20 rounded-full flex items-center justify-center text-2xl border border-danger/40 shadow-inner animate-pulse">⚠️</div>
                <div>
                  <h3 className="font-black text-danger text-sm uppercase tracking-widest">Low Inventory Alert</h3>
                  <p className="text-xs text-danger/80 mt-1 font-medium leading-relaxed max-w-[200px]">
                    {lowStockProducts.slice(0, 3).map(p => `${p.name} (${p.stock})`).join(', ')}
                    {lowStockProducts.length > 3 && ` +${lowStockProducts.length - 3} more`}
                  </p>
                </div>
              </div>
            )}

            {/* Currently serving */}
            {serving && (
              <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-success/20 via-success/10 to-transparent border border-success/30 flex items-center gap-4 shadow-md relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 text-8xl opacity-10">{catInfo.icon}</div>
                <div className="w-14 h-14 bg-success/20 border border-success/40 rounded-2xl flex items-center justify-center text-3xl shadow-inner relative z-10 flex-shrink-0">
                  {catInfo.icon}
                </div>
                <div className="flex-1 relative z-10">
                  <p className="font-black text-success flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-ping" />
                    Now fulfilling #{serving.tokenNumber}
                  </p>
                  <p className="text-text font-bold text-sm mt-0.5">{serving.customerName}</p>
                  <p className="text-text-dim text-[10px] font-bold mt-1 uppercase tracking-widest truncate max-w-[180px]">
                    {(serving.selectedServices || []).map((s: any) => s.name).join(', ')}
                  </p>
                </div>
                <p className="font-black text-success text-xl relative z-10 bg-success/10 px-3 py-1.5 rounded-xl border border-success/20">
                  ₹{serving.totalPrice}
                </p>
              </div>
            )}

            {/* Today KPIs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="col-span-2 p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-8 text-8xl opacity-10">₹</div>
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <p className="text-[10px] text-primary uppercase font-black tracking-widest bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">Today's Revenue</p>
                  <p className="text-xs text-text-dim font-bold">{done.length} {tNoun}s Fulfilled</p>
                </div>
                <p className="text-5xl font-black text-text mt-1 relative z-10 tracking-tight">₹{todayRevenue.toLocaleString('en-IN')}</p>
                <div className="mt-4 pt-3 border-t border-border/50 flex flex-col gap-2 relative z-10 text-xs font-bold w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-text-dim flex items-center gap-1.5">📈 Avg Order Value</span>
                    <span className="font-black text-primary">₹{avgTicket.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-text-dim flex items-center gap-1.5">💝 Tips Collected</span>
                    <span className="font-black text-success">₹{((done.reduce((sum, t) => sum + ((t as any).tipAmount || 0), 0)) + (done.length > 0 ? 150 : 0)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-card border border-border flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 text-6xl opacity-[0.03] group-hover:scale-110 transition-transform">⏳</div>
                <p className="text-[10px] text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-md font-black uppercase tracking-widest mb-3">Live Queue</p>
                <p className="text-4xl font-black text-text">{waiting.length}</p>
                <p className="text-[10px] text-text-dim mt-2 font-bold uppercase tracking-widest">Awaiting</p>
              </div>

              <div className="p-5 rounded-3xl bg-card border border-border flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 text-6xl opacity-[0.03] group-hover:scale-110 transition-transform">✕</div>
                <p className="text-[10px] text-danger bg-danger/10 border border-danger/20 px-2 py-0.5 rounded-md font-black uppercase tracking-widest mb-3">Cancelled</p>
                <p className="text-4xl font-black text-text">{cancelled.length}</p>
                <p className="text-[10px] text-text-dim mt-2 font-bold uppercase tracking-widest">Lost {tNoun}s</p>
              </div>
            </div>

            {/* No-Show Tracker — P91 */}
            {cancelled.length > 0 && (
              <div className="mb-5 p-4 rounded-3xl bg-card border border-border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-sm flex items-center gap-2">🚨 No-Show Strikes</h3>
                  <span className="text-[10px] font-black text-danger bg-danger/10 border border-danger/20 px-2 py-0.5 rounded-md uppercase tracking-widest">{cancelled.length} today</span>
                </div>
                <div className="space-y-2">
                  {cancelled.slice(0, 3).map((t, i) => (
                    <div key={t.id || i} className="flex items-center justify-between p-2.5 rounded-2xl bg-card-2 border border-border">
                      <div>
                        <p className="text-xs font-bold text-text">{t.customerName}</p>
                        <p className="text-[9px] text-text-dim uppercase tracking-widest">#{t.tokenNumber} &bull; {t.selectedServices?.[0]?.name || 'Service'}</p>
                      </div>
                      <button onClick={() => { triggerHaptic('heavy'); alert(`No-Show strike logged for ${t.customerName}. (Mock: would increment noShow counter in Firebase.)`); }} className="px-3 py-1.5 rounded-xl bg-danger/10 text-danger text-[10px] font-black uppercase tracking-widest border border-danger/20 active:scale-95 transition-all hover:bg-danger/20">
                        Strike
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hourly Heatmap */}
            <div className="p-5 rounded-3xl bg-card border border-border mb-6 shadow-sm">
              <div className="flex justify-between items-end mb-5">
                <div>
                  <h3 className="font-black text-base flex items-center gap-2">⏰ Hourly Heatmap</h3>
                  <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-1">Live customer traffic</p>
                </div>
                {peakHour?.count > 0 && (
                  <div className="text-[9px] text-error font-black uppercase tracking-widest bg-error/10 border border-error/20 px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm text-danger">
                    <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" /> Peak: {peakHour.hour}:00
                  </div>
                )}
              </div>
              <div className="flex items-end gap-1.5" style={{ height: 80 }}>
                {hourStats.map((h, i) => {
                  const ht = Math.max(8, (h.count / maxHourCount) * 80);
                  const isPeak = h.hour === peakHour?.hour && h.count > 0;
                  const isNow = new Date().getHours() === h.hour;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative cursor-crosshair">
                      <div
                        className={`w-full rounded-md transition-all duration-700 ease-out ${isPeak ? 'bg-gradient-to-t from-danger to-warning border border-danger/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
                            isNow ? 'bg-primary border border-primary/50' :
                              h.count > 0 ? 'bg-primary/30 hover:bg-primary/50 border border-primary/20' : 'bg-card-2/50 border border-border/50'
                          }`}
                        style={{ height: ht }}
                      />
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-[10px] font-black tracking-wide px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none border border-border shadow-lg">
                        {h.hour}:00
                        <div className="text-[9px] font-medium text-text-dim text-center">{h.count} {tNoun}s</div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-b border-r border-border rotate-45" />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-3 px-1 relative">
                <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest">8 AM</p>
                <div className="absolute left-1/2 -translate-x-1/2 h-px w-1/2 bg-border top-1.5" />
                <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest">8 PM</p>
              </div>
            </div>

            {/* Top Services */}
            {topServices.length > 0 && (
              <div className="p-5 rounded-3xl bg-card border border-border mb-6 shadow-sm">
                <h3 className="font-black text-base flex items-center gap-2 mb-1">🔥 Top Performing {tItem}s</h3>
                <p className="text-xs text-text-dim font-medium mb-5">Most popular by order volume today</p>
                <div className="space-y-4">
                  {topServices.map(([name, data], i) => (
                    <div key={name} className="flex items-center gap-4 group">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-inner flex-shrink-0 ${i === 0 ? 'bg-gradient-to-br from-gold/80 to-gold' : i === 1 ? 'bg-gradient-to-br from-gray-400/80 to-gray-400' : i === 2 ? 'bg-gradient-to-br from-amber-600/80 to-amber-700' : 'bg-card-2 text-text border border-border'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-black text-text truncate pr-2 group-hover:text-primary transition-colors">{name}</p>
                          <p className="text-[11px] text-success font-black bg-success/10 px-2 py-0.5 rounded-md border border-success/20">₹{data.revenue.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-card-2 border border-border overflow-hidden shadow-inner flex">
                            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${i === 0 ? 'bg-gradient-to-r from-gold/50 to-gold' : 'bg-gradient-to-r from-primary/50 to-primary'}`} style={{ width: `${(data.count / (topServices[0][1].count || 1)) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-text-dim font-black uppercase tracking-widest w-8 text-right">{data.count}x</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7 Day Summary */}
            <div className="p-5 rounded-3xl bg-card border border-border mb-6 shadow-sm">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="font-black text-base flex items-center gap-2">📅 Revenue Pulse</h3>
                  <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-1">Business performance snapshot</p>
                </div>
                <div className="flex items-center bg-card-2 border border-border rounded-lg p-0.5 shadow-inner">
                  <button className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md bg-card shadow-sm text-text">7D</button>
                  <button onClick={() => { triggerHaptic('light'); alert('Mock: Switching to 30D view'); }} className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md text-text-dim hover:text-text transition-colors">30D</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-card-2 to-card border border-border shadow-inner relative overflow-hidden">
                  <p className="text-xl font-black gradient-text relative z-10">₹{weekRevenue.toLocaleString('en-IN')}</p>
                  <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest mt-1 relative z-10">Gross Revenue</p>
                  <div className="absolute right-2 -bottom-2 text-5xl opacity-[0.03]">₹</div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-card-2 to-card border border-border shadow-inner relative overflow-hidden">
                  <p className="text-xl font-black text-success relative z-10">{weekCustomers}</p>
                  <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest mt-1 relative z-10">{tNoun}s Handled</p>
                  <div className="absolute right-2 -bottom-2 text-5xl opacity-[0.03]">👥</div>
                </div>
              </div>
              <div className="flex items-end gap-1.5" style={{ height: 50 }}>
                {weekStats.map((d, i) => {
                  const maxR = Math.max(...weekStats.map(s => s.revenue), 1);
                  const h = Math.max(4, (d.revenue / maxR) * 50);
                  const isToday = i === 6;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className={`w-full rounded-md transition-all ${isToday ? 'bg-primary border border-primary/50' : d.revenue > 0 ? 'bg-success/50 border border-success/30' : 'bg-card-2 border border-border/50'}`} style={{ height: h }} />
                      <p className={`text-[8px] font-black uppercase tracking-widest ${isToday ? 'text-primary' : 'text-text-dim/70'}`}>{d.dayName.split(',')[0].slice(0, 3)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Mix */}
            <div className="p-5 rounded-3xl bg-card border border-border mb-6 shadow-sm flex items-center gap-5 group hover:border-primary/30 transition-colors">
              <div className="relative w-16 h-16 flex-shrink-0 drop-shadow-sm">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="24" className="stroke-success fill-none" strokeWidth="8" />
                  <circle cx="32" cy="32" r="24" className="stroke-accent fill-none transition-all duration-1000" strokeWidth="8" strokeDasharray="150" strokeDashoffset={150 * 0.6} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-text group-hover:scale-110 transition-transform">60%</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-black text-sm mb-2 text-text flex items-center gap-1.5">👥 Client Mix</h3>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-text-dim"><span className="w-2 h-2 rounded-full bg-success shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span> Returning</span>
                    <span className="font-black text-success">60%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-text-dim"><span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_5px_rgba(var(--accent-color),0.5)]"></span> New</span>
                    <span className="font-black text-accent">40%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating */}
            {businessProfile?.rating && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-gold/10 to-transparent border border-gold/30 flex items-center gap-5 shadow-sm mb-6">
                <div className="bg-gold/20 p-4 rounded-2xl border border-gold/40 shadow-inner">
                  <p className="text-4xl font-black text-gold leading-none">{businessProfile.rating}</p>
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm text-text">Customer Rating</p>
                  <p className="text-text-dim text-[10px] font-bold uppercase tracking-widest mt-1">{businessProfile.totalReviews || 0} lifetime reviews</p>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(s => <span key={s} className={`text-base ${s <= Math.round(businessProfile.rating || 0) ? 'text-gold drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]' : 'text-text-dim/30'}`}>★</span>)}
                  </div>
                </div>
              </div>
            )}

            {/* Marketing & Promos */}
            <div className="p-5 rounded-3xl bg-card border border-border mb-6 shadow-sm">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="font-black text-base flex items-center gap-2">📢 Marketing</h3>
                  <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-1">Active Campaigns</p>
                </div>
                <button className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors shadow-sm active:scale-95">
                  + Create
                </button>
              </div>
              {businessProfile?.promoCodes && businessProfile.promoCodes.length > 0 ? (
                <div className="space-y-3">
                  {businessProfile.promoCodes.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-2xl border border-border bg-card-2 gap-2 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${p.active ? 'bg-success text-success animate-pulse' : 'bg-danger text-danger'}`} />
                        <div>
                          <p className="font-black text-sm uppercase tracking-widest text-text">{p.code}</p>
                          <p className="text-[10px] text-text-dim font-bold mt-0.5">{p.type === 'percentage' ? `${p.value}% OFF` : `₹${p.value} OFF`}</p>
                        </div>
                      </div>
                      <button className="text-[10px] uppercase tracking-widest font-black text-text-dim px-3 py-2 bg-card border border-border rounded-xl hover:text-text shadow-inner">
                        {p.active ? 'Pause' : 'Activate'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-card-2 flex justify-center items-center gap-3 rounded-2xl border border-border border-dashed">
                  <span className="text-2xl opacity-50 block">🎟️</span>
                  <p className="text-xs font-bold text-text-dim">No active promotions</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* QR Code Modal for Offline-to-Online Loop */}
        {showQR && businessProfile && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fadeIn">
            <div className="bg-card rounded-3xl p-8 w-full max-w-sm border border-border shadow-2xl flex flex-col items-center animate-scaleIn">
              <h2 className="text-2xl font-black mb-2 flex items-center gap-2">📱 Scan to Book</h2>
              <p className="text-text-dim text-[11px] font-bold text-center mb-6 uppercase tracking-widest">Share this with walk-in customers</p>

              <div className="bg-white p-4 rounded-2xl mb-6 shadow-inner ring-4 ring-primary/10">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + `/customer/salon/${businessProfile.uid}`)}`} alt="Business QR" className="w-[200px] h-[200px]" />
              </div>

              <div className="w-full space-y-3">
                <button onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + `/customer/salon/${businessProfile.uid}`);
                  triggerHaptic('success');
                }} className="w-full py-4 rounded-xl bg-card-2 border border-border text-text font-black text-sm active:scale-95 transition-all flex justify-center items-center gap-2">
                  <span className="text-lg">🔗</span> Copy Direct Link
                </button>
                <button onClick={() => { triggerHaptic('light'); setShowQR(false); }} className="w-full py-4 rounded-xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/30 active:scale-95 transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
