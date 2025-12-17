
import { TrainingLog, LogStatus, DesignerProgram, ProgramDay, LogExercise, LogSet } from '../types';

const LOG_STORAGE_KEY = 'fitpro_training_logs';

// --- HELPERS ---

const getStorageLogs = (): TrainingLog[] => {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
};

const saveStorageLogs = (logs: TrainingLog[]) => {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
};

// --- API ---

export const getTrainingLogs = async (userId: string): Promise<TrainingLog[]> => {
    const allLogs = getStorageLogs();
    return allLogs.filter(l => l.userId === userId);
};

export const getLogByDate = async (userId: string, date: string): Promise<TrainingLog | null> => {
    const allLogs = getStorageLogs();
    return allLogs.find(l => l.userId === userId && l.date === date) || null;
};

export const saveTrainingLog = async (log: TrainingLog): Promise<void> => {
    const allLogs = getStorageLogs();
    const index = allLogs.findIndex(l => l.id === log.id);
    let updated;
    if (index >= 0) {
        updated = allLogs.map(l => l.id === log.id ? log : l);
    } else {
        updated = [...allLogs, log];
    }
    saveStorageLogs(updated);
};

export const deleteTrainingLog = async (id: string): Promise<void> => {
    const allLogs = getStorageLogs();
    saveStorageLogs(allLogs.filter(l => l.id !== id));
};

// --- LOGIC: MERGE PROGRAM WITH LOG ---

export const createLogFromProgram = (
    userId: string, 
    date: string, 
    program: DesignerProgram, 
    dayId?: string
): TrainingLog => {
    // Find the day in the program. Logic:
    // If dayId provided, find exact day.
    // If not, maybe iterate sequentially based on previous logs? 
    // For MVP, we simply find the FIRST unlogged day or just the specific dayId passed.
    
    let targetDay: ProgramDay | undefined;
    let weekId = '';

    if (dayId) {
        for (const week of program.weeks) {
            const found = week.days.find(d => d.id === dayId);
            if (found) {
                targetDay = found;
                weekId = week.id;
                break;
            }
        }
    } else {
        // Default to first day of first week if nothing specified
        targetDay = program.weeks[0]?.days[0];
        weekId = program.weeks[0]?.id;
    }

    if (!targetDay) throw new Error("Day not found in program");

    const exercises: LogExercise[] = targetDay.exercises.map(ex => ({
        id: `log_ex_${Date.now()}_${Math.random()}`,
        exerciseDefId: ex.exerciseDefId,
        name: ex.name,
        notes: ex.notes,
        completed: false,
        sets: ex.sets.map((s, idx) => ({
            id: `log_set_${Date.now()}_${Math.random()}`,
            setNumber: idx + 1,
            targetReps: s.reps,
            targetWeight: s.weight || 0,
            completed: false
        }))
    }));

    return {
        id: `log_${Date.now()}`,
        userId,
        date,
        programId: program.id,
        weekId,
        dayId: targetDay.id,
        workoutTitle: targetDay.title,
        status: targetDay.isRestDay ? 'Rest' : 'Planned',
        exercises,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};
