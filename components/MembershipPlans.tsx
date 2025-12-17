
import React from 'react';
import { AppView, SubscriptionTier } from '../types';
import { calculatePrice } from '../services/pricingService';
import { Check, Star, Zap, Shield, Crown, ArrowRight, TrendingUp } from 'lucide-react';

interface MembershipPlansProps {
  setCurrentView: (view: AppView) => void;
  setTargetTier: (tier: SubscriptionTier) => void;
  setTargetDuration?: (duration: number) => void;
}

const PlanCard: React.FC<{
  duration: number;
  label: string;
  isPopular?: boolean;
  onSelect: () => void;
}> = ({ duration, label, isPopular, onSelect }) => {
  const price = calculatePrice('elite', duration); 

  return (
    <div 
        onClick={onSelect}
        className={`relative bg-[#1E293B] border-2 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer group hover:scale-105 ${isPopular ? 'border-[#D4FF00] shadow-[0_0_20px_rgba(212,255,0,0.2)]' : 'border-gray-700 hover:border-gray-500'}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4FF00] text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
          محبوب‌ترین
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-white mb-2">{label}</h3>
        <div className="flex items-baseline gap-2 mb-1" dir="ltr">
            <span className="text-3xl font-black text-white">${price.totalUSD}</span>
            {price.discountPercent > 0 && (
                <span className="text-sm text-gray-500 line-through decoration-red-500">${price.baseUSD}</span>
            )}
        </div>
        {price.discountPercent > 0 && (
            <div className="inline-block bg-green-900/30 text-green-400 text-xs font-bold px-2 py-1 rounded mb-4 border border-green-500/20">
                {price.discountPercent}% تخفیف
            </div>
        )}
        <p className="text-gray-400 text-xs mb-6">
            معادل ماهانه: <span className="text-white font-bold" dir="ltr">${price.monthlyEquivalentUSD}</span>
        </p>

        <ul className="space-y-3 text-sm text-gray-300 mb-8">
            <li className="flex items-center"><Check size={16} className="mr-2 text-green-500"/> دسترسی کامل به ۱۲ ماژول</li>
            <li className="flex items-center"><Check size={16} className="mr-2 text-green-500"/> آنالیز هوشمند (AI)</li>
            <li className="flex items-center"><Check size={16} className="mr-2 text-green-500"/> آپدیت‌های اختصاصی</li>
        </ul>
      </div>

      <button className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center transition ${isPopular ? 'bg-[#D4FF00] hover:bg-white text-black' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>
         انتخاب طرح <ArrowRight size={16} className="ml-2 rotate-180"/>
      </button>
    </div>
  );
};

const MembershipPlans: React.FC<MembershipPlansProps> = ({ setCurrentView, setTargetTier, setTargetDuration }) => {
  
  const handleSelectPlan = (duration: number) => {
    setTargetTier('elite'); // We unify under 'Elite' for this model
    if (setTargetDuration) {
        setTargetDuration(duration);
    }
    setCurrentView(AppView.PAYMENT);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 bg-[#0F172A] animate-in fade-in" dir="rtl">
      
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-yellow-900/20 border border-yellow-500/30 px-4 py-1.5 rounded-full text-yellow-400 text-xs font-bold mb-4">
            <Crown size={14} /> عضویت ویژه ورزشکاران
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">سرمایه‌گذاری روی قهرمان درون</h1>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            با انتخاب یکی از پلن‌های زیر، به تمام ابزارهای پیشرفته، تحلیل‌های هوشمند و برنامه‌های اختصاصی دسترسی پیدا کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        <PlanCard 
            duration={1} 
            label="اشتراک ۱ ماهه" 
            onSelect={() => handleSelectPlan(1)}
        />
        <PlanCard 
            duration={3} 
            label="اشتراک ۳ ماهه" 
            isPopular 
            onSelect={() => handleSelectPlan(3)}
        />
        <PlanCard 
            duration={12} 
            label="اشتراک ۱۲ ماهه" 
            onSelect={() => handleSelectPlan(12)}
        />
      </div>

      {/* Benefits Section */}
      <div className="max-w-4xl mx-auto bg-[#1E293B] border border-gray-700 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 text-center">چرا عضویت ویژه؟</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
                <div className="bg-blue-900/20 p-3 rounded-xl h-fit text-blue-400"><TrendingUp size={24}/></div>
                <div>
                    <h4 className="font-bold text-white mb-1">پیشرفت سریع‌تر</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">دسترسی به تحلیل‌های پیشرفته و نمودارهای روند که نقاط ضعف و قوت شما را آشکار می‌کنند.</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="bg-purple-900/20 p-3 rounded-xl h-fit text-purple-400"><Zap size={24}/></div>
                <div>
                    <h4 className="font-bold text-white mb-1">مربی هوشمند AI</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">دریافت برنامه‌های تمرینی و غذایی شخصی‌سازی شده بر اساس دیتای بدن شما.</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="bg-green-900/20 p-3 rounded-xl h-fit text-green-400"><Shield size={24}/></div>
                <div>
                    <h4 className="font-bold text-white mb-1">آنالیز سلامت</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">رصد دقیق فاکتورهای ریکاوری، خواب و ریسک آسیب‌دیدگی.</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="bg-yellow-900/20 p-3 rounded-xl h-fit text-yellow-400"><Star size={24}/></div>
                <div>
                    <h4 className="font-bold text-white mb-1">امکانات نامحدود</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">استفاده بدون محدودیت از تمام ابزارها، اسکنر خوراکی و بخش‌های VIP.</p>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default MembershipPlans;
