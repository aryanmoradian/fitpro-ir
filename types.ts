
export type AppTheme = 'Standard' | 'Gold' | 'Neon';

export type AppView = 
  | 'DASHBOARD' 
  | 'BODY_ANALYSIS' 
  | 'HEALTH_HUB' 
  | 'TRAINING_CENTER' 
  | 'NUTRITION_CENTER' 
  | 'PERFORMANCE_CENTER' 
  | 'SUPPLEMENT_MANAGER' 
  | 'COMMUNITY_CENTER' 
  | 'REWARDS_CENTER' 
  | 'REPORTS_CENTER' 
  | 'SETTINGS_CENTER' 
  | 'PLANNER' 
  | 'TRACKER' 
  | 'COACH' 
  | 'VIDEO_LIBRARY' 
  | 'MEAL_SCAN' 
  | 'BIOLOGICAL_ANALYSIS' 
  | 'PROGRESS_EXPORT' 
  | 'USER_INBOX' 
  | 'BRAND_GUIDE' 
  | 'ADMIN_DASHBOARD'
  | 'SUBSCRIPTION_LANDING'
  | 'MEMBERSHIP_PLANS'
  | 'PAYMENT'
  | 'ANALYTICS_DASHBOARD';

export const AppView = {
  DASHBOARD: 'DASHBOARD',
  BODY_ANALYSIS: 'BODY_ANALYSIS',
  HEALTH_HUB: 'HEALTH_HUB',
  TRAINING_CENTER: 'TRAINING_CENTER',
  NUTRITION_CENTER: 'NUTRITION_CENTER',
  PERFORMANCE_CENTER: 'PERFORMANCE_CENTER',
  SUPPLEMENT_MANAGER: 'SUPPLEMENT_MANAGER',
  COMMUNITY_CENTER: 'COMMUNITY_CENTER',
  REWARDS_CENTER: 'REWARDS_CENTER',
  REPORTS_CENTER: 'REPORTS_CENTER',
  SETTINGS_CENTER: 'SETTINGS_CENTER',
  PLANNER: 'PLANNER',
  TRACKER: 'TRACKER',
  COACH: 'COACH',
  VIDEO_LIBRARY: 'VIDEO_LIBRARY',
  MEAL_SCAN: 'MEAL_SCAN',
  BIOLOGICAL_ANALYSIS: 'BIOLOGICAL_ANALYSIS',
  PROGRESS_EXPORT: 'PROGRESS_EXPORT',
  USER_INBOX: 'USER_INBOX',
  BRAND_GUIDE: 'BRAND_GUIDE',
  ADMIN_DASHBOARD: 'ADMIN_DASHBOARD',
  SUBSCRIPTION_LANDING: 'SUBSCRIPTION_LANDING',
  MEMBERSHIP_PLANS: 'MEMBERSHIP_PLANS',
  PAYMENT: 'PAYMENT',
  ANALYTICS_DASHBOARD: 'ANALYTICS_DASHBOARD',
} as const;

export type UserRole = 'athlete' | 'coach' | 'admin';
export type SubscriptionTier = 'free' | 'elite' | 'elite_plus';
export type AthleteStatus = 'Amateur' | 'Skilled' | 'Semi-Pro' | 'Advanced' | 'Pro' | 'Elite';
export type Gender = 'male' | 'female' | 'other';
export type Mood = 'happy' | 'energetic' | 'neutral' | 'tired' | 'stressed';

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  age?: number;
  gender?: Gender;
  height?: number;
  currentWeight?: number;
  bodyFat?: number;
  sportLevel?: string;
  trainingAge?: string;
  lifestyleActivity?: string;
  somatotype?: 'Ectomorph' | 'Mesomorph' | 'Endomorph';
  specialization?: string;
  trainingStartDate?: string;
  goalType?: string;
  
  // Modules Data
  metricsHistory: BodyMetricLog[];
  bodyScans?: BodyScan[];
  goals: Goal[];
  habits: Habit[];
  
  // Gamification
  level: number;
  xp: number;
  coins: number;
  badges: Badge[];
  activeChallenges: Challenge[];
  activeQuests: Quest[];
  xpHistory?: XPActivity[];
  clubs?: any[];
  inventory?: RewardItem[];
  followersCount?: number;
  followingCount?: number;

  // Configuration
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: string;
  subscriptionExpiry?: string;
  theme?: AppTheme;
  settings?: AthleteSettings;
  meta?: any;
  privacySettings?: {
      isPublic: boolean;
      hideWeight: boolean;
      hideBodyFat: boolean;
      aiRecommendationVisibility: boolean;
  };

  // Specialized Profiles
  healthProfile?: HealthProfile;
  advancedHealth?: AdvancedHealthData;
  nutritionProfile?: NutritionProfile;
  performanceProfile?: { records: PerformanceRecord[] };
  recoveryProfile?: { tasks: RecoveryTask[]; logs: RecoveryLog[] };

  // Logs & Plans
  trainingLogs?: TrainingLog[];
  nutritionLogs?: NutritionDayLog[];
  healthActivityLogs?: HealthActivityLog[];
  supplementLogs?: SupplementLog[];
  supplements?: Supplement[];
  supplementFeedbacks?: SupplementFeedback[];
  
  customExercises?: ExerciseDef[];
  customFoods?: FoodItem[];
  
  activeProgram?: DesignerProgram;
  activeProgramId?: string;
  smartProgram?: SmartProgram;
  savedPrograms?: DesignerProgram[];
  
  savedNutritionPlans?: NutritionPlan[];
  activeNutritionPlanId?: string;
  
  personalizedPlan?: PersonalizedPlan;
  avatar?: string;
  injuries?: string;
  photoGallery?: any[];
  
  // Measurements needed for calculations
  waist?: number;
  neck?: number;
  hips?: number;
}

