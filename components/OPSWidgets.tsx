
import React, { useState } from 'react';
import { OPSScore, Alert } from '../types';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
    ComposedChart, Line, Bar, Cell
} from 'recharts';
import { 
    TrendingUp, TrendingDown, Minus, Activity, Heart, Dumbbell, 
    Utensils, Trophy, Pill, Dna, ArrowRight, Info, AlertCircle
} from 'lucide-react';

// --- ICONS MAPPING ---
const MODULE_ICONS: Record<string, React.ElementType> = {
    health: Heart,
    workout: Dumbbell,
    nutrition: Utensils,
    performance: Trophy,
    supplements: Pill,
    bio: Dna
};

const MODULE_COLORS: Record<string, string> = {
    health: '#ef4444',     // Red
    workout: '#3b82f6',    // Blue
    nutrition: '#10b981',  // Green
    performance: '#f59e0b',// Amber
    supplements: '#8b5cf6',// Purple
    bio: '#06b6d4'         // Cyan
};

// --- 1. HERO OPS CARD ---
export const OPSScoreCard: React.FC<{ ops: OPSScore; sparklineData: number[] }> = ({ ops, sparklineData }) => {
    let color = 'text-green-400';
    let trendIcon = <Minus className="text-gray-400" size={24}/>;
    let trendLabel = "Stable";
    
    if (ops.trend === 'Improving') {
        color = 'text-[#41D37C]'; // Performance Green
        trendIcon = <TrendingUp className="text-[#41D37C]" size={24}/>;
        trendLabel = "Improving";
    } else if (ops.trend === 'Declining') {
        color = 'text-[#E44C58]'; // Decline Red
        trendIcon = <TrendingDown className="text-[#E44C58]" size={24}/>;
        trendLabel = "Declining";
    }

    // Sparkline Data Format
    const sparkData = sparklineData.map((val, i) => ({ i, val }));

    return (
        <div className="energetic-card relative overflow-hidden bg-gradient-to-br from-gray-900 to-black border-l-4 border-l-[#D4FF00] p-6 h-full flex flex-col justify-between shadow-2xl">
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4FF00]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex justify-between items-start z-10">
                <div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Overall Performance Score</h3>
                    <div className="flex items-baseline gap-3">
                        <span className={`text-6xl font-black ${color} tracking-tighter drop-shadow-lg font-mono`}>
                            {ops.total}
                        </span>
                        <span className="text-sm text-gray-500 font-mono">/100</span>
                    </div>
                </div>
                <div className={`flex flex-col items-end ${color}`}>
                    {trendIcon}
                    <span className="text-xs font-bold mt-1">{trendLabel}</span>
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {ops.delta > 0 ? '+' : ''}{ops.delta}% vs last week
                    </span>
                </div>
            </div>

            {/* Sparkline Area */}
            <div className="h-16 w-full mt-4 -mx-2 opacity-50">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData}>
                        <defs>
                            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#D4FF00" stopOpacity={0.3}/>
                                <stop offset="100%" stopColor="#D4FF00" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="val" stroke="#D4FF00" strokeWidth={2} fill="url(#sparkGrad)" isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-2 flex justify-between items-center text-[10px] text-gray-500 border-t border-white/5 pt-2">
                <span>Last Updated: {new Date(ops.lastUpdated).toLocaleTimeString()}</span>
                <span>Algorithm v2.4</span>
            </div>
        </div>
    );
};

// --- 2. MODULE SCORE CARD ---
export const ModuleScoreCard: React.FC<{ 
    moduleKey: string; 
    score: number; 
    label: string; 
    trend?: 'up' | 'down' | 'stable';
    onClick?: () => void;
}> = ({ moduleKey, score, label, trend = 'stable', onClick }) => {
    const Icon = MODULE_ICONS[moduleKey] || Activity;
    const baseColor = MODULE_COLORS[moduleKey] || '#fff';
    
    return (
        <div 
            onClick={onClick}
            className="bg-[#151915] border border-[#3E4A3E] hover:border-[#D4FF00]/50 rounded-xl p-4 transition-all duration-300 group cursor-pointer hover:-translate-y-1 relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 group-hover:bg-white/5 transition">
                    <Icon size={18} style={{ color: baseColor }} />
                </div>
                {trend === 'up' && <TrendingUp size={16} className="text-[#41D37C]" />}
                {trend === 'down' && <TrendingDown size={16} className="text-[#E44C58]" />}
                {trend === 'stable' && <Minus size={16} className="text-[#F6C744]" />}
            </div>
            
            <div className="relative z-10">
                <span className="text-3xl font-black text-white font-mono">{score}</span>
                <div className="w-full bg-gray-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div 
                        className="h-full transition-all duration-1000" 
                        style={{ width: `${score}%`, backgroundColor: baseColor }}
                    ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400 font-bold uppercase">{label}</span>
                    <ArrowRight size={12} className="text-gray-600 group-hover:text-white transition opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1" />
                </div>
            </div>
        </div>
    );
};

