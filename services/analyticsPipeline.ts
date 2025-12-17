
import { 
    UserProfile, DailyLog, OPSScore, AnalyticsState, Recommendation, Alert,
    HealthAnalyticsNode, TrainingAnalyticsNode, NutritionAnalyticsNode, 
    PerformanceAnalyticsNode, SupplementAnalyticsNode, BioAnalyticsNode 
} from '../types';
import { getAdvancedAnalytics } from './analyticsAggregator';

// --- CONFIGURATION ---
// Weights for Overall Performance Score (OPS)
const OPS_WEIGHTS = {
    HEALTH: 0.20,
    WORKOUT: 0.25,
    NUTRITION: 0.20,
    PERFORMANCE: 0.20,
    SUPPLEMENTS: 0.05,
    BIO: 0.10
};

// --- HELPER FUNCTIONS ---
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

// 1. SCORING NORMALIZATION
// Converts raw metrics into 0-1 scores
const normalizeHealth = (node: HealthAnalyticsNode): number => {
    // Health score is already 0-100 in aggregator, simpler mapping
    return clamp(node.healthScore / 100, 0, 1);
};

const normalizeWorkout = (node: TrainingAnalyticsNode): number => {
    // Efficiency is 0-100, Frequency target is 4/week
    const freqScore = clamp(node.workoutFrequencyWeekly / 4, 0, 1);
    const effScore = clamp(node.efficiencyRating / 100, 0, 1);
    return (freqScore * 0.6) + (effScore * 0.4);
};

const normalizeNutrition = (node: NutritionAnalyticsNode): number => {
    // Adherence is main driver
    const adhScore = clamp(node.macroAdherence / 100, 0, 1);
    // Quality is secondary
    const qualScore = clamp(node.qualityIndex / 100, 0, 1);
    return (adhScore * 0.7) + (qualScore * 0.3);
};

const normalizePerformance = (node: PerformanceAnalyticsNode): number => {
    // Progression + PRs
    const progScore = clamp((node.strengthProgression + 5) / 10, 0, 1); // Normalize -5 to +5 range to 0-1 roughly
    const prScore = clamp(node.prCountMonthly / 2, 0, 1); // 2 PRs a month is great
    return (progScore * 0.7) + (prScore * 0.3);
};

const normalizeSupplements = (node: SupplementAnalyticsNode): number => {
    return clamp(node.adherenceScore / 100, 0, 1);
};

const normalizeBio = (node: BioAnalyticsNode): number => {
    // Adaptation level: High=1, Medium=0.6, Low=0.3
    const adaptationMap = { 'High': 1, 'Medium': 0.6, 'Low': 0.3 };
    return adaptationMap[node.adaptationLevel] || 0.5;
};

// 2. OPS CALCULATION ENGINE
export const computeOPS = (
    health: HealthAnalyticsNode,
    training: TrainingAnalyticsNode,
    nutrition: NutritionAnalyticsNode,
    performance: PerformanceAnalyticsNode,
    supplements: SupplementAnalyticsNode,
    bio: BioAnalyticsNode
): OPSScore => {
    
    // Normalize Sub-scores (0-1)
    const rawScores = {
        health: normalizeHealth(health),
        workout: normalizeWorkout(training),
        nutrition: normalizeNutrition(nutrition),
        performance: normalizePerformance(performance),
        supplements: normalizeSupplements(supplements),
        bio: normalizeBio(bio)
    };

    // Weighted Sum
    const opsRaw = 
        (rawScores.health * OPS_WEIGHTS.HEALTH) +
        (rawScores.workout * OPS_WEIGHTS.WORKOUT) +
        (rawScores.nutrition * OPS_WEIGHTS.NUTRITION) +
        (rawScores.performance * OPS_WEIGHTS.PERFORMANCE) +
        (rawScores.supplements * OPS_WEIGHTS.SUPPLEMENTS) +
        (rawScores.bio * OPS_WEIGHTS.BIO);

    // Final Score (0-100)
    const total = Math.round(clamp(opsRaw, 0, 1) * 100);

    // Mock Trend/Delta (In real app, compare with previous week's stored OPS)
    const delta = parseFloat((Math.random() * 4 - 2).toFixed(1)); // Random -2% to +2%
    let trend: OPSScore['trend'] = 'Stable';
    if (delta > 1) trend = 'Improving';
    if (delta < -1) trend = 'Declining';

    return {
        total,
        trend,
        delta,
        breakdown: {
            health: Math.round(rawScores.health * 100),
            workout: Math.round(rawScores.workout * 100),
            nutrition: Math.round(rawScores.nutrition * 100),
            performance: Math.round(rawScores.performance * 100),
            supplements: Math.round(rawScores.supplements * 100),
            bio: Math.round(rawScores.bio * 100)
        },
        rawScores,
        lastUpdated: new Date().toISOString()
    };
};

