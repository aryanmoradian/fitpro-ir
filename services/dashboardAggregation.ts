
import { UserProfile, DailyLog, DashboardKPIs } from '../types';
import { analyzeHealthRisk } from './healthService';

/**
 * Calculates all 10 Key Performance Indicators for the main dashboard
 * by aggregating data from various profile modules.
 */
export const calculateDashboardKPIs = (profile: UserProfile, logs: DailyLog[]): DashboardKPIs => {
    const safeLogs = logs || [];
    const today = new Date().toLocaleDateString('fa-IR');
    const todayLog = safeLogs.find(l => l.date === today);
    const last7Days = safeLogs.slice(-7);

    // 1. PROFILE KPI (Completion)
    let missingFields: string[] = [];
    if (!profile.age) missingFields.push('Age');
    if (!profile.height) missingFields.push('Height');
    if (!profile.currentWeight) missingFields.push('Weight');
    if (!profile.bodyFat) missingFields.push('Body Fat');
    if (!profile.goalType) missingFields.push('Goal');
    const completionPct = Math.round(((5 - missingFields.length) / 5) * 100);

    // 2. DAILY LOG KPI (Consistency)
    const recentActivity = safeLogs.slice(-30);
    const activityDays = recentActivity.filter(l => l.workoutScore > 0 || l.nutritionScore > 0).length;
    const consistencyScore = Math.min(100, Math.round((activityDays / 30) * 100));
    
    // Calculate Streak
    let streak = 0;
    for (let i = safeLogs.length - 1; i >= 0; i--) {
        if (safeLogs[i].workoutScore > 0) streak++;
        else break;
    }

    // 3. SASKA PROGRAMMER (Adherence)
    let programAdherence = 0;
    if (profile.activeProgram || profile.smartProgram) {
        // Mock logic: Check if recent logs align with expected frequency
        const workoutsDone = recentActivity.filter(l => l.workoutScore > 0).length;
        programAdherence = Math.min(100, Math.round((workoutsDone / 4) * 100)); // Assuming 4/week target
    }

    // 4. TRAINING CENTER (Volume)
    // Simplified volume calc from trainingLogs if available, else standard logs
    let weeklyVolume = 0;
    // We use a proxy from standard logs if trainingLogs details missing
    // In real app, iterate profile.trainingLogs
    const tLogs = profile.trainingLogs || [];
    const recentTLogs = tLogs.slice(-7);
    recentTLogs.forEach(l => {
        l.exercises.forEach(ex => {
            ex.sets.forEach(s => {
                if (s.completed) weeklyVolume += (s.performedWeight || 0) * (s.performedReps || 0);
            });
        });
    });
    // Fallback if no detailed logs
    if (weeklyVolume === 0) weeklyVolume = last7Days.reduce((acc, l) => acc + (l.workoutScore * 100), 0); 

    // 5. NUTRITION CENTER (Calories)
    const avgCalories = last7Days.length > 0 
        ? Math.round(last7Days.reduce((acc, l) => acc + (l.consumedMacros?.calories || 0), 0) / last7Days.length)
        : 0;
        
    // Attempt to find target from nutrition logs, or use default
    const lastDate = last7Days.length > 0 ? last7Days[last7Days.length-1].date : today;
    const nutLog = profile.nutritionLogs?.find(nl => nl.date === lastDate);
    const calorieGoal = nutLog?.totalTargetMacros?.calories || 2500;
    
    const nutritionAdherence = calorieGoal > 0 ? Math.round((avgCalories / calorieGoal) * 100) : 0;

    // 6. SUPPLEMENTS (Compliance)
    const activeSupplements = profile.supplements?.filter(s => s.isActive) || [];
    const todaySuppLogs = profile.supplementLogs?.filter(l => l.date === today && l.consumed) || [];
    const suppAdherence = activeSupplements.length > 0 
        ? Math.round((todaySuppLogs.length / activeSupplements.length) * 100)
        : 100;

    // 7. RECORDS (Count)
    const totalPBs = profile.performanceProfile?.records.length || 0;
    const lastPB = profile.performanceProfile?.records[profile.performanceProfile.records.length - 1]?.name;

    // 8. SNACK SCAN (Inflammation)
    // Mock logic: derive from nutrition score inverse (lower score = higher inflammation risk proxy)
    const inflammationScore = todayLog ? (100 - todayLog.nutritionScore) : 0;
    let inflammationLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (inflammationScore > 60) inflammationLevel = 'High';
    else if (inflammationScore > 30) inflammationLevel = 'Medium';

    // 9. HEALTH CENTER (Risk)
    const healthAnalysis = analyzeHealthRisk(safeLogs, profile);
    
    // 10. BIO ANALYSIS (Trend)
    const bioTrend = 'Stable'; // Placeholder for complex trend logic

    return {
        profile: { completionPct, missingFields },
        dailyLog: { consistencyScore, streak, hasAlert: consistencyScore < 50 },
        planner: { adherenceRate: programAdherence, activeProgramName: profile.activeProgram?.title || 'No Active Plan' },
        training: { weeklyVolume, volumeTrend: 0 },
        nutrition: { avgCalories, calorieGoal, adherence: nutritionAdherence },
        supplements: { adherence: suppAdherence },
        performance: { totalPBs, lastPB },
        snackScan: { avgInflammation: inflammationLevel, score: inflammationScore },
        health: { riskLevel: healthAnalysis.injuryRisk, recoveryIndex: profile.advancedHealth?.recoveryIndex || 0 },
        bio: { trend: bioTrend, label: 'Stable' }
    };
};