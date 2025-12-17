
import { supabase } from '../lib/supabaseClient';
import { UserProfile, AthleteHistory, AthleteSettings, DailyLog, BodyScan, TimelineMonth, TimelineEvent, TimelineAlert, FullExportData, BodyMetricLog, Goal } from '../types';

// --- PROFILE CRUD ---

export const getFullProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      name: `${data.first_name || ''} ${data.last_name || ''}`,
      
      age: data.age || 0,
      height: data.height || 0,
      currentWeight: data.current_weight || 0,
      bodyFat: data.body_fat,
      gender: data.gender,
      
      // New fields from DB need mapping if column names differ, currently reusing existing schema structure or assuming strict map
      sportLevel: data.sport_level || 'beginner',
      specialization: data.specialization,
      trainingStartDate: data.training_start_date,
      goalType: data.goal_type,
      
      privacySettings: data.privacy_settings || { isPublic: false, hideWeight: false, hideBodyFat: false, aiRecommendationVisibility: true },
      
      subscriptionTier: data.subscription_tier || 'free',
      subscriptionStatus: data.subscription_status || 'inactive',
      subscriptionExpiry: data.subscription_expiry,
      
      metricsHistory: [], 
      goals: [],
      photoGallery: [],
      habits: [],
      customExercises: [],
      customFoods: [],
      level: 1,
      xp: 0,
      coins: 0,
      theme: 'Standard',
      injuries: '',

      badges: [],
      activeChallenges: [],
      clubs: [],
      followersCount: 0,
      followingCount: 0,

      activeQuests: [],
      inventory: []
    };
  } catch (e) {
    console.error("Profile Service Exception:", e);
    return null;
  }
};

export const updateAthleteProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const dbUpdates: any = {};
  
  if (updates.firstName) dbUpdates.first_name = updates.firstName;
  if (updates.lastName) dbUpdates.last_name = updates.lastName;
  if (updates.phone) dbUpdates.phone = updates.phone;
  if (updates.age) dbUpdates.age = updates.age;
  if (updates.height) dbUpdates.height = updates.height;
  if (updates.currentWeight) dbUpdates.current_weight = updates.currentWeight;
  if (updates.bodyFat) dbUpdates.body_fat = updates.bodyFat;
  if (updates.gender) dbUpdates.gender = updates.gender;
  if (updates.sportLevel) dbUpdates.sport_level = updates.sportLevel;
  if (updates.specialization) dbUpdates.specialization = updates.specialization;
  if (updates.trainingStartDate) dbUpdates.training_start_date = updates.trainingStartDate;
  if (updates.goalType) dbUpdates.goal_type = updates.goalType;
  if (updates.privacySettings) dbUpdates.privacy_settings = updates.privacySettings;

  const { error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId);

  if (error) throw error;
};

// --- METRIC LOGGING (EXTENDED) ---

export const logBodyMetrics = async (userId: string, metrics: BodyMetricLog) => {
    // Save to local metrics array in state is handled by component
    // Here we persist to DB (using 'athlete_history' table)
    
    const { error } = await supabase.from('athlete_history').insert({
        user_id: userId,
        date: metrics.date,
        weight: metrics.weight,
        body_fat: metrics.bodyFat,
        source: 'manual'
        // measurements: metrics.measurements // Assumption: DB has this column or handles JSON
    });
    
    if (error) console.error("Error logging extended metrics:", error);
};

// --- ADVANCED CALCULATIONS (NEW) ---

export const calculateAdvancedMetrics = (profile: UserProfile): { 
    bmr: number; 
    tdee: number; 
    lbm: number; 
    bodyFat: number | null; 
    ffmi: number; 
    whr: number | null 
} => {
    const { currentWeight, height, age, gender, lifestyleActivity, waist, neck, hips } = profile;
    
    if (!currentWeight || !height || !age || !gender) {
        return { bmr: 0, tdee: 0, lbm: 0, bodyFat: null, ffmi: 0, whr: null };
    }

    // 1. BMR (Mifflin-St Jeor)
    // Men: 10W + 6.25H - 5A + 5
    // Women: 10W + 6.25H - 5A - 161
    let bmr = (10 * currentWeight) + (6.25 * height) - (5 * age);
    bmr += gender === 'male' ? 5 : -161;

    // 2. TDEE
    const activityMultipliers: Record<string, number> = {
        'Sedentary': 1.2,
        'Lightly Active': 1.375,
        'Active': 1.55,
        'Very Active': 1.725
    };
    const tdee = Math.round(bmr * (activityMultipliers[lifestyleActivity || 'Active'] || 1.2));

    // 3. Body Fat (US Navy Method)
    let bodyFat = profile.bodyFat || null;
    
    if (waist && neck && height) {
        if (gender === 'male') {
            bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
        } else if (hips) {
            bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.22100 * Math.log10(height)) - 450;
        }
    }
    
    // Clamp BF
    if (bodyFat) bodyFat = Math.max(2, Math.min(60, Number(bodyFat.toFixed(1))));

    // 4. Lean Body Mass
    const lbm = bodyFat ? currentWeight * (1 - bodyFat / 100) : 0;

    // 5. FFMI
    // FFMI = LBM / (height_m)^2
    // Adjusted FFMI = FFMI + 6.1 * (1.8 - height_m)
    const heightM = height / 100;
    let ffmi = 0;
    if (lbm > 0) {
        ffmi = lbm / (heightM * heightM);
        // Normalized FFMI
        ffmi += 6.1 * (1.8 - heightM);
    }

    // 6. WHR
    const whr = (waist && hips) ? Number((waist / hips).toFixed(2)) : null;

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        lbm: Number(lbm.toFixed(1)),
        bodyFat,
        ffmi: Number(ffmi.toFixed(1)),
        whr
    };
};

