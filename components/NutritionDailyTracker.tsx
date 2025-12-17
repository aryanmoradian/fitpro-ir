
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, NutritionDayLog, MealLog, NutritionPlan, LogIngredient, AppView } from '../types';
import { getNutritionLogByDate, saveNutritionLog, createLogFromPlan, updateLogTotals, getNutritionLogs } from '../services/nutritionLoggingService';
import { 
    Calendar, CheckCircle2, Circle, ChevronLeft, ChevronRight, Droplets, 
    Edit2, Plus, Save, X, History, BarChart2, AlertCircle, Check, Camera 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface NutritionDailyTrackerProps {
    profile: UserProfile;
    updateProfile: (p: UserProfile) => void;
    setCurrentView?: (view: AppView) => void;
}

const MealCard: React.FC<{ 
    meal: MealLog; 
    onUpdate: (updates: Partial<MealLog>) => void; 
}> = ({ meal, onUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleStatus = () => {
        const newStatus = meal.status === 'Completed' ? 'Planned' : 'Completed';
        onUpdate({ status: newStatus });
    };

    const calories = meal.status === 'Completed' && meal.actualMacros.calories > 0 
        ? meal.actualMacros.calories 
        : meal.plannedMacros.calories;

    return (
        <div className={`bg-[#1E293B] rounded-xl border transition-all overflow-hidden ${meal.status === 'Completed' ? 'border-[#4A5D23] shadow-md bg-[#232923]' : 'border-gray-700'}`}>
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/20" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(); }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${meal.status === 'Completed' ? 'bg-[#D4FF00] border-[#D4FF00]' : 'border-gray-500 hover:border-[#D4FF00]'}`}
                    >
                        {meal.status === 'Completed' && <Check size={14} className="text-black font-bold"/>}
                    </button>
                    <div>
                        <h4 className={`font-bold ${meal.status === 'Completed' ? 'text-[#D4FF00]' : 'text-white'}`}>{meal.title}</h4>
                        <div className="flex gap-2 text-xs text-gray-400">
                            <span>{calories} کالری</span>
                            <span className="text-blue-300">P: {meal.plannedMacros.protein}g</span>
                        </div>
                    </div>
                </div>
                <div className="text-xs text-gray-500">{isExpanded ? 'بستن' : 'جزئیات'}</div>
            </div>

            {isExpanded && (
                <div className="p-4 bg-black/30 border-t border-gray-700 text-sm space-y-2">
                    <div className="space-y-1">
                        {meal.ingredients.map(ing => (
                            <div key={ing.id} className="flex justify-between items-center text-gray-300">
                                <span>{ing.name}</span>
                                <span className="text-gray-500 text-xs">{ing.plannedAmount} {ing.unit}</span>
                            </div>
                        ))}
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                        <button className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg flex items-center">
                            <Camera size={12} className="ml-1"/> اسکن عکس
                        </button>
                        <button className="text-xs text-blue-400 hover:underline flex items-center">
                            <Edit2 size={12} className="ml-1"/> ویرایش مقادیر
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const NutritionDailyTracker: React.FC<NutritionDailyTrackerProps> = ({ profile, updateProfile, setCurrentView }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentLog, setCurrentLog] = useState<NutritionDayLog | null>(null);
    
    const activePlan = profile.savedNutritionPlans?.find(p => p.id === profile.activeNutritionPlanId) || profile.savedNutritionPlans?.[0];

    useEffect(() => {
        const load = async () => {
            let log = await getNutritionLogByDate(profile.id, selectedDate);
            if (!log && activePlan) {
                log = createLogFromPlan(profile.id, selectedDate, activePlan);
            }
            setCurrentLog(log);
        };
        load();
    }, [selectedDate, activePlan, profile.id]);

    const handleMealUpdate = (mealId: string, updates: Partial<MealLog>) => {
        if (!currentLog) return;
        const updatedMeals = currentLog.meals.map(m => 
            m.id === mealId ? { ...m, ...updates } : m
        );
        const updatedLog = updateLogTotals({ ...currentLog, meals: updatedMeals });
        setCurrentLog(updatedLog);
        saveNutritionLog(updatedLog);
        
        // Sync to Profile
        const allLogs = profile.nutritionLogs || [];
        const idx = allLogs.findIndex(l => l.id === updatedLog.id);
        let newLogs;
        if (idx >= 0) {
            newLogs = [...allLogs];
            newLogs[idx] = updatedLog;
        } else {
            newLogs = [...allLogs, updatedLog];
        }
        updateProfile({ ...profile, nutritionLogs: newLogs });
    };

    const shiftDate = (days: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    if (!currentLog) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <AlertCircle size={48} className="mb-4 opacity-20"/>
                <p>هیچ برنامه غذایی فعالی یافت نشد.</p>
                <p className="text-xs mt-2">لطفا ابتدا یک برنامه تغذیه ایجاد و فعال کنید.</p>
            </div>
        );
    }

    const targetCals = currentLog.totalTargetMacros.calories || 2500;
    const consumedCals = currentLog.totalConsumedMacros.calories;
    
    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in" dir="rtl">
            {/* Header / Nav */}
            <div className="flex justify-between items-center bg-[#1E293B] p-2 rounded-xl border border-gray-700">
                <div className="flex items-center gap-2">
                    <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-white/10 rounded-full text-gray-400"><ChevronRight/></button>
                    <div className="text-center px-2">
                        <div className="font-bold text-white">{selectedDate === new Date().toISOString().split('T')[0] ? 'امروز' : new Date(selectedDate).toLocaleDateString('fa-IR')}</div>
                    </div>
                    <button onClick={() => shiftDate(1)} className="p-2 hover:bg-white/10 rounded-full text-gray-400"><ChevronLeft/></button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="energetic-card p-4 flex items-center justify-between">
                <div>
                    <span className="text-xs text-gray-400 block mb-1">آب مصرفی</span>
                    <div className="text-3xl font-black text-cyan-400">{currentLog.waterIntake} <span className="text-sm font-normal text-gray-500">لیوان</span></div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => {
                            const newVal = Math.max(0, currentLog.waterIntake - 1);
                            setCurrentLog({ ...currentLog, waterIntake: newVal });
                            saveNutritionLog({ ...currentLog, waterIntake: newVal });
                        }}
                        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-bold flex items-center justify-center"
                    >-</button>
                    <button 
                        onClick={() => {
                            const newVal = currentLog.waterIntake + 1;
                            setCurrentLog({ ...currentLog, waterIntake: newVal });
                            saveNutritionLog({ ...currentLog, waterIntake: newVal });
                        }}
                        className="w-10 h-10 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold flex items-center justify-center shadow-lg"
                    ><Plus size={20}/></button>
                </div>
            </div>

            {/* Meals List */}
            <div className="space-y-4">
                {currentLog.meals.map(meal => (
                    <MealCard 
                        key={meal.id} 
                        meal={meal} 
                        onUpdate={(updates) => handleMealUpdate(meal.id, updates)} 
                    />
                ))}
            </div>

            {/* Floating Scan Button */}
            <div className="fixed bottom-24 left-6 z-40">
                <button 
                    onClick={() => setCurrentView && setCurrentView('MEAL_SCAN' as any)}
                    className="w-14 h-14 bg-[#D4FF00] rounded-full flex items-center justify-center text-black shadow-2xl hover:scale-110 transition border-2 border-black"
                    title="اسکن سریع غذا"
                >
                    <Camera size={24} />
                </button>
            </div>
        </div>
    );
};

export default NutritionDailyTracker;
