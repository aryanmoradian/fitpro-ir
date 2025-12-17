
import React, { useState, useMemo } from 'react';
import { 
    UserProfile, TrainingLog, AnalyticsTimeframe 
} from '../types';
import { generateAnalyticsReport } from '../services/analyticsEngine';
import { 
    AreaChart, Area, BarChart, Bar, RadarChart, Radar, 
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
    TrendingUp, Calendar, Activity, Zap, Layers, AlertCircle, CheckCircle2, 
    BarChart2, Flame, Info 
} from 'lucide-react';

interface ProgressDashboardProps {
    profile: UserProfile;
    onRestoreProgram: (program: any) => void; // Legacy prop needed for type compatibility
}

const KPICard: React.FC<{ title: string; value: string | number; label: string; icon: React.ElementType; color: string }> = ({ title, value, label, icon: Icon, color }) => (
    <div className="energetic-card p-4 flex items-center justify-between overflow-hidden relative">
        <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 ${color}`}></div>
        <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</span>
            <div className="text-2xl font-black text-white mt-1">{value}</div>
            <span className="text-[10px] text-gray-500">{label}</span>
        </div>
        <div className={`p-3 rounded-xl bg-opacity-20 ${color} bg-white`}>
            <Icon className="text-white" size={24} />
        </div>
    </div>
);

const ConsistencyHeatmap: React.FC<{ logs: TrainingLog[] }> = ({ logs }) => {
    // Generate last 28 days grid
    const days = Array.from({ length: 28 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (27 - i));
        const dateStr = d.toLocaleDateString('fa-IR'); // Match log format
        // Check logs roughly (date string matching can be tricky with locales, assuming ISO match in real implementation)
        // For demo, we rely on the string stored in logs
        const log = logs.find(l => l.date === dateStr); 
        let status = 'none';
        if (log) {
            if (log.status === 'Completed') status = 'done';
            else if (log.status === 'Partial') status = 'partial';
            else if (log.status === 'Skipped') status = 'missed';
        }
        return { date: dateStr, status };
    });

    return (
        <div className="flex gap-1 justify-center mt-4">
            {days.map((d, i) => (
                <div 
                    key={i} 
                    title={d.date}
                    className={`w-3 h-8 rounded-sm transition-all hover:scale-125 ${
                        d.status === 'done' ? 'bg-green-500' : 
                        d.status === 'partial' ? 'bg-yellow-500' : 
                        d.status === 'missed' ? 'bg-red-500' : 'bg-gray-800'
                    }`}
                ></div>
            ))}
        </div>
    );
};

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ profile }) => {
    const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('week');
    
    // Get Logs (Assuming they are passed in profile or fetched. Here we rely on profile.trainingLogs if integrated, 
    // but typically we'd fetch. For now, let's use the profile logs if available or empty)
    const logs = profile.trainingLogs || []; 

    const { timelineData, muscleStats, summary, insights } = useMemo(() => 
        generateAnalyticsReport(logs, timeframe), 
    [logs, timeframe]);

    return (
        <div className="space-y-6 animate-in fade-in" dir="rtl">
            {/* Header Controls */}
            <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl border border-white/10">
                <h2 className="text-white font-bold px-4 flex items-center">
                    <BarChart2 className="mr-2 text-blue-400"/> گزارش عملکرد
                </h2>
                <div className="flex bg-gray-800 rounded-lg p-1">
                    {(['week', 'month', 'year'] as const).map(t => (
                        <button 
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${timeframe === t ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t === 'week' ? 'هفتگی' : t === 'month' ? 'ماهانه' : 'سالانه'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard 
                    title="پایبندی" 
                    value={`${summary.completionRate}%`} 
                    label="نرخ تکمیل تمرینات" 
                    icon={CheckCircle2} 
                    color="bg-green-600"
                />
                <KPICard 
                    title="حجم کل" 
                    value={(summary.totalVolume / 1000).toFixed(1) + 'k'} 
                    label="کیلوگرم جابجا شده" 
                    icon={Layers} 
                    color="bg-blue-600"
                />
                <KPICard 
                    title="جلسات" 
                    value={summary.totalWorkouts} 
                    label="تعداد تمرین ثبت شده" 
                    icon={Calendar} 
                    color="bg-purple-600"
                />
                <KPICard 
                    title="استریک" 
                    value={summary.bestStreak} 
                    label="روز متوالی" 
                    icon={Flame} 
                    color="bg-orange-600"
                />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Volume Trend */}
                <div className="lg:col-span-2 energetic-card p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center">
                        <TrendingUp className="mr-2 text-blue-400"/> روند حجم و فشار تمرین
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData}>
                                <defs>
                                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="label" stroke="#9ca3af" fontSize={10} tick={{dy: 10}} />
                                <YAxis stroke="#9ca3af" fontSize={10} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px'}}
                                    labelStyle={{color: '#fff'}}
                                />
                                <Area type="monotone" dataKey="volume" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVol)" name="حجم (kg)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Muscle Distribution */}
                <div className="energetic-card p-6 flex flex-col">
                    <h3 className="text-white font-bold mb-4 flex items-center">
                        <Activity className="mr-2 text-purple-400"/> توازن عضلانی
                    </h3>
                    <div className="flex-1 h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={muscleStats.slice(0, 6)}>
                                <PolarGrid stroke="#4b5563" />
                                <PolarAngleAxis dataKey="muscle" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                <Radar name="Sets" dataKey="setVolume" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-xs text-center text-gray-500">
                        توزیع ست‌های انجام شده بر اساس عضله
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Insights Panel */}
                <div className="energetic-card p-6 bg-gradient-to-br from-indigo-900/20 to-gray-900 border-indigo-500/20">
                    <h3 className="text-white font-bold mb-4 flex items-center">
                        <Zap className="mr-2 text-yellow-400"/> تحلیل هوشمند مربی
                    </h3>
                    <div className="space-y-3">
                        {insights.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">داده کافی برای تحلیل موجود نیست.</p>
                        ) : (
                            insights.map((insight, idx) => (
                                <div key={idx} className="flex gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
                                    <div className={`mt-1 ${insight.type === 'positive' ? 'text-green-400' : insight.type === 'negative' ? 'text-red-400' : 'text-blue-400'}`}>
                                        {insight.type === 'positive' ? <TrendingUp size={16}/> : <Info size={16}/>}
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">{insight.metric}</span>
                                        <p className="text-sm text-gray-200 leading-snug">{insight.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Consistency Calendar */}
                <div className="energetic-card p-6">
                    <h3 className="text-white font-bold mb-2 flex items-center">
                        <Calendar className="mr-2 text-green-400"/> تقویم ثبات (۲۸ روز اخیر)
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">هر خانه نشان‌دهنده یک روز است. سبز پررنگ یعنی تمرین کامل.</p>
                    <div className="flex items-center justify-center h-full pb-4">
                        <ConsistencyHeatmap logs={logs} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressDashboard;
