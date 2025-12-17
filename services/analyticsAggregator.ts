
import { 
    UserProfile, DailyLog, AnalyticsAggregatedData, 
    HealthAnalyticsNode, TrainingAnalyticsNode, NutritionAnalyticsNode, 
    PerformanceAnalyticsNode, SupplementAnalyticsNode, BioAnalyticsNode 
} from '../types';

// --- NODE 1: HEALTH ---
const aggregateHealthData = (profile: UserProfile, logs: DailyLog[]): HealthAnalyticsNode => {
    const recentLogs = logs.slice(-30);
    const avgSleep = recentLogs.length > 0 ? recentLogs.reduce((acc, l) => acc + (l.sleepHours || 0), 0) / recentLogs.length : 0;
    const avgEnergy = recentLogs.length > 0 ? recentLogs.reduce((acc, l) => acc + (l.energyLevel || 0), 0) / recentLogs.length : 0;
    const avgStress = recentLogs.length > 0 ? recentLogs.reduce((acc, l) => acc + (l.stressIndex || 0), 0) / recentLogs.length : 0;

    // Calculate Trend
    let vitalTrend: 'Improving' | 'Stable' | 'Declining' = 'Stable';
    if (recentLogs.length >= 7) {
        const lastWeekSleep = recentLogs.slice(-7).reduce((acc, l) => acc + (l.sleepHours || 0), 0);
        const prevWeekSleep = recentLogs.slice(-14, -7).reduce((acc, l) => acc + (l.sleepHours || 0), 0);
        if (lastWeekSleep > prevWeekSleep + 2) vitalTrend = 'Improving';
        else if (lastWeekSleep < prevWeekSleep - 2) vitalTrend = 'Declining';
    }

    // Weight Change
    let weightChangeMonthly = 0;
    if (profile.metricsHistory && profile.metricsHistory.length >= 2) {
        const sorted = [...profile.metricsHistory].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // Simple diff between latest and approx 30 days ago
        const latest = sorted[sorted.length-1].weight;
        const monthAgo = sorted.find(m => new Date(m.date).getTime() < new Date().getTime() - 2592000000); // 30 days
        if (monthAgo) weightChangeMonthly = latest - monthAgo.weight;
    }

    // Health Score (Mock Algorithm)
    const healthScore = Math.min(100, Math.round((avgSleep * 10) + (100 - avgStress)/2));

    return { avgSleep, avgEnergy, avgStress, vitalTrend, weightChangeMonthly, healthScore };
};

// --- NODE 2: TRAINING ---
const aggregateTrainingData = (profile: UserProfile, logs: DailyLog[]): TrainingAnalyticsNode => {
    const trainingLogs = profile.trainingLogs || [];
    const recentLogs = trainingLogs.filter(l => new Date(l.date).getTime() > new Date().getTime() - 2592000000); // Last 30 days

    let totalVolume = 0;
    recentLogs.forEach(l => {
        l.exercises.forEach(ex => {
            ex.sets.forEach(s => {
                if (s.completed) totalVolume += (s.performedWeight || 0) * (s.performedReps || 0);
            });
        });
    });

    const frequency = recentLogs.length / 4; // Avg per week
    const intensityTrend = frequency > 4 ? 'High' : frequency > 2 ? 'Moderate' : 'Low';
    
    // Efficiency: Completed / Planned
    const completedCount = recentLogs.filter(l => l.status === 'Completed').length;
    const efficiencyRating = recentLogs.length > 0 ? Math.round((completedCount / recentLogs.length) * 100) : 0;

    return { totalVolumeMonthly: totalVolume, workoutFrequencyWeekly: frequency, intensityTrend, efficiencyRating };
};

