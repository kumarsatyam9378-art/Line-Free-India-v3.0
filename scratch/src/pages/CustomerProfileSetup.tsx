import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import BackButton from '../components/BackButton';
import LocationPicker from '../components/LocationPicker';
import { triggerHaptic } from '../utils/haptics';

export default function CustomerProfileSetup() {
  const { user, saveCustomerProfile, customerProfile, t } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState(customerProfile?.name || user?.displayName || '');
  const [phone, setPhone] = useState(customerProfile?.phone || '');
  const [location, setLocation] = useState(customerProfile?.location || '');
  const [lat, setLat] = useState<number | undefined>(customerProfile?.lat);
  const [lng, setLng] = useState<number | undefined>(customerProfile?.lng);
  const [fetchingAddr, setFetchingAddr] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(() => !localStorage.getItem('lf_privacy_accepted'));

  const handleContinue = async () => {
    const profile = {
      uid: user?.uid || '',
      name: name || user?.displayName || 'Customer',
      phone: phone || '',
      location: location || '',
      photoURL: user?.photoURL || '',
      favoriteSalons: customerProfile?.favoriteSalons || [],
      subscription: customerProfile?.subscription || null,
      createdAt: customerProfile?.createdAt || Date.now(),
      lat, lng,
    };
    await saveCustomerProfile(profile);
    nav('/customer/home', { replace: true });
  };

  const handleSkip = async () => {
    const profile = {
      uid: user?.uid || '',
      name: user?.displayName || 'Customer',
      phone: '',
      location: '',
      photoURL: user?.photoURL || '',
      favoriteSalons: [],
      subscription: null,
      createdAt: Date.now(),
    };
    await saveCustomerProfile(profile);
    nav('/customer/home', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col p-6 animate-fadeIn">
      <BackButton to="/customer/auth" />

      {/* Privacy GDPR Modal — P95 */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card rounded-3xl p-6 w-full max-w-sm border border-border shadow-2xl animate-slideUp">
            <div className="text-center mb-4">
              <span className="text-4xl block mb-2">🔒</span>
              <h2 className="font-black text-lg">Your Data, Your Control</h2>
              <p className="text-text-dim text-xs mt-1 leading-relaxed">We collect your name, phone, and location to connect you with local businesses. We never sell your data. GDPR ✓ CCPA ✓</p>
            </div>
            <div className="space-y-2 mt-4">
              <button onClick={() => { triggerHaptic('success'); localStorage.setItem('lf_privacy_accepted', '1'); setShowPrivacy(false); }} className="w-full py-3.5 rounded-2xl bg-primary text-white font-black text-sm active:scale-95 transition-all shadow-lg shadow-primary/30">
                ✅ I Agree &amp; Continue
              </button>
              <button onClick={() => setShowPrivacy(false)} className="w-full py-3 rounded-2xl bg-card-2 border border-border text-text-dim text-sm font-bold active:scale-95 transition-all">
                Read Full Policy
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col pt-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-card-2 flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-20 h-20 rounded-full object-cover" alt="" />
            ) : (
              <span className="text-4xl">👤</span>
            )}
          </div>
          <h1 className="text-xl font-bold">{t('profile.setup')}</h1>
          <p className="text-text-dim text-sm mt-1">All fields are optional</p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto w-full">
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.name')} {t('profile.optional')}</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-text-dim mb-1 block">{t('profile.phone')} {t('profile.optional')}</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 XXXXXXXXXX"
              className="input-field"
              type="tel"
            />
          </div>
          <div className="relative">
            <label className="text-sm text-text-dim mb-1 block">{t('profile.location')} {t('profile.optional')}</label>
            <input
              value={fetchingAddr ? 'Detecting address...' : location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Your city or area"
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
              onChange={(l: number, g: number) => { setLat(l); setLng(g); }} 
              onAddressFound={(addr: string) => setLocation(addr)}
              isFetchingAddress={setFetchingAddr}
            />
          </div>
        </div>

        <div className="mt-8 space-y-3 max-w-sm mx-auto w-full">
          <button onClick={handleContinue} className="btn-primary">
            {t('btn.continue')} →
          </button>
          <button onClick={handleSkip} className="btn-secondary">
            {t('btn.skip')} →
          </button>
        </div>
      </div>
    </div>
  );
}
