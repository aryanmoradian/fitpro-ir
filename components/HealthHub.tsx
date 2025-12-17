
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, DailyLog, AppView, HealthProfile, Injury, HealthVitals, ModuleConfig, HealthModuleType, BodyMetricLog, BodyMeasurements } from '../types';
import { analyzeHealthRisk, calculateScientificWaterNeeds, getHydrationStatus } from '../services/healthService';
import { logBodyMetrics, getAthleteHistory, calculateAdvancedMetrics } from '../services/profileService';
import { logHealthInteraction, toggleManualHealthLog, calculateHealthConsistency } from '../services/healthActivityService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, ComposedChart, Legend, ReferenceLine, RadialBar, RadialBarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadarChart, Radar } from 'recharts';
import { 
    Scale, Droplets, Activity, AlertTriangle, FileText, Plus, X, 
    Check, Trash2, Camera, ChevronRight, Zap, Target, Gauge, Droplet, 
    ArrowUp, ArrowDown, Save, Edit2, ArrowRight, CheckCircle2, History, Archive, Loader2, Calendar, CheckSquare, Sun, Flame, Settings, Info, Beaker, Calculator, HelpCircle, Shield, AlertOctagon, Thermometer,
    ShieldCheck, RotateCcw, TrendingUp, Ruler, Utensils, HeartPulse, BrainCircuit, Battery, Moon, Wind, BedDouble, AlertCircle, FlaskConical, Lock, Smile, Meh, Frown, Dumbbell, BarChart2, Award, Medal
} from 'lucide-react';
import RecoveryWidget from './RecoveryWidget';
import { processGlobalEvent } from '../services/globalDataCore';

interface HealthHubProps {
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  logs: DailyLog[];
  setCurrentView?: (view: AppView) => void;
  updateTodaysLog: (partial: Partial<DailyLog>) => void;
}

// Default modules definition if not present in settings
const DEFAULT_MODULES: ModuleConfig[] = [
    { id: 'readiness', defaultName: 'آمادگی جسمانی', isVisible: true, order: 0, iconName: 'HeartPulse' },
    { id: 'recovery', defaultName: 'ریکاوری پیشرفته', isVisible: true, order: 1, iconName: 'Battery' }, 
    { id: 'overview', defaultName: 'پیشرفته AI', isVisible: true, order: 2, iconName: 'Zap' },
    { id: 'composition', defaultName: 'آنالیز بدن', isVisible: true, order: 3, iconName: 'Scale' },
    { id: 'hydration', defaultName: 'مانیتورینگ و تحلیل آبرسانی', isVisible: true, order: 4, iconName: 'Droplets' },
    { id: 'injuries', defaultName: 'مدیریت ریسک', isVisible: true, order: 5, iconName: 'AlertTriangle' },
    { id: 'archive', defaultName: 'آرشیو فعالیت', isVisible: true, order: 6, iconName: 'Archive' },
];

const IconMap: Record<string, any> = {
    Activity, Zap, Scale, Droplets, AlertTriangle, FileText, Archive, HeartPulse, Battery
};

// --- CONSTANTS FOR READINESS FORM ---
const READINESS_METRICS_STEP1 = [
    { 
        key: 'sleepQuality', label: 'کیفیت خواب (Sleep)', 
        desc: 'کیفیت خواب دیشب خود را ارزیابی کنید.', 
        scale: '۱ (بسیار بد) تا ۵ (عالی)', 
        example: '۱: غلت زدن، بیداری با خستگی. ۵: خواب عمیق، بیداری با انرژی.' 
    },
    { 
        key: 'morningEnergy', label: 'انرژی صبحگاهی (Energy)', 
        desc: 'میزان انرژی و سرحالی بعد از بیدار شدن.', 
        scale: '۱ (خسته) تا ۵ (کاملاً پرانرژی)', 
        example: '۱: به سختی از تخت جدا شدم. ۵: آماده تمرین با شدت بالا.' 
    },
    { 
        key: 'stressLevel', label: 'سطح استرس (Stress)', 
        desc: 'استرس کلی امروز (جسمی یا روانی).', 
        scale: '۱ (بسیار کم) تا ۵ (بسیار زیاد)', 
        example: '۱: آرام و ریلکس. ۵: تنش بالا، اضطراب.' 
    },
    { 
        key: 'moodScore', label: 'وضعیت روحی (Mood)', 
        desc: 'آمادگی ذهنی و انگیزه برای تمرین.', 
        scale: '۱ (بسیار پایین) تا ۵ (بسیار بالا)', 
        example: '۱: بی‌حوصله و بی‌انگیزه. ۵: با انگیزه و مثبت.' 
    },
];

const READINESS_METRICS_STEP2 = [
    { 
        key: 'soreness', label: 'کوفتگی عضلانی (DOMS)', 
        desc: 'میزان درد عضلانی ناشی از تمرینات قبل.', 
        scale: '۱ (بدون درد) تا ۵ (درد شدید)', 
        example: '۱: بدون درد، آماده فشار. ۵: درد شدید، نیاز به استراحت.',
        type: 'scale'
    },
    { 
        key: 'muscleFatigue', label: 'خستگی عضلانی (Fatigue)', 
        desc: 'سطح خستگی تجمعی در عضلات امروز.', 
        scale: '۱ (کاملا ریکاوری) تا ۵ (خالی از انرژی)', 
        example: '۱: عضلات پر و قوی. ۵: عضلات خالی و ناتوان.',
        type: 'scale'
    },
    { 
        key: 'stiffness', label: 'سفتی بدن / موبیلیتی', 
        desc: 'انعطاف‌پذیری و دامنه حرکتی مفاصل.', 
        scale: '۱ (بسیار روان) تا ۵ (بسیار خشک)', 
        example: '۱: بدن نرم و آماده. ۵: مفاصل خشک، دامنه محدود.',
        type: 'scale'
    },
    { 
        key: 'restingHeartRate', label: 'ضربان قلب استراحت (RHR)', 
        desc: 'ضربان قلب در حالت استراحت مطلق (اول صبح).', 
        scale: 'تعداد ضربان در دقیقه (BPM)', 
        example: '۶۰: نرمال، ۷۵: کمی بالا، ۹۰+: هشدار خستگی.',
        type: 'number'
    },
    { 
        key: 'bodyWeight', label: 'وزن بدن (Body Weight)', 
        desc: 'وزن ناشتا برای رصد هیدراتاسیون و گلیکوژن.', 
        scale: 'کیلوگرم (kg)', 
        example: 'دیروز: ۸۲.۰، امروز: ۸۲.۵ (+۰.۵kg).',
        type: 'number'
    },
];

