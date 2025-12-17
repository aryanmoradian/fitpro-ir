
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, CartesianGrid
} from 'recharts';
import { 
  Activity, Calendar, CheckCircle2, ChevronDown, ChevronUp, Clock, Flame, 
  Heart, LineChart as IconLineChart, Medal, Moon, Plus, Share2, Smile, Trophy, Zap, AlertCircle, Droplets, Minus, Award,
  Move, Trash2, Edit2, Maximize2, Minimize2, Grid, Layout, Target, TrendingUp, TrendingDown, Sun, X, Eye, Star, Bell, Brain, Sparkles, ArrowRight
} from 'lucide-react';
import { DailyLog, Exercise, NutritionItem, UserProfile, Habit, Mood, BodyMetricLog, WidgetStyle, AdvancedWidget, WidgetType, WidgetSize, AIRecommendation, AIAction } from '../types';
import { LevelInfo } from '../services/levelCalculator';
import { generateAIInsights } from '../services/aiInsightService';
import RecoveryAnalyticsWidget from './RecoveryAnalyticsWidget';

interface WidgetProps {
  logs: DailyLog[];
  workoutPlan: Exercise[];
  nutritionPlan: NutritionItem[];
  profile: UserProfile;
  updateProfile: (p: UserProfile) => void;
  metrics: BodyMetricLog[];
  updateTodaysLog: (partialLog: Partial<DailyLog>) => void;
  athleteLevelInfo: LevelInfo;
  highlightCharts?: boolean;
}

// --- ICONS MAP ---
const IconsMap: any = { 
    Activity, Calendar, Flame, Moon, Trophy, Droplets, Zap, Award, LineChart: IconLineChart, Target, Sun, TrendingUp, Star, Bell, Brain, Sparkles
};

