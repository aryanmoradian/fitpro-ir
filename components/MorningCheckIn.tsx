
import React, { useState } from 'react';
import { Sun, Moon, Smile, Frown, Meh, Zap, Battery, CheckCircle2, ArrowRight } from 'lucide-react';
import { DailyLog, UserProfile, Mood } from '../types';

interface MorningCheckInProps {
  onComplete: (data: Partial<DailyLog>) => void;
  onClose: () => void;
  profile: UserProfile;
}

const MorningCheckIn: React.FC<MorningCheckInProps> = ({ onComplete, onClose, profile }) => {
  const [step, setStep] = useState(1);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [mood, setMood] = useState<Mood>('neutral');
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(30);

  const handleFinish = () => {
    onComplete({
      sleepHours,
      sleepQuality,
      mood,
      energyLevel: energy,
      stressIndex: stress,
      // Default empty values for the rest of the day
      workoutScore: 0,
      nutritionScore: 0,
      waterIntake: 0
    });
  };

  const nextStep = () => setStep(s => s + 1);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="bg-[#1E293B] border border-blue-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-800 w-full">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Sun className="text-yellow-400" /> چک‌اپ صبحگاهی
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition">بعدا</button>
          </div>

          {/* STEP 1: Sleep */}
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              <div className="text-center">
                <Moon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">دیشب چطور خوابیدی؟</h3>
                <p className="text-gray-400 text-sm mt-2">ریکاوری مهم‌ترین بخش پیشرفت است.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>مدت زمان</span>
                    <span className="font-bold text-indigo-300">{sleepHours} ساعت</span>
                  </div>
                  <input 
                    type="range" min="3" max="12" step="0.5" 
                    value={sleepHours} 
                    onChange={e => setSleepHours(parseFloat(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>کیفیت خواب</span>
                    <span className="font-bold text-indigo-300">{sleepQuality}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={sleepQuality} 
                    onChange={e => setSleepQuality(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
              <button onClick={nextStep} className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center">
                ادامه <ArrowRight className="ml-2" size={18}/>
              </button>
            </div>
          )}

          {/* STEP 2: Mood & Energy */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              <div className="text-center">
                <Battery className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">سطح انرژی امروزت چطوره؟</h3>
              </div>

              <div>
                <label className="block text-center text-gray-400 mb-4 text-sm">حس و حال کلی</label>
                <div className="flex justify-center gap-3">
                  {['happy', 'energetic', 'neutral', 'tired', 'stressed'].map((m) => (
                    <button 
                      key={m}
                      onClick={() => setMood(m as Mood)}
                      className={`p-3 rounded-2xl transition-all transform ${mood === m ? 'bg-blue-600 scale-110 shadow-lg ring-2 ring-blue-400' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                      {m === 'happy' && <Smile className="text-green-400"/>}
                      {m === 'energetic' && <Zap className="text-yellow-400"/>}
                      {m === 'neutral' && <Meh className="text-gray-400"/>}
                      {m === 'tired' && <Battery className="text-orange-400"/>}
                      {m === 'stressed' && <Frown className="text-red-400"/>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                 <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>سطح انرژی بدنی</span>
                    <span className="font-bold text-green-300">{energy}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={energy} 
                    onChange={e => setEnergy(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
              </div>

              <button onClick={nextStep} className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center">
                ادامه <ArrowRight className="ml-2" size={18}/>
              </button>
            </div>
          )}

          {/* STEP 3: Summary & AI Tip */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300 text-center">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
              <h3 className="text-2xl font-black text-white">آماده شروع روز!</h3>
              
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-right">
                <h4 className="font-bold text-blue-300 text-sm mb-2 flex items-center"><Zap size={14} className="mr-2"/> پیشنهاد هوشمند امروز</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {sleepHours < 6 
                    ? 'خوابت کم بوده. امروز فشار تمرین رو ۲۰٪ کم کن و بیشتر آب بخور. روی حرکات کششی تمرکز کن.' 
                    : energy > 7 
                    ? 'سطح انرژی عالیه! امروز بهترین روز برای رکوردشکنی در حرکات اصلی (Squat/Bench) هست.' 
                    : 'همه چیز متعادل به نظر میاد. طبق برنامه پیش برو و روی فرم حرکت تمرکز کن.'}
                </p>
              </div>

              <div className="flex gap-2 justify-center text-xs text-gray-500">
                <span>+50 XP پاداش سحرخیزی</span>
              </div>

              <button onClick={handleFinish} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-green-900/40">
                ثبت و ورود به داشبورد
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MorningCheckIn;