// --- ANALYSIS ENGINES ---

export const calculatePQS = (profile: UserProfile, logs: DailyLog[]): number => {
    let score = 0;

    // 1. Identity (30%)
    if (profile.age && profile.age > 0) score += 5;
    if (profile.height && profile.height > 0) score += 5;
    if (profile.currentWeight && profile.currentWeight > 0) score += 5;
    if (profile.gender) score += 5;
    if (profile.sportLevel) score += 5;
    if (profile.avatar) score += 5;

    // 2. Metrics (30%)
    const hasLogLast30Days = (profile.metricsHistory || []).some(m => {
        const d = new Date(m.date);
        const now = new Date();
        return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) < 30;
    });
    if (hasLogLast30Days) score += 15;
    
    // Check for circumference data in last 3 months
    const hasDetailedMetrics = (profile.metricsHistory || []).some(m => m.measurements && Object.keys(m.measurements).length > 0);
    if (hasDetailedMetrics) score += 15;

    // 3. Goals (20%)
    const activeGoals = (profile.goals || []).filter(g => g.status === 'Active');
    if (activeGoals.some(g => g.type === 'Primary')) score += 10;
    if (activeGoals.some(g => g.type === 'Secondary')) score += 10;

    // 4. Media (20%)
    if ((profile.bodyScans || []).length > 0) score += 20;

    return Math.min(100, score);
};

export const cascadeGoalUpdates = (profile: UserProfile): Partial<UserProfile> => {
    // 1. Find Primary Goal
    const primaryGoal = (profile.goals || []).find(g => g.type === 'Primary' && g.status === 'Active');
    if (!primaryGoal) return {};

    const changes: any = {};

    // 2. Calculate Nutrition Targets using Advanced Engine
    const { tdee } = calculateAdvancedMetrics(profile);
    
    // Fallback if TDEE is 0
    const maintenanceCals = tdee > 0 ? tdee : (profile.currentWeight * 24 * 1.4);
    
    let targetCals = maintenanceCals;
    let protein = profile.currentWeight * 2; // Default 2g/kg

    // Adjust based on goal settings
    // If we stored "Rate" or "Deficit" in profile, we'd use it here. 
    // For now, infer from goal title/type or use standard blocks.
    
    if (primaryGoal.title.toLowerCase().includes('fat loss') || primaryGoal.title.includes('کاهش')) {
        targetCals = maintenanceCals - 500;
        protein = profile.currentWeight * 2.2; // Higher protein for retention
    } else if (primaryGoal.title.toLowerCase().includes('muscle') || primaryGoal.title.includes('عضله')) {
        targetCals = maintenanceCals + 300;
        protein = profile.currentWeight * 2.0;
    }

    // 3. Update Profile
    if (profile.nutritionProfile) {
        changes.nutritionProfile = {
            ...profile.nutritionProfile,
            targets: {
                calories: Math.round(targetCals),
                protein: Math.round(protein),
                carbs: Math.round((targetCals - (protein * 4) - (profile.currentWeight * 0.9 * 9)) / 4), // Remainder to carbs
                fats: Math.round(profile.currentWeight * 0.9)
            }
        };
    }

    return changes;
};

// --- HISTORY LOGGING (Legacy Wrapper) ---

export const logWeightHistory = async (userId: string, weight: number, bodyFat?: number, source: 'manual' | 'smart_scale' | 'body_scan' = 'manual') => {
  const { error } = await supabase
    .from('athlete_history')
    .insert({
      user_id: userId,
      weight,
      body_fat: bodyFat,
      source,
      date: new Date().toISOString().split('T')[0]
    });

  if (error) console.error("Error logging history:", error);
};

export const getAthleteHistory = async (userId: string): Promise<AthleteHistory[]> => {
  const { data, error } = await supabase
    .from('athlete_history')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) return [];

  return data.map((item: any) => ({
    id: item.id,
    date: item.date,
    weight: item.weight,
    body_fat: item.body_fat,
    source: item.source
  }));
};

