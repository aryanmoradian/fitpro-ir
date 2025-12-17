
import { 
    UserProfile, SmartProgram, SchedulePreferences, SmartSession, 
    Exercise, TrainingSplit, Equipment, ProgramDiagnostics, MovementAnalysis 
} from '../types';
import { getExercisesByCriteria, EXERCISE_DB } from './exerciseDatabase';

// --- 1. SLOT DEFINITIONS ---
// Define blueprints for different days based on splits

const SPLIT_BLUEPRINTS = {
    FullBody: [
        { 
            name: 'Full Body A', 
            slots: [
                { pattern: 'Squat', type: 'Compound', count: 1 },
                { pattern: 'Push_Horizontal', type: 'Compound', count: 1 },
                { pattern: 'Pull_Horizontal', type: 'Compound', count: 1 },
                { pattern: 'Hinge', type: 'Isolation', count: 1 },
                { pattern: 'Core', type: 'Isolation', count: 1 }
            ]
        },
        { 
            name: 'Full Body B', 
            slots: [
                { pattern: 'Hinge', type: 'Compound', count: 1 },
                { pattern: 'Push_Vertical', type: 'Compound', count: 1 },
                { pattern: 'Pull_Vertical', type: 'Compound', count: 1 },
                { pattern: 'Lunge', type: 'Compound', count: 1 },
                { pattern: 'Core', type: 'Isolation', count: 1 }
            ]
        }
    ],
    UpperLower: [
        { 
            name: 'Upper Power', 
            slots: [
                { pattern: 'Push_Horizontal', type: 'Compound', count: 1 },
                { pattern: 'Pull_Vertical', type: 'Compound', count: 1 },
                { pattern: 'Push_Vertical', type: 'Isolation', count: 1 },
                { pattern: 'Pull_Horizontal', type: 'Compound', count: 1 },
                { muscle: 'Triceps', type: 'Isolation', count: 1 },
                { muscle: 'Biceps', type: 'Isolation', count: 1 }
            ]
        },
        { 
            name: 'Lower Strength', 
            slots: [
                { pattern: 'Squat', type: 'Compound', count: 1 },
                { pattern: 'Hinge', type: 'Compound', count: 1 },
                { pattern: 'Lunge', type: 'Compound', count: 1 },
                { muscle: 'Calves', type: 'Isolation', count: 1 },
                { pattern: 'Core', type: 'Isolation', count: 1 }
            ]
        }
    ],
    PPL: [
        { 
            name: 'Push', 
            slots: [
                { pattern: 'Push_Horizontal', type: 'Compound', count: 1 },
                { pattern: 'Push_Vertical', type: 'Compound', count: 1 },
                { muscle: 'Chest', type: 'Isolation', count: 1 },
                { muscle: 'Triceps', type: 'Isolation', count: 1 },
                { muscle: 'Shoulders', type: 'Isolation', count: 1 }
            ]
        },
        { 
            name: 'Pull', 
            slots: [
                { pattern: 'Pull_Vertical', type: 'Compound', count: 1 },
                { pattern: 'Pull_Horizontal', type: 'Compound', count: 1 },
                { muscle: 'Back', type: 'Isolation', count: 1 },
                { muscle: 'Biceps', type: 'Isolation', count: 1 },
                { muscle: 'Back', type: 'Isolation', count: 1 }
            ]
        },
        { 
            name: 'Legs', 
            slots: [
                { pattern: 'Squat', type: 'Compound', count: 1 },
                { pattern: 'Hinge', type: 'Compound', count: 1 },
                { pattern: 'Lunge', type: 'Compound', count: 1 },
                { muscle: 'Calves', type: 'Isolation', count: 1 },
                { pattern: 'Core', type: 'Isolation', count: 1 }
            ]
        }
    ]
};

// --- 2. GENERATOR LOGIC ---

const determineSplit = (days: number): TrainingSplit => {
    if (days <= 3) return 'FullBody';
    if (days === 4) return 'UpperLower';
    return 'PPL';
};

