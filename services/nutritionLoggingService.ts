
import { NutritionDayLog, MealLog, LogIngredient, NutritionPlan, DietDay, MealIngredient } from '../types';

const NUT_LOG_STORAGE_KEY = 'fitpro_nutrition_logs';

// --- HELPERS ---

const getStorageLogs = (): NutritionDayLog[] => {
    const raw = localStorage.getItem(NUT_LOG_STORAGE_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
};

const saveStorageLogs = (logs: NutritionDayLog[]) => {
    localStorage.setItem(NUT_LOG_STORAGE_KEY, JSON.stringify(logs));
};

// --- CRUD ---

export const getNutritionLogs = async (userId: string): Promise<NutritionDayLog[]> => {
    const allLogs = getStorageLogs();
    return allLogs.filter(l => l.userId === userId);
};

export const getNutritionLogByDate = async (userId: string, date: string): Promise<NutritionDayLog | null> => {
    const allLogs = getStorageLogs();
    return allLogs.find(l => l.userId === userId && l.date === date) || null;
};

export const saveNutritionLog = async (log: NutritionDayLog): Promise<void> => {
    const allLogs = getStorageLogs();
    const index = allLogs.findIndex(l => l.id === log.id);
    let updated;
    if (index >= 0) {
        updated = allLogs.map(l => l.id === log.id ? log : l);
    } else {
        updated = [...allLogs, log];
    }
    saveStorageLogs(updated);
};

// --- CORE LOGIC: CREATE LOG FROM PLAN ---

export const createLogFromPlan = (userId: string, date: string, plan: NutritionPlan): NutritionDayLog => {
    // 1. Determine which day of the plan to use.
    // Logic: Cycle through days based on total days elapsed or Day of Week.
    // For simplicity, we match Weekday (Sat=1...Fri=7) to Day Number.
    // JavaScript getDay(): Sun=0, Mon=1, ... Sat=6. 
    // Mapping to Persian week: Sat=1, Sun=2... Fri=7.
    
    const jsDay = new Date(date).getDay();
    // Map JS Day (0-6) to Plan Day (1-7). 
    // Sat(6)->1, Sun(0)->2, Mon(1)->3... Fri(5)->7
    const dayMap: Record<number, number> = { 6: 1, 0: 2, 1: 3, 2: 4, 3: 5, 4: 6, 5: 7 };
    const planDayNum = dayMap[jsDay];

    // Find day in first active phase (MVP logic)
    const phase = plan.phases[0]; // Assuming one active phase or first phase
    const targetDay = phase.days.find(d => d.dayNumber === planDayNum) || phase.days[0];

    // 2. Snapshot logic: Deep copy structure
    const meals: MealLog[] = targetDay.meals.map(m => ({
        id: `ml_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        planMealId: m.id,
        title: m.title,
        type: m.type,
        status: 'Planned',
        plannedMacros: { ...m.totalMacros },
        actualMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        ingredients: m.ingredients.map(ing => ({
            id: `li_${Date.now()}_${Math.random()}`,
            foodId: ing.foodId,
            name: ing.name,
            unit: ing.unit,
            plannedAmount: ing.amount,
            actualAmount: 0, // Initially 0 until marked done
            macros: { ...ing.macros } // Macros per planned amount
        }))
    }));

    return {
        id: `nlog_${Date.now()}`,
        userId,
        date,
        planId: plan.id,
        status: 'Partial',
        meals,
        waterIntake: 0,
        notes: '',
        totalTargetMacros: targetDay.targetMacros,
        totalConsumedMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 }
    };
};

export const updateLogTotals = (log: NutritionDayLog): NutritionDayLog => {
    // Recalculate totals based on meals status
    let totalCals = 0, totalP = 0, totalC = 0, totalF = 0;
    let completedMeals = 0;

    log.meals.forEach(meal => {
        if (meal.status === 'Completed') {
            // If completed without specific ingredient edits, use planned macros
            // If edited (logic to come), use actualMacros
            const macros = (meal.actualMacros.calories > 0) ? meal.actualMacros : meal.plannedMacros;
            totalCals += macros.calories;
            totalP += macros.protein;
            totalC += macros.carbs;
            totalF += macros.fats;
            completedMeals++;
        }
    });

    const status = completedMeals === log.meals.length ? 'Completed' : completedMeals > 0 ? 'Partial' : 'Missed';

    return {
        ...log,
        status,
        totalConsumedMacros: {
            calories: totalCals,
            protein: totalP,
            carbs: totalC,
            fats: totalF
        }
    };
};
