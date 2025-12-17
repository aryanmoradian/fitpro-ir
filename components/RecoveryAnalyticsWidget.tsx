
import React, { useMemo } from 'react';
import { RecoveryLog, AppView } from '../types';
import { calculateRecoveryScore } from '../services/recoveryService';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Battery, Activity, ArrowRight, Zap } from 'lucide-react';

interface RecoveryAnalyticsWidgetProps {
    logs: RecoveryLog[];
    onNavigate: () => void;
}

const RecoveryAnalyticsWidget: React.FC<RecoveryAnalyticsWidgetProps> = ({ logs, onNavigate }) => {
    // Generate simple trend data (Last 7 days)
    const trendData = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dailyLogs = logs.filter(l => l.date === dateStr && l.status === 'Completed');
            // Assuming 5 daily tasks is "100%" for visualization simplicity
            const score = Math.min(100, (dailyLogs.length / 5) * 100); 
            days.push({ date: dateStr, score });
        }
        return days;
    }, [logs]);

    const currentScore = trendData[trendData.length - 1].score;
    const avgScore = Math.round(trendData.reduce((a, b) => a + b.score, 0) / 7);

    return (
        <div className="energetic-card p-5 flex flex-col h-full bg-gradient-to-br from-indigo-900 to-gray-900 border-indigo-500/30 shadow-xl relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Activity className="text-indigo-400" size={18}/> 
                        روند ریکاوری
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1">امتیاز بازیابی ۷ روز گذشته</p>
                </div>
                <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border ${avgScore >= 70 ? 'bg-green-900/30 border-green-500/30 text-green-400' : 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400'}`}>
                    <Zap size={12}/>
                    <span className="font-bold">{avgScore}% Avg</span>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-[80px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip cursor={false} contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '10px'}} itemStyle={{color: '#fff'}}/>
                        <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2} fill="url(#recGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Footer */}
            <div className="mt-4 relative z-10">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">وضعیت امروز</span>
                    <span className={`text-lg font-black ${currentScore >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>{currentScore}%</span>
                </div>
                <button onClick={onNavigate} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 rounded-lg transition flex items-center justify-center font-bold shadow-lg">
                    مدیریت ریکاوری <ArrowRight size={12} className="mr-1 rotate-180"/>
                </button>
            </div>
        </div>
    );
};

export default RecoveryAnalyticsWidget;
