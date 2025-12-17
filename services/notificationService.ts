
import { AppNotification, Reminder, UserProfile, DailyLog } from '../types';

export const generateMockNotifications = (): AppNotification[] => {
    return [
        {
            id: 'n1',
            category: 'Health Alerts',
            title: 'کمبود آب بدن',
            message: 'میزان مصرف آب شما امروز کمتر از ۵۰٪ هدف است. لطفا هیدراته بمانید.',
            timestamp: new Date().toISOString(),
            isRead: false,
            priority: 'high',
            actionLink: 'TRACKER'
        },
        {
            id: 'n2',
            category: 'Goal Reminders',
            title: 'زمان خواب',
            message: 'برای رسیدن به هدف ۸ ساعت خواب، بهتر است تا ۳۰ دقیقه دیگر به رختخواب بروید.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isRead: true,
            priority: 'medium',
            actionLink: 'MENTAL_RECOVERY'
        },
        {
            id: 'n3',
            category: 'Gamification Alerts',
            title: 'استریک شما در خطر است!',
            message: 'تنها ۲ ساعت تا پایان روز باقی مانده. فعالیت خود را ثبت کنید تا زنجیره قطع نشود.',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            isRead: false,
            priority: 'high',
            actionLink: 'TRACKER'
        }
    ];
};

export const checkSmartTriggers = (profile: UserProfile, logs: DailyLog[]): AppNotification[] => {
    const notifications: AppNotification[] = [];
    const today = new Date().toLocaleDateString('fa-IR');
    const todayLog = logs.find(l => l.date === today);

    // 1. Hydration Check
    if (todayLog && (todayLog.waterIntake || 0) < 4) {
        notifications.push({
            id: `smart_hydro_${Date.now()}`,
            category: 'Health Alerts',
            title: 'هشدار هیدراتاسیون',
            message: 'مصرف آب شما امروز بسیار پایین است. یک لیوان آب بنوشید.',
            timestamp: new Date().toISOString(),
            isRead: false,
            priority: 'high',
            actionLink: 'TRACKER'
        });
    }

    // 2. Recovery Check (if sleep < 6h for 2 days)
    const recentLogs = logs.slice(-2);
    if (recentLogs.length === 2 && recentLogs.every(l => (l.sleepHours || 8) < 6)) {
        notifications.push({
            id: `smart_rec_${Date.now()}`,
            category: 'AI Insights',
            title: 'خطر خستگی مزمن',
            message: 'خواب شما در ۲ شب گذشته کافی نبوده است. پروتکل ریکاوری فعال پیشنهاد می‌شود.',
            timestamp: new Date().toISOString(),
            isRead: false,
            priority: 'high',
            actionLink: 'MENTAL_RECOVERY'
        });
    }

    return notifications;
};

export const getDefaultReminders = (): Reminder[] => {
    return [
        { id: 'rem_1', title: 'ثبت صبحگاهی وزن', time: '08:00', days: [0,1,2,3,4,5,6], isEnabled: true, category: 'Goal Reminders', channels: ['push'] },
        { id: 'rem_2', title: 'یادآوری نوشیدن آب', time: '11:00', days: [0,1,2,3,4,5,6], isEnabled: true, category: 'Health Alerts', channels: ['push', 'in-app'] },
        { id: 'rem_3', title: 'ثبت گزارش روزانه', time: '22:00', days: [0,1,2,3,4,5,6], isEnabled: true, category: 'Gamification Alerts', channels: ['push'] },
    ];
};
