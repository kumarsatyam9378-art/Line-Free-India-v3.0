import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp, BusinessProfile, getCategoryInfo } from '../store/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaDownload, FaShareAlt, FaPalette, FaCheckCircle, FaRocket } from 'react-icons/fa';
import html2canvas from 'html2canvas';

interface Props { id?: string; }

type PosterTheme = 'modern' | 'glass' | 'midnight' | 'minimal';

export default function SalonQRPage({ id: propId }: Props) {
  const params = useParams<{ id: string }>();
  const { user, allBusinesses, getBusinessById, businessProfile, t } = useApp();
  const nav = useNavigate();
  const [salon, setSalon] = useState<BusinessProfile | null>(null);
  const [activeTheme, setActiveTheme] = useState<PosterTheme>('modern');
  const posterRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const salonId = propId === 'own'
    ? user?.uid
    : (params.id || propId || '');

  useEffect(() => {
    if (!salonId) return;
    if (propId === 'own' && businessProfile) { setSalon(businessProfile); return; }
    const found = allBusinesses.find(s => s.uid === salonId);
    if (found) { setSalon(found); return; }
    getBusinessById(salonId).then(s => { if (s) setSalon(s); });
  }, [salonId, allBusinesses, businessProfile, propId]);

  const bookingUrl = `${window.location.origin}/customer/salon/${salonId}`;
  const termInfo = getCategoryInfo(salon?.businessType || 'men_salon');

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null
      });
      const link = document.createElement('a');
      link.download = `${salon?.businessName || 'Business'}-Poster.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    }
    setIsDownloading(false);
  };

  const themes: { id: PosterTheme; label: string; icon: string; colors: string }[] = [
    { id: 'modern', label: 'Indigo Fusion', icon: '🎨', colors: 'from-indigo-600 to-violet-600' },
    { id: 'glass', label: 'Crystal Glass', icon: '💎', colors: 'from-blue-400 to-emerald-400' },
    { id: 'midnight', label: 'Onyx Dark', icon: '🌑', colors: 'from-gray-900 to-black' },
    { id: 'minimal', label: 'Pure White', icon: '⚪', colors: 'from-gray-100 to-white' }
  ];

  if (!salon) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-40 bg-bg overflow-x-hidden">
      {/* Header HUD */}
      <div className="p-6 sticky top-0 z-[100] bg-bg/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button onClick={() => nav(-1)} className="w-10 h-10 bg-card rounded-xl border border-white/10 flex items-center justify-center text-text shadow-sm">
            <FaArrowLeft />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-black uppercase tracking-[3px]">Poster Builder</h1>
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mt-0.5">Marketing Command</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-xl mx-auto p-6">
        {/* Style Selector */}
        <div className="mb-8 overflow-x-auto no-scrollbar py-2 flex gap-3">
          {themes.map(th => (
            <button
              key={th.id}
              onClick={() => setActiveTheme(th.id)}
              className={`flex-shrink-0 px-6 py-4 rounded-[2rem] border transition-all flex flex-col items-center gap-2 group ${activeTheme === th.id ? 'bg-primary/20 border-primary ring-4 ring-primary/10 scale-105 shadow-2xl' : 'bg-card/40 border-white/5 opacity-50 hover:opacity-80'}`}
            >
              <span className={`text-2xl transition-transform group-hover:scale-125 ${activeTheme === th.id ? 'animate-bounce' : ''}`}>{th.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-[2px] text-text whitespace-nowrap">{th.label}</span>
            </button>
          ))}
        </div>

        {/* Poster Preview Area */}
        <div className="flex justify-center mb-10 perspective-1000">
          <motion.div 
            ref={posterRef}
            initial={{ rotateY: 15, rotateX: 5 }}
            animate={{ rotateY: 0, rotateX: 0 }}
            className={`relative w-[340px] h-[550px] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col items-center p-8 ${
              activeTheme === 'modern' ? 'bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-900 border border-white/10' :
              activeTheme === 'glass' ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border border-white/20' :
              activeTheme === 'midnight' ? 'bg-[#0A0A0A] border border-white/5' :
              'bg-white border border-gray-200'
            }`}
          >
            {/* Background elements */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] rounded-full" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
               {activeTheme !== 'minimal' && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay opacity-30" />}
            </div>

            {/* Content Top */}
            <div className="relative z-10 w-full text-center mt-4">
              <div className={`mx-auto w-max px-4 py-1.5 rounded-full border mb-6 flex items-center gap-2 ${activeTheme === 'minimal' ? 'bg-black text-white border-transparent' : 'bg-white/10 border-white/20 text-white'}`}>
                <FaRocket className="text-[10px]" />
                <span className="text-[9px] font-black uppercase tracking-[3px]">Official Digital Service</span>
              </div>
              
              <h2 className={`text-4xl font-black tracking-tighter leading-[0.9] ${activeTheme === 'minimal' ? 'text-black' : 'text-white'}`}>
                SKIP THE <br/> <span className="opacity-50">QUEUE</span>
              </h2>
              <p className={`text-[10px] font-bold uppercase tracking-[4px] mt-4 ${activeTheme === 'minimal' ? 'text-gray-400' : 'text-white/60'}`}>
                Book Online Instantly
              </p>
            </div>

            {/* QR Center */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
              <div className={`p-6 rounded-[2.5rem] shadow-2xl relative ${activeTheme === 'minimal' ? 'bg-gray-50' : 'bg-white'}`}>
                 <div className="absolute -inset-4 bg-primary/10 blur-xl opacity-0 hover:opacity-100 transition-opacity" />
                 <QRCodeSVG
                    id="salon-qr-svg"
                    value={bookingUrl}
                    size={160}
                    bgColor="transparent"
                    fgColor={activeTheme === 'minimal' ? '#000000' : '#1e1b4b'}
                    level="H"
                    includeMargin={false}
                 />
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100">
                       <span className="text-xl">{termInfo.icon}</span>
                    </div>
                 </div>
              </div>
              <p className={`mt-6 text-[10px] font-black uppercase tracking-[3px] ${activeTheme === 'minimal' ? 'text-black/30' : 'text-white/30'}`}>
                Scan with camera
              </p>
            </div>

            {/* Business Footer */}
            <div className={`relative z-10 w-full p-6 rounded-[2.5rem] mt-auto flex flex-col items-center text-center ${activeTheme === 'minimal' ? 'bg-gray-100' : 'bg-white/10 backdrop-blur-md border border-white/10'}`}>
                <h3 className={`text-lg font-black uppercase tracking-tight ${activeTheme === 'minimal' ? 'text-black' : 'text-white'}`}>
                  {salon.businessName}
                </h3>
                {salon.location && (
                  <p className={`text-[9px] font-bold mt-1 opacity-60 flex items-center gap-1 ${activeTheme === 'minimal' ? 'text-gray-600' : 'text-white'}`}>
                    📍 {salon.location.split(',')[0]}
                  </p>
                )}
                
                <div className="mt-4 flex gap-4">
                  <div className="flex flex-col items-center">
                    <FaCheckCircle className="text-primary text-xs mb-1" />
                    <span className={`text-[7px] font-black uppercase tracking-widest ${activeTheme === 'minimal' ? 'text-black/40' : 'text-white/40'}`}>Real-time</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-white/5 px-4">
                    <FaCheckCircle className="text-primary text-xs mb-1" />
                    <span className={`text-[7px] font-black uppercase tracking-widest ${activeTheme === 'minimal' ? 'text-black/40' : 'text-white/40'}`}>Verified</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FaCheckCircle className="text-primary text-xs mb-1" />
                    <span className={`text-[7px] font-black uppercase tracking-widest ${activeTheme === 'minimal' ? 'text-black/40' : 'text-white/40'}`}>Fast Track</span>
                  </div>
                </div>
            </div>

            {/* Line Free Branding */}
            <div className="absolute bottom-4 inset-x-0 text-center">
              <p className={`text-[8px] font-black uppercase tracking-[5px] opacity-20 ${activeTheme === 'minimal' ? 'text-black' : 'text-white'}`}>
                Powered by Line Free India
              </p>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn-glow w-full h-16 flex items-center justify-center gap-3 text-xs tracking-[4px] shadow-2xl disabled:opacity-50"
          >
            {isDownloading ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : <><FaDownload /> Download Premium PNG</>}
          </button>
          
          <button 
            className="w-full h-16 bg-white/[0.03] backdrop-blur-md border border-white/10 text-text rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-all active:scale-95 px-6"
          >
             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[3px]">
               <FaShareAlt className="text-primary" /> Share Link
             </div>
             <span className="text-[8px] opacity-40 font-mono truncate w-full text-center">{bookingUrl}</span>
          </button>
        </div>

        {/* Tips Section */}
        <div className="mt-10 bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                 💡
              </div>
              <div>
                 <p className="text-[10px] font-black text-primary uppercase tracking-[3px]">Growth hack</p>
                 <p className="text-sm font-black text-text">Pro Installation Guide</p>
              </div>
           </div>
           
           <div className="space-y-4">
              {[
                { step: '01', text: 'Print in HIGH-GLOSS on A4 or A5 paper' },
                { step: '02', text: 'Place at Eye-Level near the entrance' },
                { step: '03', text: 'Add a small "Scan to Book" sticker on mirrors' },
                { step: '04', text: 'Share your booking link on Instagram Bio' }
              ].map((tip, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <span className="text-primary/40 font-black text-xs">{tip.step}</span>
                  <p className="text-xs font-bold text-text-dim">{tip.text}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
