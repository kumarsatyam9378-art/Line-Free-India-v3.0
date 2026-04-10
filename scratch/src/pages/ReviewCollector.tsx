import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { triggerHaptic } from '../utils/haptics';

interface Review { id: string; customerName: string; customerPhone: string; rating: number; review: string; service: string; date: string; replied: boolean; reply?: string; replyImage?: string; }

export default function ReviewCollector() {
  const { user, businessProfile } = useApp();
  const nav = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [saving, setSaving] = useState(false);
  const [replyId, setReplyId] = useState<string|null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState<string|null>(null);

  useEffect(() => { if ((businessProfile as any)?.reviews) setReviews((businessProfile as any).reviews); }, [businessProfile]);
  const saveToDb = async (recs: Review[]) => { if (!user) return; setSaving(true); try { await updateDoc(doc(db, 'users', user.uid), { reviews: recs }); setReviews(recs); triggerHaptic('success'); } catch(e:any) { alert('Error: ' + e.message); } setSaving(false); };

  const sendReviewLink = () => {
    const bName = businessProfile?.businessName || 'Business';
    const text = `*⭐ Rate Your Experience - ${bName}*\nHi! We hope you enjoyed your visit.\nPlease rate us (1-5 stars) and leave a short review.\nYour feedback helps us improve! 🙏`;
    const phone = prompt('Enter customer WhatsApp number:');
    if (!phone) return;
    const s = '91' + phone.replace(/\D/g,'').slice(-10);
    window.open(`https://wa.me/${s}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const submitReply = async () => {
    if (!replyId || !replyText) return;
    await saveToDb(reviews.map(r => r.id === replyId ? {...r, replied: true, reply: replyText.trim(), replyImage: replyImage || undefined} : r));
    setReplyId(null); setReplyText(''); setReplyImage(null);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((a,r) => a+r.rating, 0) / reviews.length).toFixed(1) : '0';
  const stars = [5,4,3,2,1].map(s => ({ star: s, count: reviews.filter(r=>r.rating===s).length }));

  return (
    <div className="min-h-screen bg-background pb-20 animate-fadeIn bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-background to-background">
      <div className="p-4 glass-strong sticky top-0 z-20 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => nav('/barber/dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full bg-card-2 hover:bg-border transition-colors">←</button>
          <div><h1 className="font-black text-lg text-yellow-400">Reviews ⭐</h1><p className="text-[10px] text-yellow-200/50 font-bold uppercase tracking-widest">{avgRating} Avg • {reviews.length} Total</p></div>
        </div>
        <button onClick={sendReviewLink} className="text-[9px] font-black uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500 hover:text-white transition-all">Request Review</button>
      </div>
      <div className="p-4 space-y-6">
        <div className="bg-card border border-border rounded-3xl p-4 flex gap-4 items-center">
          <div className="text-center"><p className="text-3xl font-black text-yellow-400">{avgRating}</p><p className="text-[9px] text-text-dim font-bold uppercase">Average</p></div>
          <div className="flex-1 space-y-1">{stars.map(s => (<div key={s.star} className="flex items-center gap-2"><span className="text-[10px] font-bold text-yellow-200 w-4">{s.star}★</span><div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden"><div className="h-full bg-yellow-500 rounded-full" style={{width:`${reviews.length>0?s.count/reviews.length*100:0}%`}}></div></div><span className="text-[9px] text-text-dim w-6 text-right">{s.count}</span></div>))}</div>
        </div>
        {replyId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fadeIn">
            <div className="bg-card w-full max-w-sm rounded-[32px] p-6 border border-border">
              <h2 className="font-black text-lg text-yellow-400 mb-4">Reply to Review</h2>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Your reply..." className="w-full p-3 rounded-xl bg-background border border-border outline-none text-xs text-yellow-100 resize-none mb-3"></textarea>
              
              <div className="mb-4">
                <p className="text-[10px] font-bold text-yellow-200/50 uppercase mb-2">Attach Photo (Optional)</p>
                <div className="flex gap-2 items-center">
                  <label className="w-12 h-12 rounded-xl bg-background border border-border border-dashed flex items-center justify-center text-xl cursor-pointer hover:border-yellow-500 transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setReplyImage(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                    📸
                  </label>
                  {replyImage && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-yellow-500">
                      <img src={replyImage} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => setReplyImage(null)} className="absolute top-0 right-0 bg-black/50 text-white text-[8px] p-0.5">X</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setReplyId(null); setReplyImage(null); }} className="flex-1 py-3 rounded-xl bg-card-2 text-text-dim text-xs font-black uppercase">Cancel</button>
                <button onClick={submitReply} className="flex-1 py-3 rounded-xl bg-yellow-600 text-white text-xs font-black uppercase shadow-md">Reply</button>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-3">{reviews.map(r => (
          <div key={r.id} className="p-4 rounded-3xl bg-card border border-border shadow-sm">
            <div className="flex justify-between items-start mb-2"><div><h4 className="font-black text-sm text-yellow-50">{r.customerName}</h4><p className="text-[9px] text-text-dim">{r.service} • {new Date(r.date).toLocaleDateString()}</p></div><div className="text-sm text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div></div>
            <p className="text-xs text-yellow-100/80 mb-2">{r.review}</p>
            {r.replied && r.reply && (
              <div className="bg-background/50 rounded-xl p-3 border border-border mt-2">
                <p className="text-[9px] font-bold text-text-dim uppercase mb-1.5">Your Reply:</p>
                <p className="text-xs text-yellow-100/60 leading-relaxed mb-2">{r.reply}</p>
                {r.replyImage && (
                  <img src={r.replyImage} className="w-full h-32 object-cover rounded-xl mt-2 border border-border" alt="Reply" />
                )}
              </div>
            )}
            {!r.replied && <button onClick={() => setReplyId(r.id)} className="text-[9px] font-black uppercase text-yellow-400 hover:text-yellow-300">Reply →</button>}
          </div>
        ))}</div>
      </div>
    </div>
  );
}