// --- 3. ADVANCED TREND CHART (Weekly/Monthly) ---
interface TrendChartProps {
    data: { date: string; value: number; ewma?: number; lowerBound?: number; upperBound?: number }[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
    const [range, setRange] = useState<'4w' | '12w' | '24w'>('4w');
    const [showEwma, setShowEwma] = useState(true);

    // Slice data based on range mock logic
    const displayData = range === '4w' ? data.slice(-28) : range === '12w' ? data.slice(-84) : data;

    return (
        <div className="energetic-card p-6 bg-[#151915] border-[#3E4A3E]">
            {/* Chart Header Controls */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Activity className="text-blue-400" size={18}/> 
                    روند تغییرات OPS
                </h3>
                
                <div className="flex gap-2">
                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                        {(['4w', '12w', '24w'] as const).map(r => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-3 py-1 text-[10px] font-bold rounded transition ${range === r ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setShowEwma(!showEwma)}
                        className={`px-3 py-1 text-[10px] font-bold rounded border transition flex items-center gap-1 ${showEwma ? 'bg-purple-900/30 text-purple-300 border-purple-500/30' : 'bg-transparent text-gray-500 border-gray-700'}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${showEwma ? 'bg-purple-400' : 'bg-gray-600'}`}></div>
                        EWMA
                    </button>
                </div>
            </div>

            {/* Main Chart */}
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={displayData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                        <defs>
                            <linearGradient id="opsArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <pattern id="stripe-pattern" patternUnits="userSpaceOnUse" width="4" height="4">
                                <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#ffffff10" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tick={{dy: 5}} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                        <YAxis stroke="#9ca3af" fontSize={10} domain={[0, 100]} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0F120D', border: '1px solid #3E4A3E', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px' }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '10px' }}
                        />
                        
                        {/* Confidence Band (Mocked as area between lower and upper) */}
                        {/* Since Recharts Area needs one value or array, we visually cheat with stacked or just simple area if provided */}
                        {/* For simplicity in this demo, just main line and EWMA */}

                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            strokeWidth={2} 
                            fill="url(#opsArea)" 
                            name="OPS Daily"
                        />
                        
                        {showEwma && (
                            <Line 
                                type="monotone" 
                                dataKey="ewma" 
                                stroke="#a855f7" 
                                strokeWidth={2} 
                                dot={false} 
                                strokeDasharray="5 5"
                                name="7-Day EWMA"
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-500 justify-center">
                <div className="flex items-center gap-1"><div className="w-3 h-1 bg-blue-500 rounded-full"></div> OPS Daily</div>
                {showEwma && <div className="flex items-center gap-1"><div className="w-3 h-1 bg-purple-500 rounded-full border border-dashed border-purple-300"></div> Moving Avg</div>}
            </div>
        </div>
    );
};

// --- 4. ALERT ITEM (New Component) ---
export const AlertItem: React.FC<{ alert: Alert }> = ({ alert }) => {
    let icon = <Info size={18} className="text-blue-400" />;
    let bg = "bg-blue-900/10";
    let border = "border-blue-500/20";

    if (alert.level === 'Critical') {
        icon = <AlertCircle size={18} className="text-red-400" />;
        bg = "bg-red-900/10";
        border = "border-red-500/20";
    } else if (alert.level === 'Warning') {
        icon = <AlertCircle size={18} className="text-yellow-400" />;
        bg = "bg-yellow-900/10";
        border = "border-yellow-500/20";
    }

    return (
        <div className={`p-4 border-b border-gray-800 last:border-0 ${bg} flex items-start gap-3`}>
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-bold ${alert.level === 'Critical' ? 'text-red-300' : alert.level === 'Warning' ? 'text-yellow-300' : 'text-blue-300'}`}>
                        {alert.level}: {alert.reason}
                    </h4>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                        {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
                {alert.suggestedAction && (
                    <div className="mt-2 text-[10px] bg-black/30 px-2 py-1 rounded inline-block text-gray-300 border border-white/5 font-mono">
                        Action: {alert.suggestedAction}
                    </div>
                )}
            </div>
        </div>
    );
};
