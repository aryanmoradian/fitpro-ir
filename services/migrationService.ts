
import { 
    UserProfile, 
    DailyLog, 
    NutritionPlan, 
    NutritionDayLog, 
    DietPhase, 
    DietDay, 
    DietMeal, 
    MealIngredient, 
    MealLog, 
    LogIngredient 
} from '../types';

/**
 * Migrates legacy nutrition data (simple arrays) to the new hierarchical structure.
 * 
 * Legacy Input:
 * - nutritionPlan: NutritionItem[] (in UserProfile)
 * - weeklyNutritionPlan: WeeklyNutritionPlan (in App state -> passed to profile)
 * - logs: DailyLog[] with detailedNutrition: NutritionItem[]
 * 
 * New Output:
 * - savedNutritionPlans: NutritionPlan[]
 * - nutritionLogs: NutritionDayLog[]
 */
export const migrateNutritionData = (
    profile: UserProfile, 
    logs: DailyLog[]
): { profile: UserProfile; logs: DailyLog[]; migrated: boolean } => {
    
    // Check if already migrated
    if (profile.meta?.nutritionMigrated) {
        return { profile, logs, migrated: false };
    }

    console.log("🔄 Starting Nutrition Data Migration...");

    const newSavedPlans: NutritionPlan[] = [];
    const newNutritionLogs: NutritionDayLog[] = [];

    // 1. MIGRATE ACTIVE PLAN (Legacy NutritionItem[])
    // We convert this into a "Legacy Imported Plan"
    // Since legacy plan was just a list of items without "Days", we assume it's a daily template.
    // However, the legacy app had "PlanManager" which might have set `nutritionPlan` in state.
    // If `profile.nutritionProfile?.activePlanId` exists, we might skip, but let's assume raw items need saving.
    
    // NOTE: In the legacy code provided, `nutritionPlan` was state in App.tsx, not always in Profile.
    // We will assume if `weeklyNutritionPlan` exists in the context passed (simulated), we use it.
    // For now, let's look at `weeklyNutritionPlan` type if available in profile (it wasn't in original profile type, but let's check).
    
    // If there is no specific "weekly" plan stored in profile, we create a placeholder plan.
    const legacyPlanId = `legacy_plan_${Date.now()}`;
    const legacyPhaseId = `phase_${Date.now()}`;
    
    const mapGoal = (g?: string): 'Fat Loss' | 'Muscle Gain' | 'Maintenance' | 'Performance' => {
        switch(g) {
            case 'fatLoss': return 'Fat Loss';
            case 'muscleGain': return 'Muscle Gain';
            case 'performance': return 'Performance';
            case 'recomposition': return 'Fat Loss';
            default: return 'Maintenance';
        }
    };

    // Create a basic plan structure
    const legacyPlan: NutritionPlan = {
        id: legacyPlanId,
        userId: profile.id,
        title: "Legacy Imported Plan",
        goal: mapGoal(profile.goalType),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        phases: [{
            id: legacyPhaseId,
            title: "Imported Phase",
            durationWeeks: 4,
            days: [] // Will populate if we find weekly data or just use a generic day
        }]
    };

    // If we have daily logs, we can infer some structure, but primarily we want to migrate the Logs themselves.
    
    // 2. MIGRATE LOGS
    // Convert `DailyLog.detailedNutrition` -> `NutritionDayLog`
    logs.forEach(log => {
        if (log.detailedNutrition && log.detailedNutrition.length > 0) {
            // Map legacy items to new MealLog structure
            // Legacy Item: { id, title, details, macros, completed }
            // We group them into a generic "Logged Meals" meal since we don't know breakfast/lunch etc.
            
            const ingredients: LogIngredient[] = log.detailedNutrition.map((item: any) => ({
                id: `mig_ing_${item.id}`,
                foodId: 'legacy_food', // Generic ID
                name: item.title,
                plannedAmount: 1,
                actualAmount: 1,
                unit: 'serving',
                macros: item.macros
            }));

            const mealLog: MealLog = {
                id: `mig_meal_${log.date}`,
                title: "Legacy Logged Items",
                type: 'Snack', // Defaulting to generic
                status: 'Completed',
                plannedMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 }, // Legacy didn't store planned separate from item
                actualMacros: ingredients.reduce((acc, curr) => ({
                    calories: acc.calories + curr.macros.calories,
                    protein: acc.protein + curr.macros.protein,
                    carbs: acc.carbs + curr.macros.carbs,
                    fats: acc.fats + curr.macros.fats,
                }), { calories: 0, protein: 0, carbs: 0, fats: 0 }),
                ingredients: ingredients
            };

            const dayLog: NutritionDayLog = {
                id: `mig_log_${log.date}`,
                userId: profile.id,
                date: log.date, // Assumes YYYY/MM/DD or similar
                status: log.nutritionScore > 80 ? 'Completed' : 'Partial',
                meals: [mealLog],
                waterIntake: log.waterIntake || 0,
                notes: log.notes || '',
                totalConsumedMacros: mealLog.actualMacros,
                totalTargetMacros: { calories: 2000, protein: 150, carbs: 200, fats: 60 } // Default targets if unknown
            };

            newNutritionLogs.push(dayLog);
        }
    });

    // 3. FINALIZE PROFILE UPDATES
    const updatedProfile: UserProfile = {
        ...profile,
        savedNutritionPlans: [...(profile.savedNutritionPlans || []), legacyPlan],
        nutritionLogs: [...(profile.nutritionLogs || []), ...newNutritionLogs],
        activeNutritionPlanId: legacyPlanId,
        meta: {
            ...profile.meta,
            nutritionMigrated: true
        }
    };

    console.log(`✅ Migration Complete. ${newNutritionLogs.length} logs migrated.`);

    return { 
        profile: updatedProfile, 
        logs, // Legacy logs array remains untouched as per requirement to preserve old data
        migrated: true 
    };
};
