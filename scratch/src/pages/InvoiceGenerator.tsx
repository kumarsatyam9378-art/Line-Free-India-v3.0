import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { triggerHaptic } from '../utils/haptics';

interface InvoiceLineItem { description: string; qty: number; rate: number; total: number; }
interface Invoice { id: string; invoiceNo: string; clientName: string; clientPhone: string; clientAddress: string; dateStr: string; items: InvoiceLineItem[]; subtotal: number; gstRate: number; gstAmount: number; grandTotal: number; status: 'draft'|'sent'|'paid'; notes: string; }

export default function InvoiceGenerator() {
  const { user, businessProfile } = useApp();
  const nav = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [saving, setSaving] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [itemDesc, setItemDesc] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemRate, setItemRate] = useState('');

  useEffect(() => { if ((businessProfile as any)?.invoices) setInvoices((businessProfile as any).invoices); }, [businessProfile]);

  const saveToDb = async (recs: Invoice[]) => {
    if (!user) return; setSaving(true);
    try { await updateDoc(doc(db, 'users', user.uid), { invoices: recs }); setInvoices(recs); triggerHaptic('success'); } catch (e: any) { alert('Error: ' + e.message); }
    setSaving(false);
  };

  const addItem = () => { if (!itemDesc || !itemRate) return; const q = Number(itemQty)||1; const r = Number(itemRate)||0; setItems([...items, { description: itemDesc.trim(), qty: q, rate: r, total: q*r }]); setItemDesc(''); setItemQty('1'); setItemRate(''); };

  const generateInvoice = async () => {
    if (!clientName || items.length === 0) return alert('Client name and items required.');
    const sub = items.reduce((a,i) => a+i.total, 0);
    const gr = Number(gstRate)||0;
    const gstAmt = Math.round(sub * gr / 100);
    const invNo = 'INV-' + Date.now().toString().slice(-6);
    const inv: Invoice = { id: Date.now().toString(), invoiceNo: invNo, clientName: clientName.trim(), clientPhone: clientPhone.trim(), clientAddress: clientAddress.trim(), dateStr: new Date().toISOString(), items, subtotal: sub, gstRate: gr, gstAmount: gstAmt, grandTotal: sub + gstAmt, status: 'draft', notes: notes.trim() };
    await saveToDb([inv, ...invoices]);
    setClientName(''); setClientPhone(''); setClientAddress(''); setItems([]); setNotes('');
  };

  const sendInvoice = (inv: Invoice) => {
    if (!inv.clientPhone) return;
    const bname = businessProfile?.businessName || 'Business';
    let itemStr = inv.items.map(i => `▫️ ${i.qty}x ${i.description} — ₹${i.total}`).join('\n');
    const text = `*🧾 Invoice ${inv.invoiceNo} — ${bname}*\nHi ${inv.clientName},\n\n${itemStr}\n\nSubtotal: ₹${inv.subtotal}\nGST (${inv.gstRate}%): ₹${inv.gstAmount}\n*Total: ₹${inv.grandTotal}*\n\n_Payment due immediately._`;
    const s = '91' + inv.clientPhone.replace(/\D/g,'').slice(-10);
    window.open(`https://wa.me/${s}?text=${encodeURIComponent(text)}`, '_blank');
    saveToDb(invoices.map(i => i.id === inv.id ? { ...i, status: 'sent' } : i));
  };

  return (
    <div className="min-h-screen bg-background pb-20 animate-fadeIn bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-background to-background">
      <div className="p-4 glass-strong sticky top-0 z-20 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => nav('/barber/dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full bg-card-2 hover:bg-border transition-colors">←</button>
          <div><h1 className="font-black text-lg text-emerald-400">Invoice Generator 🧾</h1><p className="text-[10px] text-emerald-200/50 font-bold uppercase tracking-widest">{invoices.length} Invoices</p></div>
        </div>
      </div>
      <div className="p-4 space-y-6">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-md">
          <h2 className="font-black text-sm text-text mb-4">New Invoice</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client Name *" className="w-full p-3 rounded-xl bg-background border border-border outline-none font-bold text-sm text-emerald-100" />
            <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="WhatsApp" className="w-full p-3 rounded-xl bg-background border border-border outline-none text-xs text-emerald-100" />
            <input type="text" value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Address" className="col-span-2 w-full p-3 rounded-xl bg-background border border-border outline-none text-xs text-emerald-100/70" />
          </div>
          <div className="bg-background/50 rounded-2xl p-4 border border-border mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-text-dim mb-3">Line Items</h3>
            {items.length > 0 && <div className="space-y-1 mb-3">{items.map((it,i) => (<div key={i} className="flex items-center gap-2 text-xs bg-card p-2 rounded-lg border border-border"><span className="flex-1 font-bold text-emerald-100">{it.description}</span><span className="text-text-dim">{it.qty} x ₹{it.rate}</span><span className="font-black text-emerald-400 w-16 text-right">₹{it.total}</span><button onClick={() => setItems(items.filter((_,j)=>j!==i))} className="text-danger text-[10px]">✕</button></div>))}</div>}
            <div className="flex gap-2">
              <input type="text" value={itemDesc} onChange={e => setItemDesc(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addItem()} placeholder="Description" className="flex-1 p-2.5 rounded-lg bg-card border border-border outline-none text-xs text-emerald-100" />
              <input type="number" value={itemQty} onChange={e => setItemQty(e.target.value)} className="w-14 p-2.5 rounded-lg bg-card border border-border outline-none text-xs text-center font-bold" />
              <input type="number" value={itemRate} onChange={e => setItemRate(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addItem()} placeholder="Rate" className="w-20 p-2.5 rounded-lg bg-card border border-border outline-none text-xs font-bold text-emerald-200" />
              <button onClick={addItem} className="px-3 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-black">+</button>
            </div>
          </div>
          <div className="flex gap-3 mb-4">
            <div className="flex-1"><label className="text-[9px] font-black text-text-dim uppercase mb-1 block">GST %</label><input type="number" value={gstRate} onChange={e => setGstRate(e.target.value)} className="w-full p-2.5 rounded-lg bg-background border border-border outline-none text-xs font-bold text-emerald-200" /></div>
            <div className="flex-1 text-right pt-4"><p className="text-[9px] text-text-dim uppercase font-bold">Est Total</p><p className="text-lg font-black text-emerald-400">₹{Math.round(items.reduce((a,i)=>a+i.total,0) * (1 + (Number(gstRate)||0)/100))}</p></div>
          </div>
          <button disabled={saving} onClick={generateInvoice} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">{saving ? 'Generating...' : 'Generate Invoice'}</button>
        </div>
        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv.id} className="p-4 rounded-3xl bg-card border border-border shadow-sm flex justify-between items-start">
              <div><div className="flex items-center gap-2 mb-1"><span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{inv.invoiceNo}</span><span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${inv.status==='paid'?'bg-emerald-500/20 text-emerald-400':inv.status==='sent'?'bg-blue-500/20 text-blue-400':'bg-zinc-500/20 text-zinc-400'}`}>{inv.status}</span></div><p className="text-sm font-black text-emerald-50">{inv.clientName}</p><p className="text-[10px] text-text-dim">{new Date(inv.dateStr).toLocaleDateString()}</p></div>
              <div className="text-right flex flex-col items-end gap-2"><p className="text-lg font-black text-emerald-400">₹{inv.grandTotal}</p>{inv.status!=='paid' && <button onClick={() => sendInvoice(inv)} className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded-lg font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">Send ↗</button>}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
