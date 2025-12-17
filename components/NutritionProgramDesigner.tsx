
import React, { useState, useEffect } from 'react';
import { UserProfile, NutritionPlan, DietPhase, DietDay, DietMeal, MealIngredient } from '../types';
import { getUserNutritionPlans, saveNutritionPlan, createEmptyPlan, createEmptyDay, calculateMealMacros, calculateDayMacros, deleteNutritionPlan } from '../services/nutritionPlanService';
import { createCustomFood } from '../services/nutritionDatabase';
import FoodPicker from './FoodPicker';
import { 
    Utensils, Plus, Save, Trash2, Edit2, Copy, Calendar, ChevronRight, ChevronLeft, 
    PieChart, Clock, MoreVertical, X, Check, ArrowRight
} from 'lucide-react';

interface NutritionProgramDesignerProps {
    profile: UserProfile;
    updateProfile: (p: UserProfile) => void;
    onExit?: () => void;
}

const NutritionProgramDesigner: React.FC<NutritionProgramDesignerProps> = ({ profile, updateProfile, onExit }) => {
    // --- STATE ---
    const [view, setView] = useState<'library' | 'designer'>('library');
    const [plans, setPlans] = useState<NutritionPlan[]>([]);
    const [activePlan, setActivePlan] = useState<NutritionPlan | null>(null);
    
    // Designer State
    const [activePhaseIndex, setActivePhaseIndex] = useState(0);
    const [activeDayIndex, setActiveDayIndex] = useState(0);
    const [isFoodPickerOpen, setIsFoodPickerOpen] = useState(false);
    const [targetMealId, setTargetMealId] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        setPlans(getUserNutritionPlans(profile.id));
    }, [profile.id]);

    // Autosave
    useEffect(() => {
        if (activePlan) {
            const timer = setTimeout(() => {
                const updated = { ...activePlan, updatedAt: new Date().toISOString() };
                saveNutritionPlan(updated);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [activePlan]);

    // --- ACTIONS ---

    const handleCreatePlan = () => {
        const newPlan = createEmptyPlan(profile.id);
        setActivePlan(newPlan);
        setView('designer');
    };

    const handleLoadPlan = (plan: NutritionPlan) => {
        setActivePlan(JSON.parse(JSON.stringify(plan))); // Deep copy
        setView('designer');
    };

    const handleDeletePlan = (id: string) => {
        if(confirm("آیا از حذف این برنامه مطمئن هستید؟")) {
            deleteNutritionPlan(id);
            setPlans(prev => prev.filter(p => p.id !== id));
        }
    };

    // --- DESIGNER LOGIC ---

    const getActivePhase = () => activePlan?.phases[activePhaseIndex];
    const getActiveDay = () => getActivePhase()?.days[activeDayIndex];

    const addDay = () => {
        if (!activePlan) return;
        const phase = activePlan.phases[activePhaseIndex];
        const newDay = createEmptyDay(phase.days.length + 1);
        
        const updatedPhases = [...activePlan.phases];
        updatedPhases[activePhaseIndex].days.push(newDay);
        setActivePlan({ ...activePlan, phases: updatedPhases });
        setActiveDayIndex(updatedPhases[activePhaseIndex].days.length - 1);
    };

    const addMeal = (type: DietMeal['type']) => {
        if (!activePlan) return;
        const day = getActiveDay();
        if (!day) return;

        const newMeal: DietMeal = {
            id: `meal_${Date.now()}`,
            type,
            title: type === 'Breakfast' ? 'صبحانه' : type === 'Lunch' ? 'ناهار' : type === 'Dinner' ? 'شام' : type === 'Snack' ? 'میان وعده' : 'تغذیه تمرین',
            ingredients: [],
            totalMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 }
        };

        const updatedPhases = [...activePlan.phases];
        updatedPhases[activePhaseIndex].days[activeDayIndex].meals.push(newMeal);
        setActivePlan({ ...activePlan, phases: updatedPhases });
    };

    const handleAddIngredient = (food: any, amount: number) => {
        if (!activePlan || !targetMealId) return;
        
        const ratio = amount / (food.unit.includes('g') || food.defaultPortion > 20 ? food.defaultPortion : 1); 
        // Logic fix: defaultPortion based ratio if unit is ambiguous, usually just linear
        const scale = amount / food.defaultPortion;

        const ingredient: MealIngredient = {
            id: `ing_${Date.now()}`,
            foodId: food.id,
            name: food.name,
            amount: amount,
            unit: food.unit,
            macros: {
                calories: Math.round(food.calories * scale),
                protein: Math.round(food.protein * scale),
                carbs: Math.round(food.carbs * scale),
                fats: Math.round(food.fats * scale),
            }
        };

        const updatedPhases = [...activePlan.phases];
        const day = updatedPhases[activePhaseIndex].days[activeDayIndex];
        const mealIndex = day.meals.findIndex(m => m.id === targetMealId);
        
        if (mealIndex >= 0) {
            day.meals[mealIndex].ingredients.push(ingredient);
            day.meals[mealIndex] = calculateMealMacros(day.meals[mealIndex]);
        }

        setActivePlan({ ...activePlan, phases: updatedPhases });
    };

    const removeIngredient = (mealId: string, ingredientId: string) => {
        if (!activePlan) return;
        const updatedPhases = [...activePlan.phases];
        const day = updatedPhases[activePhaseIndex].days[activeDayIndex];
        const mealIndex = day.meals.findIndex(m => m.id === mealId);
        
        if (mealIndex >= 0) {
            day.meals[mealIndex].ingredients = day.meals[mealIndex].ingredients.filter(i => i.id !== ingredientId);
            day.meals[mealIndex] = calculateMealMacros(day.meals[mealIndex]);
            setActivePlan({ ...activePlan, phases: updatedPhases });
        }
    };

    const removeMeal = (mealId: string) => {
        if (!activePlan) return;
        const updatedPhases = [...activePlan.phases];
        updatedPhases[activePhaseIndex].days[activeDayIndex].meals = updatedPhases[activePhaseIndex].days[activeDayIndex].meals.filter(m => m.id !== mealId);
        setActivePlan({ ...activePlan, phases: updatedPhases });
    };

    // --- RENDER ---

    if (view === 'library') {
        return (
            <div className="h-full flex flex-col animate-in fade-in space-y-6" dir="rtl">
                <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <Utensils className="text-green-400"/> برنامه‌های تغذیه
                        </h2>
                        <p className="text-sm text-gray-400">مدیریت و طراحی رژیم‌های غذایی</p>
                    </div>
                    <button onClick={handleCreatePlan} className="btn-primary px-6 py-3 rounded-xl font-bold flex items-center shadow-lg">
                        <Plus size={18} className="ml-2"/> برنامه جدید
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar p-1">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-[#1E293B] border border-gray-700 rounded-2xl p-6 hover:border-green-500/50 transition group relative overflow-hidden">
                            <div className="absolute top-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => handleDeletePlan(plan.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={18}/></button>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                            <div className="flex gap-2 text-xs text-gray-400 mb-4">
                                <span className="bg-black/30 px-2 py-1 rounded">{plan.goal}</span>
                                <span className="bg-black/30 px-2 py-1 rounded">{plan.phases.length} فاز</span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-6">آخرین بروزرسانی: {new Date(plan.updatedAt).toLocaleDateString('fa-IR')}</p>
                            <button onClick={() => handleLoadPlan(plan)} className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold flex items-center justify-center transition">
                                ورود به طراحی <ChevronLeft size={14} className="mr-2"/>
                            </button>
                        </div>
                    ))}
                    {plans.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 border-2 border-dashed border-gray-700 rounded-2xl">
                            <Utensils size={48} className="mb-4 opacity-20"/>
                            <p>هیچ برنامه‌ای یافت نشد.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const activeDay = getActiveDay();
    const dayMacros = activeDay ? calculateDayMacros(activeDay) : { calories: 0, protein: 0, carbs: 0, fats: 0 };

    return (
        <div className="h-full flex flex-col bg-[#0F172A] -m-4 md:-m-6 relative" dir="rtl">
            {/* Header */}
            <div className="bg-[#1E293B] border-b border-gray-700 p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => { saveNutritionPlan(activePlan!); setView('library'); }} className="text-gray-400 hover:text-white flex items-center text-sm">
                        <ChevronRight size={16} className="ml-1"/> کتابخانه
                    </button>
                    <div className="h-6 w-px bg-gray-700"></div>
                    <input 
                        value={activePlan?.title} 
                        onChange={e => setActivePlan(activePlan ? { ...activePlan, title: e.target.value } : null)}
                        className="bg-transparent text-white font-bold text-lg border-b border-transparent hover:border-gray-500 focus:border-green-500 outline-none w-64 transition"
                    />
                </div>
                <div className="flex items-center gap-4">
                    {/* Macro Bar (Mini) */}
                    <div className="hidden md:flex gap-4 text-xs font-mono bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                        <span className="text-orange-400">{dayMacros.calories} kcal</span>
                        <span className="text-blue-400">P:{dayMacros.protein}g</span>
                        <span className="text-green-400">C:{dayMacros.carbs}g</span>
                        <span className="text-yellow-400">F:{dayMacros.fats}g</span>
                    </div>
                    <button onClick={() => saveNutritionPlan(activePlan!)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center shadow-lg">
                        <Save size={16} className="ml-2"/> ذخیره
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-20 md:w-64 bg-[#1E293B] border-l border-gray-700 flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-700 font-bold text-gray-400 text-xs uppercase tracking-wider">تایم‌لاین</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {activePlan?.phases.map((phase, pIdx) => (
                            <div key={phase.id}>
                                <div 
                                    className={`p-3 text-xs font-bold bg-black/20 text-gray-400 border-b border-gray-700 cursor-pointer hover:text-white ${activePhaseIndex === pIdx ? 'text-green-400' : ''}`}
                                    onClick={() => { setActivePhaseIndex(pIdx); setActiveDayIndex(0); }}
                                >
                                    {phase.title}
                                </div>
                                {activePhaseIndex === pIdx && (
                                    <div className="space-y-1 p-2">
                                        {phase.days.map((day, dIdx) => (
                                            <button 
                                                key={day.id}
                                                onClick={() => setActiveDayIndex(dIdx)}
                                                className={`w-full text-right px-3 py-2 rounded-lg text-sm transition flex justify-between items-center group ${activeDayIndex === dIdx ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                                            >
                                                <span className="truncate">{day.title}</span>
                                            </button>
                                        ))}
                                        <button onClick={addDay} className="w-full text-center py-2 text-xs text-gray-500 hover:text-green-400 border border-dashed border-gray-700 rounded-lg hover:border-green-500/50 mt-2">
                                            + افزودن روز
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Canvas */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0F172A] p-4 md:p-8">
                    {activeDay ? (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {/* Day Header */}
                            <div className="bg-[#1E293B] p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                <input 
                                    value={activeDay.title} 
                                    onChange={e => {
                                        const updated = [...activePlan!.phases];
                                        updated[activePhaseIndex].days[activeDayIndex].title = e.target.value;
                                        setActivePlan({...activePlan!, phases: updated});
                                    }}
                                    className="bg-transparent text-xl font-black text-white outline-none w-full"
                                />
                                <div className="flex gap-2">
                                    {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                                        <button key={type} onClick={() => addMeal(type as any)} className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded transition">
                                            + {type === 'Breakfast' ? 'صبحانه' : type === 'Lunch' ? 'ناهار' : type === 'Dinner' ? 'شام' : 'میان وعده'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Meals */}
                            <div className="space-y-4">
                                {activeDay.meals.map((meal) => (
                                    <div key={meal.id} className="bg-[#1E293B] border border-gray-700 rounded-xl overflow-hidden group hover:border-gray-500 transition">
                                        <div className="bg-black/20 p-3 flex justify-between items-center border-b border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-sm">{meal.title}</span>
                                                <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{meal.totalMacros.calories} kcal</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => { setTargetMealId(meal.id); setIsFoodPickerOpen(true); }}
                                                    className="p-1.5 bg-green-600/20 text-green-400 rounded hover:bg-green-600 hover:text-white transition"
                                                >
                                                    <Plus size={14}/>
                                                </button>
                                                <button onClick={() => removeMeal(meal.id)} className="p-1.5 text-gray-600 hover:text-red-400 rounded transition">
                                                    <Trash2 size={14}/>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-3 space-y-1">
                                            {meal.ingredients.length === 0 && <p className="text-xs text-gray-500 text-center py-2">خالی</p>}
                                            {meal.ingredients.map(ing => (
                                                <div key={ing.id} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded group/item">
                                                    <div>
                                                        <span className="text-gray-200">{ing.name}</span>
                                                        <span className="text-gray-500 mr-2">({ing.amount} {ing.unit})</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex gap-2 text-[10px] text-gray-500 font-mono">
                                                            <span className="text-blue-300">P:{ing.macros.protein}</span>
                                                            <span className="text-green-300">C:{ing.macros.carbs}</span>
                                                            <span className="text-yellow-300">F:{ing.macros.fats}</span>
                                                        </div>
                                                        <button onClick={() => removeIngredient(meal.id, ing.id)} className="opacity-0 group-hover/item:opacity-100 text-red-400">
                                                            <X size={12}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">یک روز را انتخاب کنید</div>
                    )}
                </div>
            </div>

            {/* Food Picker Modal */}
            <FoodPicker 
                isOpen={isFoodPickerOpen} 
                onClose={() => setIsFoodPickerOpen(false)} 
                onSelect={handleAddIngredient}
                customFoods={profile.customFoods}
                profile={profile}
                updateProfile={updateProfile}
            />
        </div>
    );
};

export default NutritionProgramDesigner;
