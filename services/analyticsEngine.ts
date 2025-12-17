

import { 
    TrainingLog, 
    AnalyticsTimeframe, 
    VolumeDataPoint, 
    MuscleSplitStats,
    AnalyticsSummary,
    TrainingInsight,
    LogExercise,
    DesignerProgram,
    LogStatus,
    NutritionDayLog,
    NutritionReportData,
    NutritionTrendPoint,
    NutritionHeatmapPoint,
    NutritionAnalyticsSummary
} from '../types';
import { EXERCISE_DB } from './exerciseDatabase';

// --- HELPER FUNCTIONS ---

const getMuscleGroup = (exerciseName: string): string => {
    // Attempt to match with DB first
    const dbMatch = EXERCISE_DB.find(e => e.name_en === exerciseName || e.name_fa === exerciseName);
    if (dbMatch) return dbMatch.muscle;
    
    // Fallback logic based on common names
    const lower = exerciseName.toLowerCase();
    if (lower.includes('bench') || lower.includes('press') || lower.includes('fly')) return 'Chest';
    if (lower.includes('row') || lower.includes('pull') || lower.includes('deadlift')) return 'Back';
    if (lower.includes('squat') || lower.includes('leg') || lower.includes('lunge')) return 'Legs';
    if (lower.includes('curl')) return 'Biceps';
    if (lower.includes('extension') || lower.includes('pushdown')) return 'Triceps';
    if (lower.includes('raise') || lower.includes('shoulder')) return 'Shoulders';
    
    return 'Other';
};

const calculateLogVolume = (log: TrainingLog): number => {
    let totalVolume = 0;
    log.exercises.forEach(ex => {
        if (!ex.completed && log.status !== 'Completed') return; // Skip incomplete exercises if log isn't marked done
        ex.sets.forEach(set => {
            if (set.completed) {
                // If weight is 0 (bodyweight), assume 1 unit for volume calculation to track reps volume
                const weight = set.performedWeight && set.performedWeight > 0 ? set.performedWeight : 1; 
                const reps = set.performedReps || 0;
                totalVolume += weight * reps;
            }
        });
    });
    return totalVolume;
};

const calculateAdherenceScore = (log: TrainingLog): number => {
    switch (log.status) {
        case 'Completed': return 100;
        case 'Partial': return 60;
        case 'Skipped': return 0;
        case 'Rest': return 100; // Rest days count as adhered if respected
        case 'Planned': return 0; // Not done yet
        default: return 0;
    }
};

const getIntensity = (log: TrainingLog): number => {
    // Average RPE of all sets
    let totalRpe = 0;
    let count = 0;
    log.exercises.forEach(ex => {
        ex.sets.forEach(s => {
            if (s.completed && s.rpe) {
                totalRpe += s.rpe;
                count++;
            }
        });
    });
    return count > 0 ? Math.round((totalRpe / count) * 10) : 0; // 0-100 scale
};

// --- MAIN ENGINE: TRAINING ---

