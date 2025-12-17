
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, TrainingLog, LogExercise, LogSet, LogStatus, DesignerProgram } from '../types';
import { getTrainingLogs, saveTrainingLog, createLogFromProgram, deleteTrainingLog } from '../services/loggingService';
import { processGlobalEvent } from '../services/globalDataCore'; // IMPORT
import { 
    Calendar, CheckCircle2, Circle, Clock, Save, Trash2, ChevronDown, 
    ChevronUp, Dumbbell, AlertCircle, Edit2, Plus, ArrowRight, ArrowLeft,
    Check, X, FileText, Activity
} from 'lucide-react';

interface TrainingLogWidgetProps {
    profile: UserProfile;
    updateProfile: (p: UserProfile) => void;
}

const LogStatusBadge: React.FC<{ status: LogStatus }> = ({ status }) => {
    const colors = {
        'Completed': 'bg-green-600 text-white',
        'Partial': 'bg-yellow-600 text-black',
        'Skipped': 'bg-red-600 text-white',
        'Rest': 'bg-blue-600 text-white',
        'Planned': 'bg-gray-600 text-gray-300'
    };
    const labels = {
        'Completed': 'تکمیل شده',
        'Partial': 'ناقص',
        'Skipped': 'انجام نشده',
        'Rest': 'استراحت',
        'Planned': 'برنامه‌ریزی شده'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[status]}`}>
            {labels[status]}
        </span>
    );
};

const SetRow: React.FC<{ 
    set: LogSet; 
    index: number; 
    onUpdate: (updates: Partial<LogSet>) => void; 
}> = ({ set, index, onUpdate }) => {
    return (
        <div className={`grid grid-cols-10 gap-2 items-center text-sm py-2 border-b border-gray-700/50 ${set.completed ? 'opacity-50' : ''}`}>
            <div className="col-span-1 text-center text-gray-500 font-mono">{index + 1}</div>
            
            {/* Target */}
            <div className="col-span-2 text-center text-gray-400 text-xs" dir="ltr">
                {set.targetWeight > 0 ? `${set.targetWeight}kg x ` : ''}{set.targetReps}
            </div>

            {/* Inputs */}
            <div className="col-span-2">
                <input 
                    type="number" 
                    placeholder="kg"
                    value={set.performedWeight || ''}
                    onChange={e => onUpdate({ performedWeight: Number(e.target.value) })}
                    className={`w-full bg-black/20 border border-gray-600 rounded p-1 text-center text-white focus:border-blue-500 outline-none ${set.completed ? 'text-green-400' : ''}`}
                />
            </div>
            <div className="col-span-2">
                <input 
                    type="number" 
                    placeholder="reps"
                    value={set.performedReps || ''}
                    onChange={e => onUpdate({ performedReps: Number(e.target.value) })}
                    className={`w-full bg-black/20 border border-gray-600 rounded p-1 text-center text-white focus:border-blue-500 outline-none ${set.completed ? 'text-green-400' : ''}`}
                />
            </div>
            <div className="col-span-1">
                <input 
                    type="number" 
                    placeholder="RPE"
                    max={10}
                    value={set.rpe || ''}
                    onChange={e => onUpdate({ rpe: Number(e.target.value) })}
                    className="w-full bg-black/20 border border-gray-600 rounded p-1 text-center text-gray-300 focus:border-blue-500 outline-none"
                />
            </div>

            {/* Checkbox */}
            <div className="col-span-2 flex justify-center">
                <button 
                    onClick={() => onUpdate({ completed: !set.completed })}
                    className={`p-1.5 rounded-lg transition ${set.completed ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                >
                    {set.completed ? <Check size={16}/> : <Check size={16} className="opacity-0"/>}
                </button>
            </div>
        </div>
    );
};