// --- PART 3: OPS ANALYTICS ENGINE TYPES ---

export interface AnalyticsState {
    ops: OPSScore;
    recommendations: Recommendation[];
    alerts: Alert[];
    weeklyTrend: { date: string; ops: number }[];
}

export interface OPSScore {
    total: number; // 0-100
    trend: 'Improving' | 'Stable' | 'Declining' | 'Volatile';
    delta: number; // Percentage change vs last period
    breakdown: {
        health: number; // 0-100 (normalized)
        workout: number;
        nutrition: number;
        performance: number;
        supplements: number;
        bio: number;
    };
    rawScores: {
        health: number; // 0-1 (raw)
        workout: number;
        nutrition: number;
        performance: number;
        supplements: number;
        bio: number;
    };
    lastUpdated: string;
}

export interface Recommendation {
    id: string;
    priority: 1 | 2 | 3; // 1 = High, 3 = Info
    title: string;
    explanation: string;
    actions: {
        label: string;
        type: string;
        params?: any;
    }[];
    expectedTimeframe: string;
    confidenceScore: number;
    relatedMetrics: string[];
    createdAt: string;
}

export interface Alert {
    id: string;
    level: 'Critical' | 'Warning' | 'Info';
    reason: string;
    metricsInvolved: string[];
    timestamp: string;
    suggestedAction?: string;
    isAcknowledged: boolean;
}

// ... (Rest of existing types)

export interface AnalyticsAggregatedData {
    health: HealthAnalyticsNode;
    training: TrainingAnalyticsNode;
    nutrition: NutritionAnalyticsNode;
    performance: PerformanceAnalyticsNode;
    supplements: SupplementAnalyticsNode;
    bio: BioAnalyticsNode;
    meta: {
        lastUpdated: string;
        dataQualityScore: number;
    }
}

export interface HealthAnalyticsNode {
    avgSleep: number;
    avgEnergy: number;
    avgStress: number;
    vitalTrend: 'Improving' | 'Stable' | 'Declining';
    weightChangeMonthly: number;
    healthScore: number; // 0-100
}

export interface TrainingAnalyticsNode {
    totalVolumeMonthly: number; // kg
    workoutFrequencyWeekly: number;
    intensityTrend: 'High' | 'Moderate' | 'Low';
    efficiencyRating: number; // 0-100
}

export interface NutritionAnalyticsNode {
    avgDailyCalories: number;
    macroAdherence: number; // %
    caloricBalance: 'Surplus' | 'Deficit' | 'Maintenance';
    qualityIndex: number; // 0-100
}

export interface PerformanceAnalyticsNode {
    strengthProgression: number; // % change
    prCountMonthly: number;
    powerIndex: number; // calculated relative to bodyweight
}

export interface SupplementAnalyticsNode {
    adherenceScore: number; // %
    stackEfficiency: number; // calculated based on goal alignment
    dailyConsistency: boolean;
}

export interface BioAnalyticsNode {
    bodyFatTrend: number; // % change
    muscleMassTrend: number; // kg change
    adaptationLevel: 'High' | 'Medium' | 'Low';
}

