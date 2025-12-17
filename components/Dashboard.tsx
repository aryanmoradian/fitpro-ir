
import React, { useState, useMemo } from 'react';
import { AppView, BodyMetricLog, DailyLog, Exercise, NutritionItem, WeeklyWorkoutPlan, GuidanceState, UserProfile } from '../types';
import { Check, Dumbbell, Utensils, Zap, Brain, HeartPulse, ChevronRight, Activity, Calendar, Lock, Flame, ArrowLeft, Trophy, AlertTriangle, Target, Crosshair } from 'lucide-react';
import GuidanceTracker from './GuidanceTracker';
import NewsTicker from './NewsTicker';
import SubscriptionStatusWidget from './SubscriptionStatusWidget'; // Updated Import
import { LevelInfo } from '../services/levelCalculator';
import WeeklyReview from './WeeklyReview';
import HistoryAnalyticsWidget from './HistoryAnalyticsWidget'; 
import { IntegratedDashboardGrid } from './DashboardKPIs';
import { calculateDashboardKPIs } from '../services/dashboardAggregation';

interface DashboardProps {
  logs: DailyLog[];
  bodyMetrics: BodyMetricLog[];
  workoutPlan: Exercise[];
  nutritionPlan: NutritionItem[];
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  guidanceState: GuidanceState;
  setCurrentView: (view: AppView) => void;
  weeklyWorkoutPlan: WeeklyWorkoutPlan;
  updateTodaysLog: (partialLog: Partial<DailyLog>) => void;
  athleteLevelInfo: LevelInfo;
  highlightCharts: boolean;
}

