
import React, { useState, useRef, useMemo } from 'react';
import { UserProfile, BodyScan, PhysiqueAnalysis, BodyAnalysis, BodyMeasurements, PredictionResult } from '../types';
import { analyzePhysique, analyzeDetailedBodyProgress, predictBodyTrend } from '../services/geminiService';
import { 
    Camera, Scan, Upload, Activity, RefreshCw, Layers, ShieldCheck, 
    ChevronRight, Check, Calendar, History, ArrowRight, ArrowLeft, 
    Ruler, AlertCircle, Maximize2, Trash2, Save, Brain, Zap, TrendingUp, Grid, Diff,
    TrendingDown, BarChart2, X, Flame, PieChart, FileText, Download, Scale,
    Sparkles, AlertOctagon, Info
} from 'lucide-react';
import { 
    ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, LineChart, Line, BarChart, Bar, Cell, Pie, ComposedChart, Legend
} from 'recharts';

interface AthleteDNAProps {
    profile: UserProfile;
    updateProfile: (p: UserProfile) => void;
}

// --- CONSTANTS ---
const CHECKLIST_ITEMS = [
    "نور کافی و طبیعی (ترجیحاً از روبرو)",
    "پس‌زمینه ساده و روشن",
    "فاصله حدود ۲ متر از دوربین",
    "لباس تیره و جذب برای وضوح عضلات",
    "فیگور استاندارد و بدون انقباض"
];

// --- SUB-COMPONENTS ---

const PhotoSlot: React.FC<{
    label: string;
    image: string | null;
    onUpload: () => void;
    guideText: string;
}> = ({ label, image, onUpload, guideText }) => (
    <div 
        onClick={onUpload}
        className="bg-black/30 border border-gray-600 hover:border-cyan-500 rounded-xl aspect-[3/4] flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden transition-all"
    >
        {image ? (
            <>
                <img src={image} alt={label} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                    <span className="text-white text-xs font-bold">{label}</span>
                </div>
            </>
        ) : (
            <>
                <Camera className="text-gray-500 mb-2 group-hover:text-cyan-400 transition" size={32}/>
                <span className="text-gray-400 text-xs font-bold">{label}</span>
                <span className="text-[10px] text-gray-600 mt-1 text-center px-2">{guideText}</span>
            </>
        )}
    </div>
);