// --- NODE 3: NUTRITION ---
const aggregateNutritionData = (profile: UserProfile, logs: DailyLog[]): NutritionAnalyticsNode => {
    const nutritionLogs = profile.nutritionLogs || [];
    const recent = nutritionLogs.slice(-30);
    
    if (recent.length === 0) {
        return { avgDailyCalories: 0, macroAdherence: 0, caloricBalance: 'Maintenance', qualityIndex: 0 };
    }

    const avgCals = recent.reduce((sum, l) => sum + l.totalConsumedMacros.calories, 0) / recent.length;
    
    // Adherence
    const perfectDays = recent.filter(l => {
        const target = l.totalTargetMacros.calories || 2500;
        const ratio = l.totalConsumedMacros.calories / target;
        return ratio >= 0.9 && ratio <= 1.1;
    }).length;
    const macroAdherence = Math.round((perfectDays / recent.length) * 100);

    const goal = profile.goalType;
    let balance: 'Surplus' | 'Deficit' | 'Maintenance' = 'Maintenance';
    // Simplified logic
    if (goal === 'fatLoss') balance = 'Deficit';
    else if (goal === 'muscleGain') balance = 'Surplus';

    return { avgDailyCalories: Math.round(avgCals), macroAdherence, caloricBalance: balance, qualityIndex: 85 }; // 85 is placeholder for quality algorithm
};

// --- NODE 4: PERFORMANCE ---
const aggregatePerformanceData = (profile: UserProfile): PerformanceAnalyticsNode => {
    const records = profile.performanceProfile?.records || [];
    // Calculate Strength Progression (Compare best of this month vs last month)
    // Simplified: Just returning mockup or flat growth
    return {
        strengthProgression: 5.2, // Mock 5.2% growth
        prCountMonthly: records.filter(r => new Date(r.date).getTime() > new Date().getTime() - 2592000000).length,
        powerIndex: 72 // Mock Index
    };
};

// --- NODE 5: SUPPLEMENTS ---
const aggregateSupplementData = (profile: UserProfile): SupplementAnalyticsNode => {
    const activeSupps = profile.supplements?.filter(s => s.isActive).length || 0;
    const logs = profile.supplementLogs || [];
    const recentLogs = logs.slice(-30); // Approx last 30 entries (not days, simplified)
    
    // Adherence: Consumed / (Active * Days) -> Simplified to just logged ratio
    const consumed = recentLogs.filter(l => l.consumed).length;
    const adherenceScore = activeSupps > 0 ? Math.min(100, Math.round((consumed / (activeSupps * 30)) * 100)) : 100;

    return {
        adherenceScore,
        stackEfficiency: 88, // Mock score based on stack composition vs goal
        dailyConsistency: adherenceScore > 80
    };
};

// --- NODE 6: BIO ---
const aggregateBioData = (profile: UserProfile): BioAnalyticsNode => {
    const scans = profile.bodyScans || [];
    if (scans.length < 2) {
        return { bodyFatTrend: 0, muscleMassTrend: 0, adaptationLevel: 'Medium' };
    }
    
    const sorted = [...scans].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length-1];
    const prev = sorted[sorted.length-2];
    
    const bfChange = (latest.stats?.bodyFat || 0) - (prev.stats?.bodyFat || 0);
    const mmChange = (latest.stats?.leanMass || 0) - (prev.stats?.leanMass || 0);

    return {
        bodyFatTrend: parseFloat(bfChange.toFixed(1)),
        muscleMassTrend: parseFloat(mmChange.toFixed(1)),
        adaptationLevel: mmChange > 0 ? 'High' : 'Medium'
    };
};

// --- MAIN AGGREGATOR ---
export const getAdvancedAnalytics = (profile: UserProfile, logs: DailyLog[]): AnalyticsAggregatedData => {
    return {
        health: aggregateHealthData(profile, logs),
        training: aggregateTrainingData(profile, logs),
        nutrition: aggregateNutritionData(profile, logs),
        performance: aggregatePerformanceData(profile),
        supplements: aggregateSupplementData(profile),
        bio: aggregateBioData(profile),
        meta: {
            lastUpdated: new Date().toISOString(),
            dataQualityScore: 92 // Mock system health score
        }
    };
};