export interface BodyMetricLog {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  measurements?: BodyMeasurements;
}

export interface BodyMeasurements {
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  armRight?: number;
  armLeft?: number;
  forearms?: number;
  thighRight?: number;
  thighLeft?: number;
  calves?: number;
}

export interface BodyScan {
  id: string;
  date: string;
  monthId: string;
  weight: number;
  photos: {
    front: string | null;
    back: string | null;
    side: string | null;
    fortyFive: string | null;
  };
  stats?: {
    bodyFat?: number;
    leanMass?: number;
    symmetryScore?: number;
  };
  measurements?: BodyMeasurements;
  energyLevel?: number;
  mood?: string;
  notes?: string;
  ai_analysis?: PhysiqueAnalysis;
}

export interface PhysiqueAnalysis {
  bodyFat: number;
  leanMass: number;
  symmetryScore: number;
  proportions: { shoulderToWaist: number; upperLowerBalance: number };
  muscleScores: { chest: number; back: number; shoulders: number; arms: number; abs: number; legs: number };
  heatmap: { region: string; status: string; intensity: number }[];
  insights: { strengths: string[]; weaknesses: string[]; recommendations: string[] };
}

export interface Goal {
  id: string;
  title: string;
  type: 'Primary' | 'Secondary';
  status: 'Active' | 'Completed';
  targetValue?: number;
  currentValue?: number;
  deadline?: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: string;
  streak: number;
}

export interface DailyLog {
  date: string;
  workoutScore: number;
  nutritionScore: number;
  notes?: string;
  
  // Health / Bio
  sleepHours?: number;
  sleepQuality?: number;
  mood?: Mood;
  energyLevel?: number;
  stressIndex?: number;
  restingHeartRate?: number;
  waterIntake?: number; // glasses or units
  steps?: number;
  bodyWeight?: number;
  
  // Legacy / Simple Tracking
  detailedWorkout?: any[]; // Simplified array of exercises
  detailedNutrition?: NutritionItem[]; // Simplified array of food items
  
  consumedMacros?: { calories: number; protein: number; carbs: number; fats: number };
  totalTargetMacros?: { calories: number; protein: number; carbs: number; fats: number };
  
  readinessStats?: any;
  commitmentOverrides?: Record<string, boolean>;
  fatigueLevel?: number;
  userNotes?: string;
}

export interface NutritionItem {
  id: string;
  title: string;
  details?: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  completed?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  name_fa?: string;
  sets: number;
  reps: string;
  rest?: number; // seconds
  muscleGroup: string;
  equipment?: string;
  notes?: string;
  completed?: boolean;
  dbId?: string;
}

// --- TRAINING MODULE TYPES ---

export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Core' | 'Full Body' | 'Glutes' | 'Calves' | 'Forearms' | 'Cardio';
export type Equipment = 'Barbell' | 'Dumbbell' | 'Machine' | 'Cables' | 'Bodyweight' | 'Bands' | 'Smith Machine' | 'TRX';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type TrainingSplit = 'FullBody' | 'UpperLower' | 'PPL' | 'BroSplit';

export interface ExerciseDef {
  id: string;
  name_en: string;
  name_fa: string;
  muscle: MuscleGroup;
  equipment: Equipment;
  difficulty: Difficulty;
  type: 'Compound' | 'Isolation' | 'Cardio';
  pattern: string; // e.g., 'Push_Horizontal'
  description: string;
  secondary_muscles?: MuscleGroup[];
  defaults?: { sets: number; reps: string; rest: number };
  isCustom?: boolean;
  videoUrl?: string;
}

export interface ExerciseLibItem extends ExerciseDef {}