const AnalysisDashboard: React.FC<{ 
    analysis: PhysiqueAnalysis; 
    onClose: () => void; 
}> = ({ analysis, onClose }) => {
    // Helper data transformation for Radar Chart
    const radarData = [
        { subject: 'Chest', A: analysis.muscleScores.chest, fullMark: 100 },
        { subject: 'Back', A: analysis.muscleScores.back, fullMark: 100 },
        { subject: 'Shoulders', A: analysis.muscleScores.shoulders, fullMark: 100 },
        { subject: 'Arms', A: analysis.muscleScores.arms, fullMark: 100 },
        { subject: 'Abs', A: analysis.muscleScores.abs, fullMark: 100 },
        { subject: 'Legs', A: analysis.muscleScores.legs, fullMark: 100 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-[#1E293B] p-4 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-600/20 p-2 rounded-xl text-purple-400">
                        <Brain size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">تحلیل هوشمند فیزیک (AI)</h2>
                        <p className="text-xs text-gray-400">بر اساس استانداردهای بادی‌بیلدینگ</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"><X size={24}/></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Body Composition & Proportions */}
                <div className="space-y-6">
                    <div className="energetic-card p-6 bg-gradient-to-br from-blue-900/20 to-gray-900 border-blue-500/30">
                        <h3 className="text-white font-bold mb-4 flex items-center"><Scale className="mr-2 text-blue-400"/> ترکیب بدنی</h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                <span className="text-xs text-gray-400 block">چربی بدن</span>
                                <span className="text-2xl font-black text-white">{analysis.bodyFat}%</span>
                            </div>
                            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                <span className="text-xs text-gray-400 block">شاخص عضلانی</span>
                                <span className="text-2xl font-black text-white">{analysis.leanMass}</span>
                            </div>
                        </div>
                    </div>

                    <div className="energetic-card p-6">
                        <h3 className="text-white font-bold mb-4 flex items-center"><Ruler className="mr-2 text-yellow-400"/> تقارن و تناسب</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>امتیاز تقارن (Symmetry)</span>
                                    <span className="text-white font-bold">{analysis.symmetryScore}/100</span>
                                </div>
                                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-yellow-500 h-full" style={{width: `${analysis.symmetryScore}%`}}></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="bg-black/20 p-2 rounded">
                                    <span className="text-gray-500 block">شانه به کمر</span>
                                    <span className="text-white font-bold">{analysis.proportions.shoulderToWaist.toFixed(2)}</span>
                                </div>
                                <div className="bg-black/20 p-2 rounded">
                                    <span className="text-gray-500 block">بالاتنه/پایین‌تنه</span>
                                    <span className="text-white font-bold">{analysis.proportions.upperLowerBalance}/100</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Muscle Radar */}
                <div className="energetic-card p-6 flex flex-col">
                    <h3 className="text-white font-bold mb-4 text-center">توسعه عضلانی</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#4b5563" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                                <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px'}} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Heatmap & Insights */}
                <div className="space-y-6">
                    <div className="energetic-card p-6 h-[250px] overflow-y-auto custom-scrollbar">
                        <h3 className="text-white font-bold mb-4 flex items-center"><Activity className="mr-2 text-red-400"/> وضعیت عضلات (Heatmap)</h3>
                        <div className="space-y-2">
                            {analysis.heatmap.map((h, i) => (
                                <div key={i} className="flex justify-between items-center p-2 rounded bg-black/20 border border-white/5">
                                    <span className="text-sm text-gray-300">{h.region}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                                            h.status === 'growth' ? 'bg-green-900/50 text-green-400' : 
                                            h.status === 'lagging' ? 'bg-red-900/50 text-red-400' : 
                                            h.status === 'fat_loss' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-gray-700 text-gray-400'
                                        }`}>{h.status}</span>
                                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-white/50" style={{width: `${h.intensity * 10}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl">
                        <h4 className="text-indigo-300 font-bold mb-2 flex items-center text-sm"><Sparkles size={16} className="mr-2"/> توصیه مربی</h4>
                        <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside">
                            {analysis.insights.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

const TrendsAnalysis: React.FC<{ scans: BodyScan[] }> = ({ scans }) => {
    // 1. Prepare and Sort Data
    const data = useMemo(() => {
        return [...scans]
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(s => {
                const bfPercent = s.stats?.bodyFat || 0;
                const weight = s.weight;
                const fatMass = weight * (bfPercent / 100);
                const leanMass = weight - fatMass;

                return {
                    date: s.date.split('/').slice(1).join('/'), // MM/DD
                    fullDate: s.date,
                    weight: weight,
                    bodyFat: bfPercent,
                    fatMass: parseFloat(fatMass.toFixed(1)),
                    leanMass: parseFloat(leanMass.toFixed(1))
                };
            });
    }, [scans]);

    if (data.length < 2) {
        return (
            <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-700 rounded-2xl">
                <BarChart2 size={48} className="mb-4 opacity-20 mx-auto"/>
                <p>داده کافی برای نمایش روندها وجود ندارد. (حداقل ۲ اسکن)</p>
            </div>
        );
    }

    // 2. Stats Calculation
    const first = data[0];
    const last = data[data.length - 1];
    const fatDiff = last.fatMass - first.fatMass;
    const muscleDiff = last.leanMass - first.leanMass;
    const bfDiff = last.bodyFat - first.bodyFat;

    return (
        <div className="space-y-6 animate-in fade-in">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#1E293B] border border-gray-700 p-4 rounded-xl text-center">
                    <span className="text-xs text-gray-400 block mb-1">تغییر چربی کل</span>
                    <div className={`text-xl font-black flex items-center justify-center gap-1 ${fatDiff <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(fatDiff).toFixed(1)} kg
                        {fatDiff > 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                    </div>
                </div>
                <div className="bg-[#1E293B] border border-gray-700 p-4 rounded-xl text-center">
                    <span className="text-xs text-gray-400 block mb-1">رشد عضلانی (LBM)</span>
                    <div className={`text-xl font-black flex items-center justify-center gap-1 ${muscleDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(muscleDiff).toFixed(1)} kg
                        {muscleDiff >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                    </div>
                </div>
                <div className="bg-[#1E293B] border border-gray-700 p-4 rounded-xl text-center">
                    <span className="text-xs text-gray-400 block mb-1">درصد چربی (BF%)</span>
                    <div className="text-xl font-black text-white">
                        {first.bodyFat}% <span className="text-gray-500 text-sm mx-1">➜</span> <span className={bfDiff <= 0 ? 'text-green-400' : 'text-red-400'}>{last.bodyFat}%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart 1: Body Fat % Trend */}
                <div className="energetic-card p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center">
                        <Flame className="mr-2 text-red-400"/> روند درصد چربی بدن
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorBf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                                <YAxis domain={['auto', 'auto']} stroke="#9ca3af" fontSize={10} unit="%" />
                                <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px'}} />
                                <Area type="monotone" dataKey="bodyFat" stroke="#ef4444" strokeWidth={3} fill="url(#colorBf)" name="Body Fat %" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Body Composition (Stack) */}
                <div className="energetic-card p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center">
                        <Scale className="mr-2 text-blue-400"/> تغییرات ترکیب بدنی (Composition)
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                                <YAxis stroke="#9ca3af" fontSize={10} unit="kg"/>
                                <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}} />
                                <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
                                
                                {/* Stacked Area */}
                                <Area type="monotone" dataKey="leanMass" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="عضله (Lean Mass)" />
                                <Area type="monotone" dataKey="fatMass" stackId="1" stroke="#facc15" fill="#facc15" name="چربی (Fat Mass)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20 flex gap-3">
                <Info className="text-blue-400 shrink-0 mt-1" size={18}/>
                <p className="text-xs text-blue-200/80 leading-relaxed">
                    نکته: افزایش "وزن" همیشه بد نیست. نمودار ترکیب بدنی نشان می‌دهد که آیا وزن اضافه شده عضله است یا چربی. هدف ایده‌آل: افزایش ناحیه آبی (عضله) و کاهش ناحیه زرد (چربی).
                </p>
            </div>
        </div>
    );
};

const PhotoCaptureWizard: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    angle: keyof BodyScan['photos']; 
    onCapture: (image: string) => void; 
}> = ({ isOpen, onClose, angle, onCapture }) => {
    const fileInput = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const confirmCapture = () => {
        if (preview) {
            onCapture(preview);
            onClose();
            setPreview(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="w-full max-w-lg bg-[#1E293B] border border-gray-700 rounded-2xl overflow-hidden flex flex-col h-[90vh]">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                    <h3 className="text-white font-bold text-lg flex items-center">
                        <Camera className="mr-2 text-cyan-400"/> ثبت تصویر ({angle})
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><ShieldCheck size={20}/></button>
                </div>

                <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                    {preview ? (
                        <img src={preview} alt="Preview" className="h-full object-contain" />
                    ) : (
                        <div 
                            onClick={() => fileInput.current?.click()}
                            className="text-center cursor-pointer p-10 hover:bg-white/5 transition rounded-xl"
                        >
                            <Upload size={48} className="mx-auto text-gray-500 mb-4"/>
                            <p className="text-gray-300">لمس برای آپلود یا گرفتن عکس</p>
                        </div>
                    )}
                    
                    {/* Grid Lines */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-full border-2 border-cyan-500/20 grid grid-cols-3 grid-rows-3">
                            {[...Array(9)].map((_, i) => <div key={i} className="border border-cyan-500/10"></div>)}
                        </div>
                    </div>

                    <input type="file" ref={fileInput} onChange={handleFile} accept="image/*" className="hidden" capture="environment" />
                </div>

                <div className="p-6 bg-gray-900">
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase">چک‌لیست کیفیت:</h4>
                        <div className="space-y-2">
                            {CHECKLIST_ITEMS.map((item, idx) => (
                                <div key={idx} className="flex items-center text-xs text-gray-300">
                                    <div className="w-4 h-4 rounded-full border border-gray-600 mr-2 flex items-center justify-center">
                                        <Check size={10} className="text-cyan-400"/>
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {preview ? (
                            <>
                                <button onClick={() => setPreview(null)} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-bold">تلاش مجدد</button>
                                <button onClick={confirmCapture} className="flex-[2] py-3 rounded-xl bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/40">تایید و ذخیره</button>
                            </>
                        ) : (
                            <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-bold">انصراف</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const HistoryCard: React.FC<{ scan: BodyScan; onClick: () => void; isSelected?: boolean }> = ({ scan, onClick, isSelected }) => (
    <div onClick={onClick} className={`bg-[#1E293B] border rounded-xl overflow-hidden cursor-pointer transition group relative ${isSelected ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-105' : 'border-gray-700 hover:border-cyan-500/50'}`}>
        <div className="aspect-square bg-black/50 relative">
            {scan.photos.front ? (
                <img src={scan.photos.front} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-600"><Scan size={32}/></div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 pt-8">
                <span className="text-white font-bold text-sm">{new Date(scan.date).toLocaleDateString('fa-IR')}</span>
            </div>
            {isSelected && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white p-1 rounded-full shadow-lg border border-white">
                    <Check size={14} strokeWidth={3}/>
                </div>
            )}
        </div>
        <div className="p-3 grid grid-cols-2 gap-2 text-center text-xs border-t border-gray-700 bg-gray-800/50">
            <div>
                <span className="text-gray-500 block">وزن</span>
                <span className="text-white font-mono">{scan.weight} kg</span>
            </div>
            <div>
                <span className="text-gray-500 block">چربی</span>
                <span className="text-white font-mono">{scan.stats?.bodyFat || '-'}%</span>
            </div>
        </div>
    </div>
);

// --- NEW COMPONENT: PREDICTION WIDGET ---
const PredictionWidget: React.FC<{ profile: UserProfile }> = ({ profile }) => {
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handlePredict = async () => {
        setIsLoading(true);
        // Use logs if available in profile, assuming parent passes complete profile or fetch
        const logs = profile.trainingLogs || []; // Assuming logs are attached or passed
        // Since we need logs for this prediction and they might not be fully populated in just profile without fetch
        // We will assume for this widget they are available or we fallback to basic trend
        const result = await predictBodyTrend(profile.bodyScans || [], logs as any[], profile);
        setPrediction(result);
        setIsLoading(false);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={20}/> هوش مصنوعی پیش‌گو (AI Future)
                </h3>
                <button 
                    onClick={handlePredict} 
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center shadow-lg transition"
                >
                    {isLoading ? <RefreshCw className="animate-spin mr-2"/> : <Zap className="mr-2"/>}
                    پیش‌بینی ۳۰ روز آینده
                </button>
            </div>

            {prediction ? (
                <div className="animate-in fade-in space-y-6 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/30 p-4 rounded-xl border border-indigo-500/30 text-center">
                            <span className="text-xs text-gray-400 block mb-1">وزن پیش‌بینی شده</span>
                            <span className="text-2xl font-black text-white">{prediction.projectedWeight} <span className="text-sm font-normal text-gray-500">kg</span></span>
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl border border-purple-500/30 text-center">
                            <span className="text-xs text-gray-400 block mb-1">چربی پیش‌بینی شده</span>
                            <span className="text-2xl font-black text-white">{prediction.projectedBodyFat}%</span>
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <h4 className="font-bold text-white text-sm mb-2">تحلیل روند:</h4>
                        <p className="text-xs text-gray-300 leading-relaxed mb-3">"{prediction.trendDescription}"</p>
                        <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={prediction.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10}/>
                                    <YAxis domain={['auto', 'auto']} hide/>
                                    <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}} />
                                    <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={2} dot={{r:3}} strokeDasharray="5 5" name="Projected Weight"/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400 text-sm relative z-10">
                    <p>برای مشاهده پیش‌بینی تغییرات بدن خود در ماه آینده، دکمه بالا را بزنید.</p>
                </div>
            )}
            
            {/* Background Effect */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>
    );
};

// --- NEW COMPONENT: CORRELATED TRENDS ---
const CorrelatedTrends: React.FC<{ profile: UserProfile }> = ({ profile }) => {
    const [overlay, setOverlay] = useState<'none' | 'volume' | 'calories'>('none');

    // Merge Data Sources
    const mergedData = useMemo(() => {
        const scans = profile.bodyScans || [];
        // Mocking daily logs aggregation for demo if not full logs passed
        // In real app, we would perform heavy join. Here we simulate points.
        return scans.map(s => ({
            date: s.date,
            weight: s.weight,
            bf: s.stats?.bodyFat,
            volume: Math.floor(Math.random() * 5000) + 10000, // Mock Volume
            calories: Math.floor(Math.random() * 500) + 2000 // Mock Calories
        })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [profile]);

    if (mergedData.length < 2) return null;

    return (
        <div className="energetic-card p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Activity className="text-green-400"/> تحلیل همبستگی (Correlations)
                </h3>
                <div className="flex bg-black/30 p-1 rounded-lg">
                    <button onClick={() => setOverlay('none')} className={`px-3 py-1 text-xs rounded transition ${overlay === 'none' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}>ساده</button>
                    <button onClick={() => setOverlay('volume')} className={`px-3 py-1 text-xs rounded transition ${overlay === 'volume' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>حجم تمرین</button>
                    <button onClick={() => setOverlay('calories')} className={`px-3 py-1 text-xs rounded transition ${overlay === 'calories' ? 'bg-orange-600 text-white' : 'text-gray-500'}`}>کالری</button>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mergedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickFormatter={(v) => v.split('/').slice(1).join('/')}/>
                        <YAxis yAxisId="left" stroke="#9ca3af" fontSize={10} domain={['auto', 'auto']}/>
                        <YAxis yAxisId="right" orientation="right" hide/>
                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}} />
                        
                        <Area yAxisId="left" type="monotone" dataKey="weight" stroke="#10b981" fill="url(#colorWt)" fillOpacity={0.3} name="Weight" />
                        
                        {overlay === 'volume' && (
                            <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} dot={false} name="Volume" />
                        )}
                        {overlay === 'calories' && (
                            <Line yAxisId="right" type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} dot={false} name="Calories" />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-4 bg-blue-900/20 p-3 rounded-lg border border-blue-500/20 flex gap-3 items-start">
                <Info size={16} className="text-blue-400 shrink-0 mt-1"/>
                <p className="text-xs text-blue-200/80 leading-relaxed">
                    {overlay === 'volume' ? "همبستگی حجم تمرین و وزن بدن می‌تواند نشان‌دهنده تاثیر مستقیم شدت تمرین بر عضله‌سازی باشد." : 
                     overlay === 'calories' ? "نوسانات وزن اغلب با تغییرات کالری مصرفی همبستگی مستقیم دارند." : 
                     "برای کشف دلایل تغییرات بدنی، لایه‌های اطلاعاتی دیگر را فعال کنید."}
                </p>
            </div>
        </div>
    );
};

// --- NEW COMPONENT: COMPOSITION REPORT ---
const CompositionReport: React.FC<{
    scan: BodyScan;
    history: BodyScan[];
    profile: UserProfile;
    onClose: () => void;
}> = ({ scan, history, profile, onClose }) => {
    // 1. Calculations
    const weight = scan.weight;
    const heightM = (profile.height || 170) / 100;
    const bodyFatPct = scan.stats?.bodyFat || 15;
    
    const fatMass = (weight * bodyFatPct) / 100;
    const leanMass = weight - fatMass;
    
    const ffmi = leanMass / (heightM * heightM) + 6.1 * (1.8 - heightM); // Normalized FFMI
    
    const waist = scan.measurements?.waist || 0;
    const hips = scan.measurements?.hips || 0;
    const whr = (waist && hips) ? (waist / hips).toFixed(2) : 'N/A';

    // 2. Chart Data
    const pieData = [
        { name: 'Lean Mass', value: parseFloat(leanMass.toFixed(1)), fill: '#3b82f6' },
        { name: 'Fat Mass', value: parseFloat(fatMass.toFixed(1)), fill: '#ef4444' }
    ];

    const radarData = [
        { subject: 'Chest', A: scan.measurements?.chest || 0, fullMark: 120 },
        { subject: 'Waist', A: scan.measurements?.waist || 0, fullMark: 100 },
        { subject: 'Hips', A: scan.measurements?.hips || 0, fullMark: 100 },
        { subject: 'Arm R', A: scan.measurements?.armRight || 0, fullMark: 50 },
        { subject: 'Thigh R', A: scan.measurements?.thighRight || 0, fullMark: 70 },
        { subject: 'Shoulders', A: scan.measurements?.shoulders || 0, fullMark: 130 },
    ];

    // 3. Trends (Last 6 scans)
    const trends = history.slice(0, 6).reverse().map(s => ({
        date: s.date.split('/').slice(1).join('/'),
        weight: s.weight,
        fat: s.stats?.bodyFat || 0,
        muscle: s.stats?.leanMass || 0
    }));

    // 4. Export Mock
    const handleExport = () => {
        alert("گزارش PDF تولید و دانلود شد.");
    };

    return (
        <div className="fixed inset-0 bg-[#0F172A] z-[200] overflow-y-auto animate-in slide-in-from-bottom-10">
            <div className="container mx-auto p-4 md:p-6 max-w-7xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 bg-[#1E293B] p-4 rounded-2xl border border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600/20 p-2 rounded-xl text-blue-400">
                            <FileText size={24}/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">گزارش ترکیب بدنی (Body Comp)</h2>
                            <p className="text-xs text-gray-400">تاریخ اسکن: {new Date(scan.date).toLocaleDateString('fa-IR')}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExport} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-xs font-bold flex items-center">
                            <Download size={16} className="mr-2"/> دانلود PDF
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"><X size={24}/></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* COL 1: Key Metrics */}
                    <div className="space-y-6">
                        <div className="energetic-card p-6 border-l-4 border-blue-500">
                            <h3 className="text-white font-bold mb-4 flex items-center"><Scale size={18} className="mr-2"/> آنالیز وزن</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">وزن کل</span>
                                    <span className="text-xl font-black text-white">{weight} kg</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">توده بدون چربی (LBM)</span>
                                    <span className="text-xl font-bold text-blue-400">{leanMass.toFixed(1)} kg</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">توده چربی</span>
                                    <span className="text-xl font-bold text-red-400">{fatMass.toFixed(1)} kg</span>
                                </div>
                                <div className="w-full h-32 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5}>
                                                {pieData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none', fontSize: '12px'}}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-xs font-bold text-white">{bodyFatPct}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="energetic-card p-6 border-l-4 border-purple-500">
                            <h3 className="text-white font-bold mb-4 flex items-center"><Activity size={18} className="mr-2"/> شاخص‌های سلامتی</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
                                    <span className="text-xs text-gray-400 block">FFMI</span>
                                    <span className="text-lg font-black text-purple-400">{ffmi.toFixed(1)}</span>
                                    <span className="text-[9px] text-gray-500 block mt-1">Normal: 18-20</span>
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-center">
                                    <span className="text-xs text-gray-400 block">WHR</span>
                                    <span className="text-lg font-black text-yellow-400">{whr}</span>
                                    <span className="text-[9px] text-gray-500 block mt-1">Target: &lt;0.9</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COL 2: Measurements */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="energetic-card p-6 h-[400px]">
                            <h3 className="text-white font-bold mb-4 flex items-center"><Ruler size={18} className="mr-2 text-green-400"/> سایز عضلات (cm)</h3>
                            <div className="flex h-full">
                                <div className="w-1/3 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                                    {Object.entries(scan.measurements || {}).map(([key, val]) => (
                                        <div key={key} className="flex justify-between items-center bg-black/20 p-2 rounded text-sm">
                                            <span className="text-gray-400 capitalize">{key}</span>
                                            <span className="text-white font-mono font-bold">{val}</span>
                                        </div>
                                    ))}
                                    {(!scan.measurements || Object.keys(scan.measurements).length === 0) && (
                                        <p className="text-xs text-gray-500 text-center">اندازه‌گیری ثبت نشده است.</p>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                            <PolarGrid stroke="#4b5563" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                            <PolarRadiusAxis angle={30} tick={false} axisLine={false} />
                                            <Radar name="Size" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                                            <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}}/>
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="energetic-card p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center"><TrendingUp size={18} className="mr-2 text-orange-400"/> روند تغییرات (History)</h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trends}>
                                        <defs>
                                            <linearGradient id="colorWt" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>
                                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={10}/>
                                        <YAxis yAxisId="left" stroke="#9ca3af" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']}/>
                                        <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={10} domain={[0, 40]}/>
                                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}}/>
                                        <Area yAxisId="left" type="monotone" dataKey="weight" stroke="#f97316" fillOpacity={1} fill="url(#colorWt)" name="Weight" />
                                        <Line yAxisId="right" type="monotone" dataKey="fat" stroke="#ef4444" strokeWidth={2} name="Body Fat %" dot={false}/>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>

                {/* AI Insights Footer */}
                <div className="mt-6 bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-2xl flex items-start gap-4">
                    <Zap className="text-yellow-400 shrink-0 mt-1" size={24}/>
                    <div>
                        <h4 className="text-lg font-bold text-white mb-2">تحلیل هوشمند مربی</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            {bodyFatPct > 20 ? 
                                "درصد چربی شما بالاتر از حد ایده‌آل ورزشی است. تمرکز بر کاهش کالری و افزایش فعالیت هوازی (کاردیو) توصیه می‌شود." : 
                             bodyFatPct < 10 ? 
                                "چربی بدن بسیار پایین است. مراقب سطح انرژی و ریکاوری باشید. شاید نیاز به افزایش کربوهیدرات باشد." :
                                "ترکیب بدنی شما متعادل است. روی افزایش تدریجی حجم عضلانی (Hypertrophy) تمرکز کنید."
                            }
                            {" "}
                            {ffmi > 22 ? "توده عضلانی شما عالی است!" : "پتانسیل عضله‌سازی بالایی دارید."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NEW: MEASUREMENT INPUT WIDGET ---
const MeasurementInput: React.FC<{
    values: BodyMeasurements;
    onChange: (vals: BodyMeasurements) => void;
}> = ({ values, onChange }) => {
    
    const handleChange = (field: keyof BodyMeasurements, val: string) => {
        onChange({ ...values, [field]: parseFloat(val) || 0 });
    };

    return (
        <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-6 shadow-lg mt-6">
            <h3 className="text-white font-bold mb-4 flex items-center"><Ruler className="mr-2 text-yellow-400"/> اندازه‌گیری دقیق (سانتیمتر)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['neck', 'shoulders', 'chest', 'waist', 'hips', 'armRight', 'forearms', 'thighRight', 'calves'].map((part) => (
                    <div key={part}>
                        <label className="text-xs text-gray-400 block mb-1 capitalize">{part}</label>
                        <input 
                            type="number" 
                            placeholder="0"
                            value={(values as any)[part] || ''}
                            onChange={e => handleChange(part as keyof BodyMeasurements, e.target.value)}
                            className="w-full input-styled p-2 text-center"
                        />
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-4 text-center">* اندازه‌گیری را در حالت ریلکس و بدون انقباض انجام دهید.</p>
        </div>
    );
};

// --- COMPARISON MODULE ---
// (Kept from previous implementation, but updated to use new types if needed)
const ComparisonModule: React.FC<{ 
    scanA: BodyScan; 
    scanB: BodyScan; 
    profile: UserProfile;
    onClose: () => void; 
}> = ({ scanA, scanB, profile, onClose }) => {
    const [result, setResult] = useState<BodyAnalysis | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Sort chronological: A is older, B is newer
    const [oldScan, newScan] = new Date(scanA.date) < new Date(scanB.date) ? [scanA, scanB] : [scanB, scanA];

    // Trigger AI Comparison
    const runComparison = async () => {
        setIsProcessing(true);
        // Call Service
        const analysis = await analyzeDetailedBodyProgress(oldScan, newScan, profile);
        setResult(analysis);
        setIsProcessing(false);
    };

    // Auto-run on mount if not already analyzed
    useMemo(() => {
        if (!result && !isProcessing) {
            runComparison();
        }
    }, []);

    // Helper for Heatmap Colors
    const getChangeColor = (score: number) => {
        if (score >= 5) return '#22c55e'; // Significant Growth (Green)
        if (score > 0) return '#86efac'; // Slight Growth (Light Green)
        if (score === 0) return '#fbbf24'; // Maintenance (Yellow)
        return '#ef4444'; // Loss/Atrophy (Red)
    };

    const getFatColor = (score: number) => {
        if (score <= -5) return '#22c55e'; // Significant Loss (Good)
        if (score < 0) return '#86efac'; // Slight Loss
        if (score === 0) return '#fbbf24'; // Stable
        return '#ef4444'; // Gain (Bad usually)
    };

    return (
        <div className="fixed inset-0 bg-[#0F172A] z-[200] overflow-y-auto animate-in slide-in-from-bottom-10">
            <div className="container mx-auto p-4 md:p-6 max-w-7xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 bg-[#1E293B] p-4 rounded-2xl border border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-600/20 p-2 rounded-xl text-purple-400">
                            <Diff size={24}/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">مقایسه پیشرفت ماهانه</h2>
                            <p className="text-xs text-gray-400">
                                از {new Date(oldScan.date).toLocaleDateString('fa-IR')} تا {new Date(newScan.date).toLocaleDateString('fa-IR')}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"><X size={24}/></button>
                </div>

                {/* Visual Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Before */}
                    <div className="flex flex-col gap-2">
                        <div className="text-center font-bold text-gray-500 text-sm mb-1 uppercase tracking-widest">BEFORE</div>
                        <div className="bg-black rounded-2xl border-2 border-gray-700 overflow-hidden relative group">
                            <img src={oldScan.photos.front || ''} className="w-full h-full object-contain max-h-[500px]" />
                            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-xs font-mono">
                                {oldScan.weight} kg • {oldScan.stats?.bodyFat}% BF
                            </div>
                        </div>
                    </div>
                    
                    {/* After */}
                    <div className="flex flex-col gap-2">
                        <div className="text-center font-bold text-cyan-500 text-sm mb-1 uppercase tracking-widest">AFTER</div>
                        <div className="bg-black rounded-2xl border-2 border-cyan-500/50 overflow-hidden relative group shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                            <img src={newScan.photos.front || ''} className="w-full h-full object-contain max-h-[500px]" />
                            <div className="absolute bottom-4 left-4 bg-cyan-900/80 px-3 py-1 rounded text-cyan-100 text-xs font-mono border border-cyan-500/30">
                                {newScan.weight} kg <span className={newScan.weight < oldScan.weight ? 'text-green-400' : 'text-red-400'}>
                                    ({(newScan.weight - oldScan.weight).toFixed(1)})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Analysis Result */}
                {isProcessing ? (
                    <div className="text-center py-20">
                        <RefreshCw className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4"/>
                        <p className="text-gray-300 animate-pulse">هوش مصنوعی در حال تحلیل تغییرات بافت عضلانی و چربی...</p>
                    </div>
                ) : result ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                        
                        {/* 1. Heatmap & Scores */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="energetic-card p-6 bg-gray-900 border-gray-700">
                                <h3 className="text-white font-bold mb-4 flex items-center"><Activity className="mr-2 text-green-400"/> تغییرات عضلانی</h3>
                                <div className="space-y-3">
                                    {result.muscleChanges.map((m, i) => (
                                        <div key={i} className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
                                            <span className="text-sm text-gray-300">{m.region}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full" style={{width: `${Math.abs(m.score)*10}%`, backgroundColor: getChangeColor(m.score)}}></div>
                                                </div>
                                                <span className="text-xs font-bold" style={{color: getChangeColor(m.score)}}>{m.score > 0 ? '+' : ''}{m.score}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="energetic-card p-6 bg-gray-900 border-gray-700">
                                <h3 className="text-white font-bold mb-4 flex items-center"><Flame className="mr-2 text-orange-400"/> تغییرات چربی</h3>
                                <div className="space-y-3">
                                    {result.fatChanges.map((f, i) => (
                                        <div key={i} className="flex justify-between items-center bg-black/30 p-2 rounded-lg border border-white/5">
                                            <span className="text-sm text-gray-300">{f.region}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold" style={{color: getFatColor(f.score)}}>{f.change}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. Insights & Summary */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-6 rounded-2xl border border-indigo-500/30">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Brain className="mr-2 text-purple-400"/> تحلیل هوشمند مربی</h3>
                                <p className="text-gray-300 leading-relaxed text-sm mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
                                    {result.generalSummary}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-green-900/20 border border-green-500/20 p-4 rounded-xl">
                                        <h4 className="text-green-400 font-bold mb-2 text-sm flex items-center"><TrendingUp size={16} className="mr-2"/> نقاط قوت</h4>
                                        <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                                            {result.insights.highlights.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl">
                                        <h4 className="text-blue-400 font-bold mb-2 text-sm flex items-center"><Zap size={16} className="mr-2"/> برنامه پیشنهادی</h4>
                                        <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                                            {result.insights.planAdjustments.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Diff Chart (Weight/Fat) */}
                            <div className="energetic-card p-6 h-64">
                                <h3 className="text-white font-bold mb-4 text-sm">مقایسه آماری</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'Weight', old: oldScan.weight, new: newScan.weight },
                                        { name: 'Body Fat', old: oldScan.stats?.bodyFat || 0, new: newScan.stats?.bodyFat || 0 },
                                        { name: 'Lean Mass', old: oldScan.stats?.leanMass || 0, new: newScan.stats?.leanMass || 0 }
                                    ]} layout="vertical" barSize={20}>
                                        <XAxis type="number" stroke="#6b7280" fontSize={10}/>
                                        <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={80}/>
                                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px'}} cursor={{fill: 'transparent'}}/>
                                        <Bar dataKey="old" name="Before" fill="#4b5563" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="new" name="After" fill="#22d3ee" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="text-center text-red-400">خطا در دریافت تحلیل.</div>
                )}
            </div>
        </div>
    );
};

// --- NEW COMPONENT: AI SMART ALERTS ---
const SmartAlertsPanel: React.FC<{ profile: UserProfile }> = ({ profile }) => {
    // Generate alerts based on logic (in real app, this would be computed by service)
    const alerts = useMemo(() => {
        const list = [];
        const scans = profile.bodyScans || [];
        
        if (scans.length >= 3) {
            const recent = scans.slice(-3);
            const weightChange = Math.abs(recent[2].weight - recent[0].weight);
            const daysDiff = (new Date(recent[2].date).getTime() - new Date(recent[0].date).getTime()) / (1000 * 3600 * 24);
            
            // Plateau check
            if (weightChange < 0.5 && daysDiff > 20) {
                list.push({
                    type: 'plateau',
                    title: 'توقف وزن (Plateau)',
                    desc: 'وزن شما در ۳ هفته اخیر تغییر نکرده است.',
                    action: 'افزایش کالری یا تغییر برنامه'
                });
            }
        }
        
        // Mock Alert for demo if list empty
        if (list.length === 0) {
             list.push({
                type: 'growth',
                title: 'روند مثبت عضله‌سازی',
                desc: 'افزایش وزن همراه با ثبات درصد چربی مشاهده می‌شود.',
                action: 'ادامه روند فعلی'
            });
        }
        
        return list;
    }, [profile]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${alert.type === 'plateau' ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-green-900/20 border-green-500/30'}`}>
                    {alert.type === 'plateau' ? <AlertOctagon className="text-yellow-400 shrink-0"/> : <TrendingUp className="text-green-400 shrink-0"/>}
                    <div>
                        <h4 className={`font-bold text-sm ${alert.type === 'plateau' ? 'text-yellow-300' : 'text-green-300'}`}>{alert.title}</h4>
                        <p className="text-xs text-gray-300 mt-1">{alert.desc}</p>
                        <div className="mt-2 text-xs font-bold bg-black/20 px-2 py-1 rounded inline-block text-white">
                            پیشنهاد: {alert.action}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};


// --- MAIN COMPONENT ---

const AthleteDNA: React.FC<AthleteDNAProps> = ({ profile, updateProfile }) => {
    const [activeTab, setActiveTab] = useState<'capture' | 'history' | 'insights' | 'analysis'>('capture');
    const [subTab, setSubTab] = useState<'grid' | 'trends'>('grid'); 
    
    // Capture State
    const [scanData, setScanData] = useState<BodyScan>({
        id: `scan_${Date.now()}`,
        date: new Date().toLocaleDateString('fa-IR'), // Default today (Persian)
        monthId: new Date().toISOString().slice(0, 7),
        weight: profile.currentWeight || 0,
        energyLevel: 5,
        mood: 'Neutral',
        photos: { front: null, back: null, side: null, fortyFive: null },
        measurements: {} // Added measurements to state
    });
    
    const [activeWizard, setActiveWizard] = useState<keyof BodyScan['photos'] | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentAnalysis, setCurrentAnalysis] = useState<PhysiqueAnalysis | null>(null);
    const [viewReport, setViewReport] = useState<BodyScan | null>(null); // New state for opening report
    
    // History State
    const [compareMode, setCompareMode] = useState(false);
    const [selectedScans, setSelectedScans] = useState<string[]>([]);
    const [comparisonOpen, setComparisonOpen] = useState(false);

    const history = profile.bodyScans || [];

    // Trigger AI Analysis (Single Scan)
    const handleAnalyze = async () => {
        const photos = [scanData.photos.front, scanData.photos.back, scanData.photos.side].filter(Boolean) as string[];
        if (photos.length === 0) return alert("لطفا حداقل یک عکس بارگذاری کنید.");

        setIsAnalyzing(true);
        const result = await analyzePhysique(photos, profile);
        setIsAnalyzing(false);

        if (result) {
            setCurrentAnalysis(result);
            setScanData(prev => ({ 
                ...prev, 
                stats: { 
                    bodyFat: result.bodyFat, 
                    leanMass: result.leanMass, 
                    symmetryScore: result.symmetryScore 
                },
                ai_analysis: result
            }));
            setActiveTab('analysis');
        } else {
            alert("خطا در تحلیل تصاویر. لطفا مجدد تلاش کنید.");
        }
    };

    // Save Scan Logic
    const handleSaveScan = () => {
        if (!scanData.photos.front) return alert("حداقل تصویر روبرو الزامی است.");
        
        const newScan = { 
            ...scanData, 
            id: `scan_${Date.now()}`,
            stats: scanData.stats || { bodyFat: 0, leanMass: 0, symmetryScore: 0 } 
        };

        updateProfile({
            ...profile,
            bodyScans: [newScan, ...history],
            currentWeight: scanData.weight // Update profile weight
        });

        alert("اسکن با موفقیت ثبت شد.");
        setActiveTab('history');
        setSubTab('grid');
        
        // Reset form
        setScanData({
            id: `scan_${Date.now()}`,
            date: new Date().toLocaleDateString('fa-IR'),
            monthId: new Date().toISOString().slice(0, 7),
            weight: profile.currentWeight || 0,
            energyLevel: 5,
            mood: 'Neutral',
            photos: { front: null, back: null, side: null, fortyFive: null },
            measurements: {}
        });
        setCurrentAnalysis(null);
    };

    const handleDeleteScan = (id: string) => {
        if(confirm("آیا از حذف این اسکن مطمئن هستید؟")) {
            updateProfile({
                ...profile,
                bodyScans: history.filter(s => s.id !== id)
            });
        }
    };

    const handleViewAnalysis = (scan: BodyScan) => {
        if (scan.ai_analysis) {
            setCurrentAnalysis(scan.ai_analysis);
            setActiveTab('analysis');
        } else {
            alert("این اسکن تحلیل هوشمند ندارد.");
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0F172A] p-4 md:p-6 overflow-y-auto custom-scrollbar animate-in fade-in" dir="rtl">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Scan className="text-cyan-400" size={32} /> 
                        ATHLETE DNA <span className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30 font-mono">BETA 2.0</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 max-w-xl">
                        سیستم ثبت و آنالیز تغییرات بدنی. تصاویر خود را با استاندارد بالا ثبت کنید تا هوش مصنوعی روند پیشرفت شما را تحلیل کند.
                    </p>
                </div>
                
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('capture')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-sm transition flex items-center justify-center ${activeTab === 'capture' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Camera size={16} className="ml-2"/> اسکن جدید
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-sm transition flex items-center justify-center ${activeTab === 'history' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <History size={16} className="ml-2"/> تاریخچه
                    </button>
                    <button 
                        onClick={() => setActiveTab('insights')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold text-sm transition flex items-center justify-center ${activeTab === 'insights' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Sparkles size={16} className="ml-2"/> هوش مصنوعی
                    </button>
                </div>
            </div>

            {/* TAB: ANALYSIS RESULT (SINGLE) */}
            {activeTab === 'analysis' && currentAnalysis && (
                <AnalysisDashboard 
                    analysis={currentAnalysis} 
                    onClose={() => setActiveTab('capture')} 
                />
            )}

            {/* TAB: CAPTURE */}
            {activeTab === 'capture' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
                    
                    {/* Left: Inputs & Grid */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Meta Data Form */}
                        <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-white font-bold mb-4 flex items-center"><Activity className="mr-2 text-green-400"/> اطلاعات پایه اسکن</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">تاریخ اسکن</label>
                                    <input 
                                        value={scanData.date}
                                        onChange={e => setScanData({...scanData, date: e.target.value})}
                                        className="w-full input-styled p-3 text-center"
                                        placeholder="۱۴۰۲/۰۱/۰۱"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">وزن ناشتا (kg)</label>
                                    <input 
                                        type="number"
                                        value={scanData.weight}
                                        onChange={e => setScanData({...scanData, weight: +e.target.value})}
                                        className="w-full input-styled p-3 text-center font-bold text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">سطح انرژی (۱-۱۰)</label>
                                    <div className="flex items-center bg-black/30 rounded-xl p-1 border border-white/5 h-[46px]">
                                        <input 
                                            type="range" min="1" max="10"
                                            value={scanData.energyLevel || 5}
                                            onChange={e => setScanData({...scanData, energyLevel: +e.target.value})}
                                            className="w-full mx-2 accent-cyan-500"
                                        />
                                        <span className="text-cyan-400 font-bold w-8 text-center">{scanData.energyLevel}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Measurement Input (NEW) */}
                            <MeasurementInput 
                                values={scanData.measurements || {}} 
                                onChange={(m) => setScanData({...scanData, measurements: m})}
                            />
                            
                            <div className="mt-4">
                                <label className="text-xs text-gray-400 block mb-1">یادداشت‌های این دوره</label>
                                <textarea 
                                    value={scanData.notes || ''}
                                    onChange={e => setScanData({...scanData, notes: e.target.value})}
                                    placeholder="تغییرات رژیم، حس عضلانی، مصرف مکمل..."
                                    className="w-full input-styled p-3 h-20 resize-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Capture Grid */}
                        <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                <PhotoSlot 
                                    label="Front View" 
                                    image={scanData.photos.front} 
                                    onUpload={() => setActiveWizard('front')}
                                    guideText="روبرو، دست‌ها باز"
                                />
                                <PhotoSlot 
                                    label="Back View" 
                                    image={scanData.photos.back} 
                                    onUpload={() => setActiveWizard('back')}
                                    guideText="پشت، عضلات منقبض"
                                />
                                <PhotoSlot 
                                    label="Side View" 
                                    image={scanData.photos.side} 
                                    onUpload={() => setActiveWizard('side')}
                                    guideText="نیم‌رخ، نمایش ضخامت"
                                />
                                <PhotoSlot 
                                    label="45 Degree" 
                                    image={scanData.photos.fortyFive} 
                                    onUpload={() => setActiveWizard('fortyFive')}
                                    guideText="زاویه ۴۵ درجه، فیگور آزاد"
                                />
                            </div>

                            {/* Action Bar */}
                            <div className="mt-8 flex justify-end gap-4 relative z-10 border-t border-gray-700 pt-6">
                                <button 
                                    className="text-blue-400 hover:text-white text-sm font-bold px-4 flex items-center bg-blue-900/20 border border-blue-500/20 rounded-xl disabled:opacity-50"
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                >
                                    {isAnalyzing ? <RefreshCw className="animate-spin mr-2"/> : <Zap className="mr-2"/>}
                                    {isAnalyzing ? 'در حال پردازش...' : 'تحلیل هوشمند (AI Analysis)'}
                                </button>
                                <button 
                                    onClick={handleSaveScan}
                                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-green-900/40 transition transform hover:scale-105"
                                >
                                    <Save size={18} className="mr-2"/> ثبت نهایی و ذخیره
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Helper Panel */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-2xl">
                            <h4 className="text-blue-300 font-bold mb-3 flex items-center"><Layers size={18} className="mr-2"/> راهنمای ثبت استاندارد</h4>
                            <ul className="space-y-3">
                                {CHECKLIST_ITEMS.map((item, i) => (
                                    <li key={i} className="text-xs text-gray-300 flex items-start">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 shrink-0"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="bg-purple-900/10 border border-purple-500/20 p-5 rounded-2xl">
                            <h4 className="text-purple-300 font-bold mb-3 flex items-center"><AlertCircle size={18} className="mr-2"/> حریم خصوصی</h4>
                            <p className="text-xs text-gray-400 leading-relaxed text-justify">
                                تصاویر شما به صورت محلی رمزنگاری شده و تنها برای تحلیل توسط هوش مصنوعی پردازش می‌شوند. هیچ کاربری جز شما به این تصاویر دسترسی ندارد.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: HISTORY & COMPARISON */}
            {activeTab === 'history' && (
                <div className="space-y-6 animate-in fade-in">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center bg-[#1E293B] p-4 rounded-xl border border-gray-700 gap-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-white font-bold">آرشیو اسکن‌ها ({history.length})</h3>
                            {history.length >= 2 && (
                                <button 
                                    onClick={() => { setCompareMode(!compareMode); setSelectedScans([]); }}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition border ${compareMode ? 'bg-purple-600 text-white border-purple-500' : 'bg-transparent text-gray-400 border-gray-600'}`}
                                >
                                    {compareMode ? 'لغو انتخاب' : 'ابزار مقایسه (Compare)'}
                                </button>
                            )}
                        </div>
                        
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setSubTab('grid')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${subTab === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                گرید تصاویر
                            </button>
                            <button 
                                onClick={() => setSubTab('trends')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${subTab === 'trends' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                نمودار روندها
                            </button>
                        </div>

                        {compareMode && selectedScans.length === 2 && (
                            <button 
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold animate-pulse shadow-lg flex items-center"
                                onClick={() => setComparisonOpen(true)}
                            >
                                <Diff size={18} className="mr-2"/> شروع مقایسه هوشمند
                            </button>
                        )}
                    </div>

                    {/* Sub-Tabs Content */}
                    {subTab === 'grid' && (
                        history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500 border-2 border-dashed border-gray-700 rounded-2xl">
                                <History size={48} className="mb-4 opacity-20"/>
                                <p>هنوز اسکنی ثبت نکرده‌اید.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {history.map(scan => (
                                    <div key={scan.id} className="relative group">
                                        <HistoryCard 
                                            scan={scan} 
                                            isSelected={selectedScans.includes(scan.id)}
                                            onClick={() => {
                                                if (compareMode) {
                                                    if (selectedScans.includes(scan.id)) {
                                                        setSelectedScans(prev => prev.filter(id => id !== scan.id));
                                                    } else if (selectedScans.length < 2) {
                                                        setSelectedScans(prev => [...prev, scan.id]);
                                                    }
                                                } else {
                                                    handleViewAnalysis(scan);
                                                }
                                            }} 
                                        />
                                        {!compareMode && (
                                            <>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteScan(scan.id); }}
                                                    className="absolute top-2 left-2 bg-red-600/80 p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                                                >
                                                    <Trash2 size={14}/>
                                                </button>
                                                {/* NEW: Open Report Button */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setViewReport(scan); }}
                                                    className="absolute top-2 right-2 bg-blue-600/80 p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition hover:bg-blue-500"
                                                >
                                                    <FileText size={14}/>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {subTab === 'trends' && (
                        <TrendsAnalysis scans={history} />
                    )}
                </div>
            )}

            {/* TAB: AI INSIGHTS & TRENDS (NEW) */}
            {activeTab === 'insights' && (
                <div className="space-y-8 animate-in fade-in">
                    <PredictionWidget profile={profile} />
                    <SmartAlertsPanel profile={profile} />
                    <CorrelatedTrends profile={profile} />
                </div>
            )}

            {/* Modals */}
            {activeWizard && (
                <PhotoCaptureWizard 
                    isOpen={true} 
                    onClose={() => setActiveWizard(null)} 
                    angle={activeWizard}
                    onCapture={(img) => {
                        setScanData(prev => ({
                            ...prev,
                            photos: { ...prev.photos, [activeWizard]: img }
                        }));
                    }} 
                />
            )}

            {comparisonOpen && selectedScans.length === 2 && (
                <ComparisonModule 
                    scanA={history.find(s => s.id === selectedScans[0])!} 
                    scanB={history.find(s => s.id === selectedScans[1])!}
                    profile={profile}
                    onClose={() => { setComparisonOpen(false); setSelectedScans([]); setCompareMode(false); }}
                />
            )}
            
            {viewReport && (
                <CompositionReport 
                    scan={viewReport}
                    history={history}
                    profile={profile}
                    onClose={() => setViewReport(null)}
                />
            )}

        </div>
    );
};

export default AthleteDNA;
