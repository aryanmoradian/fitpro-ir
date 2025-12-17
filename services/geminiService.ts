
import { GoogleGenAI } from "@google/genai";
import { 
  MovementAnalysis, UserProfile, DailyLog, BodyScan, DietAnalysis, 
  NutritionProfile, WeeklyNutritionPlan, PerformanceRecord, Challenge, 
  Quest, GeneratedReport, ReportConfig, TrendDataPoint, HealthProfile, 
  AdvancedHealthData, Exercise, NutritionItem, ScanAnalysisResult, PhysiqueAnalysis, BodyAnalysis, PersonalizedPlan 
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ... (Previous functions: analyzePhysique, analyzeDetailedBodyProgress, etc.)

export const generatePersonalizedPlan = async (profile: UserProfile): Promise<PersonalizedPlan | null> => {
    try {
        const latestScan = profile.bodyScans && profile.bodyScans.length > 0 ? profile.bodyScans[0] : null;
        const analysis = latestScan?.ai_analysis;
        
        // Construct context from profile data
        const context = {
            goal: profile.goalType,
            weight: profile.currentWeight,
            fat: profile.bodyFat,
            level: profile.sportLevel,
            weakPoints: analysis?.heatmap.filter(h => h.status === 'lagging').map(h => h.region) || [],
            strengths: analysis?.heatmap.filter(h => h.status === 'growth').map(h => h.region) || [],
            records: profile.performanceProfile?.records.slice(-5) // Last 5 records
        };

        const prompt = `
            Act as an elite bodybuilding coach. Generate a personalized recommendation plan for this athlete.
            
            **Athlete Profile:**
            - Goal: ${context.goal}
            - Level: ${context.level}
            - Weight: ${context.weight}kg, Body Fat: ${context.fat || 'Unknown'}%
            - Identified Lagging Muscles (from Scan): ${context.weakPoints.join(', ') || 'None specifically'}
            - Recent PRs: ${JSON.stringify(context.records || [])}

            **Requirements:**
            1. **Focus Areas:** Suggest 2-3 specific muscle groups to prioritize based on lagging areas or goal. Give a specific strategy (e.g. "Frequency 2x/week") and 2 exercises.
            2. **Nutrition:** Calculate specific Macro targets (Protein, Carbs, Fats) and Calories based on the goal (Bulk/Cut). Provide 3 actionable tips.
            3. **Weekly Adjustment:** Suggest one specific change to their current weekly schedule to optimize results.
            4. **Coach Note:** A motivational message highlighting progress.

            **Output JSON Schema:**
            {
                "id": "plan_${Date.now()}",
                "generatedAt": "${new Date().toISOString()}",
                "phase": "Bulking" | "Cutting" | "Maintenance",
                "focusAreas": [
                    { "muscle": "Upper Chest", "reason": "Scan showed lack of fullness", "strategy": "Prioritize incline movements", "suggestedExercises": ["Incline DB Press", "Reverse Grip Bench"] }
                ],
                "nutritionStrategy": {
                    "calories": 2800,
                    "protein": 200,
                    "carbs": 350,
                    "fats": 70,
                    "hydrationGoal": 3500,
                    "tips": ["Consume carbs pre-workout", "Creatine post-workout"]
                },
                "weeklyScheduleAdjustment": "Move Leg day to Monday for freshness.",
                "coachNote": "You are making great progress on arms. Let's bring up the chest to match."
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(response.text || '{}');
    } catch (e) {
        console.error("Personalized Plan Generation Failed", e);
        return null;
    }
};

// ... (Rest of existing functions: analyzePhysique, analyzeDetailedBodyProgress, etc.)

export const analyzePhysique = async (photos: string[], profile: UserProfile): Promise<PhysiqueAnalysis | null> => {
    try {
        const parts: any[] = [];
        photos.forEach(p => {
             if(p && p.startsWith('data:image')) {
                 parts.push({ inlineData: { mimeType: 'image/jpeg', data: p.split(',')[1] } });
             }
        });

        if (parts.length === 0) return null;

        const prompt = `
            Act as a world-class bodybuilding judge and biomechanics expert.
            Analyze these physique photos of a ${profile.gender || 'male'} athlete (Goal: ${profile.goalType || 'physique'}).
            
            **Tasks:**
            1. **Estimate Body Composition:** Body Fat %, Lean Mass Index.
            2. **Muscle Scoring:** Rate development of key groups (Chest, Back, Shoulders, Arms, Abs, Legs) from 0-100 based on mass, definition, and separation.
            3. **Symmetry & Proportions:** Calculate Shoulder-to-Waist ratio and Upper/Lower balance (0-100).
            4. **Heatmap Generation:** Identify specific regions for the visual heatmap. For each region (Chest, Abs, Quads, Back, Delts, Arms), determine status: 'growth' (good development), 'fat_loss' (needs cut), 'stagnation' (no change/average), or 'lagging' (needs focus). Assign an intensity 1-10.
            5. **Actionable Insights:** 3 Strengths, 3 Weaknesses, and 3 Specific Training/Nutrition Recommendations (Persian).

            **Output JSON Schema:**
            {
                "bodyFat": number,
                "leanMass": number,
                "symmetryScore": number,
                "proportions": { "shoulderToWaist": number, "upperLowerBalance": number },
                "muscleScores": { "chest": number, "back": number, "shoulders": number, "arms": number, "abs": number, "legs": number },
                "heatmap": [ { "region": "Chest", "status": "growth", "intensity": 8 }, ... ],
                "insights": { "strengths": [], "weaknesses": [], "recommendations": [] }
            }
        `;
        
        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(response.text || '{}');
    } catch (e) {
        console.error("Physique analysis failed", e);
        return null;
    }
};

export const analyzeDetailedBodyProgress = async (oldScan: BodyScan, newScan: BodyScan, profile: UserProfile): Promise<BodyAnalysis | null> => {
    try {
        const parts: any[] = [];
        // Add images from old scan (Front view primarily for comparison)
        if(oldScan.photos.front) parts.push({ inlineData: { mimeType: 'image/jpeg', data: oldScan.photos.front.split(',')[1] } });
        // Add images from new scan
        if(newScan.photos.front) parts.push({ inlineData: { mimeType: 'image/jpeg', data: newScan.photos.front.split(',')[1] } });

        if(parts.length < 2) return null; // Need 2 photos for comparison

        const prompt = `
            Act as an expert physique coach. Compare these two scans (First is Old: ${oldScan.date}, Second is New: ${newScan.date}).
            Weight Difference: ${(newScan.weight - oldScan.weight).toFixed(1)}kg.
            Goal: ${profile.goalType || 'General Fitness'}.

            **Analysis Requirements:**
            1. **Muscle Changes:** Identify visual growth or atrophy in Chest, Back, Arms, Legs, Shoulders, Abs. Score change from -10 (Atrophy) to +10 (Significant Growth).
            2. **Fat Changes:** Identify visual fat loss or gain in Midsection, Face, Legs. Score change from -10 (Significant Loss - Good) to +10 (Significant Gain - Bad/Good depending on context).
            3. **Insights:** Provide specific feedback in Persian.

            **Output JSON Schema:**
            {
                "muscleChanges": [ { "region": "Chest", "change": "Significant Growth", "score": 8 }, ... ],
                "fatChanges": [ { "region": "Abs", "change": "Decreased", "score": -5 }, ... ],
                "measurementsDiff": { "waist": 0, "shoulders": 0 },
                "insights": { 
                    "highlights": ["Improved chest fullness", "Deeper abs separation"], 
                    "focusAreas": ["Legs need more volume"], 
                    "planAdjustments": ["Add drop sets for legs"] 
                },
                "generalSummary": "A concise Persian summary of the progress.",
                "comparisonScore": number (0-100, representing overall positive progress)
            }
        `;

        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(response.text || '{}');
    } catch (e) {
        console.error("Progress analysis failed", e);
        return null;
    }
};

// ... (Rest of existing functions: predictBodyTrend, analyzeStrengthsAndWeaknesses, etc.)
export const analyzeMovement = async (imageBase64: string, exerciseName: string): Promise<MovementAnalysis | null> => {
  try {
    const prompt = `
      Act as a PhD-level Biomechanist and Elite Strength Coach. 
      Analyze this image/frame of an athlete performing "${exerciseName}".
      Provide coach feedback in Persian.
      
      **Analysis Protocol:**
      1. **Kinematic Analysis:** Estimate joint angles (Hip, Knee, Ankle, Spine relative to vertical).
      2. **Scoring:** Rate the movement on 4 pillars (0-100):
         - **Technique:** Form adherence (neutral spine, gaze).
         - **Stability:** Balance, knee alignment (valgus/varus), foot planting.
         - **Mobility:** Depth achieved, joint range of motion.
         - **Efficiency:** Bar path verticality (estimate), mechanics.
      3. **Stress Mapping:** Identify areas under high biomechanical shear or compressive load (e.g., Lumbar, Knees).
      4. **Prescription:** Provide 3 specific corrective drills based on the *exact* faults seen.

      **Output Schema (Strict JSON):**
      {
        "techniqueScore": number,
        "stabilityScore": number,
        "mobilityScore": number,
        "efficiencyScore": number,
        "overallScore": number,
        "jointAngles": { "hip": number, "knee": number, "ankle": number, "shoulder": number, "spine": number },
        "stressMapAreas": ["Lumbar", "Knees", "Neck"],
        "faultsDetected": ["Rounded lower back", "Knee valgus", "Heels lifting"],
        "coachFeedback": "Concise expert summary in Persian.",
        "correctivePlan": [
           { "id": "drill_1", "name": "Drill Name", "category": "Mobility", "sets": 2, "reps": "15s", "reason": "Why this fixes the fault" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('fa-IR'),
        exerciseName,
        imageUrl: imageBase64,
        score: result.overallScore, // Legacy mapping
        issues: result.faultsDetected, // Legacy mapping
        corrections: result.correctivePlan?.map((c: any) => c.name) || [], // Legacy mapping
        ...result
    };
  } catch (error) {
    console.error("Movement analysis error:", error);
    return null;
  }
};

export const generateWorkoutJSON = async (goal: string, level: string): Promise<Exercise[]> => {
    try {
        const prompt = `Generate a workout session for a ${level} athlete with goal: "${goal}". Return a JSON array of exercises. Each object: name, sets (number), reps (string), rest (number in seconds), muscleGroup. Use Persian for name if possible or English common names.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '[]');
    } catch (e) { return []; }
};

export const generateNutritionJSON = async (goal: string, level: string): Promise<NutritionItem[]> => {
    try {
        const prompt = `Generate a daily meal plan for a ${level} athlete with goal: "${goal}". Return a JSON array of meals (NutritionItem). Each: title (Persian), details (Persian), macros {calories, protein, carbs, fats}.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const data = JSON.parse(response.text || '[]');
        return data.map((d: any) => ({ ...d, id: Date.now() + Math.random().toString(), completed: false }));
    } catch (e) { return []; }
};

export const chatWithCoach = async (message: string, history: any[]): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [...history, { role: 'user', parts: [{ text: message }] }],
            config: { systemInstruction: "You are an expert fitness coach. Answer concisely in fluent, natural Persian." }
        });
        return response.text || "No response";
    } catch (e) { return "خطا در ارتباط با مربی."; }
};

