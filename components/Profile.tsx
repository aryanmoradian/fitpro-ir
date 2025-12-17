
import React, { useState, useMemo } from 'react';
import { UserProfile, DailyLog, AppView, BodyMetricLog, Goal } from '../types';
import { calculatePQS, cascadeGoalUpdates, logBodyMetrics, calculateAdvancedMetrics } from '../services/profileService';
import { 
  User, Brain, Target, Activity, Save, Plus, Ruler, Star, CheckCircle2, 
  ArrowRight, Scale, Zap, Info, TrendingDown, TrendingUp, Camera, Trash2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area 
} from 'recharts';
import { LevelInfo } from '../services/levelCalculator';
import AthleteDNA from './AthleteDNA'; // IMPORT ATHLETE DNA WIDGET

// --- WIDGET 1: IDENTITY ---
const IdentityWidget: React.FC<{ profile: UserProfile; onUpdate: (p: Partial<UserProfile>) => void }> = ({ profile, onUpdate }) => {
    return (
        <div className="energetic-card p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="text-purple-400"/> هویت ورزشکار (Athlete DNA)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                    <label className="text-xs text-gray-400 block mb-1">نام کامل</label>
                    <input 
                        value={profile.name} 
                        readOnly 
                        className="w-full input-styled p-3 bg-gray-900/50 cursor-not-allowed text-gray-500"
                    />
                </div>
                
                <div>
                    <label className="text-xs text-gray-400 block mb-1">سن</label>
                    <input 
                        type="number" 
                        value={profile.age || ''} 
                        onChange={e => onUpdate({ age: Number(e.target.value) })}
                        className="w-full input-styled p-3"
                    />
                </div>
                
                <div>
                    <label className="text-xs text-gray-400 block mb-1">جنسیت</label>
                    <select 
                        value={profile.gender || 'male'} 
                        onChange={e => onUpdate({ gender: e.target.value as any })}
                        className="w-full input-styled p-3"
                    >
                        <option value="male">مرد</option>
                        <option value="female">زن</option>
                    </select>
                </div>

                <div>
                    <label className="text-xs text-gray-400 block mb-1">سابقه تمرین</label>
                    <select 
                        value={profile.trainingAge || 'Beginner'} 
                        onChange={e => onUpdate({ trainingAge: e.target.value as any })}
                        className="w-full input-styled p-3"
                    >
                        <option value="Beginner">مبتدی (۰-۱ سال)</option>
                        <option value="Intermediate">متوسط (۱-۳ سال)</option>
                        <option value="Advanced">پیشرفته (۳-۵ سال)</option>
                        <option value="Elite">الیت (+۵ سال)</option>
                    </select>
                </div>

                <div>
                    <label className="text-xs text-gray-400 block mb-1">سطح فعالیت روزانه</label>
                    <select 
                        value={profile.lifestyleActivity || 'Active'} 
                        onChange={e => onUpdate({ lifestyleActivity: e.target.value as any })}
                        className="w-full input-styled p-3"
                    >
                        <option value="Sedentary">کم‌تحرک (پشت میز)</option>
                        <option value="Lightly Active">کمی فعال (۱-۳ روز)</option>
                        <option value="Active">فعال (تمرین منظم)</option>
                        <option value="Very Active">بسیار فعال (شغل فیزیکی)</option>
                    </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="text-xs text-gray-400 block mb-2">تیپ بدنی (Somatotype)</label>
                    <div className="flex gap-2">
                        {['Ectomorph', 'Mesomorph', 'Endomorph'].map(type => (
                            <button 
                                key={type}
                                onClick={() => onUpdate({ somatotype: type as any })}
                                className={`flex-1 py-3 rounded-xl border transition-all text-sm font-bold ${profile.somatotype === type ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-black/20 border-gray-600 text-gray-400 hover:bg-gray-800'}`}
                            >
                                {type === 'Ectomorph' ? 'اکتومورف (لاغر)' : type === 'Mesomorph' ? 'مزومورف (عضلانی)' : 'اندومورف (درشت)'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- WIDGET 2: BODY METRICS ---
const BodyMetricsWidget: React.FC<{ profile: UserProfile; onUpdate: (p: Partial<UserProfile>) => void }> = ({ profile, onUpdate }) => {
    const [weight, setWeight] = useState(profile.currentWeight || 0);
    
    const handleSave = () => {
        const newLog: BodyMetricLog = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('fa-IR'),
            weight: weight
        };
        const updatedHistory = [...(profile.metricsHistory || []), newLog];
        onUpdate({ currentWeight: weight, metricsHistory: updatedHistory });
        logBodyMetrics(profile.id, newLog);
        alert("وزن جدید ذخیره شد.");
    };

    return (
        <div className="energetic-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="text-blue-400"/> ترکیب بدنی
            </h3>
            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="text-xs text-gray-400 block mb-1">وزن فعلی (kg)</label>
                    <input 
                        type="number" 
                        value={weight} 
                        onChange={e => setWeight(Number(e.target.value))}
                        className="w-full input-styled p-3 text-center font-bold text-xl"
                    />
                </div>
                <button onClick={handleSave} className="btn-primary p-3 rounded-xl h-[52px]">
                    <Save size={24}/>
                </button>
            </div>
        </div>
    );
};

interface ProfileProps {
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  logs: DailyLog[];
  setCurrentView: (view: AppView) => void;
  athleteLevelInfo: LevelInfo;
}

const Profile: React.FC<ProfileProps> = ({ profile, updateProfile, logs, setCurrentView, athleteLevelInfo }) => {
    
    const handleUpdate = (updates: Partial<UserProfile>) => {
        updateProfile({ ...profile, ...updates });
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-1 space-y-6" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IdentityWidget profile={profile} onUpdate={handleUpdate} />
                <div className="space-y-6">
                    <BodyMetricsWidget profile={profile} onUpdate={handleUpdate} />
                    
                    {/* Athlete DNA / Photo Tracker */}
                    <div className="energetic-card p-0 border border-gray-700 bg-transparent overflow-hidden">
                        <AthleteDNA profile={profile} updateProfile={updateProfile} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
