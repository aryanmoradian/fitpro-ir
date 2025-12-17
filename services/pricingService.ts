
import { SubscriptionTier, PendingPayment, PaymentStatus, AdminStats } from "../types";
import { APP_CONFIG } from "../config";
import { supabase } from "../lib/supabaseClient";

export interface PricingResult {
    baseUSD: number;
    totalUSD: number;
    savingsAmount: number;
    discountPercent: number;
    monthlyEquivalentUSD: number;
}

export const calculatePrice = (tier: SubscriptionTier, months: number): PricingResult => {
    // Specific Pricing for Athlete Membership Module
    // 1 Month: $1.99 (Base)
    // 3 Months: $4.99 (Discounted from ~$6.00)
    // 12 Months: $17.99 (Discounted from ~$24.00)

    let totalUSD = 0;
    let baseUSD = 0; // The "crossed out" price
    let monthlyEquivalentUSD = 0;

    if (months === 1) {
        totalUSD = 1.99;
        baseUSD = 1.99;
        monthlyEquivalentUSD = 1.99;
    } else if (months === 3) {
        totalUSD = 4.99;
        baseUSD = 5.97; // 1.99 * 3
        monthlyEquivalentUSD = 1.66;
    } else if (months === 12) {
        totalUSD = 17.99;
        baseUSD = 23.88; // 1.99 * 12
        monthlyEquivalentUSD = 1.50;
    } else {
        // Fallback generic calculation
        baseUSD = months * 1.99;
        totalUSD = baseUSD;
        monthlyEquivalentUSD = 1.99;
    }

    const savingsAmount = parseFloat((baseUSD - totalUSD).toFixed(2));
    const discountPercent = baseUSD > 0 ? Math.round((savingsAmount / baseUSD) * 100) : 0;

    return {
        baseUSD: parseFloat(baseUSD.toFixed(2)),
        totalUSD: parseFloat(totalUSD.toFixed(2)),
        savingsAmount,
        discountPercent,
        monthlyEquivalentUSD: parseFloat(monthlyEquivalentUSD.toFixed(2)),
    };
};

export const getWalletAddress = (): string => {
    return 'TYkGprD7ADrGxLsG1BAGvY1H5XnsrQbhxG';
};

export const verifyTetherPayment = async (txid: string, expectedAmount: number): Promise<{ verified: boolean; message?: string }> => {
    // In a real app, this would call an API (TronGrid). 
    // For this flow, we rely on Manual Submission + Admin Review.
    // We return 'false' to force the user to use the manual submission form if auto-check fails/isn't implemented.
    return { verified: false, message: "تراکنش یافت نشد. لطفا رسید را دستی ارسال کنید." };
};

export const uploadReceipt = async (file: File): Promise<{ success: boolean; url?: string }> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_receipt.${fileExt}`;
        
        const { data, error } = await supabase.storage
            .from('receipts')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error("Supabase Upload Error:", error);
            // Fallback for demo: return a fake local URL
            return { success: true, url: URL.createObjectURL(file) }; 
        }

        const { data: publicUrlData } = supabase.storage
            .from('receipts')
            .getPublicUrl(fileName);

        return { success: true, url: publicUrlData.publicUrl };
    } catch (error) {
        console.error("Receipt upload exception:", error);
        return { success: true, url: URL.createObjectURL(file) };
    }
};

export const getPendingPayments = async (): Promise<PendingPayment[]> => {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .or('status.eq.pending,status.eq.needs_review,status.eq.waiting')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching payments:", error);
        return [];
    }

    return data.map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        userName: p.user_name || 'Unknown',
        plan: p.plan,
        amount: p.amount_usd,
        method: 'usdt_trc20',
        tx_id: p.tx_id,
        receipt_url: p.receipt_url,
        status: p.status,
        date: new Date(p.created_at).toLocaleDateString('fa-IR'),
        durationMonths: p.months_paid || 1
    }));
};

export const submitManualPayment = async (payment: Omit<PendingPayment, 'id' | 'status' | 'date'> & { receipt_url?: string }): Promise<{success: boolean}> => {
    // 1. Insert Payment Record
    const { error } = await supabase
        .from('payments')
        .insert({
            user_id: payment.userId,
            user_name: payment.userName,
            plan: payment.plan,
            amount_usd: payment.amount,
            method: 'USDT_TRC20',
            receipt_url: payment.receipt_url,
            tx_id: payment.tx_id,
            months_paid: payment.durationMonths,
            status: 'needs_review' // Set status to trigger "Under Review"
        });

    // 2. Update User Profile Status to 'needs_review' immediately
    if (!error) {
        await supabase
            .from('profiles')
            .update({ subscription_status: 'needs_review' })
            .eq('id', payment.userId);
    }

    if (error) {
        console.error("Error submitting payment:", error);
        return { success: false };
    }
    return { success: true };
};

// --- ADMIN ACTIONS ---

export const approvePayment = async (paymentId: string, userId: string, plan: SubscriptionTier, months: number): Promise<boolean> => {
    const now = new Date();
    
    // 1. Calculate Expiry Date
    let numericMonths = parseInt(String(months), 10);
    if (isNaN(numericMonths) || numericMonths <= 0) numericMonths = 1;
    
    const futureTime = now.getTime() + (numericMonths * 30 * 24 * 60 * 60 * 1000); // Approx 30 days per month
    const isoExpiry = new Date(futureTime).toISOString();

    // 2. Transaction: Update Payment & Profile
    try {
        // A. Update Payment Status
        const { error: payError } = await supabase
            .from('payments')
            .update({ status: 'succeeded' })
            .eq('id', paymentId);
        if (payError) throw payError;

        // B. Update User Profile (Activate Subscription)
        const { error: profError } = await supabase
            .from('profiles')
            .update({
                subscription_tier: plan,
                subscription_status: 'active',
                subscription_expiry: isoExpiry
            })
            .eq('id', userId);
        if (profError) throw profError;

        // C. Send Notification (Simulated)
        await supabase.from('messages').insert({
            sender_id: 'admin',
            receiver_id: userId,
            subject: 'اشتراک فعال شد',
            message: `پرداخت شما تایید شد. اشتراک ${plan} شما تا تاریخ ${new Date(futureTime).toLocaleDateString('fa-IR')} فعال است.`,
            is_read: false
        });

        return true;
    } catch (e) {
        console.error("Approve payment failed:", e);
        return false;
    }
};

export const rejectPayment = async (paymentId: string, userId: string, reason: string): Promise<boolean> => {
    try {
        // A. Update Payment to Failed
        const { error: payError } = await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('id', paymentId);
        if (payError) throw payError;

        // B. Revert Profile to Expired/Inactive
        const { error: profError } = await supabase
            .from('profiles')
            .update({ subscription_status: 'expired' }) 
            .eq('id', userId);
        if (profError) throw profError;

        // C. Notify User
        await supabase.from('messages').insert({
            sender_id: 'admin',
            receiver_id: userId,
            subject: 'مشکل در پرداخت',
            message: `پرداخت شما رد شد. دلیل: ${reason}. لطفا مجدد اقدام کنید.`,
            is_read: false
        });

        return true;
    } catch (e) {
        console.error("Reject payment failed:", e);
        return false;
    }
};

export const getAdminAnalytics = async (): Promise<AdminStats> => {
    // Mock analytics for dashboard
    return {
        totalUsers: 150,
        eliteUsers: 45,
        monthlyRevenue: 1200,
        pendingReviews: 3,
        activityData: [],
        moduleUsage: []
    };
};