const mapBlueprintToSession = (
    blueprint: any, 
    equipment: Equipment[], 
    difficulty: any
): Exercise[] => {
    const exercises: Exercise[] = [];
    const usedIds = new Set<string>();

    blueprint.slots.forEach((slot: any) => {
        const candidates = getExercisesByCriteria(
            slot.pattern || null, 
            slot.muscle || null, 
            equipment, 
            difficulty, 
            slot.type
        );

        // Deduplicate
        const available = candidates.filter(c => !usedIds.has(c.id));
        
        if (available.length > 0) {
            const selected = available[0]; // Take best match
            usedIds.add(selected.id);
            
            exercises.push({
                id: selected.id, // Keep DB ID for referencing
                dbId: selected.id,
                name: selected.name_en, // Use English Name
                name_fa: selected.name_en,
                sets: selected.type === 'Compound' ? 4 : 3,
                reps: selected.type === 'Compound' ? '6-8' : '10-12',
                rest: selected.type === 'Compound' ? 120 : 60,
                muscleGroup: selected.muscle,
                equipment: selected.equipment,
                notes: selected.description
            });
        }
    });

    return exercises;
};

export const generateSmartSchedule = (
    profile: UserProfile, 
    prefs: SchedulePreferences
): SmartProgram => {
    if (!prefs.daysPerWeek || prefs.daysPerWeek < 1) throw new Error("Invalid number of training days.");
    
    const split = determineSplit(prefs.daysPerWeek);
    const sessions: SmartSession[] = [];
    const splitPlans = SPLIT_BLUEPRINTS[split];
    
    let planIndex = 0;

    for (let day = 0; day < 7; day++) {
        if (prefs.preferredDays.includes(day)) {
            // Cycle through blueprints (A, B, A, B...)
            const blueprint = splitPlans[planIndex % splitPlans.length];
            const exercises = mapBlueprintToSession(blueprint, prefs.equipmentAccess, prefs.experience);

            // Separate Main/Accessory for UI structure
            const mainLifts = exercises.filter(e => e.reps === '6-8'); // Compounds
            const accessories = exercises.filter(e => e.reps !== '6-8');

            sessions.push({
                id: `sess_${Date.now()}_${day}`,
                dayOfWeek: day,
                title: blueprint.name, // e.g. "Full Body A"
                focus: split === 'PPL' ? blueprint.name : 'Strength & Hypertrophy',
                duration: prefs.sessionDuration,
                intensity: 'High',
                warmup: [
                    { id: 'w1', name: 'Jumping Jacks', name_fa: 'Jumping Jacks', sets: 2, reps: '50', rest: 0, muscleGroup: 'Cardio' },
                    { id: 'w2', name: 'Dynamic Stretch', name_fa: 'Dynamic Stretch', sets: 1, reps: '2 min', rest: 0, muscleGroup: 'Full Body' }
                ],
                mainLifts: mainLifts,
                accessories: accessories,
                cooldown: [
                    { id: 'c1', name: 'Static Stretch', name_fa: 'Static Stretch', sets: 1, reps: '5 min', rest: 0, muscleGroup: 'Full Body' }
                ],
                tags: [],
                reasoning: `Based on ${split} split and ${prefs.experience} level.`
            });

            planIndex++;
        }
    }

    return {
        id: `prog_${Date.now()}`,
        generatedAt: new Date().toISOString(),
        preferences: prefs,
        split,
        sessions,
        adaptationLog: [],
        diagnostics: {
            validationPassed: true,
            fallbackTriggered: sessions.some(s => s.mainLifts.length === 0),
            fallbackReason: sessions.some(s => s.mainLifts.length === 0) ? "Equipment limitations" : undefined,
            motionFaultsAddresssed: [],
            splitLogic: `${split} System`,
            generatedAt: new Date().toLocaleDateString('en-US')
        }
    };
};

export const checkReadinessAdaptation = (program: SmartProgram, readiness: number): SmartProgram => {
    if (readiness < 40) {
        // Deload logic
        const updatedSessions = program.sessions.map(s => ({
            ...s,
            title: `${s.title} (Light)`,
            mainLifts: s.mainLifts.map(e => ({ ...e, sets: 2, reps: '10' })),
            accessories: s.accessories.slice(0, 1) // Reduce volume
        }));
        return { ...program, sessions: updatedSessions };
    }
    return program;
};
