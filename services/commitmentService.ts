
import { UserProfile, DailyLog, AppView } from '../types';

export interface CommitmentStatus {
    id: AppView;
    title: string;
    isComplete: boolean;
    link: AppView;
    iconName: string;
}

export const getDailyCommitments = (profile: UserProfile, todayLog?: DailyLog): CommitmentStatus[] => {
    const today = new Date().toLocaleDateString('fa-IR');
    // Check overrides in todayLog (if passed)
    const overrides = todayLog?.commitmentOverrides || {};

    const checkStatus = (moduleId: AppView, checkFn: () => boolean): boolean => {
        if (overrides[moduleId]) return true;
        return checkFn();
    };

    const commitments: CommitmentStatus[] = [
        {
            id: AppView.TRAINING_CENTER,
            title: 'مرکز تمرین',
            link: AppView.TRAINING_CENTER,
            iconName: 'Dumbbell',
            isComplete: checkStatus(AppView.TRAINING_CENTER, () => {
                const logs = profile.trainingLogs || [];
                // Check if any log exists for today with status 'Completed' or 'Partial'
                // Note: date matching depends on format consistency (Persian Locale String)
                return logs.some(l => l.date === today && (l.status === 'Completed' || l.status === 'Partial'));
            })
        },
        {
            id: AppView.NUTRITION_CENTER,
            title: 'مرکز تغذیه',
            link: AppView.NUTRITION_CENTER,
            iconName: 'Utensils',
            isComplete: checkStatus(AppView.NUTRITION_CENTER, () => {
                const logs = profile.nutritionLogs || [];
                return logs.some(l => l.date === today);
            })
        },
        {
            id: AppView.HEALTH_HUB,
            title: 'مرکز سلامت',
            link: AppView.HEALTH_HUB,
            iconName: 'HeartPulse',
            isComplete: checkStatus(AppView.HEALTH_HUB, () => {
                const logs = profile.healthActivityLogs || [];
                return logs.some(l => l.date === new Date().toISOString().split('T')[0]); // Health uses ISO
            })
        },
        {
            id: AppView.PERFORMANCE_CENTER,
            title: 'رکورد و قدرت',
            link: AppView.PERFORMANCE_CENTER,
            iconName: 'Trophy',
            isComplete: checkStatus(AppView.PERFORMANCE_CENTER, () => {
                const records = profile.performanceProfile?.records || [];
                return records.some(r => r.date === today);
            })
        },
        {
            id: AppView.BODY_ANALYSIS,
            title: 'پروفایل و بدن',
            link: AppView.BODY_ANALYSIS,
            iconName: 'UserCircle',
            isComplete: checkStatus(AppView.BODY_ANALYSIS, () => {
                // Check metrics history or scans
                const metrics = profile.metricsHistory || [];
                // Metrics usually store ISO or Local depending on where they come from. 
                // Let's assume standard ISO YYYY-MM-DD for consistency in new code, but legacy might differ.
                // We check against both formats just in case.
                const isoToday = new Date().toISOString().split('T')[0];
                return metrics.some(m => m.date === today || m.date === isoToday) || 
                       (profile.bodyScans || []).some(s => s.date === isoToday);
            })
        },
        {
            id: AppView.SUPPLEMENT_MANAGER,
            title: 'مکمل‌ها',
            link: AppView.SUPPLEMENT_MANAGER,
            iconName: 'Pill',
            isComplete: checkStatus(AppView.SUPPLEMENT_MANAGER, () => {
                const logs = profile.supplementLogs || [];
                return logs.some(l => l.date === today && l.consumed);
            })
        },
        {
            id: AppView.PLANNER,
            title: 'برنامه‌نویس',
            link: AppView.PLANNER,
            iconName: 'Calendar',
            isComplete: checkStatus(AppView.PLANNER, () => {
                // Since planning isn't always a daily "log", we check if user has an active program
                // and rely on manual override mostly, or assume complete if Training is done (implied usage)
                const trainingDone = (profile.trainingLogs || []).some(l => l.date === today && l.status === 'Completed');
                return !!profile.activeProgram || !!profile.smartProgram || trainingDone; 
            })
        }
    ];

    return commitments;
};
