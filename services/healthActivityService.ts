
import { HealthActivityLog, HealthModuleType, UserProfile } from '../types';

export const logHealthInteraction = (
    profile: UserProfile, 
    updateProfile: (p: UserProfile) => void,
    moduleName: HealthModuleType
): void => {
    const today = new Date().toISOString().split('T')[0];
    const logs = profile.healthActivityLogs || [];
    
    const existingLogIndex = logs.findIndex(l => l.date === today);
    
    let newLogs = [...logs];
    
    if (existingLogIndex >= 0) {
        const log = newLogs[existingLogIndex];
        // Only update if module not already logged to prevent redundant updates
        if (!log.modulesInteracted.includes(moduleName)) {
            newLogs[existingLogIndex] = {
                ...log,
                modulesInteracted: [...log.modulesInteracted, moduleName]
            };
            // Only trigger update if changed
            updateProfile({ ...profile, healthActivityLogs: newLogs });
        }
    } else {
        // Create new log for today
        newLogs.push({
            date: today,
            modulesInteracted: [moduleName]
        });
        updateProfile({ ...profile, healthActivityLogs: newLogs });
    }
};

export const getHealthActivityLogs = (profile: UserProfile): HealthActivityLog[] => {
    return profile.healthActivityLogs || [];
};

export const toggleManualHealthLog = (
    profile: UserProfile, 
    updateProfile: (p: UserProfile) => void,
    moduleName: HealthModuleType,
    date: string
): void => {
    const logs = profile.healthActivityLogs || [];
    const existingLogIndex = logs.findIndex(l => l.date === date);
    let newLogs = [...logs];

    if (existingLogIndex >= 0) {
        const log = newLogs[existingLogIndex];
        const hasModule = log.modulesInteracted.includes(moduleName);
        
        let updatedModules;
        if (hasModule) {
            updatedModules = log.modulesInteracted.filter(m => m !== moduleName);
        } else {
            updatedModules = [...log.modulesInteracted, moduleName];
        }
        
        newLogs[existingLogIndex] = {
            ...log,
            modulesInteracted: updatedModules
        };
    } else {
        newLogs.push({
            date,
            modulesInteracted: [moduleName]
        });
    }
    
    updateProfile({ ...profile, healthActivityLogs: newLogs });
};

export const calculateHealthConsistency = (profile: UserProfile, days: number): number => {
    const logs = profile.healthActivityLogs || [];
    const now = new Date();
    let totalScore = 0;
    
    // Check last N days
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const log = logs.find(l => l.date === dateStr);
        if (log) {
            // Score per day = (Modules Interacted / 5)
            // 5 Modules: AI, Composition, Hydration, Injuries, Recovery
            totalScore += Math.min(1, log.modulesInteracted.length / 5);
        }
    }
    
    return Math.round((totalScore / days) * 100);
};
