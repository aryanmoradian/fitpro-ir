
import React, { useState, useEffect } from 'react';
import { DesignerProgram, ProgramDay, ProgramExercise, ProgramSet, UserProfile } from '../types';
import { EXERCISE_DB } from '../services/exerciseDatabase';
import { saveProgram, getSavedPrograms, createEmptyProgram, deleteProgram } from '../services/programService';
import ExercisePicker from './ExercisePicker';
import { 
    Calendar, Save, Plus, Trash2, Edit2, MoveUp, MoveDown, 
    ChevronDown, ChevronUp, Clock, Grid, List, X, Layout
} from 'lucide-react';

interface TrainingProgramDesignerProps {
    profile: UserProfile;
    updateProfile: (p: UserProfile) => void;
    onExit: () => void;
}

const TrainingProgramDesigner: React.FC<TrainingProgramDesignerProps> = ({ profile, updateProfile, onExit }) => {
    // --- STATE ---
    const [view, setView] = useState<'library' | 'editor'>('library');
    const [programs, setPrograms] = useState<DesignerProgram[]>([]);
    const [activeProgram, setActiveProgram] = useState<DesignerProgram | null>(null);
    
    // Editor State
    const [activeWeekIndex, setActiveWeekIndex] = useState(0);
    const [activeDayIndex, setActiveDayIndex] = useState(0);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // --- INITIAL LOAD ---
    useEffect(() => {
        getSavedPrograms().then(setPrograms);
    }, []);

    // --- AUTO SAVE ---
    useEffect(() => {
        if (!activeProgram) return;
        const timer = setInterval(() => {
            handleSave(true); // Silent save
        }, 20000);
        return () => clearInterval(timer);
    }, [activeProgram]);

    // --- ACTIONS ---

    const handleCreateNew = () => {
        const newProg = createEmptyProgram(profile.id);
        // Add default day 1
        newProg.weeks[0].days.push({
            id: `day_${Date.now()}`,
            dayNumber: 1,
            title: 'روز ۱',
            focus: 'فول بادی',
            exercises: [],
            isRestDay: false
        });
        setActiveProgram(newProg);
        setView('editor');
    };

    const handleLoad = (prog: DesignerProgram) => {
        setActiveProgram(JSON.parse(JSON.stringify(prog))); // Deep copy
        setView('editor');
    };

    const handleDelete = async (id: string) => {
        if (confirm("آیا مطمئن هستید که می‌خواهید این برنامه را حذف کنید؟")) {
            await deleteProgram(id);
            setPrograms(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleSave = async (silent = false) => {
        if (!activeProgram) return;
        const updated = { ...activeProgram, updatedAt: new Date().toISOString() };
        await saveProgram(updated);
        setLastSaved(new Date());
        if (!silent) {
            setPrograms(prev => {
                const idx = prev.findIndex(p => p.id === updated.id);
                if (idx >= 0) return prev.map(p => p.id === updated.id ? updated : p);
                return [...prev, updated];
            });
        }
    };

    // --- EDITOR LOGIC ---

    const getActiveDay = () => activeProgram?.weeks[activeWeekIndex]?.days[activeDayIndex];

    const addDay = () => {
        if (!activeProgram) return;
        const currentWeek = activeProgram.weeks[activeWeekIndex];
        const newDay: ProgramDay = {
            id: `day_${Date.now()}`,
            dayNumber: currentWeek.days.length + 1,
            title: `روز ${currentWeek.days.length + 1}`,
            focus: 'عمومی',
            exercises: [],
            isRestDay: false
        };
        const updatedWeeks = [...activeProgram.weeks];
        updatedWeeks[activeWeekIndex].days.push(newDay);
        setActiveProgram({ ...activeProgram, weeks: updatedWeeks });
        setActiveDayIndex(updatedWeeks[activeWeekIndex].days.length - 1);
    };

    const removeDay = (dayIndex: number) => {
        if (!activeProgram) return;
        if (confirm("این روز حذف شود؟")) {
            const updatedWeeks = [...activeProgram.weeks];
            updatedWeeks[activeWeekIndex].days.splice(dayIndex, 1);
            // Re-index days
            updatedWeeks[activeWeekIndex].days.forEach((d, i) => d.dayNumber = i + 1);
            setActiveProgram({ ...activeProgram, weeks: updatedWeeks });
            setActiveDayIndex(Math.max(0, dayIndex - 1));
        }
    };

    const updateDayMeta = (field: keyof ProgramDay, value: any) => {
        if (!activeProgram) return;
        const updatedWeeks = [...activeProgram.weeks];
        updatedWeeks[activeWeekIndex].days[activeDayIndex] = {
            ...updatedWeeks[activeWeekIndex].days[activeDayIndex],
            [field]: value
        };
        setActiveProgram({ ...activeProgram, weeks: updatedWeeks });
    };

    const addExercise = (exerciseId: string) => {
        if (!activeProgram) return;
        const exDef = EXERCISE_DB.find(e => e.id === exerciseId);
        if (!exDef) return;

        const newExercise: ProgramExercise = {
            id: `ex_${Date.now()}`,
            exerciseDefId: exDef.id,
            name: exDef.name_en, // Or name_fa depending on preference
            muscle: exDef.muscle,
            order: getActiveDay()!.exercises.length + 1,
            sets: [
                { id: `set_${Date.now()}_1`, type: 'Working', reps: '10', weight: 0, restSeconds: 60 },
                { id: `set_${Date.now()}_2`, type: 'Working', reps: '10', weight: 0, restSeconds: 60 },
                { id: `set_${Date.now()}_3`, type: 'Working', reps: '10', weight: 0, restSeconds: 60 },
            ]
        };

        const updatedWeeks = [...activeProgram.weeks];
        updatedWeeks[activeWeekIndex].days[activeDayIndex].exercises.push(newExercise);
        setActiveProgram({ ...activeProgram, weeks: updatedWeeks });
        setIsPickerOpen(false);
    };

    const updateExerciseSet = (exerciseIndex: number, setIndex: number, field: keyof ProgramSet, value: any) => {
        if (!activeProgram) return;
        const updatedWeeks = [...activeProgram.weeks];
        const day = updatedWeeks[activeWeekIndex].days[activeDayIndex];
        const exercise = day.exercises[exerciseIndex];
        exercise.sets[setIndex] = { ...exercise.sets[setIndex], [field]: value };
        setActiveProgram({ ...activeProgram, weeks: updatedWeeks });
    };

    const addSet = (exerciseIndex: number) => {
        if (!activeProgram) return;
        const updatedWeeks = [...activeProgram.weeks];
        const day = updatedWeeks[activeWeekIndex].days[activeDayIndex];
        const lastSet = day.exercises[exerciseIndex].sets[day.exercises[exerciseIndex].sets.length - 1];
        const newSet: ProgramSet = { ...lastSet, id: `set_${Date.now()}` };
        day.exercises[exerciseIndex].sets.push(newSet);
        setActiveProgram({ ...activeProgram, weeks: updatedWeeks });
    };

    const removeSet = (exerciseIndex: number, setIndex: number) => {
        if (!activeProgram) return;
        const updatedWeeks = [...activeProgram.weeks];
        const day = updatedWeeks[activeWeekIndex].days[activeDayIndex];
        if (day.exercises[exerciseIndex].sets.length > 1) {
            day.exercises[exerciseIndex].sets.splice(setIndex, 1);
            setActiveProgram({ ...activeProgram, weeks: updatedWeeks });
        }
    };

    const removeExercise = (exerciseIndex: number) => {
        if (!activeProgram) return;
        const updatedWeeks = [...activeProgram.weeks];
        updatedWeeks[activeWeekIndex].days[activeDayIndex].exercises.splice(exerciseIndex, 1);
        setActiveProgram({ ...activeProgram, weeks: updatedWeeks });
    };

    const moveExercise = (index: number, direction: 'up' | 'down') => {
        if (!activeProgram) return;
        const updatedWeeks = [...activeProgram.weeks];
        const exercises = updatedWeeks[activeWeekIndex].days[activeDayIndex].exercises;
        if (direction === 'up' && index > 0) {
            [exercises[index], exercises[index-1]] = [exercises[index-1], exercises[index]];
        } else if (direction === 'down' && index < exercises.length - 1) {
            [exercises[index], exercises[index+1]] = [exercises[index+1], exercises[index]];
        }
        setActiveProgram({ ...activeProgram, weeks: updatedWeeks });
    };

    // --- RENDERERS ---

    if (view === 'library') {
        return (
            <div className="h-full flex flex-col animate-in fade-in" dir="rtl">
                <div className="flex justify-between items-center mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
                    <div>
                        <h2 className="text-2xl font-black text-white">طراح برنامه تمرینی</h2>
                        <p className="text-sm text-gray-400">مدیریت، ویرایش و ساخت برنامه‌های تخصصی</p>
                    </div>
                    <button onClick={handleCreateNew} className="btn-primary px-6 py-3 rounded-xl font-bold flex items-center shadow-lg">
                        <Plus size={18} className="ml-2"/> برنامه جدید
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar p-1">
                    {programs.map(prog => (
                        <div key={prog.id} className="bg-[#1E293B] border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition group relative overflow-hidden">
                            <div className="absolute top-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => handleDelete(prog.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={18}/></button>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{prog.title}</h3>
                            <div className="flex gap-2 text-xs text-gray-400 mb-4">
                                <span className="bg-black/30 px-2 py-1 rounded">{prog.durationWeeks} هفته</span>
                                <span className="bg-black/30 px-2 py-1 rounded">{prog.difficulty}</span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-6">{prog.description || 'بدون توضیحات'}</p>
                            <div className="flex items-center justify-between text-xs text-gray-600 mt-auto">
                                <span>ویرایش: {new Date(prog.updatedAt).toLocaleDateString('fa-IR')}</span>
                                <button onClick={() => handleLoad(prog)} className="text-blue-400 font-bold hover:underline flex items-center">
                                    ویرایش <Edit2 size={12} className="mr-1"/>
                                </button>
                            </div>
                        </div>
                    ))}
                    {programs.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 border-2 border-dashed border-gray-700 rounded-2xl">
                            <Layout size={48} className="mb-4 opacity-20"/>
                            <p>هیچ برنامه‌ای ذخیره نشده است.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // EDITOR VIEW
    const activeDay = getActiveDay();

    return (
        <div className="h-full flex flex-col bg-[#0F172A] -m-4 md:-m-6 relative" dir="rtl">
            {/* Header Toolbar */}
            <div className="bg-[#1E293B] border-b border-gray-700 p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => { handleSave(); setView('library'); }} className="text-gray-400 hover:text-white flex items-center text-sm">
                        <Grid size={16} className="ml-1"/> کتابخانه
                    </button>
                    <div className="h-6 w-px bg-gray-700"></div>
                    <input 
                        value={activeProgram?.title} 
                        onChange={e => setActiveProgram(activeProgram ? { ...activeProgram, title: e.target.value } : null)}
                        className="bg-transparent text-white font-bold text-lg border-b border-transparent hover:border-gray-500 focus:border-blue-500 outline-none w-64 transition"
                        placeholder="عنوان برنامه"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 hidden md:block">
                        {lastSaved ? `ذخیره شده در ${lastSaved.toLocaleTimeString('fa-IR')}` : 'ذخیره نشده'}
                    </span>
                    <button onClick={() => handleSave()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center shadow-lg">
                        <Save size={16} className="ml-2"/> ذخیره
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: Structure */}
                <div className="w-20 md:w-64 bg-[#1E293B] border-l border-gray-700 flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-700 font-bold text-gray-400 text-xs uppercase tracking-wider flex justify-between">
                        <span className="hidden md:inline">ساختار برنامه</span>
                        <List size={16}/>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {activeProgram?.weeks.map((week, wIdx) => (
                            <div key={week.id}>
                                <div 
                                    className={`p-3 text-xs font-bold bg-black/20 text-gray-400 border-b border-gray-700 cursor-pointer hover:text-white ${activeWeekIndex === wIdx ? 'text-blue-400' : ''}`}
                                    onClick={() => { setActiveWeekIndex(wIdx); setActiveDayIndex(0); }}
                                >
                                    هفته {week.weekNumber}
                                </div>
                                {activeWeekIndex === wIdx && (
                                    <div className="space-y-1 p-2">
                                        {week.days.map((day, dIdx) => (
                                            <button 
                                                key={day.id}
                                                onClick={() => setActiveDayIndex(dIdx)}
                                                className={`w-full text-right px-3 py-2 rounded-lg text-sm transition flex justify-between items-center group ${activeDayIndex === dIdx ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                                            >
                                                <span className="truncate">{day.title}</span>
                                                <div onClick={(e) => { e.stopPropagation(); removeDay(dIdx); }} className="opacity-0 group-hover:opacity-100 hover:text-red-300 p-1">
                                                    <Trash2 size={12}/>
                                                </div>
                                            </button>
                                        ))}
                                        <button onClick={addDay} className="w-full text-center py-2 text-xs text-gray-500 hover:text-blue-400 border border-dashed border-gray-700 rounded-lg hover:border-blue-500/50 mt-2">
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
                            <div className="flex items-center gap-4 mb-8 bg-[#1E293B] p-4 rounded-xl border border-gray-700">
                                <div className="bg-blue-900/20 p-3 rounded-lg text-blue-400">
                                    <Calendar size={24}/>
                                </div>
                                <div className="flex-1">
                                    <input 
                                        value={activeDay.title} 
                                        onChange={e => updateDayMeta('title', e.target.value)}
                                        className="bg-transparent text-xl font-black text-white w-full outline-none placeholder-gray-600"
                                        placeholder="عنوان روز (مثلا: روز پا)"
                                    />
                                    <input 
                                        value={activeDay.focus} 
                                        onChange={e => updateDayMeta('focus', e.target.value)}
                                        className="bg-transparent text-sm text-gray-400 w-full outline-none mt-1"
                                        placeholder="تمرکز (مثلا: هایپرتروفی)"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400 flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={activeDay.isRestDay} 
                                            onChange={e => updateDayMeta('isRestDay', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-600 bg-gray-700"
                                        />
                                        روز استراحت
                                    </label>
                                </div>
                            </div>

                            {/* Exercises */}
                            {!activeDay.isRestDay && (
                                <div className="space-y-4">
                                    {activeDay.exercises.map((ex, idx) => (
                                        <div key={ex.id} className="bg-[#1E293B] border border-gray-700 rounded-xl overflow-hidden group hover:border-gray-500 transition">
                                            {/* Ex Header */}
                                            <div className="bg-black/20 p-3 flex justify-between items-center border-b border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col gap-0.5">
                                                        <button onClick={() => moveExercise(idx, 'up')} disabled={idx === 0} className="text-gray-600 hover:text-white disabled:opacity-30"><ChevronUp size={14}/></button>
                                                        <button onClick={() => moveExercise(idx, 'down')} disabled={idx === activeDay.exercises.length - 1} className="text-gray-600 hover:text-white disabled:opacity-30"><ChevronDown size={14}/></button>
                                                    </div>
                                                    <span className="font-bold text-white">{idx + 1}. {ex.name}</span>
                                                    <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{ex.muscle}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => removeExercise(idx)} className="p-1.5 hover:bg-red-900/30 text-gray-500 hover:text-red-400 rounded transition"><Trash2 size={16}/></button>
                                                </div>
                                            </div>

                                            {/* Ex Body */}
                                            <div className="p-4">
                                                <div className="grid grid-cols-10 gap-2 mb-2 text-[10px] text-gray-500 uppercase tracking-wider font-bold text-center">
                                                    <div className="col-span-1">ست</div>
                                                    <div className="col-span-3">تکرار</div>
                                                    <div className="col-span-2">وزنه (kg)</div>
                                                    <div className="col-span-2">استراحت (s)</div>
                                                    <div className="col-span-1">RPE</div>
                                                    <div className="col-span-1"></div>
                                                </div>
                                                <div className="space-y-2">
                                                    {ex.sets.map((set, sIdx) => (
                                                        <div key={set.id} className="grid grid-cols-10 gap-2 items-center">
                                                            <div className="col-span-1 flex justify-center">
                                                                <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold">{sIdx + 1}</div>
                                                            </div>
                                                            <div className="col-span-3">
                                                                <input 
                                                                    value={set.reps}
                                                                    onChange={e => updateExerciseSet(idx, sIdx, 'reps', e.target.value)}
                                                                    className="w-full bg-black/30 border border-gray-600 rounded text-center text-white text-sm py-1 focus:border-blue-500 outline-none"
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <input 
                                                                    type="number"
                                                                    value={set.weight || ''}
                                                                    placeholder="-"
                                                                    onChange={e => updateExerciseSet(idx, sIdx, 'weight', +e.target.value)}
                                                                    className="w-full bg-black/30 border border-gray-600 rounded text-center text-white text-sm py-1 focus:border-blue-500 outline-none"
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <input 
                                                                    type="number"
                                                                    value={set.restSeconds}
                                                                    onChange={e => updateExerciseSet(idx, sIdx, 'restSeconds', +e.target.value)}
                                                                    className="w-full bg-black/30 border border-gray-600 rounded text-center text-white text-sm py-1 focus:border-blue-500 outline-none"
                                                                />
                                                            </div>
                                                            <div className="col-span-1">
                                                                <input 
                                                                    type="number"
                                                                    value={set.rpe || ''}
                                                                    placeholder="-"
                                                                    max={10}
                                                                    onChange={e => updateExerciseSet(idx, sIdx, 'rpe', +e.target.value)}
                                                                    className="w-full bg-black/30 border border-gray-600 rounded text-center text-white text-sm py-1 focus:border-blue-500 outline-none"
                                                                />
                                                            </div>
                                                            <div className="col-span-1 flex justify-center">
                                                                <button onClick={() => removeSet(idx, sIdx)} className="text-gray-600 hover:text-red-400"><X size={14}/></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={() => addSet(idx)} className="mt-3 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center justify-center w-full py-1 border border-dashed border-blue-500/30 rounded hover:bg-blue-500/10 transition">
                                                    + افزودن ست
                                                </button>
                                                <div className="mt-3 pt-3 border-t border-gray-700">
                                                    <input 
                                                        placeholder="یادداشت (تمپو، نکات اجرایی...)" 
                                                        value={ex.notes || ''}
                                                        onChange={e => {
                                                            if (!activeProgram) return;
                                                            const updatedWeeks = [...activeProgram.weeks];
                                                            updatedWeeks[activeWeekIndex].days[activeDayIndex].exercises[idx].notes = e.target.value;
                                                            setActiveProgram({ ...activeProgram, weeks: updatedWeeks });
                                                        }}
                                                        className="w-full bg-transparent text-xs text-gray-400 placeholder-gray-600 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button 
                                        onClick={() => setIsPickerOpen(true)} 
                                        className="w-full py-6 rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-500 hover:bg-blue-900/10 text-gray-400 hover:text-blue-400 font-bold transition flex flex-col items-center justify-center gap-2"
                                    >
                                        <Plus size={32}/>
                                        <span>افزودن حرکت</span>
                                    </button>
                                </div>
                            )}
                            
                            {activeDay.isRestDay && (
                                <div className="text-center py-20 bg-[#1E293B] rounded-xl border border-gray-700">
                                    <div className="inline-block p-4 bg-gray-800 rounded-full mb-4">
                                        <Clock size={48} className="text-gray-500"/>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">روز استراحت</h3>
                                    <p className="text-gray-400 mt-2">روی ریکاوری، تغذیه و خواب تمرکز کنید.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            یک روز را برای ویرایش انتخاب کنید
                        </div>
                    )}
                </div>
            </div>

            {/* Exercise Modal */}
            <ExercisePicker 
                isOpen={isPickerOpen} 
                onClose={() => setIsPickerOpen(false)} 
                onSelect={addExercise} 
            />
        </div>
    );
};

export default TrainingProgramDesigner;