const READINESS_METRICS_STEP3 = [
    { 
        key: 'proteinIntake', label: 'پروتئین مصرفی دیروز', 
        desc: 'میزان پروتئین مصرف شده در روز قبل.', 
        scale: 'گرم (g)', 
        example: '۱۲۰g پروتئین یا ۴ وعده با پروتئین بالا.',
        type: 'number'
    },
    { 
        key: 'calorieIntake', label: 'کالری کل دیروز', 
        desc: 'مجموع کالری دریافتی جهت ریکاوری.', 
        scale: 'کیلوکالری (kcal)', 
        example: '۲۵۰۰: هدف، ۱۸۰۰: کم، ۳۲۰۰: زیاد.',
        type: 'number'
    },
    { 
        key: 'hydrationScore', label: 'هیدراتاسیون / آب', 
        desc: 'میزان آب نوشیده شده در روز گذشته.', 
        scale: '۱ (بسیار کم) تا ۵ (عالی)', 
        example: '۱: کمتر از ۱ لیتر. ۵: بیش از ۳ لیتر.',
        type: 'scale'
    },
    { 
        key: 'yesterdayIntensity', label: 'شدت تمرین دیروز', 
        desc: 'نوع و شدت تمرین انجام شده در روز قبل.', 
        scale: '۱ (استراحت) تا ۵ (بسیار سنگین)', 
        example: '۱: استراحت. ۵: تمرین پا سنگین، شکست رکورد.',
        type: 'scale'
    },
    { 
        key: 'supplementsTaken', label: 'مکمل‌های مصرف شده', 
        desc: 'لیست مکمل‌هایی که دیروز مصرف کردید.', 
        scale: 'متن (Text)', 
        example: 'وی پروتئین، کراتین، BCAA، مولتی ویتامین.',
        type: 'text'
    },
];

// Helper to calculate AMF Score (Reused for historical data)
const calculateAMF = (stats: any) => {
    if (!stats) return 0;
    const s1 = (stats.sleepQuality || 3) + (stats.morningEnergy || 3) + (stats.moodScore || 3);
    const s1_neg = (6 - (stats.stressLevel || 3));
    const s2_neg = (6 - (stats.soreness || 2)) + (6 - (stats.stiffness || 2)) + (6 - (stats.muscleFatigue || 2));
    const s3_pos = (stats.hydrationScore || 3);
    const s3_neg = (6 - (stats.yesterdayIntensity || 3));
    // Max theoretical score approximation for scaling
    // (5+5+5) + 5 + (5+5+5) + 5 + 5 = 45 points max raw logic roughly
    // Adjusted weighting:
    // Wellness (15) + Low Stress (5) + Fresh Body (15) + Hydration (5) + Low Prev Load (5) = 45
    // Let's normalize to 100.
    const totalRaw = s1 + s1_neg + s2_neg + s3_pos + s3_neg;
    // Scale: min approx 10, max 45. 
    return Math.min(100, Math.round((totalRaw / 45) * 100));
};

// Helper: Get Today's Planned Workout Type
const getTodayWorkoutType = (profile: UserProfile): string => {
    // Javascript Day: 0=Sun, 1=Mon... 6=Sat
    // App Day: 0=Sat, 1=Sun... (Based on TrainingCenter.tsx mapping)
    const jsDay = new Date().getDay();
    const appDay = (jsDay + 1) % 7; 
    
    if (profile.smartProgram) {
        const session = profile.smartProgram.sessions.find(s => s.dayOfWeek === appDay);
        if (session) return session.focus || 'General';
    }
    
    // Check active manual program if needed, for now stick to smart program or default
    return 'General';
};

