import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, ServiceItem } from '../store/AppContext';
import BottomNav from '../components/BottomNav';
import BackButton from '../components/BackButton';
import LocationPicker from '../components/LocationPicker';

export default function BarberProfile() {
  const { user, businessProfile, saveBusinessProfile, syncPending, signOutUser, deleteAccount, uploadPhoto, theme, toggleTheme, unreadCount, t } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState(businessProfile?.name || '');
  const [salonName, setSalonName] = useState(businessProfile?.businessName || businessProfile?.salonName || '');
  const [location, setLocation] = useState(businessProfile?.location || '');
  const [lat, setLat] = useState<number | undefined>(businessProfile?.lat);
  const [lng, setLng] = useState<number | undefined>(businessProfile?.lng);
  const [phone, setPhone] = useState(businessProfile?.phone || '');
  const [fetchingAddr, setFetchingAddr] = useState(false);
  const [upiId, setUpiId] = useState(businessProfile?.upiId || '');
  const [businessHours, setBusinessHours] = useState(businessProfile?.businessHours || '');
  const [maxCapacity, setMaxCapacity] = useState<number | ''>(businessProfile?.maxCapacity || '');
  const [bio, setBio] = useState(businessProfile?.bio || '');
  const [instagram, setInstagram] = useState(businessProfile?.instagram || '');
  const [services, setServices] = useState<ServiceItem[]>(businessProfile?.services || []);
  const [products, setProducts] = useState<{id: string, name: string, price: number, stock?: number}[]>(businessProfile?.products || []);
  const [promoCodes, setPromoCodes] = useState<{code: string, type: 'percentage' | 'flat', value: number, active: boolean}[]>(businessProfile?.promoCodes || []);
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'flat'>('percentage');
  const [newPromoValue, setNewPromoValue] = useState('');
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newStock, setNewStock] = useState('');
  const [staffList, setStaffList] = useState<{id: string, name: string, isAvailable: boolean}[]>(businessProfile?.staffMembers || []);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [blockedDates, setBlockedDates] = useState<string[]>(businessProfile?.blockedDates || []);
  const [showAddDate, setShowAddDate] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!businessProfile) return;
    await saveBusinessProfile({ ...businessProfile, name: name || businessProfile.name, businessName: salonName || businessProfile.businessName, salonName: salonName || businessProfile.salonName, location, lat, lng, phone, upiId, businessHours, bio, instagram, services, staffMembers: staffList, blockedDates, products, promoCodes, maxCapacity: typeof maxCapacity === 'number' ? maxCapacity : undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !businessProfile) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file, `line-free/businesses/${user.uid}`);
      await saveBusinessProfile({ ...businessProfile, photoURL: url });
    } catch { alert('Upload failed'); }
    setUploading(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !businessProfile) return;
    setUploadingBanner(true);
    try {
      const url = await uploadPhoto(file, `line-free/businesses/${user.uid}`);
      await saveBusinessProfile({ ...businessProfile, bannerImageURL: url, salonImageURL: url });
    } catch { alert('Upload failed'); }
    setUploadingBanner(false);
  };

  const addService = () => {
    if (!newName.trim()) return;
    setServices([...services, { id: Date.now().toString(), name: newName.trim(), price: parseInt(newPrice) || 0, avgTime: parseInt(newTime) || 15 }]);
    setNewName(''); setNewPrice(''); setNewTime(''); setShowAdd(false);
  };
  const removeService = (id: string) => setServices(services.filter(s => s.id !== id));

  const addProduct = () => {
    if (!newName.trim()) return;
    setProducts([...products, { id: Date.now().toString(), name: newName.trim(), price: parseInt(newPrice) || 0, stock: parseInt(newStock) || 10 }]);
    setNewName(''); setNewPrice(''); setNewStock(''); setShowAddProduct(false);
  };
  const removeProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

  const addPromoCode = () => {
    if (!newPromoCode.trim() || !newPromoValue) return;
    setPromoCodes([...promoCodes, { code: newPromoCode.trim().toUpperCase(), type: newPromoType, value: parseFloat(newPromoValue), active: true }]);
    setNewPromoCode(''); setNewPromoValue(''); setShowAddPromo(false);
  };
  const removePromoCode = (code: string) => setPromoCodes(promoCodes.filter(p => p.code !== code));
  const togglePromoCode = (code: string) => setPromoCodes(promoCodes.map(p => p.code === code ? { ...p, active: !p.active } : p));

  const addStaff = () => {
    if (!newStaffName.trim()) return;
    setStaffList([...staffList, { id: Date.now().toString(), name: newStaffName.trim(), isAvailable: true }]);
    setNewStaffName(''); setShowAddStaff(false);
  };
  const removeStaff = (id: string) => setStaffList(staffList.filter(s => s.id !== id));
  const toggleStaffStatus = (id: string) => setStaffList(staffList.map(s => s.id === id ? { ...s, isAvailable: !s.isAvailable } : s));

  const handleLogout = async () => { await signOutUser(); nav('/', { replace: true }); };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleting(true);
    const result = await deleteAccount();
    if (result.success) nav('/', { replace: true });
    else { setDeleteError(result.error || 'Failed'); setDeleting(false); }
  };

  const handleShare = () => {
    const bookingUrl = `${window.location.origin}/customer/salon/${user?.uid}`;
    const text = `Check out my business "${businessProfile?.businessName || businessProfile?.salonName}" on Line Free! 🚀\n📍 ${location}\n📞 ${phone}\n\nServices:\n${services.map(s => `• ${s.name} - ₹${s.price}`).join('\n')}\n\nBook your token online — skip the queue! 🎫\n\n🔗 ${bookingUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const fields = [name, salonName, location, phone, upiId];
  const completion = Math.round(((fields.filter(f => f.trim()).length + (services.length > 0 ? 1 : 0)) / (fields.length + 1)) * 100);
  const referralCode = businessProfile?.referralCode || `LF${user?.uid.slice(0, 6).toUpperCase()}`;

  return (
    <div className="min-h-[100dvh] pb-40 animate-fadeIn">
      <div className="p-6 pb-40">
        <BackButton to="/barber/home" />
        <h1 className="text-2xl font-bold mb-5">{t('profile')}</h1>

        {/* Banner Photo */}
        <div className="relative h-32 rounded-2xl bg-card-2 mb-4 overflow-hidden">
          {businessProfile?.bannerImageURL || businessProfile?.salonImageURL ? (
            <img src={businessProfile.bannerImageURL || businessProfile.salonImageURL} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🏪</div>
          )}
          <button onClick={() => bannerRef.current?.click()} disabled={uploadingBanner}
            className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium backdrop-blur flex items-center gap-1">
            {uploadingBanner ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : '📷'} {uploadingBanner ? 'Uploading...' : 'Change Banner'}
          </button>
        </div>
        <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />

        {/* Avatar + Info */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-card-2 ring-2 ring-primary/30">
              {businessProfile?.photoURL ? <img src={businessProfile.photoURL} className="w-16 h-16 object-cover" alt="" /> : <div className="w-16 h-16 flex items-center justify-center text-3xl">🏪</div>}
            </div>
            <button onClick={() => avatarRef.current?.click()} disabled={uploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
              {uploading ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <span className="text-[10px]">📷</span>}
            </button>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <div>
            <p className="font-bold">{salonName || businessProfile?.businessName || businessProfile?.salonName || 'My Business'}</p>
            <p className="text-text-dim text-sm">{user?.email}</p>
            {businessProfile?.rating && <p className="text-gold text-xs font-semibold mt-0.5">⭐ {businessProfile.rating} ({businessProfile.totalReviews || 0} reviews)</p>}
          </div>
        </div>

        {/* Profile Completion */}
        <div className="mb-5 p-3 rounded-xl bg-card border border-border">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Profile Completion</p>
            <p className="text-sm font-bold gradient-text">{completion}%</p>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completion}%` }} />
          </div>
          {completion < 100 && <p className="text-text-dim text-[10px] mt-1.5">Complete profile to attract more customers!</p>}
        </div>

        {syncPending && (
          <div className="mb-4 p-2 rounded-lg bg-primary/10 flex items-center gap-2 justify-center">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-primary text-[11px]">Syncing...</p>
          </div>
        )}

        {/* Referral Code */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-dim">🎁 Your Referral Code</p>
              <p className="text-xl font-bold gradient-text tracking-widest">{referralCode}</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(referralCode); alert('Copied!'); }} className="p-2 rounded-xl bg-primary/20 text-primary text-sm">📋</button>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4 mb-5">
          {[
            { label: t('profile.name'), val: name, set: setName, placeholder: 'Owner name' },
            { label: t('profile.businessName'), val: salonName, set: setSalonName, placeholder: 'Business name' },
            { label: t('profile.phone'), val: phone, set: setPhone, placeholder: '+91 XXXXXXXXXX', type: 'tel' },
            { label: 'UPI ID', val: upiId, set: setUpiId, placeholder: 'yourname@upi' },
            { label: 'Business Hours', val: businessHours, set: setBusinessHours, placeholder: '9 AM - 8 PM' },
            { label: 'Max Queue Capacity', val: maxCapacity.toString(), set: (v: string) => setMaxCapacity(v ? parseInt(v) : ''), placeholder: 'Auto-pause limit (e.g., 10)', type: 'number' },
            { label: 'Bio', val: bio, set: setBio, placeholder: 'Tell customers about your salon...' },
            { label: 'Instagram', val: instagram, set: setInstagram, placeholder: '@username' },
          ].map(({ label, val, set, placeholder, type }) => (
            <div key={label}>
              <label className="text-sm text-text-dim mb-1 block">{label}</label>
              <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder} type={type || 'text'} className="input-field" />
            </div>
          ))}

          <div className="relative">
            <label className="text-sm text-text-dim mb-1 block">{t('profile.location')} {t('profile.optional')}</label>
            <input 
              value={fetchingAddr ? 'Detecting address...' : location} 
              onChange={e => setLocation(e.target.value)} 
              placeholder="Area, City" 
              className={`input-field pr-10 ${fetchingAddr ? 'text-primary animate-pulse border-primary/50' : ''}`}
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
              onChange={(l, g) => { setLat(l); setLng(g); }} 
              onAddressFound={(addr) => setLocation(addr)}
              isFetchingAddress={setFetchingAddr}
            />
          </div>
        </div>

        {/* Services */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">{t('services')}</h3>
            <button onClick={() => setShowAdd(v => !v)} className="text-primary text-sm font-medium">+ {t('services.add')}</button>
          </div>
          {showAdd && (
            <div className="p-4 rounded-2xl bg-card border border-primary/20 mb-3 animate-fadeIn space-y-3">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Service name" className="input-field" />
              <div className="flex gap-2">
                <input value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Price ₹" className="input-field" type="number" />
                <input value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="Time (min)" className="input-field" type="number" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 p-3 rounded-xl border border-border text-sm">{t('btn.cancel')}</button>
                <button onClick={addService} className="flex-1 btn-primary text-sm">{t('services.add')}</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-text-dim text-xs">₹{s.price} • ~{s.avgTime}min</p>
                </div>
                <button onClick={() => removeService(s.id)} className="w-7 h-7 rounded-full bg-danger/10 text-danger flex items-center justify-center text-sm">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Products / POS */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">🛍️ Sell Products (POS)</h3>
            <button onClick={() => setShowAddProduct(v => !v)} className="text-primary text-sm font-medium">+ Add Product</button>
          </div>
          {showAddProduct && (
            <div className="p-4 rounded-2xl bg-card border border-primary/20 mb-3 animate-fadeIn space-y-3">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Product Name (e.g. Hair Wax)" className="input-field" />
              <div className="flex gap-2">
                <input value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Price ₹" className="input-field" type="number" />
                <input value={newStock} onChange={e => setNewStock(e.target.value)} placeholder="Stock left" className="input-field" type="number" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddProduct(false)} className="flex-1 p-3 rounded-xl border border-border text-sm">Cancel</button>
                <button onClick={addProduct} className="flex-1 btn-primary text-sm">Add</button>
              </div>
            </div>
          )}
          {products.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-border text-center text-text-dim text-sm">
              List products like gel, wax, or shampoo for customers to buy during checkout.
            </div>
          ) : (
            <div className="space-y-2">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-primary font-bold text-xs">₹{p.price} <span className="text-text-dim text-[10px] ml-1">({p.stock || 0} in stock)</span></p>
                  </div>
                  <button onClick={() => removeProduct(p.id)} className="w-7 h-7 rounded-full bg-danger/10 text-danger flex items-center justify-center text-sm">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Promo Codes */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">🎟️ Promo Codes</h3>
            <button onClick={() => setShowAddPromo(v => !v)} className="text-primary text-sm font-medium">+ Add Promo</button>
          </div>
          {showAddPromo && (
            <div className="p-4 rounded-2xl bg-card border border-primary/20 mb-3 animate-fadeIn space-y-3">
              <input value={newPromoCode} onChange={e => setNewPromoCode(e.target.value.toUpperCase())} placeholder="Code (e.g. SUMMER20)" className="input-field uppercase" />
              <div className="flex gap-2">
                <select value={newPromoType} onChange={e => setNewPromoType(e.target.value as 'percentage' | 'flat')} className="input-field flex-1">
                  <option value="percentage">% Discount</option>
                  <option value="flat">Flat ₹ Off</option>
                </select>
                <input value={newPromoValue} onChange={e => setNewPromoValue(e.target.value)} placeholder="Amount" className="input-field flex-1" type="number" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddPromo(false)} className="flex-1 p-3 rounded-xl border border-border text-sm">Cancel</button>
                <button onClick={addPromoCode} className="flex-1 btn-primary text-sm">Create</button>
              </div>
            </div>
          )}
          {promoCodes.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-border text-center text-text-dim text-sm">
              Create discount codes to attract more customers.
            </div>
          ) : (
            <div className="space-y-2">
              {promoCodes.map(p => (
                <div key={p.code} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${p.active ? 'bg-success' : 'bg-text-dim'}`} />
                    <div>
                      <p className="font-bold text-sm tracking-widest">{p.code}</p>
                      <p className="text-primary font-bold text-xs">{p.type === 'percentage' ? `${p.value}% OFF` : `₹${p.value} OFF`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => togglePromoCode(p.code)} className="p-2 rounded-lg bg-card-2 border border-border text-xs font-semibold">{p.active ? 'Pause' : 'Enable'}</button>
                     <button onClick={() => removePromoCode(p.code)} className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center text-sm font-bold">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff Management */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">✂️ Staff & Chairs</h3>
            <button onClick={() => setShowAddStaff(v => !v)} className="text-primary text-sm font-medium">+ Add Staff</button>
          </div>
          {showAddStaff && (
            <div className="p-4 rounded-2xl bg-card border border-primary/20 mb-3 animate-fadeIn space-y-3">
              <input value={newStaffName} onChange={e => setNewStaffName(e.target.value)} placeholder="Staff Name" className="input-field" />
              <div className="flex gap-2">
                <button onClick={() => setShowAddStaff(false)} className="flex-1 p-3 rounded-xl border border-border text-sm">Cancel</button>
                <button onClick={addStaff} className="flex-1 btn-primary text-sm">Add</button>
              </div>
            </div>
          )}
          {staffList.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-border text-center text-text-dim text-sm">
              Currently working solo. Add staff if you have multiple chairs.
            </div>
          ) : (
            <div className="space-y-2">
              {staffList.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${s.isAvailable ? 'bg-success' : 'bg-text-dim'}`} />
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <button onClick={() => toggleStaffStatus(s.id)} className="text-[10px] text-primary/70 font-medium">Toggle Status</button>
                    </div>
                  </div>
                  <button onClick={() => removeStaff(s.id)} className="p-2 rounded-lg bg-danger/10 text-danger text-xs">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vacation Management */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">🏖️ Block Dates (Leave)</h3>
            <button onClick={() => setShowAddDate(v => !v)} className="text-primary text-sm font-medium">+ Add Date</button>
          </div>
          {showAddDate && (
            <div className="p-4 rounded-2xl bg-card border border-primary/20 mb-3 animate-fadeIn space-y-3">
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="input-field" />
              <div className="flex gap-2">
                <button onClick={() => setShowAddDate(false)} className="flex-1 p-3 rounded-xl border border-border text-sm">Cancel</button>
                <button onClick={() => {
                  if (newDate && !blockedDates.includes(newDate)) {
                    setBlockedDates([...blockedDates, newDate].sort());
                  }
                  setNewDate('');
                  setShowAddDate(false);
                }} className="flex-1 btn-primary text-sm">Add</button>
              </div>
            </div>
          )}
          {blockedDates.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-border text-center text-text-dim text-sm">
              No upcoming leaves. Add dates to block online booking.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {blockedDates.map(d => (
                <div key={d} className="flex items-center gap-2 p-2 px-3 rounded-lg bg-danger/10 text-danger border border-danger/20 text-xs font-bold w-max animate-scaleIn">
                  <span>📅 {new Date(d).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <button onClick={() => setBlockedDates(blockedDates.filter(bd => bd !== d))} className="w-5 h-5 rounded-full bg-danger/20 flex items-center justify-center ml-1 font-normal hover:bg-danger hover:text-white transition-colors">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleSave} className={`btn-primary w-full mb-3 ${saved ? 'bg-success' : ''}`}>
          {saved ? '✅ Saved!' : t('btn.save')}
        </button>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button onClick={handleShare} className="p-3 rounded-xl border border-border bg-card text-sm font-medium flex items-center gap-2">
            <span>📱</span> Share Salon
          </button>
          <button onClick={() => nav('/barber/dashboard')} className="p-3 rounded-xl border border-border bg-card text-sm font-medium flex items-center gap-2">
            <span>🎯</span> Dashboard
          </button>
          <button onClick={() => nav('/barber/qr')} className="p-3 rounded-xl border border-border bg-card text-sm font-medium flex items-center gap-2">
            <span>🔲</span> My QR Code
          </button>
          <button onClick={() => nav('/barber/analytics')} className="p-3 rounded-xl border border-border bg-card text-sm font-medium flex items-center gap-2">
            <span>📊</span> Analytics
          </button>
          <button onClick={() => nav('/barber/notifications')} className="p-3 rounded-xl border border-border bg-card text-sm font-medium flex items-center gap-2 relative">
            <span>🔔</span> Notifications
            {unreadCount > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-danger rounded-full text-[9px] text-white flex items-center justify-center">{unreadCount}</span>}
          </button>
          <button onClick={toggleTheme} className="p-3 rounded-xl border border-border bg-card text-sm font-medium flex items-center gap-2">
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span> {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <button onClick={handleLogout} className="w-full p-3 rounded-xl border border-danger/30 text-danger text-sm font-medium mb-4 hover:bg-danger/5 transition-all">
          {t('auth.logout')}
        </button>

        {/* Delete Account */}
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="w-full p-2 text-danger/50 text-xs hover:text-danger transition-all">
            {t('delete.account')}
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 animate-fadeIn">
            <p className="text-danger font-bold mb-1">⚠️ Delete Business Account?</p>
            <p className="text-text-dim text-xs mb-3">All business data, tokens, reviews will be deleted. Type <strong>DELETE</strong> to confirm.</p>
            <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="Type DELETE" className="input-field mb-3 border-danger/30 text-center font-bold tracking-widest" />
            {deleteError && <p className="text-danger text-xs mb-2 text-center">{deleteError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} className="flex-1 p-3 rounded-xl border border-border text-sm">Cancel</button>
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