// --- WIDGET BUILDER MODAL ---
const WidgetBuilderModal: React.FC<{
    onSave: (widget: AdvancedWidget) => void;
    onClose: () => void;
    nextOrder: number;
}> = ({ onSave, onClose, nextOrder }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<WidgetType>('metric_card');
    const [metric, setMetric] = useState('workoutScore');
    const [size, setSize] = useState<WidgetSize>('M');
    const [icon, setIcon] = useState('Activity');

    const handleSave = () => {
        if (!title) return alert("لطفا عنوان ویجت را وارد کنید.");
        const newWidget: AdvancedWidget = {
            id: `w_${Date.now()}`,
            title,
            type,
            metric,
            size,
            order: nextOrder,
            iconName: icon,
            // Default configs based on type
            dataKey: metric,
            thresholds: metric.includes('Score') ? { low: 50, medium: 80, high: 100 } : undefined,
            goalValue: metric === 'waterIntake' ? 12 : 100
        };
        onSave(newWidget);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-gray-800 border border-gray-600 rounded-2xl w-full max-w-lg p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Plus size={24} className="text-green-500"/> افزودن ویجت جدید</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-sm block mb-1">عنوان ویجت</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full input-styled p-3" placeholder="مثلا: نمودار پیشرفت هفتگی" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-sm block mb-1">نوع نمایش</label>
                            <select value={type} onChange={e => setType(e.target.value as WidgetType)} className="w-full input-styled p-3">
                                <option value="metric_card">کارت متریک (عدد)</option>
                                <option value="line_chart">نمودار خطی</option>
                                <option value="bar_chart">نمودار میله‌ای</option>
                                <option value="area_chart">نمودار مساحت</option>
                                <option value="radar_chart">نمودار راداری</option>
                                <option value="donut_chart">دونات (پیشرفت)</option>
                                <option value="heatmap">هیت‌مپ (تراکم)</option>
                                <option value="forecast_chart">پیش‌بینی (Forecast)</option>
                                <option value="notification_list">لیست اعلان‌ها</option>
                                <option value="ai_insight_list">هوش مصنوعی (AI Insights)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm block mb-1">داده مورد نظر</label>
                            <select value={metric} onChange={e => setMetric(e.target.value)} className="w-full input-styled p-3">
                                <option value="workoutScore">امتیاز تمرین</option>
                                <option value="nutritionScore">امتیاز تغذیه</option>
                                <option value="sleepHours">ساعت خواب</option>
                                <option value="sleepQuality">کیفیت خواب</option>
                                <option value="waterIntake">مصرف آب</option>
                                <option value="steps">تعداد قدم</option>
                                <option value="stressIndex">سطح استرس</option>
                                <option value="energyLevel">سطح انرژی</option>
                                <option value="weight">وزن بدن</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-sm block mb-1">اندازه</label>
                            <select value={size} onChange={e => setSize(e.target.value as WidgetSize)} className="w-full input-styled p-3">
                                <option value="S">کوچک (1/4)</option>
                                <option value="M">متوسط (1/2)</option>
                                <option value="L">بزرگ (3/4)</option>
                                <option value="Full">تمام عرض</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm block mb-1">آیکون</label>
                            <select value={icon} onChange={e => setIcon(e.target.value)} className="w-full input-styled p-3">
                                {Object.keys(IconsMap).map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </div>
                    </div>

                    <button onClick={handleSave} className="w-full btn-primary py-3 font-bold mt-4">ساخت ویجت</button>
                </div>
            </div>
        </div>
    );
};

// --- RENDERERS ---

const MetricCardRenderer: React.FC<{ 
    widget: AdvancedWidget; 
    data: any; 
    onAction?: (action: string, value: any) => void;
}> = ({ widget, data, onAction }) => {
    const value = data[widget.metric] || 0;
    const goal = widget.goalValue || 100;
    const percent = Math.min(100, Math.round((value / goal) * 100));
    
    // Custom Colors logic
    let color = 'text-blue-400';
    let barColor = 'bg-blue-500';
    if (widget.thresholds) {
        if (value < widget.thresholds.low) { color = 'text-red-400'; barColor = 'bg-red-500'; }
        else if (value < widget.thresholds.medium) { color = 'text-yellow-400'; barColor = 'bg-yellow-500'; }
        else { color = 'text-green-400'; barColor = 'bg-green-500'; }
    }

    return (
        <div className="flex flex-col items-center justify-center text-center h-full">
            <div className={`text-4xl font-black ${color} mb-2`}>{value}</div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
                <div className={`h-full ${barColor} transition-all duration-500`} style={{width: `${percent}%`}}></div>
            </div>
            <p className="text-xs text-gray-400">{percent}% of Goal ({goal})</p>
            {widget.metric === 'waterIntake' && onAction && (
                <div className="flex gap-2 mt-4">
                    <button onClick={() => onAction('add', 1)} className="px-3 py-1 bg-blue-600 rounded text-white text-xs">+1</button>
                    <button onClick={() => onAction('sub', 1)} className="px-3 py-1 bg-gray-600 rounded text-white text-xs">-1</button>
                </div>
            )}
        </div>
    );
};

const GamificationWidgetRenderer: React.FC<{ profile: UserProfile }> = ({ profile }) => {
    const level = Math.floor(profile.xp / 1000) + 1;
    const progress = (profile.xp % 1000) / 10;
    
    return (
        <div className="flex flex-col items-center justify-center h-full p-2">
            <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 flex items-center justify-center bg-purple-900/20">
                        <span className="text-2xl font-black text-white">{level}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-purple-600 text-[10px] px-2 py-0.5 rounded-full text-white font-bold border border-black">Lvl</div>
                </div>
                <div className="flex-1">
                    <div className="text-sm font-bold text-white mb-1">{profile.name}</div>
                    <div className="text-xs text-yellow-400 flex items-center gap-1"><Star size={10} fill="currentColor"/> {profile.xp.toLocaleString()} XP</div>
                </div>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{width: `${progress}%`}}></div>
            </div>
            <p className="text-[10px] text-gray-400 w-full text-right">{1000 - (profile.xp % 1000)} XP تا سطح بعدی</p>
        </div>
    );
};

