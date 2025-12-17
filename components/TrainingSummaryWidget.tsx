
import React, { useState, useMemo } from 'react';
import { DailyLog, UserProfile, AppView, TrainingLog } from '../types';
import { generateAnalyticsReport } from '../services/analyticsEngine';
import { 
  AreaChart, Area, ResponsiveContainer, RadialBarChart, RadialBar, Tooltip
} from 'recharts';
import { 
  TrendingUp, TrendingDown, ChevronRight, Activity, 
  Dumbbell, Calendar, Flame, ArrowRight
} from 'lucide-react';

interface TrainingSummaryWidgetProps {
  logs: TrainingLog[]; // Note: Uses TrainingLog from Training Module, not generic DailyLog
  profile: UserProfile;
  setCurrentView: (view: AppView) => void;
}

const TrainingSummaryWidget: React.FC<TrainingSummaryWidgetProps> = ({ logs, profile, setCurrentView }) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  // 1. Leverage existing Analytics Engine for consistent data
  const { summary, timelineData, insights } = useMemo(() => 
    generateAnalyticsReport(logs || [], timeframe), 
  [logs, timeframe]);

  // 2. Calculate Trend (Compare last 2 points if available)
  const trend = useMemo(() => {
    if (timelineData.length < 2) return 0;
    const current = timelineData[timelineData.length - 1].volume;
    const previous = timelineData[timelineData.length - 2].volume;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  }, [timelineData]);

  // 3. Navigation Handlers
  const handleOpenAnalytics = () => {
    // In a real router, we'd pass params. Here we assume TrainingCenter defaults to last open tab
    // or we could add logic to App.tsx to handle specific sub-tabs.
    setCurrentView(AppView.TRAINING_CENTER);
  };

  const handleLogWorkout = () => {
    setCurrentView(AppView.TRACKER);
  };

  return (
    <div className="energetic-card p-5 flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <Activity className="text-blue-400" size={18}/> 
            وضعیت تمرین
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">خلاصه عملکرد {timeframe === 'week' ? 'هفتگی' : timeframe === 'month' ? 'ماهانه' : 'سالانه'}</p>
        </div>
        
        {/* Timeframe Toggles */}
        <div className="flex bg-black/30 p-1 rounded-lg">
          {(['week', 'month', 'year'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-[10px] font-bold rounded transition ${
                timeframe === t 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'week' ? '۷ روز' : t === 'month' ? '۳۰ روز' : 'سال'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
        
        {/* Left: Radial Progress (Adherence) */}
        <div className="relative flex flex-col items-center justify-center bg-black/20 rounded-xl p-2 border border-white/5">
          <div className="h-20 w-20 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                innerRadius="80%" 
                outerRadius="100%" 
                barSize={10} 
                data={[{ name: 'Adherence', value: summary.completionRate, fill: '#3b82f6' }]} 
                startAngle={90} 
                endAngle={-270}
              >
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white">{summary.completionRate}%</span>
              <span className="text-[9px] text-gray-400">تکمیل</span>
            </div>
          </div>
        </div>

        {/* Right: Mini Volume Chart */}
        <div className="flex flex-col justify-end bg-black/20 rounded-xl p-3 border border-white/5 relative">
           <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px]">
              {trend > 0 ? <TrendingUp size={12} className="text-green-400"/> : <TrendingDown size={12} className="text-red-400"/>}
              <span className={trend > 0 ? 'text-green-400' : 'text-red-400'}>{Math.abs(trend)}%</span>
           </div>
           <span className="text-[10px] text-gray-400 mb-1">روند حجم (Volume)</span>
           <div className="h-12 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="miniVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} fill="url(#miniVol)" />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
         <div className="bg-white/5 p-2 rounded-lg text-center">
            <Calendar className="w-4 h-4 text-purple-400 mx-auto mb-1 opacity-80"/>
            <span className="block text-sm font-bold text-white">{summary.totalWorkouts}</span>
            <span className="text-[9px] text-gray-500">جلسه</span>
         </div>
         <div className="bg-white/5 p-2 rounded-lg text-center">
            <Dumbbell className="w-4 h-4 text-blue-400 mx-auto mb-1 opacity-80"/>
            <span className="block text-sm font-bold text-white">{(summary.totalVolume/1000).toFixed(1)}k</span>
            <span className="text-[9px] text-gray-500">حجم (kg)</span>
         </div>
         <div className="bg-white/5 p-2 rounded-lg text-center">
            <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1 opacity-80"/>
            <span className="block text-sm font-bold text-white">{summary.bestStreak}</span>
            <span className="text-[9px] text-gray-500">استریک</span>
         </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex gap-2 relative z-10">
         <button onClick={handleOpenAnalytics} className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs py-2 rounded-lg transition flex items-center justify-center">
            گزارش کامل
         </button>
         <button onClick={handleLogWorkout} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-lg transition flex items-center justify-center font-bold shadow-lg shadow-blue-900/20">
            ثبت تمرین <ArrowRight size={12} className="mr-1 rotate-180"/>
         </button>
      </div>
    </div>
  );
};

export default TrainingSummaryWidget;
