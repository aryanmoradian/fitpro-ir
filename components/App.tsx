
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Dashboard from './Dashboard';
import PlanManager from './PlanManager';
import DailyTracker from './DailyTracker';
import AICoach from './AICoach';
import MealScanner from './MealScanner';
import Profile from './Profile';
import AdvancedAnalytics from './AdvancedAnalytics';
import InteractiveGuide from './InteractiveGuide';
import HomePage from './components/HomePage'; 
import AuthPage from './components/AuthPage'; 
import HealthHub from './components/HealthHub'; 
import TrainingCenter from './components/TrainingCenter'; 
import NutritionCenter from './components/NutritionCenter'; 
import PerformanceCenter from './components/PerformanceCenter'; 
import SupplementManager from './components/SupplementManager'; 
import ReportsCenter from './components/ReportsCenter'; 
import SettingsCenter from './components/SettingsCenter'; 
import LevelUpModal from './LevelUpModal'; 
import SubscriptionPage from './components/SubscriptionPage';
import MembershipPlans from './components/MembershipPlans';
import PaymentCheckout from './components/PaymentCheckout';
import AdminDashboard from './AdminDashboard';
import OnboardingSuccessModal from './components/OnboardingSuccessModal';
import VideoLibrary from './VideoLibrary';
import UserInbox from './UserInbox';
import MorningCheckIn from './components/MorningCheckIn';
import GlobalStatusBar from './GlobalStatusBar'; 
import AnalyticsDashboard from './AnalyticsDashboard'; 
import { AppView, NutritionItem, DailyLog, UserProfile, Exercise, WeeklyWorkoutPlan, WeeklyNutritionPlan, GuidanceState, AthleteStatus, UserRole, SubscriptionTier } from './types';
import { calculateAthleteLevel } from '../services/levelCalculator';
import { AuthAPI } from '../services/api';
import { Loader2 } from 'lucide-react';
import { migrateNutritionData } from '../services/migrationService';
import { processGlobalEvent } from '../services/globalDataCore';
import { isModuleLocked } from '../services/subscriptionService';

