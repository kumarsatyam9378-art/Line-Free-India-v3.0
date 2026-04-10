import { useNavigate, useLocation } from 'react-router-dom';
import { useApp, getCategoryInfo } from '../store/AppContext';
import { useState } from 'react';
import QuickActions from './QuickActions';
import { 
  FaHome, 
  FaSearch, 
  FaGem, 
  FaTicketAlt, 
  FaUser, 
  FaClipboardList, 
  FaChartBar,
  FaBolt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomNav() {
  const { role, unreadCount, t, businessProfile } = useApp();
  const nav = useNavigate();
  const loc = useLocation();

  const [showQuickActions, setShowQuickActions] = useState(false);

  // Background styles for the nav bar
  const navStyles = "flex justify-around items-center h-[68px] pointer-events-auto relative bg-card/80 backdrop-blur-2xl rounded-[22px] border border-border shadow-2xl";

  if (role === 'customer') {
    const tabs = [
      { path: '/customer/home', label: t('home'), icon: <FaHome /> },
      { path: '/customer/search', label: t('search'), icon: <FaSearch /> },
      { path: '/customer/loyalty', label: 'Rewards', icon: <FaGem /> },
      { path: '/customer/tokens', label: t('tokens'), icon: <FaTicketAlt /> },
      { path: '/customer/profile', label: t('profile'), icon: <FaUser /> },
    ];
    return (
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[100] px-4 pb-6 pointer-events-none">
        <div className={navStyles}>
          {tabs.map(tab => {
            const active = loc.pathname === tab.path;
            return (
              <button 
                key={tab.path} 
                onClick={() => nav(tab.path)}
                className="flex flex-col items-center justify-center gap-1 transition-all relative w-16 h-full active:scale-90"
              >
                {active && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-x-1 inset-y-2 bg-primary/10 rounded-[14px] shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.1)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`text-xl z-10 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-text-dim'}`}>
                  {tab.icon}
                </span>
                <span className={`text-[8px] font-black z-10 uppercase tracking-[1px] ${active ? 'text-primary' : 'text-text-dim'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (role === 'business') {
    const catType = businessProfile?.businessType || 'men_salon';
    const catInfo = getCategoryInfo(catType);
    const noun = catInfo.terminology.noun;

    const tabs = [
      { path: '/barber/home', label: t('home'), icon: <FaHome /> },
      { path: '/barber/customers', label: noun, icon: <FaClipboardList /> },
      { path: 'FAB', label: 'Actions', icon: <FaBolt /> },
      { path: '/barber/analytics', label: t('analytics'), icon: <FaChartBar /> },
      { path: '/barber/profile', label: t('profile'), icon: <FaUser /> },
    ];
    
    return (
      <>
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[100] px-4 pb-6 pointer-events-none">
          <div className={navStyles}>
            {tabs.map((tab) => {
              if (tab.path === 'FAB') {
                return (
                  <button key="fab" onClick={() => setShowQuickActions(true)}
                    className="relative -top-6 flex items-center justify-center w-[54px] h-[54px] transition-all hover:scale-110 active:scale-95 z-20 group shadow-lg"
                    style={{
                      background: 'var(--color-primary)',
                      borderRadius: '18px',
                      border: '4px solid var(--color-bg)'
                    }}
                  >
                    <span className="text-xl relative z-10 text-white font-black">{tab.icon}</span>
                    <div className="absolute inset-0 rounded-[14px] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              }

              const active = loc.pathname === tab.path;
              return (
                <button 
                  key={tab.path} 
                  onClick={() => nav(tab.path)}
                  className="flex flex-col items-center justify-center gap-1 transition-all relative w-16 h-full active:scale-90"
                >
                  {active && (
                    <motion.div 
                      layoutId="activeTabBiz"
                      className="absolute inset-x-1 inset-y-2 bg-primary/10 rounded-[14px] shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.1)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`text-lg z-10 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-text-dim'}`}>
                    {tab.icon}
                  </span>
                  <span className={`text-[7px] font-black z-10 uppercase tracking-[1px] truncate w-full text-center ${active ? 'text-primary' : 'text-text-dim'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {showQuickActions && (
            <QuickActions onClose={() => setShowQuickActions(false)} />
          )}
        </AnimatePresence>
      </>
    );
  }

  return null;
}
