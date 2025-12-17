
import React, { useState, useMemo, useEffect } from 'react';
import { generateWorkoutJSON, generateNutritionJSON } from '../services/geminiService';
import { NutritionItem, Exercise, WeeklyWorkoutPlan, WeeklyNutritionPlan, UserProfile, TrainingSession, DailyMealPlan, MealEntry, DailyLog } from '../types';
import { Sparkles, Plus, Trash2, Dumbbell, Utensils, Clock, Repeat, Wrench, Bot, Calendar, Save, Loader2, Activity, Zap, Flame, ChevronLeft, ChevronRight, CheckCircle2, Circle, Archive } from 'lucide-react';
import { LevelInfo } from '../services/levelCalculator';

interface PlanManagerProps {
  nutritionPlan: NutritionItem[];
  setNutritionPlan: React.Dispatch<React.SetStateAction<NutritionItem[]>>;
  workoutPlan: Exercise[];
  setWorkoutPlan: React.Dispatch<React.SetStateAction<Exercise[]>>;
  weeklyWorkoutPlan?: WeeklyWorkoutPlan;
  setWeeklyWorkoutPlan?: React.Dispatch<React.SetStateAction<WeeklyWorkoutPlan>>;
  weeklyNutritionPlan?: WeeklyNutritionPlan;
  setWeeklyNutritionPlan?: React.Dispatch<React.SetStateAction<WeeklyNutritionPlan>>;
  profile?: UserProfile;
  updateProfile?: (profile: UserProfile) => void;
  athleteLevelInfo: LevelInfo;
  logs: DailyLog[];
  addLog: (log: Partial<DailyLog>) => void;
}