const INITIAL_PROFILE: UserProfile = {
  id: 'guest',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  name: 'ورزشکار',
  role: 'athlete',
  age: 0,
  gender: undefined,
  height: 0,
  currentWeight: 0,
  metricsHistory: [],
  injuries: '',
  photoGallery: [],
  goals: [],
  level: 1,
  xp: 0,
  coins: 0,
  habits: [],
  customExercises: [],
  customFoods: [],
  badges: [], 
  activeChallenges: [],
  clubs: [],
  activeQuests: [], 
  inventory: [],    
  followersCount: 0,
  followingCount: 0,
  subscriptionTier: 'free',
  subscriptionStatus: 'active',
  theme: 'Standard'
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAppEntered, setIsAppEntered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'register'>('login');

  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [targetTier, setTargetTier] = useState<SubscriptionTier>('elite'); 
  const [targetDuration, setTargetDuration] = useState<number | undefined>(undefined); 
  
  const [nutritionPlan, setNutritionPlan] = useState<NutritionItem[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<Exercise[]>([]); 
  const [weeklyWorkoutPlan, setWeeklyWorkoutPlan] = useState<WeeklyWorkoutPlan>({ id: '1', name: 'برنامه اصلی', sessions: [] });
  const [weeklyNutritionPlan, setWeeklyNutritionPlan] = useState<WeeklyNutritionPlan>({ id: '1', name: 'رژیم اصلی', days: [] });
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [showGuide, setShowGuide] = useState(false);
  const [highlightCharts, setHighlightCharts] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showMorningCheckIn, setShowMorningCheckIn] = useState(false);
  const [guidanceState, setGuidanceState] = useState<GuidanceState>({ photoUploaded: false, workoutCreated: false, nutritionCreated: false, firstLogCompleted: false });
  const [levelUpInfo, setLevelUpInfo] = useState<{ show: boolean; newStatus: AthleteStatus | null }>({ show: false, newStatus: null });

  // --- THEME APPLICATION EFFECT ---
  useEffect(() => {
      document.body.className = '';
      document.body.classList.add('app-dashboard');
      
      const theme = userProfile.settings?.theme || userProfile.theme || 'Standard';
      if (theme === 'Gold') document.body.classList.add('theme-gold');
      if (theme === 'Neon') document.body.classList.add('theme-neon');
  }, [userProfile.settings?.theme, userProfile.theme]);

  // --- MIGRATION CHECK ---
  useEffect(() => {
      if (isAuthenticated && isAppEntered && userProfile.id && !userProfile.meta?.nutritionMigrated) {
          const migrationResult = migrateNutritionData(userProfile, logs);
          if (migrationResult.migrated) {
              setUserProfile(migrationResult.profile);
          }
      }
  }, [isAuthenticated, isAppEntered, userProfile.id]);

  // --- MORNING CHECK-IN LOGIC ---
  useEffect(() => {
      if (isAuthenticated && isAppEntered && userProfile.role !== 'admin') {
          const today = new Date().toLocaleDateString('fa-IR');
          const hasLoggedToday = logs.some(l => l.date === today);
          
          if (!hasLoggedToday) {
              const timer = setTimeout(() => setShowMorningCheckIn(true), 2000);
              return () => clearTimeout(timer);
          }
      }
  }, [isAuthenticated, isAppEntered, logs, userProfile.role]);

  // --- INIT SESSION & AUTH CHECK ---
  useEffect(() => {
    const initSession = async () => {
        setIsLoading(true);

        const token = localStorage.getItem('fitpro_jwt');
        if (token) {
            try {
                // Verify token with backend
                const user = await AuthAPI.me();
                
                if (user) {
                    const names = user.name ? user.name.split(' ') : ['User', ''];
                    
                    setUserProfile({
                        ...INITIAL_PROFILE,
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        firstName: names[0],
                        lastName: names.slice(1).join(' '),
                        name: user.name,
                        // Ensure created_at is mapped from API for trial logic if available
                        meta: { ...INITIAL_PROFILE.meta, createdAt: user.created_at } 
                    });
                    
                    setIsAuthenticated(true);
                    setIsAppEntered(true);
                    
                    if (user.role === 'admin') {
                        setCurrentView(AppView.ADMIN_DASHBOARD);
                    }
                } else {
                     localStorage.removeItem('fitpro_jwt');
                }
            } catch (err) {
                console.error("Session verification failed:", err);
                localStorage.removeItem('fitpro_jwt');
            }
        }
        
        setIsLoading(false);
    };

    initSession();
  }, []);

  const handleAuthSuccess = (user: { firstName: string; lastName: string; email: string; role: UserRole }, targetView?: AppView) => {
    setUserProfile(prev => ({ 
        ...prev, 
        metricsHistory: prev.metricsHistory || [],
        goals: prev.goals || [],
        habits: prev.habits || [],
        customExercises: prev.customExercises || [],
        customFoods: prev.customFoods || [],
        firstName: user.firstName, 
        lastName: user.lastName, 
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        meta: { ...prev.meta, createdAt: new Date().toISOString() } // Set creation time on first login/register for trial
    }));
    
    if (targetView) {
        setCurrentView(targetView);
    } else {
        if (user.role === 'admin') {
            setCurrentView(AppView.ADMIN_DASHBOARD);
        } else {
            setCurrentView(AppView.DASHBOARD);
        }
    }
    
    setIsAuthenticated(true);
    setIsAppEntered(true);
  };

  const handleLogout = async () => {
      try {
        await AuthAPI.logout();
      } catch (e) {
        console.warn("Logout error", e);
      }
      localStorage.removeItem('fitpro_jwt');
      setIsAuthenticated(false);
      setIsAppEntered(false);
      setUserProfile(INITIAL_PROFILE);
      setCurrentView(AppView.DASHBOARD);
      setLogs([]); 
  };

  const handlePaymentSuccess = () => {
    // Set to pending/needs_review to reflect that payment is submitted but not yet admin-approved
    setUserProfile(prev => ({
        ...prev,
        subscriptionStatus: 'needs_review'
    }));
    setCurrentView(AppView.DASHBOARD);
  };

  const updateTodaysLog = (partial: Partial<DailyLog>) => { 
      setLogs(prev => {
          const today = new Date().toLocaleDateString('fa-IR');
          const existing = prev.find(l => l.date === today);
          if (existing) {
              return prev.map(l => l.date === today ? { ...l, ...partial } : l);
          }
          return [...prev, { 
              date: today, 
              workoutScore: 0, 
              nutritionScore: 0, 
              notes: '', 
              ...partial 
          }];
      });
  };

  const handleMorningCheckInComplete = (data: Partial<DailyLog>) => {
      updateTodaysLog(data);
      processGlobalEvent({ type: 'SLEEP_LOGGED', payload: data, timestamp: Date.now() }, userProfile);
      setUserProfile(prev => ({ ...prev, xp: prev.xp + 50 }));
      setShowMorningCheckIn(false);
  };

  if (isLoading) {
      return (
          <div className="h-screen w-screen flex items-center justify-center bg-[#0D1117] text-white">
              <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                  <p>در حال بارگذاری فیت پرو...</p>
              </div>
          </div>
      );
  }

  if (!isAppEntered) {
    return <HomePage onLogin={() => { setInitialAuthMode('login'); setIsAppEntered(true); }} onRegister={() => { setInitialAuthMode('register'); setIsAppEntered(true); }} />;
  }
  
  if (!isAuthenticated) {
    return <AuthPage initialMode={initialAuthMode} onAuthSuccess={handleAuthSuccess} />;
  }

  const renderView = () => {
    if (userProfile.role === 'admin' && currentView === AppView.ADMIN_DASHBOARD) {
        return <AdminDashboard />;
    }

    // CHECK FOR SUBSCRIPTION LOCK
    if (isModuleLocked(currentView, userProfile)) {
        // If locked, fallback to Membership Plans Page
        return <MembershipPlans setCurrentView={setCurrentView} setTargetTier={setTargetTier} setTargetDuration={setTargetDuration} />;
    }

    const safeLogs = Array.isArray(logs) ? logs : [];
    const safeProfile = {
        ...userProfile,
        metricsHistory: Array.isArray(userProfile.metricsHistory) ? userProfile.metricsHistory : [],
        goals: Array.isArray(userProfile.goals) ? userProfile.goals : [],
        habits: Array.isArray(userProfile.habits) ? userProfile.habits : [],
        customExercises: Array.isArray(userProfile.customExercises) ? userProfile.customExercises : [],
        customFoods: Array.isArray(userProfile.customFoods) ? userProfile.customFoods : [],
    };

    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard logs={safeLogs} bodyMetrics={safeProfile.metricsHistory} workoutPlan={workoutPlan || []} nutritionPlan={nutritionPlan || []} profile={safeProfile} updateProfile={setUserProfile} guidanceState={guidanceState} setCurrentView={setCurrentView} weeklyWorkoutPlan={weeklyWorkoutPlan} updateTodaysLog={updateTodaysLog} athleteLevelInfo={calculateAthleteLevel(safeProfile, safeLogs)} highlightCharts={highlightCharts} />;
      case AppView.ANALYTICS_DASHBOARD: return <AnalyticsDashboard profile={safeProfile} logs={safeLogs} />; 
      case AppView.BODY_ANALYSIS: return <Profile profile={safeProfile} updateProfile={setUserProfile} logs={safeLogs} setCurrentView={setCurrentView} athleteLevelInfo={calculateAthleteLevel(safeProfile, safeLogs)} />;
      case AppView.HEALTH_HUB: return <HealthHub profile={safeProfile} updateProfile={setUserProfile} logs={safeLogs} setCurrentView={setCurrentView} updateTodaysLog={updateTodaysLog} />;
      case AppView.TRAINING_CENTER: return <TrainingCenter profile={safeProfile} updateProfile={setUserProfile} logs={safeLogs} setCurrentView={setCurrentView} setWorkoutPlan={setWorkoutPlan} />;
      case AppView.NUTRITION_CENTER: return <NutritionCenter profile={safeProfile} updateProfile={setUserProfile} logs={safeLogs} setCurrentView={setCurrentView} />;
      case AppView.PERFORMANCE_CENTER: return <PerformanceCenter profile={safeProfile} updateProfile={setUserProfile} logs={safeLogs} setCurrentView={setCurrentView} />; 
      
      case AppView.SUPPLEMENT_MANAGER: return <SupplementManager profile={safeProfile} updateProfile={setUserProfile} />;
      
      case AppView.REPORTS_CENTER: return <ReportsCenter profile={safeProfile} updateProfile={setUserProfile} logs={safeLogs} setCurrentView={setCurrentView} />; 
      case AppView.SETTINGS_CENTER: return <SettingsCenter profile={safeProfile} updateProfile={setUserProfile} setCurrentView={setCurrentView} logs={safeLogs} />;
      case AppView.BIOLOGICAL_ANALYSIS: return <AdvancedAnalytics profile={safeProfile} updateProfile={setUserProfile} logs={safeLogs} nutritionPlan={nutritionPlan || []} setCurrentView={setCurrentView} />;
      case AppView.PLANNER: 
        return (
          <PlanManager 
            nutritionPlan={nutritionPlan || []} 
            setNutritionPlan={setNutritionPlan} 
            workoutPlan={workoutPlan || []} 
            setWorkoutPlan={setWorkoutPlan} 
            weeklyWorkoutPlan={weeklyWorkoutPlan} 
            setWeeklyWorkoutPlan={setWeeklyWorkoutPlan} 
            weeklyNutritionPlan={weeklyNutritionPlan} 
            setWeeklyNutritionPlan={setWeeklyNutritionPlan} 
            profile={safeProfile} 
            updateProfile={setUserProfile} 
            athleteLevelInfo={calculateAthleteLevel(safeProfile, safeLogs)} 
            logs={safeLogs}
            addLog={updateTodaysLog}
          />
        );
      case AppView.TRACKER: 
        return (
          <DailyTracker 
            nutritionPlan={nutritionPlan || []} 
            setNutritionPlan={setNutritionPlan} 
            workoutPlan={workoutPlan || []} 
            addLog={updateTodaysLog} 
            profile={safeProfile} 
            updateProfile={setUserProfile} 
            logs={safeLogs} 
            setCurrentView={setCurrentView}
          />
        );
      case AppView.COACH: return <AICoach />;
      case AppView.MEAL_SCAN: return <MealScanner profile={safeProfile} setCurrentView={setCurrentView} />;
      case AppView.SUBSCRIPTION_LANDING: return <SubscriptionPage setCurrentView={setCurrentView} setTargetTier={setTargetTier} />;
      case AppView.MEMBERSHIP_PLANS: return <MembershipPlans setCurrentView={setCurrentView} setTargetTier={setTargetTier} setTargetDuration={setTargetDuration} />;
      case AppView.PAYMENT: return <PaymentCheckout targetTier={targetTier} setTargetTier={setTargetTier} profile={safeProfile} updateProfile={setUserProfile} onBack={() => setCurrentView(AppView.MEMBERSHIP_PLANS)} onSuccess={handlePaymentSuccess} initialDuration={targetDuration} />;
      case AppView.VIDEO_LIBRARY: return <VideoLibrary profile={safeProfile} />;
      case AppView.USER_INBOX: return <UserInbox profile={safeProfile} />;
      case AppView.ADMIN_DASHBOARD: return <AdminDashboard />;
      default: return <Dashboard logs={safeLogs} bodyMetrics={safeProfile.metricsHistory} workoutPlan={workoutPlan || []} nutritionPlan={nutritionPlan || []} profile={safeProfile} updateProfile={setUserProfile} guidanceState={guidanceState} setCurrentView={setCurrentView} weeklyWorkoutPlan={weeklyWorkoutPlan} updateTodaysLog={updateTodaysLog} athleteLevelInfo={calculateAthleteLevel(safeProfile, safeLogs)} highlightCharts={highlightCharts} />;
    }
  };

  const safeLevelInfo = calculateAthleteLevel(userProfile, logs || []);

  return (
    <div className="flex flex-col h-full">
        {/* GLOBAL STATUS BAR */}
        {isAuthenticated && userProfile.role !== 'admin' && <GlobalStatusBar setCurrentView={setCurrentView} />}
        
        <Layout currentView={currentView} setCurrentView={setCurrentView} guidanceState={guidanceState} logs={logs || []} profile={userProfile} athleteLevelInfo={safeLevelInfo} onLogout={handleLogout}>
          {renderView()}
          {showGuide && <InteractiveGuide onClose={() => setShowGuide(false)} setCurrentView={setCurrentView} />}
          {levelUpInfo.show && <LevelUpModal newStatus={levelUpInfo.newStatus!} onClose={() => setLevelUpInfo({show:false, newStatus:null})} />}
          {showSuccessModal && <OnboardingSuccessModal tier={userProfile.subscriptionTier} onClose={() => { setShowSuccessModal(false); setCurrentView(AppView.DASHBOARD); }} />}
          {showMorningCheckIn && <MorningCheckIn profile={userProfile} onClose={() => setShowMorningCheckIn(false)} onComplete={handleMorningCheckInComplete} />}
        </Layout>
    </div>
  );
};

export default App;
