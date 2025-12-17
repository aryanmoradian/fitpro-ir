
import { AuditLogEntry, SessionInfo, SecurityProfile, UserRole } from '../types';

// Mock Data Generators for Prototype
const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: '1', action: 'Login', module: 'Auth', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Logged in from Chrome/Windows', ip: '192.168.1.5', status: 'Success' },
    { id: '2', action: 'Update Profile', module: 'Profile', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'Changed weight goal', ip: '192.168.1.5', status: 'Success' },
    { id: '3', action: 'Export Data', module: 'Settings', timestamp: new Date(Date.now() - 172800000).toISOString(), details: 'Downloaded JSON archive', ip: '192.168.1.5', status: 'Warning' },
    { id: '4', action: 'Failed Login', module: 'Auth', timestamp: new Date(Date.now() - 200000000).toISOString(), details: 'Wrong password attempt', ip: '10.0.0.45', status: 'Failed' },
];

const MOCK_SESSIONS: SessionInfo[] = [
    { id: 'sess_1', device: 'Chrome on Windows 11', ip: '192.168.1.5', location: 'Tehran, Iran', lastActive: 'Just now', isCurrent: true },
    { id: 'sess_2', device: 'Safari on iPhone 13', ip: '192.168.1.5', location: 'Tehran, Iran', lastActive: '5 hours ago', isCurrent: false },
    { id: 'sess_3', device: 'Firefox on MacOS', ip: '203.0.113.45', location: 'Shiraz, Iran', lastActive: '3 days ago', isCurrent: false },
];

// --- PERMISSIONS (RBAC) ---

const PERMISSIONS = {
    athlete: {
        'dashboard': ['view', 'edit'],
        'profile': ['view', 'edit'],
        'training': ['view', 'edit'],
        'admin_panel': [],
    },
    coach: {
        'dashboard': ['view'],
        'profile': ['view'], // Limited by athlete privacy settings
        'training': ['view', 'edit', 'assign'],
        'admin_panel': [],
    },
    admin: {
        'dashboard': ['view', 'edit'],
        'profile': ['view', 'edit', 'delete'],
        'training': ['view', 'edit'],
        'admin_panel': ['view', 'edit', 'manage_users'],
    }
};

export const hasPermission = (role: UserRole, resource: string, action: string): boolean => {
    const rolePerms = PERMISSIONS[role] as any;
    if (!rolePerms) return false;
    const resourcePerms = rolePerms[resource] || [];
    return resourcePerms.includes(action);
};

// --- DATA ACCESS ---

export const getAuditLogs = async (): Promise<AuditLogEntry[]> => {
    // Simulate API call
    return new Promise(resolve => setTimeout(() => resolve(MOCK_AUDIT_LOGS), 500));
};

export const getActiveSessions = async (): Promise<SessionInfo[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_SESSIONS), 500));
};

export const revokeSession = async (sessionId: string): Promise<boolean> => {
    console.log(`Revoking session ${sessionId}`);
    return new Promise(resolve => setTimeout(() => resolve(true), 800));
};

export const toggleTwoFactor = async (currentState: boolean): Promise<boolean> => {
    // In real app, this would trigger a QR code flow or SMS verification
    return new Promise(resolve => setTimeout(() => resolve(!currentState), 1000));
};

export const getDefaultSecurityProfile = (): SecurityProfile => ({
    twoFactorEnabled: false,
    activeSessions: [],
    auditLogs: [],
    privacyConfig: {
        shareWeight: true,
        sharePhotos: false,
        shareWorkouts: true,
        shareNutrition: true,
        shareMedical: false,
        shareHealthVitals: false,
        publicProfile: false,
        allowCoachEdit: false
    }
});
