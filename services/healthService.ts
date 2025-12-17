
import { DailyLog, UserProfile, HealthProfile, AdvancedHealthData } from '../types';

/**
 * Calculates recommended daily water intake (ml) based on Bodybuilding standard.
 * Formula: Weight (kg) / 25 = Liters
 * Factors: +0.5L for High Intensity Training, +1.0L for Hot Environment
 */
export const calculateScientificWaterNeeds = (
    weight: number, 
    isHighIntensity: boolean = false, 
    isHotWeather: boolean = false
): number => {
    let liters = weight / 25;
    
    if (isHighIntensity) liters += 0.5;
    if (isHotWeather) liters += 1.0;
    
    return Math.round(liters * 1000); // Return in ml
};

// Legacy fallback (kept for compatibility if needed elsewhere, otherwise replaced)
export const calculateHydrationGoal = (weight: number, activityLevel: 'Sedentary' | 'Active' | 'Very Active' = 'Active'): number => {
    return calculateScientificWaterNeeds(weight, activityLevel !== 'Sedentary', false);
};

export const getHydrationStatus = (current: number, goal: number): 'Dehydrated' | 'Good' | 'Optimal' => {
    const ratio = current / goal;
    if (ratio < 0.5) return 'Dehydrated';
    if (ratio < 0.9) return 'Good';
    return 'Optimal';
};

/**
 * ANALYSIS ENGINE: Predictive Health
 * Calculates Overtraining Risk and Injury Susceptibility based on recent logs.
 */
export const analyzeHealthRisk = (logs: DailyLog[], profile: UserProfile): { 
    overtrainingScore: number; // 0-10 (10 = severe risk)
    injuryRisk: 'Low' | 'Medium' | 'High';
    fatigueLevel: number; // 0-100
    insights: string[];
    recommendations: string[];
} => {
    const recentLogs = logs.slice(-7); // Last 7 days
    if (recentLogs.length < 3) {
        return { 
            overtrainingScore: 0, 
            injuryRisk: 'Low', 
            fatigueLevel: 0, 
            insights: ['داده کافی برای تحلیل وجود ندارد. لطفا فعالیت‌های بیشتری ثبت کنید.'],
            recommendations: ['به ثبت روزانه تمرینات ادامه دهید.']
        };
    }

    let totalLoad = 0;
    let totalSleep = 0;
    let sleepCount = 0;
    let highIntensityDays = 0;

    recentLogs.forEach(log => {
        // Estimate load: Workout Score (0-100) * Duration (est. 60m if not set) * RPE (est. based on score)
        // Simplified metric: Workout Score as proxy for intensity/volume load
        totalLoad += log.workoutScore; 
        if (log.workoutScore > 80) highIntensityDays++;
        
        if (log.sleepHours) {
            totalSleep += log.sleepHours;
            sleepCount++;
        }
    });

    const avgSleep = sleepCount > 0 ? totalSleep / sleepCount : 7;
    const avgLoad = totalLoad / recentLogs.length;

    // 1. Overtraining Score Calculation
    // Base score on load density
    let score = (avgLoad / 100) * 5; 
    
    // Penalty for low sleep
    if (avgSleep < 6) score += 3;
    else if (avgSleep < 7) score += 1;
    
    // Penalty for lack of rest days (if 5+ high intensity days in 7 days)
    if (highIntensityDays > 5) score += 2;

    const overtrainingScore = Math.min(10, Math.round(score * 10) / 10);

    // 2. Injury Risk Assessment
    let injuryRisk: 'Low' | 'Medium' | 'High' = 'Low';
    if (overtrainingScore > 7) injuryRisk = 'High';
    else if (overtrainingScore > 4) injuryRisk = 'Medium';

    // 3. Fatigue Level (inverse of recovery)
    // 100 = Exhausted, 0 = Fresh
    let fatigue = overtrainingScore * 10;
    // Adjust by nutrition if available
    const lastLog = recentLogs[recentLogs.length - 1];
    if (lastLog.nutritionScore < 50) fatigue += 10;
    
    const fatigueLevel = Math.min(100, Math.max(0, Math.round(fatigue)));

    // 4. Insights & Recommendations
    const insights: string[] = [];
    const recommendations: string[] = [];

    if (injuryRisk === 'High') {
        insights.push("ریسک آسیب‌دیدگی بالاست. حجم تمرین شما نسبت به ریکاوری (خواب/تغذیه) نامتعادل است.");
        recommendations.push("۴۸ ساعت استراحت فعال (پیاده‌روی، کشش) پیشنهاد می‌شود.");
        recommendations.push("مصرف پروتئین و آب را افزایش دهید.");
    } else if (injuryRisk === 'Medium') {
        insights.push("فشار تمرینی قابل توجه است. مراقب علائم خستگی مزمن باشید.");
        recommendations.push("یک جلسه ماساژ یا فوم رولر می‌تواند مفید باشد.");
    } else {
        insights.push("وضعیت سلامت و ریکاوری پایدار است.");
        recommendations.push("روند فعلی را حفظ کنید و به تدریج بار تمرینی را افزایش دهید.");
    }

    if (avgSleep < 6.5) {
        insights.push("میانگین خواب شما پایین‌تر از حد توصیه شده برای ورزشکاران است.");
        recommendations.push("سعی کنید ۳۰ دقیقه زودتر به رختخواب بروید.");
    }

    return { overtrainingScore, injuryRisk, fatigueLevel, insights, recommendations };
};
