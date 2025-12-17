
import React, { useState } from 'react';
import { Exercise, ExerciseLibItem, TrainingSession, WeeklyWorkoutPlan, UserProfile, MuscleGroup, Equipment, Difficulty } from '../types';
import { EXERCISE_DB } from '../services/exerciseDatabase';
import { Plus, Trash2, Search, Filter, PlayCircle, GripVertical, Save, Copy, ChevronDown, ChevronUp, Dumbbell, Clock, X, CheckSquare, Square, Check, User } from 'lucide-react';
import ExercisePicker from './ExercisePicker';

interface TrainingBuilderProps {
  currentPlan: WeeklyWorkoutPlan;
  updatePlan: (plan: WeeklyWorkoutPlan) => void;
  profile?: UserProfile;
  updateProfile?: (profile: UserProfile) => void;
}

const TrainingBuilder: React.FC<TrainingBuilderProps> = ({ currentPlan, updatePlan, profile, updateProfile }) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Helpers
  const getSession = (day: number) => currentPlan?.sessions?.find(s => s.dayOfWeek === day);
  
  const addSession = (day: number) => {
    if (getSession(day)) return;
    const newSession: TrainingSession = {
      id: Date.now().toString(),
      name: `جلسه تمرینی ${day}`,
      dayOfWeek: day,
      exercises: []
    };
    // Defensive check for sessions array
    const sessions = currentPlan?.sessions || [];
    updatePlan({ ...currentPlan, sessions: [...sessions, newSession] });
  };

  const updateSessionName = (day: number, name: string) => {
    const sessions = currentPlan?.sessions || [];
    const updatedSessions = sessions.map(s => 
      s.dayOfWeek === day ? { ...s, name } : s
    );
    updatePlan({ ...currentPlan, sessions: updatedSessions });
  };

  const removeSession = (day: number) => {
    const sessions = currentPlan?.sessions || [];
    updatePlan({ ...currentPlan, sessions: sessions.filter(s => s.dayOfWeek !== day) });
  };

  const addExerciseToSession = (exerciseId: string) => {
    const session = getSession(activeDay);
    if (!session) {
      alert("لطفا ابتدا یک جلسه تمرینی برای این روز ایجاد کنید.");
      return;
    }

    // Lookup in both System DB and User Custom Exercises
    const fullLibrary = [...EXERCISE_DB, ...(profile?.customExercises || [])];
    const libItem = fullLibrary.find(i => i.id === exerciseId);
    
    if (!libItem) return;

    const newExercise: Exercise = {
      id: Date.now().toString() + Math.random(),
      dbId: libItem.id, // Store link to DB
      name: libItem.name_en, // Fallback
      name_fa: libItem.name_fa, // Primary
      sets: libItem.defaults?.sets || 3,
      reps: libItem.defaults?.reps || '10-12',
      rest: libItem.defaults?.rest || 60,
      muscleGroup: libItem.muscle,
      notes: ''
    };

    const sessions = currentPlan?.sessions || [];
    const updatedSessions = sessions.map(s => 
      s.dayOfWeek === activeDay ? { ...s, exercises: [...(s.exercises || []), newExercise] } : s
    );
    updatePlan({ ...currentPlan, sessions: updatedSessions });
    
    setIsModalOpen(false);
  };

  const updateExercise = (exerciseId: string, field: keyof Exercise, value: any) => {
    const sessions = currentPlan?.sessions || [];
    const updatedSessions = sessions.map(s => 
      s.dayOfWeek === activeDay ? {
        ...s,
        exercises: (s.exercises || []).map(ex => ex.id === exerciseId ? { ...ex, [field]: value } : ex)
      } : s
    );
    updatePlan({ ...currentPlan, sessions: updatedSessions });
  };

  const removeExercise = (exerciseId: string) => {
    const sessions = currentPlan?.sessions || [];
    const updatedSessions = sessions.map(s => 
      s.dayOfWeek === activeDay ? {
        ...s,
        exercises: (s.exercises || []).filter(ex => ex.id !== exerciseId)
      } : s
    );
    updatePlan({ ...currentPlan, sessions: updatedSessions });
  };
  
  const copySessionToNextDay = () => {
    const currentSession = getSession(activeDay);
    const nextDay = activeDay + 1;
    if (!currentSession || nextDay > 7) return;

    let targetSession = getSession(nextDay);
    const sessions = [...(currentPlan?.sessions || [])];
    
    if (targetSession) {
        // Overwrite existing session
        const index = sessions.findIndex(s => s.dayOfWeek === nextDay);
        sessions[index] = { ...currentSession, dayOfWeek: nextDay, id: Date.now().toString() };
    } else {
        // Create new session
        sessions.push({ ...currentSession, dayOfWeek: nextDay, id: Date.now().toString() });
    }
    
    updatePlan({ ...currentPlan, sessions });
    setActiveDay(nextDay);
    alert(`برنامه روز ${activeDay} به روز ${nextDay} کپی شد.`);
  };

  const exportPlanAsPDF = () => {
      alert("قابلیت خروجی PDF به زودی اضافه خواهد شد!");
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const session = getSession(activeDay);
    if (!session || !session.exercises) return;
    
    const newExercises = [...session.exercises];
    if (direction === 'up' && index > 0) {
      [newExercises[index], newExercises[index - 1]] = [newExercises[index - 1], newExercises[index]];
    } else if (direction === 'down' && index < newExercises.length - 1) {
      [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
    }

    const sessions = currentPlan?.sessions || [];
    const updatedSessions = sessions.map(s => 
      s.dayOfWeek === activeDay ? { ...s, exercises: newExercises } : s
    );
    updatePlan({ ...currentPlan, sessions: updatedSessions });
  };

  const activeSession = getSession(activeDay);
  const exercises = activeSession && Array.isArray(activeSession.exercises) ? activeSession.exercises : [];
  const totalSets = exercises.reduce((acc, curr) => acc + (curr.sets || 0), 0) || 0;
  const estimatedDuration = (totalSets * 2) + (totalSets * (exercises[0]?.rest || 60) / 60);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* 1. Schedule Bar */}
      <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto pb-2 border-b border-white/10">
        {[1, 2, 3, 4, 5, 6, 7].map(day => {
          const session = getSession(day);
          return (
            <div 
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-shrink-0 w-32 p-3 rounded-lg cursor-pointer border-2 transition-all duration-300 ${
                activeDay === day 
                  ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_var(--glow-blue)]' 
                  : session 
                    ? 'bg-black/20 border-white/10 hover:bg-white/20' 
                    : 'bg-black/10 border-white/5 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="text-sm text-gray-400 mb-1">روز {day}</div>
              {session ? (
                <div className="font-bold text-white text-md truncate">{session.name}</div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); addSession(day); }} className="text-sm text-blue-400 flex items-center justify-center w-full mt-1">
                  <Plus size={14} className="ml-1"/> ایجاد
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 energetic-card p-4 flex flex-col overflow-hidden relative">
           {activeSession ? (
             <>
               <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                 <div className="flex items-center flex-1">
                   <input 
                     value={activeSession.name}
                     onChange={(e) => updateSessionName(activeDay, e.target.value)}
                     className="bg-transparent text-xl font-bold text-white border-b border-transparent hover:border-gray-500 focus:border-blue-500 outline-none px-2 py-1 transition w-1/2"
                   />
                   <span className="text-sm text-gray-500 mr-2">(روز {activeDay})</span>
                 </div>
                 <div className="flex space-x-2 space-x-reverse items-center">
                    <div className="bg-black/20 px-3 py-1 rounded text-sm text-gray-300 flex items-center" title="زمان تخمینی">
                       <Clock size={14} className="ml-1" /> ~{Math.round(estimatedDuration)} دقیقه
                    </div>
                    {/* Add Exercise Button */}
                    <button 
                       onClick={() => setIsModalOpen(true)}
                       className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center text-sm"
                    >
                       <Plus size={16} className="ml-2" /> افزودن حرکت
                    </button>
                    <button onClick={() => removeSession(activeDay)} className="text-red-400 hover:text-red-300 p-2">
                       <Trash2 size={18} />
                    </button>
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 {!exercises || exercises.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                      <Dumbbell className="w-12 h-12 mb-2 opacity-50" />
                      <p>حرکتی اضافه نشده است</p>
                      <button onClick={() => setIsModalOpen(true)} className="text-blue-400 hover:underline mt-2">افزودن از کتابخانه</button>
                   </div>
                 ) : (
                   exercises.map((ex, idx) => (
                     <div key={ex.id} className="bg-black/20 p-3 rounded-lg border border-white/10 flex flex-col md:flex-row items-center gap-4 group hover:border-blue-500/50 transition">
                       <div className="flex flex-col items-center justify-center space-y-1 text-gray-500">
                          <button onClick={() => moveExercise(idx, 'up')} disabled={idx === 0} className="hover:text-blue-400 disabled:opacity-30"><ChevronUp size={16}/></button>
                          <GripVertical size={16} className="cursor-grab" />
                          <button onClick={() => moveExercise(idx, 'down')} disabled={idx === exercises.length - 1} className="hover:text-blue-400 disabled:opacity-30"><ChevronDown size={16}/></button>
                       </div>
                       
                       <div className="flex-1 w-full">
                         <div className="flex justify-between mb-2">
                            <span className="font-bold text-white flex items-center">
                              {ex.name_fa || ex.name}
                            </span>
                            <button onClick={() => removeExercise(ex.id)} className="text-gray-600 hover:text-red-500"><Trash2 size={16}/></button>
                         </div>
                         <div className="grid grid-cols-3 gap-2">
                            <div>
                               <label className="text-[10px] text-gray-500 block">ست</label>
                               <input type="number" value={ex.sets} onChange={(e) => updateExercise(ex.id, 'sets', Number(e.target.value))} className="w-full input-styled px-2 py-1 text-xs text-center" />
                            </div>
                            <div>
                               <label className="text-[10px] text-gray-500 block">تکرار</label>
                               <input value={ex.reps} onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)} className="w-full input-styled px-2 py-1 text-xs text-center" />
                            </div>
                            <div>
                               <label className="text-[10px] text-gray-500 block">استراحت (ثانیه)</label>
                               <input type="number" value={ex.rest} onChange={(e) => updateExercise(ex.id, 'rest', Number(e.target.value))} className="w-full input-styled px-2 py-1 text-xs text-center" />
                            </div>
                         </div>
                         <textarea 
                           placeholder="یادداشت (تمپو، فشار، نکات اجرایی...)" 
                           value={ex.notes || ''} 
                           onChange={(e) => updateExercise(ex.id, 'notes', e.target.value)}
                           rows={2}
                           className="w-full input-styled mt-2 px-2 py-1 text-xs text-gray-300 resize-y"
                         />
                       </div>
                     </div>
                   ))
                 )}
               </div>

               <div className="mt-4 pt-4 border-t border-white/10 flex justify-end space-x-3 space-x-reverse">
                  <button onClick={copySessionToNextDay} className="flex items-center text-sm text-gray-400 hover:text-white transition">
                     <Copy size={16} className="ml-1" /> کپی برای فردا
                  </button>
                  <button onClick={exportPlanAsPDF} className="flex items-center text-sm text-gray-400 hover:text-white transition">
                     <Save size={16} className="ml-1" /> دانلود نسخه اصلی (PDF)
                  </button>
               </div>
             </>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-500">
               <p>برای شروع، روی "ایجاد" در نوار بالا کلیک کنید.</p>
             </div>
           )}
      </div>

      <ExercisePicker 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSelect={addExerciseToSession} 
          profile={profile}
          updateProfile={updateProfile}
      />
    </div>
  );
};

export default TrainingBuilder;
