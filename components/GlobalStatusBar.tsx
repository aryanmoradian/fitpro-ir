
import React, { useEffect, useState } from 'react';
import { UserPerformanceState, AppView } from '../types';
import { subscribeToGlobalState } from '../services/globalDataCore';
import { Activity, Flame, Droplets, Battery, AlertTriangle } from 'lucide-react';

interface Props {
    setCurrentView: (view: AppView) => void;
}

const GlobalStatusBar: React.FC<Props> = ({ setCurrentView }) => {
    const [state, setState] = useState<UserPerformanceState | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToGlobalState(setState);
        return () => unsubscribe();
    }, []);

    if (!state) return null;

    return (
        <div className="bg-[#0F172A] border-b border-gray-800 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto sticky top-0 z-50 shadow-md">
            <div className="flex gap-4 min-w-max">
                {/* 1. Recovery / Fatigue */}
                <button onClick={() => setCurrentView(AppView.HEALTH_HUB)} className="flex items-center gap-2 group hover:bg-white/5 px-2 py-1 rounded transition">
                    <div className="relative">
                        <Battery size={14} className={state.fatigueLevel > 70 ? 'text-red-400' : 'text-green-400'} />
                        {state.injuryRisk === 'High' && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-gray-400 text-[10px]">Fatigue</span>
                        <span className="text-white font-bold">{state.fatigueLevel}%</span>
                    </div>
                </button>

                <div className="w-px bg-gray-800 h-6"></div>

                {/* 2. Inflammation */}
                <button onClick={() => setCurrentView(AppView.MEAL_SCAN)} className="flex items-center gap-2 group hover:bg-white/5 px-2 py-1 rounded transition">
                    <Flame size={14} className={state.inflammationScore > 50 ? 'text-orange-400' : 'text-blue-400'} />
                    <div className="flex flex-col text-left">
                        <span className="text-gray-400 text-[10px]">Inflammation</span>
                        <span className="text-white font-bold">{state.inflammationScore}</span>
                    </div>
                </button>

                <div className="w-px bg-gray-800 h-6"></div>

                {/* 3. Hydration */}
                <button onClick={() => setCurrentView(AppView.HEALTH_HUB)} className="flex items-center gap-2 group hover:bg-white/5 px-2 py-1 rounded transition">
                    <Droplets size={14} className="text-cyan-400" />
                    <div className="flex flex-col text-left">
                        <span className="text-gray-400 text-[10px]">Hydration Goal</span>
                        <span className="text-white font-bold">{state.dailyHydrationTarget}ml</span>
                    </div>
                </button>

                <div className="w-px bg-gray-800 h-6"></div>

                {/* 4. Saska Status */}
                <button onClick={() => setCurrentView(AppView.PLANNER)} className="flex items-center gap-2 group hover:bg-white/5 px-2 py-1 rounded transition">
                    <Activity size={14} className="text-purple-400" />
                    <div className="flex flex-col text-left">
                        <span className="text-gray-400 text-[10px]">Saska AI</span>
                        <span className={`font-bold ${state.saskaAdaptation === 'Deload' ? 'text-yellow-400' : 'text-white'}`}>
                            {state.saskaAdaptation === 'None' ? 'Active' : state.saskaAdaptation}
                        </span>
                    </div>
                </button>
            </div>
            
            {/* Alerts */}
            {state.injuryRisk === 'High' && (
                <div className="hidden md:flex items-center gap-1 text-red-400 text-[10px] font-bold animate-pulse px-2">
                    <AlertTriangle size={12} /> High Injury Risk
                </div>
            )}
        </div>
    );
};

export default GlobalStatusBar;
