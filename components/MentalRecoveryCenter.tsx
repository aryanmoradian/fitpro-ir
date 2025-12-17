
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, DailyLog, AppView, SleepDetails } from '../types';
import { analyzeRecoveryState, suggestMindfulness } from '../services/geminiService';
import { 
  Moon, Battery, Brain, Wind, Activity, Calendar, Smile, Frown, 
  Meh, Zap, Thermometer, Clock, Sparkles, AlertCircle, PlayCircle, StopCircle, Loader2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

interface MentalRecoveryCenterProps {
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  logs: DailyLog[];
  setCurrentView: (view: AppView) => void;
  updateTodaysLog: (partialLog: Partial<DailyLog>) => void;
}

// --- BREATHING EXERCISE VISUALIZER ---
const BreathingExercise: React.FC<{ type: 'box' | '478'; onClose: () => void }> = ({ type, onClose }) => {
  const [phase, setPhase] = useState('Ready');
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    
    let interval: any;
    if (type === 'box') {
      // 4-4-4-4 Pattern
      const cycle = 16;
      interval = setInterval(() => {
        setTimer(t => {
          const mod = (t + 1) % cycle;
          if (mod < 4) setPhase('Inhale (دم)');
          else if (mod < 8) setPhase('Hold (حبس)');
          else if (mod < 12) setPhase('Exhale (بازدم)');
          else setPhase('Hold (حبس)');
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, type]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-indigo-900/30 rounded-2xl border border-indigo-500/30 animate-in fade-in">
      <h3 className="text-2xl font-bold text-white mb-6">تمرین تنفس {type === 'box' ? 'مربعی' : '۴-۷-۸'}</h3>
      
      <div className={`relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-indigo-400 transition-all duration-1000 ${phase.includes('Inhale') ? 'scale-125 bg-indigo-500/20' : phase.includes('Exhale') ? 'scale-90 bg-indigo-500/5' : 'scale-100'}`}>
        <span className="text-xl font-bold text-white">{phase}</span>
      </div>

      <div className="flex gap-4 mt-8">
        {!isActive ? (
          <button onClick={() => setIsActive(true)} className="flex items-center btn-primary px-6 py-3 rounded-xl">
            <PlayCircle className="mr-2" /> شروع تمرین
          </button>
        ) : (
          <button onClick={() => { setIsActive(false); setTimer(0); setPhase('Ready'); }} className="flex items-center bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl">
            <StopCircle className="mr-2" /> توقف
          </button>
        )}
        <button onClick={onClose} className="text-gray-400 hover:text-white px-4">خروج</button>
      </div>
    </div>
  );
};

const MentalRecoveryCenter: React.FC<MentalRecoveryCenterProps> = ({ profile, logs, updateTodaysLog }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sleep' | 'mood' | 'breathe'>('dashboard');
  const [aiInsight, setAiInsight] = useState('');
  const [exerciseRecommendation, setExerciseRecommendation] = useState('');
  
  // Data Extraction
  const todayStr = new Date().toLocaleDateString('fa-IR');
  const todayLog = logs.find(l => l.date === todayStr) || { 
    sleepHours: 0, sleepQuality: 0, stressIndex: 50, mood: 'neutral', energyLevel: 5 
  };

  // Recovery Score Calculation
  const recoveryScore = useMemo(() => {
    // Score = (Sleep * 4) + ((100-Stress) * 3) + (Energy * 3) / 10
    const sleepScore = ((todayLog.sleepQuality || 5) / 10) * 100;
    const stressScore = 100 - (todayLog.stressIndex || 50);
    const energyScore = (todayLog.energyLevel || 5) * 10;
    
    return Math.round((sleepScore * 0.4) + (stressScore * 0.3) + (energyScore * 0.3));
  }, [todayLog]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      analyzeRecoveryState(logs).then(setAiInsight);
    }
    if (activeTab === 'breathe' && !exerciseRecommendation) {
        suggestMindfulness(todayLog.mood || 'neutral', todayLog.stressIndex || 50).then(setExerciseRecommendation);
    }
  }, [activeTab, logs, todayLog.mood]);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Tab Navigation */}
      <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 shrink-0 overflow-x-auto">
        {[
            { id: 'dashboard', icon: Activity, label: 'داشبورد' },
            { id: 'sleep', icon: Moon, label: 'آزمایشگاه خواب' },
            { id: 'mood', icon: Brain, label: 'ذهن و روان' },
            { id: 'breathe', icon: Wind, label: 'تمرین تنفس' },
        ].map(tab => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex-1 min-w-[120px] py-3 rounded-lg font-bold flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                <tab.icon className="w-4 h-4 ml-2" /> {tab.label}
            </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        
        {/* --- DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in">
            {/* Recovery Battery */}
            <div className="energetic-card p-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30">
               <h3 className="text-xl font-bold text-white mb-2 flex items-center z-10"><Battery className="mr-2 text-green-400"/> وضعیت ریکاوری امروز</h3>
               <div className="text-6xl font-black text-white z-10 my-4 drop-shadow-lg">{recoveryScore}%</div>
               <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden z-10 border border-white/10">
                  <div 
                    className={`h-full transition-all duration-1000 ${recoveryScore > 70 ? 'bg-green-500' : recoveryScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    style={{width: `${recoveryScore}%`}}
                  ></div>
               </div>
               <p className="text-sm text-gray-300 mt-4 z-10 text-center">
                 {recoveryScore > 70 ? "بدن شما آماده تمرین سنگین است!" : "استراحت فعال یا تمرین سبک پیشنهاد می‌شود."}
               </p>
               {/* Background Glow */}
               <div className={`absolute inset-0 opacity-20 blur-3xl ${recoveryScore > 70 ? 'bg-green-600' : 'bg-red-600'}`}></div>
            </div>

            {/* Sleep Trend Chart */}
            <div className="energetic-card p-6 col-span-1 lg:col-span-1 xl:col-span-2">
               <h3 className="text-lg font-bold text-white mb-4">روند خواب (۷ روز گذشته)</h3>
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={logs.slice(-7)}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                     <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickFormatter={(val) => val.split('/')[2]}/>
                     <YAxis stroke="#9ca3af" fontSize={10} />
                     <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none'}} />
                     <Line type="monotone" dataKey="sleepHours" stroke="#818cf8" strokeWidth={3} name="Hours" />
                     <Line type="monotone" dataKey="sleepQuality" stroke="#34d399" strokeWidth={2} name="Quality" />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* AI Insight */}
            <div className="energetic-card p-6 bg-blue-900/20 border-blue-500/20 lg:col-span-2 xl:col-span-3">
               <h3 className="font-bold text-blue-300 mb-2 flex items-center"><Sparkles className="mr-2"/> تحلیل هوشمند مربی</h3>
               <p className="text-gray-300 text-sm leading-relaxed">{aiInsight || "در حال تحلیل داده‌ها..."}</p>
            </div>
          </div>
        )}

        {/* --- SLEEP LAB --- */}
        {activeTab === 'sleep' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
             <div className="energetic-card p-6">
                <h3 className="font-bold text-white mb-6 flex items-center"><Moon className="mr-2 text-indigo-400"/> ثبت جزئیات خواب دیشب</h3>
                <div className="space-y-4">
                   <div>
                      <label className="text-xs text-gray-400 block mb-1">مدت زمان (ساعت)</label>
                      <input 
                        type="number" 
                        value={todayLog.sleepHours || 0} 
                        onChange={e => updateTodaysLog({ sleepHours: +e.target.value })}
                        className="w-full input-styled p-3"
                      />
                   </div>
                   <div>
                      <label className="text-xs text-gray-400 block mb-1">کیفیت خواب (۱-۱۰)</label>
                      <input 
                        type="range" min="1" max="10"
                        value={todayLog.sleepQuality || 5} 
                        onChange={e => updateTodaysLog({ sleepQuality: +e.target.value })}
                        className="w-full accent-indigo-500"
                      />
                      <div className="text-center text-indigo-300 font-bold">{todayLog.sleepQuality || 5}</div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs text-gray-400 block mb-1">عمیق (%)</label>
                         <input 
                           type="number" 
                           placeholder="مثلا 20"
                           className="w-full input-styled p-3"
                           // Note: Real implementation would update nested sleepDetails
                         />
                      </div>
                      <div>
                         <label className="text-xs text-gray-400 block mb-1">REM (%)</label>
                         <input 
                           type="number" 
                           placeholder="مثلا 25"
                           className="w-full input-styled p-3"
                         />
                      </div>
                   </div>
                </div>
             </div>

             <div className="energetic-card p-6 bg-black/20 flex flex-col justify-center">
                <h4 className="text-white font-bold mb-4">نکات بهداشت خواب</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                   <li className="flex items-start"><Clock className="mr-2 shrink-0 text-indigo-500"/> سعی کنید هر شب در یک ساعت مشخص بخوابید.</li>
                   <li className="flex items-start"><Thermometer className="mr-2 shrink-0 text-indigo-500"/> دمای اتاق را بین ۱۸ تا ۲۲ درجه نگه دارید.</li>
                   <li className="flex items-start"><Zap className="mr-2 shrink-0 text-indigo-500"/> نور آبی (موبایل) را یک ساعت قبل خواب قطع کنید.</li>
                </ul>
             </div>
          </div>
        )}

        {/* --- MOOD & STRESS --- */}
        {activeTab === 'mood' && (
           <div className="energetic-card p-6 animate-in fade-in max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-6 text-center">چک‌اپ ذهنی روزانه</h3>
              
              <div className="mb-8">
                 <label className="block text-center text-gray-400 mb-4">حال امروز شما چطور است؟</label>
                 <div className="flex justify-center gap-4">
                    {['happy', 'energetic', 'neutral', 'tired', 'stressed'].map((m) => (
                       <button 
                         key={m}
                         onClick={() => updateTodaysLog({ mood: m as any })}
                         className={`p-4 rounded-2xl transition-all transform hover:scale-110 ${todayLog.mood === m ? 'bg-indigo-600 scale-110 shadow-lg ring-2 ring-indigo-400' : 'bg-gray-800 hover:bg-gray-700'}`}
                       >
                          {m === 'happy' && <Smile className="text-green-400 w-8 h-8"/>}
                          {m === 'energetic' && <Zap className="text-yellow-400 w-8 h-8"/>}
                          {m === 'neutral' && <Meh className="text-gray-400 w-8 h-8"/>}
                          {m === 'tired' && <Battery className="text-orange-400 w-8 h-8"/>}
                          {m === 'stressed' && <AlertCircle className="text-red-400 w-8 h-8"/>}
                       </button>
                    ))}
                 </div>
                 <p className="text-center text-indigo-300 mt-2 font-bold capitalize">{todayLog.mood}</p>
              </div>

              <div className="mb-8">
                 <label className="block text-center text-gray-400 mb-2">سطح استرس (۰ = آرام، ۱۰۰ = شدید)</label>
                 <input 
                    type="range" min="0" max="100"
                    value={todayLog.stressIndex || 50}
                    onChange={e => updateTodaysLog({ stressIndex: +e.target.value })}
                    className="w-full accent-red-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                 />
                 <div className="text-center mt-2 font-black text-2xl text-white">{todayLog.stressIndex}</div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl text-center">
                 <p className="text-sm text-gray-300">
                    {todayLog.stressIndex && todayLog.stressIndex > 70 
                      ? "سطح استرس بالاست. پیشنهاد می‌کنیم همین الان یک تمرین تنفس انجام دهید." 
                      : "وضعیت ذهنی متعادل به نظر می‌رسد. عالی است!"}
                 </p>
                 {todayLog.stressIndex && todayLog.stressIndex > 70 && (
                    <button onClick={() => setActiveTab('breathe')} className="mt-3 text-indigo-400 font-bold hover:underline">برو به تمرین تنفس &rarr;</button>
                 )}
              </div>
           </div>
        )}

        {/* --- BREATHING EXERCISES --- */}
        {activeTab === 'breathe' && (
           <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
              {!exerciseRecommendation ? (
                 <div className="text-center p-8"><Loader2 className="animate-spin mx-auto"/></div>
              ) : (
                 <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl flex items-start gap-3">
                    <Sparkles className="text-indigo-400 shrink-0 mt-1"/>
                    <div>
                       <h4 className="font-bold text-indigo-300 text-sm mb-1">پیشنهاد هوشمند</h4>
                       <p className="text-gray-300 text-sm">{exerciseRecommendation}</p>
                    </div>
                 </div>
              )}

              <BreathingExercise type="box" onClose={() => {}} />
           </div>
        )}

      </div>
    </div>
  );
};

export default MentalRecoveryCenter;
