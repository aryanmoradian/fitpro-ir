import React, { useState } from 'react';
import { UserProfile, AppView, SmartProgram, SchedulePreferences, SmartSession, Exercise, ArchivedProgram } from '../types';
import { generateSmartSchedule } from '../services/smartScheduler';
import { 
  Calendar, Layers, Save, RotateCcw, Clock, Brain, AlertTriangle, CheckSquare
} from 'lucide-react';
import ProgressDashboard from './ProgressDashboard';
import TrainingProgramDesigner from './TrainingProgramDesigner'; 
import TrainingLogWidget from './TrainingLogWidget'; 

const SmartSchedulerWizard: React.FC<{ 
    profile: UserProfile; 
    onGenerate: (prefs: SchedulePreferences) => void;
    error: string | null;
}> = ({ profile, onGenerate, error }) => {
    const [step, setStep] = useState(1);
    const [prefs, setPrefs] = useState<SchedulePreferences>({
        daysPerWeek: 3,
        preferredDays: [1, 3, 5],
        sessionDuration: 60,
        equipmentAccess: ['Bodyweight', 'Dumbbell'],
        goal: profile.goalType || 'Hypertrophy',
        experience: (profile.sportLevel === 'beginner' ? 'Beginner' : profile.sportLevel === 'professional' ? 'Advanced' : 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced'
    });

    return (
        <div className="energetic-card p-8 max-w-2xl mx-auto text-center animate-in fade-in bg-gray-900 border-2 border-dashed border-gray-700">
            <div className="mb-8">
                <div className="w-20 h-20 bg-blue-600/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                    <Brain size={40} />
                </div>
                <h2 className="text-2xl font-black text-white">طراح برنامه هوشمند</h2>
                <p className="text-gray-400 mt-2 text-sm leading-relaxed">هوش مصنوعی بر اساس سطح، تجهیزات و اهداف شما، یک برنامه علمی و شخصی‌سازی شده می‌سازد.</p>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl mb-6 text-red-200 text-sm flex items-center justify-center">
                    <AlertTriangle className="ml-2" size={18}/> {error}
                </div>
            )}

            {step === 1 && (
                <div className="space-y-8">
                    <div>
                        <label className="block text-white mb-4 font-bold text-sm">چند روز در هفته تمرین می‌کنید؟</label>
                        <div className="flex justify-center gap-3">
                            {[2, 3, 4, 5, 6].map(d => (
                                <button 
                                    key={d} 
                                    onClick={() => setPrefs({...prefs, daysPerWeek: d})}
                                    className={`w-12 h-12 rounded-xl font-bold text-lg border-2 transition-all ${prefs.daysPerWeek === d ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-white mb-4 font-bold text-sm">مدت زمان هر جلسه؟</label>
                        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                            {[30, 45, 60, 90].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setPrefs({...prefs, sessionDuration: t})}
                                    className={`py-3 rounded-xl border transition-all font-bold ${prefs.sessionDuration === t ? 'bg-blue-900/50 border-blue-500 text-blue-300' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                                >
                                    {t} دقیقه
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => setStep(2)} className="w-full py-4 bg-white text-black rounded-xl font-black text-lg hover:bg-gray-200 transition">
                        مرحله بعد
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8">
                    <div>
                        <label className="block text-white mb-4 font-bold text-sm">تجهیزات در دسترس؟</label>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {[
                                { id: 'Bodyweight', label: 'وزن بدن' },
                                { id: 'Dumbbell', label: 'دمبل' },
                                { id: 'Barbell', label: 'هالتر' },
                                { id: 'Machine', label: 'دستگاه' },
                                { id: 'Cables', label: 'سیم‌کش' }
                            ].map((eq: any) => (
                                <button 
                                    key={eq.id}
                                    onClick={() => {
                                        const newEq = prefs.equipmentAccess.includes(eq.id) 
                                            ? prefs.equipmentAccess.filter(e => e !== eq.id)
                                            : [...prefs.equipmentAccess, eq.id];
                                        setPrefs({...prefs, equipmentAccess: newEq});
                                    }}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${prefs.equipmentAccess.includes(eq.id) ? 'bg-green-600 border-green-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                                >
                                    {eq.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-white mb-4 font-bold text-sm">سطح تجربه؟</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { val: 'Beginner', label: 'مبتدی' },
                                { val: 'Intermediate', label: 'متوسط' },
                                { val: 'Advanced', label: 'حرفه‌ای' }
                            ].map((lvl) => (
                                <button 
                                    key={lvl.val}
                                    onClick={() => setPrefs({...prefs, experience: lvl.val})}
                                    className={`py-3 rounded-lg text-sm border transition-all font-bold ${prefs.experience === lvl.val ? 'bg-purple-900/50 border-purple-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                                >
                                    {lvl.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setStep(1)} className="flex-1 bg-gray-800 text-gray-300 py-4 rounded-xl font-bold border border-gray-700">بازگشت</button>
                        <button onClick={() => onGenerate(prefs)} className="flex-[2] btn-primary py-4 rounded-xl font-black text-lg shadow-lg">ساخت برنامه</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const TrainingCenter: React.FC<{
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  logs: any[];
  setCurrentView: (view: AppView) => void;
  setWorkoutPlan?: React.Dispatch<React.SetStateAction<Exercise[]>>;
}> = ({ profile, updateProfile, logs, setCurrentView, setWorkoutPlan }) => {
    const [activeTab, setActiveTab] = useState<'log' | 'schedule' | 'designer' | 'history'>('log');
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'wizard'>(profile.smartProgram ? 'calendar' : 'wizard');

    const handleGenerate = (prefs: SchedulePreferences) => {
        try {
            setError(null);
            const program = generateSmartSchedule(profile, prefs);
            updateProfile({ ...profile, smartProgram: program });
            setViewMode('calendar');
        } catch (err: any) {
            setError(err.message || "خطا در ساخت برنامه. لطفا ورودی‌ها را بررسی کنید.");
        }
    };

    const handleRegenerate = () => {
        if(confirm("برنامه فعلی حذف خواهد شد. ادامه می‌دهید؟")) {
            setViewMode('wizard');
        }
    };

    const handleStartSession = (session: SmartSession) => {
        if (!setWorkoutPlan || !setCurrentView) return;
        const combinedExercises = [
            ...(session.warmup || []),
            ...(session.mainLifts || []),
            ...(session.accessories || []),
            ...(session.cooldown || [])
        ];
        
        const sanitizedPlan = combinedExercises.map(ex => ({
            ...ex,
            id: `active_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            completed: false
        }));

        setWorkoutPlan(sanitizedPlan);
        setCurrentView(AppView.TRACKER);
    };

    return (
        <div className="flex flex-col h-full space-y-6" dir="rtl">
            {/* Top Navigation */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 shrink-0 w-fit mx-auto md:mx-0 overflow-x-auto">
                <button onClick={() => setActiveTab('log')} className={`px-6 py-2 rounded-lg font-bold transition flex items-center ${activeTab === 'log' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    <CheckSquare className="w-4 h-4 ml-2"/> ثبت روزانه
                </button>
                <button onClick={() => setActiveTab('schedule')} className={`px-6 py-2 rounded-lg font-bold transition flex items-center ${activeTab === 'schedule' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    <Calendar className="w-4 h-4 ml-2"/> برنامه هوشمند
                </button>
                <button onClick={() => setActiveTab('designer')} className={`px-6 py-2 rounded-lg font-bold transition flex items-center ${activeTab === 'designer' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    <Layers className="w-4 h-4 ml-2"/> طراحی دستی
                </button>
                <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg font-bold transition flex items-center ${activeTab === 'history' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    <Brain className="w-4 h-4 ml-2"/> آنالیز
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {/* 1. TRAINING LOG WIDGET */}
                {activeTab === 'log' && (
                    <TrainingLogWidget profile={profile} updateProfile={updateProfile} />
                )}

                {/* 2. SMART SCHEDULE */}
                {activeTab === 'schedule' && (
                    viewMode === 'wizard' ? (
                        <SmartSchedulerWizard profile={profile} onGenerate={handleGenerate} error={error} />
                    ) : (
                        <div className="space-y-6 animate-in fade-in">
                            {/* Calendar Header */}
                            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-white/10 gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Layers className="text-blue-400"/> برنامه هوشمند فعال
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        سیستم: <span className="text-blue-300 font-bold">{profile.smartProgram?.split}</span> • 
                                        هدف: <span className="text-green-300 font-bold">{profile.smartProgram?.preferences.goal}</span>
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={handleRegenerate} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg transition flex items-center shadow-lg">
                                        <RotateCcw className="w-4 h-4 ml-2"/> بازسازی برنامه AI
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'].map((dayName, idx) => {
                                    // Adjust index for Saturday start if needed (0=Sat in layout logic)
                                    const session = profile.smartProgram?.sessions.find(s => s.dayOfWeek === idx);
                                    
                                    return (
                                        <div key={idx} className={`rounded-xl border p-5 transition-all relative overflow-hidden ${session ? 'bg-gray-800 border-gray-600 hover:border-blue-500/50 group' : 'bg-black/20 border-white/5 opacity-50'}`}>
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-bold text-gray-400 text-sm">{dayName}</span>
                                                {session && <span className="text-[10px] bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">{session.duration} دقیقه</span>}
                                            </div>

                                            {session ? (
                                                <>
                                                    <h4 className="font-black text-white text-lg mb-1">{session.title}</h4>
                                                    <p className="text-xs text-gray-400 mb-4">{session.focus}</p>
                                                    
                                                    <div className="space-y-1 mb-6">
                                                        {session.mainLifts.slice(0, 3).map((ex, i) => (
                                                            <div key={i} className="text-xs text-gray-300 flex items-center">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 ml-2"></div>
                                                                {ex.name}
                                                            </div>
                                                        ))}
                                                        {(session.mainLifts.length > 3 || session.accessories.length > 0) && (
                                                            <div className="text-xs text-gray-500 italic mt-1">+ {session.accessories.length} حرکت دیگر</div>
                                                        )}
                                                    </div>

                                                    <button 
                                                        onClick={() => handleStartSession(session)}
                                                        className="w-full bg-white/5 hover:bg-blue-600 text-white border border-white/10 hover:border-blue-500 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500"
                                                    >
                                                        شروع تمرین
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="h-32 flex flex-col items-center justify-center text-gray-600">
                                                    <Clock size={24} className="mb-2 opacity-30"/>
                                                    <span className="text-xs">روز استراحت</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                )}

                {/* 3. PROGRAM DESIGNER */}
                {activeTab === 'designer' && (
                    <TrainingProgramDesigner 
                        profile={profile} 
                        updateProfile={updateProfile} 
                        onExit={() => setActiveTab('schedule')}
                    />
                )}

                {/* 4. HISTORY & ANALYTICS */}
                {activeTab === 'history' && (
                    <ProgressDashboard profile={profile} onRestoreProgram={() => {}} />
                )}
            </div>
        </div>
    );
};

export default TrainingCenter;