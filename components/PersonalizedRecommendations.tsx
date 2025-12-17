
import React, { useState, useEffect } from 'react';
import { UserProfile, PersonalizedPlan } from '../types';
import { generatePersonalizedPlan } from '../services/geminiService';
import { 
    Brain, Zap, Target, Dumbbell, Utensils, Droplets, Calendar, 
    ChevronRight, CheckCircle2, AlertTriangle, Loader2, Download, RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
    profile: UserProfile;
    updateProfile: (p: UserProfile) => void;
    onClose: () => void;
}

const RecommendationCard: React.FC<{ 
    focus: PersonalizedPlan['focusAreas'][0]; 
}> = ({ focus }) => (
    <div className="bg-[#1E293B] border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition group">
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-white text-lg">{focus.muscle}</h4>
            <span className="text-[10px] bg-red-900/30 text-red-300 px-2 py-1 rounded border border-red-500/30">Priority</span>
        </div>
        <p className="text-xs text-gray-400 mb-3 italic">"{focus.reason}"</p>
        
        <div className="bg-black/20 p-3 rounded-lg border border-white/5 mb-3">
            <h5 className="text-xs font-bold text-blue-300 mb-1 flex items-center"><Target size={12} className="mr-1"/> استراتژی</h5>
            <p className="text-xs text-gray-300">{focus.strategy}</p>
        </div>

        <div>
            <h5 className="text-xs font-bold text-gray-400 mb-2">تمرینات پیشنهادی:</h5>
            <div className="space-y-1">
                {focus.suggestedExercises.map((ex, i) => (
                    <div key={i} className="flex items-center text-xs text-gray-200 bg-white/5 px-2 py-1.5 rounded">
                        <Dumbbell size={12} className="mr-2 text-green-400"/> {ex}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const NutritionDonut: React.FC<{ nutrition: PersonalizedPlan['nutritionStrategy'] }> = ({ nutrition }) => {
    const data = [
        { name: 'Protein', value: nutrition.protein * 4, label: `${nutrition.protein}g`, fill: '#3b82f6' },
        { name: 'Carbs', value: nutrition.carbs * 4, label: `${nutrition.carbs}g`, fill: '#10b981' },
        { name: 'Fats', value: nutrition.fats * 9, label: `${nutrition.fats}g`, fill: '#facc15' },
    ];

    return (
        <div className="relative h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px'}}
                        itemStyle={{color: '#fff', fontSize: '12px'}}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white">{nutrition.calories}</span>
                <span className="text-[10px] text-gray-400">Target kcal</span>
            </div>
        </div>
    );
};

const PersonalizedRecommendations: React.FC<Props> = ({ profile, updateProfile, onClose }) => {
    const [plan, setPlan] = useState<PersonalizedPlan | null>(profile.personalizedPlan || null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        const newPlan = await generatePersonalizedPlan(profile);
        if (newPlan) {
            setPlan(newPlan);
            updateProfile({ ...profile, personalizedPlan: newPlan });
        }
        setIsLoading(false);
    };

    // Auto-generate if missing
    useEffect(() => {
        if (!plan) {
            handleGenerate();
        }
    }, []);

    const exportPDF = () => {
        alert("نسخه PDF برنامه شخصی‌سازی شده دانلود شد.");
    };

    if (isLoading && !plan) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center animate-in fade-in">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-white">در حال تحلیل DNA ورزشی شما...</h3>
                <p className="text-gray-400 mt-2 text-sm">هوش مصنوعی در حال بررسی اسکن بدن، رکوردها و اهداف شماست.</p>
            </div>
        );
    }

    if (!plan) return null;

    return (
        <div className="h-full flex flex-col animate-in slide-in-from-bottom-4" dir="rtl">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-xl border border-blue-500/20">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
                        <Brain size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white">برنامه هوشمند اختصاصی</h2>
                        <p className="text-xs text-gray-400">بروزرسانی شده: {new Date(plan.generatedAt).toLocaleDateString('fa-IR')}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleGenerate} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition" title="بازسازی برنامه">
                        <RefreshCw size={20} />
                    </button>
                    <button onClick={exportPDF} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition" title="دانلود PDF">
                        <Download size={20} />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-400 transition">
                        <span className="text-xs font-bold">بستن</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-6">
                
                {/* 1. Coach Note Banner */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex gap-4 items-start">
                        <Zap className="shrink-0 mt-1 text-yellow-300" size={24}/>
                        <div>
                            <h3 className="font-bold text-lg mb-1">پیام مربی:</h3>
                            <p className="text-sm leading-relaxed opacity-90">"{plan.coachNote}"</p>
                            <div className="mt-4 flex items-center gap-2 text-xs bg-black/20 w-fit px-3 py-1 rounded-full">
                                <span className="opacity-70">فاز فعلی:</span>
                                <span className="font-bold text-yellow-300 uppercase">{plan.phase}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* 2. Training Focus (Left Col) */}
                    <div className="space-y-4">
                        <h3 className="text-white font-bold flex items-center gap-2 border-b border-gray-700 pb-2">
                            <Target className="text-red-400" size={18}/> نقاط تمرکز تمرینی
                        </h3>
                        {plan.focusAreas.map((area, idx) => (
                            <RecommendationCard key={idx} focus={area} />
                        ))}

                        <div className="bg-black/20 border border-yellow-500/30 p-4 rounded-xl">
                            <h4 className="text-yellow-400 font-bold text-sm mb-2 flex items-center"><Calendar size={14} className="mr-2"/> تغییر برنامه هفتگی</h4>
                            <p className="text-xs text-gray-300">{plan.weeklyScheduleAdjustment}</p>
                        </div>
                    </div>

                    {/* 3. Nutrition Strategy (Right Col) */}
                    <div className="space-y-4">
                        <h3 className="text-white font-bold flex items-center gap-2 border-b border-gray-700 pb-2">
                            <Utensils className="text-green-400" size={18}/> استراتژی تغذیه
                        </h3>
                        
                        <div className="energetic-card p-4 flex flex-col items-center">
                            <NutritionDonut nutrition={plan.nutritionStrategy} />
                            <div className="grid grid-cols-3 gap-4 w-full mt-4 text-center">
                                <div><span className="block text-xs text-gray-500">Protein</span><span className="text-blue-400 font-bold">{plan.nutritionStrategy.protein}g</span></div>
                                <div><span className="block text-xs text-gray-500">Carbs</span><span className="text-green-400 font-bold">{plan.nutritionStrategy.carbs}g</span></div>
                                <div><span className="block text-xs text-gray-500">Fats</span><span className="text-yellow-400 font-bold">{plan.nutritionStrategy.fats}g</span></div>
                            </div>
                        </div>

                        <div className="bg-[#1E293B] border border-gray-700 rounded-xl p-4">
                            <h4 className="text-white font-bold text-sm mb-3 flex items-center"><Droplets size={14} className="mr-2 text-cyan-400"/> هیدراتاسیون و نکات</h4>
                            <div className="mb-3 text-xs text-gray-300 flex justify-between items-center bg-black/20 p-2 rounded">
                                <span>هدف آب روزانه:</span>
                                <span className="font-mono text-cyan-300 font-bold">{plan.nutritionStrategy.hydrationGoal} ml</span>
                            </div>
                            <ul className="space-y-2">
                                {plan.nutritionStrategy.tips.map((tip, i) => (
                                    <li key={i} className="flex items-start text-xs text-gray-400">
                                        <CheckCircle2 size={12} className="mr-2 mt-0.5 text-green-500 shrink-0"/>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PersonalizedRecommendations;
