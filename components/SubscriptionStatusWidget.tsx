
import React, { useEffect, useRef, useState } from 'react';
import { UserProfile } from '../types';
import { getSubscriptionStatus, checkLatestStatus, SubscriptionStage } from '../services/subscriptionService';
import { 
    ShieldCheck, Clock, Lock, Loader2, CheckCircle2, 
    CreditCard, User, Zap, AlertTriangle, HelpCircle,
    Dumbbell, Utensils, Brain, Activity, RefreshCw
} from 'lucide-react';

interface Props {
    profile: UserProfile;
    onUpgrade: () => void;
    onStatusChange?: (newStatus: string) => void;
}

const STAGES: { id: SubscriptionStage; label: string; icon: React.ElementType }[] = [
    { id: 'TRIAL', label: 'دوره آزمایشی', icon: Clock },
    { id: 'PAYMENT_PENDING', label: 'انتخاب پلن', icon: CreditCard },
    { id: 'UNDER_REVIEW', label: 'بررسی ادمین', icon: Loader2 },
    { id: 'ACTIVE', label: 'فعال‌سازی', icon: ShieldCheck },
];

const ModuleStatus: React.FC<{ icon: React.ElementType; label: string; isLocked: boolean }> = ({ icon: Icon, label, isLocked }) => (
    <div className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${isLocked ? 'bg-red-900/10 border-red-500/20 opacity-60' : 'bg-green-900/10 border-green-500/20'}`}>
        <div className="relative">
            <Icon size={16} className={isLocked ? 'text-gray-500' : 'text-green-400'} />
            {isLocked && <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5"><Lock size={8} className="text-white"/></div>}
        </div>
        <span className="text-[9px] mt-1 text-gray-400">{label}</span>
    </div>
);

const SubscriptionStatusWidget: React.FC<Props> = ({ profile, onUpgrade, onStatusChange }) => {
    const { stage, daysRemaining, isValid, tierLabel, isTrial } = getSubscriptionStatus(profile);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    // Real-time Polling Logic
    useEffect(() => {
        // Poll if Under Review OR Payment Pending to catch updates instantly
        if (stage === 'UNDER_REVIEW' || stage === 'PAYMENT_PENDING') {
            setIsPolling(true);
            intervalRef.current = setInterval(async () => {
                const latest = await checkLatestStatus(profile.id);
                if (latest && latest.status !== profile.subscriptionStatus) {
                    // Status changed! Reload to reflect changes globally
                    // In a real app with React Query/Redux, we'd invalidate queries. 
                    // Here we force a reload for simplicity in the prototype.
                    window.location.reload(); 
                }
            }, 5000); // Check every 5s for better responsiveness
        } else {
            setIsPolling(false);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [stage, profile.id, profile.subscriptionStatus]);

    // Determine current step index for the visual timeline
    const getStepIndex = () => {
        if (stage === 'EXPIRED') return 0; // Show failed state manually
        if (stage === 'TRIAL') return 0;
        if (stage === 'PAYMENT_PENDING') return 1;
        if (stage === 'UNDER_REVIEW') return 2;
        if (stage === 'ACTIVE') return 3;
        return 0;
    };

    const currentStep = getStepIndex();
    
    // Status Colors & Text
    let statusColor = 'text-blue-400';
    let borderColor = 'border-blue-500/30';
    let statusBg = 'bg-blue-900/10';
    let message = '';
    let statusTitle = '';

    switch(stage) {
        case 'ACTIVE':
            statusTitle = 'اشتراک ویژه فعال';
            statusColor = 'text-green-400';
            borderColor = 'border-green-500/30';
            statusBg = 'bg-green-900/10';
            message = `شما به تمام امکانات ${tierLabel} دسترسی دارید. ${daysRemaining} روز باقی مانده.`;
            break;
        case 'UNDER_REVIEW':
            statusTitle = 'در حال بررسی...';
            statusColor = 'text-yellow-400';
            borderColor = 'border-yellow-500/30';
            statusBg = 'bg-yellow-900/10';
            message = 'پرداخت شما دریافت شد. سیستم در حال بررسی و فعال‌سازی خودکار است.';
            break;
        case 'PAYMENT_PENDING':
            statusTitle = 'انتظار پرداخت';
            statusColor = 'text-orange-400';
            borderColor = 'border-orange-500/30';
            statusBg = 'bg-orange-900/10';
            message = 'لطفا فرآیند پرداخت را تکمیل کنید تا حساب شما ارتقا یابد.';
            break;
        case 'TRIAL':
            statusTitle = 'دوره آزمایشی';
            statusColor = 'text-blue-400';
            borderColor = 'border-blue-500/30';
            statusBg = 'bg-blue-900/10';
            message = `${daysRemaining} روز از دوره رایگان باقی مانده است.`;
            break;
        case 'EXPIRED':
            statusTitle = 'اشتراک منقضی';
            statusColor = 'text-red-400';
            borderColor = 'border-red-500/50';
            statusBg = 'bg-red-900/20';
            message = 'دوره شما به پایان رسیده است. برای دسترسی مجدد به ماژول‌ها تمدید کنید.';
            break;
    }

    return (
        <div className={`energetic-card p-5 border ${borderColor} ${statusBg} relative overflow-hidden flex flex-col h-full min-h-[240px]`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-black/20 border border-white/5 shadow-inner`}>
                        {isPolling ? <Loader2 size={24} className={`animate-spin ${statusColor}`} /> : 
                         stage === 'ACTIVE' ? <Zap size={24} className={statusColor} fill="currentColor"/> :
                         <ShieldCheck size={24} className={statusColor} />
                        }
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            {statusTitle}
                            {stage === 'ACTIVE' && <span className="text-[10px] bg-green-500 text-black px-2 py-0.5 rounded-full font-black">PRO</span>}
                        </h3>
                        <p className={`text-xs font-mono mt-1 ${statusColor} font-bold flex items-center`}>
                            {tierLabel} {isPolling && <span className="ml-2 text-[10px] opacity-70 animate-pulse">(بروزرسانی زنده)</span>}
                        </p>
                    </div>
                </div>
                {stage !== 'ACTIVE' && stage !== 'UNDER_REVIEW' && (
                    <button onClick={onUpgrade} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition" title="راهنما">
                        <HelpCircle size={18}/>
                    </button>
                )}
            </div>

            {/* Timeline Stepper */}
            {stage !== 'EXPIRED' ? (
                <div className="relative mb-6 px-2">
                    {/* Line */}
                    <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-700 -z-0"></div>
                    <div className="absolute top-3 right-0 h-0.5 bg-green-500 -z-0 transition-all duration-1000" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
                    
                    <div className="flex justify-between relative z-10 flex-row-reverse"> 
                        {/* Reversed flex row for RTL Timeline */}
                        {STAGES.map((s, idx) => {
                            const isCompleted = idx < currentStep;
                            const isCurrent = idx === currentStep;
                            
                            return (
                                <div key={s.id} className="flex flex-col items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                        isCompleted ? 'bg-green-500 border-green-500 text-black' : 
                                        isCurrent ? `${statusColor.replace('text-', 'border-')} bg-[#1E293B] ${statusColor}` : 
                                        'bg-gray-800 border-gray-600 text-gray-500'
                                    }`}>
                                        {isCompleted ? <CheckCircle2 size={14} /> : 
                                         isCurrent && s.id === 'UNDER_REVIEW' ? <Loader2 size={12} className="animate-spin"/> :
                                         <s.icon size={12} />}
                                    </div>
                                    <span className={`text-[9px] ${isCurrent ? 'text-white font-bold' : 'text-gray-500'}`}>{s.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl mb-4 flex items-center gap-3">
                    <AlertTriangle size={24} className="text-red-500 shrink-0" />
                    <p className="text-xs text-red-200">{message}</p>
                </div>
            )}

            {/* Context Message */}
            {stage !== 'EXPIRED' && (
                <p className="text-xs text-gray-300 bg-black/20 p-3 rounded-lg mb-4 text-center border border-white/5 leading-relaxed">
                    {message}
                </p>
            )}

            {/* Module Status Indicators */}
            <div className="grid grid-cols-4 gap-2 mt-auto">
                <ModuleStatus icon={Dumbbell} label="تمرین" isLocked={!isValid} />
                <ModuleStatus icon={Utensils} label="تغذیه" isLocked={!isValid} />
                <ModuleStatus icon={Brain} label="مربی AI" isLocked={!isValid} />
                <ModuleStatus icon={Activity} label="تحلیل" isLocked={!isValid} />
            </div>

            {/* Action Button (Conditional) */}
            {(stage === 'TRIAL' || stage === 'EXPIRED' || stage === 'PAYMENT_PENDING') && (
                <button 
                    onClick={onUpgrade}
                    className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                >
                    {stage === 'EXPIRED' ? 'تمدید اشتراک' : stage === 'PAYMENT_PENDING' ? 'تکمیل پرداخت' : 'ارتقا به نسخه حرفه‌ای'}
                </button>
            )}
        </div>
    );
};

export default SubscriptionStatusWidget;
