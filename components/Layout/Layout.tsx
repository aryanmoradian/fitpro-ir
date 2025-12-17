
import React from 'react';
import { LayoutDashboard, Calendar, CheckSquare, MessageSquare, Camera, UserCircle, BrainCircuit, CheckCircle2, Users, Instagram, HeartPulse, LogOut, Video, Mail, Dumbbell, Utensils, Trophy, Settings, Pill, ShieldCheck, BarChart2, Lock, Crown } from 'lucide-react';
import { AppView, GuidanceState, DailyLog, UserProfile } from '../../types';
import Logo from '../Logo';
import DashboardHeader from '../DashboardHeader';
import { LevelInfo } from '../../services/levelCalculator';
import { isModuleLocked } from '../../services/subscriptionService';

interface LayoutProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  children: React.ReactNode;
  guidanceState: GuidanceState;
  logs: DailyLog[];
  profile: UserProfile;
  athleteLevelInfo: LevelInfo;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children, guidanceState, logs, profile, athleteLevelInfo, onLogout }) => {
  
  // Navigation Configuration
  const navItems = [
    { view: AppView.DASHBOARD, icon: LayoutDashboard, label: 'داشبورد اصلی' },
    { view: AppView.ANALYTICS_DASHBOARD, icon: BarChart2, label: 'تحلیل پیشرفته', isHighPriority: true },
    { view: AppView.BODY_ANALYSIS, icon: UserCircle, label: 'پروفایل و بدن' },
    { view: AppView.TRACKER, icon: CheckSquare, label: 'ثبت روزانه' },
    { view: AppView.PLANNER, icon: Calendar, label: 'برنامه نویس ساسکا' },
    { view: AppView.TRAINING_CENTER, icon: Dumbbell, label: 'مرکز تمرین' },
    { view: AppView.NUTRITION_CENTER, icon: Utensils, label: 'مرکز تغذیه' },
    { view: AppView.SUPPLEMENT_MANAGER, icon: Pill, label: 'مدیریت مکمل' },
    { view: AppView.PERFORMANCE_CENTER, icon: Trophy, label: 'مرکز رکورد و قدرت' },
    { view: AppView.MEAL_SCAN, icon: Camera, label: 'اسکن خوراکی' },
    { view: AppView.HEALTH_HUB, icon: HeartPulse, label: 'مرکز سلامت' },
    { view: AppView.BIOLOGICAL_ANALYSIS, icon: BrainCircuit, label: 'تحلیل زیستی' },
    { view: AppView.MEMBERSHIP_PLANS, icon: Crown, label: 'عضویت ورزشکار', isHighPriority: true },
    { view: AppView.SETTINGS_CENTER, icon: Settings, label: 'تنظیمات' },
    { view: AppView.COACH, icon: MessageSquare, label: 'مربی هوشمند' },
    { view: AppView.VIDEO_LIBRARY, icon: Video, label: 'ویدیوهای آموزشی' },
    { view: AppView.USER_INBOX, icon: Mail, label: 'پیام‌ها' },
  ];

  const externalLinks = [
    { href: 'https://chat.whatsapp.com/JkWkKSmtesJ1QID0bgNry7', icon: Users, label: 'گروه آموزشی واتساپ' },
    { href: 'https://instagram.com/mokamel_fitpro', icon: Instagram, label: 'پیج اینستاگرام' },
  ];

  // Steps Logic for Guidance
  const stepsStatus = {
    [AppView.BODY_ANALYSIS]: guidanceState.photoUploaded,
    [AppView.PLANNER]: guidanceState.workoutCreated && guidanceState.nutritionCreated,
    [AppView.TRACKER]: guidanceState.firstLogCompleted,
  };
  const coreStepsOrder: AppView[] = [AppView.BODY_ANALYSIS, AppView.PLANNER, AppView.TRACKER];
  const nextStepView = coreStepsOrder.find(view => !stepsStatus[view as keyof typeof stepsStatus]);
  
  // Dynamic Level Styling
  const levelGlowClass = React.useMemo(() => {
    switch(athleteLevelInfo.status) {
      case 'Semi-Pro': return 'level-glow-semi-pro';
      case 'Pro': return 'level-glow-semi-pro';
      case 'Elite': return 'level-glow-professional';
      default: return '';
    }
  }, [athleteLevelInfo.status]);

  return (
    <div className="flex h-full text-gray-100 p-3 gap-3 bg-black/40">
      {/* Sidebar */}
      <aside data-tour-id="sidebar" className="w-20 md:w-64 flex-shrink-0 bg-[#151915] border border-[#3E4A3E] rounded-lg flex flex-col transition-all duration-300 shadow-2xl">
        <div className="h-20 flex items-center justify-center border-b border-[#3E4A3E] bg-[#0F120D] rounded-t-lg">
          <Logo textClassName="hidden md:block text-[#D4FF00]" />
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isCompleted = coreStepsOrder.includes(item.view) && stepsStatus[item.view as keyof typeof stepsStatus];
              const isNext = item.view === nextStepView;
              const isActive = currentView === item.view;
              // @ts-ignore
              const isHighPriority = item.isHighPriority;
              const isLocked = isModuleLocked(item.view, profile);

              let stateClasses = '';
              if (isActive) stateClasses = 'bg-[#4A5D23] text-white border-l-4 border-[#D4FF00] shadow-md';
              else if (isLocked) stateClasses = 'text-gray-600 cursor-not-allowed opacity-70 hover:bg-transparent';
              else if (isHighPriority) stateClasses = 'text-gray-200 bg-[#4A5D23]/20 border border-[#4A5D23]/50 hover:bg-[#4A5D23]/40';
              else if (isNext) stateClasses = 'text-white bg-[#D4FF00]/10 border border-[#D4FF00]/50 animate-pulse';
              else stateClasses = 'text-[#8F9A8C] hover:bg-[#232923] hover:text-white';

              return (
                <li key={item.view}>
                  <button 
                    onClick={() => !isLocked && setCurrentView(item.view)} 
                    disabled={isLocked}
                    className={`w-full flex items-center justify-between p-3 rounded-md transition-all duration-200 group ${stateClasses}`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : isLocked ? 'text-gray-600' : 'text-gray-500 group-hover:text-gray-300'}`} />
                      <span className="mr-3 font-bold text-sm hidden md:block tracking-wide">{item.label}</span>
                    </div>
                    {isLocked ? (
                        <Lock className="w-3 h-3 text-red-900 hidden md:block" />
                    ) : (
                        isCompleted && currentView !== item.view && <CheckCircle2 className="w-4 h-4 text-green-500 hidden md:block" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="px-4 my-4"><hr className="border-[#3E4A3E]" /></div>

          <ul className="space-y-1 px-2">
            {externalLinks.map((link) => (
                <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="w-full flex items-center p-3 rounded-md text-[#8F9A8C] hover:bg-[#232923] hover:text-white transition">
                        <link.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="mr-3 font-bold text-sm hidden md:block">{link.label}</span>
                    </a>
                </li>
            ))}
            <li>
                <button onClick={onLogout} className="w-full flex items-center p-3 rounded-md text-red-400 hover:bg-red-900/20 hover:text-red-300 transition">
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="mr-3 font-bold text-sm hidden md:block">خروج از پایگاه</span>
                </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-[#3E4A3E] bg-[#0F120D] rounded-b-lg">
          <div className="flex items-center mt-1">
             <div className="relative">
                <div className="w-10 h-10 rounded border-2 border-[#4A5D23] bg-[#232923] flex items-center justify-center">
                    <UserCircle size={24} className="text-[#8F9A8C]" />
                </div>
                <div className="absolute -top-1 -right-1 bg-[#D4FF00] text-black rounded-sm p-0.5"><ShieldCheck size={10} fill="black" /></div>
             </div>
            <div className="mr-3 hidden md:block text-right flex-1">
              <p className="text-sm font-bold text-white truncate">{profile.name}</p>
              <div className="flex justify-between items-center mt-1">
                 <span className="text-[10px] text-[#D4FF00] uppercase tracking-wider">{athleteLevelInfo.status}</span>
                 <span className="text-[9px] border px-1 rounded border-[#4A5D23] text-[#8F9A8C] bg-black uppercase">Active</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-hidden flex flex-col relative bg-[#151915] border border-[#3E4A3E] rounded-lg shadow-inner transition-all duration-500 ${levelGlowClass}`}>
        <DashboardHeader logs={logs} profile={profile} />
        <div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
