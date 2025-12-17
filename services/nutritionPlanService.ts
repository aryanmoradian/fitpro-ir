
import { NutritionPlan, DietPhase, DietDay, DietMeal, MealIngredient, UserProfile } from '../types';

const STORAGE_KEY = 'fitpro_nutrition_plans';

// Mock Storage Access
const getPlans = (): NutritionPlan[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
};

const savePlans = (plans: NutritionPlan[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
};

// --- CRUD ---

export const getUserNutritionPlans = (userId: string): NutritionPlan[] => {
    return getPlans().filter(p => p.userId === userId);
};

export const saveNutritionPlan = (plan: NutritionPlan) => {
    const allPlans = getPlans();
    const index = allPlans.findIndex(p => p.id === plan.id);
    let updated;
    if (index >= 0) {
        updated = allPlans.map(p => p.id === plan.id ? plan : p);
    } else {
        updated = [...allPlans, plan];
    }
    savePlans(updated);
};

export const deleteNutritionPlan = (id: string) => {
    const plans = getPlans().filter(p => p.id !== id);
    savePlans(plans);
};

// --- HELPERS ---

export const createEmptyPlan = (userId: string): NutritionPlan => {
    return {
        id: `np_${Date.now()}`,
        userId,
        title: 'New Nutrition Plan',
        goal: 'Maintenance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
        phases: [
            {
                id: `phase_${Date.now()}`,
                title: 'Phase 1',
                durationWeeks: 4,
                days: [ createEmptyDay(1) ]
            }
        ]
    };
};

export const createEmptyDay = (dayNumber: number): DietDay => ({
    id: `day_${Date.now()}_${Math.random()}`,
    dayNumber,
    title: `Day ${dayNumber}`,
    meals: [],
    targetMacros: { calories: 2500, protein: 180, carbs: 250, fats: 80 }
});

export const calculateMealMacros = (meal: DietMeal): DietMeal => {
    const totals = meal.ingredients.reduce((acc, ing) => ({
        calories: acc.calories + ing.macros.calories,
        protein: acc.protein + ing.macros.protein,
        carbs: acc.carbs + ing.macros.carbs,
        fats: acc.fats + ing.macros.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    
    return { ...meal, totalMacros: totals };
};

export const calculateDayMacros = (day: DietDay) => {
    return day.meals.reduce((acc, meal) => ({
        calories: acc.calories + meal.totalMacros.calories,
        protein: acc.protein + meal.totalMacros.protein,
        carbs: acc.carbs + meal.totalMacros.carbs,
        fats: acc.fats + meal.totalMacros.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
};
