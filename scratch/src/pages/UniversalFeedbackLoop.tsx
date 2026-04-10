import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, FeedbackRequest } from '../store/AppContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { triggerHaptic } from '../utils/haptics';

export default function UniversalFeedbackLoop() {
  const { user, businessProfile } = useApp();
  const nav = useNavigate();
  const [requests, setRequests] = useState<FeedbackRequest[]>([]);
  const [saving, setSaving] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceProvided, setServiceProvided] = useState('');

  useEffect(() => {
    if (businessProfile?.feedbackRequests) {
      setRequests(businessProfile.feedbackRequests);
    }
  }, [businessProfile]);

  const saveToDb = async (newRequests: FeedbackRequest[]) => {
    if (!user) return;
    setSaving(true);
    try {
      const sorted = [...newRequests].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      await updateDoc(doc(db, 'users', user.uid), { feedbackRequests: sorted });
      setRequests(sorted);
      triggerHaptic('success');
    } catch (e: any) {
      alert('Error updating feedback: ' + e.message);
    }
    setSaving(false);
  };

  const generateRequest = async () => {
    if (!customerName || !serviceProvided) return alert('Name and Service are required');
    
    const newReq: FeedbackRequest = {
      id: Date.now().toString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      serviceProvided: serviceProvided.trim(),
      date: new Date().toISOString(),
      status: 'Pending'
    };

    await saveToDb([newReq, ...requests]);
    setCustomerName('');
    setCustomerPhone('');
    setServiceProvided('');
  };

  const markAsSent = async (id: string, phone: string, name: string) => {
    // Generate text and open whatsapp
    const message = `Hi ${name}, thank you for choosing ${businessProfile?.businessName || 'us'}! We hope you loved your ${serviceProvided || 'service'} today. Please take 1 minute to leave us a review here: [Link] 🙏`;
    if (phone) {
      window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      alert('No phone number attached. Sending mock text: ' + message);
    }

    const updated = requests.map(r => r.id === id ? { ...r, status: 'Sent' as const } : r);
    await saveToDb(updated);
  };

  const deleteRequest = async (id: string) => {
    if (confirm('Delete this feedback request?')) {
      await saveToDb(requests.filter(r => r.id !== id));
    }
  };

  // Mock a customer actually reviewing it
  const simulateReview = async (id: string) => {
    const updated = requests.map(r => {
      if (r.id === id) {
        return { 
          ...r, 
          status: 'Completed' as const, 
          rating: [4, 5, 5, 5, 3][Math.floor(Math.random()*5)], 
          reviewText: 'Great service! Highly recommended.' 
        };
      }
      return r;
    });
    await saveToDb(updated);
  };

  const avgRating = requests.filter(r => r.status === 'Completed').reduce((sum, r) => sum + (r.rating || 0), 0) / Math.max(1, requests.filter(r => r.status === 'Completed').length);

  return (
    <div className="min-h-screen bg-background pb-20 animate-fadeIn bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/10 via-background to-background">
      <div className="p-4 glass-strong sticky top-0 z-20 flex items-center justify-between border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => nav('/barber/dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full bg-card-2 hover:bg-border transition-colors">←</button>
          <div>
            <h1 className="font-black text-lg text-primary">Feedback Loop ⭐</h1>
            <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">{requests.filter(r => r.status === 'Completed').length} Reviews Collected</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">

         {/* Stats */}
         <div className="flex gap-4">
           <div className="flex-1 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-4 text-background shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-20 text-6xl pointer-events-none">⭐</div>
             <p className="text-[10px] font-bold uppercase tracking-widest relative z-10">Average Rating</p>
             <h2 className="text-4xl font-black mt-2 relative z-10">{avgRating.toFixed(1)}</h2>
           </div>
           <div className="flex-1 bg-card border border-border rounded-3xl p-4 flex flex-col justify-center items-center shadow-sm">
             <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest text-center">Conversion Rate</p>
             <h2 className="text-2xl font-black text-text mt-1">
               {requests.length ? Math.round((requests.filter(r => r.status === 'Completed').length / requests.length) * 100) : 0}%
             </h2>
           </div>
         </div>

        {/* Generate Request */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-md">
          <h2 className="font-black text-text mb-3 text-sm">Automate New Review</h2>
          <div className="grid grid-cols-2 gap-3">
             <div className="col-span-2">
               <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer Name" className="w-full p-3 rounded-xl bg-background border border-border outline-none text-sm font-bold" />
             </div>
             <div>
               <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone (optional)" className="w-full p-3 rounded-xl bg-background border border-border outline-none text-sm" />
             </div>
             <div>
               <input type="text" value={serviceProvided} onChange={e => setServiceProvided(e.target.value)} placeholder="Service (e.g. Haircut)" className="w-full p-3 rounded-xl bg-background border border-border outline-none text-sm" />
             </div>
             <div className="col-span-2">
              <button disabled={saving} onClick={generateRequest} className="w-full py-3 bg-card-2 border border-border text-text rounded-xl font-bold hover:bg-border transition-colors disabled:opacity-50 text-xs shadow-sm uppercase tracking-widest">
                Queue Feedback Request
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div>
           <div className="flex justify-between items-center mb-4 pl-2">
             <h3 className="font-black text-text-dim uppercase tracking-widest border-l-2 border-primary text-xs pl-2">Feedback Pipeline</h3>
           </div>

           {requests.length === 0 ? (
             <div className="text-center py-6 border border-dashed border-border rounded-3xl opacity-50 bg-card">
               <span className="text-3xl block mb-2">💬</span>
               <p className="text-xs font-bold text-text-dim">No requests tracked yet.</p>
             </div>
           ) : (
             <div className="grid gap-3">
               {requests.map(r => {
                 return (
                   <div key={r.id} className="p-4 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-2">
                     <div className="flex justify-between items-start">
                       <div>
                         <h4 className="font-black text-text text-sm">{r.customerName}</h4>
                         <p className="text-[10px] text-text-dim uppercase tracking-wider">{r.serviceProvided} • {new Date(r.date).toLocaleDateString('en-GB')}</p>
                       </div>
                       
                       {r.status === 'Completed' ? (
                         <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded text-amber-500 text-[10px] font-black pointer-events-none">
                           {r.rating} ⭐
                         </div>
                       ) : (
                         <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${r.status === 'Sent' ? 'bg-primary/20 text-primary' : 'bg-card-2 text-text-dim border border-border'}`}>
                           {r.status}
                         </div>
                       )}
                     </div>

                     {/* Action or Review Body */}
                     {r.status === 'Completed' ? (
                       <div className="bg-background rounded-xl p-3 text-xs italic text-text-dim border border-border">
                         "{r.reviewText}"
                       </div>
                     ) : (
                       <div className="flex gap-2 mt-2">
                         {r.status === 'Pending' && (
                           <button onClick={() => markAsSent(r.id, r.customerPhone, r.customerName)} className="flex-1 py-2 bg-green-600/10 text-green-500 rounded-xl font-bold text-xs hover:bg-green-600/20 transition-colors uppercase tracking-widest">
                             Send WhatsApp Link
                           </button>
                         )}
                         {r.status === 'Sent' && (
                           <button onClick={() => simulateReview(r.id)} className="flex-1 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs border border-primary/20 shadow-sm uppercase tracking-widest">
                             Simulate Reply
                           </button>
                         )}
                         <button onClick={() => deleteRequest(r.id)} className="w-[40px] flex justify-center items-center rounded-xl bg-card-2 hover:bg-danger/20 hover:text-danger text-text-dim transition-colors text-xs">✕</button>
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
