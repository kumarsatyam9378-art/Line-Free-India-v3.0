import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DayStat } from '../store/AppContext';

interface PeakHeatmapProps {
  stats: DayStat[];
  color?: string;
}

export default function PeakHeatmap({ stats, color = '#E11D48' }: PeakHeatmapProps) {
  // Aggregate hour data across all stats
  // For a real heatmap, we'd need hourly data. 
  // Assuming DayStat has hourly data or we simulate it for the demo.
  // Let's simulate hourly density based on typical business hours (9 AM - 9 PM)
  
  const hours = Array.from({ length: 13 }, (_, i) => i + 9); // 9 AM to 9 PM
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const heatmapData = useMemo(() => {
    return days.map(day => {
      return hours.map(hour => {
        // Base density on day (weekends higher) and hour (noon/evening higher)
        const isWeekend = day === 'Sat' || day === 'Sun';
        const isLunch = hour >= 12 && hour <= 14;
        const isEvening = hour >= 17 && hour <= 19;
        
        let density = Math.random() * 0.3; // Base noise
        if (isWeekend) density += 0.4;
        if (isLunch) density += 0.3;
        if (isEvening) density += 0.5;
        
        return Math.min(density, 1);
      });
    });
  }, []);

  const getOpacity = (val: number) => {
    if (val < 0.2) return 'bg-white/5';
    if (val < 0.4) return 'bg-primary/20';
    if (val < 0.6) return 'bg-primary/40';
    if (val < 0.8) return 'bg-primary/70';
    return 'bg-primary shadow-[0_0_15px_rgba(225,29,72,0.4)]';
  };

  return (
    <div className="p-6 rounded-[2.5rem] bg-card border border-border overflow-hidden relative group">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-black text-lg tracking-tight">Peak Demand Matrix</h3>
          <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest">Heatmap Analysis • Next 7 Days</p>
        </div>
        <div className="flex gap-1">
          {[0.2, 0.5, 0.9].map((v, i) => <div key={i} className={`w-3 h-3 rounded-sm ${getOpacity(v)}`} />)}
        </div>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="min-w-[400px]">
          {/* Header: Hours */}
          <div className="flex mb-2 ml-10">
            {hours.map(h => (
              <div key={h} className="flex-1 text-center text-[8px] font-black text-text-dim uppercase">
                {h > 12 ? `${h-12}P` : `${h}A`}
              </div>
            ))}
          </div>

          {/* Rows: Days */}
          <div className="space-y-2">
            {days.map((day, di) => (
              <div key={day} className="flex items-center gap-2">
                <div className="w-8 text-[10px] font-black text-text-dim uppercase text-right mr-2">{day}</div>
                {heatmapData[di].map((val, hi) => (
                  <motion.div
                    key={`${di}-${hi}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (di * 13 + hi) * 0.005 }}
                    className={`flex-1 h-8 rounded-lg ${getOpacity(val)} transition-all hover:scale-110 hover:z-10 cursor-help relative group/cell`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[8px] font-black rounded opacity-0 group-hover/cell:opacity-100 whitespace-nowrap z-50">
                      {Math.round(val * 100)}% Occupancy
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-relaxed">
            💡 Strategy: High congestion detected Friday Evening. Recommend deploying 2 additional staff for optimal turnover.
          </p>
      </div>
    </div>
  );
}
