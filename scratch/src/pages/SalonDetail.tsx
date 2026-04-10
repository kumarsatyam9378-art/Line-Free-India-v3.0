import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp, BusinessProfile, ServiceItem, TokenEntry, ReviewEntry, getCategoryInfo } from '../store/AppContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet } from 'react-helmet-async';
import BackButton from '../components/BackButton';
import { triggerHaptic } from '../utils/haptics';

export default function SalonDetail() {
  const { id } = useParams<{ id: string }>();
  const { getBusinessById, getSalonTokens, getToken, user, customerProfile, addReview, getSalonReviews, allSalons, toggleFavorite, isFavorite, t, toggleFollow } = useApp();
  const nav = useNavigate();
  // Using 'business' state but alias it internally for ease
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ServiceItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [getting, setGetting] = useState(false);
  const [getError, setGetError] = useState('');
  const [tokenResult, setTokenResult] = useState<{ tokenNumber: number; waitTime: number; tokenId: string } | null>(null);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewStaffId, setReviewStaffId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'services' | 'store' | 'reviews' | 'portfolio'>('services');
  const [advanceDate, setAdvanceDate] = useState('');
  const [isTatkal, setIsTatkal] = useState(false);
  const [groupSize, setGroupSize] = useState(1);
  const [assignedStaffId, setAssignedStaffId] = useState<string | undefined>();
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<any | null>(null);
  const [viewingStory, setViewingStory] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [showSocialProof, setShowSocialProof] = useState(false);
  const [socialProofCount, setSocialProofCount] = useState(0);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, type: 'percentage' | 'flat', value: number} | null>(null);
  const [activeTokenCount, setActiveTokenCount] = useState<number>(0);
  const [currentWaitTime, setCurrentWaitTime] = useState<number>(0);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [tipAmount, setTipAmount] = useState<number>(0);
  const TATKAL_FEE = 50;

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  const isAdvanceSub = customerProfile?.subscription?.includes('Advance');

  useEffect(() => {
    if (id) {
      const realtime = allSalons.find(s => s.uid === id);
      if (realtime) { setBusiness(realtime as BusinessProfile); setLoading(false); }
      else getBusinessById(id).then(s => { setBusiness(s as BusinessProfile); setLoading(false); });
    }
  }, [id, allSalons]);

  useEffect(() => {
    if (id) getSalonReviews(id).then(setReviews);
  }, [id]);

  useEffect(() => {
    if (viewingStory) {
      setStoryProgress(0);
      const iv = setInterval(() => setStoryProgress(p => p + 2), 100);
      return () => clearInterval(iv);
    }
  }, [viewingStory]);

  useEffect(() => {
    if (storyProgress >= 100) setViewingStory(false);
  }, [storyProgress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSocialProofCount(Math.floor(Math.random() * 5) + 2);
      setShowSocialProof(true);
      setTimeout(() => setShowSocialProof(false), 4000);
    }, 3000 + Math.random() * 2000);
    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    if (id && business) {
      const q = query(collection(db, 'tokens'), where('salonId', '==', id), where('date', '==', advanceDate || today));
      const unsub = onSnapshot(q, snap => {
        const activeDocs = snap.docs.map(d => d.data()).filter(s => s.status === 'waiting' || s.status === 'serving');
        setActiveTokenCount(activeDocs.length);
        
        let mWait = activeDocs.reduce((acc, doc) => acc + (doc.totalTime || 0) * (doc.groupSize || 1), 0);
        setCurrentWaitTime(mWait + (business.queueDelayMinutes || 0));
      });
      return () => unsub();
    } else {
      setActiveTokenCount(0);
      setCurrentWaitTime(0);
    }
  }, [id, business, advanceDate, today]);


  const toggleService = (s: ServiceItem) => {
    triggerHaptic('light');
    setSelected(prev => prev.find(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const scaleSize = Object.is(img.width, 0) ? 1 : MAX_WIDTH / img.width;
          canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
          canvas.height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setReviewImages(prev => [...prev, dataUrl]);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const addProduct = (p: {id: string, name: string, price: number}) => {
    triggerHaptic('light');
    setSelected(prev => [...prev, { ...p, id: `${p.id}_prod_${Date.now()}_${Math.random()}`, avgTime: 0 }]);
  };

  const removeProduct = (originalId: string) => {
    triggerHaptic('light');
    setSelected(prev => {
      const idx = prev.findIndex(x => x.id.startsWith(originalId + '_prod_'));
      if (idx !== -1) {
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      }
      return prev;
    });
  };

  const totalTime = selected.reduce((a, s) => a + s.avgTime, 0) * groupSize;
  const rawPrice = selected.reduce((a, s) => a + s.price * (s.id.includes('_prod_') ? 1 : groupSize), 0);
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      discountAmount = Math.round((rawPrice * appliedPromo.value) / 100);
    } else {
      discountAmount = appliedPromo.value;
    }
  }
  const maxDiscount = Math.min(discountAmount, rawPrice); // Can't have negative price
  const totalPrice = (rawPrice - maxDiscount) + (isTatkal ? TATKAL_FEE : 0);

  const handleApplyPromo = () => {
    triggerHaptic('light');
    if (!business?.promoCodes || !promoCodeInput.trim()) return;
    const promo = business.promoCodes.find(p => p.code === promoCodeInput.trim().toUpperCase() && p.active);
    if (promo) {
      setAppliedPromo(promo);
      setPromoCodeInput('');
    } else {
      setAppliedPromo(null);
      alert('Invalid or expired promo code');
    }
  };

  const handleGetToken = async () => {
    if (!business) return;
    if (!user) {
      setGetError('Please login to continue');
      return;
    }
    
    // Proactive Profile Check
    if (!customerProfile?.name || !customerProfile?.phone) {
      setGetError('Please complete your profile (name & phone) in the Profile section to book.');
      triggerHaptic('notification_error');
      return;
    }

    setGetting(true);
    setGetError('');

    try {
      const bookingDate = advanceDate || today;
      const isAdvance = advanceDate !== '' && advanceDate !== today;

      const existingTokens = await getSalonTokens(business.uid, bookingDate);
      const maxToken = existingTokens.length > 0 ? Math.max(...existingTokens.map(t => t.tokenNumber)) : 0;
      const newTokenNumber = maxToken + 1;

      const activeTokens = existingTokens.filter(t => t.status === 'waiting' || t.status === 'serving');
      let waitMinutes = 0;
      if (!isAdvance) {
        const servingToken = activeTokens.find(t => t.status === 'serving');
        const waitingTokens = activeTokens.filter(t => t.status === 'waiting');
        if (servingToken) waitMinutes += servingToken.totalTime;
        waitingTokens.forEach(t => { waitMinutes += t.totalTime; });
        if (business.queueDelayMinutes) waitMinutes += business.queueDelayMinutes;
      }

      const token: Omit<TokenEntry, 'id'> = {
        salonId: business.uid,
        salonName: business.businessName,
        customerId: user.uid,
        customerName: customerProfile?.name || user.displayName || 'Customer',
        customerPhone: customerProfile?.phone || '',
        tokenNumber: newTokenNumber,
        selectedServices: selected,
        totalTime,
        totalPrice,
        estimatedWaitMinutes: waitMinutes,
        status: 'waiting',
        createdAt: Date.now(),
        date: bookingDate,
        isAdvanceBooking: isAdvance,
        isTatkal,
        assignedStaffId,
        groupSize,
        promoCode: appliedPromo?.code,
        discountAmount: maxDiscount,
      };

      if (isTatkal) token.tatkalFee = TATKAL_FEE;
      if (isAdvance) token.advanceDate = advanceDate;
      if (specialInstructions.trim()) token.specialInstructions = specialInstructions.trim();
      if (tipAmount > 0) token.tipAmount = tipAmount;

      const currentTotalPrice = (totalPrice || 0) + (tipAmount || 0);
      token.totalPrice = currentTotalPrice;

      console.log('Final Token Object for Booking:', token);

      const tokenId = await getToken(token);
      if (tokenId) {
        triggerHaptic('heavy');
        setShowConfirm(false);
        setTimeout(() => {
          setTokenResult({ tokenNumber: newTokenNumber, waitTime: waitMinutes, tokenId });
        }, 300);
      } else {
        setGetError(`Failed to complete your ${term.noun.toLowerCase()}. Our server might be busy, please try again.`);
      }
    } catch (e: any) {
      console.error('Booking Critical Failure:', e);
      setGetError('Something went wrong: ' + (e?.message || 'Please try again'));
    } finally {
      setGetting(false);
    }
  };

  const handleWhatsAppShare = () => {
    if(!business) return;
    const bookingUrl = `${window.location.origin}/customer/salon/${business.uid}`;
    const info = getCategoryInfo(business.businessType);
    const text = `Check out ${business.businessName} on Line Free India! ${info.icon}\n📍 ${business.location || ''}\n🎫 Get your online ${info.terminology.noun.toLowerCase()} and save time!\n\n${info.terminology.item}s: ${business.services?.map(s => `${s.name} (₹${s.price})`).join(', ')}\n\n🔗 ${bookingUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSubmitReview = async () => {
    if (!business || !user) return;
    setSubmittingReview(true);
    triggerHaptic('medium');
    await addReview({
      salonId: business.uid,
      customerId: user.uid,
      customerName: customerProfile?.name || user.displayName || 'Customer',
      customerPhoto: customerProfile?.photoURL || user.photoURL || '',
      rating: reviewRating,
      comment: reviewComment,
      images: reviewImages,
      createdAt: Date.now(),
      staffId: reviewStaffId || undefined,
      staffName: reviewStaffId && business.staffMembers ? business.staffMembers.find(s => s.id === reviewStaffId)?.name : undefined,
    });
    setReviews(await getSalonReviews(business.uid));
    setShowReview(false);
    setReviewComment('');
    setReviewRating(5);
    setReviewImages([]);
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen p-6">
        <BackButton to="/customer/search" />
        <div className="text-center py-20">
          <span className="text-5xl block mb-3">😔</span>
          <p className="text-text-dim">Business not found</p>
        </div>
      </div>
    );
  }

  const catInfo = getCategoryInfo(business.businessType);
  const term = catInfo.terminology;

  // TOKEN / BOOKING SUCCESS SCREEN
  if (tokenResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fadeIn">
        <div className="text-center w-full max-w-sm">
          <div className="w-28 h-28 rounded-full bg-success/20 border-4 border-success/40 flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">{term.noun} Confirmed!</h1>
          <p className="text-text-dim mb-6">{business.businessName}</p>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 mb-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
            <p className="text-text-dim text-sm mb-1">Your {term.noun} ID</p>
            <p className="text-7xl font-black gradient-text my-2">{tokenResult.tokenNumber}</p>
            <div className="w-full h-px bg-border my-3" />
            <p className="text-text-dim text-sm">Estimated Wait</p>
            <p className="text-2xl font-bold text-accent mt-1">
              {tokenResult.waitTime > 0 ? `~${tokenResult.waitTime} ${term.unit}` : '🎉 You are next!'}
            </p>
            <div className="mt-4 space-y-1">
              {selected.map(s => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span className="text-text-dim">{s.name}</span>
                  <span className="font-medium">₹{s.price}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border/50">
                <span>Total</span>
                <span className="gradient-text">₹{totalPrice}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const shareText = `🎫 *${term.noun} Confirmed!*\n\n${catInfo.icon} *${business.businessName}*\n🔢 ID #: *${tokenResult.tokenNumber}*\n⏰ Wait: ~${tokenResult.waitTime} ${term.unit}\n💰 Total: ₹${totalPrice}\n📋 ${term.item}s: ${selected.map(s => s.name).join(', ')}\n\n_Powered by Line Free India_ 💄`;
              window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
            }}
            className="w-full p-4 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] font-semibold mb-3 flex items-center justify-center gap-2"
          >
            📲 Share on WhatsApp
          </button>

          <button onClick={() => nav('/customer/tokens')} className="btn-primary mb-3">
            🎫 View My Activity
          </button>
          <button onClick={() => nav('/customer/home')} className="btn-secondary">
            Go Home
          </button>

          <p className="text-text-dim text-xs mt-4">Please arrive 5-10 minutes before your time.</p>
        </div>
      </div>
    );
  }

  const bookingDate = advanceDate || today;
  const isBlockedDate = (business.blockedDates || []).includes(bookingDate);
  const isClosed = !business.isOpen;
  const isOnBreak = business.isBreak;
  const isStopped = business.isStopped;
  const canGetToken = business.isOpen && !business.isStopped && !isBlockedDate;
  const isQueueFull = business.maxCapacity ? activeTokenCount >= business.maxCapacity : false;

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/30 relative overflow-hidden">
      <Helmet>
        <title>{business.businessName} · Elite Universe</title>
      </Helmet>

      {/* 👑 Elite Aurora Background */}
      <div className="aurora-mesh-v2 opacity-30">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
      </div>

      <div className="relative z-10 p-6 pb-32 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8 pt-4">
          <BackButton to="/customer/search" />
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleFavorite(business.uid)} 
            className={`w-14 h-14 elite-glass rounded-3xl flex items-center justify-center text-xl transition-all border-white/10 ${isFavorite(business.uid) ? 'text-primary ring-2 ring-primary/20' : 'text-white/40'}`}
          >
            {isFavorite(business.uid) ? '❤️' : '🤍'}
          </motion.button>
        </div>

        {/* Flash Sale Banner */}
        {business.promoCodes && business.promoCodes.some(p => p.active) && (
          <div className="mt-4 mb-3 p-3 rounded-2xl bg-gradient-to-r from-success/90 to-success text-white shadow-lg flex items-center justify-between animate-pulse-glow border border-success">
            <div className="flex items-center gap-3">
              <span className="text-2xl drop-shadow-md">⚡</span>
              <div>
                <p className="font-black text-sm uppercase tracking-widest leading-tight">Flash Sale</p>
                <p className="text-[10px] font-bold opacity-90">Code: {business.promoCodes.find(p => p.active)?.code}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-lg bg-white/20 px-2.5 py-1 rounded-xl border border-white/30 backdrop-blur-sm shadow-inner">
                {business.promoCodes.find(p => p.active)?.type === 'percentage' 
                  ? `${business.promoCodes.find(p => p.active)?.value}%` 
                  : `₹${business.promoCodes.find(p => p.active)?.value}`} OFF
              </p>
            </div>
          </div>
        )}

        {/* Banner */}
        <div className={`${business.promoCodes?.some(p => p.active) ? 'mb-5' : 'mt-4 mb-5'}`}>
          <div className="w-full h-44 rounded-2xl bg-card-2 overflow-hidden mb-4 relative">
            {business.bannerImageURL ? (
              <img src={business.bannerImageURL} className="w-full h-44 object-cover" alt="" />
            ) : business.photoURL ? (
              <img src={business.photoURL} className="w-full h-44 object-cover" alt="" />
            ) : (
              <div className="w-full h-44 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <span className="text-6xl opacity-70">{catInfo.icon}</span>
              </div>
            )}
            <button onClick={() => toggleFavorite(business.uid)} className="absolute top-3 right-3 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-xl active:scale-90 transition-transform">
              {isFavorite(business.uid) ? '❤️' : '🤍'}
            </button>
            {business.stories && business.stories.length > 0 && (
              <button 
                onClick={() => setViewingStory(true)}
                className="absolute top-3 left-3 w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-gold to-primary shadow-xl z-10 animate-pulse-glow"
              >
                <div className="w-full h-full rounded-full bg-card border-2 border-background flex items-center justify-center overflow-hidden">
                  <img src={business.stories[business.stories.length-1].url} className="w-full h-full object-cover" alt="Story" />
                </div>
              </button>
            )}
            <div className="absolute bottom-3 left-3 flex gap-2">
              <span className={`badge text-xs shadow-md backdrop-blur-md border ${isClosed ? 'bg-danger/80 border-danger/50 text-white' : isOnBreak ? 'bg-warning/80 border-warning/50 text-white' : 'bg-success/80 border-success/50 text-white'}`}>
                {isClosed ? '🔴 Closed' : isOnBreak ? '🟡 On Break' : '🟢 Open'}
              </span>
              {isStopped && <span className="badge bg-card/80 border border-border text-white text-xs backdrop-blur-md">⚠️ Bookings Paused</span>}
            </div>
          </div>

          {/* Announcement Marquee */}
          {business.announcement && (
            <div className="w-full bg-accent/10 border border-accent/20 rounded-xl mb-4 overflow-hidden flex items-center px-3 py-2 shadow-sm">
              <span className="text-xl mr-2">📢</span>
              <div className="flex-1 overflow-hidden" dangerouslySetInnerHTML={{ __html: `<marquee scrollamount="5" class="text-sm font-bold text-accent">${business.announcement}</marquee>` }} />
            </div>
          )}

        <div className="mb-10">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl type-elite-display">{business.businessName}</h1>
                {(business as any).isVerified && (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs shadow-inner">⚡</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="type-elite-label opacity-40">{catInfo.label}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-sm font-bold text-white/60 tracking-tight">{business.name}</span>
              </div>
            </div>

            {business.rating && (
              <motion.div 
                whileHover={{ y: -5, rotateZ: 5 }}
                className="elite-glass p-4 rounded-[2rem] border-gold/20 flex flex-col items-center justify-center shadow-2xl min-w-[80px]"
              >
                <p className="text-gold font-black text-2xl tracking-tighter leading-none">⭐ {business.rating}</p>
                <p className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] mt-2">{business.totalReviews} Pulse</p>
              </motion.div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 px-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { triggerHaptic('medium'); toggleFollow(business.uid); }}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl ${
                customerProfile?.following?.includes(business.uid) 
                ? 'elite-glass text-white/40' 
                : 'bg-primary text-black shadow-primary/30'
              }`}
            >
              {customerProfile?.following?.includes(business.uid) ? 'Subscribed' : 'Join Universe'}
            </motion.button>
            <button
              onClick={() => {
                const text = `Check out ${business.businessName} on Line Free India! Current wait: ${currentWaitTime} mins. Join line: ${window.location.href}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="px-8 py-3 rounded-2xl elite-glass border-white/5 text-white/60 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Pulse Status
            </button>
          </div>
        </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <button 
                onClick={() => nav(`/customer/community/${business.uid}`)}
                className="w-full bg-accent/10 border border-accent/20 rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent text-xl">💬</div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest">Community Board</p>
                    <p className="text-xs text-text-dim font-bold">Ask about wait times & help others</p>
                  </div>
                </div>
                <div className="text-accent group-hover:translate-x-1 transition-transform">→</div>
              </button>
            </div>
              
              {business.location && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <p className="text-text-dim text-xs opacity-90">📍 {business.location}</p>
                  {(business.lat && business.lng) && (
                    <a href={`https://maps.google.com/?q=${business.lat},${business.lng}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#4285F4] text-[10px] font-bold hover:bg-[#4285F4]/20 transition-all ml-1 flex items-center gap-1">
                      🗺️ Map
                    </a>
                  )}
                </div>
              )}
              {business.phone && <p className="text-text-dim text-xs mt-1.5 font-medium">📞 {business.phone}</p>}
              {business.businessHours && <p className="text-accent text-xs mt-1 font-semibold">⏰ {business.businessHours}</p>}
              {business.bio && <p className="text-text-dim text-xs mt-2 italic px-3 border-l-2 border-primary/50 py-1">"{business.bio}"</p>}
            
            {business.rating && (
              <div className="text-center p-2.5 rounded-2xl bg-gold/10 border border-gold/30 ml-3 shadow-inner">
                <p className="text-gold font-bold text-lg leading-tight">⭐ {business.rating}</p>
                <p className="text-text-dim text-[9px] mt-0.5 font-medium">{business.totalReviews} reviews</p>
              </div>
            )}
          </div>

          {/* Feature Badges from category flags */}
          {(catInfo.hasHomeService || catInfo.hasEmergencySlot || catInfo.hasTimedSlots || catInfo.hasMenu) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {catInfo.hasHomeService && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1">
                  🏠 Home Service Available
                </span>
              )}
              {catInfo.hasEmergencySlot && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-danger/10 border border-danger/20 text-danger flex items-center gap-1">
                  ⚡ Emergency Slot
                </span>
              )}
              {catInfo.hasTimedSlots && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent/10 border border-accent/20 text-accent flex items-center gap-1">
                  📅 Appointments
                </span>
              )}
              {catInfo.hasMenu && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gold/10 border border-gold/20 text-gold flex items-center gap-1">
                  📍 Digital Menu
                </span>
              )}
              {catInfo.supportsGroupBooking && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-1">
                  👥 Group Booking
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button onClick={() => nav(`/customer/chat/${business.uid}`)} className="w-full py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary text-center hover:bg-primary/20 transition-colors">
              💬 Message
            </button>
            <button onClick={handleWhatsAppShare} className="w-full py-2.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 text-xs font-bold text-[#25D366] text-center hover:bg-[#25D366]/20 transition-colors">
              📲 Share
            </button>
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex flex-col items-center justify-center w-full py-2.5 rounded-2xl bg-accent/10 border border-accent/20 text-xs font-bold text-accent hover:bg-accent/20 transition-colors">
                📞 Call
              </a>
            )}
            {catInfo.hasVideoConsult && (
              <button onClick={() => nav(`/customer/consultation/${business.uid}`)} className="w-full py-2.5 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 text-xs font-bold text-[#4285F4] text-center hover:bg-[#4285F4]/20 transition-colors shadow-sm">
                📹 Video
              </button>
            )}
            {catInfo.hasEmergencySlot && (
              <button onClick={() => { setIsTatkal(true); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }} className="w-full py-2.5 rounded-2xl bg-danger/10 border border-danger/20 text-xs font-bold text-danger text-center hover:bg-danger/20 transition-colors shadow-sm animate-pulse-glow">
                ⚡ Emergency
              </button>
            )}
            {catInfo.hasHomeService && (
              <button onClick={() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); alert('Home Service option selected. Please confirm during checkout.'); }} className="w-full py-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-500 text-center hover:bg-blue-500/20 transition-colors shadow-sm">
                🏠 Home Visit
              </button>
            )}
          </div>
        </div>

        {/* 📊 Elite Live Analytics */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="mb-10 p-8 rounded-[3rem] elite-glass border-white/5 shadow-2xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Live Occupancy</p>
              <h3 className="type-elite-label text-white/40">Venue Pulse Analytics</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-ping" />
              Live
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-3 h-20">
            {[20, 30, 45, 80, 100, 65, 40, 15, 30, 50].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                <div 
                  className={`w-full rounded-full transition-all duration-700 origin-bottom group-hover/bar:brightness-150 ${h > 70 ? 'bg-gradient-to-t from-danger/20 to-danger shadow-[0_0_20px_rgba(255,107,107,0.3)]' : 'bg-white/5'}`} 
                  style={{ height: `${h}%` }} 
                />
                <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">{i + 9}h</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 🎚️ Elite Navigation Deck */}
        <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar pb-4 px-1">
          {[
            { id: 'services', label: catInfo.hasMenu ? 'The Menu' : 'Services', icon: '📋' },
            { id: 'portfolio', label: 'Gallery', icon: '📸', show: catInfo.id === 'photography' && business.portfolioImages?.length > 0 },
            { id: 'store', label: 'Boutique', icon: '🛍️', show: business.products?.length > 0 },
            { id: 'reviews', label: 'Community', icon: '⭐' }
          ].filter(t => t.show !== false).map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex-shrink-0 px-8 py-4 rounded-3xl type-elite-label transition-all border shadow-2xl ${activeTab === tab.id ? 'bg-primary border-primary text-black scale-105' : 'elite-glass border-white/5 text-white/30 hover:text-white'}`}
            >
              <span className="mr-2 opacity-50">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="animate-fadeIn">
            {(!canGetToken && (!isOnBreak || isBlockedDate)) && (
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 mb-5 flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-warning text-sm font-bold">
                  {isBlockedDate 
                    ? `${business.businessName} is on leave on ${new Date(bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.` 
                    : isClosed 
                      ? `${business.businessName} is currently closed.` 
                      : isStopped 
                        ? 'Bookings are paused for now.' 
                        : 'Currently taking a break, but you can still book.'}
                </p>
              </div>
            )}

            <div className="space-y-6 mb-12">
              <h3 className="type-elite-label text-white/30 px-2 mb-4 tracking-[0.3em]">{catInfo.hasMenu ? 'Curation' : `Tactical ${term.item}s`}</h3>
              
              {catInfo.hasMenu && business.menuItems && business.menuItems.length > 0 ? (
                Object.entries((business.menuItems || []).reduce((acc: any, item) => {
                  (acc[item.category || 'Other'] = acc[item.category || 'Other'] || []).push(item);
                  return acc;
                }, {})).map(([category, items]) => (
                  <div key={category} className="mb-10">
                    <h4 className="type-elite-display text-2xl mb-6 text-primary/80 px-2 tracking-widest">{category}</h4>
                    <div className="grid gap-4">
                      {(items as any[]).map(item => {
                        const isSelected = !!selected.find(x => x.id === item.id);
                        return (
                          <motion.div 
                            key={item.id} 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => (canGetToken || (isOnBreak && !isBlockedDate)) ? toggleService(item as any) : null} 
                            className={`spatial-perspective group relative`}
                          >
                            <div className={`p-6 rounded-[2.5rem] border transition-all spatial-card shadow-2xl flex gap-6 ${isSelected ? 'bg-white text-black border-white' : 'elite-glass border-white/5 text-white'}`}>
                              {item.photoUrl && (
                                <div className="w-32 h-32 rounded-3xl overflow-hidden border border-white/10 shadow-inner group-hover:rotate-2 transition-transform">
                                  <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 flex flex-col justify-center">
                                <p className="type-elite-label text-lg mb-2 leading-tight">{item.name}</p>
                                <div className="flex items-center gap-3">
                                  <p className={`text-2xl font-black ${isSelected ? 'text-black' : 'text-primary'}`}>₹{item.price}</p>
                                  {item.calories && <span className="px-2 py-1 rounded-lg bg-black/10 border border-black/5 text-[9px] font-black uppercase tracking-widest">{item.calories} KCAL</span>}
                                </div>
                                {item.description && <p className={`text-xs mt-3 line-clamp-2 opacity-60 leading-relaxed`}>{item.description}</p>}
                              </div>
                              <div className="flex items-center">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-black text-white' : 'bg-primary text-black shadow-lg shadow-primary/20'}`}>
                                  {isSelected ? '✓' : '+'}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : catInfo.id === 'gym' && business.memberships && business.memberships.length > 0 ? (
                business.memberships.map((plan) => {
                  const s = { id: plan.id, name: plan.name, price: plan.price, avgTime: 0 };
                  const isSelected = !!selected.find(x => x.id === s.id);
                  return (
                    <div
                      key={plan.id}
                      onClick={() => (canGetToken || (isOnBreak && !isBlockedDate)) ? toggleService(s) : null}
                      className={`w-full p-5 rounded-3xl border text-left transition-all relative overflow-hidden cursor-pointer shadow-sm mb-4 ${isSelected ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-md' : 'bg-card border-border hover:border-primary/40'} ${(isClosed || isStopped || isBlockedDate) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                      {/* Premium Accent */}
                      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl pointer-events-none -translate-y-10 translate-x-10 ${isSelected ? 'bg-primary/20' : 'bg-text-dim/5'}`} />
                      
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <div>
                          <p className={`font-black text-xl mb-1 ${isSelected ? 'text-primary' : 'text-text'}`}>{plan.name}</p>
                          <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{plan.durationDays} Days Pass</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]' : 'neu-inset text-text-dim border-transparent'}`}>
                          {isSelected ? '✓' : '+'}
                        </div>
                      </div>
                      
                      <div className="flex items-end justify-between relative z-10">
                        <p className={`font-black text-3xl tracking-tight ${isSelected ? 'gradient-text' : 'text-text'}`}>
                          ₹{plan.price}
                        </p>
                      </div>

                      {plan.features && plan.features.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50 space-y-2 relative z-10">
                          {plan.features.map((feat, idx) => (
                            <p key={idx} className="text-xs font-medium text-text-dim flex items-center gap-2">
                              <span className="text-success text-[10px]">🟢</span> {feat}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                business.services?.map(s => {
                  const isSelected = !!selected.find(x => x.id === s.id);
                  return (
                    <div
                      key={s.id}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-4 shadow-sm bg-card transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-text-dim/30'} ${(isClosed || isStopped || isBlockedDate) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                      <div className="flex-1">
                        <p className={`font-bold text-base`}>{s.name}</p>
                        <p className="text-text-dim text-xs font-medium mt-0.5">⏱ ~{s.avgTime} MIN</p>
                        <p className={`font-black text-lg gradient-text mt-1`}>₹{s.price}</p>
                      </div>

                      <button
                        onClick={() => {
                          if (canGetToken || (isOnBreak && !isBlockedDate)) {
                             triggerHaptic('medium');
                             setSelected([s]);
                             setShowConfirm(true);
                          }
                        }}
                        disabled={isClosed || isStopped || isBlockedDate}
                        className={`uv-btn-neon text-[10px] sm:text-xs py-2 px-4 whitespace-nowrap ${(isClosed || isStopped || isBlockedDate) ? 'opacity-50' : ''}`}
                      >
                         GET TOKEN
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Removed internal products rendering for Universal E-Store architecture */}

            {/* 👨‍✈️ Elite Staff Selection */}
            {business.staffMembers && business.staffMembers.length > 0 && selected.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <h3 className="type-elite-label text-white/30 px-2 mb-6 tracking-[0.3em]">Operational Personnel</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
                  <button 
                    onClick={() => setAssignedStaffId(undefined)}
                    className={`flex-shrink-0 px-8 py-4 rounded-3xl type-elite-label transition-all border shadow-2xl ${!assignedStaffId ? 'bg-primary text-black border-primary' : 'elite-glass border-white/5 text-white/40'}`}
                  >
                    Any Personnel
                  </button>
                  {business.staffMembers.filter(s => s.isAvailable).map(staff => (
                    <div 
                      key={staff.id}
                      className={`flex-shrink-0 elite-glass p-1.5 rounded-[2rem] border-white/5 transition-all shadow-2xl flex items-center gap-3 ${assignedStaffId === staff.id ? 'ring-2 ring-primary bg-primary/10' : ''}`}
                    >
                      <button 
                        onClick={() => { triggerHaptic('light'); setAssignedStaffId(staff.id); }} 
                        className={`flex items-center gap-4 px-6 py-2 type-elite-label transition-transform active:scale-95 ${assignedStaffId === staff.id ? 'text-primary' : 'text-white/60'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${assignedStaffId === staff.id ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-white/20'}`} />
                        {staff.name}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); triggerHaptic('medium'); setSelectedStaffProfile(staff); }} 
                        className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs hover:bg-white/10 transition-colors"
                      >
                        ℹ️
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Summary Ticket */}
            {selected.length > 0 && (
              <div className="p-5 rounded-3xl bg-card border-2 border-primary/20 mb-6 animate-slideUp overflow-hidden relative shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none -translate-y-10 translate-x-10" />
                <h3 className="font-bold text-lg mb-3">Booking Summary</h3>
                <div className="space-y-2 mb-4">
                  {selected.map(s => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span className="text-text-dim font-medium">{s.name} <span className="text-xs opacity-50">x{groupSize}</span></span>
                      <span className="font-bold">₹{s.price * groupSize}</span>
                    </div>
                  ))}
                  {isTatkal && (
                    <div className="flex justify-between text-sm text-gold font-bold bg-gold/5 p-2 rounded-lg border border-gold/10">
                      <span>🔥 Priority Access</span>
                      <span>₹{TATKAL_FEE}</span>
                    </div>
                  )}
                </div>
                <div className="w-full border-t border-dashed border-border mb-4" />
                <div className="flex justify-between font-black text-xl">
                  <span>Total</span>
                  <span className="gradient-text">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-xs text-text-dim mt-1 font-medium">
                  <span>Estimated Duration</span>
                  <span>~{totalTime} {term.unit}</span>
                </div>
              </div>
            )}

            {/* Group Size Selector */}
            {selected.length > 0 && (
              <div className="mb-6 p-5 rounded-3xl bg-card-2 border border-border flex items-center justify-between animate-slideUp shadow-sm">
                <div>
                  <h3 className="font-bold text-base">{catInfo.id === 'laundry' ? '🧺 Number of Pieces' : '👥 Booking for'}</h3>
                  <p className="text-xs text-text-dim mt-0.5">{catInfo.id === 'laundry' ? 'Total garments' : 'Friends or family?'}</p>
                </div>
                <div className="flex items-center gap-4 bg-background p-1.5 rounded-2xl border border-border">
                  <button onClick={() => setGroupSize(Math.max(1, groupSize - 1))} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center font-bold text-xl active:scale-95 disabled:opacity-30 border border-border shadow-sm text-text-dim" disabled={groupSize <= 1}>-</button>
                  <span className="font-black text-xl w-6 text-center">{groupSize}</span>
                  <button onClick={() => setGroupSize(Math.min(10, groupSize + 1))} className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl active:scale-95 shadow-md shadow-primary/30">+</button>
                </div>
              </div>
            )}

            {/* Repair Shop Special Instructions */}
            {catInfo.id === 'repair_shop' && selected.length > 0 && (
              <div className="mb-6 animate-slideUp">
                <label className="text-sm font-bold text-text-dim px-1 uppercase tracking-wider mb-2 block">📱 Device & Issue Details</label>
                <textarea
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                  placeholder="E.g., iPhone 13 Pro - Screen shattered and battery drains fast"
                  className="w-full p-4 rounded-2xl neu-inset text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                />
              </div>
            )}

            {/* Skip Option (Tatkal via generic term) */}
            {selected.length > 0 && (!advanceDate || advanceDate === today) && (
              <div 
                onClick={() => setIsTatkal(!isTatkal)}
                className={`mb-6 p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between animate-slideUp ${isTatkal ? 'bg-gold/10 border-gold shadow-xl shadow-gold/10' : 'bg-card border-border shadow-sm'}`}
              >
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2"><span className="text-2xl drop-shadow-md">🚀</span> Priority Access</h3>
                  <p className="text-xs text-text-dim mt-1 font-medium">Skip the queue instantly</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-gold text-lg">+₹{TATKAL_FEE}</span>
                  <div className={`w-12 h-7 rounded-full p-1 transition-colors ${isTatkal ? 'bg-gold' : 'bg-card-2 border border-border'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isTatkal ? 'translate-x-5' : ''} shadow-sm`} />
                  </div>
                </div>
              </div>
            )}

            {/* Advance Date */}
            {selected.length > 0 && catInfo.supportsGroupBooking && (
              <div className="mb-6 animate-slideUp">
                <label className="flex items-center gap-2 text-sm font-bold text-text-dim px-1 uppercase tracking-wider mb-3">
                  👥 Group Size
                </label>
                <div className="flex items-center justify-between bg-card-2 border border-border rounded-2xl p-2 w-max">
                  <button onClick={() => setGroupSize(Math.max(1, groupSize - 1))} className="w-10 h-10 rounded-xl bg-card border border-border text-lg font-bold text-text-dim hover:text-danger hover:border-danger/50 active:scale-95 transition-all shadow-sm">-</button>
                  <span className="w-12 text-center text-lg font-black gradient-text">{groupSize}</span>
                  <button onClick={() => setGroupSize(Math.min(10, groupSize + 1))} className="w-10 h-10 rounded-xl bg-card border border-border text-lg font-bold text-text-dim hover:text-success hover:border-success/50 active:scale-95 transition-all shadow-sm">+</button>
                </div>
              </div>
            )}
            
            {/* Advance Date */}
            {selected.length > 0 && (
              <div className="mb-8 animate-slideUp">
                <label className="flex items-center gap-2 text-sm font-bold text-text-dim px-1 uppercase tracking-wider mb-3">
                  📅 Schedule Date
                  {!isAdvanceSub && <span className="px-2 py-0.5 rounded border border-warning/50 bg-warning/10 text-warning text-[9px] uppercase font-black">Pro Only</span>}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAdvanceDate('')}
                    className={`flex-1 p-3.5 rounded-2xl text-sm font-bold border-2 transition-all shadow-sm ${!advanceDate || advanceDate === today ? 'bg-primary/10 border-primary text-primary' : 'neu-panel text-text-dim border-transparent'}`}
                  >
                     Today
                  </button>
                  <div className="flex-1 relative cursor-pointer group" onClick={() => { if(!isAdvanceSub && typeof window !== 'undefined') { window.alert('Advance booking requires Pro Subscription. Upgrade in settings!'); nav('/customer/subscription'); } }}>
                    <input
                      type="date"
                      value={advanceDate}
                      onChange={e => setAdvanceDate(e.target.value)}
                      min={today}
                      disabled={!isAdvanceSub}
                      className={`w-full h-full p-3 rounded-2xl neu-inset text-sm font-bold xl:pr-4 ${isAdvanceSub ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                    />
                    {!isAdvanceSub && <div className="absolute inset-0 z-10" />}
                  </div>
                </div>
                {advanceDate && advanceDate !== today && (
                  <div className="mt-3 p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-2">
                    <span className="text-lg">📆</span>
                    <p className="text-xs text-accent font-bold">Scheduled for: {new Date(advanceDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                  </div>
                )}
              </div>
            )}

            {(canGetToken || (isOnBreak && !isBlockedDate)) && selected.length > 0 && (
              <div className="sticky bottom-4 z-30 animate-slideUp pb-4">
                {isQueueFull ? (
                  <button disabled className="w-full py-4 rounded-full bg-danger border border-danger/50 text-white font-black text-lg shadow-sm flex items-center justify-center gap-2 opacity-90 grayscale-[0.2]">
                    Waitlist Full 🚫
                  </button>
                ) : (
                  <button onClick={() => { triggerHaptic('medium'); setShowConfirm(true); }} className="w-full py-4 rounded-full bg-primary text-white font-black text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    {advanceDate && advanceDate !== today ? `Advance ${term.action}` : term.action}
                    <span className="text-xl">➔</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Store Tab (E-Commerce) */}
        {activeTab === 'store' && business.products && (
          <div className="animate-fadeIn">
            {(!canGetToken && (!isOnBreak || isBlockedDate)) && (
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 mb-5 flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-warning text-sm font-bold">Store ordering is currently paused while {business.businessName} is closed.</p>
              </div>
            )}
            <div className="mb-6 flex items-center justify-between px-1">
              <div>
                <h3 className="font-black text-xl gradient-text">LineFree Store</h3>
                <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-0.5">Premium retail add-ons</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl border border-primary/20 animate-pulse">🛍️</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {business.products.map(p => {
                const count = selected.filter(x => x.id.startsWith(p.id + '_prod_')).length;
                return (
                  <div
                    key={p.id}
                    className={`rounded-3xl border overflow-hidden transition-all shadow-sm flex flex-col hover:border-primary/50 ${count > 0 ? 'bg-primary/5 border-primary ring-1 ring-primary/20 shadow-[0_4px_15px_rgba(var(--primary-color),0.15)]' : 'bg-card border-border'} ${(isClosed || isStopped || isBlockedDate) ? 'opacity-50 grayscale' : ''}`}
                  >
                    <div className="h-28 bg-gradient-to-br from-card-2 to-card border-b border-border/50 flex items-center justify-center relative inner-shadow group">
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-10 transition-opacity" />
                      <span className="text-5xl filter drop-shadow-md group-hover:scale-110 transition-transform">📦</span>
                      {count > 0 && <span className="absolute top-2 right-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-md animate-scaleIn">Selected</span>}
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-black text-sm text-text leading-tight mb-1 line-clamp-2">{p.name}</p>
                        <p className="font-black text-primary text-sm mb-4">₹{p.price}</p>
                      </div>

                      {(canGetToken || (isOnBreak && !isBlockedDate)) && (
                        count === 0 ? (
                           <button onClick={() => addProduct(p)} className="w-full py-2.5 rounded-xl bg-card-2 border border-border text-text font-bold text-xs uppercase tracking-wider hover:bg-primary hover:border-primary hover:text-white transition-all active:scale-[0.98]">
                            Add to Cart
                           </button>
                        ) : (
                          <div className="flex items-center justify-between bg-background rounded-xl p-1 border border-border shadow-inner">
                            <button onClick={() => removeProduct(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 bg-danger/10 text-danger hover:bg-danger/20 transition-colors font-bold text-lg">-</button>
                            <span className="text-sm font-black text-text px-1">{count}</span>
                            <button onClick={() => addProduct(p)} className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 bg-success/10 text-success hover:bg-success/20 transition-colors font-bold text-lg">+</button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
             {(canGetToken || (isOnBreak && !isBlockedDate)) && selected.length > 0 && activeTab === 'store' && (
              <div className="sticky bottom-4 z-30 animate-slideUp pb-4">
                <button onClick={() => setShowConfirm(true)} className="w-full py-4 rounded-full bg-primary text-white font-black text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-between px-6">
                  <span>View Cart ({selected.length})</span>
                  <span className="flex items-center gap-2">₹{totalPrice} ➔</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab (Photography) */}
        {activeTab === 'portfolio' && business.portfolioImages && (
          <div className="animate-fadeIn grid grid-cols-2 gap-3 pb-8">
            {business.portfolioImages.map((img, i) => (
               <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border aspect-[4/5] shadow-sm">
                 <img src={img} className="w-full h-full object-cover" alt="Portfolio" />
               </div>
            ))}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="animate-fadeIn">
            {reviews.length > 0 && (
              <div className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 shadow-sm animate-slideUp">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-3">✨ Review Highlights</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-card border border-border text-xs font-bold shadow-sm">🌟 Good Value</span>
                  <span className="px-3 py-1 rounded-full bg-card border border-border text-xs font-bold shadow-sm">⏱️ On Time Service</span>
                  <span className="px-3 py-1 rounded-full bg-card border border-border text-xs font-bold shadow-sm">✨ Clean & Hygienic</span>
                </div>
              </div>
            )}
            <button onClick={() => setShowReview(true)} className="w-full p-4 rounded-2xl border-2 border-dashed border-primary/50 text-primary text-sm font-bold mb-6 hover:bg-primary/5 transition-colors">
              + Write a Review
            </button>
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-card-2 rounded-3xl border border-border">
                <span className="text-6xl block mb-4 opacity-50">⭐</span>
                <p className="text-lg font-bold">No reviews yet</p>
                <p className="text-text-dim text-sm mt-1">Be the first to review {business.businessName}!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="p-5 rounded-3xl bg-card border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-card-2 border border-border overflow-hidden flex-shrink-0">
                          {review.customerPhoto ? <img src={review.customerPhoto} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{review.customerName}</p>
                          <div className="flex gap-0.5 mt-0.5">{[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= review.rating ? 'text-gold' : 'text-border'}`}>★</span>)}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-text-dim font-medium bg-card-2 px-2 py-1 rounded-full">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {review.comment && <p className="text-text-dim text-sm leading-relaxed">{review.comment}</p>}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 no-scrollbar">
                        {review.images.map((img, i) => (
                          <div key={i} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border bg-card-2 shadow-sm">
                            <img src={img} alt="review photo" className="w-full h-full object-cover grayscale-[0.2]" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {showConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-end justify-center z-50 animate-fadeIn">
          <div className="bg-card w-full max-w-[480px] rounded-t-3xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.3)] animate-slideUp overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />
              <h2 className="text-2xl font-black mb-1">Confirm {term.noun}</h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">{catInfo.icon}</span>
                <p className="text-text-dim text-sm font-bold">{business.businessName}</p>
              </div>

              <div className="p-5 rounded-2xl bg-card-2 border border-border mb-6">
                <div className="space-y-3 mb-4">
                  {selected.map(s => (
                    <div key={s.id} className="flex justify-between items-start text-sm font-medium group">
                      <div className="flex items-start gap-2 max-w-[75%]">
                        {s.id.includes('_prod_') && (
                          <button onClick={() => removeProduct(s.id.split('_prod_')[0])} className="w-5 h-5 rounded bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20 transition-colors mt-0.5" title="Remove Item">✕</button>
                        )}
                        <span className="text-text leading-tight">{s.name} {!s.id.includes('_prod_') && groupSize > 1 ? <span className="text-text-dim">x{groupSize}</span> : ''}</span>
                      </div>
                      <span className="shrink-0">₹{s.price * (s.id.includes('_prod_') ? 1 : groupSize)}</span>
                    </div>
                  ))}
                  {isTatkal && (
                    <div className="flex justify-between text-sm text-gold font-bold pt-2 border-t border-border/30">
                      <span>Priority Access</span>
                      <span>₹{TATKAL_FEE}</span>
                    </div>
                  )}
                  {maxDiscount > 0 && (
                     <div className="flex justify-between text-sm text-success font-bold pb-2 border-b border-border/50">
                      <span>Promo: {appliedPromo?.code}</span>
                      <span>-₹{maxDiscount}</span>
                    </div>
                  )}
                </div>

                {!appliedPromo && business.promoCodes && business.promoCodes.some(p => p.active) && (
                  <div className="flex gap-2 mb-4">
                    <input value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value.toUpperCase())} placeholder="Have a Promo Code?" className="input-field flex-1 text-xs uppercase" />
                    <button onClick={handleApplyPromo} className="px-4 rounded-xl bg-primary/20 text-primary font-bold text-xs active:scale-95 transition-transform">Apply</button>
                  </div>
                )}
                {appliedPromo && (
                  <div className="flex items-center justify-between bg-success/10 border border-success/20 p-2.5 rounded-xl mb-4">
                    <span className="text-success text-xs font-bold flex items-center gap-1.5"><span className="text-lg leading-none">✅</span> Code Applied</span>
                    <button onClick={() => setAppliedPromo(null)} className="text-[10px] text-danger font-bold underline">Remove</button>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs font-bold text-text-dim uppercase tracking-wider mb-2">💝 Add a Tip (Optional)</p>
                  <div className="flex gap-2">
                    {[0, 20, 50, 100].map(amt => (
                      <button key={amt} onClick={() => setTipAmount(amt)} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${tipAmount === amt ? 'bg-primary text-white border-primary' : 'bg-card border-border text-text'}`}>
                        {amt === 0 ? 'None' : `₹${amt}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full border-t border-dashed border-border mb-4" />
                <div className="flex justify-between font-bold text-text-dim mb-1">
                  <span>Est. Duration</span>
                  <span>{totalTime} {term.unit}</span>
                </div>
                <div className="flex justify-between font-black text-xl mb-4">
                  <span>{t('total') || 'Total Due'}</span>
                  <span className="gradient-text">₹{totalPrice + tipAmount}</span>
                </div>

                <label className="flex items-center gap-3 p-4 rounded-xl bg-card-2 border border-border cursor-pointer hover:border-primary/50 transition-colors shadow-sm">
                  <input type="checkbox" onChange={() => { if(typeof window !== 'undefined') window.navigator?.vibrate?.(50); }} className="w-5 h-5 text-primary rounded-md ring-0 focus:ring-0 accent-primary border-border" />
                  <span className="text-sm font-bold text-text-dim">🔄 Repeat this booking weekly</span>
                </label>
              </div>

              {advanceDate && advanceDate !== today && (
                <div className="bg-accent/10 border border-accent/20 p-3 rounded-xl mb-6 flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-xs text-text-dim font-bold">Advance Booking</p>
                    <p className="text-accent text-sm font-bold">{new Date(advanceDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
              )}

              {getError && (
                <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 mb-5 flex items-center gap-3">
                  <span className="text-xl">🚨</span>
                  <p className="text-danger text-sm font-bold">{getError}</p>
                </div>
              )}

              <div className="flex flex-col gap-2 text-center mb-4 p-4 bg-gradient-to-r from-card to-card-2 border border-border shadow-sm rounded-3xl">
                {currentWaitTime > 0 ? (
                  <>
                    <p className="text-xs font-bold text-text-dim uppercase tracking-widest">Live Queue Details</p>
                    <p className="text-lg font-black"><span className="text-primary">{activeTokenCount}</span> people ahead</p>
                    <p className="text-sm font-bold text-text-dim">Your estimated wait: <span className="text-primary">~{currentWaitTime} mins</span></p>
                  </>
                ) : (
                  <p className="text-sm font-black text-success">Queue is clear! You're next.</p>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setShowConfirm(false); setGetError(''); }} className="w-20 rounded-2xl bg-card-2 border border-border text-center font-bold text-sm h-14 active:scale-95 transition-transform hover:bg-border">
                  {t('back') || 'Back'}
                </button>
                <button onClick={handleGetToken} disabled={getting} className="flex-1 rounded-2xl bg-primary text-white font-black text-base h-14 active:scale-[0.98] transition-transform shadow-xl shadow-primary/30 flex items-center justify-center gap-2">
                  {getting ? (
                    <><div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : isTatkal ? `Pay ₹${TATKAL_FEE} Deposit` : `${t('confirm') || 'Confirm'} ${term.noun}`}
                </button>
              </div>
            </div>
            <div className="h-4 bg-background" />
          </div>
        </div>
      )}

      {/* ✍️ Elite Insight Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[20px] flex items-center justify-center z-[100] p-6 animate-fadeIn">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0a0a0b] border border-white/10 rounded-[4rem] p-10 w-full max-w-lg shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -translate-y-20 translate-x-20" />
            
            <h2 className="type-elite-display text-3xl mb-2">Share Experience</h2>
            <p className="type-elite-label opacity-40 mb-8 border-b border-white/5 pb-6">Your frequency contributes to the venue's pulse.</p>
            
            <div className="flex gap-4 justify-center mb-8 py-8 rounded-[2.5rem] bg-white/5 border border-white/5 shadow-inner">
              {[1,2,3,4,5].map(s => (
                <button 
                  key={s} 
                  onClick={() => { triggerHaptic('light'); setReviewRating(s); }} 
                  className={`text-5xl transition-all duration-500 ${s <= reviewRating ? 'text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] scale-110' : 'text-white/10 scale-90'}`}
                >
                  ★
                </button>
              ))}
            </div>
            
            <textarea 
              value={reviewComment} 
              onChange={e => setReviewComment(e.target.value)} 
              placeholder="What defines this universe?" 
              className="w-full bg-white/5 border border-white/5 rounded-3xl p-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 shadow-inner mb-8 h-40 resize-none transition-all" 
            />
            
            <div className="flex flex-col gap-4">
              <button onClick={handleSubmitReview} disabled={submittingReview} className="w-full py-5 rounded-3xl bg-primary text-black font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-4">
                {submittingReview ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/> : 'Publish Pulse'}
              </button>
              <button onClick={() => setShowReview(false)} className="w-full py-5 rounded-3xl bg-transparent border border-white/10 text-white/40 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white transition-all">Abort</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 🔥 Elite Social Proof Deck */}
      {showSocialProof && (
        <div className="fixed bottom-32 inset-x-6 flex justify-center z-40 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="elite-glass px-8 py-5 rounded-[2.5rem] border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex items-center gap-5 pointer-events-auto"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary animate-pulse text-2xl shadow-inner">
              ⚡
            </div>
            <div>
              <p className="type-elite-label text-[10px] text-primary mb-1 tracking-[0.2em] font-black uppercase">Active Pulse</p>
              <p className="text-sm font-bold text-white/80">
                <span className="text-white font-black">{socialProofCount} Souls</span> harmonizing here now
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Story Overlay */}
      {viewingStory && business.stories && business.stories.length > 0 && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-fadeIn">
          {/* Progress Bar */}
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            <div className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
              <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${storyProgress}%` }} />
            </div>
          </div>
          {/* Header */}
          <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-card overflow-hidden ring-2 ring-white/50">
                <img src={business.bannerImageURL || business.stories[business.stories.length-1].url} className="w-full h-full object-cover" alt="" />
              </div>
              <span className="text-white font-bold text-sm drop-shadow-md">{business.businessName}</span>
            </div>
            <button onClick={() => setViewingStory(false)} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl drop-shadow-md pb-1 active:scale-90 border border-white/20">✕</button>
          </div>
          <div className="flex-1 w-full relative" onClick={() => setViewingStory(false)}>
            <img src={business.stories[business.stories.length-1].url} className="w-full h-full object-cover" alt="Story" />
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
            <div className="absolute bottom-10 w-full text-center pointer-events-none px-6">
               <p className="text-white font-black text-2xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-float mb-2">Check out our offers! {catInfo.icon}</p>
               <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 text-white text-xs font-bold inline-block border border-white/30">Swipe up to {term.action.toLowerCase()}</div>
            </div>
          </div>
        </div>
      )}
      {/* Service Provider Portfolio Modal */}
      {selectedStaffProfile && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-end justify-center z-50 animate-fadeIn" onClick={() => setSelectedStaffProfile(null)}>
          <div className="bg-card w-full max-w-[480px] rounded-t-3xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.3)] animate-slideUp overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-full bg-card-2 border-2 border-primary/30 overflow-hidden flex-shrink-0 shadow-inner">
                    {selectedStaffProfile.photoUrl ? <img src={selectedStaffProfile.photoUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                 </div>
                 <div>
                   <h2 className="text-2xl font-black">{selectedStaffProfile.name}</h2>
                   <p className="text-primary font-bold text-sm tracking-widest uppercase mt-0.5">{selectedStaffProfile.role || term.provider}</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="bg-gradient-to-br from-card-2 to-card p-4 rounded-2xl border border-border text-center shadow-inner">
                    <p className="text-3xl font-black text-gold mb-1 drop-shadow-sm">4.9</p>
                    <div className="flex gap-0.5 justify-center mb-1 text-gold text-[10px]">★★★★★</div>
                    <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest">120+ Reviews</p>
                 </div>
                 <div className="bg-gradient-to-br from-card-2 to-card p-4 rounded-2xl border border-border text-center shadow-inner">
                    <p className="text-3xl font-black text-text mb-1 drop-shadow-sm">1k<span className="text-lg text-primary">+</span></p>
                    <div className="flex gap-0.5 justify-center mb-1 text-primary text-[10px]">✨✨✨</div>
                    <p className="text-[9px] text-text-dim font-bold uppercase tracking-widest">Services Done</p>
                 </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 mb-6 font-medium text-sm text-text-dim relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-7xl opacity-[0.03] scale-x-[-1] rotate-12">{catInfo.icon}</div>
                <p className="relative z-10 italic leading-relaxed">"I specialize in precision techniques and ensuring every client leaves feeling their absolute best. Looking forward to serving you!"</p>
              </div>

              <button onClick={() => { setAssignedStaffId(selectedStaffProfile.id); setSelectedStaffProfile(null); triggerHaptic('success'); }} className="w-full py-4 rounded-xl bg-primary text-white font-black text-lg hover:opacity-90 transition-opacity active:scale-[0.98] shadow-xl shadow-primary/30 flex justify-center items-center gap-2">
                Book {selectedStaffProfile.name} <span className="text-xl">➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