const ExerciseCard: React.FC<{ 
    exercise: LogExercise; 
    onUpdate: (updates: Partial<LogExercise>) => void; 
}> = ({ exercise, onUpdate }) => {
    
    const handleSetUpdate = (setId: string, updates: Partial<LogSet>) => {
        const updatedSets = exercise.sets.map(s => s.id === setId ? { ...s, ...updates } : s);
        const allDone = updatedSets.every(s => s.completed);
        onUpdate({ sets: updatedSets, completed: allDone });
    };

    return (
        <div className={`bg-[#1E293B] rounded-xl border transition-all overflow-hidden ${exercise.completed ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'border-gray-700'}`}>
            <div className="p-4 bg-black/20 flex justify-between items-center cursor-pointer" onClick={() => onUpdate({ completed: !exercise.completed })}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${exercise.completed ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/20 text-blue-400'}`}>
                        <Dumbbell size={20} />
                    </div>
                    <div>
                        <h4 className={`font-bold ${exercise.completed ? 'text-green-400' : 'text-white'}`}>{exercise.name}</h4>
                        {exercise.notes && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{exercise.notes}</p>}
                    </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${exercise.completed ? 'bg-green-600 border-green-600' : 'border-gray-500'}`}>
                    {exercise.completed && <Check size={14} className="text-white"/>}
                </div>
            </div>

            {/* Sets Header */}
            <div className="px-4 py-2 bg-black/40 grid grid-cols-10 gap-2 text-[10px] text-gray-500 uppercase font-bold text-center">
                <div className="col-span-1">ست</div>
                <div className="col-span-2">هدف</div>
                <div className="col-span-2">وزنه</div>
                <div className="col-span-2">تکرار</div>
                <div className="col-span-1">RPE</div>
                <div className="col-span-2">ثبت</div>
            </div>

            {/* Sets Body */}
            <div className="px-4 pb-2">
                {exercise.sets.map((set, idx) => (
                    <SetRow key={set.id} set={set} index={idx} onUpdate={(u) => handleSetUpdate(set.id, u)} />
                ))}
            </div>
        </div>
    );
};

const HistoryTimeline: React.FC<{ 
    logs: TrainingLog[]; 
    onSelectLog: (log: TrainingLog) => void; 
}> = ({ logs, onSelectLog }) => {
    // Group by month
    const grouped = useMemo(() => {
        const groups: Record<string, TrainingLog[]> = {};
        logs.forEach(log => {
            const month = log.date.substring(0, 7); // YYYY-MM
            if (!groups[month]) groups[month] = [];
            groups[month].push(log);
        });
        return Object.entries(groups).sort((a,b) => b[0].localeCompare(a[0]));
    }, [logs]);

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>تاریخچه‌ای موجود نیست.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in">
            {grouped.map(([month, monthLogs]) => (
                <div key={month}>
                    <h3 className="text-gray-400 text-sm font-bold mb-4 sticky top-0 bg-[#0F172A] py-2 z-10">{month}</h3>
                    <div className="space-y-4 relative border-r-2 border-gray-700 mr-4 pr-6"> {/* RTL: Right Border */}
                        {monthLogs.sort((a,b) => b.date.localeCompare(a.date)).map(log => (
                            <div 
                                key={log.id} 
                                onClick={() => onSelectLog(log)}
                                className="relative bg-[#1E293B] p-4 rounded-xl border border-gray-700 cursor-pointer hover:border-blue-500 transition group"
                            >
                                {/* Timeline Dot */}
                                <div className={`absolute -right-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#0F172A] ${log.status === 'Completed' ? 'bg-green-500' : log.status === 'Skipped' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                                
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-white font-bold">{log.workoutTitle}</span>
                                    <span className="text-xs text-gray-500 font-mono">{new Date(log.date).toLocaleDateString('fa-IR')}</span>
                                </div>
                                
                                <div className="flex justify-between items-end">
                                    <div className="text-xs text-gray-400">
                                        <span className="ml-3">{log.exercises.length} حرکت</span>
                                        <span>حجم: {log.exercises.reduce((acc, ex) => acc + ex.sets.filter(s=>s.completed).reduce((sAcc, s) => sAcc + ((s.performedWeight||0) * (s.performedReps||0)), 0), 0).toLocaleString()}</span>
                                    </div>
                                    <LogStatusBadge status={log.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const TrainingLogWidget: React.FC<TrainingLogWidgetProps> = ({ profile, updateProfile }) => {
    const [view, setView] = useState<'tracker' | 'history'>('tracker');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeLog, setActiveLog] = useState<TrainingLog | null>(null);
    const [logs, setLogs] = useState<TrainingLog[]>([]);
    
    const activeProgram = profile.savedPrograms?.find(p => p.id === profile.activeProgramId) || profile.savedPrograms?.[0];

    useEffect(() => {
        getTrainingLogs(profile.id).then(setLogs);
    }, [profile.id]);

    useEffect(() => {
        const loadLog = async () => {
            const existing = logs.find(l => l.date === selectedDate);
            if (existing) {
                setActiveLog(existing);
                return;
            }
            setActiveLog(null);
        };
        loadLog();
    }, [selectedDate, logs, activeProgram]);

    const handleStartWorkout = (dayId?: string) => {
        if (!activeProgram) return;
        const newLog = createLogFromProgram(profile.id, selectedDate, activeProgram, dayId);
        setActiveLog(newLog);
        saveTrainingLog(newLog);
        setLogs(prev => [...prev, newLog]);
    };

    const handleLogUpdate = (updates: Partial<TrainingLog>) => {
        if (!activeLog) return;
        const updated = { ...activeLog, ...updates, updatedAt: new Date().toISOString() };
        
        const totalSets = updated.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
        const completedSets = updated.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
        
        if (completedSets === 0) updated.status = 'Planned';
        else if (completedSets === totalSets) updated.status = 'Completed';
        else updated.status = 'Partial';

        setActiveLog(updated);
        saveTrainingLog(updated);
        setLogs(prev => prev.map(l => l.id === updated.id ? updated : l));

        // GLOBAL EVENT SYNC
        if (updated.status === 'Completed' || updated.status === 'Partial') {
            processGlobalEvent({ type: 'TRAINING_LOGGED', payload: updated, timestamp: Date.now() }, profile);
        }
    };

    const handleExerciseUpdate = (exId: string, updates: Partial<LogExercise>) => {
        if (!activeLog) return;
        const updatedExercises = activeLog.exercises.map(ex => ex.id === exId ? { ...ex, ...updates } : ex);
        handleLogUpdate({ exercises: updatedExercises });
    };

    const handleDeleteLog = async () => {
        if (!activeLog || !confirm("این گزارش حذف شود؟")) return;
        await deleteTrainingLog(activeLog.id);
        setLogs(prev => prev.filter(l => l.id !== activeLog!.id));
        setActiveLog(null);
    };

    const shiftDate = (days: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    return (
        <div className="flex flex-col h-full space-y-6" dir="rtl">
            {/* Top Navigation */}
            <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl border border-white/10">
                <div className="flex gap-2">
                    <button 
                        onClick={() => setView('tracker')} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${view === 'tracker' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Activity className="w-4 h-4 inline ml-2"/> ثبت تمرین
                    </button>
                    <button 
                        onClick={() => setView('history')} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${view === 'history' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Calendar className="w-4 h-4 inline ml-2"/> تاریخچه
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {view === 'tracker' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* Date Navigator */}
                        <div className="flex items-center justify-between bg-[#1E293B] p-4 rounded-xl border border-gray-700">
                            <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><ArrowRight size={20}/></button> {/* RTL: Right is Prev */}
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-white">{new Date(selectedDate).toLocaleDateString('fa-IR')}</h3>
                                <p className="text-xs text-gray-500">{selectedDate === new Date().toISOString().split('T')[0] ? 'امروز' : selectedDate}</p>
                            </div>
                            <button onClick={() => shiftDate(1)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><ArrowLeft size={20}/></button> {/* RTL: Left is Next */}
                        </div>

                        {activeLog ? (
                            <>
                                {/* Log Header */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-black text-white">{activeLog.workoutTitle}</h2>
                                        <div className="flex gap-2 mt-1">
                                            <LogStatusBadge status={activeLog.status} />
                                            {activeProgram && <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded border border-purple-500/20">{activeProgram.title}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition" title="افزودن یادداشت">
                                            <FileText size={20}/>
                                        </button>
                                        <button onClick={handleDeleteLog} className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition" title="حذف">
                                            <Trash2 size={20}/>
                                        </button>
                                    </div>
                                </div>

                                {/* Exercises */}
                                <div className="space-y-4">
                                    {activeLog.exercises.map(ex => (
                                        <ExerciseCard key={ex.id} exercise={ex} onUpdate={(u) => handleExerciseUpdate(ex.id, u)} />
                                    ))}
                                </div>

                                {/* Log Footer */}
                                <div className="bg-[#1E293B] p-4 rounded-xl border border-gray-700 mt-8">
                                    <h4 className="text-white font-bold mb-3 flex items-center"><Activity className="ml-2 text-yellow-400"/> بازخورد جلسه</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">فشار تمرین (۱-۱۰)</label>
                                            <input 
                                                type="range" min="1" max="10" 
                                                value={activeLog.fatigueLevel || 5}
                                                onChange={e => handleLogUpdate({ fatigueLevel: Number(e.target.value) })}
                                                className="w-full accent-yellow-500"
                                            />
                                            <div className="text-right text-yellow-400 font-bold">{activeLog.fatigueLevel || 5}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">یادداشت</label>
                                            <textarea 
                                                value={activeLog.userNotes || ''}
                                                onChange={e => handleLogUpdate({ userNotes: e.target.value })}
                                                className="w-full bg-black/20 border border-gray-600 rounded p-2 text-xs text-white resize-none"
                                                rows={2}
                                                placeholder="چطور بود؟"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-[#1E293B] rounded-xl border border-dashed border-gray-700">
                                <Dumbbell size={48} className="text-gray-600 mb-4"/>
                                <h3 className="text-xl font-bold text-white mb-2">تمرینی ثبت نشده</h3>
                                <p className="text-gray-400 mb-6 text-sm">برای این روز تمرینی ثبت نکرده‌اید.</p>
                                
                                {activeProgram ? (
                                    <div className="space-y-2 w-full max-w-xs">
                                        <p className="text-xs text-center text-blue-300 font-bold mb-2">انتخاب از برنامه:</p>
                                        {activeProgram.weeks[0]?.days.map(day => (
                                            <button 
                                                key={day.id}
                                                onClick={() => handleStartWorkout(day.id)}
                                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center"
                                            >
                                                {day.title} <span className="text-[10px] mr-2 opacity-70">({day.focus})</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-red-400 text-xs mb-4">برنامه فعالی یافت نشد.</p>
                                        <button className="bg-gray-700 text-gray-300 py-2 px-4 rounded-lg text-sm">ثبت آزاد (به زودی)</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {view === 'history' && (
                    <HistoryTimeline 
                        logs={logs} 
                        onSelectLog={(log) => { 
                            setSelectedDate(log.date); 
                            setView('tracker'); 
                        }} 
                    />
                )}
            </div>
        </div>
    );
};

export default TrainingLogWidget;