export const generateAnalyticsReport = (
    logs: TrainingLog[],
    timeframe: AnalyticsTimeframe
): {
    timelineData: VolumeDataPoint[];
    muscleStats: MuscleSplitStats[];
    summary: AnalyticsSummary;
    insights: TrainingInsight[];
} => {
    const now = new Date();
    let startDate = new Date();

    // 1. Filter Logs by Timeframe
    if (timeframe === 'week') {
        startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
        startDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
    }

    const filteredLogs = logs.filter(l => new Date(l.date) >= startDate).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Aggregate Timeline Data
    // Grouping depends on timeframe (Day by day for week/month, Monthly for year)
    const timelineData: VolumeDataPoint[] = [];
    const muscleMap: Record<string, number> = {};
    let totalVol = 0;
    let totalAdherence = 0;
    let completedCount = 0;
    let missedCount = 0;
    
    // Grouping Logic
    if (timeframe === 'year') {
        // Group by Month
        const monthlyGroups: Record<string, TrainingLog[]> = {};
        filteredLogs.forEach(l => {
            const key = l.date.substring(0, 7); // YYYY-MM
            if (!monthlyGroups[key]) monthlyGroups[key] = [];
            monthlyGroups[key].push(l);
        });

        Object.keys(monthlyGroups).sort().forEach(month => {
            const group = monthlyGroups[month];
            const vol = group.reduce((sum, l) => sum + calculateLogVolume(l), 0);
            const adh = group.reduce((sum, l) => sum + calculateAdherenceScore(l), 0) / group.length;
            const int = group.reduce((sum, l) => sum + getIntensity(l), 0) / group.length;
            
            timelineData.push({
                date: month,
                label: month,
                volume: vol,
                intensity: int,
                adherence: Math.round(adh)
            });
        });
    } else {
        // Group by Day (for Week/Month views)
        filteredLogs.forEach(log => {
            const vol = calculateLogVolume(log);
            const adh = calculateAdherenceScore(log);
            const int = getIntensity(log);

            timelineData.push({
                date: log.date,
                label: log.date.split('/').slice(1).join('/'), // Remove Year for shorter label
                volume: vol,
                intensity: int,
                adherence: adh
            });

            // Aggregate Totals
            totalVol += vol;
            totalAdherence += adh;
            if (log.status === 'Completed') completedCount++;
            if (log.status === 'Skipped') missedCount++;

            // Muscle Stats
            log.exercises.forEach(ex => {
                const muscle = getMuscleGroup(ex.name);
                if (!muscleMap[muscle]) muscleMap[muscle] = 0;
                muscleMap[muscle] += ex.sets.filter(s => s.completed).length;
            });
        });
    }

    // 3. Muscle Stats Array
    const muscleStats = Object.entries(muscleMap).map(([muscle, setVolume]) => ({
        muscle, setVolume
    })).sort((a,b) => b.setVolume - a.setVolume);

    // 4. Calculate Summary
    const totalDays = filteredLogs.length || 1;
    const summary: AnalyticsSummary = {
        totalWorkouts: filteredLogs.length,
        completionRate: Math.round((completedCount / (filteredLogs.filter(l => l.status !== 'Rest').length || 1)) * 100),
        totalVolume: totalVol,
        missedWorkouts: missedCount,
        bestStreak: calculateStreak(filteredLogs)
    };

    // 5. Generate Insights
    const insights: TrainingInsight[] = [];
    
    // Trend Insight
    if (timelineData.length >= 2) {
        const firstHalf = timelineData.slice(0, Math.floor(timelineData.length / 2));
        const secondHalf = timelineData.slice(Math.floor(timelineData.length / 2));
        
        const avgVol1 = firstHalf.reduce((s, d) => s + d.volume, 0) / (firstHalf.length || 1);
        const avgVol2 = secondHalf.reduce((s, d) => s + d.volume, 0) / (secondHalf.length || 1);
        
        if (avgVol2 > avgVol1 * 1.1) {
            insights.push({ type: 'positive', metric: 'Volume', message: 'حجم تمرین شما روند صعودی دارد. (۱۰٪+ رشد)' });
        } else if (avgVol2 < avgVol1 * 0.8) {
            insights.push({ type: 'negative', metric: 'Volume', message: 'کاهش حجم تمرینی مشاهده می‌شود.' });
        }
    }

    // Adherence Insight
    if (summary.completionRate > 90) {
        insights.push({ type: 'positive', metric: 'Consistency', message: 'پایبندی فوق‌العاده! شما تقریبا هیچ جلسه‌ای را از دست نداده‌اید.' });
    } else if (summary.completionRate < 60) {
        insights.push({ type: 'negative', metric: 'Consistency', message: 'ثبات تمرینی پایین است. سعی کنید روزهای تمرین را فیکس کنید.' });
    }

    // Balance Insight
    if (muscleStats.length > 0) {
        const topMuscle = muscleStats[0];
        insights.push({ type: 'neutral', metric: 'Focus', message: `بیشترین تمرکز تمرینی شما روی عضلات ${translateMuscle(topMuscle.muscle)} بوده است.` });
    }

    return { timelineData, muscleStats, summary, insights };
};

const calculateStreak = (logs: TrainingLog[]): number => {
    let maxStreak = 0;
    let currentStreak = 0;
    
    // Simplistic streak: consecutive entries in the log array that aren't skipped
    // In real app, check date continuity
    for (const log of logs) {
        if (log.status === 'Completed' || log.status === 'Rest') {
            currentStreak++;
        } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 0;
        }
    }
    return Math.max(maxStreak, currentStreak);
};

