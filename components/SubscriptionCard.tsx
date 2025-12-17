
import React from 'react';
import { UserProfile, AppView } from '../types';
import { ShieldCheck, Star } from 'lucide-react';

interface SubscriptionCardProps {
    profile: UserProfile;
    setCurrentView: (view: AppView) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ profile }) => {
    return (
        <div className="p-6 rounded-2xl border relative overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-green-500/50 shadow-lg">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full blur-2xl"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <ShieldCheck size={20} className="text-green-400" />
                            وضعیت دسترسی
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            سطح حساب: <span className="font-bold text-green-300">دسترسی کامل (Full Access)</span>
                        </p>
                    </div>
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30 flex items-center">
                        <Star size={12} className="mr-1"/> فعال
                    </span>
                </div>

                <div className="mt-4">
                    <p className="text-xs text-green-200/80 leading-relaxed bg-green-900/20 p-3 rounded-lg border border-green-500/30">
                        شما به تمامی امکانات پیشرفته، هوش مصنوعی و ابزارهای تحلیلی دسترسی نامحدود دارید.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCard;