// --- NEW WIDGET: HISTORY TRACKER ---
const HistoryTrackerWidget: React.FC<{ 
    logs: DailyLog[]; 
    onLogToday: (completed: boolean, notes: string) => void;
    currentWorkoutPlan: Exercise[];
}> = ({ logs, onLogToday, currentWorkoutPlan }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'calendar' | 'log'>('calendar');
    const [todayNotes, setTodayNotes] = useState('');
    const [exerciseChecks, setExerciseChecks] = useState<Record<string, boolean>>({});

    // Calendar Generation
    const calendarDays = useMemo(() => {
        const days = [];
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Pad start
        for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
        // Days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    }, [selectedDate]);

    // Helpers
    const getLogForDate = (date: Date) => {
        const dateStr = date.toLocaleDateString('fa-IR');
        return logs.find(l => l.date === dateStr);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() && 
               date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
    };

    const handleSaveLog = () => {
        const completedCount = Object.values(exerciseChecks).filter(Boolean).length;
        const totalCount = currentWorkoutPlan.length;
        const isComplete = totalCount > 0 && completedCount === totalCount;
        
        onLogToday(isComplete, todayNotes);
        alert("گزارش امروز ثبت شد!");
        setViewMode('calendar');
    };

    // Stats
    const currentMonthName = selectedDate.toLocaleDateString('fa-IR', { month: 'long' });
    const logsThisMonth = logs.filter(l => {
        // Rough filter for Persian locale string match or ISO
        return l.date.includes(selectedDate.toLocaleDateString('fa-IR').split('/')[1]); 
    });
    const completedWorkouts = logsThisMonth.filter(l => l.workoutScore > 50).length;

    return (
        <div className="h-full flex flex-col bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden relative">
            {/* Header / Stats */}
            <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-white flex items-center gap-2"><Calendar className="text-blue-400" size={18}/> تاریخچه و گزارشات</h3>
                    <p className="text-[10px] text-gray-400 mt-1">مدیریت روند اجرای برنامه</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400">تمرینات ماه جاری</div>
                    <div className="text-xl font-black text-green-400">{completedWorkouts} <span className="text-xs text-gray-500 font-normal">جلسه</span></div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {viewMode === 'calendar' ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="p-1 hover:bg-white/10 rounded"><ChevronRight/></button>
                            <span className="font-bold text-white">{currentMonthName} {selectedDate.getFullYear()}</span>
                            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="p-1 hover:bg-white/10 rounded"><ChevronLeft/></button>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2 text-center mb-2">
                            {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(d => <span key={d} className="text-xs text-gray-500">{d}</span>)}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((date, i) => {
                                if (!date) return <div key={i}></div>;
                                const log = getLogForDate(date);
                                const today = isToday(date);
                                let bg = 'bg-gray-800';
                                if (log) {
                                    bg = log.workoutScore > 80 ? 'bg-green-600' : log.workoutScore > 0 ? 'bg-yellow-600' : 'bg-red-900/50';
                                } else if (today) {
                                    bg = 'bg-blue-600/20 border border-blue-500';
                                }

                                return (
                                    <div 
                                        key={i}
                                        onClick={() => today ? setViewMode('log') : null}
                                        className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition relative ${bg}`}
                                    >
                                        <span className={`text-xs font-bold ${today ? 'text-blue-400' : 'text-white'}`}>{date.getDate()}</span>
                                        {log && <div className="w-1.5 h-1.5 rounded-full bg-white mt-1"></div>}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/5">
                            <h4 className="text-sm font-bold text-gray-300 mb-2">راهنما</h4>
                            <div className="flex gap-4 text-[10px] text-gray-400">
                                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-600 mr-1"></div> تکمیل شده</span>
                                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-yellow-600 mr-1"></div> ناقص</span>
                                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div> امروز</span>
                            </div>
                        </div>
                        
                        <button onClick={() => setViewMode('log')} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg transition">
                            ثبت گزارش امروز
                        </button>
                    </>
                ) : (
                    <div className="animate-in fade-in">
                        <button onClick={() => setViewMode('calendar')} className="mb-4 text-xs text-gray-400 hover:text-white flex items-center">
                            <ChevronRight size={14}/> بازگشت به تقویم
                        </button>
                        
                        <h3 className="text-lg font-bold text-white mb-4">چک‌لیست تمرین امروز</h3>
                        
                        {currentWorkoutPlan.length === 0 ? (
                            <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-700 rounded-xl">
                                <Dumbbell size={32} className="mx-auto mb-2 opacity-30"/>
                                <p>برنامه‌ای برای امروز یافت نشد.</p>
                                <p className="text-xs mt-1">از پنل سمت راست برنامه تولید کنید.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 mb-6">
                                {currentWorkoutPlan.map((ex, idx) => (
                                    <div key={ex.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 cursor-pointer" onClick={() => setExerciseChecks({...exerciseChecks, [ex.id]: !exerciseChecks[ex.id]})}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${exerciseChecks[ex.id] ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                                {exerciseChecks[ex.id] && <CheckCircle2 size={14} className="text-white"/>}
                                            </div>
                                            <div>
                                                <span className={`text-sm font-bold block ${exerciseChecks[ex.id] ? 'text-gray-500 line-through' : 'text-white'}`}>{ex.name}</span>
                                                <span className="text-[10px] text-gray-500">{ex.sets} ست • {ex.reps} تکرار</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="text-xs text-gray-400 block mb-2">یادداشت روزانه</label>
                            <textarea 
                                value={todayNotes}
                                onChange={e => setTodayNotes(e.target.value)}
                                className="w-full bg-black/20 border border-gray-600 rounded-xl p-3 text-white text-sm resize-none h-24 focus:border-blue-500 outline-none"
                                placeholder="حس و حال تمرین، رکوردهای خاص..."
                            />
                        </div>

                        <button onClick={handleSaveLog} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center">
                            <Save size={18} className="ml-2"/> ذخیره گزارش
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- PLAN MANAGER MAIN COMPONENT ---

const PlanManager: React.FC<PlanManagerProps> = ({ 
  nutritionPlan, 
  setNutritionPlan, 
  workoutPlan, 
  setWorkoutPlan,
  weeklyWorkoutPlan,
  setWeeklyWorkoutPlan,
  weeklyNutritionPlan,
  setWeeklyNutritionPlan,
  profile,
  updateProfile,
  athleteLevelInfo,
  logs,
  addLog
}) => {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetDay, setTargetDay] = useState<number>(1);

  // --- STATS CALCULATION ---
  const workoutStats = useMemo(() => {
    const safePlan = workoutPlan || [];
    const totalSets = safePlan.reduce((acc, ex) => acc + (ex.sets || 0), 0);
    const estimatedTime = Math.round((totalSets * 2) + (totalSets * 1.5)); 
    const muscles = Array.from(new Set(safePlan.map(ex => ex.muscleGroup).filter(Boolean)));
    return { totalSets, estimatedTime, muscles };
  }, [workoutPlan]);

  const nutritionStats = useMemo(() => {
    const safePlan = nutritionPlan || [];
    const total = safePlan.reduce((acc, item) => ({
        calories: acc.calories + (item.macros?.calories || 0),
        protein: acc.protein + (item.macros?.protein || 0),
        carbs: acc.carbs + (item.macros?.carbs || 0),
        fats: acc.fats + (item.macros?.fats || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    return total;
  }, [nutritionPlan]);

  const handleGenerate = async () => {
    if (!goal) return;
    setIsGenerating(true);
    try {
        if (activeTab === 'workout') {
          const exercises = await generateWorkoutJSON(goal, athleteLevelInfo.status);
          setWorkoutPlan(exercises || []);
        } else {
          const meals = await generateNutritionJSON(goal, athleteLevelInfo.status);
          setNutritionPlan(meals || []);
        }
    } catch (e) {
        console.error("Generation failed", e);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleArchiveProgram = () => {
      if(!workoutPlan.length && !nutritionPlan.length) return;
      // In real app, save to profile.archivedPrograms
      alert("برنامه فعلی با موفقیت آرشیو شد.");
  };

  const handleLogToday = (completed: boolean, notes: string) => {
      const today = new Date().toLocaleDateString('fa-IR');
      addLog({
          date: today,
          workoutScore: completed ? 100 : 50,
          notes: notes,
          detailedWorkout: workoutPlan.map(ex => ({
              exerciseId: ex.id,
              name: ex.name,
              sets: Array.from({length: ex.sets}).map((_, i) => ({
                  setNumber: i+1,
                  targetReps: ex.reps,
                  targetWeight: 0,
                  completed: completed // Bulk complete for this simplified widget
              }))
          }))
      });
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in" dir="rtl">
      
      {/* Saska Programmer (AI Mode) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-hidden">
        
        {/* Left: AI Generator */}
        <div className="energetic-card p-6 flex flex-col h-full shadow-lg overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center text-white">
              <Sparkles className="w-6 h-6 text-yellow-400 ml-2" />
              تولید هوشمند (Ai)
            </h2>
            <p className="text-gray-400 text-sm">
              طراحی برنامه اختصاصی بر اساس سطح <span className="font-bold text-blue-300">{athleteLevelInfo.status}</span>.
            </p>
          </div>

          <div className="flex space-x-4 space-x-reverse mb-6">
            <button 
              onClick={() => setActiveTab('workout')}
              className={`flex-1 py-3 rounded-lg font-bold transition flex items-center justify-center ${activeTab === 'workout' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              <Dumbbell className="w-5 h-5 ml-2" /> تمرین
            </button>
            <button 
              onClick={() => setActiveTab('nutrition')}
              className={`flex-1 py-3 rounded-lg font-bold transition flex items-center justify-center ${activeTab === 'nutrition' ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              <Utensils className="w-5 h-5 ml-2" /> تغذیه
            </button>
          </div>

          <textarea
            className="w-full input-styled p-4 text-white resize-none h-32 mb-4"
            placeholder={activeTab === 'workout' ? "مثلا: برنامه ۴ روزه برای افزایش حجم سینه و زیربغل..." : "مثلا: رژیم با پروتئین بالا و کربوهیدرات کم برای کاهش چربی..."}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !goal}
            className="w-full py-3 btn-primary flex items-center justify-center mb-6 shadow-lg shadow-green-900/20"
          >
            {isGenerating ? (
              <><Loader2 className="animate-spin ml-2" /> در حال طراحی...</>
            ) : (
              <><Sparkles className="w-4 h-4 ml-2" /> تولید برنامه {activeTab === 'workout' ? 'تمرینی' : 'تغذیه'}</>
            )}
          </button>
          
          {/* Stats Summary */}
          {((activeTab === 'workout' && (workoutPlan || []).length > 0) || (activeTab === 'nutrition' && (nutritionPlan || []).length > 0)) && (
              <div className="bg-black/30 border border-white/10 rounded-xl p-5 mb-4 animate-in fade-in">
                  <h3 className="font-bold text-white mb-3 flex items-center justify-between">
                      <div className="flex items-center"><Activity className="w-4 h-4 ml-2 text-blue-400" /> خلاصه برنامه</div>
                      <button onClick={handleArchiveProgram} className="text-xs text-gray-400 hover:text-white flex items-center"><Archive size={12} className="ml-1"/> آرشیو کردن</button>
                  </h3>
                  
                  {activeTab === 'workout' ? (
                      <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="bg-white/5 rounded p-2">
                              <span className="text-xs text-gray-400 block">حجم تمرین</span>
                              <span className="text-xl font-bold text-white">{workoutStats.totalSets} <span className="text-xs font-normal">ست</span></span>
                          </div>
                          <div className="bg-white/5 rounded p-2">
                              <span className="text-xs text-gray-400 block">زمان تخمینی</span>
                              <span className="text-xl font-bold text-white">{Math.round(workoutStats.estimatedTime)} <span className="text-xs font-normal">دقیقه</span></span>
                          </div>
                      </div>
                  ) : (
                      <div className="space-y-3">
                          <div className="flex justify-between items-end">
                              <span className="text-sm text-gray-400">کالری کل</span>
                              <span className="text-2xl font-bold text-white">{nutritionStats.calories}</span>
                          </div>
                          {/* Macro Bars */}
                          <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{width: '30%'}}></div>
                              <div className="bg-green-500 h-full" style={{width: '50%'}}></div>
                              <div className="bg-yellow-500 h-full" style={{width: '20%'}}></div>
                          </div>
                      </div>
                  )}
              </div>
          )}
        </div>

        {/* Right: History & Tracking Widget */}
        <div className="h-full">
            <HistoryTrackerWidget 
                logs={logs}
                onLogToday={handleLogToday}
                currentWorkoutPlan={workoutPlan}
            />
        </div>
      </div>
    </div>
  );
};

export default PlanManager;
