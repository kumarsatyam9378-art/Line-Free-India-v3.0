import { useNavigate } from 'react-router-dom';
import { useApp, getCategoryInfo } from '../store/AppContext';
import { BUSINESS_TOOLS, SHARED_TOOLS, ToolItem } from '../config/businessTools';
import { triggerHaptic } from '../utils/haptics';

function ToolCard({ tool, index }: { tool: ToolItem; index: number }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => { triggerHaptic('light'); nav(tool.path); }}
      className="relative p-4 rounded-3xl bg-gradient-to-br from-card to-card-2 border border-border shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-all text-center hover:border-primary/50 hover:shadow-md group overflow-hidden animate-slideUp"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Background watermark */}
      <div className="absolute -right-3 -bottom-3 text-6xl opacity-[0.04] group-hover:scale-125 transition-transform duration-500">
        {tool.icon}
      </div>
      
      {/* Icon */}
      <div className={`w-12 h-12 rounded-2xl bg-${tool.color}-500/10 border border-${tool.color}-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner`}>
        {tool.icon}
      </div>
      
      {/* Label */}
      <div className="relative z-10 w-full">
        <p className="font-black text-sm text-text truncate">{tool.label}</p>
        {tool.description && (
          <p className={`text-[9px] font-bold text-${tool.color}-400 uppercase tracking-widest mt-0.5`}>{tool.description}</p>
        )}
      </div>
    </button>
  );
}

export default function BusinessToolGrid() {
  const { businessProfile } = useApp();
  const catType = businessProfile?.businessType || 'other';
  const catInfo = getCategoryInfo(catType);
  const categoryTools = BUSINESS_TOOLS[catType] || BUSINESS_TOOLS.other;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Category-specific tools */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="text-xl">{catInfo.icon}</span>
          <div>
            <h3 className="font-black text-base text-text">{catInfo.label} Tools</h3>
            <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Industry-specific features</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {categoryTools.map((tool, i) => (
            <ToolCard key={tool.path + tool.label} tool={tool} index={i} />
          ))}
        </div>
      </div>

      {/* Shared / Universal tools */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="text-xl">🛠️</span>
          <div>
            <h3 className="font-black text-base text-text">Universal Tools</h3>
            <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Available for all businesses</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {SHARED_TOOLS.map((tool, i) => (
            <ToolCard key={tool.path + tool.label} tool={tool} index={i + categoryTools.length} />
          ))}
        </div>
      </div>
    </div>
  );
}
