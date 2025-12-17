
import React, { useState, useMemo } from 'react';
import { UserProfile, Supplement, SupplementFeedback } from '../types';
import { getDailySupplementStatus, toggleSupplementLog, getConsumptionAdherenceStats, saveDailyFeedback, calculateSupplementStreak } from '../services/supplementService';
import { 
    Calendar, CheckCircle2, Circle, ChevronLeft, ChevronRight, BarChart2, 
    Pill, AlertCircle, TrendingUp, Info, Activity, Smile, Frown, Meh, Zap, Battery,
    LayoutGrid, ListChecks, Check, Flame
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

interface SupplementHistoryWidgetProps {
    profile: UserProfile;
    updateProfile: (p: UserProfile) => void;
}

const CircularProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number; color?: string; streak?: number }> = ({ 
    percentage, 
    size = 140, 
    strokeWidth = 12,
    color = "#3b82f6",
    streak = 0
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center group" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#1f2937"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Foreground Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
                />
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-orange-400 mb-1 animate-pulse">
                    <Flame size={14} fill="currentColor" />
                    <span className="text-xs font-bold">{streak} روز متوالی</span>
                </div>
                <span className="text-3xl font-black text-white">{percentage}%</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">امروز</span>
            </div>
        </div>
    );
};

const DailyTrackerView: React.FC<{ 
    profile: UserProfile; 
    onToggle: (s: Supplement, date: string) => void; 
    onFeedback: (date: string, mood: SupplementFeedback['mood'], notes?: string) => void;
}> = ({ profile, onToggle, onFeedback }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('fa-IR'));
    
    const dailyData = useMemo(() => 
        getDailySupplementStatus(profile, selectedDate), 
    [profile, selectedDate]);

    // Calculate daily progress
    const activeCount = dailyData.length;
    const consumedCount = dailyData.filter(d => d.log?.consumed).length;
    const progress = activeCount === 0 ? 0 : Math.round((consumedCount / activeCount) * 100);
    const streak = useMemo(() => calculateSupplementStreak(profile), [profile.supplementLogs]);

    // Get Feedback for date
    const feedback = profile.supplementFeedbacks?.find(f => f.date === selectedDate);

    const shiftDate = (days: number) => {
        // Simple string manipulation for demo (YYYY/MM/DD), typically use a date library
        // Since we use Persian Locale strings in this app, proper date arithmetic is complex.
        // For this widget demo, we just disable nav or mock it.
        // Assuming current date is fine for "Daily Tracker".
        alert("قابلیت تغییر تاریخ در نسخه بعدی فعال می‌شود.");
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Date Header */}
            <div className="flex justify-between items-center bg-[#1E293B] p-3 rounded-xl border border-gray-700">
                <button onClick={() => shiftDate(-1)} className="p-2 text-gray-400 hover:text-white transition"><ChevronRight size={20}/></button> {/* RTL direction */}
                <div className="text-center">
                    <h3 className="text-white font-bold text-lg">{selectedDate}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">گزارش روزانه</p>
                </div>
                <button onClick={() => shiftDate(1)} className="p-2 text-gray-400 hover:text-white transition"><ChevronLeft size={20}/></button> {/* RTL direction */}
            </div>

            {/* Top Section: Circular Progress */}
            <div className="flex flex-col items-center justify-center py-4">
                <CircularProgress 
                    percentage={progress} 
                    streak={streak}
                    color={progress === 100 ? "#22c55e" : progress >= 50 ? "#3b82f6" : "#ef4444"} 
                />
            </div>

            {/* Checklist */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <ListChecks size={16}/> مصرف مکمل‌ها
                </h4>
                {dailyData.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl bg-black/20">
                        <Pill size={32} className="mx-auto mb-2 opacity-30"/>
                        <p className="text-sm">هیچ مکملی فعال نیست.</p>
                        <p className="text-xs mt-1">از تب "استک من" مکمل‌ها را فعال کنید.</p>
                    </div>
                ) : (
                    dailyData.map(({ supplement, log }) => {
                        const isConsumed = !!log?.consumed;
                        return (
                            <div 
                                key={supplement.id} 
                                onClick={() => onToggle(supplement, selectedDate)}
                                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all group ${isConsumed ? 'bg-green-900/10 border-green-500/30' : 'bg-[#1E293B] border-gray-700 hover:border-gray-500'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isConsumed ? 'bg-green-500 border-green-500 scale-110' : 'border-gray-500 group-hover:border-white'}`}>
                                        {isConsumed && <Check size={14} className="text-white"/>}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold transition ${isConsumed ? 'text-green-400 line-through decoration-green-500/50' : 'text-white'}`}>{supplement.name}</h4>
                                        <div className="flex gap-2 text-xs text-gray-500">
                                            <span>{supplement.dosage}</span>
                                            {supplement.timing.length > 0 && <span className="bg-black/30 px-1.5 rounded text-gray-400">{supplement.timing[0]}</span>}
                                        </div>
                                    </div>
                                </div>
                                {isConsumed && <span className="text-[10px] text-green-400/70 font-mono">{log?.time}</span>}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Feedback Loop */}
            <div className="bg-[#1E293B] p-6 rounded-2xl border border-gray-700 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <h4 className="text-white font-bold mb-4 flex items-center relative z-10">
                    <TrendingUp className="mr-2 text-yellow-400"/> حس و حال امروز؟
                </h4>
                
                <div className="flex justify-between gap-2 mb-4 relative z-10">
                    {[
                        { val: 'High Energy', label: 'پرانرژی', icon: Zap, color: 'text-yellow-400', bg: 'hover:bg-yellow-900/30' },
                        { val: 'Recovered', label: 'ریکاوری', icon: Smile, color: 'text-green-400', bg: 'hover:bg-green-900/30' },
                        { val: 'Neutral', label: 'معمولی', icon: Meh, color: 'text-gray-400', bg: 'hover:bg-gray-700' },
                        { val: 'Tired', label: 'خسته', icon: Battery, color: 'text-orange-400', bg: 'hover:bg-orange-900/30' },
                        { val: 'Bloated', label: 'سنگین', icon: AlertCircle, color: 'text-red-400', bg: 'hover:bg-red-900/30' }
                    ].map((item) => (
                        <button 
                            key={item.val}
                            onClick={() => onFeedback(selectedDate, item.val as any)}
                            className={`flex-1 p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                feedback?.mood === item.val 
                                    ? `bg-black border-white ${item.color} scale-105 shadow-lg` 
                                    : `bg-transparent border-gray-700 text-gray-500 ${item.bg}`
                            }`}
                        >
                            <item.icon className={`mb-1 w-6 h-6 ${feedback?.mood === item.val ? item.color : 'text-current'}`} />
                            <span className="text-[8px] md:text-[10px] font-bold whitespace-nowrap">{item.label}</span>
                        </button>
                    ))}
                </div>

                <textarea 
                    placeholder="یادداشت کوتاه (عوارض، تاثیرات و...)" 
                    className="w-full bg-black/20 border border-gray-600 rounded-lg p-3 text-sm text-white resize-none h-16 focus:border-blue-500 outline-none transition relative z-10"
                    defaultValue={feedback?.notes || ''}
                    onBlur={(e) => onFeedback(selectedDate, feedback?.mood || 'Neutral', e.target.value)}
                />
            </div>
        </div>
    );
};

const AnalyticsView: React.FC<{ profile: UserProfile }> = ({ profile }) => {
    const [subTab, setSubTab] = useState<'weekly' | 'heatmap'>('heatmap');
    
    const statsWeekly = useMemo(() => getConsumptionAdherenceStats(profile, '7d'), [profile]);
    const statsHeatmap = useMemo(() => getConsumptionAdherenceStats(profile, 'heatmap'), [profile]);

    // Heatmap Grid Logic (GitHub Style: 7 Rows for Days, Columns for Weeks)
    // We need to transform the linear timeline into a grid
    const heatmapGrid = useMemo(() => {
        const data = statsHeatmap.timeline; // ~60 days
        // We want columns of 7 days (Mon-Sun).
        // Let's just group by chunks of 7 for simplicity in this view
        const columns = [];
        for (let i = 0; i < data.length; i += 7) {
            columns.push(data.slice(i, i + 7));
        }
        return columns.reverse(); // Newest weeks on right
    }, [statsHeatmap]);

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Sub Tabs */}
            <div className="flex bg-black/30 p-1 rounded-lg border border-white/5">
                <button 
                    onClick={() => setSubTab('weekly')}
                    className={`flex-1 py-2 rounded-md text-xs font-bold transition ${subTab === 'weekly' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    نمودار هفتگی
                </button>
                <button 
                    onClick={() => setSubTab('heatmap')}
                    className={`flex-1 py-2 rounded-md text-xs font-bold transition ${subTab === 'heatmap' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    نقشه ثبات
                </button>
            </div>

            {/* Weekly Chart */}
            {subTab === 'weekly' && (
                <div className="energetic-card p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center">
                        <BarChart2 className="mr-2 text-blue-400"/> عملکرد ۷ روز گذشته
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsWeekly.timeline}>
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickFormatter={(val) => val.split('/')[2]} />
                                <YAxis stroke="#9ca3af" fontSize={10} domain={[0, 100]} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px'}}
                                />
                                <Bar dataKey="adherence" radius={[4, 4, 0, 0]}>
                                    {statsWeekly.timeline.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.adherence >= 80 ? '#10b981' : entry.adherence >= 50 ? '#facc15' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-400 bg-black/20 p-3 rounded-lg">
                        <span>میانگین هفته: <span className="text-white font-bold">{statsWeekly.totalAdherence}%</span></span>
                    </div>
                </div>
            )}

            {/* Monthly Heatmap */}
            {subTab === 'heatmap' && (
                <div className="energetic-card p-6 bg-[#1a1b23] border-gray-700">
                    <h3 className="text-white font-bold mb-6 flex items-center justify-between">
                        <div className="flex items-center"><LayoutGrid className="mr-2 text-green-400"/> ثبات مصرف (۶۰ روز)</div>
                    </h3>
                    
                    {/* GitHub Style Grid */}
                    <div className="flex gap-2 justify-center overflow-x-auto pb-2 custom-scrollbar">
                        {heatmapGrid.map((week, wIdx) => (
                            <div key={wIdx} className="flex flex-col gap-2">
                                {week.map((day, dIdx) => (
                                    <div 
                                        key={dIdx}
                                        title={`${day.date}: ${day.adherence}%`}
                                        className={`w-4 h-4 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-default border border-black/20 ${
                                            day.status === 'high' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 
                                            day.status === 'medium' ? 'bg-green-700' : 
                                            day.status === 'low' ? 'bg-green-900' : 
                                            'bg-gray-800'
                                        }`}
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-gray-500 bg-black/20 p-2 rounded-lg w-fit mx-auto">
                        <span className="flex items-center"><div className="w-3 h-3 bg-gray-800 rounded-sm mr-1"></div> 0%</span>
                        <span className="flex items-center"><div className="w-3 h-3 bg-green-900 rounded-sm mr-1"></div> 1-39%</span>
                        <span className="flex items-center"><div className="w-3 h-3 bg-green-700 rounded-sm mr-1"></div> 40-79%</span>
                        <span className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div> 80%+</span>
                    </div>
                </div>
            )}

            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20 flex gap-3">
                <Info className="text-blue-400 shrink-0 mt-1" size={18}/>
                <p className="text-xs text-blue-200/80 leading-relaxed">
                    نکته: حفظ زنجیره مصرف (Streak) برای مکمل‌هایی مانند کراتین و بتا-آلانین بسیار حیاتی است. پر کردن خانه‌های سبز به معنی بارگیری کامل عضلات است.
                </p>
            </div>
        </div>
    );
};

const SupplementHistoryWidget: React.FC<SupplementHistoryWidgetProps> = ({ profile, updateProfile }) => {
    const [activeTab, setActiveTab] = useState<'tracker' | 'analytics'>('tracker');

    const handleLogToggle = (supplement: Supplement, date: string) => {
        const updatedProfile = toggleSupplementLog(profile, supplement, date);
        updateProfile(updatedProfile);
    };

    const handleFeedback = (date: string, mood: SupplementFeedback['mood'], notes?: string) => {
        const updatedProfile = saveDailyFeedback(profile, date, mood, notes);
        updateProfile(updatedProfile);
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Nav */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 shrink-0 w-fit mx-auto md:mx-0">
                <button 
                    onClick={() => setActiveTab('tracker')} 
                    className={`px-6 py-2 rounded-lg font-bold transition flex items-center ${activeTab === 'tracker' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <ListChecks className="w-4 h-4 ml-2"/> چک‌لیست روزانه
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')} 
                    className={`px-6 py-2 rounded-lg font-bold transition flex items-center ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <BarChart2 className="w-4 h-4 ml-2"/> آنالیز و تاریخچه
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {activeTab === 'tracker' ? (
                    <DailyTrackerView 
                        profile={profile} 
                        onToggle={handleLogToggle} 
                        onFeedback={handleFeedback}
                    />
                ) : (
                    <AnalyticsView profile={profile} />
                )}
            </div>
        </div>
    );
};

export default SupplementHistoryWidget;
