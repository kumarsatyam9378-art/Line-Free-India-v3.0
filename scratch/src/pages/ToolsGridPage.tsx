import { useApp } from '../store/AppContext';
import { useTheme } from '../hooks/useTheme';
import BusinessToolGrid from '../components/BusinessToolGrid';
import BottomNav from '../components/BottomNav';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function ToolsGridPage() {
  const { businessProfile } = useApp();
  const nav = useNavigate();
  useTheme(businessProfile?.businessType);

  return (
    <div className="min-h-screen bg-bg text-text pb-32">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 mb-4">
        <button 
          onClick={() => nav(-1)}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-text-dim hover:text-primary transition-colors"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">OS Tools</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-dim">Line Free India Business Suite</p>
        </div>
      </div>

      <div className="px-6">
        <BusinessToolGrid />
      </div>

      <BottomNav />
    </div>
  );
}
