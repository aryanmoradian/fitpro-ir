
import { DesignerProgram, UserProfile } from '../types';

const STORAGE_KEY = 'fitpro_saved_programs';

// Mock backend service using LocalStorage for the prototype
export const getSavedPrograms = async (): Promise<DesignerProgram[]> => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse programs", e);
        return [];
    }
};

export const saveProgram = async (program: DesignerProgram): Promise<void> => {
    const existing = await getSavedPrograms();
    const index = existing.findIndex(p => p.id === program.id);
    let updated;
    if (index >= 0) {
        updated = existing.map(p => p.id === program.id ? program : p);
    } else {
        updated = [...existing, program];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteProgram = async (id: string): Promise<void> => {
    const existing = await getSavedPrograms();
    const updated = existing.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const createEmptyProgram = (authorId: string): DesignerProgram => {
    return {
        id: `prog_${Date.now()}`,
        title: 'New Program',
        description: '',
        authorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        durationWeeks: 4,
        difficulty: 'Intermediate',
        weeks: [{
            id: `week_${Date.now()}`,
            weekNumber: 1,
            days: []
        }],
        isActive: false,
        tags: []
    };
};
