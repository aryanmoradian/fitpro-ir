
import { Supplement, UserProfile, SupplementType, SupplementTiming, SupplementLog, SupplementFeedback } from '../types';

// --- DATABASE ---
export const SUPPLEMENT_DB: Supplement[] = [
    { id: 'sup_1', name: 'Whey Protein', type: 'Protein', dosage: '1 Scoop (30g)', timing: ['Post-Workout', 'Morning'], priority: 'Essential', isActive: false },
    { id: 'sup_2', name: 'Creatine Monohydrate', type: 'Creatine', dosage: '5g', timing: ['Post-Workout'], priority: 'Essential', isActive: false },
    { id: 'sup_3', name: 'Pre-Workout', type: 'Pre-Workout', dosage: '1 Scoop', timing: ['Pre-Workout'], priority: 'Optional', isActive: false },
    { id: 'sup_4', name: 'Multivitamin', type: 'Vitamin', dosage: '1 Tablet', timing: ['Morning', 'With Meal'], priority: 'Essential', isActive: false },
    { id: 'sup_5', name: 'Fish Oil (Omega-3)', type: 'Health', dosage: '2g', timing: ['With Meal'], priority: 'Essential', isActive: false },
    { id: 'sup_6', name: 'BCAA / EAA', type: 'Amino', dosage: '10g', timing: ['Intra-Workout'], priority: 'Optional', isActive: false },
    { id: 'sup_7', name: 'Casein Protein', type: 'Protein', dosage: '1 Scoop', timing: ['Before Bed'], priority: 'Optional', isActive: false },
    { id: 'sup_8', name: 'Caffeine', type: 'Pre-Workout', dosage: '200mg', timing: ['Pre-Workout'], priority: 'Optional', isActive: false },
    { id: 'sup_9', name: 'L-Glutamine', type: 'Amino', dosage: '5g', timing: ['Post-Workout'], priority: 'Advanced', isActive: false },
    { id: 'sup_10', name: 'ZMA', type: 'Vitamin', dosage: '3 Capsules', timing: ['Before Bed'], priority: 'Optional', isActive: false },
    { id: 'sup_11', name: 'Beta-Alanine', type: 'Pre-Workout', dosage: '3g', timing: ['Pre-Workout'], priority: 'Advanced', isActive: false },
    { id: 'sup_12', name: 'Fat Burner', type: 'FatBurner', dosage: '1 Capsule', timing: ['Morning', 'Pre-Workout'], priority: 'Optional', isActive: false },
];

// --- RECOMMENDATION ENGINE ---
export const generateSupplementRecommendations = (profile: UserProfile): Supplement[] => {
    const recommendations: Supplement[] = [];
    
    // Core Stack (Everyone)
    recommendations.push(getDbItem('sup_4')); // Multivitamin
    recommendations.push(getDbItem('sup_5')); // Fish Oil

    // Goal: Muscle Gain
    if (profile.goalType === 'muscleGain' || profile.goalType === 'recomposition') {
        recommendations.push(getDbItem('sup_1')); // Whey
        recommendations.push(getDbItem('sup_2')); // Creatine
        if (profile.sportLevel === 'professional' || profile.sportLevel === 'intermediate') {
            recommendations.push(getDbItem('sup_7')); // Casein
        }
    }

    // Goal: Fat Loss
    if (profile.goalType === 'fatLoss') {
        recommendations.push(getDbItem('sup_1')); // Whey (Protein is key for retention)
        recommendations.push(getDbItem('sup_12')); // Fat Burner (Optional)
        recommendations.push(getDbItem('sup_8')); // Caffeine
    }

    // Goal: Performance
    if (profile.goalType === 'performance') {
        recommendations.push(getDbItem('sup_2')); // Creatine
        recommendations.push(getDbItem('sup_11')); // Beta-Alanine
        recommendations.push(getDbItem('sup_3')); // Pre-Workout
    }

    // Advanced Level Extras
    if (profile.sportLevel === 'professional') {
        recommendations.push(getDbItem('sup_6')); // EAA/BCAA
        recommendations.push(getDbItem('sup_9')); // Glutamine
        recommendations.push(getDbItem('sup_10')); // ZMA
    }

    // Filter duplicates and return
    return Array.from(new Set(recommendations.map(r => r.id)))
        .map(id => recommendations.find(r => r.id === id)!);
};

// Helper
const getDbItem = (id: string): Supplement => {
    const item = SUPPLEMENT_DB.find(s => s.id === id);
    if (!item) throw new Error(`Supplement ${id} not found`);
    return { ...item, id: `rec_${Date.now()}_${id}`, stockRemaining: 30 }; // Default stock
};

// --- ANALYTICS HELPERS ---
export const calculateStackAdherence = (stack: Supplement[]): number => {
    // This is a static "Setup Adherence" (do you have essentials active?)
    const essentials = stack.filter(s => s.priority === 'Essential');
    if (essentials.length === 0) return 100;
    const activeEssentials = essentials.filter(s => s.isActive);
    return Math.round((activeEssentials.length / essentials.length) * 100);
};

export const getGoalAlignment = (stack: Supplement[], goal: string): number => {
    let score = 50; // Base
    
    const hasCreatine = stack.some(s => s.type === 'Creatine');
    const hasProtein = stack.some(s => s.type === 'Protein');
    const hasFatBurner = stack.some(s => s.type === 'FatBurner');

    if (goal === 'muscleGain') {
        if (hasCreatine) score += 25;
        if (hasProtein) score += 25;
    } else if (goal === 'fatLoss') {
        if (hasProtein) score += 30; // High protein is crucial
        if (hasFatBurner) score += 10;
    } else {
        score += 20; // General health
    }

    return Math.min(100, score);
};