// 3. RECOMMENDATION ENGINE (Deterministic Rules)
const generateRecommendations = (
    ops: OPSScore,
    profile: UserProfile,
    data: ReturnType<typeof getAdvancedAnalytics>
): Recommendation[] => {
    const recs: Recommendation[] = [];
    const timestamp = new Date().toISOString();

    // Rule 1: Recovery Alert (OPS Drop or Sleep Debt)
    if (ops.breakdown.health < 60 || data.health.avgSleep < 6) {
        recs.push({
            id: `rec_sleep_${Date.now()}`,
            priority: 1,
            title: 'Sleep Debt Critical',
            explanation: 'Your average sleep is below 6 hours, significantly impacting your Health Score.',
            actions: [
                { label: 'Sleep Hygiene Plan', type: 'navigate', params: { view: 'HEALTH_HUB' } },
                { label: 'Shift Workouts to PM', type: 'advice' }
            ],
            expectedTimeframe: '1-2 Weeks',
            confidenceScore: 0.95,
            relatedMetrics: ['sleepHours', 'recoveryIndex'],
            createdAt: timestamp
        });
    }

    // Rule 2: Protein Deficit
    // Assuming target protein from profile or standard 2g/kg
    const targetP = (profile.currentWeight || 70) * 2;
    // We don't have exact daily protein avg in AggregatedData easily accessible without raw logs drill-down, 
    // but we can infer from macroAdherence if we assume strict tracking. 
    // For this mock, we use a randomized trigger or specific flag if available.
    // Let's assume low nutrition score + high workout volume = needs protein.
    if (ops.breakdown.nutrition < 70 && ops.breakdown.workout > 80) {
        recs.push({
            id: `rec_protein_${Date.now()}`,
            priority: 1,
            title: 'Protein Intake Gap',
            explanation: 'Training volume is high but nutrition score is lagging. Recovery may be compromised.',
            actions: [
                { label: 'Add Whey Shake', type: 'supplement_add', params: { id: 'sup_1' } },
                { label: 'Review Meal Plan', type: 'navigate', params: { view: 'NUTRITION_CENTER' } }
            ],
            expectedTimeframe: 'Immediate',
            confidenceScore: 0.88,
            relatedMetrics: ['protein', 'muscleMass'],
            createdAt: timestamp
        });
    }

    // Rule 3: Plateau Breaker (Stable OPS + High Consistency)
    if (ops.trend === 'Stable' && ops.total > 80 && data.training.intensityTrend === 'Moderate') {
        recs.push({
            id: `rec_plateau_${Date.now()}`,
            priority: 2,
            title: 'Break The Plateau',
            explanation: 'Consistency is perfect, but progress has stalled. It\'s time to increase intensity.',
            actions: [
                { label: 'Apply Progressive Overload', type: 'advice' },
                { label: 'Switch Training Split', type: 'navigate', params: { view: 'PLANNER' } }
            ],
            expectedTimeframe: '4 Weeks',
            confidenceScore: 0.80,
            relatedMetrics: ['1RM', 'volume'],
            createdAt: timestamp
        });
    }

    // Rule 4: Deload Suggestion (Declining Performance despite High Effort)
    if (ops.trend === 'Declining' && data.training.totalVolumeMonthly > 20000 && data.health.vitalTrend === 'Declining') {
        recs.push({
            id: `rec_deload_${Date.now()}`,
            priority: 1,
            title: 'Scheduled Deload',
            explanation: 'Performance is dropping while fatigue metrics are rising. Central Nervous System (CNS) needs a break.',
            actions: [
                { label: 'Reduce Volume 50%', type: 'advice' },
                { label: 'Focus on Mobility', type: 'navigate', params: { view: 'TRAINING_CENTER' } }
            ],
            expectedTimeframe: '1 Week',
            confidenceScore: 0.92,
            relatedMetrics: ['hrv', 'strength'],
            createdAt: timestamp
        });
    }

    // Fallback: General Advice
    if (recs.length === 0) {
        recs.push({
            id: `rec_general_${Date.now()}`,
            priority: 3,
            title: 'Maintain Momentum',
            explanation: 'Your stats are balanced. Keep consistent with your current routine.',
            actions: [
                { label: 'Log Daily', type: 'navigate', params: { view: 'TRACKER' } }
            ],
            expectedTimeframe: 'Ongoing',
            confidenceScore: 1.0,
            relatedMetrics: ['consistency'],
            createdAt: timestamp
        });
    }

    return recs;
};

