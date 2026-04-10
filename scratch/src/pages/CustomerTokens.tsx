import BottomNav from '../components/BottomNav';
import TokenCard from '../components/TokenCard';
import { motion, AnimatePresence } from 'framer-motion';

type LiveToken = TokenEntry & {
  livePos: number;
  liveWait: number;
  liveServing: number | null;
  peopleAhead: number;
  appAhead: number;
  walkinAhead: number;
  alertSent?: boolean;
};

function buildReminderMsg(token: TokenEntry, pos: number, wait: number, termInfo: any) {
  const t = termInfo.terminology;
  return [
    `🔔 *Line Free India — Status Alert*`,
    ``,
    `📍 *${token.salonName}*`,
    `🎫 Your ${t.noun}: *#${token.tokenNumber}*`,
    pos === 1 ? `✅ *YOU'RE NEXT! Head there NOW!*` : `⚡ *Only ${pos - 1} ${pos - 1 === 1 ? 'person' : 'people'} ahead of you!*`,
    wait > 0 ? `⏰ Est. ~${wait} ${t.unit}` : ``,
    `📋 ${token.selectedServices.map(s => s.name).join(', ')}`,
    `💰 ₹${token.totalPrice}`,
    ``,
    `_Powered by Line Free India 💄_`,
  ].filter(Boolean).join('\n');
}

