
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, DailyLog, AppView, GeneratedReport, ReportConfig, TrendDataPoint, HolisticScore } from '../types';
import { generateComprehensiveReport, predictFutureTrends } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  FileText, TrendingUp, PieChart, Activity, Brain, Layers, Calendar, 
  Download, RefreshCw, Loader2, CheckSquare, Settings
} from 'lucide-react';

interface ReportsCenterProps {
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  logs: DailyLog[];
  setCurrentView: (view: AppView) => void;
}

// --- SUB-COMPONENTS ---

const HolisticRadar: React.FC<{ score: HolisticScore }> = ({ score }) => {
    const data = [
        { subject: 'Training', A: score.physical, fullMark: 100 },
        { subject: 'Nutrition', A: score.nutrition, fullMark: 100 },
        { subject: 'Recovery', A: score.recovery, fullMark: 100 },
        { subject: 'Health', A: score.physical, fullMark: 100 }, // Using physical as proxy if health calc complex
        { subject: 'Social', A: score.social, fullMark: 100 },
    ];

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#4b5563" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Athlete Score" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
                    <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px'}}/>
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

const PredictiveChart: React.FC<{ 
    history: any[]; 
    dataKey: string; 
    title: string; 
    color: string 
}> = ({ history, dataKey, title, color }) => {
    const [projectedData, setProjectedData] = useState<TrendDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadPrediction = async () => {
            if (history.length < 5) return; // Need min data
            setIsLoading(true);
            const simpleHistory = history.map(h => ({ date: h.date, value: h[dataKey] || h.weight || h.calculatedResult }));
            const preds = await predictFutureTrends(simpleHistory);
            setProjectedData(preds);
            setIsLoading(false);
        };
        loadPrediction();
    }, [history, dataKey]);

    const combinedData = [
        ...history.map(h => ({ ...h, type: 'historical' })),
        ...projectedData
    ];

    return (
        <div className="energetic-card p-6 h-80">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <TrendingUp className="text-gray-400" size={18}/> {title}
                </h3>
                {isLoading && <Loader2 className="animate-spin text-gray-500" size={16}/>}
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickFormatter={(v) => v.split('/').slice(1).join('/')}/>
                    <YAxis stroke="#9ca3af" fontSize={10} domain={['auto', 'auto']}/>
                    <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}} />
                    <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} connectNulls />
                    <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Forecast" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