const AIInsightListRenderer: React.FC<{ 
    insights: AIRecommendation[];
    onAction: (id: string, actionType: string) => void;
}> = ({ insights, onAction }) => {
    if (insights.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                <Brain className="w-8 h-8 mb-2 opacity-50"/>
                <p className="text-xs">داده‌های شما برای تولید پیشنهاد جدید کافی نیست یا همه موارد انجام شده است.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-2 space-y-3">
            {insights.map(insight => (
                <div key={insight.id} className="bg-gradient-to-br from-indigo-900/40 to-gray-900 border border-indigo-500/30 p-3 rounded-xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-yellow-400"/>
                            <span className="text-xs font-bold text-indigo-300">{insight.category}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${insight.priority === 'high' ? 'bg-red-900/50 text-red-300' : 'bg-gray-700 text-gray-300'}`}>
                            {Math.round(insight.confidence * 100)}%
                        </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1 relative z-10">{insight.title}</h4>
                    <p className="text-xs text-gray-400 mb-3 relative z-10">{insight.description}</p>
                    
                    <div className="flex gap-2 relative z-10">
                        {insight.actions.slice(0, 2).map((action, idx) => (
                            <button 
                                key={idx}
                                onClick={() => onAction(insight.id, action.type)}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] py-1.5 rounded-lg flex items-center justify-center transition"
                            >
                                {action.label} <ArrowRight size={10} className="ml-1"/>
                            </button>
                        ))}
                    </div>
                    {/* Background Effect */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                </div>
            ))}
        </div>
    );
};

const NotificationListWidget: React.FC<{}> = () => {
    // Mock simplified data for widget view
    const notifs = [
        { id: '1', title: 'هشدار هیدراتاسیون', time: '10:00' },
        { id: '2', title: 'زمان خواب نزدیک است', time: '22:30' },
    ];
    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-2 space-y-2">
            {notifs.map(n => (
                <div key={n.id} className="flex justify-between items-center p-2 bg-white/5 rounded text-xs">
                    <span className="text-gray-300">{n.title}</span>
                    <span className="text-gray-500">{n.time}</span>
                </div>
            ))}
            <div className="text-center text-[10px] text-blue-400 cursor-pointer hover:underline pt-2">مشاهده همه اعلان‌ها</div>
        </div>
    );
};

const ChartRenderer: React.FC<{
    widget: AdvancedWidget;
    data: any[];
    isForecast?: boolean;
}> = ({ widget, data, isForecast }) => {
    const ChartComponent = widget.type === 'bar_chart' ? BarChart : widget.type === 'line_chart' ? LineChart : AreaChart;
    const DataComponent = widget.type === 'bar_chart' ? Bar : widget.type === 'line_chart' ? Line : Area;
    const color = widget.customColors?.primary || '#8b5cf6';

    // Simple Linear Regression for Forecast
    const processedData = useMemo(() => {
        if (!isForecast || data.length < 2) return data;
        const trendData = [...data];
        const lastVal = data[data.length-1][widget.metric] || 0;
        const prevVal = data[data.length-2][widget.metric] || 0;
        const slope = lastVal - prevVal;
        
        for(let i=1; i<=3; i++) {
            trendData.push({
                date: `+${i}d`,
                [widget.metric]: Math.max(0, lastVal + (slope * i)),
                isForecast: true
            });
        }
        return trendData;
    }, [data, isForecast, widget.metric]);

    return (
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ChartComponent data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickFormatter={(val) => val.includes('/') ? val.split('/')[2] : val} />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}} />
                    <DataComponent 
                        type="monotone" 
                        dataKey={widget.dataKey || widget.metric} 
                        stroke={color} 
                        fill={color} 
                        fillOpacity={0.3} 
                        strokeDasharray={isForecast ? "5 5" : ""}
                    />
                    {widget.secondaryDataKey && (
                        <DataComponent 
                            type="monotone" 
                            dataKey={widget.secondaryDataKey} 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.3} 
                        />
                    )}
                </ChartComponent>
            </ResponsiveContainer>
        </div>
    );
};

const RadarRenderer: React.FC<{ widget: AdvancedWidget; data: any }> = ({ widget, data }) => {
    const radarData = [
        { subject: 'Sleep', A: (data.sleepQuality || 0) * 10, fullMark: 100 },
        { subject: 'Stress', A: 100 - (data.stressIndex || 50), fullMark: 100 },
        { subject: 'Energy', A: (data.energyLevel || 0) * 10, fullMark: 100 },
        { subject: 'Nutrition', A: data.nutritionScore || 0, fullMark: 100 },
        { subject: 'Workout', A: data.workoutScore || 0, fullMark: 100 },
    ];

    return (
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#4b5563" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Status" dataKey="A" stroke="#ec4899" fill="#ec4899" fillOpacity={0.5} />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

const DonutChartRenderer: React.FC<{ widget: AdvancedWidget; data: any }> = ({ widget, data }) => {
    const value = data[widget.metric] || 0;
    const goal = widget.goalValue || 100;
    const remaining = Math.max(0, goal - value);
    const chartData = [
        { name: 'Completed', value: value },
        { name: 'Remaining', value: remaining }
    ];
    const COLORS = [widget.customColors?.primary || '#00C16F', '#374151'];

    return (
        <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">{Math.round((value/goal)*100)}%</span>
                <span className="text-xs text-gray-400">تکمیل شده</span>
            </div>
        </div>
    );
};

const HeatmapRenderer: React.FC<{ widget: AdvancedWidget; data: any[] }> = ({ widget, data }) => {
    // Simulating a GitHub-style contribution graph for last 28 days (4 weeks)
    const cells = Array.from({ length: 28 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (27 - i));
        const dateStr = date.toLocaleDateString('fa-IR');
        const log = data.find(d => d.date === dateStr);
        const value = log ? (log[widget.metric] || 0) : 0;
        
        let intensity = 'bg-gray-800';
        if (value > 0) intensity = 'bg-green-900';
        if (value > 30) intensity = 'bg-green-700';
        if (value > 60) intensity = 'bg-green-500';
        if (value > 90) intensity = 'bg-green-400';

        return { date: dateStr, value, intensity };
    });

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <div className="grid grid-cols-7 gap-2">
                {cells.map((cell, i) => (
                    <div 
                        key={i} 
                        className={`w-6 h-6 rounded-md ${cell.intensity} transition hover:scale-125 cursor-default`} 
                        title={`${cell.date}: ${cell.value}`}
                    ></div>
                ))}
            </div>
            <div className="flex justify-between w-full max-w-[200px] mt-2 text-[10px] text-gray-500">
                <span>کم</span>
                <span>زیاد</span>
            </div>
        </div>
    );
};

// --- UNIVERSAL WIDGET WRAPPER ---
const UniversalWidget: React.FC<{ 
    widget: AdvancedWidget;
    children: React.ReactNode; 
    styleConfig?: WidgetStyle;
}> = React.memo(({ widget, children, styleConfig }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Size mapping
  const sizeClasses = {
      'S': 'md:col-span-1',
      'M': 'md:col-span-2',
      'L': 'md:col-span-3',
      'Full': 'col-span-full'
  };

  // Variant Styles
  const variant = styleConfig?.variant || 'card';
  let containerClass = `overflow-hidden transition-all duration-300 relative group ${sizeClasses[widget.size]} `;
  let headerClass = "p-4 flex justify-between items-center ";
  
  if (variant === 'glass') {
      containerClass += "bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl ";
      headerClass += "border-b border-white/10 bg-white/5";
  } else if (variant === 'minimal') {
      containerClass += "bg-transparent border-0 rounded-xl ";
      headerClass += "border-b border-gray-800 pb-2 mb-2 px-0";
  } else if (variant === 'gradient') {
      containerClass += `bg-gradient-to-br from-gray-900/40 to-black border border-gray-500/30 rounded-2xl shadow-lg `;
      headerClass += "bg-black/20 border-b border-white/5";
  } else {
      // Default Card
      containerClass += "energetic-card ";
      headerClass += "border-b border-white/10 bg-black/20";
  }

  const Icon = IconsMap[widget.iconName || 'Activity'] || Activity;

  return (
    <div className={containerClass}>
      <div className={headerClass}>
        <h3 className="font-bold text-lg flex items-center text-white">
          <Icon className="w-5 h-5 ml-2 text-blue-400" />
          {widget.title}
        </h3>
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white transition">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      {isOpen && <div className={`h-full ${variant === 'minimal' ? 'pt-2' : 'p-4'}`}>{children}</div>}
    </div>
  );
});

// --- DEFAULT LEGACY LAYOUT MAPPED TO NEW SYSTEM ---
const DEFAULT_LAYOUT: AdvancedWidget[] = [
    { id: 'daily_snapshot', type: 'metric_card', title: 'نمای روزانه', metric: 'workoutScore', size: 'M', order: 1, iconName: 'Activity', goalValue: 100, thresholds: { low: 50, medium: 80, high: 100 } },
    { id: 'hydration', type: 'metric_card', title: 'آبرسانی', metric: 'waterIntake', size: 'S', order: 2, iconName: 'Droplets', goalValue: 12 }, 
    { id: 'nutrition_chart', type: 'bar_chart', title: 'روند تغذیه', metric: 'nutritionScore', size: 'M', order: 3, iconName: 'Flame', dataKey: 'nutritionScore' },
    { id: 'recovery_radar', type: 'radar_chart', title: 'ریکاوری و استرس', metric: 'recovery', size: 'S', order: 4, iconName: 'Moon' },
];

export const DashboardWidgetsGrid: React.FC<WidgetProps> = React.memo(({ logs, workoutPlan, nutritionPlan, profile, updateProfile, metrics, updateTodaysLog, athleteLevelInfo, highlightCharts }) => {
  const [layout, setLayout] = useState<AdvancedWidget[]>(profile.settings?.dashboardLayout || DEFAULT_LAYOUT);
  
  // AI Insights State
  const [insights, setInsights] = useState<AIRecommendation[]>([]);

  const todayStr = new Date().toLocaleDateString('fa-IR');
  const todayLog = logs.find(l => l.date === todayStr) || { workoutScore: 0, nutritionScore: 0, waterIntake: 0 };
  const last30Logs = logs.slice(-30);

  // Generate Insights on Load/Update
  useEffect(() => {
      const generated = generateAIInsights(profile, logs);
      setInsights(generated);
  }, [logs]);

  const handleAction = (action: string, value: any) => {
      if (action === 'add') {
          updateTodaysLog({ waterIntake: (todayLog.waterIntake || 0) + value });
      } else if (action === 'sub') {
          updateTodaysLog({ waterIntake: Math.max(0, (todayLog.waterIntake || 0) - value) });
      }
  };

  const handleAIAction = (id: string, actionType: string) => {
      alert(`Action '${actionType}' for insight ${id} triggered!`);
      // In real app, perform action logic here (e.g., auto-log sleep)
      setInsights(prev => prev.filter(i => i.id !== id)); // Remove from view
  };

  return (
    <div className="mt-8 relative">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center"><Layout className="mr-2"/> داشبورد شخصی</h2>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6`}>
            {layout.sort((a,b) => a.order - b.order).map(widget => (
                <UniversalWidget 
                    key={widget.id} 
                    widget={widget} 
                    styleConfig={profile.settings?.widgetStyles?.[widget.id]}
                >
                    {widget.type === 'metric_card' && (
                        <MetricCardRenderer widget={widget} data={todayLog} onAction={handleAction} />
                    )}
                    {(widget.type === 'line_chart' || widget.type === 'bar_chart' || widget.type === 'area_chart') && (
                        <ChartRenderer widget={widget} data={last30Logs.slice(widget.timeRange === '90d' ? -90 : widget.timeRange === '30d' ? -30 : -7)} />
                    )}
                    {widget.type === 'radar_chart' && (
                        <RadarRenderer widget={widget} data={todayLog} />
                    )}
                    {widget.type === 'donut_chart' && (
                        <DonutChartRenderer widget={widget} data={todayLog} />
                    )}
                    {widget.type === 'heatmap' && (
                        <HeatmapRenderer widget={widget} data={last30Logs} />
                    )}
                    {widget.type === 'forecast_chart' && (
                        <ChartRenderer widget={widget} data={last30Logs} isForecast={true} />
                    )}
                    {widget.type === 'gamification_card' && (
                        <GamificationWidgetRenderer profile={profile} />
                    )}
                    {widget.type === 'notification_list' && (
                        <NotificationListWidget />
                    )}
                    {widget.type === 'ai_insight_list' && (
                        <AIInsightListRenderer insights={insights} onAction={handleAIAction} />
                    )}
                </UniversalWidget>
            ))}
        </div>
    </div>
  );
});