const PhysiologicalReadinessWidget: React.FC<{ 
    profile: UserProfile; 
    updateProfile: (p: UserProfile) => void; 
    logs: DailyLog[]; 
    onInteract: () => void;
    updateTodaysLog: (partial: Partial<DailyLog>) => void;
}> = ({ profile, logs, onInteract, updateTodaysLog }) => {
    const today = new Date().toLocaleDateString('fa-IR');
    const todayLog = logs.find(l => l.date === today);
    
    // Initial State
    const [step, setStep] = useState(1);
    const [activeSubTab, setActiveSubTab] = useState<'input' | 'trends'>('input');
    const [stats, setStats] = useState(todayLog?.readinessStats || {
        sleepQuality: 3,
        morningEnergy: 3,
        stressLevel: 3,
        moodScore: 3,
        soreness: 2,
        stiffness: 2,
        muscleFatigue: 2,
        restingHeartRate: 0,
        yesterdayIntensity: 3,
        proteinIntake: 0,
        calorieIntake: 0,
        hydrationScore: 3,
        supplementsTaken: ''
    });
    
    // Separate state for weight since it lives on root DailyLog but is entered here
    const [weightInput, setWeightInput] = useState<number>(todayLog?.bodyWeight || profile.currentWeight || 0);

    const [isSubmitted, setIsSubmitted] = useState(!!todayLog?.readinessStats);

    // Step 4: Readiness Score Calculation
    const readinessScore = useMemo(() => calculateAMF(stats), [stats]);

    // NEW: Badge & Achievement System Logic
    const earnedBadges = useMemo(() => {
        const badges = [];
        
        // Prepare valid logs sorted by date (newest first)
        const validLogs = logs
            .filter(l => l.readinessStats)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // 1. Discipline Badge: 7 consecutive days
        let consecutiveDays = 0;
        if (validLogs.length > 0) {
            consecutiveDays = 1; // Count the most recent one
            for (let i = 0; i < Math.min(validLogs.length - 1, 6); i++) {
                const dCurrent = new Date(validLogs[i].date);
                const dPrev = new Date(validLogs[i+1].date);
                const diffTime = Math.abs(dCurrent.getTime() - dPrev.getTime());
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    consecutiveDays++;
                } else {
                    break;
                }
            }
        }
        
        if (consecutiveDays >= 7) {
            badges.push({
                id: 'discipline',
                label: 'انضباط تمرینی',
                desc: '۷ روز ثبت مداوم اطلاعات',
                icon: Calendar,
                color: 'text-blue-400',
                bg: 'bg-blue-900/30',
                border: 'border-blue-500/30'
            });
        }

        // 2. Peak Form Badge: Avg AMF >= 80 in last 7 days
        if (validLogs.length >= 7) {
            const last7 = validLogs.slice(0, 7);
            const avgAMF = last7.reduce((sum, l) => sum + calculateAMF(l.readinessStats), 0) / 7;
            
            if (avgAMF >= 80) {
                badges.push({
                    id: 'peak_form',
                    label: 'اوج فرم',
                    desc: 'میانگین آمادگی بالای ۸۰ (هفتگی)',
                    icon: Flame,
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-900/30',
                    border: 'border-yellow-500/30'
                });
            }
        }

        return badges;
    }, [logs, isSubmitted]);

    // NEW: Training Program Integration
    const workoutType = useMemo(() => getTodayWorkoutType(profile), [profile]);
    const trainingOverride = useMemo(() => {
        const amf = readinessScore;
        const wTypeLower = workoutType.toLowerCase();
        const highStress = ['legs', 'lower', 'pull', 'back', 'full body', 'full_body']; // Assuming Pull often has Deadlifts
        const isHighStress = highStress.some(s => wTypeLower.includes(s));

        if (amf < 50) {
            if (isHighStress) {
                return {
                    warning: `آمادگی شما پایین است (${amf}). از تمرینات پرفشار ${workoutType} خودداری کنید.`,
                    modified_plan: "سویچ به حرکات کششی، موبیلیتی یا استراحت فعال."
                };
            }
            return {
                warning: `آمادگی جسمانی پایین (${amf}). شدت تمرین را بسیار کاهش دهید.`,
                modified_plan: "کاردیو سبک یا تمرین ریکاوری."
            };
        }

        if (amf < 70) {
            return {
                warning: "کاهش شدت توصیه می‌شود. سیستم عصبی کاملا ریکاوری نشده است.",
                modified_plan: "استفاده از دستگاه‌ها به جای وزنه‌های آزاد سنگین یا کاهش ۲۰٪ رکوردها."
            };
        }

        return {
            warning: null,
            modified_plan: "طبق برنامه پیش بروید."
        };
    }, [readinessScore, workoutType]);

    // NEW: Automatic Overtraining Alert (3-Day Monitoring)
    const overtrainingAlert = useMemo(() => {
        const history = logs
            .filter(l => l.readinessStats)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // If submitted today, history[0] is today (because of how logs state updates). 
        // We need 3 days minimum.
        if (history.length < 3) return null;

        const last3 = history.slice(0, 3);
        
        // Check continuity (must be consecutive days)
        let isConsecutive = true;
        for (let i = 0; i < 2; i++) {
            const d1 = new Date(last3[i].date);
            const d2 = new Date(last3[i+1].date);
            // Diff in days approx 1
            const diff = Math.abs((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
            if (Math.abs(diff - 1) > 0.1) {
                isConsecutive = false;
                break;
            }
        }

        if (!isConsecutive) return null;

        const amfs = last3.map(l => calculateAMF(l.readinessStats));
        const isOvertraining = amfs.every(score => score < 50);

        if (isOvertraining) {
            return "احتمال اُوِرتِرِینینگ. سه روز آمادگی پایین ثبت شده. پیشنهاد: استراحت و ریکاوری فعال.";
        }
        return null;
    }, [logs, isSubmitted]);

    // Step 4 & 5: Smart Output & Recommendation Engine
    const analysis = useMemo(() => {
        let category = "";
        let color = "";
        let advice = "";
        let details = "";
        let rangeDesc = "";

        if (readinessScore >= 85) {
            category = "High Readiness – Heavy Training Recommended";
            color = "text-green-400";
            rangeDesc = "85–100: بدن در اوج آمادگی";
            advice = "بدن شما ریکاوری عالی داشته و آماده فشار حداکثری است.";
            details = "پیشنهاد امروز: حرکات چندمفصلی سنگین (اسکات، ددلیفت، پرس)، سیستم‌های تمرینی شدید (سوپرست، دراپ‌ست) و رکوردگیری. سیستم عصبی شما کاملا آماده است.";
        } else if (readinessScore >= 60) {
            category = "Moderate Readiness – Standard Training";
            color = "text-blue-400";
            rangeDesc = "60–84: آمادگی مطلوب و استاندارد";
            advice = "وضعیت بدنی خوب است. یک جلسه تمرینی نرمال و استاندارد داشته باشید.";
            details = "پیشنهاد امروز: تمرین با حجم و شدت کنترل شده. روی هایپرتروفی (عضله‌سازی) تمرکز کنید اما از ناتوانی کامل (Failure) در تمام ست‌ها پرهیز کنید.";
        } else if (readinessScore >= 30) {
            category = "Low Readiness – Light Training";
            color = "text-yellow-400";
            rangeDesc = "30–59: عدم ریکاوری کامل";
            advice = "ریکاوری کامل نشده است. تمرین سبک یا هوازی ملایم توصیه می‌شود.";
            details = "پیشنهاد امروز: تمرینات تکنیکی، موبیلیتی، کاردیو با شدت پایین (LISS) یا یک جلسه بدنسازی بسیار سبک با ۵۰٪ توان.";
        } else {
            category = "Very Low Readiness – Active Rest Recommended";
            color = "text-red-400";
            rangeDesc = "0–29: هشدار ریکاوری";
            advice = "بدن نیاز مبرم به استراحت دارد. خطر آسیب‌دیدگی بالاست.";
            details = "پیشنهاد امروز: فقط استراحت فعال. پیاده‌روی، حرکات کششی، فوم رولر، خواب بیشتر و تغذیه ریکاوری. از وزنه زدن خودداری کنید.";
        }

        // Dynamic Explanation (Short Explainer)
        const reasons = [];
        if (stats.sleepQuality <= 2) reasons.push("کیفیت خواب پایین");
        if (stats.soreness >= 4) reasons.push("درد عضلانی شدید (DOMS)");
        if (stats.stressLevel >= 4) reasons.push("استرس ذهنی بالا");
        if (stats.yesterdayIntensity >= 4) reasons.push("خستگی تمرین دیروز");
        if (stats.hydrationScore <= 2) reasons.push("هیدراتاسیون ناکافی");
        if (stats.morningEnergy <= 2) reasons.push("انرژی صبحگاهی کم");
        
        let reasonText = "";
        if (reasons.length > 0) {
            reasonText = `علل اصلی نمره فعلی: ${reasons.slice(0, 3).join('، ')}.`;
        } else {
            reasonText = "همه شاخص‌ها در وضعیت متعادلی قرار دارند.";
        }

        return { category, color, advice, details, reasonText, rangeDesc };
    }, [readinessScore, stats]);

    // Step 6: Weekly/Monthly Trends Data Generation
    const trendsData = useMemo(() => {
        // Prepare Data Points
        const validLogs = logs
            .filter(l => l.readinessStats)
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-30); // Last 30 days

        const chartData = validLogs.map(l => ({
            date: l.date.split('/').slice(1).join('/'),
            fullDate: l.date,
            sleep: l.readinessStats?.sleepQuality || 0,
            amf: calculateAMF(l.readinessStats),
            intensity: l.readinessStats?.yesterdayIntensity || 0,
            recovery: l.readinessStats ? ((l.readinessStats.sleepQuality || 0) + (6 - (l.readinessStats.stressLevel || 3))) : 0
        }));

        // 1. Sleep Trend Insight
        let sleepSummary = "اطلاعات خواب کافی نیست.";
        if (chartData.length >= 7) {
            const last7 = chartData.slice(-7);
            const avg = last7.reduce((a, b) => a + b.sleep, 0) / 7;
            if (avg >= 4) sleepSummary = "کیفیت خواب شما در هفته گذشته عالی بوده است.";
            else if (avg >= 3) sleepSummary = "خواب شما در سطح متوسطی است، جای بهبود دارد.";
            else sleepSummary = "کیفیت خواب پایین است و روی ریکاوری تاثیر منفی دارد.";
        }

        // 2. Readiness Trend Insight
        let amfSummary = "روند آمادگی در حال شکل‌گیری است.";
        if (chartData.length >= 5) {
            const recent = chartData.slice(-3);
            const isDipping = recent[2].amf < recent[0].amf - 10;
            const isRising = recent[2].amf > recent[0].amf + 10;
            if (isDipping) amfSummary = "روند آمادگی شما نزولی است. شاید نیاز به دی‌لود (Deload) دارید.";
            else if (isRising) amfSummary = "آمادگی جسمانی شما رو به افزایش است. زمان خوبی برای افزایش رکورد است.";
            else amfSummary = "سطح آمادگی شما پایدار است.";
        }

        // 3. Training vs Recovery Insight
        let relationSummary = "ارتباط تمرین و ریکاوری...";
        const heavyDays = chartData.filter(d => d.intensity >= 4);
        if (heavyDays.length > 0) {
            // Check AMF on day AFTER heavy day
            let drops = 0;
            heavyDays.forEach(hd => {
                const nextDay = chartData.find(d => new Date(d.fullDate).getTime() > new Date(hd.fullDate).getTime()); // Simplified check
                if (nextDay && nextDay.amf < 50) drops++;
            });
            if (drops > heavyDays.length / 2) relationSummary = "روزهای سنگین باعث افت شدید آمادگی در روز بعد می‌شوند. ریکاوری فوری را جدی بگیرید.";
            else relationSummary = "بدن شما به خوبی با فشار تمرینات سنگین سازگار شده است.";
        }

        return { 
            data: chartData, 
            insights: { sleepSummary, amfSummary, relationSummary }
        };
    }, [logs]);

    const handleSubmit = () => {
        updateTodaysLog({
            readinessStats: stats,
            bodyWeight: weightInput, 
            sleepQuality: stats.sleepQuality * 2,
            stressIndex: (stats.stressLevel - 1) * 25,
            energyLevel: stats.morningEnergy * 2
        });
        setIsSubmitted(true);
        onInteract();
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-400';
        if (score >= 60) return 'text-blue-400';
        if (score >= 30) return 'text-yellow-400';
        return 'text-red-400';
    };

    const renderInput = (metric: any) => {
        if (metric.type === 'text') {
            return (
                <textarea
                    value={(stats as any)[metric.key] || ''}
                    onChange={(e) => setStats({ ...stats, [metric.key]: e.target.value })}
                    placeholder={metric.example}
                    className="w-full bg-black/30 border border-gray-600 rounded-lg p-3 text-sm text-white resize-none h-20 focus:border-blue-500 outline-none"
                />
            );
        }

        if (metric.type === 'number') {
            const val = metric.key === 'bodyWeight' ? weightInput : (stats as any)[metric.key] || '';
            const setVal = metric.key === 'bodyWeight' 
                ? (v: number) => setWeightInput(v)
                : (v: number) => setStats({ ...stats, [metric.key]: v });

            return (
                <div className="bg-black/30 p-3 rounded-lg flex items-center justify-between">
                    <input 
                        type="number" 
                        value={val}
                        onChange={(e) => setVal(Number(e.target.value))}
                        placeholder="0"
                        className="bg-transparent text-white font-bold text-lg w-24 text-center outline-none border-b border-gray-600 focus:border-blue-500"
                    />
                    <span className="text-xs text-gray-500">{metric.scale}</span>
                </div>
            );
        }

        // Scale 1-5
        return (
            <div className="flex justify-between items-center bg-black/30 p-1 rounded-lg">
                {[1, 2, 3, 4, 5].map(val => (
                    <button
                        key={val}
                        onClick={() => setStats({ ...stats, [metric.key]: val })}
                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                            // @ts-ignore
                            stats[metric.key] === val 
                                ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                    >
                        {val}
                    </button>
                ))}
            </div>
        );
    };

    const currentMetrics = step === 1 ? READINESS_METRICS_STEP1 : step === 2 ? READINESS_METRICS_STEP2 : READINESS_METRICS_STEP3;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header Card */}
            <div className="energetic-card p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-green-500/20 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <Activity className="text-green-400" size={28}/> 
                                سنجش آمادگی (AMF Score)
                            </h2>
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 ml-auto md:ml-0">
                                <button 
                                    onClick={() => setActiveSubTab('input')}
                                    className={`px-3 py-1 rounded text-xs font-bold transition ${activeSubTab === 'input' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    محاسبه گر
                                </button>
                                <button 
                                    onClick={() => setActiveSubTab('trends')}
                                    className={`px-3 py-1 rounded text-xs font-bold transition ${activeSubTab === 'trends' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    تحلیل و نمودار
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-xl">
                            تحلیل جامع سیستم عصبی، وضعیت عضلانی و عادات ریکاوری برای تعیین دقیق شدت تمرین امروز.
                        </p>
                    </div>
                    
                    {/* Score Circle */}
                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" fill="transparent" stroke="#1f2937" strokeWidth="8"/>
                            <circle 
                                cx="64" cy="64" r="56" 
                                fill="transparent" 
                                stroke={isSubmitted ? (readinessScore >= 85 ? '#22c55e' : readinessScore >= 60 ? '#3b82f6' : readinessScore >= 30 ? '#eab308' : '#ef4444') : '#4b5563'} 
                                strokeWidth="8" 
                                strokeDasharray={351} 
                                strokeDashoffset={isSubmitted ? 351 - (351 * readinessScore) / 100 : 351} 
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className={`text-3xl font-black ${isSubmitted ? getScoreColor(readinessScore) : 'text-gray-600'}`}>
                                {isSubmitted ? readinessScore : '?'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">امتیاز AMF</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TAB: INPUT FORM & RESULTS */}
            {activeSubTab === 'input' && (
                <>
                    {/* Input Form Steps */}
                    {!isSubmitted && (
                        <>
                            {/* Step Indicator */}
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className={`h-2 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                                <div className={`h-2 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                                <div className={`h-2 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4">
                                {currentMetrics.map((metric, idx) => (
                                    <div key={metric.key} className={`bg-[#1E293B] border border-gray-700 p-5 rounded-xl transition hover:border-gray-500 ${metric.key === 'supplementsTaken' ? 'md:col-span-2' : ''}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-white text-sm flex items-center">
                                                    {metric.label}
                                                </h4>
                                                <p className="text-[10px] text-gray-400 mt-1">{metric.desc}</p>
                                            </div>
                                            <div className="group relative">
                                                <Info size={16} className="text-gray-500 cursor-help"/>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-black/90 text-gray-300 text-xs p-3 rounded-lg border border-gray-600 shadow-xl opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 text-right">
                                                    <p className="font-bold text-white mb-1">راهنما:</p>
                                                    <p className="text-gray-400 italic">{metric.example}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {renderInput(metric)}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between pt-4">
                                {step > 1 && (
                                    <button onClick={() => setStep(s => s - 1)} className="text-gray-400 hover:text-white px-6">بازگشت</button>
                                )}
                                
                                {step < 3 ? (
                                    <button 
                                        onClick={() => setStep(s => s + 1)} 
                                        className="w-full md:w-auto ml-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-12 rounded-xl shadow-lg transition flex items-center justify-center"
                                    >
                                        مرحله بعد <ArrowRight size={18} className="mr-2 rotate-180"/>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleSubmit} 
                                        className="w-full md:w-auto ml-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-12 rounded-xl shadow-lg shadow-green-900/40 transition transform hover:scale-105 flex items-center justify-center"
                                    >
                                        <CheckCircle2 size={20} className="mr-2"/> محاسبه و دریافت برنامه
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {/* Step 4 & 5: Result Area with Smart Insights */}
                    {isSubmitted && (
                        <div className={`bg-[#1E293B] border-2 border-opacity-50 p-6 rounded-2xl animate-in slide-in-from-bottom-4 relative overflow-hidden ${analysis.color.replace('text-', 'border-')}`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-opacity-10 rounded-full blur-3xl -mr-10 -mt-10 ${analysis.color.replace('text-', 'bg-')}`}></div>
                            
                            {/* BADGES DISPLAY */}
                            {earnedBadges.length > 0 && (
                                <div className="mb-6 flex gap-3 overflow-x-auto pb-2 relative z-10">
                                    {earnedBadges.map(badge => (
                                        <div key={badge.id} className={`flex items-center gap-2 p-2 rounded-lg border ${badge.bg} ${badge.border}`}>
                                            <badge.icon className={badge.color} size={18} />
                                            <div>
                                                <span className={`text-xs font-bold block ${badge.color}`}>{badge.label}</span>
                                                <span className="text-[10px] text-gray-400">{badge.desc}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                {/* Summary Block */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap size={24} className={analysis.color}/>
                                        <h4 className={`font-black text-xl ${analysis.color}`}>{analysis.category}</h4>
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-4">{analysis.rangeDesc}</span>
                                    
                                    {/* --- OVERTRAINING ALERT (NEW) --- */}
                                    {overtrainingAlert && (
                                        <div className="mb-4 p-4 rounded-xl border bg-red-900/30 border-red-500/50 animate-pulse">
                                            <h5 className="font-bold text-sm mb-1 flex items-center text-red-300">
                                                <AlertOctagon size={18} className="mr-2"/> هشدار جدی
                                            </h5>
                                            <p className="text-gray-200 text-xs leading-relaxed font-bold">
                                                {overtrainingAlert}
                                            </p>
                                        </div>
                                    )}

                                    {/* --- TRAINING PROGRAM INTEGRATION (OVERRIDE ALERT) --- */}
                                    {trainingOverride.warning && (
                                        <div className={`mb-4 p-4 rounded-xl border ${readinessScore < 50 ? 'bg-red-900/20 border-red-500/50' : 'bg-yellow-900/20 border-yellow-500/50'}`}>
                                            <h5 className={`font-bold text-sm mb-1 flex items-center ${readinessScore < 50 ? 'text-red-300' : 'text-yellow-300'}`}>
                                                <AlertTriangle size={16} className="mr-2"/> هشدار تمرین ({workoutType})
                                            </h5>
                                            <p className="text-gray-200 text-xs leading-relaxed mb-2">
                                                {trainingOverride.warning}
                                            </p>
                                            <div className="bg-black/30 p-2 rounded-lg">
                                                <span className="text-[10px] text-gray-400 block mb-1">برنامه اصلاح شده:</span>
                                                <span className="text-sm font-bold text-white">{trainingOverride.modified_plan}</span>
                                            </div>
                                        </div>
                                    )}

                                    {!trainingOverride.warning && (
                                        <div className="bg-black/30 border border-white/5 rounded-xl p-4 mb-4">
                                            <h5 className="font-bold text-white text-sm mb-2 flex items-center"><Dumbbell size={16} className="mr-2 text-white"/> توصیه تمرینی هوشمند:</h5>
                                            <p className="text-gray-300 text-sm leading-relaxed">{analysis.advice} {analysis.details}</p>
                                        </div>
                                    )}

                                    {analysis.reasonText && (
                                        <div className="flex items-start gap-2 bg-red-900/20 p-3 rounded-lg border border-red-500/20">
                                            <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0"/> 
                                            <p className="text-xs text-red-200 leading-relaxed">
                                                <span className="font-bold">تحلیل وضعیت:</span> {analysis.reasonText}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 md:w-1/3 text-center self-start">
                                    <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                                        <span className="text-[10px] text-gray-500 block">RHR</span>
                                        <span className="text-white font-bold">{stats.restingHeartRate || '--'} bpm</span>
                                    </div>
                                    <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                                        <span className="text-[10px] text-gray-500 block">Weight</span>
                                        <span className="text-white font-bold">{weightInput || '--'} kg</span>
                                    </div>
                                    <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                                        <span className="text-[10px] text-gray-500 block">Protein</span>
                                        <span className="text-white font-bold">{stats.proteinIntake || '--'} g</span>
                                    </div>
                                    <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                                        <span className="text-[10px] text-gray-500 block">Hydration</span>
                                        <span className="text-white font-bold">{stats.hydrationScore}/5</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-4 relative z-10">
                                <button onClick={() => setIsSubmitted(false)} className="text-xs text-gray-500 hover:text-white underline">
                                    محاسبه مجدد / اصلاح ورودی
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* TAB: TRENDS & ANALYTICS (Step 6) */}
            {activeSubTab === 'trends' && (
                <div className="space-y-6 animate-in fade-in">
                    
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* 1. Sleep Trend Chart */}
                        <div className="energetic-card p-6 border-blue-500/30">
                            <h3 className="font-bold text-white mb-4 flex items-center">
                                <Moon className="mr-2 text-blue-400"/> روند کیفیت خواب (۷ روزه)
                            </h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendsData.data.slice(-7)}>
                                        <defs>
                                            <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>
                                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tick={{dy: 5}}/>
                                        <YAxis domain={[0, 5]} hide/>
                                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px'}} />
                                        <Area type="monotone" dataKey="sleep" stroke="#3b82f6" fill="url(#sleepGrad)" strokeWidth={2} name="Sleep Quality" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-blue-300 mt-3 text-center bg-blue-900/20 p-2 rounded-lg border border-blue-500/20">
                                <Info size={12} className="inline mr-1"/> {trendsData.insights.sleepSummary}
                            </p>
                        </div>

                        {/* 2. Readiness AMF Trend */}
                        <div className="energetic-card p-6 border-green-500/30">
                            <h3 className="font-bold text-white mb-4 flex items-center">
                                <Activity className="mr-2 text-green-400"/> روند آمادگی جسمانی (AMF)
                            </h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendsData.data.slice(-14)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>
                                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tick={{dy: 5}}/>
                                        <YAxis domain={[0, 100]} hide/>
                                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px'}} />
                                        <Line type="monotone" dataKey="amf" stroke="#22c55e" strokeWidth={3} dot={{r:3}} name="AMF Score" />
                                        <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-green-300 mt-3 text-center bg-green-900/20 p-2 rounded-lg border border-green-500/20">
                                <TrendingUp size={12} className="inline mr-1"/> {trendsData.insights.amfSummary}
                            </p>
                        </div>

                        {/* 3. Training vs Recovery Comparison */}
                        <div className="energetic-card p-6 lg:col-span-2 border-yellow-500/30">
                            <h3 className="font-bold text-white mb-4 flex items-center">
                                <BarChart2 className="mr-2 text-yellow-400"/> تاثیر شدت تمرین بر ریکاوری
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={trendsData.data.slice(-14)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>
                                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tick={{dy: 5}}/>
                                        <YAxis yAxisId="left" orientation="left" stroke="#eab308" fontSize={10} domain={[0, 5]} hide />
                                        <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" fontSize={10} domain={[0, 100]} hide />
                                        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px'}} />
                                        <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
                                        
                                        <Bar yAxisId="left" dataKey="intensity" name="Training Intensity (1-5)" fill="#eab308" barSize={20} radius={[4,4,0,0]} />
                                        <Line yAxisId="right" type="monotone" dataKey="amf" name="Readiness Score" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-yellow-300 mt-3 text-center bg-yellow-900/20 p-2 rounded-lg border border-yellow-500/20">
                                <Zap size={12} className="inline mr-1"/> {trendsData.insights.relationSummary}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ... (Rest of the file remains unchanged: EliteRecoveryCenter, etc.)

interface SleepDetailedMetrics {
    totalHours: number;
    deepSleepMinutes: number;
    remSleepMinutes: number;
    efficiency: number; // 0-100%
    chronotype: 'Lark' | 'Owl' | 'Hummingbird';
}

const EliteRecoveryCenter: React.FC<{ 
    profile: UserProfile; 
    updateProfile: (p: UserProfile) => void;
    logs: DailyLog[];
    onInteract: () => void;
}> = ({ profile, updateProfile, logs, onInteract }) => {
    // STATE
    const [view, setView] = useState<'dashboard' | 'sleepLab' | 'protocol'>('dashboard');
    const [sleepData, setSleepData] = useState<SleepDetailedMetrics>({
        totalHours: 7.5,
        deepSleepMinutes: 60,
        remSleepMinutes: 90,
        efficiency: 85,
        chronotype: 'Hummingbird'
    });

    // --- RSR ALGORITHM CORE ---
    const rsrData = useMemo(() => {
        // 1. Vitals Score (40%)
        const vitals = profile.healthProfile?.vitalsHistory?.slice(-1)[0];
        let vitalScore = 50; 
        let vitalRootCause = "Insufficient Data";
        
        if (vitals) {
            if (vitals.hrv > 60) { vitalScore = 90; vitalRootCause = "Excellent HRV"; }
            else if (vitals.hrv > 40) { vitalScore = 70; vitalRootCause = "Normal HRV"; }
            else { vitalScore = 30; vitalRootCause = "Low HRV (Sympathetic Stress)"; }
        }

        // 2. Sleep Score (30%)
        const deepPct = (sleepData.deepSleepMinutes / (sleepData.totalHours * 60)) * 100;
        const remPct = (sleepData.remSleepMinutes / (sleepData.totalHours * 60)) * 100;
        let sleepScore = 0;
        let sleepRootCause = "";

        if (sleepData.totalHours >= 8) sleepScore += 40;
        else if (sleepData.totalHours >= 6) sleepScore += 20;
        
        if (deepPct >= 15) sleepScore += 30; 
        else sleepRootCause = "Low Deep Sleep (Physical Repair Deficit)";

        if (remPct >= 20) sleepScore += 30;
        else if (!sleepRootCause) sleepRootCause = "Low REM (Neural Recovery Deficit)";

        if (sleepScore > 100) sleepScore = 100;
        if (sleepScore === 100) sleepRootCause = "Optimal Sleep Architecture";

        // 3. Training Load (20%)
        const lastLog = logs[logs.length-1];
        let loadScore = 100;
        if (lastLog && lastLog.workoutScore > 80) loadScore = 40; 
        if (lastLog && lastLog.workoutScore > 50) loadScore = 70;

        // 4. Subjective (10%)
        const subScore = (lastLog?.energyLevel || 5) * 10;

        // FINAL RSR CALCULATION
        const finalRSR = Math.round(
            (vitalScore * 0.4) + 
            (sleepScore * 0.3) + 
            (loadScore * 0.2) + 
            (subScore * 0.1)
        );

        let primaryRootCause = "Balanced State";
        let protocolType: 'Active' | 'Rest' | 'Nutrition' = 'Active';

        if (finalRSR < 60) {
            if (vitalScore < 50) { primaryRootCause = "Nervous System Fatigue (Low HRV)"; protocolType = 'Rest'; }
            else if (sleepScore < 50) { primaryRootCause = sleepRootCause || "Insufficient Sleep Volume"; protocolType = 'Rest'; }
            else if (loadScore < 50) { primaryRootCause = "Acute Training Overload"; protocolType = 'Active'; }
            else if (subScore < 40) { primaryRootCause = "High Perceived Fatigue"; protocolType = 'Active'; }
        }

        return { score: finalRSR, rootCause: primaryRootCause, protocolType, vitalScore, sleepScore, loadScore, subScore };
    }, [sleepData, profile.healthProfile?.vitalsHistory, logs]);

    // --- MANDATORY SASKA INTEGRATION ---
    useEffect(() => {
        if (rsrData.score < 50) {
            processGlobalEvent({
                type: 'SCAN_ANALYZED', 
                payload: { 
                    readiness: 'Critical', 
                    rsr: rsrData.score,
                    forceDeload: true 
                },
                timestamp: Date.now()
            }, profile);
        }
    }, [rsrData.score]);

    // UI RENDERERS
    const renderGauge = () => {
        const color = rsrData.score > 75 ? '#22c55e' : rsrData.score > 50 ? '#eab308' : '#ef4444';
        return (
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                <RadialBarChart 
                    width={250} 
                    height={250} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="70%" 
                    outerRadius="100%" 
                    barSize={20} 
                    data={[{ name: 'RSR', value: rsrData.score, fill: color }]} 
                    startAngle={180} 
                    endAngle={0}
                >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                    <span className="text-5xl font-black text-white">{rsrData.score}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">RSR Score</span>
                    <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border ${rsrData.score > 75 ? 'bg-green-900/30 text-green-400 border-green-500/30' : rsrData.score > 50 ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'}`}>
                        {rsrData.score > 75 ? 'OPTIMAL' : rsrData.score > 50 ? 'SUB-OPTIMAL' : 'CRITICAL'}
                    </div>
                </div>
            </div>
        );
    };

    const renderProtocol = () => {
        if (rsrData.score > 75) return null; 

        return (
            <div className="mt-6 bg-[#0f172a] border border-red-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <h4 className="text-lg font-bold text-white mb-2 flex items-center">
                    <ShieldCheck className="text-red-500 mr-2" /> پروتکل اجباری ریکاوری
                </h4>
                <p className="text-sm text-gray-300 mb-4">
                    تحلیل سیستم نشان می‌دهد: <span className="text-red-400 font-bold">{rsrData.rootCause}</span>. برنامه تمرینی شما توسط سیستم Saska به حالت <span className="text-yellow-400 font-bold">Active Recovery</span> تغییر یافت.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400"><Wind size={20}/></div>
                        <div>
                            <span className="text-xs text-gray-400 block">پروتکل تنفسی</span>
                            <span className="text-sm font-bold text-white">Box Breathing (5 min)</span>
                        </div>
                    </div>
                    {rsrData.rootCause.includes("Sleep") ? (
                         <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                            <div className="p-2 bg-purple-900/20 rounded-lg text-purple-400"><Moon size={20}/></div>
                            <div>
                                <span className="text-xs text-gray-400 block">اقدام خواب</span>
                                <span className="text-sm font-bold text-white">+60m Sleep Extension</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                            <div className="p-2 bg-orange-900/20 rounded-lg text-orange-400"><RotateCcw size={20}/></div>
                            <div>
                                <span className="text-xs text-gray-400 block">اقدام فیزیکی</span>
                                <span className="text-sm font-bold text-white">Foam Roll (Glutes/Quads)</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {view === 'dashboard' && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="energetic-card p-6 bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-gray-700 shadow-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Battery className="text-green-400" /> وضعیت سیستمیک (RSR)
                                </h3>
                                <button onClick={() => setView('sleepLab')} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition text-blue-300">
                                    ورود به آزمایشگاه خواب
                                </button>
                            </div>
                            {renderGauge()}
                            <div className="grid grid-cols-4 gap-2 mt-6 text-center">
                                <div className="bg-black/30 p-2 rounded border border-white/5">
                                    <span className="block text-[10px] text-gray-500">Vital</span>
                                    <span className={`text-sm font-bold ${rsrData.vitalScore > 70 ? 'text-green-400' : 'text-red-400'}`}>{rsrData.vitalScore}</span>
                                </div>
                                <div className="bg-black/30 p-2 rounded border border-white/5">
                                    <span className="block text-[10px] text-gray-500">Sleep</span>
                                    <span className={`text-sm font-bold ${rsrData.sleepScore > 70 ? 'text-green-400' : 'text-red-400'}`}>{rsrData.sleepScore}</span>
                                </div>
                                <div className="bg-black/30 p-2 rounded border border-white/5">
                                    <span className="block text-[10px] text-gray-500">Load</span>
                                    <span className={`text-sm font-bold ${rsrData.loadScore > 70 ? 'text-green-400' : 'text-red-400'}`}>{rsrData.loadScore}</span>
                                </div>
                                <div className="bg-black/30 p-2 rounded border border-white/5">
                                    <span className="block text-[10px] text-gray-500">Subj.</span>
                                    <span className={`text-sm font-bold ${rsrData.subScore > 70 ? 'text-green-400' : 'text-red-400'}`}>{rsrData.subScore}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {renderProtocol()}
                            
                            {(rsrData.score < 60) && (
                                <div className="energetic-card p-4 border-yellow-500/30 bg-yellow-900/10 flex items-start gap-3">
                                    <Utensils className="text-yellow-400 shrink-0 mt-1" size={20}/>
                                    <div>
                                        <h4 className="font-bold text-yellow-300 text-sm">توصیه تغذیه ریکاوری</h4>
                                        <p className="text-xs text-yellow-200/70 mt-1 leading-relaxed">
                                            به دلیل فشار سیستمیک، مصرف کربوهیدرات پیچیده در وعده بعد از تمرین را ۲۰٪ افزایش دهید و هیدراتاسیون را با الکترولیت کامل کنید.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Placeholder for Sleep Lab View */}
            {view === 'sleepLab' && (
                <div className="energetic-card p-6">
                    <button onClick={() => setView('dashboard')} className="text-sm text-gray-400 mb-4">&larr; بازگشت به داشبورد</button>
                    <h3 className="text-xl font-bold text-white mb-4">آزمایشگاه خواب (Sleep Lab)</h3>
                    <p className="text-gray-500">این بخش به زودی با تحلیل دقیق مراحل خواب تکمیل می‌شود.</p>
                </div>
            )}
        </div>
    );
};

const HealthHub: React.FC<HealthHubProps> = ({ profile, updateProfile, logs, setCurrentView, updateTodaysLog }) => {
    const [activeTab, setActiveTab] = useState('readiness');
    const [isInteracted, setIsInteracted] = useState(false);

    // Filter Logs for Health Module
    // We only care if modulesInteracted includes specific health sub-modules
    // but the main logHealthInteraction just pushes module name. 
    // Here we might just check if *any* health interaction happened today.
    const today = new Date().toISOString().split('T')[0];
    useEffect(() => {
        const todayLog = profile.healthActivityLogs?.find(l => l.date === today);
        if (todayLog && todayLog.modulesInteracted.length > 0) {
            setIsInteracted(true);
        }
    }, [profile.healthActivityLogs]);

    const handleInteraction = (moduleName: HealthModuleType) => {
        logHealthInteraction(profile, updateProfile, moduleName);
    };

    // Calculate Consistency
    const consistency = useMemo(() => calculateHealthConsistency(profile, 7), [profile.healthActivityLogs]);

    // Render active module
    const renderModule = () => {
        switch (activeTab) {
            case 'readiness':
                return (
                    <PhysiologicalReadinessWidget 
                        profile={profile} 
                        updateProfile={updateProfile} 
                        logs={logs} 
                        onInteract={() => handleInteraction('AI_Analysis')}
                        updateTodaysLog={updateTodaysLog}
                    />
                );
            case 'recovery':
                return (
                    <EliteRecoveryCenter 
                        profile={profile} 
                        updateProfile={updateProfile} 
                        logs={logs}
                        onInteract={() => handleInteraction('Recovery')}
                    />
                );
            case 'overview':
                return (
                    <div className="energetic-card p-6">
                        <h3 className="text-white font-bold mb-4">نمای کلی سلامت (به زودی)</h3>
                        <p className="text-gray-400 text-sm">داشبورد یکپارچه تمام شاخص‌های حیاتی و ریسک فاکتورها.</p>
                    </div>
                );
            case 'composition':
                return (
                    <div className="energetic-card p-6">
                        <h3 className="text-white font-bold mb-4">آنالیز ترکیب بدنی</h3>
                        <p className="text-gray-400 text-sm">لطفا برای ثبت وزن و چربی به بخش <strong className="text-white">پروفایل و بدن</strong> مراجعه کنید.</p>
                        <button onClick={() => setCurrentView && setCurrentView(AppView.BODY_ANALYSIS)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">برو به پروفایل</button>
                    </div>
                );
            case 'hydration':
                return (
                    <div className="energetic-card p-6">
                        <h3 className="text-white font-bold mb-4">مدیریت آبرسانی</h3>
                        <p className="text-gray-400 text-sm">ثبت آب مصرفی در <strong className="text-white">تغذیه روزانه</strong> انجام می‌شود.</p>
                        <button onClick={() => setCurrentView && setCurrentView(AppView.NUTRITION_CENTER)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">برو به تغذیه</button>
                    </div>
                );
            case 'injuries':
                return (
                    <div className="energetic-card p-6">
                        <h3 className="text-white font-bold mb-4">مدیریت آسیب و ریسک</h3>
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl">
                            <h4 className="text-red-400 font-bold text-sm mb-2">وضعیت فعلی:</h4>
                            {profile.healthProfile?.injuryLog.filter(i => i.status === 'Active').length === 0 ? (
                                <p className="text-green-400 text-sm flex items-center"><CheckCircle2 size={16} className="mr-2"/> هیچ آسیب فعالی ثبت نشده است.</p>
                            ) : (
                                <ul className="text-sm text-gray-300 list-disc list-inside">
                                    {profile.healthProfile?.injuryLog.filter(i => i.status === 'Active').map(i => (
                                        <li key={i.id}>{i.title} ({i.area})</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                );
            case 'archive':
                return (
                    <div className="energetic-card p-6">
                        <h3 className="text-white font-bold mb-4">آرشیو فعالیت‌های سلامت</h3>
                        <div className="space-y-2">
                            {profile.healthActivityLogs?.slice(-10).reverse().map((log, idx) => (
                                <div key={idx} className="flex justify-between text-sm bg-black/20 p-2 rounded">
                                    <span className="text-gray-400">{log.date}</span>
                                    <span className="text-white">{log.modulesInteracted.length} ماژول</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6" dir="rtl">
            {/* Top Navigation */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 shrink-0 overflow-x-auto w-fit mx-auto md:mx-0">
                {DEFAULT_MODULES.sort((a,b) => a.order - b.order).map(mod => {
                    const Icon = IconMap[mod.iconName || 'Activity'];
                    return (
                        <button 
                            key={mod.id}
                            onClick={() => setActiveTab(mod.id)} 
                            className={`px-4 py-2 rounded-lg font-bold flex items-center justify-center transition-all whitespace-nowrap ${activeTab === mod.id ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Icon className="w-4 h-4 ml-2" /> {mod.customName || mod.defaultName}
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {/* Consistency Banner */}
                {consistency > 0 && (
                    <div className="mb-6 flex items-center justify-between bg-[#1E293B] p-3 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-900/20 rounded-lg text-green-400">
                                <ShieldCheck size={20}/>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">ثبات در پایش سلامت</span>
                                <span className="text-white font-bold text-sm">{consistency}% (۷ روز اخیر)</span>
                            </div>
                        </div>
                    </div>
                )}

                {renderModule()}
            </div>
        </div>
    );
};

export default HealthHub;