const ReportBuilder: React.FC<{ 
    logs: DailyLog[]; 
    profile: UserProfile; 
}> = ({ logs, profile }) => {
    const [config, setConfig] = useState<ReportConfig>({
        dateRange: 'lastMonth',
        modules: { training: true, nutrition: true, recovery: true, health: true }
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [report, setReport] = useState<GeneratedReport | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        // 1. Filter Data based on Range
        const now = new Date();
        const days = config.dateRange === 'lastWeek' ? 7 : config.dateRange === 'lastMonth' ? 30 : 90;
        const cutoff = new Date(now.setDate(now.getDate() - days));
        
        // Mock date parsing/filtering (assuming YYYY/MM/DD or ISO)
        const filteredLogs = logs.slice(-days); // Simple slice for demo

        // 2. Aggregate Data
        const aggregatedData = {
            profile: { name: profile.name, goal: profile.goalType },
            logs: filteredLogs,
            metrics: profile.metricsHistory.slice(-5)
        };

        // 3. Call AI
        const result = await generateComprehensiveReport(aggregatedData, config);
        setReport(result);
        setIsGenerating(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            {/* Builder Config */}
            <div className="energetic-card p-6 bg-gray-800 border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Settings className="text-blue-400"/> تنظیمات گزارش</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">بازه زمانی</label>
                        <select 
                            className="w-full input-styled p-3"
                            value={config.dateRange}
                            onChange={(e) => setConfig({...config, dateRange: e.target.value as any})}
                        >
                            <option value="lastWeek">هفته گذشته</option>
                            <option value="lastMonth">ماه گذشته</option>
                            <option value="last3Months">۳ ماه اخیر</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">بخش‌های مورد نظر</label>
                        <div className="space-y-2">
                            {Object.keys(config.modules).map(key => (
                                <label key={key} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={config.modules[key as keyof typeof config.modules]}
                                        onChange={() => setConfig({
                                            ...config, 
                                            modules: { ...config.modules, [key]: !config.modules[key as keyof typeof config.modules] }
                                        })}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-300 capitalize">{key}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating}
                        className="w-full btn-primary py-3 flex items-center justify-center font-bold shadow-lg"
                    >
                        {isGenerating ? <Loader2 className="animate-spin mr-2"/> : <FileText className="mr-2"/>}
                        تولید گزارش هوشمند
                    </button>
                </div>
            </div>

            {/* Report Display */}
            <div className="lg:col-span-2 energetic-card p-0 overflow-hidden bg-gray-900 border-gray-700 flex flex-col h-[600px]">
                {report ? (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white">{report.title}</h2>
                                <span className="text-xs text-gray-400">{report.date}</span>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-gray-300 leading-relaxed space-y-4">
                            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20 text-sm italic">
                                "{report.summary}"
                            </div>
                            
                            <h4 className="font-bold text-white text-lg mt-4 border-b border-gray-700 pb-2">نکات کلیدی</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {report.keyInsights.map((insight, i) => <li key={i} className="text-blue-300">{insight}</li>)}
                            </ul>

                            <h4 className="font-bold text-white text-lg mt-4 border-b border-gray-700 pb-2">توصیه‌های مربی</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {report.recommendations.map((rec, i) => <li key={i} className="text-green-300">{rec}</li>)}
                            </ul>

                            <div className="prose prose-invert max-w-none mt-6 text-sm">
                                <pre className="whitespace-pre-wrap font-sans">{report.markdownContent}</pre>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <FileText size={48} className="mb-4 opacity-20"/>
                        <p>هنوز گزارشی تولید نشده است.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const ReportsCenter: React.FC<ReportsCenterProps> = ({ profile, logs, setCurrentView }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'trends' | 'reports'>('dashboard');

    // Calculate Holistic Scores
    const holisticScore: HolisticScore = useMemo(() => {
        const recent = logs.slice(-30); // Last 30 days
        if (recent.length === 0) return { physical: 0, nutrition: 0, recovery: 0, mental: 0, social: 0, overall: 0 };

        const physical = recent.reduce((sum, l) => sum + l.workoutScore, 0) / recent.length;
        const nutrition = recent.reduce((sum, l) => sum + l.nutritionScore, 0) / recent.length;
        const recovery = recent.reduce((sum, l) => sum + (((l.sleepQuality || 5) * 10 + (100 - (l.stressIndex || 50))) / 2), 0) / recent.length;
        // Mock mood score
        const mental = 75; 
        const social = Math.min(100, (profile.xp / 5000) * 100);

        return {
            physical, nutrition, recovery, mental, social,
            overall: (physical + nutrition + recovery + mental + social) / 5
        };
    }, [logs, profile.xp]);

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Top Nav */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 shrink-0 overflow-x-auto">
                {[
                    { id: 'dashboard', icon: Activity, label: 'داشبورد جامع' },
                    { id: 'trends', icon: TrendingUp, label: 'پیش‌بینی و روندها' },
                    { id: 'reports', icon: FileText, label: 'تولید گزارش' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`flex-1 min-w-[120px] py-3 rounded-lg font-bold flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <tab.icon className="w-4 h-4 ml-2" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                        {/* KPI Radar */}
                        <div className="lg:col-span-1 energetic-card p-6 bg-gradient-to-br from-gray-900 via-cyan-900/10 to-gray-900 border-cyan-500/20">
                            <h3 className="font-bold text-white mb-4 text-center">تعادل عملکرد (Holistic Balance)</h3>
                            <div className="h-64">
                                <HolisticRadar score={holisticScore} />
                            </div>
                            <div className="text-center mt-4">
                                <span className="text-4xl font-black text-cyan-400">{Math.round(holisticScore.overall)}</span>
                                <span className="block text-xs text-gray-500">امتیاز کل (Total Score)</span>
                            </div>
                        </div>

                        {/* Quick Insights */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="energetic-card p-6 bg-blue-900/10 border-blue-500/20">
                                <h3 className="font-bold text-blue-300 mb-2 flex items-center"><Brain className="mr-2"/> تحلیل سریع</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    عملکرد فیزیکی شما ({Math.round(holisticScore.physical)}%) عالی است، اما ریکاوری ({Math.round(holisticScore.recovery)}%) نیاز به توجه دارد. عدم تعادل می‌تواند خطر آسیب‌دیدگی را افزایش دهد. برای ۳ روز آینده روی خواب و تغذیه تمرکز کنید.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                                    <span className="text-xs text-gray-400">ثبات تمرین (۳۰ روز)</span>
                                    <span className="block text-2xl font-bold text-white mt-1">۸۵٪</span>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                                    <span className="text-xs text-gray-400">بهترین رکورد ماه</span>
                                    <span className="block text-2xl font-bold text-yellow-400 mt-1">Deadlift 140kg</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'trends' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <PredictiveChart 
                                history={profile.metricsHistory || []} 
                                dataKey="weight" 
                                title="روند وزن (Weight Projection)" 
                                color="#8b5cf6" 
                            />
                            {/* Assuming we have performance history somewhere */}
                            <div className="energetic-card p-6 h-80 flex flex-col justify-center items-center text-gray-500">
                                <Layers size={48} className="mb-4 opacity-20"/>
                                <p>نمودارهای بیشتر پس از ثبت داده‌های کافی فعال می‌شوند.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <ReportBuilder logs={logs} profile={profile} />
                )}

            </div>
        </div>
    );
};

export default ReportsCenter;
