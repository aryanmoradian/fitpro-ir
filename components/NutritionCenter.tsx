
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, DailyLog, AppView, DietAnalysis } from '../types';
import { analyzeNutritionQuality } from '../services/geminiService';
import NutritionProgramDesigner from './NutritionProgramDesigner';
import NutritionDailyTracker from './NutritionDailyTracker'; 
import NutritionAnalyticsWidget from './NutritionAnalyticsWidget'; 
import SupplementManager from './SupplementManager'; 
import { 
  Activity, CheckSquare, BarChart2, Layout, Filter, ShoppingBag, Pill, Zap, Brain, Flame
} from 'lucide-react';

interface NutritionCenterProps {
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  logs: DailyLog[];
  setCurrentView: (view: AppView) => void;
}

const NutritionStatusHeader: React.FC<{ logs: DailyLog[], profile: UserProfile }> = ({ logs, profile }) => {
    const today = new Date().toLocaleDateString('fa-IR');
    const todayLog = logs.find(l => l.date === today);
    const target = todayLog?.totalTargetMacros || { calories: 2500, protein: 180, carbs: 250, fats: 80 };
    const current = todayLog?.consumedMacros || { calories: 0, protein: 0, carbs: 0, fats: 0 }; // Legacy mapping fix
    
    // Normalize consumed data structure if needed
    const consumed = {
        calories: current.calories || 0,
        protein: current.protein || 0,
        carbs: current.carbs || 0,
        fats: current.fats || 0
    };

    const getPct = (val: number, goal: number) => Math.min(100, Math.round((val / (goal || 1)) * 100));

    return (
        <div className="energetic-card p-5 mb-4 bg-gradient-to-r from-gray-900 via-[#1a2e1a] to-gray-900 border-[#4A5D23]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* Calories Ring */}
                <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="36" stroke="#1f2937" strokeWidth="6" fill="transparent" />
                            <circle 
                                cx="40" cy="40" r="36" 
                                stroke="#f97316" 
                                strokeWidth="6" 
                                fill="transparent" 
                                strokeDasharray={226} 
                                strokeDashoffset={226 - (226 * getPct(consumed.calories, target.calories)) / 100} 
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-white font-black text-sm">{consumed.calories}</span>
                            <span className="text-[9px] text-gray-400">kcal</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">خلاصه تغذیه امروز</h3>
                        <p className="text-xs text-gray-400">هدف: {target.calories} کالری • {profile.goalType === 'fatLoss' ? 'کاهش چربی' : 'عضله سازی'}</p>
                    </div>
                </div>

                {/* Macro Bars */}
                <div className="flex-1 w-full grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] text-gray-300">
                            <span>Protein</span>
                            <span>{consumed.protein}/{target.protein}g</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{width: `${getPct(consumed.protein, target.protein)}%`}}></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] text-gray-300">
                            <span>Carbs</span>
                            <span>{consumed.carbs}/{target.carbs}g</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{width: `${getPct(consumed.carbs, target.carbs)}%`}}></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] text-gray-300">
                            <span>Fats</span>
                            <span>{consumed.fats}/{target.fats}g</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-yellow-500 h-full rounded-full" style={{width: `${getPct(consumed.fats, target.fats)}%`}}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NutritionCenter: React.FC<NutritionCenterProps> = ({ profile, updateProfile, logs, setCurrentView }) => {
    const [activeTab, setActiveTab] = useState<'tracker' | 'designer' | 'reports' | 'supplements' | 'settings'>('tracker');
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        const today = new Date().toLocaleDateString('fa-IR');
        const log = logs.find(l => l.date === today);
        if (log) {
            const result = await analyzeNutritionQuality(log, profile);
            if (result) setAiAdvice(result.aiFeedback);
        } else {
            setAiAdvice("برای تحلیل هوشمند، لطفا ابتدا وعده‌های غذایی امروز را ثبت کنید.");
        }
        setAnalyzing(false);
    };
    
    return (
        <div className="flex flex-col h-full space-y-4" dir="rtl">
            
            {/* AI Advisor Bar */}
            <div className="flex justify-between items-center bg-purple-900/20 border border-purple-500/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                    <Brain className="text-purple-400" size={18} />
                    <span className="text-sm font-bold text-white">مشاور تغذیه هوشمند</span>
                </div>
                <button 
                    onClick={handleAnalyze} 
                    disabled={analyzing}
                    className="flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition"
                >
                    {analyzing ? <span className="animate-pulse">در حال تحلیل...</span> : <><Zap size={12}/> تحلیل امروز</>}
                </button>
            </div>

            {aiAdvice && (
                <div className="bg-black/40 border border-purple-500/20 p-4 rounded-xl text-sm text-gray-300 leading-relaxed animate-in fade-in">
                    {aiAdvice}
                </div>
            )}

            <NutritionStatusHeader logs={logs} profile={profile} />

            {/* Top Nav */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 shrink-0 overflow-x-auto w-fit mx-auto md:mx-0">
                {[
                    { id: 'tracker', icon: CheckSquare, label: 'ثبت وعده‌ها' },
                    { id: 'designer', icon: Layout, label: 'برنامه غذایی' },
                    { id: 'supplements', icon: Pill, label: 'مدیریت مکمل' },
                    { id: 'reports', icon: BarChart2, label: 'گزارشات' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`px-6 py-2 rounded-lg font-bold flex items-center justify-center transition-all whitespace-nowrap text-sm ${activeTab === tab.id ? 'bg-[#D4FF00] text-black shadow-[0_0_10px_rgba(212,255,0,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <tab.icon className="w-4 h-4 ml-2" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                
                {/* 1. TRACKER (Default) */}
                {activeTab === 'tracker' && (
                    <NutritionDailyTracker profile={profile} updateProfile={updateProfile} />
                )}

                {/* 2. ANALYTICS & REPORTS */}
                {activeTab === 'reports' && (
                    <NutritionAnalyticsWidget logs={profile.nutritionLogs || []} />
                )}

                {/* 3. DESIGNER */}
                {activeTab === 'designer' && (
                    <NutritionProgramDesigner 
                        profile={profile} 
                        updateProfile={updateProfile} 
                        onExit={() => setActiveTab('tracker')} 
                    />
                )}

                {/* 4. SUPPLEMENTS (Inline Module) */}
                {activeTab === 'supplements' && (
                    <SupplementManager 
                        profile={profile}
                        updateProfile={updateProfile}
                    />
                )}
            </div>
        </div>
    );
};

export default NutritionCenter;
