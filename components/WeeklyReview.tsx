
import React from 'react';
import { DailyLog } from '../types';
import { X, Calendar, TrendingUp, Award, Share2 } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyReviewProps {
  logs: DailyLog[];
  onClose: () => void;
}

const WeeklyReview: React.FC<WeeklyReviewProps> = ({ logs, onClose }) => {
  const last7Days = logs.slice(-7);
  const totalWorkouts = last7Days.filter(l => l.workoutScore > 0).length;
  const avgSleep = last7Days.reduce((acc, l) => acc + (l.sleepHours || 0), 0) / (last7Days.length || 1);
  const perfectDays = last7Days.filter(l => l.nutritionScore > 80 && l.workoutScore > 80).length;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#0F172A] border border-purple-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row">
        
        {/* Left Side: Visuals */}
        <div className="md:w-2/5 bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 flex flex-col justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <h2 className="text-2xl font-black text-white mb-2">هفته درخشان!</h2>
            <p className="text-purple-200 text-sm">شما {totalWorkouts} جلسه تمرینی را با موفقیت پشت سر گذاشتید.</p>
            
            <div className="mt-8 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-3xl font-black text-white">{perfectDays}</div>
                <div className="text-xs text-purple-200 uppercase tracking-widest">روزهای طلایی</div>
            </div>
        </div>

        {/* Right Side: Stats */}
        <div className="md:w-3/5 p-8 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X /></button>
            
            <h3 className="font-bold text-white mb-6 flex items-center"><Calendar className="mr-2 text-purple-400"/> گزارش عملکرد هفتگی</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-400 block mb-1">میانگین خواب</span>
                    <span className="text-xl font-bold text-blue-300">{avgSleep.toFixed(1)}h</span>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-400 block mb-1">امتیاز کل</span>
                    <span className="text-xl font-bold text-green-300">A+</span>
                </div>
            </div>

            <div className="h-32 w-full bg-black/20 rounded-xl border border-white/5 mb-6 p-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last7Days}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" hide />
                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px'}} />
                        <Area type="monotone" dataKey="workoutScore" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold text-sm">بستن</button>
                <button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center shadow-lg shadow-purple-900/20">
                    <Share2 size={16} className="mr-2"/> اشتراک‌گذاری
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default WeeklyReview;
