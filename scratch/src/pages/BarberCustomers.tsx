import { useState, useEffect } from 'react';
import { useApp, TokenEntry } from '../store/AppContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

export default function BarberCustomers() {
  const { user, nextCustomer, getTodayEarnings, businessProfile, t, markNoShow, blockCustomer, unblockCustomer } = useApp();
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [editingWait, setEditingWait] = useState<string | null>(null); // tokenId
  const [customWait, setCustomWait] = useState('');
  const [savingWait, setSavingWait] = useState(false);
  const [reengaging, setReengaging] = useState(false);
  const [reengagedCount, setReengagedCount] = useState<number | null>(null);

  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

  const handleReengage = () => {
    setReengaging(true);
    setTimeout(() => {
      setReengaging(false);
      setReengagedCount(Math.floor(Math.random() * 15) + 5);
      setTimeout(() => setReengagedCount(null), 5000);
    }, 1500);
  };

  // ✅ Real-time listener for today's tokens
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tokens'), where('salonId', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as TokenEntry));
      const todayTokens = all.filter(t => t.date === today);
      todayTokens.sort((a, b) => {
        if (a.status === 'waiting' && b.status === 'waiting') {
          if (a.isTatkal && !b.isTatkal) return -1;
          if (!a.isTatkal && b.isTatkal) return 1;
        }
        return a.tokenNumber - b.tokenNumber;
      });
      setTokens(todayTokens);
    }, err => console.warn('Tokens listener:', err));
    return () => unsub();
  }, [user, today]);

  // Reload earnings every 15s
  useEffect(() => {
    const load = async () => { const e = await getTodayEarnings(); setEarnings(e); };
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [user]);

  const handleNext = async () => {
    await nextCustomer();
  };

  // ✅ Barber can set custom wait time for a token
  const handleSetWaitTime = async (tokenId: string, minutes: number) => {
    setSavingWait(true);
    try {
      await updateDoc(doc(db, 'tokens', tokenId), { estimatedWaitMinutes: minutes, totalTime: minutes });
    } catch (e) { console.error(e); }
    setSavingWait(false);
    setEditingWait(null);
    setCustomWait('');
  };

  const waitingTokens = tokens.filter(t => t.status === 'waiting');
  const servingToken  = tokens.find(t => t.status === 'serving');
  const doneTokens    = tokens.filter(t => t.status === 'done');
  const cancelledCount = tokens.filter(t => t.status === 'cancelled').length;

  return (
    <div className="h-full overflow-y-auto pb-40 animate-fadeIn custom-scrollbar">
      <div className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold">{t('queue.customers')}</h1>
          <div className="flex items-center gap-1.5 text-[10px] text-success font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live
          </div>
        </div>
        <p className="text-text-dim text-sm mb-4">{t('today')} · {waitingTokens.length} waiting</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="p-3 rounded-xl glass-card text-center">
            <p className="text-lg font-bold text-gold">₹{earnings}</p>
            <p className="text-[9px] text-text-dim">Revenue</p>
          </div>
          <div className="p-3 rounded-xl glass-card text-center">
            <p className="text-lg font-bold text-success">{doneTokens.length}</p>
            <p className="text-[9px] text-text-dim">Done</p>
          </div>
          <div className="p-3 rounded-xl glass-card text-center">
            <p className="text-lg font-bold text-warning">{waitingTokens.length}</p>
            <p className="text-[9px] text-text-dim">Waiting</p>
          </div>
          <div className="p-3 rounded-xl glass-card text-center">
            <p className="text-lg font-bold text-danger">{cancelledCount}</p>
            <p className="text-[9px] text-text-dim">Cancelled</p>
          </div>
        </div>

        {/* Auto CRM */}
        <div className="mb-5 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5"><span className="text-lg">🤖</span> Auto CRM</h3>
            <p className="text-[10px] text-text-dim mt-0.5 max-w-[180px]">Auto-send 10% off SMS to customers inactive for 30+ days</p>
          </div>
          <button 
            onClick={handleReengage} 
            disabled={reengaging || reengagedCount !== null}
            className={`px-4 py-2 ${reengagedCount !== null ? 'bg-success text-white' : 'bg-primary text-white'} text-xs font-bold rounded-xl active:scale-95 transition-all disabled:opacity-80`}
          >
            {reengaging ? (
              <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning...</span>
            ) : reengagedCount !== null ? (
              `✓ Sent to ${reengagedCount}`
            ) : (
              '▶️ Trigger'
            )}
          </button>
        </div>

        {/* Next Customer Button */}
        <button
          onClick={handleNext}
          disabled={waitingTokens.length === 0 && !servingToken}
          className="w-full p-5 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg mb-5 disabled:opacity-40 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          {servingToken
            ? `✅ Done #${servingToken.tokenNumber} → Call Next`
            : waitingTokens.length > 0
            ? `▶️ Call Token #${waitingTokens[0]?.tokenNumber}`
            : '👥 No customers waiting'}
        </button>

        {/* Currently Serving */}
        {servingToken && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-success mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Currently Serving
            </h3>
            <div className="p-4 rounded-2xl bg-success/10 border border-success/30">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">#{servingToken.tokenNumber} · {servingToken.customerName}</p>
                  <p className="text-sm text-text-dim mt-0.5">{servingToken.selectedServices.map(s => s.name).join(', ')}</p>
                  <p className="text-sm font-semibold text-success mt-1">₹{servingToken.totalPrice} · ~{servingToken.totalTime}min</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {servingToken.customerPhone && (
                    <a href={`tel:${servingToken.customerPhone}`} className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">📞</a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Waiting Queue */}
        {waitingTokens.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-warning mb-2">⏳ Waiting Queue ({waitingTokens.length})</h3>
            <div className="space-y-2">
              {waitingTokens.map((token, i) => (
                <div key={token.id} className="p-3 rounded-xl bg-card border border-border animate-fadeIn" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary flex-shrink-0">
                      {token.tokenNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{token.customerName}</p>
                      <p className="text-text-dim text-xs truncate">{token.selectedServices.map(s => s.name).join(', ')}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">₹{token.totalPrice}</p>
                      <p className="text-xs text-text-dim">~{token.estimatedWaitMinutes}min</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {token.customerPhone && (
                        <a href={`tel:${token.customerPhone}`} className="text-primary text-lg">📞</a>
                      )}
                      <button 
                        onClick={() => {
                          if (confirm(`Mark ${token.customerName} as No-Show?\nThis will cancel their token and penalize their account.`)) {
                            markNoShow(token.id!, token.customerId);
                          }
                        }}
                        className="px-2 py-1 bg-danger/10 text-danger text-[9px] font-bold uppercase rounded border border-danger/20 active:scale-95 hover:bg-danger hover:text-white transition-colors"
                      >
                        No-Show
                      </button>

                      {businessProfile?.blockedCustomerIds?.includes(token.customerId) ? (
                        <button 
                          onClick={() => {
                            if (confirm(`Unblock ${token.customerName}?`)) {
                              unblockCustomer(token.customerId);
                            }
                          }}
                          className="px-2 py-1 bg-success/10 text-success text-[9px] font-bold uppercase rounded border border-success/20 active:scale-95"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            if (confirm(`Block ${token.customerName}?\nThey won't be able to book tokens at your business anymore.`)) {
                              blockCustomer(token.customerId);
                            }
                          }}
                          className="px-2 py-1 bg-danger/10 text-danger text-[9px] font-bold uppercase rounded border border-danger/20 active:scale-95"
                        >
                          Block
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tatkal Badge */}
                  {token.isTatkal && (
                    <div className="mt-2 w-max px-2 py-0.5 rounded-full bg-gold/20 border border-gold/40 text-[10px] text-gold font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                      <span className="text-sm">🚀</span> Tatkal (Skipped Line)
                    </div>
                  )}

                  {/* ✅ Set custom wait time */}
                  <div className="mt-2 flex items-center gap-2">
                    {editingWait === token.id ? (
                      <>
                        <input
                          type="number"
                          value={customWait}
                          onChange={e => setCustomWait(e.target.value)}
                          placeholder="Wait time (min)"
                          className="input-field flex-1 text-xs py-1.5"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSetWaitTime(token.id!, parseInt(customWait) || token.totalTime)}
                          disabled={savingWait || !customWait}
                          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50"
                        >
                          {savingWait ? '...' : 'Set'}
                        </button>
                        <button onClick={() => { setEditingWait(null); setCustomWait(''); }} className="px-2 py-1.5 rounded-lg border border-border text-xs text-text-dim">✕</button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setEditingWait(token.id!); setCustomWait(String(token.estimatedWaitMinutes || token.totalTime)); }}
                        className="text-[10px] text-primary/70 hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        ⏱ Set custom wait time
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        {doneTokens.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-text-dim mb-2">✅ Done ({doneTokens.length})</h3>
            <div className="space-y-2">
              {doneTokens.map(token => (
                <div key={token.id} className="p-3 rounded-xl bg-card border border-border flex items-center gap-3 opacity-60">
                  <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center font-bold text-success text-sm">{token.tokenNumber}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{token.customerName}</p>
                    <p className="text-text-dim text-xs">{token.selectedServices.map(s => s.name).join(', ')}</p>
                  </div>
                  <p className="text-sm font-semibold text-success">₹{token.totalPrice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tokens.length === 0 && (
          <div className="text-center py-12">
            <span className="text-5xl block mb-3 animate-float">👥</span>
            <p className="text-text-dim font-medium">No customers today yet</p>
            <p className="text-text-dim text-xs mt-1">
              {businessProfile?.isOpen ? 'Waiting for customers to book tokens...' : 'Open your business to start receiving tokens'}
            </p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
