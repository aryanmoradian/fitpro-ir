
import { supabase } from '../lib/supabaseClient';
import { UserActivity, Video, AdminUserView, PendingPayment, SubscriptionTier } from '../types';

// --- ACTIVITY LOGGING ---
export const logUserActivity = async (userId: string, eventType: string, eventData: any = {}) => {
  try {
    await supabase.from('user_activity').insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      device_info: navigator.userAgent
    });
  } catch (e) {
    console.error("Activity Log Failed", e);
  }
};

export const getUserActivities = async (): Promise<UserActivity[]> => {
  const { data, error } = await supabase
    .from('user_activity')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);
  
  if (error) return [];
  
  return data.map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    eventType: item.event_type,
    eventData: item.event_data,
    timestamp: new Date(item.timestamp).toLocaleString('fa-IR')
  }));
};

// --- VIDEO MANAGEMENT ---
export const getVideos = async (isAdmin: boolean = false): Promise<Video[]> => {
  let query = supabase.from('videos').select('*').order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) return [];
  
  return data.map((v: any) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    category: v.category,
    thumbnailUrl: v.thumbnail_url,
    videoUrl: v.video_url,
    visibility: v.visibility,
    views: v.views,
    createdAt: v.created_at
  }));
};

export const createVideo = async (video: Partial<Video>) => {
  return await supabase.from('videos').insert({
    title: video.title,
    description: video.description,
    category: video.category,
    thumbnail_url: video.thumbnailUrl,
    video_url: video.videoUrl,
    visibility: video.visibility
  });
};

export const deleteVideo = async (id: string) => {
  return await supabase.from('videos').delete().eq('id', id);
};

// --- USER MANAGEMENT ---
export const getAllUsers = async (): Promise<AdminUserView[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error || !data) return [];

    return data.map((u: any) => ({
        id: u.id,
        fullName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email?.split('@')[0],
        email: u.email,
        role: u.role,
        subscription: u.subscription_tier,
        subscriptionStatus: u.subscription_status,
        subscriptionExpiry: u.subscription_expiry,
        lastLogin: u.last_sign_in_at || '',
        status: u.is_banned ? 'banned' : 'active',
        joinDate: new Date(u.created_at).toISOString().split('T')[0],
        adminNotes: u.admin_notes
    }));
};

export const updateUserStatus = async (userId: string, updates: Partial<AdminUserView>) => {
  const dbUpdates: any = {};
  if (updates.status) dbUpdates.is_banned = updates.status === 'banned';
  if (updates.adminNotes !== undefined) dbUpdates.admin_notes = updates.adminNotes;
  if (updates.subscription) dbUpdates.subscription_tier = updates.subscription;
  if (updates.fullName) {
      const parts = updates.fullName.split(' ');
      dbUpdates.first_name = parts[0];
      dbUpdates.last_name = parts.slice(1).join(' ');
  }

  const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
  return { success: !error };
};

export const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    return { success: !error };
};

export const createUser = async (user: any) => {
    return { success: true }; // Stub
};

// --- PAYMENT & SUBSCRIPTION MANAGEMENT ---

export const getPendingPayments = async (): Promise<PendingPayment[]> => {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false }); // Fetch all to filter in UI

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
        method: p.method,
        tx_id: p.tx_id,
        receipt_url: p.receipt_url,
        status: p.status, // 'pending', 'succeeded', 'failed', 'needs_review'
        date: new Date(p.created_at).toLocaleDateString('fa-IR'),
        durationMonths: p.months_paid || 1
    }));
};

export const approvePayment = async (paymentId: string, userId: string, plan: SubscriptionTier, months: number): Promise<boolean> => {
    const now = new Date();
    
    // 1. Calculate Expiry Date
    let numericMonths = parseInt(String(months), 10);
    if (isNaN(numericMonths) || numericMonths <= 0) numericMonths = 1;
    
    const futureTime = now.getTime() + (numericMonths * 30 * 24 * 60 * 60 * 1000); 
    const isoExpiry = new Date(futureTime).toISOString();

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

        // C. Send Notification
        await supabase.from('messages').insert({
            sender_id: 'admin',
            receiver_id: userId,
            subject: 'اشتراک فعال شد ✅',
            message: `پرداخت شما تایید شد. اشتراک ${plan} شما به مدت ${months} ماه فعال گردید.`,
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

        // B. Update Profile Status to 'expired' or 'free' so they can resubmit
        const { error: profError } = await supabase
            .from('profiles')
            .update({ subscription_status: 'expired' }) 
            .eq('id', userId);
        if (profError) throw profError;

        // C. Notify User
        await supabase.from('messages').insert({
            sender_id: 'admin',
            receiver_id: userId,
            subject: 'مشکل در پرداخت ❌',
            message: `پرداخت شما رد شد. دلیل: ${reason}. لطفا مجدد تلاش کنید یا با پشتیبانی تماس بگیرید.`,
            is_read: false
        });

        return true;
    } catch (e) {
        console.error("Reject payment failed:", e);
        return false;
    }
};

export const getTransactionLogs = async () => {
    const data = await getPendingPayments();
    return data.map(p => ({
        id: p.id,
        txid: p.tx_id || 'Manual',
        amount: p.amount,
        currency: 'USDT',
        status: p.status === 'succeeded' ? 'confirmed' : p.status === 'failed' ? 'rejected' : 'pending',
        createdAt: p.date
    }));
};