export default function CustomerTokens() {
  const { user, getCustomerTokens, cancelToken, pauseToken, resumeToken, transferToken, allSalons } = useApp();
  const nav = useNavigate();
  const [baseTokens, setBaseTokens] = useState<TokenEntry[]>([]);
  const [liveData, setLiveData] = useState<Map<string, LiveToken>>(new Map());
  const [loading, setLoading] = useState(true);
  const alertedRef = useRef<Set<string>>(new Set());
  const salonUnsubs = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getCustomerTokens(user.uid).then(tokens => {
      setBaseTokens(tokens.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    const active = baseTokens.filter(t => t.status === 'waiting' || t.status === 'serving');

    salonUnsubs.current.forEach((unsub, sid) => {
      if (!active.find(t => t.salonId === sid)) { unsub(); salonUnsubs.current.delete(sid); }
    });

    active.forEach(myToken => {
      if (salonUnsubs.current.has(myToken.salonId)) return;
      const q = query(collection(db, 'tokens'), where('salonId', '==', myToken.salonId), where('date', '==', myToken.date));
      const unsub = onSnapshot(q, snap => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as TokenEntry));

        setBaseTokens(prev => prev.map(t => {
          const updated = all.find(a => a.id === t.id);
          return updated ? { ...t, status: updated.status } : t;
        }));

        const serving = all.find(t => t.status === 'serving');
        const waitingBefore = all.filter(t => {
          if (t.status !== 'waiting') return false;
          if (t.id === myToken.id) return false;
          if (t.isTatkal && !myToken.isTatkal) return true;
          if (!t.isTatkal && myToken.isTatkal) return false;
          return t.tokenNumber < myToken.tokenNumber;
        });
        const pos = waitingBefore.length + 1;
        const wait = waitingBefore.reduce((s, t) => s + (t.totalTime * (t.groupSize || 1)), 0);
        const peopleAhead = waitingBefore.reduce((sum, t) => sum + (t.groupSize || 1), 0);
        const appAhead = waitingBefore.filter(t => t.customerId !== 'walk-in').reduce((sum, t) => sum + (t.groupSize || 1), 0);
        const walkinAhead = waitingBefore.filter(t => t.customerId === 'walk-in').reduce((sum, t) => sum + (t.groupSize || 1), 0);

        setLiveData(prev => {
          const next = new Map(prev);
          next.set(myToken.id!, { ...myToken, livePos: pos, liveWait: wait, liveServing: serving?.tokenNumber ?? null, peopleAhead, appAhead, walkinAhead });
          return next;
        });

        if (pos <= 2 && myToken.status === 'waiting' && !alertedRef.current.has(myToken.id!)) {
          alertedRef.current.add(myToken.id!);
          const business = allSalons.find(s => s.uid === myToken.salonId);
          const termInfo = getCategoryInfo(business?.businessType || 'men_salon');
          const msg = buildReminderMsg(myToken, pos, wait, termInfo);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`🔔 ${pos === 1 ? "You're NEXT!" : "Almost your turn!"}`, { body: `${myToken.salonName} — ${termInfo.terminology.noun} #${myToken.tokenNumber}`, icon: '/favicon.ico' });
          }
          setTimeout(() => {
            if (confirm(`⚡ ${pos === 1 ? "You're NEXT!" : "Only " + (pos-1) + " person ahead!"} at ${myToken.salonName}!\n\nSend yourself a WhatsApp reminder?`)) {
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
            }
          }, 500);
        }
      });
      salonUnsubs.current.set(myToken.salonId, unsub);
    });

    return () => {};
  }, [baseTokens, allSalons]);

  useEffect(() => () => { salonUnsubs.current.forEach(u => u()); }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleCancel = async (token: TokenEntry) => {
    const tatkalWarning = token.isTatkal ? '\n\n⚠️ Note: The Tatkal Priority fee is non-refundable.' : '';
    if (!confirm(`Are you sure you want to cancel your booking at ${token.salonName}?${tatkalWarning}`)) return;
    await cancelToken(token.id!);
    setBaseTokens(prev => prev.map(t => t.id === token.id ? { ...t, status: 'cancelled' } : t));
  };

  const handleSendReminder = (token: TokenEntry) => {
    const live = liveData.get(token.id!);
    const business = allSalons.find(s => s.uid === token.salonId);
    const termInfo = getCategoryInfo(business?.businessType || 'men_salon');
    const msg = buildReminderMsg(token, live?.livePos ?? 1, live?.liveWait ?? token.estimatedWaitMinutes, termInfo);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareToken = (token: TokenEntry) => {
    const live = liveData.get(token.id!);
    const business = allSalons.find(s => s.uid === token.salonId);
    const termInfo = getCategoryInfo(business?.businessType || 'men_salon');
    const msg = [
      `🎫 *My Line Free India ${termInfo.terminology.noun}*`,
      `${termInfo.icon} ${token.salonName}`,
      `🔢 ID #${token.tokenNumber}`,
      `📅 ${token.date}`,
      live ? `👥 ${live.peopleAhead} ahead · ~${live.liveWait}${termInfo.terminology.unit} wait` : `⏰ ~${token.estimatedWaitMinutes}${termInfo.terminology.unit}`,
      `💰 ₹${token.totalPrice}`,
      `📋 ${token.selectedServices.map(s => s.name).join(', ')}`,
    ].join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePauseToggle = async (token: TokenEntry) => {
    if (token.isPaused) {
      if (!confirm(`Resume your place in the queue?`)) return;
      await resumeToken(token.id!);
      setBaseTokens(prev => prev.map(t => t.id === token.id ? { ...t, isPaused: false } : t));
    } else {
      if (!confirm(`Hold your place in the queue until you're ready to resume?`)) return;
      await pauseToken(token.id!);
      setBaseTokens(prev => prev.map(t => t.id === token.id ? { ...t, isPaused: true } : t));
    }
  };

  const handleTransfer = async (token: TokenEntry) => {
    const friendPhone = prompt('Enter the phone number of the person you want to transfer this token to:');
    if (!friendPhone) return;
    const friendName = prompt('Enter their name:');
    if (!friendName) return;
    if (confirm(`Transfer token to ${friendName} (${friendPhone})?`)) {
      await transferToken(token.id!, friendPhone, friendName);
      alert('Token transferred successfully!');
    }
  };


  const active = baseTokens.filter(t => t.status === 'waiting' || t.status === 'serving');
  const past = baseTokens.filter(t => t.status === 'done' || t.status === 'cancelled');

  const formatWait = (min: number) => {
    if (min <= 0) return 'Any moment!';
    if (min >= 60) return `${Math.floor(min/60)}h ${min%60}m`;
    return `${min} min`;
  };

  const [showCardId, setShowCardId] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto pb-40 animate-fadeIn custom-scrollbar">
      <div className="p-6">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold">Activity</h1>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-success font-medium px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />Live Data
            </span>
          </div>
        </div>
        <p className="text-text-dim text-sm mb-5">Real-time status · Auto alert when near</p>

        {loading ? (
          <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-48 rounded-3xl bg-card animate-pulse shadow-sm" />)}</div>
        ) : baseTokens.length === 0 ? (
          <div className="text-center py-24 bg-card-2 rounded-3xl border border-border mt-4">
            <span className="text-6xl block mb-4 animate-float opacity-70">📋</span>
            <p className="font-bold text-lg">No activity today</p>
            <p className="text-text-dim text-sm mt-1 mb-6 px-4">Book a service, cafe, or clinic to see your live queue here.</p>
            <button onClick={() => nav('/customer/search')} className="btn-primary px-8 shadow-lg shadow-primary/30">Explore Businesses</button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active */}
            {active.length > 0 && (
              <div>
                <h2 className="font-black text-xs mb-4 flex items-center gap-2 uppercase tracking-[3px] text-text-dim px-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />Live Activity ({active.length})
                </h2>
                <div className="space-y-4">
                  {active.map(token => {
                    const live = liveData.get(token.id!);
                    const isServing = token.status === 'serving';
                    const business = allSalons.find(s => s.uid === token.salonId);
                    const termInfo = getCategoryInfo(business?.businessType || 'men_salon');
                    const tLabels = termInfo.terminology;

                    return (
                      <div key={token.id} className={`rounded-3xl overflow-hidden border shadow-sm ${isServing ? 'border-success' : 'border-primary/30'}`}>
                        {/* Top gradient bar */}
                        <div className={`h-1.5 w-full ${isServing ? 'bg-success' : 'bg-gradient-to-r from-primary via-accent to-primary animate-gradient'}`} />

                        <div className="p-5 bg-card">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-5">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xl">{termInfo.icon}</span>
                                <p className="font-bold text-lg">{token.salonName}</p>
                              </div>
                              <p className="text-text-dim text-xs font-medium ml-7">📅 {token.date}</p>
                              {token.isTatkal && (
                                <div className="mt-2 ml-7 w-max px-2.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-[10px] text-gold font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse shadow-sm">
                                  <span>🚀</span> Priority Access
                                </div>
                              )}
                            </div>
                            <div className={`text-center p-3 rounded-2xl border ${isServing ? 'bg-success/10 border-success/30' : 'bg-primary/5 border-primary/20 shadow-inner'}`}>
                              <p className="text-[9px] text-text-dim font-black uppercase tracking-widest">{tLabels.noun}</p>
                              <p className={`text-3xl font-black ${isServing ? 'text-success' : 'gradient-text'}`}>#{token.tokenNumber}</p>
                            </div>
                          </div>

                          {/* SERVING */}
                          {isServing && (
                            <div className="mb-5 p-4 rounded-2xl bg-success/15 border border-success/40 flex items-center gap-4 shadow-sm animate-pulse-glow">
                              <div className="relative">
                                <span className="text-4xl">{termInfo.icon}</span>
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-success ring-4 ring-success/20 animate-ping" />
                              </div>
                              <div>
                                <p className="font-black text-success text-lg drop-shadow-sm">It's YOUR TURN!</p>
                                <p className="text-success/80 text-xs font-bold mt-0.5">Please check-in now 🏃</p>
                              </div>
                            </div>
                          )}

                          {/* WAITING — Live Queue */}
                          {!isServing && (
                            <div className="mb-5">
                              {live ? (
                                <>
                                  <div className="p-5 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_60%)] border border-primary/20 mb-4 text-center shadow-[0_0_40px_rgba(0,240,255,0.05)_inset] relative overflow-hidden backdrop-blur-md">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none -translate-y-10 translate-x-10" />
                                     <div className="absolute top-2 left-2 flex items-center justify-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-sm">
                                        <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-[#00F0FF] opacity-90">Live Wait Predictor</span>
                                     </div>
                                    <p className="text-primary mt-4 text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Estimated Wait</p>
                                    <p className="text-5xl font-black gradient-text drop-shadow-sm">{formatWait(token.isPaused ? 0 : live.liveWait)}</p>
                                    {token.isPaused ? (
                                      <p className="text-warning text-sm font-black mt-2 animate-pulse bg-warning/10 w-max mx-auto px-3 py-1 rounded-full border border-warning/30">⏸️ Queue Paused</p>
                                    ) : live.peopleAhead === 0 ? (
                                      <p className="text-success text-sm font-black mt-2 animate-pulse bg-success/10 w-max mx-auto px-3 py-1 rounded-full border border-success/30">🔔 You're next!</p>
                                    ) : (
                                      <p className="text-text-dim text-xs font-medium mt-2 bg-card/50 backdrop-blur-sm w-max mx-auto px-3 py-1 rounded-full border border-border shadow-sm">
                                          {live.peopleAhead} {live.peopleAhead === 1 ? 'party' : 'parties'} ahead
                                      </p>
                                    )}
                                  </div>

                                  <div className="p-4 rounded-3xl bg-card-2/50 border border-border shadow-sm">
                                    <div className="flex justify-between text-[11px] mb-1 font-bold tracking-wide">
                                      <span className="text-text-dim uppercase">Now serving</span>
                                      <span className="text-primary uppercase">Your {tLabels.noun}</span>
                                    </div>
                                    <div className="flex justify-between font-black text-base mb-3">
                                      <span className="text-text-dim">#{live.liveServing ?? '—'}</span>
                                      <span className="gradient-text drop-shadow-sm">#{token.tokenNumber}</span>
                                    </div>
                                    <div className="w-full h-3 rounded-full bg-card overflow-hidden relative shadow-inner border border-border/50">
                                      <div
                                        className={`h-full rounded-full transition-all duration-1000 ${token.isTatkal ? 'bg-gradient-to-r from-gold to-warning' : 'bg-gradient-to-r from-primary to-accent'}`}
                                        style={{ width: `${Math.max(5, 100 - (live.peopleAhead / Math.max(1, live.livePos - 1 || 1)) * 100)}%` }}
                                      />
                                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8L3N2Zz4=')] opacity-20 animate-slideX"></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-text-dim mt-2 font-medium">
                                      <span>Position #{live.livePos} in queue</span>
                                    </div>
                                    {token.status === 'waiting' && (
                                      <div className="flex justify-center mt-3 gap-2 border-t border-border pt-3">
                                        <button onClick={() => handlePauseToggle(token)} className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${token.isPaused ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-card border border-border text-text-dim hover:text-warning'}`}>
                                          {token.isPaused ? '▶ Resume' : '⏸ Hold Place'}
                                        </button>
                                        <button onClick={() => handleTransfer(token)} className="flex-1 py-2 rounded-xl bg-card border border-border text-xs font-bold uppercase tracking-wider text-text-dim hover:text-white transition-all">
                                          🤝 Transfer
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="mt-4 bg-card border border-border rounded-3xl p-3 shadow-sm relative overflow-hidden flex items-center h-16">
                                    <div className="absolute left-3 text-2xl bg-card-2 p-1.5 rounded-full shadow-inner z-30 ring-1 ring-border">{termInfo.icon}</div>
                                    <div className="absolute left-10 right-0 flex items-center justify-start overflow-hidden pl-7 pt-2 pb-2 mask-image:linear-gradient(to_right,transparent,black_20px)">
                                      <div className="flex flex-row items-center transition-all duration-1000 gap-1">
                                        {live.peopleAhead > 4 && (
                                          <div className="w-9 h-9 rounded-full border border-border bg-card-2 flex items-center justify-center text-[11px] font-bold z-0 -mr-4 text-text-dim shadow-inner">
                                            +{live.peopleAhead - 4}
                                          </div>
                                        )}
                                        {Array.from({ length: Math.min(4, live.peopleAhead) }).map((_, i) => (
                                          <div key={`ahead-${i}`} className="w-9 h-9 rounded-full border border-border bg-card-2 flex items-center justify-center text-sm shadow-sm -mr-3 z-10 opacity-70 grayscale transition-all duration-700">
                                            👤
                                          </div>
                                        ))}
                                        {/* You */}
                                        <div className="w-11 h-11 rounded-full border-2 border-primary bg-card flex items-center justify-center text-xl shadow-[0_0_20px_rgba(255,107,107,0.3)] z-20 relative ml-2 transition-all duration-500 scale-110">
                                          🧑‍🦱
                                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-primary text-[7px] font-black px-1.5 py-0.5 rounded-full border border-card text-background tracking-widest shadow-sm">YOU</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="p-5 rounded-3xl bg-card-2 border border-border flex items-center gap-3 justify-center">
                                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  <p className="text-text-dim text-sm font-medium">Fetching live queue...</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mb-5">
                            {token.selectedServices.map((s, i) => (
                              <span key={i} className="text-xs px-3 py-1.5 rounded-xl bg-card-2 border border-border font-medium shadow-sm">{s.name}</span>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-border border-dashed">
                            <div>
                              <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mb-0.5">Total</p>
                              <p className="font-black text-xl gradient-text leading-none">₹{token.totalPrice}</p>
                            </div>
                            <div className="flex gap-2.5">
                              <button
                                onClick={() => setShowCardId(token.id!)}
                                className="px-5 h-10 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-[2px] shadow-lg shadow-primary/20 active:scale-95 transition-all"
                              >
                                View Ticket 🎫
                              </button>
                               <button 
                                onClick={() => handleCancel(token)}
                                className="w-10 h-10 rounded-xl bg-card-2 border border-border flex items-center justify-center text-danger active:scale-95 shadow-sm"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div className="pt-2">
                <div className="mb-5 p-4 rounded-3xl bg-gradient-to-r from-primary to-accent text-white shadow-lg relative overflow-hidden flex items-center justify-between animate-slideUp">
                  <div className="absolute right-0 top-0 opacity-10 text-8xl -mt-4 -mr-4">🎁</div>
                  <div className="relative z-10 w-full">
                    <p className="font-black text-sm mb-1 uppercase tracking-widest text-white/90">VIP Reward Progress</p>
                    <div className="w-full h-2 bg-black/20 rounded-full mb-2 overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${(past.length % 5) * 20}%` }} />
                    </div>
                    <p className="text-xs font-bold">{5 - (past.length % 5)} more visits to unlock <span className="text-gold">10% OFF</span></p>
                  </div>
                </div>
                <h2 className="font-bold text-sm mb-4 text-text-dim uppercase tracking-wider px-1">Past Bookings</h2>
                <div className="space-y-3">
                  {past.map(token => {
                    const business = allSalons.find(s => s.uid === token.salonId);
                    const termInfo = getCategoryInfo(business?.businessType || 'men_salon');

                    return (
                      <div key={token.id} className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{termInfo.icon}</span>
                              <p className="font-bold text-sm">{token.salonName}</p>
                            </div>
                            <p className="text-text-dim text-xs mt-1 ml-7 font-medium">📅 {token.date} · #{token.tokenNumber}</p>
                            <div className="flex flex-wrap gap-1 mt-2 ml-7">
                              {token.selectedServices.map((s, i) => <span key={i} className="text-[10px] bg-card-2 px-2 py-0.5 rounded-full font-medium">{s.name}</span>)}
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm mb-2 ${token.status === 'done' ? 'bg-success/15 border border-success/30 text-success' : 'bg-danger/10 border border-danger/20 text-danger'}`}>
                              {token.status === 'done' ? '✅ Complete' : '❌ Cancelled'}
                            </span>
                            <p className={`font-black text-sm ${token.status === 'done' ? 'text-success' : 'text-text-dim'}`}>₹{token.totalPrice}</p>
                          </div>
                        </div>
                        {token.status === 'done' && (
                          <div className="mt-4 pt-3 border-t border-border flex justify-end gap-2">
                            <button onClick={() => nav(`/customer/salon/${token.salonId}`)} className="text-xs text-text-dim font-bold bg-card-2 border border-border px-4 py-1.5 rounded-full hover:bg-border transition-colors">
                              🔄 Book Again
                            </button>
                            <button onClick={() => nav(`/customer/salon/${token.salonId}`)} className="text-xs text-primary font-bold bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                              ⭐ Review
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />

      {/* Premium Token Card Modal */}
      <AnimatePresence>
        {showCardId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-6"
          >
            <div 
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setShowCardId(null)}
            />
            <div className="relative z-10 w-full max-w-sm">
              {(() => {
                const token = active.find(t => t.id === showCardId);
                if (!token) return null;
                const live = liveData.get(token.id!);
                const biz = allSalons.find(s => s.uid === token.salonId);
                return (
                  <TokenCard 
                    token={token}
                    livePos={live?.livePos}
                    liveWait={live?.liveWait}
                    businessType={biz?.businessType}
                  />
                );
              })()}
              <button 
                onClick={() => setShowCardId(null)}
                className="absolute -top-12 right-0 text-white/40 hover:text-white font-black text-sm uppercase tracking-widest flex items-center gap-2"
              >
                Close ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
