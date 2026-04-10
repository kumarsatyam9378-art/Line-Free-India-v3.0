import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import BottomNav from '../components/BottomNav';
import BackButton from '../components/BackButton';
import LocationPicker from '../components/LocationPicker';

export default function CustomerProfileEdit() {
  const { user, customerProfile, saveCustomerProfile, signOutUser, deleteAccount, uploadPhoto, allSalons, isFavorite, theme, toggleTheme, t, unreadCount, getCustomerFullHistory } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState(customerProfile?.name || '');
  const [phone, setPhone] = useState(customerProfile?.phone || '');
  const [location, setLocation] = useState(customerProfile?.location || '');
  const [lat, setLat] = useState<number | undefined>(customerProfile?.lat);
  const [lng, setLng] = useState<number | undefined>(customerProfile?.lng);
  const [fetchingAddr, setFetchingAddr] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<{icon: string, name: string}[]>([]);
  const [notiPush, setNotiPush] = useState(customerProfile?.notiPush ?? true);
  const [notiWhatsapp, setNotiWhatsapp] = useState(customerProfile?.notiWhatsapp ?? true);
  const [notiQuiet, setNotiQuiet] = useState(customerProfile?.notiQuiet ?? false);

  useEffect(() => {
    if (user) {
      getCustomerFullHistory(user.uid).then(tokens => {
        const done = tokens.filter(t => t.status === 'done').sort((a,b) => b.createdAt - a.createdAt);
        if (done.length === 0) return;
        
        let currentStreak = 1;
        const now = Date.now();
        const daysSinceLast = (now - done[0].createdAt) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLast <= 40) {
          for (let i = 0; i < done.length - 1; i++) {
            const diffDays = (done[i].createdAt - done[i+1].createdAt) / (1000 * 60 * 60 * 24);
            if (diffDays <= 40) currentStreak++;
            else break;
          }
        } else {
          currentStreak = 0;
        }
        setStreak(currentStreak);

        const newBadges = [];
        if (done.length >= 1) newBadges.push({ icon: '✂️', name: 'Fresh Cut' });
        if (done.length >= 5) newBadges.push({ icon: '🥈', name: 'Regular' });
        if (done.length >= 10) newBadges.push({ icon: '🥇', name: 'Loyal VIP' });
        if (currentStreak >= 3) newBadges.push({ icon: '🔥', name: 'Streak 3x' });
        setBadges(newBadges);
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!customerProfile) return;
    await saveCustomerProfile({ 
      ...customerProfile, 
      name: name || customerProfile.name, 
      phone: phone || '', 
      location: location || '', 
      lat, 
      lng,
      notiPush,
      notiWhatsapp,
      notiQuiet
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !customerProfile) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file, `line-free/customers/${user.uid}`);
      await saveCustomerProfile({ ...customerProfile, photoURL: url });
    } catch { alert('Photo upload failed'); }
    setUploading(false);
  };

  const handleLogout = async () => { await signOutUser(); nav('/', { replace: true }); };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    setDeleteError('');
    const result = await deleteAccount();
    if (result.success) {
      nav('/', { replace: true });
    } else {
      setDeleteError(result.error || 'Failed. Please try again.');
      setDeleting(false);
    }
  };

  const favCount = allSalons.filter(s => isFavorite(s.uid)).length;
  const photoURL = customerProfile?.photoURL || user?.photoURL || '';
  const referralCode = customerProfile?.referralCode || `LF${user?.uid.slice(0, 6).toUpperCase()}`;

  return (
    <div className="h-full overflow-y-auto animate-fadeIn custom-scrollbar">
      <div className="p-6 pb-40">
        <BackButton to="/customer/home" />
        <h1 className="text-2xl font-bold mb-5">{t('profile')}</h1>

        {/* Profile Card */}
        <div className="text-center mb-6 p-5 rounded-2xl glass-card">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-card-2 ring-2 ring-primary/30">
              {photoURL ? <img src={photoURL} className="w-20 h-20 object-cover" alt="" /> : <div className="w-20 h-20 flex items-center justify-center text-4xl">👤</div>}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg disabled:opacity-50">
              {uploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="text-xs">📷</span>}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          <p className="font-bold text-lg">{name || user?.displayName || 'Customer'}</p>
          <p className="text-text-dim text-sm">{user?.email}</p>
          <div className="flex gap-4 mt-4 justify-center">
            <div className="text-center"><p className="text-xl font-bold gradient-text">{favCount}</p><p className="text-text-dim text-[10px]">Favorites</p></div>
            <div className="w-px bg-border" />
            <div className="text-center"><p className="text-xl font-bold gradient-text">{customerProfile?.totalVisits || 0}</p><p className="text-text-dim text-[10px]">Visits</p></div>
            <div className="w-px bg-border" />
            <div className="text-center"><p className="text-xl font-bold gradient-text">{customerProfile?.subscription ? '⭐' : '—'}</p><p className="text-text-dim text-[10px]">Plan</p></div>
          </div>
          {streak > 0 && (
            <div className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold animate-pulse">
              <span>🔥</span> {streak} Visit Streak!
            </div>
          )}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-text-dim mb-3">Your Badges 🏆</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {badges.map((b, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border min-w-[70px] shadow-sm animate-scaleIn" style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="text-2xl mb-1 drop-shadow-md">{b.icon}</span>
                  <span className="text-[10px] font-bold text-center text-text-dim whitespace-nowrap">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-dim font-medium">🎁 Your Referral Code</p>
              <p className="text-xl font-bold gradient-text tracking-widest mt-0.5">{referralCode}</p>
              <p className="text-[10px] text-text-dim mt-0.5">Share to earn rewards</p>
            </div>
            <div className="flex gap-2">
              {navigator.share && (
                <button onClick={() => {
                  navigator.share({
                    title: 'Line Free VIP Invite',
                    text: `Join me on Line Free and use my code ${referralCode} to get VIP perks!`,
                    url: window.location.origin
                  }).catch(console.error);
                }} className="p-3 rounded-xl bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-colors active:scale-95 shadow-sm">
                  📤
                </button>
              )}
              <button onClick={() => { navigator.clipboard.writeText(referralCode); triggerHaptic('success'); alert('Copied!'); }} className="p-3 rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors active:scale-95 shadow-sm">
                📋
              </button>
            </div>
          </div>
        </div>

        {/* Edit Fields */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.name')}</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.phone')}</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="+91 XXXXXXXXXX" type="tel" />
          </div>
          <div>
            <label className="text-sm text-text-dim mb-1 flex items-center justify-between">
              <span>🎂 Birthday</span>
              <span className="text-[9px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Optional</span>
            </label>
            <input type="date" className="input-field cursor-pointer text-text font-bold" />
            <p className="text-[10px] text-text-dim font-medium mt-1 uppercase tracking-widest pl-1">Unlock free rewards on your special day</p>
          </div>
          <div className="relative">
            <label className="text-sm text-text-dim mb-1 block">{t('profile.location')}</label>
            <input 
              value={fetchingAddr ? 'Detecting address...' : location} 
              onChange={e => setLocation(e.target.value)} 
              className={`input-field pr-10 ${fetchingAddr ? 'text-primary animate-pulse border-primary/50' : ''}`}
              placeholder="Your city / area" 
              disabled={fetchingAddr}
            />
            {fetchingAddr && (
              <div className="absolute right-3 top-[34px]">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="text-sm text-text-dim block">📌 Exact Map Location {t('profile.optional')}</label>
            </div>
            <LocationPicker 
              lat={lat} 
              lng={lng} 
              onChange={(l: number, g: number) => { setLat(l); setLng(g); }} 
              onAddressFound={(addr: string) => setLocation(addr)}
              isFetchingAddress={setFetchingAddr}
            />
          </div>
        </div>

        <button onClick={handleSave} className={`btn-primary w-full mb-6 ${saved ? 'bg-success/80' : ''}`}>
          {saved ? '✅ Saved!' : t('btn.save')}
        </button>

        {/* Settings & Preferences */}
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-bold text-text-dim mb-1 uppercase tracking-widest px-1">App Preferences</h3>
          
          {/* Notification Preferences */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold flex items-center gap-2"><span className="text-lg">💬</span> WhatsApp Alerts</span>
              <button 
                onClick={() => { setNotiWhatsapp(!notiWhatsapp); triggerHaptic('light'); }}
                className={`w-10 h-6 rounded-full transition-all flex items-center px-1 shadow-inner ${notiWhatsapp ? 'bg-success justify-end' : 'bg-card-2 border border-border justify-start'}`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-2"><span className="text-lg">🔔</span> Push Notifications</span>
              <button 
                onClick={() => { setNotiPush(!notiPush); triggerHaptic('light'); }}
                className={`w-10 h-6 rounded-full transition-all flex items-center px-1 shadow-inner ${notiPush ? 'bg-success justify-end' : 'bg-card-2 border border-border justify-start'}`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <div className="w-full h-px bg-border my-4" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold flex items-center gap-2"><span className="text-lg">🔕</span> Quiet Mode</span>
                <p className="text-[9px] text-text-dim mt-0.5 ml-7">Pause all marketing & promo alerts</p>
              </div>
              <button 
                onClick={() => { setNotiQuiet(!notiQuiet); triggerHaptic('light'); }}
                className={`w-10 h-6 rounded-full transition-all flex items-center px-1 shadow-inner ${notiQuiet ? 'bg-danger justify-end' : 'bg-card-2 border border-border justify-start'}`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
            <span className="text-sm font-bold flex items-center gap-2"><span className="text-lg">🌍</span> App Language</span>
            <select className="bg-card-2 border border-border rounded-lg px-2 py-1 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm outline-none cursor-pointer">
              <option value="en">English (US)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          {/* Data Export Utility */}
          <button onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customerProfile || { name: user?.displayName, email: user?.email }, null, 2));
            const dl = document.createElement('a'); 
            dl.href = dataStr; 
            dl.download = "linefree_my_data.json"; 
            dl.click();
            alert("Data Exported successfully!");
          }} className="w-full p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between active:scale-[0.98] transition-all hover:bg-card-2">
            <span className="text-sm font-bold flex items-center gap-2"><span className="text-lg">📥</span> Download My Data</span>
            <span className="text-text-dim text-[10px] uppercase font-black tracking-widest">JSON</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button onClick={() => nav('/customer/pets')} className="p-3 rounded-xl border border-border bg-card text-sm font-medium flex items-center gap-2 hover:border-primary/30 transition-all text-primary">
            <span>🐾</span> My Pets
          </button>
          <button onClick={() => { triggerHaptic('light'); nav('/customer/loyalty'); }} className="p-3 rounded-xl border border-border bg-card flex justify-between items-center hover:border-primary/30 transition-all active:scale-95 group">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span> 
              <div className="text-left">
                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors leading-tight">Loyalty Rewards</p>
                <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest mt-0.5">{customerProfile?.loyaltyPoints || 0} pts • {customerProfile?.currentStreak || 0}w Streak</p>
              </div>
            </div>
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="16" cy="16" r="14" className="stroke-border fill-none" strokeWidth="3" />
                <circle cx="16" cy="16" r="14" className="stroke-primary fill-none transition-all duration-1000" strokeWidth="3" strokeDasharray="88" strokeDashoffset={88 - (88 * Math.min(100, (customerProfile?.currentStreak || 0) * 10)) / 100} strokeLinecap="round" />
              </svg>
              <span className="absolute text-[8px] font-black text-primary group-hover:scale-110 transition-transform">{customerProfile?.currentStreak || 0}</span>
            </div>
          </button>
          <button onClick={() => nav('/customer/history')} className="p-3 rounded-xl border border-border bg-card text-sm font-medium flex items-center gap-2 hover:border-primary/30 transition-all">
            <span>📋</span> Visit History
          </button>
          <button onClick={() => nav('/customer/notifications')} className="p-3 rounded-xl border border-border bg-card text-sm font-medium flex items-center gap-2 hover:border-primary/30 transition-all relative">
            <span>🔔</span> Notifications
            {unreadCount > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-danger rounded-full text-[9px] text-white flex items-center justify-center font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          <button onClick={() => nav('/customer/subscription')} className="p-3 rounded-xl border border-border bg-card text-sm font-medium flex items-center gap-2 hover:border-primary/30 transition-all">
            <span>⭐</span> Subscription
          </button>
          <button onClick={toggleTheme} className="p-3 rounded-xl border border-border bg-card text-sm font-medium flex items-center gap-2 hover:border-primary/30 transition-all">
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span> {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full p-3 rounded-xl border border-danger/30 text-danger text-sm font-medium mb-4 hover:bg-danger/5 transition-all">
          {t('auth.logout')}
        </button>

        {/* Delete Account */}
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="w-full p-3 rounded-xl text-danger/60 text-xs text-center hover:text-danger transition-all">
            {t('delete.account')}
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 animate-fadeIn">
            <p className="text-danger font-bold mb-1">⚠️ Delete Account?</p>
            <p className="text-text-dim text-xs mb-3">This will permanently delete all your data. Type <strong>DELETE</strong> to confirm.</p>
            <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="Type DELETE" className="input-field mb-3 border-danger/30 text-center font-bold tracking-widest" />
            {deleteError && <p className="text-danger text-xs mb-2 text-center">{deleteError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); setDeleteError(''); }} className="flex-1 p-3 rounded-xl border border-border text-sm">Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleteInput !== 'DELETE' || deleting}
                className="flex-1 p-3 rounded-xl bg-danger text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</> : '🗑️ Delete'}
              </button>
            </div>
          </div>
        )}
        
        {/* Explicit spacer for BottomNav */}
        <div className="h-32" />
      </div>
      <BottomNav />
    </div>
  );
}