// 4. ALERT GENERATOR
const generateAlerts = (ops: OPSScore, data: ReturnType<typeof getAdvancedAnalytics>): Alert[] => {
    const alerts: Alert[] = [];
    const timestamp = new Date().toISOString();

    // Critical: OPS Drop
    if (ops.delta < -10) {
        alerts.push({
            id: `alt_drop_${Date.now()}`,
            level: 'Critical',
            reason: `Performance Score dropped by ${Math.abs(ops.delta)}%`,
            metricsInvolved: ['ops'],
            timestamp,
            suggestedAction: 'Check Health Module',
            isAcknowledged: false
        });
    }

    // Warning: Sleep
    if (data.health.avgSleep < 5.5) {
        alerts.push({
            id: `alt_sleep_${Date.now()}`,
            level: 'Warning',
            reason: 'Chronic Sleep Deprivation (< 5.5h)',
            metricsInvolved: ['sleep'],
            timestamp,
            suggestedAction: 'Prioritize Sleep Tonight',
            isAcknowledged: false
        });
    }

    // Info: PR
    if (data.performance.prCountMonthly > 0) {
        alerts.push({
            id: `alt_pr_${Date.now()}`,
            level: 'Info',
            reason: `${data.performance.prCountMonthly} New PRs this month!`,
            metricsInvolved: ['strength'],
            timestamp,
            isAcknowledged: false
        });
    }

    return alerts;
};

// --- MAIN PIPELINE EXECUTION ---
export const runAnalyticsPipeline = (profile: UserProfile, logs: DailyLog[]): AnalyticsState => {
    // 1. Aggregation (Reusing existing service)
    const aggregatedData = getAdvancedAnalytics(profile, logs);

    // 2. OPS Scoring
    const ops = computeOPS(
        aggregatedData.health,
        aggregatedData.training,
        aggregatedData.nutrition,
        aggregatedData.performance,
        aggregatedData.supplements,
        aggregatedData.bio
    );

    // 3. Recommendations
    const recommendations = generateRecommendations(ops, profile, aggregatedData);

    // 4. Alerts
    const alerts = generateAlerts(ops, aggregatedData);

    // 5. Mock Weekly Trend Data (Since we don't have historical OPS storage in this demo)
    const weeklyTrend = Array.from({ length: 7 }).map((_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
        ops: Math.max(0, Math.min(100, ops.total + Math.floor(Math.random() * 10 - 5)))
    }));

    return {
        ops,
        recommendations,
        alerts,
        weeklyTrend
    };
};