export const analyzeFoodImage = async (base64Data: string, context?: { goal?: string; restrictions?: string[]; time?: string }): Promise<ScanAnalysisResult | null> => {
    try {
        const restrictionsText = context?.restrictions?.length ? context.restrictions.join(', ') : 'None';
        const prompt = `
            Analyze the food in this image. Act as an expert sports nutritionist.
            Context:
            - User Goal: ${context?.goal || 'General Health'}
            - Current Time: ${context?.time || 'Unknown'}
            - Restrictions: ${restrictionsText}

            Return a VALID JSON object with this EXACT structure (all string values in Persian):
            {
              "foodName": "Name of food in Persian",
              "calories": number (approx),
              "macros": { "protein": number, "carbs": number, "fats": number, "fiber": number, "sugar": number },
              "micros": ["List of 3-5 key vitamins/minerals present"],
              "inflammatoryIndex": "Low" | "Medium" | "High",
              "inflammatoryReason": "Brief reason for inflammation score in Persian",
              "goalAlignment": "Brief advice on timing and goal fit in Persian (e.g., 'Great for post-workout')",
              "rating": "A+" | "A" | "B" | "C" | "D" | "F",
              "warnings": ["List of allergens or restriction violations found (e.g., 'Contains Gluten', 'High Sugar'). Empty if safe."]
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Using faster model for interaction
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                    { text: prompt }
                ]
            },
            config: { responseMimeType: "application/json" }
        });
        
        return JSON.parse(response.text || 'null');
    } catch (e) { 
        console.error("Food analysis failed", e);
        return null; 
    }
};

export const predictBodyTrend = async (scans: BodyScan[], logs: DailyLog[], profile: UserProfile): Promise<any> => {
    try {
        const prompt = "Predict body composition trends for the next 30 days based on provided history. Return JSON matching PredictionResult. Text fields in Persian.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const analyzeStrengthsAndWeaknesses = async (logs: DailyLog[], metrics: any[]): Promise<string> => {
    try {
        const prompt = "Analyze these training logs and metrics. Identify strengths and weaknesses in bullet points. In Persian.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "";
    } catch (e) { return ""; }
};

export const analyzeHealthStatus = async (profile: UserProfile, logs: DailyLog[], health: HealthProfile): Promise<any> => {
    try {
        const prompt = "Analyze health status based on vitals and logs. Return JSON with healthIndex (0-100), riskScore (0-100), recommendations (string[] in Persian).";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const generateAdvancedHealthAnalysis = async (profile: UserProfile, context: any): Promise<AdvancedHealthData | null> => {
    try {
        const prompt = "Generate advanced health metrics (VO2max estimate, recovery index, etc) based on user profile. Return JSON matching AdvancedHealthData.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const generateSmartDietPlan = async (profile: UserProfile, nutritionProfile: NutritionProfile): Promise<WeeklyNutritionPlan | null> => {
    try {
        const prompt = "Generate a weekly nutrition plan JSON matching WeeklyNutritionPlan interface. Use Persian for titles.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const analyzeNutritionQuality = async (log: DailyLog, profile: UserProfile): Promise<DietAnalysis | null> => {
    try {
        const prompt = "Analyze daily nutrition log. Return JSON matching DietAnalysis (qualityScore, deficiencies, excesses, suggestions, aiFeedback in Persian).";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const analyzePerformanceTrends = async (records: PerformanceRecord[], profile: UserProfile): Promise<string> => {
    try {
        const prompt = "Analyze performance records trends. Provide a text summary in Persian.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "";
    } catch (e) { return ""; }
};

export const analyzeRecoveryState = async (logs: DailyLog[]): Promise<string> => {
    try {
        const prompt = "Analyze recent recovery state (sleep, stress, energy). Provide a short advice in Persian.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "";
    } catch (e) { return ""; }
};

export const suggestMindfulness = async (mood: string, stress: number): Promise<string> => {
    try {
        const prompt = `Suggest a mindfulness exercise for a person feeling ${mood} with stress level ${stress}/100. Short text in Persian.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "";
    } catch (e) { return ""; }
};

export const generatePersonalizedChallenge = async (logs: DailyLog[], profile: UserProfile): Promise<Challenge | null> => {
    try {
        const prompt = "Generate a personalized fitness challenge JSON matching Challenge interface. Titles in Persian.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const generateGamifiedQuests = async (logs: DailyLog[], profile: UserProfile): Promise<Quest[]> => {
    try {
        const prompt = "Generate 3 daily quests JSON matching Quest interface. Titles in Persian.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '[]');
    } catch (e) { return []; }
};

export const generateComprehensiveReport = async (data: any, config: ReportConfig): Promise<GeneratedReport | null> => {
    try {
        const prompt = "Generate a comprehensive health report JSON matching GeneratedReport interface based on provided data. Content in Persian.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return null; }
};

export const predictFutureTrends = async (history: any[]): Promise<TrendDataPoint[]> => {
    try {
        const prompt = "Predict future trends JSON array (date, value, type='projected').";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '[]');
    } catch (e) { return []; }
};