// --- DYNAMIC WELCOME WIDGET (Mission Briefing Style) ---
const DynamicWelcomeWidget: React.FC<{ 
    profile: UserProfile; 
    logs: DailyLog[]; 
    setCurrentView: (view: AppView) => void; 
}> = ({ profile, logs, setCurrentView }) => {
    const today = new Date().toLocaleDateString('fa-IR');
    const todayLog = logs.find(l => l.date === today);
    
    // Logic Engine for Message
    const getMessage = () => {
        // 1. Injury Check
        const hasInjury = profile.healthProfile?.injuryLog.some(i => i.status === 'Active');
        if (hasInjury) return { text: "وضعیت هشدار: آسیب‌دیدگی فعال. اولویت: ریکاوری و احتیاط.", mood: 'care' };

        // 2. Completion Check
        if (todayLog && todayLog.workoutScore >= 100) return { text: "ماموریت امروز تکمیل شد. واحد آماده استراحت.", mood: 'success' };

        // 3. Streak Check
        let streak = 0;
        for(let i = logs.length -1; i>=0; i--) {
            if(logs[i].workoutScore > 0) streak++; else break;
        }
        if (streak >= 3) return { text: "زنجیره عملیاتی حفظ شده. ادامه دهید.", mood: 'fire' };

        // 4. Workout Scheduled
        if (profile.activeProgram || profile.smartProgram) return { text: "اهداف امروز شناسایی شدند. آماده برای اجرا؟", mood: 'energy' };

        // 5. Default
        return { text: "به پایگاه خوش آمدید. منتظر دستورات جدید.", mood: 'default' };
    };

    const msg = getMessage();

    return (
        <div className="relative overflow-hidden rounded-lg bg-[#1F2620] border-2 border-[#4A5D23] p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 group">
            {/* Background Texture - Mesh */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#4A5D23] opacity-20 rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-center gap-5 z-10 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-md flex items-center justify-center shadow-lg border-2 ${msg.mood === 'care' ? 'bg-red-900/50 border-red-500' : 'bg-[#4A5D23] border-[#6B7A58]'} shrink-0`}>
                    {msg.mood === 'care' ? <AlertTriangle size={32} className="text-white"/> : 
                     msg.mood === 'success' ? <Check size={32} className="text-[#D4FF00]"/> :
                     <Target size={32} className="text-white"/>}
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2 font-heading tracking-tight">
                        <span className="text-[#D4FF00] text-sm font-mono tracking-widest uppercase block md:inline mb-1 md:mb-0 md:mr-2">OPERATOR:</span>
                        {profile.name}
                    </h1>
                    <p className="text-gray-300 text-sm mt-1 font-bold font-mono leading-relaxed border-r-2 border-[#D4FF00] pr-3 mr-1">{msg.text}</p>
                </div>
            </div>

            <button 
                onClick={() => setCurrentView(AppView.TRACKER)}
                className="group flex items-center gap-2 bg-[#D4FF00] hover:bg-[#b8dd00] text-black px-6 py-3 rounded-md text-sm font-extrabold transition-all hover:shadow-[0_0_15px_rgba(212,255,0,0.4)] z-10 w-full md:w-auto justify-center uppercase tracking-wider"
            >
                <Crosshair size={18} />
                شروع عملیات
            </button>
        </div>
    );
};

// --- P1: GAMIFIED STREAK WIDGET (Tactical Counter) ---
const StreakWidget: React.FC<{ logs: DailyLog[] }> = ({ logs }) => {
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
            dateStr: d.toLocaleDateString('fa-IR'),
            dayName: d.toLocaleDateString('fa-IR', { weekday: 'short' }),
            dayNum: d.getDate(),
            isToday: i === 6
        };
    });

    const currentStreak = useMemo(() => {
        let streak = 0;
        for(let i = logs.length -1; i>=0; i--) {
            if(logs[i].workoutScore > 0) streak++; else break;
        }
        return streak;
    }, [logs]);

    return (
        <div className="energetic-card p-5 relative overflow-hidden bg-[#151915]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                {/* Stats Block */}
                <div className="flex items-center gap-4 min-w-[140px] border-l-2 border-[#4A5D23] pl-4">
                    <div className="text-4xl font-black text-[#D4FF00] font-mono">{currentStreak}</div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Day Streak</span>
                        <span className="text-xs text-white font-bold">ثبات عملیاتی</span>
                    </div>
                </div>

                {/* Visual Track */}
                <div className="flex-1 w-full relative px-2">
                    {/* Grid Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-[#3E4A3E] -z-10"></div>
                    
                    <div className="flex justify-between items-center">
                        {days.map((day) => {
                            const log = logs.find(l => l.date === day.dateStr);
                            const hasWorkout = log && log.workoutScore > 0;

                            return (
                                <div key={day.dateStr} className="flex flex-col items-center gap-2 group">
                                    <div className={`
                                        relative w-8 h-8 md:w-10 md:h-10 transform rotate-45 flex items-center justify-center border-2 transition-all duration-300 z-10
                                        ${hasWorkout 
                                            ? 'bg-[#4A5D23] border-[#D4FF00] shadow-[0_0_10px_rgba(212,255,0,0.3)]' 
                                            : day.isToday
                                                ? 'bg-[#232923] border-[#D4FF00] animate-pulse'
                                                : 'bg-[#0F120D] border-[#3E4A3E] text-gray-600'
                                        }
                                    `}>
                                        <div className="transform -rotate-45 flex items-center justify-center w-full h-full">
                                            {hasWorkout ? <Check size={16} className="text-white" strokeWidth={3} /> : <span className={`text-[10px] font-bold ${day.isToday ? 'text-[#D4FF00]' : 'text-gray-500'}`}>{day.dayNum}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- P6: SMART TOOLS COMMAND CARDS (Tactical Grid) ---
const SmartToolsGrid: React.FC<{ setCurrentView: (view: AppView) => void }> = ({ setCurrentView }) => {
    const tools = [
        { name: 'سازنده برنامه', subtitle: 'طراحی تاکتیک', icon: Dumbbell, view: AppView.PLANNER, color: 'text-blue-400' },
        { name: 'اسکنر غذا', subtitle: 'آنالیز سوخت', icon: Utensils, view: AppView.MEAL_SCAN, color: 'text-green-400' },
        { name: 'تحلیل سلامت', subtitle: 'پایش حیاتی', icon: HeartPulse, view: AppView.HEALTH_HUB, color: 'text-red-400' },
        { name: 'مربی هوشمند', subtitle: 'مشاور میدان', icon: Brain, view: AppView.COACH, color: 'text-purple-400' },
    ];

    return (
        <div className="energetic-card p-5 h-full flex flex-col bg-[#151915]">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-[#3E4A3E] pb-2">
                <Zap size={18} className="text-[#D4FF00]"/> ابزارهای فرماندهی
            </h3>
            <div className="grid grid-cols-2 gap-3 flex-1">
                {tools.map((tool, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentView(tool.view)}
                        className="relative overflow-hidden rounded-md bg-[#232923] border border-[#3E4A3E] hover:border-[#D4FF00] p-4 text-right transition-all duration-200 group hover:-translate-y-1 flex flex-col justify-center min-h-[100px]"
                    >
                        <div className={`w-10 h-10 rounded-sm flex items-center justify-center mb-3 bg-[#0F120D] border border-[#3E4A3E] group-hover:border-${tool.color.split('-')[1]}-500 transition-colors`}>
                            <tool.icon size={20} className={tool.color} />
                        </div>
                        
                        <span className="text-sm font-bold text-gray-200 group-hover:text-white block z-10">{tool.name}</span>
                        <span className="text-[10px] text-gray-500 block z-10 font-mono">{tool.subtitle}</span>
                        
                        {/* Corner Accent */}
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#3E4A3E] group-hover:border-[#D4FF00] transition-colors rounded-tr-md"></div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = (props) => {
  const { logs, guidanceState, setCurrentView, profile, bodyMetrics } = props;
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);

  const safeLogs = logs || [];
  const safeMetrics = bodyMetrics || [];

  // KPI Aggregation
  const dashboardKPIs = useMemo(() => calculateDashboardKPIs(profile, safeLogs), [profile, safeLogs]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in" dir="rtl">
      
      {/* 1. Dynamic Welcome Header */}
      <DynamicWelcomeWidget profile={profile} logs={safeLogs} setCurrentView={setCurrentView} />

      {/* Ticker Strip */}
      <NewsTicker logs={safeLogs} profile={profile} metrics={safeMetrics} setCurrentView={setCurrentView} />

      {/* --- 12-COLUMN GRID LAYOUT --- */}
      <div className="grid grid-cols-12 gap-6">
          
          {/* P1: STREAK WIDGET (Top Banner) */}
          <div className="col-span-12">
              <StreakWidget logs={safeLogs} />
          </div>

          {/* P2: ROADMAP (Guidance) */}
          <div className="col-span-12">
              <GuidanceTracker guidanceState={guidanceState} setCurrentView={setCurrentView} />
          </div>

          {/* P5: SUBSCRIPTION STATUS (MOVED UP FOR VISIBILITY) */}
          <div className="col-span-12 md:col-span-5 lg:col-span-5 h-full">
               {/* Replaced legacy SubscriptionCard with new smart Widget */}
              <SubscriptionStatusWidget profile={profile} onUpgrade={() => setCurrentView(AppView.SUBSCRIPTION_LANDING)} />
          </div>

           {/* P6: SMART TOOLS */}
           <div className="col-span-12 md:col-span-7 lg:col-span-7 h-full">
              <SmartToolsGrid setCurrentView={setCurrentView} />
          </div>

          {/* P3: EXECUTION TREND (Analytics) */}
          <div className="col-span-12 lg:col-span-6 h-full min-h-[350px]">
              <HistoryAnalyticsWidget 
                  logs={safeLogs} 
                  profile={profile} 
                  onNavigate={() => setCurrentView(AppView.PLANNER)}
              />
          </div>

          {/* P4: PERFORMANCE OVERVIEW (KPIs) */}
          <div className="col-span-12 lg:col-span-6">
              <div className="energetic-card p-5 h-full bg-[#151915] flex flex-col">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-[#3E4A3E] pb-2">
                      <Activity className="text-[#D4FF00]" size={18}/> گزارش وضعیت (SITREP)
                  </h3>
                  {/* KPI Grid - Adjusted to fit container */}
                  <div className="flex-1">
                      <IntegratedDashboardGrid kpis={dashboardKPIs} setCurrentView={setCurrentView} />
                  </div>
              </div>
          </div>

      </div>

      {/* Weekly Review Modal */}
      {showWeeklyReview && <WeeklyReview logs={safeLogs} onClose={() => setShowWeeklyReview(false)} />}
    </div>
  );
};

export default React.memo(Dashboard);
