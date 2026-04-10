import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaQrcode,
  FaWhatsapp,
  FaBell,
  FaLayerGroup
} from 'react-icons/fa';


export default function Sidebar() {
  const { businessProfile, signOutUser, user } = useApp();
  const nav = useNavigate();
  const loc = useLocation();

  const isBusiness = loc.pathname.startsWith('/barber');
  if (!isBusiness || !user) return null;

  const menuItems = [
    { icon: FaHome, label: 'Dashboard', path: '/barber/home' },
    { icon: FaCalendarAlt, label: 'Calendar', path: '/barber/calendar' },
    { icon: FaUsers, label: 'Customers', path: '/barber/customers' },
    { icon: FaChartBar, label: 'Analytics', path: '/barber/analytics-pro' },
    { icon: FaLayerGroup, label: 'Staff Hub', path: '/barber/staff' },
    { icon: FaWhatsapp, label: 'Communications', path: '/barber/whatsapp' },

    { icon: FaQrcode, label: 'Digital QR', path: '/barber/qr' },
    { icon: FaBell, label: 'Alert Center', path: '/barber/notifications' },
    { icon: FaCog, label: 'Settings', path: '/barber/profile' },
  ];

  const handleLogout = async () => {
    await signOutUser();
    nav('/');
  };

  return (
    <div className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 z-50 p-6 bg-card border-r border-border shadow-2xl">
      {/* Brand Header */}
      <div className="flex items-center gap-4 mb-10 px-2 group">
        <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl border border-white/20 transition-transform group-hover:scale-110">
          <span className="text-2xl font-black text-white">L</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-black text-text tracking-[2px] uppercase whitespace-nowrap leading-none">Line Free India</span>
          <span className="text-[9px] font-black uppercase tracking-[2px] mt-1 text-primary opacity-80">Command OS v4.0</span>
        </div>
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        {menuItems.map((item) => {
          const active = loc.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              whileHover={{ x: 6 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => nav(item.path)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 transition-all duration-300 relative rounded-2xl group ${active ? 'bg-primary/10' : 'hover:bg-card-2'}`}
            >
              {active && (
                <motion.div 
                  layoutId="activePillSide"
                  className="absolute left-[-1px] w-1 h-6 bg-primary rounded-full shadow-[0_0_12px_var(--color-primary)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`text-lg transition-colors ${active ? 'text-primary' : 'text-text-dim group-hover:text-text'}`} />
              <span className={`text-sm font-black tracking-wide transition-colors ${active ? 'text-text' : 'text-text-dim group-hover:text-text'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* AI & Profile Footer */}
      <div className="mt-auto pt-6 border-t border-border">


        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-danger hover:bg-danger/10 transition-all font-black group active:scale-95"
        >
          <FaSignOutAlt className="text-xl group-hover:rotate-12 transition-transform" />
          <span className="text-xs uppercase tracking-[3px]">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