export interface SchedulePreferences {
  daysPerWeek: number;
  preferredDays: number[]; // 0-6
  sessionDuration: number; // minutes
  equipmentAccess: Equipment[];
  goal: string;
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface SmartSession {
  id: string;
  dayOfWeek: number;
  title: string;
  focus: string;
  duration: number;
  intensity: string;
  warmup: Exercise[];
  mainLifts: Exercise[];
  accessories: Exercise[];
  cooldown: Exercise[];
  tags: string[];
  reasoning?: string;
}

export interface SmartProgram {
  id: string;
  generatedAt: string;
  preferences: SchedulePreferences;
  split: TrainingSplit;
  sessions: SmartSession[];
  adaptationLog: any[];
  diagnostics: ProgramDiagnostics;
}

export interface ProgramDiagnostics {
  validationPassed: boolean;
  fallbackTriggered: boolean;
  fallbackReason?: string;
  motionFaultsAddresssed: string[];
  splitLogic: string;
  generatedAt: string;
}

export interface MovementAnalysis {
  id: string;
  date: string;
  exerciseName: string;
  imageUrl: string;
  score: number;
  issues: string[];
  corrections: string[];
  techniqueScore?: number;
  stabilityScore?: number;
  mobilityScore?: number;
  efficiencyScore?: number;
  jointAngles?: any;
  stressMapAreas?: string[];
  faultsDetected?: string[];
  coachFeedback?: string;
  correctivePlan?: any[];
}

// --- DESIGNER PROGRAM TYPES ---

export interface DesignerProgram {
  id: string;
  title: string;
  description?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  durationWeeks: number;
  difficulty: Difficulty;
  weeks: ProgramWeek[];
  isActive: boolean;
  tags: string[];
}

export interface ProgramWeek {
  id: string;
  weekNumber: number;
  days: ProgramDay[];
}

export interface ProgramDay {
  id: string;
  dayNumber: number; // 1-7
  title: string;
  focus: string;
  exercises: ProgramExercise[];
  isRestDay: boolean;
}

export interface ProgramExercise {
  id: string;
  exerciseDefId: string;
  name: string;
  muscle: string;
  order: number;
  sets: ProgramSet[];
  notes?: string;
}

export interface ProgramSet {
  id: string;
  type: 'Warmup' | 'Working' | 'Drop' | 'Failure';
  reps: string;
  weight: number;
  restSeconds: number;
  rpe?: number;
}

// --- LOGGING TYPES ---

export type LogStatus = 'Planned' | 'In Progress' | 'Completed' | 'Partial' | 'Skipped' | 'Rest';

export interface TrainingLog {
  id: string;
  userId: string;
  date: string;
  programId?: string;
  weekId?: string;
  dayId?: string;
  workoutTitle: string;
  status: LogStatus;
  exercises: LogExercise[];
  fatigueLevel?: number;
  userNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogExercise {
  id: string;
  exerciseDefId: string;
  name: string;
  notes?: string;
  completed: boolean;
  sets: LogSet[];
}

export interface LogSet {
  id: string;
  setNumber: number;
  targetReps: string;
  targetWeight: number;
  performedReps?: number;
  performedWeight?: number;
  rpe?: number;
  completed: boolean;
}

// --- NUTRITION TYPES ---

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  unit: string;
  defaultPortion: number;
  category: string;
  isCustom?: boolean;
  notes?: string;
}

export interface NutritionPlan {
  id: string;
  userId: string;
  title: string;
  goal: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  phases: DietPhase[];
}

export interface DietPhase {
  id: string;
  title: string;
  durationWeeks: number;
  days: DietDay[];
}

export interface DietDay {
  id: string;
  dayNumber: number;
  title: string;
  meals: DietMeal[];
  targetMacros: { calories: number; protein: number; carbs: number; fats: number };
}

export interface DietMeal {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'PreWorkout' | 'PostWorkout';
  title: string;
  ingredients: MealIngredient[];
  totalMacros: { calories: number; protein: number; carbs: number; fats: number };
}

export interface MealIngredient {
  id: string;
  foodId: string;
  name: string;
  amount: number;
  unit: string;
  macros: { calories: number; protein: number; carbs: number; fats: number };
}

export interface NutritionDayLog {
  id: string;
  userId: string;
  date: string;
  planId?: string;
  status: 'Completed' | 'Partial' | 'Missed';
  meals: MealLog[];
  waterIntake: number;
  notes?: string;
  totalTargetMacros: { calories: number; protein: number; carbs: number; fats: number };
  totalConsumedMacros: { calories: number; protein: number; carbs: number; fats: number };
}

export interface MealLog {
  id: string;
  planMealId?: string;
  title: string;
  type: string;
  status: 'Planned' | 'Completed' | 'Skipped';
  plannedMacros: { calories: number; protein: number; carbs: number; fats: number };
  actualMacros: { calories: number; protein: number; carbs: number; fats: number };
  ingredients: LogIngredient[];
}

export interface LogIngredient {
  id: string;
  foodId: string;
  name: string;
  unit: string;
  plannedAmount: number;
  actualAmount: number;
  macros: { calories: number; protein: number; carbs: number; fats: number };
}

export interface WeeklyNutritionPlan {
  id: string;
  name: string;
  days: DailyMealPlan[];
}

export interface DailyMealPlan {
  dayOfWeek: number;
  breakfast: MealEntry[];
  lunch: MealEntry[];
  dinner: MealEntry[];
  snacks: MealEntry[];
}

export interface MealEntry {
  id: string;
  foodId: string;
  name: string;
  amount: number;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface NutritionProfile {
  dietaryRestrictions?: string[];
  targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  activePlanId?: string;
}

export interface DietAnalysis {
  qualityScore: number;
  deficiencies: string[];
  excesses: string[];
  suggestions: string[];
  aiFeedback: string;
}

// --- SUPPLEMENTS ---

export type SupplementType = 'Protein' | 'Creatine' | 'Pre-Workout' | 'Amino' | 'Vitamin' | 'FatBurner' | 'Health' | 'Other';
export type SupplementTiming = 'Morning' | 'Pre-Workout' | 'Intra-Workout' | 'Post-Workout' | 'Before Bed' | 'With Meal';

export interface Supplement {
  id: string;
  name: string;
  type: SupplementType;
  dosage: string;
  timing: SupplementTiming[];
  priority: 'Essential' | 'Optional' | 'Advanced';
  isActive: boolean;
  stockRemaining?: number;
  notes?: string;
}

export interface SupplementLog {
  id: string;
  supplementId: string;
  supplementName: string;
  date: string;
  time: string;
  consumed: boolean;
  notes?: string;
}

export interface SupplementFeedback {
  date: string;
  mood: 'High Energy' | 'Recovered' | 'Neutral' | 'Tired' | 'Bloated';
  notes?: string;
}

// --- RECOVERY ---

export type RecoveryCategory = 'Active Recovery' | 'Passive Recovery' | 'Thermal' | 'Manual Therapy' | 'Sleep' | 'Other';
export type RecoveryFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
export type RecoveryIntensity = 'Low' | 'Medium' | 'High';

export interface RecoveryTask {
  id: string;
  title: string;
  category: RecoveryCategory;
  frequency: RecoveryFrequency;
  durationTarget: number; // minutes
  intensity: RecoveryIntensity;
  isCustom: boolean;
  notes?: string;
}

export interface RecoveryLog {
  id: string;
  taskId: string;
  taskTitle: string;
  category: RecoveryCategory;
  date: string; // YYYY-MM-DD
  status: 'Completed' | 'Skipped';
  timestamp: string;
}

export interface SleepDetails {
  totalHours: number;
  deepSleepMinutes: number;
  remSleepMinutes: number;
  efficiency: number;
  chronotype?: string;
}

// --- PERFORMANCE & RECORDS ---

export interface PerformanceRecord {
  id: string;
  date: string;
  type: 'strength' | 'cardio';
  name: string;
  value1: number; // Weight or Distance
  value2?: number; // Reps or Time
  calculatedResult: number; // 1RM or VO2Max
}

export type TestType = 'Cooper' | 'Beep' | 'OneRM';

// --- ANALYTICS & REPORTS ---

export type AnalyticsTimeframe = 'week' | 'month' | 'year';

export interface VolumeDataPoint {
  date: string;
  label: string;
  volume: number;
  intensity: number;
  adherence: number;
}

export interface MuscleSplitStats {
  muscle: string;
  setVolume: number;
}

export interface AnalyticsSummary {
  totalWorkouts: number;
  completionRate: number;
  totalVolume: number;
  missedWorkouts: number;
  bestStreak: number;
}

export interface TrainingInsight {
  type: 'positive' | 'negative' | 'neutral';
  metric: string;
  message: string;
}

export interface NutritionReportData {
  timeline: NutritionTrendPoint[];
  heatmap: NutritionHeatmapPoint[];
  summary: NutritionAnalyticsSummary;
  macroDistribution: { name: string; value: number; fill: string }[];
  insights: TrainingInsight[];
}

export interface NutritionTrendPoint {
  date: string;
  label: string;
  calories: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  adherence: number;
}

export interface NutritionHeatmapPoint {
  date: string;
  adherence: number;
  status: 'completed' | 'partial' | 'missed';
}

export interface NutritionAnalyticsSummary {
  avgAdherence: number;
  avgCalories: number;
  calorieDeviation: number;
  avgProtein: number;
  currentStreak: number;
  habitCompletionRate: number;
  backfillCount: number;
}

export interface GeneratedReport {
  title: string;
  date: string;
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  markdownContent: string;
}

export interface ReportConfig {
  dateRange: 'lastWeek' | 'lastMonth' | 'last3Months';
  modules: { training: boolean; nutrition: boolean; recovery: boolean; health: boolean };
}

export interface TrendDataPoint {
  date: string;
  value: number;
  type?: 'historical' | 'projected';
}

export interface HolisticScore {
  physical: number;
  nutrition: number;
  recovery: number;
  mental: number;
  social: number;
  overall: number;
}

export interface ReportLink {
  id: string;
  url: string;
  type: 'public' | 'private';
  createdAt: string;
  isActive: boolean;
  views: number;
  passcode?: string;
}

export interface PredictionResult {
  projectedWeight: number;
  projectedBodyFat: number;
  trendDescription: string;
  chartData: { date: string; weight: number }[];
}

// --- GAMIFICATION & COMMUNITY ---

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'Consistency' | 'WorkoutCount' | 'Custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'NotJoined';
  rewardXP: number;
  participantsCount: number;
  isAiGenerated: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardXP: number;
  rewardCoins: number;
  isCompleted: boolean;
  isClaimed: boolean;
  progress: number;
  target: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  isLocked: boolean;
  category: string;
  customName?: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  iconName: string;
  category: 'Theme' | 'Avatar' | 'Discount' | 'Feature';
  isPurchased: boolean;
}

export interface XPActivity {
  id: string;
  activity: string;
  xp: number;
  date: string;
  category: string;
}

export interface SocialPost {
  id: string;
  authorName: string;
  content: string;
  type: 'Achievement' | 'Workout' | 'Status';
  timestamp: string;
  likes: number;
  comments: number;
  isLikedByMe: boolean;
}

export interface League {
  rank: number;
  name: string;
  xp: number;
  tier: string;
}

// --- HEALTH & BIO ---

export interface HealthProfile {
  injuryLog: Injury[];
  vitalsHistory: HealthVitals[];
}

export interface Injury {
  id: string;
  title: string;
  area: string;
  status: 'Active' | 'Recovered';
  dateReported: string;
  notes?: string;
}

export interface HealthVitals {
  date: string;
  hrv: number;
  rhr: number;
  bloodPressure?: string;
  weight?: number;
}

export interface AdvancedHealthData {
  vo2Max: number;
  metabolicAge: number;
  recoveryIndex: number;
  geneticProfile?: GeneticTrait[];
  hormonalHistory?: HormonePanel[];
  postureScans?: PostureScan[];
}

export interface GeneticTrait {
  id: string;
  trait: string;
  result: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface HormonePanel {
  id: string;
  date: string;
  testosterone: number;
  cortisol: number;
  thyroidTSH: number;
}

export interface PostureScan {
  id: string;
  date: string;
  imageUrl: string;
  issues: string[];
}

// --- SETTINGS & ADMIN ---

export interface AthleteSettings {
  theme: AppTheme;
  language: string;
  units: 'metric' | 'imperial';
  widgets: WidgetConfig[];
  notifications: NotificationPreferences;
  access: { isProfilePublic: boolean; shareWithCoach: boolean; shareWithClubs: boolean; moduleVisibility?: Record<string, boolean> };
  
