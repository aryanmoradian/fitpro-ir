
import { UserProfile, AppView } from '../types';
import { supabase } from '../lib/supabaseClient';

export const TRIAL_DURATION_DAYS = 30;

export type SubscriptionStage = 'TRIAL' | 'PAYMENT_PENDING' | 'UNDER_REVIEW' | 'ACTIVE' | 'EXPIRED';

export interface SubscriptionStatus {
    isValid: boolean;
    daysRemaining: number;
    stage: SubscriptionStage;
    tierLabel: string;
    isTrial: boolean;
}

export const getSubscriptionStatus = (profile: UserProfile): SubscriptionStatus => {
    // 1. Paid Active
    if (profile.subscriptionStatus === 'active' && profile.subscriptionTier !== 'free') {
        return {
            isValid: true,
            daysRemaining: calculateDaysRemaining(profile.subscriptionExpiry),
            stage: 'ACTIVE',
            tierLabel: profile.subscriptionTier === 'elite_plus' ? 'Elite Plus' : 'Elite',
            isTrial: false
        };
    }

    // 2. Under Review (Receipt Submitted)
    if (profile.subscriptionStatus === 'needs_review' || profile.subscriptionStatus === 'pending') {
        return {
            isValid: false,
            daysRemaining: 0,
            stage: 'UNDER_REVIEW',
            tierLabel: 'Pending Approval',
            isTrial: false
        };
    }

    // 3. Payment Pending (Intent created but not finished - optional state if supported by DB)
    if (profile.subscriptionStatus === 'waiting') {
        return {
            isValid: false,
            daysRemaining: 0,
            stage: 'PAYMENT_PENDING',
            tierLabel: 'Payment Incomplete',
            isTrial: false
        };
    }

    // 4. Free Trial Calculation
    const startDateRaw = profile.trainingStartDate || profile.meta?.createdAt;
    const startDate = startDateRaw ? new Date(startDateRaw) : new Date();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const daysUsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const trialDaysLeft = Math.max(0, TRIAL_DURATION_DAYS - daysUsed);

    if (trialDaysLeft > 0) {
        return {
            isValid: true,
            daysRemaining: trialDaysLeft,
            stage: 'TRIAL',
            tierLabel: 'Free Trial',
            isTrial: true
        };
    }

    // 5. Expired
    return {
        isValid: false,
        daysRemaining: 0,
        stage: 'EXPIRED',
        tierLabel: 'Free',
        isTrial: true
    };
};

const calculateDaysRemaining = (expiryDate?: string): number => {
    if (!expiryDate) return 0;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const isModuleLocked = (view: AppView, profile: UserProfile): boolean => {
    const sub = getSubscriptionStatus(profile);

    // List of modules that require subscription after trial
    const LOCKED_MODULES: AppView[] = [
        'BODY_ANALYSIS',
        'NUTRITION_CENTER',
        'TRAINING_CENTER',
        'HEALTH_HUB',
        'PERFORMANCE_CENTER',
        'SUPPLEMENT_MANAGER',
        'REPORTS_CENTER',
        'BIOLOGICAL_ANALYSIS',
        'COACH',
        'PLANNER',
        'MEAL_SCAN',
        'ANALYTICS_DASHBOARD'
    ];

    // If subscription is valid (Trial Active OR Paid Active), nothing is locked
    if (sub.isValid) return false;

    // Otherwise, check if the requested view is in the locked list
    return LOCKED_MODULES.includes(view);
};

// --- REAL-TIME POLLING HELPER ---
export const checkLatestStatus = async (userId: string): Promise<{ status: string, tier: string } | null> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('subscription_status, subscription_tier')
            .eq('id', userId)
            .single();

        if (error || !data) return null;

        return {
            status: data.subscription_status,
            tier: data.subscription_tier
        };
    } catch (e) {
        console.error("Status check failed", e);
        return null;
    }
};
