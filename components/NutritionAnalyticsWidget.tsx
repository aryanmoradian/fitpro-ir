
import React, { useState, useMemo } from 'react';
import { 
    NutritionDayLog, AnalyticsTimeframe, NutritionReportData
} from '../types';
import { generateNutritionReport } from '../services/analyticsEngine';
import { 
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart
} from 'recharts';
import { 
    Activity, Flame, Zap, Calendar, TrendingUp, AlertCircle, 
    CheckCircle2, Info, ArrowUp, ArrowDown
} from 'lucide-react';

interface NutritionAnalyticsWidgetProps {
    logs: NutritionDayLog[];
}

const KPICard: React.FC<{ 
    title: string; 
    value: string | number; 
    label: string; 
    icon: React.ElementType; 
    color: string;
    trend?: number;
}> = ({ title, value, label, icon: Icon, color, trend }) => (
    <div className="energetic-card p-4 flex flex-col justify-between overflow-hidden relative min-h-[100px]">
        <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 ${color}`}></div>
        <div className="flex justify-between items-start">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</span>
            <div className={`p-2 rounded-lg bg-opacity-20 ${color} bg-white`}>
                <Icon className="text-white" size={18} />
            </div>
        </div>
        <div>
            <div className="text-2xl font-black text-white mt-1 flex items-end gap-2">
                {value}
                {trend !== undefined && (
                    <span className={`text-xs font-bold mb-1 flex items-center ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend >= 0 ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <span className="text-[10px] text-gray-500">{label}</span>
        </div>
    </div>
);

const HeatmapGrid: React.FC<{ data: NutritionReportData['heatmap'] }> = ({ data }) => {
    // Show last 30 days or based on data
    // Fill missing days for visual grid if needed, here we just map existing
    const getIntensity = (val: number) => {
        if (val >= 100) return 'bg-green-500';
        if (val >= 80) return 'bg-green-600/80';
        if (val >= 50) return 'bg-yellow-500';
        if (val > 0) return 'bg-red-500';
        return 'bg-gray-800';
    };

    return (
        <div className="flex flex-wrap gap-1 justify-center mt-2">
            {data.slice(-30).map((d, i) => (
                <div 
                    key={i} 
                    title={`${d.date}: ${d.adherence}%`}
                    className={`w-4 h-4 rounded-sm transition-all hover:scale-125 cursor-pointer ${getIntensity(d.adherence)}`}
                ></div>
            ))}
        </div>
    );
};

const NutritionAnalyticsWidget: React.FC<NutritionAnalyticsWidgetProps> = ({ logs }) => {
    const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('week');

    const { timeline, heatmap, summary, macroDistribution, insights } = useMemo(() => 
        generateNutritionReport(logs, timeframe), 
    [logs, timeframe]);

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header & Controls */}
            <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl border border-white/10">
                <h2 className="text-white font-bold px-4 flex items-center">
                    <Activity className="mr-2 text-green-400"/> گزارش پیشرفت تغذیه
                </h2>
                <div className="flex bg-gray-800 rounded-lg p-1">
                    {(['week', 'month', 'year'] as const).map(t => (
                        <button 
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${timeframe === t ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t === 'week' ? 'هفتگی' : t === 'month' ? 'ماهانه' : 'سالانه'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KPICard 
                    title="پایبندی" 
                    value={`${summary.avgAdherence}%`} 
                    label="میانگین دوره" 
                    icon={CheckCircle2} 
                    color="bg-green-600"
                />
                <KPICard 
                    title="کالری/روز" 
                    value={summary.avgCalories} 
                    label="میانگین مصرف" 
                    icon={Flame} 
                    color="bg-orange-600"
                />
                <KPICard 
                    title="انحراف" 
                    value={(summary.calorieDeviation > 0 ? '+' : '') + summary.calorieDeviation} 
                    label="اختلاف با هدف" 
                    icon={TrendingUp} 
                    color={Math.abs(summary.calorieDeviation) < 200 ? "bg-blue-600" : "bg-red-600"}
                />
                <KPICard 
                    title="پروتئین" 
                    value={`${summary.avgProtein}g`} 
                    label="میانگین روزانه" 
                    icon={Zap} 
                    color="bg-blue-600"
                />
                <KPICard 
                    title="استریک" 
                    value={summary.currentStreak} 
                    label="روز متوالی" 
                    icon={Flame} 
                    color="bg-yellow-500"
                />
                <KPICard 
                    title="تحلیل" 
                    value={insights.length} 
                    label="نکته جدید" 
                    icon={Info} 
                    color="bg-purple-600"
                />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Calorie Trend */}
                <div className="lg:col-span-2 energetic-card p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center">
                        <TrendingUp className="mr-2 text-orange-400"/> روند کالری و هدف
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={timeline}>
                                <defs>
                                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="label" stroke="#9ca3af" fontSize={10} />
                                <YAxis stroke="#9ca3af" fontSize={10} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px'}}
                                    labelStyle={{color: '#fff'}}
                                />
                                <Area type="monotone" dataKey="calories" stroke="#f97316" fillOpacity={1} fill="url(#colorCal)" name="مصرفی" />
                                <Line type="step" dataKey="targetCalories" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="هدف" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Macro Distribution */}
                <div className="energetic-card p-6 flex flex-col">
                    <h3 className="text-white font-bold mb-4 flex items-center">
                        <PieChart className="mr-2 text-blue-400" size={18}/> توزیع درشت‌مغذی‌ها
                    </h3>
                    <div className="flex-1 h-48 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={macroDistribution} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" cy="50%" 
                                    innerRadius={50} outerRadius={70} 
                                    stroke="none"
                                >
                                    {macroDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor: '#1f2937', borderRadius: '8px', border: 'none'}} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-white">{summary.avgCalories}</span>
                            <span className="text-[10px] text-gray-500">Avg kcal</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 text-xs mt-2">
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1"/> Protein</div>
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-1"/> Carbs</div>
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"/> Fats</div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Insights Panel */}
                <div className="energetic-card p-6 bg-gradient-to-br from-purple-900/20 to-gray-900 border-purple-500/20">
                    <h3 className="text-white font-bold mb-4 flex items-center">
                        <Zap className="mr-2 text-yellow-400"/> تحلیل هوشمند تغذیه
                    </h3>
                    <div className="space-y-3">
                        {insights.length === 0 ? (
                            <p className="text-gray-500 text-sm italic text-center">داده کافی برای تحلیل موجود نیست.</p>
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

                {/* Heatmap */}
                <div className="energetic-card p-6">
                    <h3 className="text-white font-bold mb-2 flex items-center">
                        <Calendar className="mr-2 text-green-400"/> ثبات رژیم (۳۰ روز اخیر)
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">روزهای سبز نشان‌دهنده رعایت کامل رژیم هستند.</p>
                    <div className="flex items-center justify-center h-full pb-4">
                        <HeatmapGrid data={heatmap} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NutritionAnalyticsWidget;
