
import { 
    UserProfile, DailyLog, GlobalEvent, UserPerformanceState, 
    TrainingLog, NutritionDayLog, BodyMetricLog 
} from '../types';
import { calculateHydrationGoal } from './healthService';

// Initial State
const DEFAULT_PERFORMANCE_STATE: UserPerformanceState = {
    fatigueLevel: 20,
    injuryRisk: 'Low',
    inflammationScore: 10,
    recoveryIndex: 85,
    consistencyScore: 0,
    dailyCalorieTarget: 2500,
    dailyHydrationTarget: 3000,
    saskaAdaptation: 'None'
};

// Singleton State (In-Memory for Session)
let currentState: UserPerformanceState = { ...DEFAULT_PERFORMANCE_STATE };
let listeners: ((state: UserPerformanceState) => void)[] = [];

// --- CORE LOGIC MATRIX ---

const handleTrainingLog = (log: TrainingLog): Partial<UserPerformanceState> => {
    // Logic: High Volume -> High Fatigue
    let fatigue = currentState.fatigueLevel;
    let risk: 'Low' | 'Medium' | 'High' = currentState.injuryRisk;

    if (log.status === 'Completed') {
        const volume = log.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
        fatigue += volume * 1.5; // Arbitrary unit
        if (fatigue > 100) fatigue = 100;
        
        if (fatigue > 80) risk = 'High';
        else if (fatigue > 50) risk = 'Medium';
    } else if (log.status === 'Rest') {
        fatigue = Math.max(0, fatigue - 30); // Recovery
        risk = 'Low';
    }

    return { fatigueLevel: Math.round(fatigue), injuryRisk: risk };
};

const handleNutritionLog = (log: NutritionDayLog): Partial<UserPerformanceState> => {
    // Logic: Poor diet -> Inflammation
    let inflammation = currentState.inflammationScore;
    
    // Simplistic check: if carbs/sugar high or fat high (mock logic)
    const sugar = log.meals.some(m => m.ingredients.some(i => i.name.includes('Sugar')));
    if (sugar) inflammation += 5;
    
    // Good diet reduces inflammation
    if (log.status === 'Completed') inflammation = Math.max(0, inflammation - 5);

    return { inflammationScore: Math.round(inflammation) };
};

const handleBioUpdate = (profile: UserProfile): Partial<UserPerformanceState> => {
    // Logic: Low Recovery -> Saska Deload
    const recovery = profile.advancedHealth?.recoveryIndex || 50;
    let adaptation: 'None' | 'Deload' | 'Intensify' = 'None';

    if (recovery < 40) adaptation = 'Deload';
    else if (recovery > 85) adaptation = 'Intensify';

    return { recoveryIndex: recovery, saskaAdaptation: adaptation };
};

const handleProfileUpdate = (profile: UserProfile): Partial<UserPerformanceState> => {
    // Logic: Weight Change -> New Targets
    const weight = profile.currentWeight || 70;
    const hydration = calculateHydrationGoal(weight, 'Active');
    
    // Simple calorie calc (Harris-Benedict approx)
    const calories = Math.round(weight * 24 * 1.5); 

    return { dailyHydrationTarget: hydration, dailyCalorieTarget: calories };
};

// --- EVENT BUS ---

export const processGlobalEvent = (event: GlobalEvent, profile: UserProfile): UserPerformanceState => {
    console.log(`[GlobalDataCore] Processing: ${event.type}`, event.payload);
    let updates: Partial<UserPerformanceState> = {};

    switch (event.type) {
        case 'TRAINING_LOGGED':
            updates = handleTrainingLog(event.payload as TrainingLog);
            break;
        case 'NUTRITION_LOGGED':
            updates = handleNutritionLog(event.payload as NutritionDayLog);
            break;
        case 'BODY_UPDATED':
            updates = handleProfileUpdate(profile);
            break;
        case 'SLEEP_LOGGED': // Handled via Bio Update usually, but direct trigger possible
        case 'SCAN_ANALYZED':
            updates = handleBioUpdate(profile);
            break;
    }

    // Update State
    currentState = { ...currentState, ...updates };
    
    // Notify Listeners
    listeners.forEach(cb => cb(currentState));

    return currentState;
};

export const subscribeToGlobalState = (callback: (state: UserPerformanceState) => void) => {
    listeners.push(callback);
    callback(currentState); // Initial emit
    return () => {
        listeners = listeners.filter(cb => cb !== callback);
    };
};

export const getGlobalState = () => currentState;