// --- TIMELINE GENERATOR ---

export const generateTimelineData = (logs: DailyLog[], scans: BodyScan[]): TimelineMonth[] => {
  const groupedData: Record<string, { logs: DailyLog[], scan?: BodyScan }> = {};

  logs.forEach(log => {
    let dateObj;
    if (log.date.includes('/')) {
        const parts = log.date.split('/');
        if (parts.length === 3) {
            const key = `${parts[0]}-${parts[1]}`; 
            if (!groupedData[key]) groupedData[key] = { logs: [] };
            groupedData[key].logs.push(log);
        }
    } else {
        const key = log.date.substring(0, 7);
        if (!groupedData[key]) groupedData[key] = { logs: [] };
        groupedData[key].logs.push(log);
    }
  });

  scans.forEach(scan => {
    const key = scan.monthId; 
    if (!groupedData[key]) groupedData[key] = { logs: [] };
    if (!groupedData[key].scan || new Date(scan.date) > new Date(groupedData[key].scan!.date)) {
        groupedData[key].scan = scan;
    }
  });

  const monthKeys = Object.keys(groupedData).sort().reverse(); 
  
  const timeline: TimelineMonth[] = [];

  monthKeys.forEach((key, index) => {
    const data = groupedData[key];
    const prevKey = monthKeys[index + 1]; 
    const prevData = prevKey ? groupedData[prevKey] : null;

    const totalLogs = data.logs.length;
    const avgSleep = totalLogs > 0 ? data.logs.reduce((sum, l) => sum + (l.sleepHours || 0), 0) / totalLogs : 0;
    const avgWorkoutScore = totalLogs > 0 ? data.logs.reduce((sum, l) => sum + l.workoutScore, 0) / totalLogs : 0;
    const avgNutritionScore = totalLogs > 0 ? data.logs.reduce((sum, l) => sum + l.nutritionScore, 0) / totalLogs : 0;
    const avgWeight = totalLogs > 0 
        ? data.logs.reduce((sum, l) => sum + (l.bodyWeight || 0), 0) / (data.logs.filter(l => l.bodyWeight).length || 1) 
        : (data.scan?.weight || 0);

    let weightDelta = 0;
    if (prevData) {
        const prevAvgWeight = prevData.logs.length > 0
            ? prevData.logs.reduce((sum, l) => sum + (l.bodyWeight || 0), 0) / (prevData.logs.filter(l => l.bodyWeight).length || 1)
            : (prevData.scan?.weight || 0);
        
        if (avgWeight > 0 && prevAvgWeight > 0) {
            weightDelta = parseFloat((avgWeight - prevAvgWeight).toFixed(1));
        }
    }

    const events: TimelineEvent[] = [];
    if (avgWorkoutScore > 80) events.push({ id: `evt-${key}-1`, date: key, type: 'workout', message: 'High training consistency (Avg > 80%)' });
    
    if (data.scan && data.scan.ai_analysis) {
        // Fix: Use heatmap to detect growth instead of non-existent muscleChanges
        const chestGrowth = data.scan.ai_analysis.heatmap?.find(h => h.region === 'Chest' && h.status === 'growth');
        if (chestGrowth && chestGrowth.intensity >= 5) {
            events.push({ id: `evt-${key}-4`, date: data.scan.date, type: 'ai', message: 'Noticeable chest hypertrophy detected' });
        }
    }

    const alerts: TimelineAlert[] = [];
    if (avgSleep > 0 && avgSleep < 6) {
        alerts.push({ id: `alt-${key}-1`, severity: 'red', category: 'Recovery', message: 'Low sleep avg (< 6h) -> Recovery Risk' });
    }

    timeline.push({
        monthId: key,
        monthName: key,
        scan: data.scan,
        avgWeight: parseFloat(avgWeight.toFixed(1)),
        weightDelta,
        events,
        alerts,
        aggregates: {
            avgWorkoutScore,
            avgNutritionScore,
            avgSleep,
            totalWorkouts: data.logs.filter(l => l.workoutScore > 0).length
        }
    });
  });

  return timeline;
};

export const exportFullUserData = async (profile: UserProfile, logs: DailyLog[]): Promise<FullExportData> => {
    const history = await getAthleteHistory(profile.id);
    return {
        user: profile,
        settings: profile.settings!,
        logs: logs,
        history: history,
        gamification: {
            xp: profile.xp,
            level: profile.level,
            badges: profile.badges,
            challenges: profile.activeChallenges,
            quests: profile.activeQuests
        },
        healthProfile: profile.healthProfile,
        advancedHealth: profile.advancedHealth,
        metadata: {
            exportedAt: new Date().toISOString(),
            version: '1.0'
        }
    };
};