const translateMuscle = (en: string): string => {
    const map: Record<string, string> = {
        'Chest': 'سینه', 'Back': 'پشت', 'Legs': 'پا', 'Shoulders': 'سرشانه',
        'Biceps': 'جلو بازو', 'Triceps': 'پشت بازو', 'Core': 'شکم', 'Glutes': 'باسن'
    };
    return map[en] || en;
};

// --- MAIN ENGINE: NUTRITION (NEW) ---

export const generateNutritionReport = (
    logs: NutritionDayLog[],
    timeframe: AnalyticsTimeframe
): NutritionReportData => {
    const now = new Date();
    let startDate = new Date();

    // 1. Filter Logs by Timeframe
    if (timeframe === 'week') {
        startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
        startDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
    }

    const filteredLogs = logs.filter(l => new Date(l.date) >= startDate).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Generate Timeline & Summary
    const timeline: NutritionTrendPoint[] = [];
    const heatmap: NutritionHeatmapPoint[] = [];
    
    let totalAdherence = 0;
    let totalCalorieDiff = 0;
    let totalProtein = 0;
    let logCount = filteredLogs.length;
    let currentStreak = 0;
    let maxStreak = 0;
    
    let totalP = 0, totalC = 0, totalF = 0;

    filteredLogs.forEach(log => {
        const target = log.totalTargetMacros.calories || 2500; // default fallback
        const actual = log.totalConsumedMacros.calories;
        const adherence = Math.min(100, Math.round((actual / target) * 100));
        
        // Streak Logic (Adherence > 80% or status Completed)
        if (adherence > 80 || log.status === 'Completed') {
            currentStreak++;
        } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 0;
        }

        totalAdherence += adherence;
        totalCalorieDiff += (actual - target);
        totalProtein += log.totalConsumedMacros.protein;
        
        totalP += log.totalConsumedMacros.protein;
        totalC += log.totalConsumedMacros.carbs;
        totalF += log.totalConsumedMacros.fats;

        timeline.push({
            date: log.date,
            label: log.date.split('-').slice(1).join('/'), // MM/DD
            calories: actual,
            targetCalories: target,
            protein: log.totalConsumedMacros.protein,
            carbs: log.totalConsumedMacros.carbs,
            fats: log.totalConsumedMacros.fats,
            adherence
        });

        heatmap.push({
            date: log.date,
            adherence,
            status: log.status === 'Completed' ? 'completed' : adherence > 50 ? 'partial' : 'missed'
        });
    });

    maxStreak = Math.max(maxStreak, currentStreak);

    const summary: NutritionAnalyticsSummary = {
        avgAdherence: logCount > 0 ? Math.round(totalAdherence / logCount) : 0,
        avgCalories: logCount > 0 ? Math.round(filteredLogs.reduce((s,l) => s + l.totalConsumedMacros.calories, 0) / logCount) : 0,
        calorieDeviation: logCount > 0 ? Math.round(totalCalorieDiff / logCount) : 0,
        avgProtein: logCount > 0 ? Math.round(totalProtein / logCount) : 0,
        currentStreak: maxStreak, // Using max for now as 'best streak' in range
        habitCompletionRate: 0, // Placeholder if habits linked to logs
        backfillCount: 0 // Placeholder
    };

    // Macro Distribution
    const macroDistribution = [
        { name: 'Protein', value: totalP, fill: '#3b82f6' },
        { name: 'Carbs', value: totalC, fill: '#10b981' },
        { name: 'Fats', value: totalF, fill: '#facc15' },
    ];

    // Insights
    const insights: TrainingInsight[] = [];
    if (summary.avgAdherence > 90) {
        insights.push({ type: 'positive', metric: 'Adherence', message: 'پایبندی شما به رژیم عالی است!' });
    } else if (summary.avgAdherence < 60) {
        insights.push({ type: 'negative', metric: 'Adherence', message: 'نوسان زیادی در دریافت کالری دارید.' });
    }

    if (summary.avgProtein < 120) { // Arbitrary threshold
        insights.push({ type: 'neutral', metric: 'Protein', message: 'مصرف پروتئین می‌تواند بیشتر شود.' });
    }

    return { timeline, heatmap, summary, macroDistribution, insights };
};
