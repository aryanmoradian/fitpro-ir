
import { AIRecommendation, AIInsightCategory, AIAction, UserProfile, DailyLog } from '../types';

export const generateAIInsights = (
    profile: UserProfile, 
    logs: DailyLog[]
): AIRecommendation[] => {
    const insights: AIRecommendation[] = [];
    const today = new Date().toLocaleDateString('fa-IR');
    const todayLog = logs.find(l => l.date === today);
    const recentLogs = logs.slice(-7); // Last 7 days

    // 1. Recovery Recommendation
    if (todayLog) {
        const readiness = todayLog.workoutScore > 0 && todayLog.sleepHours && todayLog.sleepHours < 6;
        if (readiness) {
            insights.push({
                id: `ai_rec_recovery_${Date.now()}`,
                category: 'Recovery',
                title: 'نیاز به ریکاوری فعال',
                description: 'کیفیت خواب شما دیشب پایین بود (کمتر از ۶ ساعت). برای جلوگیری از خستگی مفرط، امروز فشار تمرین را کاهش دهید.',
                relatedMetrics: ['sleepHours', 'workoutScore'],
                actions: [
                    { label: 'کاهش شدت تمرین', type: 'reduce_load' },
                    { label: 'نوشیدن ۵۰۰ml آب اضافی', type: 'hydrate' },
                    { label: '۱۰ دقیقه کشش', type: 'stretch' }
                ],
                priority: 'high',
                confidence: 0.89,
                isArchived: false,
                timestamp: new Date().toISOString()
            });
        }
    }

    // 2. Nutrition Recommendation
    if (profile.nutritionProfile?.targets) {
        const avgProtein = recentLogs.reduce((acc, l) => acc + (l.consumedMacros?.protein || 0), 0) / (recentLogs.length || 1);
        const targetProtein = profile.nutritionProfile.targets.protein;
        
        if (avgProtein < targetProtein * 0.8) {
            insights.push({
                id: `ai_rec_nutrition_${Date.now()}`,
                category: 'Nutrition',
                title: 'کمبود پروتئین هفتگی',
                description: `میانگین مصرف پروتئین شما (${Math.round(avgProtein)}g) کمتر از هدف (${targetProtein}g) است. این موضوع می‌تواند ریکاوری عضلات را کند کند.`,
                relatedMetrics: ['nutritionScore', 'protein'],
                actions: [
                    { label: 'افزودن شیک پروتئین', type: 'supplement' },
                    { label: 'تنظیم برنامه غذایی', type: 'adjust_diet' }
                ],
                priority: 'medium',
                confidence: 0.92,
                isArchived: false,
                timestamp: new Date().toISOString()
            });
        }
    }

    // 3. Injury Prevention (Load Spike)
    if (recentLogs.length >= 3) {
        const last3DaysLoad = recentLogs.slice(-3).reduce((acc, l) => acc + l.workoutScore, 0);
        if (last3DaysLoad > 280) { // e.g. nearly 3 days of 100% intensity
             insights.push({
                id: `ai_rec_injury_${Date.now()}`,
                category: 'Injury',
                title: 'خطر تمرین‌زدگی (Overtraining)',
                description: 'حجم تمرین شما در ۳ روز گذشته بسیار بالا بوده است. خطر آسیب‌دیدگی مفاصل افزایش یافته است.',
                relatedMetrics: ['workoutScore', 'stressIndex'],
                actions: [
                    { label: 'روز استراحت کامل', type: 'rest' },
                    { label: 'ماساژ / فوم رولر', type: 'stretch' }
                ],
                priority: 'high',
                confidence: 0.85,
                isArchived: false,
                timestamp: new Date().toISOString()
            });
        }
    }

    // 4. Mental Health Check
    if (todayLog && (todayLog.stressIndex || 0) > 75) {
        insights.push({
            id: `ai_rec_mental_${Date.now()}`,
            category: 'Mental',
            title: 'سطح استرس بالا',
            description: 'شاخص استرس شما امروز بالاست. تمرینات تنفسی می‌تواند به کاهش کورتیزول کمک کند.',
            relatedMetrics: ['stressIndex'],
            actions: [
                { label: 'تمرین تنفس ۴-۷-۸', type: 'log_mental' },
                { label: 'مدیتیشن ۵ دقیقه‌ای', type: 'log_mental' }
            ],
            priority: 'medium',
            confidence: 0.78,
            isArchived: false,
            timestamp: new Date().toISOString()
        });
    }

    return insights;
};
