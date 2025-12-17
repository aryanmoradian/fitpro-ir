
import { TrainingLog, NutritionDayLog, RecoveryTask, UserProfile, RecoveryFrequency, RecoveryLog } from '../types';

export const checkRecoveryPrerequisites = (
    trainingLogs: TrainingLog[] | undefined, 
    nutritionLogs: NutritionDayLog[] | undefined
): boolean => {
    if (!trainingLogs || trainingLogs.length < 3 || !nutritionLogs || nutritionLogs.length < 3) {
        return false;
    }

    const getDaysSpan = (dates: string[]) => {
        if (dates.length === 0) return 0;
        const sorted = dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        const first = new Date(sorted[0]);
        const last = new Date(sorted[sorted.length - 1]);
        const diff = Math.abs(last.getTime() - first.getTime());
        return Math.ceil(diff / (1000 * 60 * 60 * 24)); 
    };

    const trainingSpan = getDaysSpan(trainingLogs.map(l => l.date));
    const nutritionSpan = getDaysSpan(nutritionLogs.map(l => l.date));

    // Both must span at least 7 days
    return trainingSpan >= 7 && nutritionSpan >= 7;
};

export const getTaskStatus = (task: RecoveryTask, logs: RecoveryLog[]): 'Done' | 'Pending' => {
    // Find the latest log for this task
    const taskLogs = logs.filter(l => l.taskId === task.id && l.status === 'Completed');
    if (taskLogs.length === 0) return 'Pending';

    const latestLog = taskLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const now = new Date();
    const completed = new Date(latestLog.date);
    const diffTime = Math.abs(now.getTime() - completed.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (task.frequency === 'Daily' && diffDays < 1 && now.getDate() === completed.getDate()) return 'Done';
    
    if (task.frequency === 'Weekly') {
        const currentWeek = getWeekNumber(now);
        const completedWeek = getWeekNumber(completed);
        if (currentWeek === completedWeek && now.getFullYear() === completed.getFullYear()) return 'Done';
    }
    
    if (task.frequency === 'Monthly' && now.getMonth() === completed.getMonth() && now.getFullYear() === completed.getFullYear()) return 'Done';
    
    if (task.frequency === 'Yearly' && now.getFullYear() === completed.getFullYear()) return 'Done';

    return 'Pending';
};

// Helper for week number
const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const getDefaultRecoveryTasks = (): RecoveryTask[] => [
    { 
        id: 'def_1', title: 'روتین کششی (Stretching)', category: 'Active Recovery', frequency: 'Daily', 
        durationTarget: 15, intensity: 'Low', isCustom: false, notes: 'کشش عضلات درگیر بعد از تمرین' 
    },
    { 
        id: 'def_2', title: 'فوم رولر (Foam Rolling)', category: 'Manual Therapy', frequency: 'Daily', 
        durationTarget: 10, intensity: 'Medium', isCustom: false, notes: 'ماساژ عضلات سفت' 
    },
    { 
        id: 'def_3', title: 'دوش آب سرد (Cold Plunge)', category: 'Thermal', frequency: 'Weekly', 
        durationTarget: 5, intensity: 'High', isCustom: false, notes: '۵ دقیقه در دمای ۱۰-۱۵ درجه' 
    },
    { 
        id: 'def_4', title: 'ماساژ بافت عمیق', category: 'Manual Therapy', frequency: 'Monthly', 
        durationTarget: 60, intensity: 'Medium', isCustom: false, notes: 'رزرو وقت ماساژ' 
    },
    { 
        id: 'def_5', title: 'بررسی کیفیت خواب', category: 'Sleep', frequency: 'Daily', 
        durationTarget: 5, intensity: 'Low', isCustom: false, notes: 'ثبت ساعت و کیفیت در ترکر' 
    },
];

export const calculateRecoveryScore = (logs: RecoveryLog[], totalTasks: number): number => {
    if (totalTasks === 0) return 0;
    // Simple logic: Completed logs in last 7 days vs expected (Daily * 7 + Weekly * 1)
    // For MVP, we calculate compliance based on unique completed tasks in the last 7 days.
    
    const now = new Date();
    const last7DaysLogs = logs.filter(l => {
        const d = new Date(l.date);
        return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 7;
    });

    const completedCount = last7DaysLogs.length;
    // Assuming approx 2 daily tasks * 7 = 14 expected per week as base
    const baseExpected = 14; 
    
    return Math.min(100, Math.round((completedCount / baseExpected) * 100));
};
