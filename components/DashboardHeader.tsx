
import React, { useState, useEffect } from 'react';
import { DailyLog, UserProfile, AppNotification, AppView } from '../types';
import Logo from './Logo';
import { Bell, Zap, Home, Shield, Globe, UserCheck } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { generateMockNotifications, checkSmartTriggers } from '../services/notificationService';

interface DashboardHeaderProps {
  logs: DailyLog[];
  profile: UserProfile;
  setCurrentView?: (view: AppView) => void;
}

const MiniProgressBar: React.FC<{ percentage: number; gradient: string }> = ({ percentage, gradient }) => (
    <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden">
        <div 
            className="h-full rounded-full transition-all duration-500" 
            style={{ width: `${percentage}%`, background: gradient }}
        ></div>
    </div>
);

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ logs, profile, setCurrentView }) => {
    const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
    const workoutProgress = lastLog?.workoutScore || 0;
    const nutritionProgress = lastLog?.nutritionScore || 0;

    // Notification State
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    useEffect(() => {
        const mocks = generateMockNotifications();
        const smarts = checkSmartTriggers(profile, logs);
        setNotifications([...smarts, ...mocks]);
    }, [logs]); 

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleDelete = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    const handleActionClick = (link: string) => {
        if (setCurrentView) {
            if (link === 'TRACKER') setCurrentView('TRACKER' as any);
            else if (link === 'MENTAL_RECOVERY') setCurrentView('MENTAL_RECOVERY' as any);
        }
        setIsNotifOpen(false);
    };

    // Determine Security Icon
    const securityConfig = profile.settings?.security?.privacyConfig;
    const getPrivacyIcon = () => {
        if (securityConfig?.publicProfile) return <Globe size={18} className="text-green-400" />;
        if (securityConfig?.allowCoachEdit || securityConfig?.shareWorkouts) return <UserCheck size={18} className="text-blue-400" />;
        return <Shield size={18} className="text-gray-400" />;
    };

    const privacyLabel = securityConfig?.publicProfile ? 'عمومی' : (securityConfig?.allowCoachEdit ? 'دسترسی مربی' : 'خصوصی');

    return (
        <header className="h-20 flex items-center justify-between px-6 shrink-0 bg-black/30 border-b border-white/10 relative z-40">
            {/* Right side (in RTL) */}
            <div className="flex items-center gap-6">
                <Logo textClassName="hidden lg:block" />
                <nav className="hidden md:flex items-center gap-6">
                    <a href="https://fit-pro.ir" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-white transition font-semibold text-sm">
                        <Home size={18} />
                        <span>سایت اصلی</span>
                    </a>
                    
                    {/* Security Status Indicator (Integrated from Step 10) */}
                    <button 
                        onClick={() => setCurrentView && setCurrentView('SETTINGS_CENTER' as any)}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5 transition group"
                        title="وضعیت حریم خصوصی"
                    >
                        {getPrivacyIcon()}
                        <span className="text-xs text-gray-400 group-hover:text-white transition">{privacyLabel}</span>
                    </button>
                </nav>
            </div>

            {/* Left side (in RTL) */}
            <div className="flex items-center gap-6">
                {/* User Status */}
                <div className="hidden lg:flex items-center gap-4 w-56">
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-blue-400">تمرین</span>
                            <span className="text-xs font-mono text-gray-400">{workoutProgress}%</span>
                        </div>
                        <MiniProgressBar percentage={workoutProgress} gradient="linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))" />
                    </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-green-400">تغذیه</span>
                            <span className="text-xs font-mono text-gray-400">{nutritionProgress}%</span>
                        </div>
                        <MiniProgressBar percentage={nutritionProgress} gradient="linear-gradient(90deg, var(--accent-green), var(--accent-yellow))" />
                    </div>
                </div>

                {/* Notifications Trigger */}
                <div className="relative">
                    <button 
                        onClick={() => setIsNotifOpen(!isNotifOpen)} 
                        className={`relative text-gray-400 hover:text-white transition p-2 rounded-full ${isNotifOpen ? 'bg-white/10 text-white' : ''}`}
                    >
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-gray-900 animate-pulse"></span>
                        )}
                    </button>
                    
                    {isNotifOpen && (
                        <NotificationCenter 
                            notifications={notifications} 
                            onClose={() => setIsNotifOpen(false)}
                            onMarkRead={handleMarkRead}
                            onDelete={handleDelete}
                            onClearAll={handleClearAll}
                            onActionClick={handleActionClick}
                        />
                    )}
                </div>

                {/* Coach CTA */}
                <a href="https://fit-pro.ir/coach/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold transition-transform duration-300 hover:scale-105 btn-coach-glow text-sm" title="با مربی شخصی خود ملاقات کنید - پیشرفت را تسریع کنید">
                    <Zap size={18} />
                    <span className="hidden sm:block">دسترسی به مربی</span>
                </a>
            </div>
        </header>
    );
};

export default DashboardHeader;
