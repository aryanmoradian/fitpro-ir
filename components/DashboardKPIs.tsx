import React from 'react';
import { AppView, DashboardKPIs } from '../types';
import { 
    UserCircle, Activity, Calendar, Dumbbell, Utensils, 
    Pill, Trophy, Camera, HeartPulse, BrainCircuit, AlertCircle, 
    CheckCircle2, TrendingUp, TrendingDown, ArrowRight, Zap 
} from 'lucide-react';
import { 
    BarChart, Bar, ResponsiveContainer, Cell, AreaChart, Area, 
    RadialBarChart, RadialBar 
} from 'recharts';

interface GridProps {
    kpis: DashboardKPIs;
    setCurrentView: (view: AppView) => void;
}

const WidgetWrapper: React.FC<{
    title: string;
    icon: React.ElementType;
    onClick: () => void;
    colorClass: string;
    children: React.ReactNode;
    alert?: boolean;
}> = ({ title, icon: Icon, onClick, colorClass, children, alert }) => (
    <div 
        onClick={onClick}
        className={`relative p-3 rounded-lg border bg-[#232923] cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-full min-h-[110px] ${alert ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-[#3E4A3E] hover:border-[#D4FF00]'}`}
    >
        <div className="flex justify-between items-start mb-2">
            <div className={`p-1.5 rounded-md ${colorClass} bg-opacity-20 border border-opacity-30`}>
                <Icon size={16} className={colorClass.replace('bg-', 'text-')} />
            </div>
            {alert && <AlertCircle size={16} className="text-red-500 animate-pulse" />}
        </div>
        <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">{title}</h4>
        <div className="flex-1 flex flex-col justify-end">
            {children}
        </div>
        {/* Tactical Corner Accent */}
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#3E4A3E] group-hover:border-[#D4FF00] transition-colors rounded-bl-sm"></div>
    </div>
);

export const IntegratedDashboardGrid: React.FC<GridProps> = ({ kpis, setCurrentView }) => {
    
    // Helper Data for Mini Charts
    const volumeData = [{ val: 40 }, { val: 65 }, { val: 50 }, { val: 80 }, { val: 60 }, { val: 90 }, { val: kpis.training.weeklyVolume / 1000 }];

    return (
        <div className="grid grid-cols-2 gap-3 h-full overflow-y-auto custom-scrollbar pr-1 max-h-[400px]">
            
            {/* 1. Profile & Body */}
            <WidgetWrapper 
                title="تکمیل پروفایل" 
                icon={UserCircle} 
                onClick={() => setCurrentView(AppView.BODY_ANALYSIS)}
                colorClass="bg-blue-500"
            >
                <div className="flex items-end justify-between">
                    <span className="text-xl font-black text-white">{kpis.profile.completionPct}%</span>
                </div>
                <div className="w-full bg-[#0F120D] h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{width: `${kpis.profile.completionPct}%`}}></div>
                </div>
            </WidgetWrapper>

            {/* 2. Daily Log */}
            <WidgetWrapper 
                title="ثبات روزانه" 
                icon={Activity} 
                onClick={() => setCurrentView(AppView.TRACKER)}
                colorClass="bg-green-500"
                alert={kpis.dailyLog.hasAlert}
            >
                <div className="flex items-end justify-between">
                    <span className="text-xl font-black text-white">{kpis.dailyLog.consistencyScore}</span>
                    <div className="flex items-center text-[10px] text-orange-400 mb-1 font-mono">
                        <Zap size={10} className="mr-1"/> {kpis.dailyLog.streak}
                    </div>
                </div>
                <div className="text-[9px] text-gray-500 mt-1 font-mono">30-Day Score</div>
            </WidgetWrapper>

            {/* 3. Saska Programmer */}
            <WidgetWrapper 
                title="برنامه فعال" 
                icon={Calendar} 
                onClick={() => setCurrentView(AppView.PLANNER)}
                colorClass="bg-purple-500"
            >
                <div className="text-[10px] font-bold text-white truncate mb-1">{kpis.planner.activeProgramName}</div>
                <div className="w-full bg-[#0F120D] h-1 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{width: `${kpis.planner.adherenceRate}%`}}></div>
                </div>
            </WidgetWrapper>

            {/* 4. Training Center */}
            <WidgetWrapper 
                title="حجم تمرین" 
                icon={Dumbbell} 
                onClick={() => setCurrentView(AppView.TRAINING_CENTER)}
                colorClass="bg-orange-500"
            >
                <div className="flex items-end justify-between">
                    <span className="text-lg font-black text-white">{(kpis.training.weeklyVolume / 1000).toFixed(1)}k</span>
                    <div className="h-6 w-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={volumeData}>
                                <Bar dataKey="val" fill="#f97316" radius={[2,2,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </WidgetWrapper>

            {/* 5. Nutrition Center */}
            <WidgetWrapper 
                title="تغذیه" 
                icon={Utensils} 
                onClick={() => setCurrentView(AppView.NUTRITION_CENTER)}
                colorClass="bg-yellow-500"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-lg font-bold text-white">{kpis.nutrition.avgCalories}</div>
                        <div className="text-[9px] text-gray-500 font-mono">kcal</div>
                    </div>
                    <div className="h-8 w-8 relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={8} data={[{val: kpis.nutrition.adherence, fill: '#eab308'}]} startAngle={90} endAngle={-270}>
                                <RadialBar background dataKey="val" cornerRadius={10}/>
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </WidgetWrapper>

            {/* 6. Records */}
            <WidgetWrapper 
                title="رکوردها" 
                icon={Trophy} 
                onClick={() => setCurrentView(AppView.PERFORMANCE_CENTER)}
                colorClass="bg-red-500"
            >
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-white">{kpis.performance.totalPBs}</span>
                    <span className="text-[9px] text-gray-400 mb-2 font-mono">LOGGED</span>
                </div>
            </WidgetWrapper>

            {/* 7. Health Center */}
            <WidgetWrapper 
                title="ریسک سلامت" 
                icon={HeartPulse} 
                onClick={() => setCurrentView(AppView.HEALTH_HUB)}
                colorClass="bg-indigo-500"
                alert={kpis.health.riskLevel === 'High'}
            >
                <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs px-2 py-0.5 rounded ${kpis.health.riskLevel === 'Low' ? 'bg-green-900/50 text-green-400' : kpis.health.riskLevel === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'}`}>
                        {kpis.health.riskLevel.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">{kpis.health.recoveryIndex}</span>
                </div>
            </WidgetWrapper>

            {/* 8. Bio Analysis */}
            <WidgetWrapper 
                title="روند زیستی" 
                icon={BrainCircuit} 
                onClick={() => setCurrentView(AppView.BIOLOGICAL_ANALYSIS)}
                colorClass="bg-cyan-500"
            >
                <div className="flex items-center justify-between h-full">
                    {kpis.bio.trend === 'Up' ? <TrendingUp className="text-green-400" size={16}/> : <TrendingDown className="text-red-400" size={16}/>}
                    <span className="text-xs font-bold text-white font-mono">{kpis.bio.label}</span>
                </div>
            </WidgetWrapper>

        </div>
    );
};