// --- CONSUMPTION LOGGING ---

export const getDailySupplementStatus = (profile: UserProfile, date: string): { supplement: Supplement, log?: SupplementLog }[] => {
    const activeStack = profile.supplements?.filter(s => s.isActive) || [];
    const logs = profile.supplementLogs || [];
    
    return activeStack.map(supp => {
        // Find if a log exists for this specific supplement on this date
        const log = logs.find(l => l.supplementId === supp.id && l.date === date);
        return { supplement: supp, log };
    });
};

export const toggleSupplementLog = (profile: UserProfile, supplement: Supplement, date: string): UserProfile => {
    const logs = profile.supplementLogs || [];
    const existingLogIndex = logs.findIndex(l => l.supplementId === supplement.id && l.date === date);
    
    let newLogs = [...logs];
    let updatedSupplements = [...(profile.supplements || [])];
    const suppIndex = updatedSupplements.findIndex(s => s.id === supplement.id);

    if (existingLogIndex >= 0) {
        // Toggle consumption
        const currentLog = newLogs[existingLogIndex];
        const wasConsumed = currentLog.consumed;
        
        newLogs[existingLogIndex] = {
            ...currentLog,
            consumed: !wasConsumed
        };

        // Revert or Apply Inventory Change
        if (suppIndex >= 0) {
            const currentStock = updatedSupplements[suppIndex].stockRemaining ?? 30;
            updatedSupplements[suppIndex] = {
                ...updatedSupplements[suppIndex],
                stockRemaining: wasConsumed ? currentStock + 1 : Math.max(0, currentStock - 1)
            };
        }

    } else {
        // Create new log (Consumed)
        newLogs.push({
            id: `log_sup_${Date.now()}_${Math.random()}`,
            supplementId: supplement.id,
            supplementName: supplement.name,
            date: date,
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            consumed: true,
            notes: ''
        });

        // Decrement Inventory
        if (suppIndex >= 0) {
            const currentStock = updatedSupplements[suppIndex].stockRemaining ?? 30;
            updatedSupplements[suppIndex] = {
                ...updatedSupplements[suppIndex],
                stockRemaining: Math.max(0, currentStock - 1)
            };
        }
    }

    return { ...profile, supplementLogs: newLogs, supplements: updatedSupplements };
};

export const saveDailyFeedback = (
    profile: UserProfile,
    date: string,
    mood: SupplementFeedback['mood'],
    notes?: string
): UserProfile => {
    const feedbacks = profile.supplementFeedbacks || [];
    const existingIndex = feedbacks.findIndex(f => f.date === date);
    let newFeedbacks = [...feedbacks];

    const feedback: SupplementFeedback = { date, mood, notes };

    if (existingIndex >= 0) {
        newFeedbacks[existingIndex] = feedback;
    } else {
        newFeedbacks.push(feedback);
    }

    return { ...profile, supplementFeedbacks: newFeedbacks };
};

export const getConsumptionAdherenceStats = (profile: UserProfile, range: '7d' | '30d' | 'heatmap'): { 
    totalAdherence: number;
    timeline: { date: string; adherence: number; status?: 'high' | 'medium' | 'low' | 'none' }[];
} => {
    const activeStackCount = profile.supplements?.filter(s => s.isActive).length || 0;
    if (activeStackCount === 0) return { totalAdherence: 0, timeline: [] };

    const logs = profile.supplementLogs || [];
    const now = new Date();
    
    // For heatmap we default to 60 days to fill a nice grid
    const days = range === 'heatmap' ? 60 : range === '7d' ? 7 : 30;
    const timeline = [];
    let totalCompleted = 0;
    let totalPossible = 0;

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toLocaleDateString('fa-IR'); // Match Log Format (Simple Date String)
        
        // Count logs for this date where consumed = true
        const dailyLogs = logs.filter(l => l.date === dateStr && l.consumed);
        const count = dailyLogs.length;
        
        // Adherence % for this day
        const dailyAdherence = Math.min(100, Math.round((count / activeStackCount) * 100));
        
        let status: 'high' | 'medium' | 'low' | 'none' = 'none';
        if (dailyAdherence >= 80) status = 'high';
        else if (dailyAdherence >= 40) status = 'medium';
        else if (dailyAdherence > 0) status = 'low';

        timeline.push({ date: dateStr, adherence: dailyAdherence, status });
        
        // Only count towards total stats if data exists or range is short
        if (range !== 'heatmap') {
            totalCompleted += count;
            totalPossible += activeStackCount;
        }
    }

    // Simple Total calculation for the requested range
    const totalAdherence = totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);

    return { totalAdherence, timeline };
};

export const calculateSupplementStreak = (profile: UserProfile): number => {
    const logs = profile.supplementLogs || [];
    const activeStackCount = profile.supplements?.filter(s => s.isActive).length || 0;
    if (activeStackCount === 0) return 0;

    let streak = 0;
    const today = new Date();
    
    // Iterate backwards from today
    for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString('fa-IR');
        
        const dailyLogs = logs.filter(l => l.date === dateStr && l.consumed);
        const count = dailyLogs.length;
        const adherence = count / activeStackCount;
        
        if (adherence >= 0.5) { // Streak counts if at least 50% of stack is consumed
            streak++;
        } else if (i === 0) {
            // If today is not done yet, ignore and continue to yesterday
            continue; 
        } else {
            break; // Streak broken
        }
    }
    return streak;
};
