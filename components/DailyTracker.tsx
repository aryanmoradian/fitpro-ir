import React, { useState, useMemo, useEffect } from 'react';
import { NutritionItem, DailyLog, Exercise, UserProfile, AppView, Supplement } from '../types';
import { 
  CheckCircle2, Circle, Trophy, Flame, Droplets, Moon, Activity, 
  Smile, Frown, Meh, Zap, Battery, ChevronRight, Utensils, 
  Dumbbell, PlayCircle, Plus, AlertTriangle, Pill, Clock, ArrowRight, Star,
  Award
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { getDailySupplementStatus, toggleSupplementLog } from '../services/supplementService';

interface DailyTrackerProps {
  nutritionPlan: NutritionItem[];
  setNutritionPlan: React.Dispatch<React.SetStateAction<NutritionItem[]>>;
  workoutPlan: Exercise[];
  addLog: (log: Partial<DailyLog>) => void;
  profile: UserProfile;
  updateProfile: (p: UserProfile) => void;
  logs: DailyLog[];
  setCurrentView?: (view: AppView) => void;
}

// --- WIDGET: ACHIEVEMENT BADGE (New) ---
const AchievementBadge: React.FC<{ recordName: string, value: number }> = ({ recordName, value }) => (
    <div className="absolute -top-3 -right-3 animate-in fade-in slide-in-from-bottom-2 zoom-in">
        <div className="bg-yellow-500 text-black px-3 py-1 rounded-full flex items-center shadow-lg border-2 border-white/20">
            <Award size={14} className="mr-1" />
            <span className="text-[10px] font-bold">New PR: {value}kg</span>
        </div>
    </div>
);

// --- WIDGET: BIO-READINESS (Health Integration) ---
const BioReadinessCard: React.FC<{ 
    log: Partial<DailyLog>; 
    profile: UserProfile;
    onUpdate: (data: Partial<DailyLog>) => void; 
}> = ({ log, profile, onUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(!log.sleepHours); // Auto expand if not logged
    
    // Injury Check
    const activeInjuries = profile.healthProfile?.injuryLog.filter(i => i.status === 'Active') || [];
    const hasInjury = activeInjuries.length > 0;

    return (
        <div className={`energetic-card p-0 overflow-hidden border-l-4 ${hasInjury ? 'border-l-red-500' : 'border-l-green-500'}`}>
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-900/20 p-2 rounded-lg text-indigo-400">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">آمادگی زیستی</h3>
                        <p className="text-[10px] text-gray-400">
                            {log.sleepHours ? 'اطلاعات ثبت شده' : 'نیازمند چک‌اپ صبحگاهی'}
                        </p>
                    </div>
                </div>
                {isExpanded ? <ChevronRight className="rotate-90 text-gray-500" size={16}/> : <ChevronRight className="text-gray-500" size={16}/>}
            </div>

            {isExpanded && (
                <div className="p-4 bg-black/20 border-t border-white/5 space-y-4 animate-in fade-in">
                    {/* Sliders */}
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span className="flex items-center gap-1"><Moon size={12}/> خواب (ساعت)</span>
                                <span className="font-bold text-indigo-300">{log.sleepHours || 7}h</span>
                            </div>
                            <input 
                                type="range" min="3" max="12" step="0.5"
                                value={log.sleepHours || 7}
                                onChange={(e) => onUpdate({ sleepHours: +e.target.value })}
                                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span className="flex items-center gap-1"><Battery size={12}/> سطح انرژی</span>
                                <span className="font-bold text-yellow-300">{log.energyLevel || 5}/10</span>
                            </div>
                            <input 
                                type="range" min="1" max="10"
                                value={log.energyLevel || 5}
                                onChange={(e) => onUpdate({ energyLevel: +e.target.value })}
                                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span className="flex items-center gap-1"><Smile size={12}/> حال روحی</span>
                                <span className="font-bold text-green-300 capitalize">{log.mood || 'Neutral'}</span>
                            </div>
                            <div className="flex justify-between gap-1">
                                {['stressed', 'tired', 'neutral', 'energetic', 'happy'].map(m => (
                                    <button 
                                        key={m}
                                        onClick={() => onUpdate({ mood: m as any })}
                                        className={`p-1.5 rounded-lg transition ${log.mood === m ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}
                                    >
                                        {m === 'happy' ? <Smile size={14}/> : m === 'stressed' ? <Frown size={14}/> : <Meh size={14}/>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Injury Alert */}
                    {hasInjury && (
                        <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-xs text-red-200">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5"/>
                            <div>
                                <span className="font-bold block mb-1">هشدار آسیب فعال:</span>
                                {activeInjuries.map(i => i.title).join(', ')} - لطفاً فشار تمرین را تنظیم کنید.
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- WIDGET: WORKOUT OF THE DAY (Training Integration) ---
const TrainingSmartCard: React.FC<{
    workoutPlan: Exercise[];
    log: Partial<DailyLog>;
    onNavigate: () => void;
    onUpdate: (data: Partial<DailyLog>) => void;
}> = ({ workoutPlan, log, onNavigate, onUpdate }) => {
    const isCompleted = (log.workoutScore || 0) >= 100;
    const muscleFocus = workoutPlan.length > 0 ? workoutPlan[0].muscleGroup : 'General';
    
    // Updated Logic: Calculate Volume & Duration for Summary
    const totalVolume = workoutPlan.reduce((acc, ex) => acc + (ex.sets * 10 * 20), 0); // Mock Calc: Sets * Reps * Weight(Avg 20)
    const totalDuration = workoutPlan.reduce((acc, ex) => acc + (ex.sets * 3), 0); // Mock: 3 min per set

    return (
        <div className={`energetic-card p-4 relative overflow-hidden group ${isCompleted ? 'border-green-500/50' : 'border-blue-500/30'}`}>
            <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-600' : 'bg-blue-600'}`}>
                        <Dumbbell className="text-white" size={20}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">
                            {isCompleted ? 'تمرین تکمیل شد' : workoutPlan.length > 0 ? `تمرین ${muscleFocus}` : 'روز استراحت / بدون برنامه'}
                        </h3>
                        {!isCompleted ? (
                            <p className="text-[10px] text-gray-400">
                                {workoutPlan.length > 0 ? `${workoutPlan.length} حرکت • ~${totalDuration} دقیقه` : 'برای دریافت برنامه به بخش مربی بروید.'}
                            </p>
                        ) : (
                            <div className="flex gap-3 mt-1 text-[10px] text-gray-300">
                                <span className="bg-black/20 px-1.5 py-0.5 rounded">{totalDuration} min</span>
                                <span className="bg-black/20 px-1.5 py-0.5 rounded">{(totalVolume/1000).toFixed(1)}k Vol</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {!isCompleted && workoutPlan.length > 0 && (
                    <button 
                        onClick={onNavigate}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-full font-bold flex items-center shadow-lg shadow-blue-900/40 animate-pulse"
                    >
                        <PlayCircle size={14} className="mr-1"/> شروع
                    </button>
                )}
                {isCompleted && (
                    <div className="bg-green-900/30 text-green-400 p-1 rounded-full"><CheckCircle2 size={20}/></div>
                )}
            </div>

            {/* Post-Workout Feedback */}
            {isCompleted && (
                <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400">فشار تمرین (RPE)</span>
                        <span className="text-xs font-bold text-yellow-400">{log.fatigueLevel || 5}/10</span>
                    </div>
                    <input 
                        type="range" min="1" max="10"
                        value={log.fatigueLevel || 5}
                        onChange={(e) => onUpdate({ fatigueLevel: +e.target.value })}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                </div>
            )}
        </div>
    );
};

// --- WIDGET: FUEL & MACROS (Nutrition Integration) ---
const NutritionSmartCard: React.FC<{
    log: Partial<DailyLog>;
    nutritionPlan: NutritionItem[];
    onQuickAdd: (type: 'water' | 'snack') => void;
    onNavigate: () => void;
}> = ({ log, nutritionPlan, onQuickAdd, onNavigate }) => {
    const targetCals = log.totalTargetMacros?.calories || 2500;
    const consumedCals = log.consumedMacros?.calories || 0;
    const progress = Math.min(100, Math.round((consumedCals / targetCals) * 100));
    
    // Circular Data
    const data = [{ name: 'val', value: progress, fill: progress > 100 ? '#ef4444' : '#10b981' }];

    return (
        <div className="energetic-card p-4 flex flex-col justify-between relative overflow-hidden h-full">
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-900/20 p-1.5 rounded-lg text-orange-400"><Utensils size={16}/></div>
                    <h3 className="font-bold text-white text-sm">سوخت و تغذیه</h3>
                </div>
                <button onClick={onNavigate} className="text-gray-500 hover:text-white"><ArrowRight size={16}/></button>
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={6} data={data} startAngle={90} endAngle={-270}>
                            <RadialBar background dataKey="value" cornerRadius={10} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <span className="absolute text-[10px] font-bold text-white">{progress}%</span>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">مصرف شده</span>
                        <span className="text-white font-mono">{consumedCals}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">هدف</span>
                        <span className="text-gray-500 font-mono">{targetCals}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 relative z-10">
                <button onClick={() => onQuickAdd('water')} className="bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/20 text-cyan-300 text-[10px] py-2 rounded-lg flex items-center justify-center transition">
                    <Droplets size={12} className="mr-1"/> +۱ آب
                </button>
                <button onClick={() => onQuickAdd('snack')} className="bg-orange-900/20 hover:bg-orange-900/40 border border-orange-500/20 text-orange-300 text-[10px] py-2 rounded-lg flex items-center justify-center transition">
                    <Plus size={12} className="mr-1"/> +میان‌وعده
                </button>
            </div>
        </div>
    );
};

// --- WIDGET: SUPPLEMENT STACK (Time-Block View + Inventory) ---
const SupplementStackCard: React.FC<{
    profile: UserProfile;
    updateProfile: (p: UserProfile) => void;
    onNavigate: () => void;
}> = ({ profile, updateProfile, onNavigate }) => {
    const [timeBlock, setTimeBlock] = useState<'Morning' | 'Workout' | 'Night'>('Morning');
    const today = new Date().toLocaleDateString('fa-IR');

    // Get Active Supplements for current block
    const activeSupps = useMemo(() => {
        const allActive = profile.supplements?.filter(s => s.isActive) || [];
        return allActive.filter(s => {
            if (timeBlock === 'Morning') return s.timing.includes('Morning') || s.timing.includes('With Meal');
            if (timeBlock === 'Workout') return s.timing.some(t => t.includes('Workout'));
            if (timeBlock === 'Night') return s.timing.includes('Before Bed') || s.timing.includes('With Meal');
            return false;
        });
    }, [profile.supplements, timeBlock]);

    const handleToggle = (supp: Supplement) => {
        const updated = toggleSupplementLog(profile, supp, today);
        updateProfile(updated);
    };

    return (
        <div className="energetic-card p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <Pill className="text-purple-400" size={16}/>
                    <h3 className="font-bold text-white text-sm">استک مکمل‌ها</h3>
                </div>
                <button onClick={onNavigate} className="text-xs text-blue-400 hover:underline">مدیریت</button>
            </div>

            {/* Time Tabs */}
            <div className="flex bg-black/30 p-1 rounded-lg mb-3">
                {['Morning', 'Workout', 'Night'].map((t: any) => (
                    <button 
                        key={t}
                        onClick={() => setTimeBlock(t)}
                        className={`flex-1 text-[10px] py-1 rounded transition ${timeBlock === t ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {t === 'Morning' ? 'صبح' : t === 'Workout' ? 'تمرین' : 'شب'}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar max-h-[120px]">
                {activeSupps.length === 0 ? (
                    <p className="text-center text-[10px] text-gray-500 py-4">مکملی برای این زمان تنظیم نشده.</p>
                ) : (
                    activeSupps.map(supp => {
                        const isDone = profile.supplementLogs?.some(l => l.supplementId === supp.id && l.date === today && l.consumed);
                        const isLowStock = (supp.stockRemaining || 0) < 5;

                        return (
                            <div key={supp.id} onClick={() => handleToggle(supp)} className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition relative overflow-hidden ${isDone ? 'bg-green-900/10 border-green-500/20' : isLowStock ? 'bg-black/20 border-yellow-500/30' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                                {isLowStock && <div className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-500/50"></div>}
                                
                                <span className={`text-xs ${isDone ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{supp.name}</span>
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isDone ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                                    {isDone && <CheckCircle2 size={10} className="text-white"/>}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// --- WIDGET: PR WATCH (Records Integration + Badge) ---
const PRWatchCard: React.FC<{ profile: UserProfile; workoutPlan: Exercise[] }> = ({ profile, workoutPlan }) => {
    // Check for today's PR achievement
    const today = new Date().toLocaleDateString('fa-IR');
    const newPR = profile.performanceProfile?.records.find(r => r.date === today && r.type === 'strength');

    // Find target
    const prTarget = useMemo(() => {
        if (workoutPlan.length === 0) return null;
        // Prioritize big 3
        const priority = ['Squat', 'Bench', 'Deadlift', 'Press'];
        for (const p of priority) {
            if (workoutPlan.some(ex => ex.name.includes(p))) {
                const record = profile.performanceProfile?.records
                    .filter(r => r.name.includes(p) && r.type === 'strength')
                    .sort((a,b) => b.calculatedResult - a.calculatedResult)[0];
                return { name: p, value: record ? record.calculatedResult : 0 };
            }
        }
        return null;
    }, [workoutPlan, profile.performanceProfile]);

    if (!prTarget && !newPR) return null;

    return (
        <div className={`relative p-3 rounded-xl flex items-center justify-between mb-4 ${newPR ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/50' : 'bg-yellow-900/10 border border-yellow-500/30'}`}>
            {newPR && <AchievementBadge recordName={newPR.name} value={newPR.calculatedResult} />}
            
            <div className="flex items-center gap-3">
                <Trophy className="text-yellow-400" size={20} />
                <div>
                    <h4 className="text-xs text-yellow-200 font-bold uppercase tracking-wider">{newPR ? 'رکورد جدید!' : 'هدف رکورد امروز'}</h4>
                    <p className="text-sm font-black text-white">
                        {newPR ? `${newPR.name}: ${newPR.calculatedResult} kg` : `${prTarget!.name}: ${prTarget!.value} kg`}
                    </p>
                </div>
            </div>
            {!newPR && <div className="text-[10px] text-yellow-500/80 bg-black/20 px-2 py-1 rounded">1RM فعلی</div>}
        </div>
    );
};

// --- MAIN COMPONENT: INTELLIGENT DAILY HUB ---

const DailyTracker: React.FC<DailyTrackerProps> = ({ 
  nutritionPlan, setNutritionPlan, workoutPlan, addLog, profile, updateProfile, logs, setCurrentView
}) => {
    const today = new Date().toLocaleDateString('fa-IR');
    const existingLog = logs.find(l => l.date === today) || { date: today };
    const [localLog, setLocalLog] = useState<Partial<DailyLog>>(existingLog);

    // --- 1. DAILY SCORE ALGORITHM ---
    const dailyScore = useMemo(() => {
        let score = 0;
        // Workout (40%)
        if (localLog.workoutScore && localLog.workoutScore >= 80) score += 40;
        else if (localLog.workoutScore && localLog.workoutScore > 0) score += 20;
        
        // Nutrition (30%)
        const nutTarget = localLog.totalTargetMacros?.calories || 2500;
        const nutConsumed = localLog.consumedMacros?.calories || 0;
        if (nutTarget > 0) {
            const ratio = nutConsumed / nutTarget;
            if (ratio >= 0.9 && ratio <= 1.1) score += 30;
            else if (ratio >= 0.7) score += 15;
        }

        // Supplements (10%) - Simple check if any taken
        const suppsTaken = profile.supplementLogs?.some(l => l.date === today && l.consumed);
        if (suppsTaken) score += 10;

        // Bio/Sleep (10%)
        if (localLog.sleepHours && localLog.sleepHours > 5) score += 10;

        // Morning Check-in (10%) - Implicitly done if sleep/mood logged
        if (localLog.mood) score += 10;

        return score;
    }, [localLog, profile.supplementLogs]);

    // Update Handler (Batched)
    const handleUpdateLog = (updates: Partial<DailyLog>) => {
        const newLog = { ...localLog, ...updates };
        setLocalLog(newLog);
        addLog(newLog); // Persist to App state
    };

    const handleQuickAddNutrition = (type: 'water' | 'snack') => {
        if (type === 'water') {
            const current = localLog.waterIntake || 0;
            handleUpdateLog({ waterIntake: current + 1 });
        } else {
            // Add a generic snack log - In real app, this would add a MealLog
            const currentCals = localLog.consumedMacros?.calories || 0;
            const updatedMacros = { 
                ...localLog.consumedMacros, 
                calories: currentCals + 200, 
                protein: (localLog.consumedMacros?.protein || 0) + 5,
                carbs: (localLog.consumedMacros?.carbs || 0) + 30
            };
            handleUpdateLog({ 
                consumedMacros: updatedMacros as any,
                nutritionScore: Math.min(100, (localLog.nutritionScore || 0) + 10) 
            });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in" dir="rtl">
            
            {/* 1. MASTER SCORE RING */}
            <div className="bg-gradient-to-r from-gray-900 via-blue-900/20 to-gray-900 p-6 rounded-3xl border border-blue-500/20 flex items-center justify-between relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-2xl font-black text-white mb-1">هاب فعالیت روزانه</h1>
                    <p className="text-sm text-gray-400">امروز {new Date().toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-bold uppercase">امتیاز روز</span>
                            <span className={`text-4xl font-black ${dailyScore >= 80 ? 'text-green-400' : dailyScore >= 50 ? 'text-yellow-400' : 'text-blue-400'}`}>
                                {dailyScore}
                            </span>
                        </div>
                        <div className="h-10 w-px bg-gray-700"></div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-bold uppercase">استریک</span>
                            <div className="flex items-center text-orange-400 gap-1">
                                <Flame size={20} fill="currentColor"/>
                                <span className="text-2xl font-bold">{localLog.workoutScore ? 1 : 0}</span> 
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Ring */}
                <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={[{ value: dailyScore }, { value: 100 - dailyScore }]} 
                                innerRadius={50} outerRadius={60} 
                                startAngle={90} endAngle={-270}
                                dataKey="value"
                            >
                                <Cell fill={dailyScore >= 80 ? '#22c55e' : '#3b82f6'} />
                                <Cell fill="#1f2937" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Star size={24} className={dailyScore >= 80 ? 'text-green-400 fill-green-400' : 'text-gray-600'} />
                    </div>
                </div>
            </div>

            {/* 2. PR WATCH ALERT */}
            <PRWatchCard profile={profile} workoutPlan={workoutPlan} />

            {/* 3. SMART FEED GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COL 1: Bio & Health */}
                <div className="space-y-6">
                    <BioReadinessCard 
                        log={localLog} 
                        profile={profile} 
                        onUpdate={handleUpdateLog} 
                    />
                    <SupplementStackCard 
                        profile={profile}
                        updateProfile={updateProfile}
                        onNavigate={() => setCurrentView && setCurrentView(AppView.SUPPLEMENT_MANAGER)}
                    />
                </div>

                {/* COL 2: Training (Center Stage) */}
                <div className="space-y-6">
                    <TrainingSmartCard 
                        workoutPlan={workoutPlan} 
                        log={localLog} 
                        onNavigate={() => setCurrentView && setCurrentView(AppView.TRAINING_CENTER)}
                        onUpdate={handleUpdateLog}
                    />
                    {/* Placeholder for Quick Log list if needed */}
                </div>

                {/* COL 3: Nutrition */}
                <div className="h-full">
                    <NutritionSmartCard 
                        log={localLog} 
                        nutritionPlan={nutritionPlan} 
                        onQuickAdd={handleQuickAddNutrition}
                        onNavigate={() => setCurrentView && setCurrentView(AppView.NUTRITION_CENTER)}
                    />
                </div>
            </div>

            {/* Legacy Fallback: Button to access full detailed logger if needed */}
            <div className="text-center pt-8 border-t border-gray-800">
                <button 
                    onClick={() => { /* Toggle expanded detail view logic if implemented */ alert("برای جزئیات بیشتر به ماژول مربوطه مراجعه کنید.") }}
                    className="text-gray-500 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto"
                >
                    <Plus size={14}/> ثبت جزئیات پیشرفته (Legacy Mode)
                </button>
            </div>
        </div>
    );
};

export default DailyTracker;