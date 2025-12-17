
import React, { useMemo } from 'react';
import { NutritionDayLog, AppView } from '../types';
import { generateNutritionReport } from '../services/analyticsEngine';
import { 
  AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell, Tooltip, XAxis, YAxis 
} from 'recharts';
import { 
  Activity, Flame, ChevronRight, TrendingUp, TrendingDown, ArrowRight, Utensils, Zap, AlertCircle 
} from 'lucide-react';

interface NutritionDashboardWidgetProps {
  logs: NutritionDayLog[];
  onNavigate: () => void;
  className?: string;
}

const NutritionDashboardWidget: React.FC<NutritionDashboardWidgetProps> = ({ logs, onNavigate, className }) => {
  // 1. Consume Aggregated Data (Simulating lightweight API endpoint)
  const { summary, timeline, insights } = useMemo(() => 
    generateNutritionReport(logs || [], 'week'), 
  [logs]);

  // 2. Trend Calculation
  const trend = useMemo(() => {
    if (timeline.length < 2) return 0;
    const current = timeline[timeline.length - 1].adherence;
    const previous = timeline[timeline.length - 2].adherence;
    if (previous === 0) return 100;
    return Math.round(current - previous);
  }, [timeline]);

  // 3. Insight extraction
  const topInsight = insights.length > 0 ? insights[0] : null;

  return (
    <div className={`energetic-card p-5 flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl relative overflow-hidden group ${className}`}>
      {/* Background Decor */}
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <Utensils className="text-green-400" size={18}/> 
            وضعیت تغذیه
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">خلاصه عملکرد ۷ روز گذشته</p>
        </div>
        
        {/* Trend Indicator */}
        <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border ${trend >= 0 ? 'bg-green-900/30 border-green-500/30 text-green-400' : 'bg-red-900/30 border-red-500/30 text-red-400'}`}>
            {trend >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
            <span className="font-bold">{Math.abs(trend)}%</span>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
          <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 mb-1">پایبندی (Adherence)</span>
              <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${summary.avgAdherence >= 80 ? 'text-green-400' : summary.avgAdherence >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {summary.avgAdherence}%
                  </span>
              </div>
              <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${summary.avgAdherence >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                    style={{width: `${summary.avgAdherence}%`}}
                  ></div>
              </div>
          </div>

          <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 mb-1">انحراف کالری</span>
              <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${Math.abs(summary.calorieDeviation) < 200 ? 'text-blue-400' : 'text-orange-400'}`}>
                      {Math.abs(summary.calorieDeviation)}
                  </span>
                  <span className="text-[10px] text-gray-500">kcal</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">
                  {summary.calorieDeviation > 0 ? 'بیشتر از هدف' : 'کمتر از هدف'}
              </span>
          </div>
      </div>

      {/* Mini Chart Area */}
      <div className="flex-1 min-h-[60px] relative z-10 mb-2">
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline.slice(-7)}>
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', padding: '4px', fontSize: '10px'}}
                    itemStyle={{color: '#fff', padding: 0}}
                    labelStyle={{display: 'none'}}
                    formatter={(value: number) => [`${value}%`, 'Adherence']}
                  />
                  <Bar dataKey="adherence" radius={[2, 2, 0, 0]}>
                    {timeline.slice(-7).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.adherence >= 80 ? '#10b981' : entry.adherence >= 50 ? '#eab308' : '#ef4444'} />
                    ))}
                  </Bar>
              </BarChart>
          </ResponsiveContainer>
      </div>

      {/* Insight Line */}
      {topInsight && (
          <div className="flex items-center gap-2 mb-4 bg-black/20 p-2 rounded-lg border border-white/5 relative z-10">
              <Zap size={12} className="text-yellow-400 shrink-0"/>
              <p className="text-[9px] text-gray-300 line-clamp-1">{topInsight.message}</p>
          </div>
      )}

      {/* Footer Actions */}
      <div className="mt-auto relative z-10">
         <button onClick={onNavigate} className="w-full bg-green-600 hover:bg-green-500 text-white text-xs py-2 rounded-lg transition flex items-center justify-center font-bold shadow-lg shadow-green-900/20 group">
            ورود به مرکز تغذیه <ChevronRight size={12} className="mr-1 rotate-180 group-hover:-translate-x-1 transition-transform"/>
         </button>
      </div>
    </div>
  );
};

export default NutritionDashboardWidget;