  notificationSettings?: AdvancedNotificationSettings;
  aiPreferences?: AIPreferences;
  automationRules?: AutomationRule[];
  widgetStyles?: Record<string, WidgetStyle>;
  
  dashboardLayout?: AdvancedWidget[];
  security?: SecurityProfile;
}

export interface SecurityProfile {
  twoFactorEnabled: boolean;
  activeSessions: SessionInfo[];
  auditLogs: AuditLogEntry[];
  privacyConfig: {
      shareWeight: boolean;
      sharePhotos: boolean;
      shareWorkouts: boolean;
      shareNutrition: boolean;
      shareMedical: boolean;
      shareHealthVitals: boolean;
      publicProfile: boolean;
      allowCoachEdit: boolean;
  };
  lastPasswordChange?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  module: string;
  timestamp: string;
  details: string;
  ip: string;
  status: 'Success' | 'Failed' | 'Warning';
}

export interface SessionInfo {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface WidgetConfig {
  id: string;
  visible: boolean;
  order: number;
}

export interface NotificationPreferences {
  trainingReminders: boolean;
  nutritionAlerts: boolean;
  recoveryAlerts: boolean;
  communityUpdates: boolean;
  achievementAlerts: boolean;
  marketingEmails: boolean;
}

export interface AdvancedNotificationSettings {
  channels: { push: boolean; email: boolean; sms: boolean; 'in-app': boolean };
  quietHours: { start: string; end: string; enabled: boolean };
  categories: Record<NotificationCategory, { enabled: boolean; priority: 'high' | 'medium' | 'low' }>;
  customReminders: Reminder[];
}

export type NotificationCategory = 'Health Alerts' | 'Goal Reminders' | 'Gamification Alerts' | 'AI Insights' | 'Custom';

export interface Reminder {
  id: string;
  title: string;
  time: string;
  days: number[];
  isEnabled: boolean;
  category: NotificationCategory;
  channels: string[];
}

export interface AIPreferences {
  aggressiveness: 'conservative' | 'balanced' | 'proactive';
  enabledCategories: Record<AIInsightCategory, boolean>;
  frequency: 'low' | 'medium' | 'high';
}

export type AIInsightCategory = 'Performance' | 'Recovery' | 'Nutrition' | 'Mental' | 'Injury' | 'Gamification' | 'Predictive';

export interface AutomationRule {
  id: string;
  trigger: string;
  action: string;
  isEnabled: boolean;
}

export interface WidgetStyle {
  variant: 'card' | 'glass' | 'minimal' | 'gradient';
}

export interface AdvancedWidget {
  id: string;
  type: WidgetType;
  title: string;
  metric: string;
  size: WidgetSize;
  order: number;
  iconName?: string;
  dataKey?: string;
  secondaryDataKey?: string;
  thresholds?: { low: number; medium: number; high: number };
  goalValue?: number;
  timeRange?: '7d' | '30d' | '90d';
  customColors?: { primary: string; secondary: string };
}

export type WidgetType = 'metric_card' | 'line_chart' | 'bar_chart' | 'area_chart' | 'radar_chart' | 'donut_chart' | 'heatmap' | 'forecast_chart' | 'notification_list' | 'ai_insight_list' | 'gamification_card';
export type WidgetSize = 'S' | 'M' | 'L' | 'Full';

export interface ModuleConfig {
  id: string;
  defaultName: string;
  customName?: string;
  isVisible: boolean;
  order: number;
  iconName?: string;
}

export type HealthModuleType = 'AI_Analysis' | 'Recovery' | 'Overview' | 'Composition' | 'Hydration' | 'Injuries' | 'Archive';

export interface HealthActivityLog {
  date: string;
  modulesInteracted: HealthModuleType[];
}

// --- ADMIN TYPES ---

export interface AdminUserView {
  id: string;
  fullName: string;
  email: string;
  role: string;
  subscription: string;
  subscriptionStatus: string;
  subscriptionExpiry: string;
  lastLogin: string;
  status: 'active' | 'banned';
  joinDate: string;
  adminNotes?: string;
}

export interface AdminStats {
  totalUsers: number;
  eliteUsers: number;
  monthlyRevenue: number;
  pendingReviews: number;
  activityData: any[];
  moduleUsage: any[];
}

export interface AdminAuditLog {
  id: string;
  admin: string;
  action: string;
  target: string;
  date: string;
}

export interface SystemModule {
  id: string;
  name: string;
  isEnabled: boolean;
  maintenanceMode: boolean;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  videoUrl: string;
  visibility: 'free' | 'members' | 'vip';
  views: number;
  createdAt: string;
}

export interface TransactionLog {
  id: string;
  txid: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  eventType: string;
  eventData: any;
  deviceInfo?: string;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  subject: string;
  message: string;
  isRead: boolean;
  isBroadcast: boolean;
  createdAt: string;
}

// --- PAYMENTS ---

export type PlanDuration = 1 | 3 | 6 | 12;
export type PaymentStatus = 'pending' | 'waiting' | 'needs_review' | 'succeeded' | 'failed';

export interface PendingPayment {
  id: string;
  userId: string;
  userName: string;
  plan: SubscriptionTier;
  amount: number;
  method: 'usdt_trc20' | 'manual';
  tx_id?: string;
  receipt_url?: string;
  status: PaymentStatus;
  date: string;
  durationMonths: number;
}

// --- AI SERVICE TYPES ---

export interface AIRecommendation {
  id: string;
  category: AIInsightCategory;
  title: string;
  description: string;
  relatedMetrics: string[];
  actions: AIAction[];
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  isArchived: boolean;
  timestamp: string;
}

export interface AIAction {
  label: string;
  type: string;
}

export interface ScanAnalysisResult {
  foodName: string;
  calories: number;
  macros: { protein: number; carbs: number; fats: number; fiber: number; sugar: number };
  micros: string[];
  inflammatoryIndex: 'Low' | 'Medium' | 'High';
  inflammatoryReason: string;
  goalAlignment: string;
  rating: string;
  warnings: string[];
}

export interface BodyAnalysis {
  muscleChanges: { region: string; change: string; score: number }[];
  fatChanges: { region: string; change: string; score: number }[];
  measurementsDiff: any;
  insights: { highlights: string[]; focusAreas: string[]; planAdjustments: string[] };
  generalSummary: string;
  comparisonScore: number;
}

export interface PersonalizedPlan {
  id: string;
  generatedAt: string;
  phase: string;
  focusAreas: { muscle: string; reason: string; strategy: string; suggestedExercises: string[] }[];
  nutritionStrategy: { calories: number; protein: number; carbs: number; fats: number; hydrationGoal: number; tips: string[] };
  weeklyScheduleAdjustment: string;
  coachNote: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- GLOBAL CORE ---

export interface UserPerformanceState {
  fatigueLevel: number;
  injuryRisk: 'Low' | 'Medium' | 'High';
  inflammationScore: number;
  recoveryIndex: number;
  consistencyScore: number;
  dailyCalorieTarget: number;
  dailyHydrationTarget: number;
  saskaAdaptation: 'None' | 'Deload' | 'Intensify';
}

export interface GlobalEvent {
  type: 'TRAINING_LOGGED' | 'NUTRITION_LOGGED' | 'BODY_UPDATED' | 'SLEEP_LOGGED' | 'SCAN_ANALYZED';
  payload: any;
  timestamp: number;
}

export interface WeeklyWorkoutPlan {
  id: string;
  name: string;
  sessions: TrainingSession[];
}

export interface TrainingSession {
  id: string;
  name: string;
  dayOfWeek: number;
  exercises: Exercise[];
}

export interface ArchivedProgram {
  id: string;
  title: string;
  program: SmartProgram;
  archivedAt: string;
}

export interface GuidanceState {
  photoUploaded: boolean;
  workoutCreated: boolean;
  nutritionCreated: boolean;
  firstLogCompleted: boolean;
}

export interface DashboardKPIs {
  profile: { completionPct: number; missingFields: string[] };
  dailyLog: { consistencyScore: number; streak: number; hasAlert: boolean };
  planner: { adherenceRate: number; activeProgramName: string };
  training: { weeklyVolume: number; volumeTrend: number };
  nutrition: { avgCalories: number; calorieGoal: number; adherence: number };
  supplements: { adherence: number };
  performance: { totalPBs: number; lastPB: string };
  snackScan: { avgInflammation: 'Low' | 'Medium' | 'High'; score: number };
  health: { riskLevel: 'Low' | 'Medium' | 'High'; recoveryIndex: number };
  bio: { trend: string; label: string };
}

export interface AthleteActivity {
  id: string;
  userId: string;
  date: string;
  steps: number;
  calories: number;
  workoutMinutes: number;
  distanceKm: number;
  waterMl: number;
  sleepHours: number;
  weight: number;
  bodyFat?: number;
}

export interface FullExportData {
  user: UserProfile;
  settings: AthleteSettings;
  logs: DailyLog[];
  history: AthleteHistory[];
  gamification: any;
  healthProfile?: HealthProfile;
  advancedHealth?: AdvancedHealthData;
  metadata: { exportedAt: string; version: string };
}

export interface AthleteHistory {
  id: string;
  date: string;
  weight: number;
  body_fat?: number;
  source: string;
}

export interface TimelineMonth {
  monthId: string;
  monthName: string;
  scan?: BodyScan;
  avgWeight: number;
  weightDelta: number;
  events: TimelineEvent[];
  alerts: TimelineAlert[];
  aggregates: {
      avgWorkoutScore: number;
      avgNutritionScore: number;
      avgSleep: number;
      totalWorkouts: number;
  };
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'workout' | 'nutrition' | 'ai' | 'milestone';
  message: string;
}

export interface TimelineAlert {
  id: string;
  severity: 'red' | 'yellow';
  category: string;
  message: string;
}

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionLink?: string;
}

export interface CommitmentStatus {
    id: AppView;
    title: string;
    isComplete: boolean;
    link: AppView;
    iconName: string;
}
