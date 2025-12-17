
import React, { useState, useEffect } from 'react';
import { UserProfile, AppView, AppTheme, WidgetConfig, NotificationPreferences, ModuleConfig, AutomationRule, AdvancedWidget, AdvancedNotificationSettings, Reminder, NotificationCategory, AIPreferences, AIInsightCategory, DailyLog } from '../types';
import { getDefaultReminders } from '../services/notificationService';
import { exportFullUserData } from '../services/profileService';
import { 
  Bell, Shield, Moon, 
  Check, RefreshCw, Loader2,
  Workflow, Edit2, Plus, Trash2, Sliders, ToggleLeft, ToggleRight, Clock, Brain, Database, Download
} from 'lucide-react';
import SecuritySettings from './SecuritySettings';

interface SettingsCenterProps {
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  setCurrentView: (view: AppView) => void;
  logs?: DailyLog[];
}

const SettingsCenter: React.FC<SettingsCenterProps> = ({ profile, updateProfile, setCurrentView, logs = [] }) => {
    const [activeTab, setActiveTab] = useState<'notifications' | 'security' | 'ai'>('notifications');
    
    // Initialize Settings if missing or incomplete
    useEffect(() => {
        const currentSettings = profile.settings || {
            theme: profile.theme || 'Standard',
            language: 'fa',
            units: 'metric',
            widgets: [],
            notifications: {
                trainingReminders: true,
                nutritionAlerts: true,
                recoveryAlerts: true,
                communityUpdates: false,
                achievementAlerts: true,
                marketingEmails: false
            },
            access: { isProfilePublic: false, shareWithCoach: false, shareWithClubs: true }
        };

        if (!currentSettings.automationRules) currentSettings.automationRules = [];
        if (!currentSettings.widgetStyles) currentSettings.widgetStyles = {};
        if (!currentSettings.access.moduleVisibility) currentSettings.access.moduleVisibility = {};
        if (!currentSettings.units) currentSettings.units = 'metric';
        
        if (!currentSettings.notificationSettings) {
            currentSettings.notificationSettings = {
                channels: { push: true, email: true, sms: false, 'in-app': true },
                quietHours: { start: '23:00', end: '07:00', enabled: false },
                categories: { 
                    'Health Alerts': { enabled: true, priority: 'high' },
                    'Goal Reminders': { enabled: true, priority: 'medium' },
                    'Gamification Alerts': { enabled: true, priority: 'medium' },
                    'AI Insights': { enabled: true, priority: 'low' },
                    'Custom': { enabled: true, priority: 'high' }
                },
                customReminders: getDefaultReminders()
            };
        }

        if (!currentSettings.aiPreferences) {
            currentSettings.aiPreferences = {
                aggressiveness: 'balanced',
                enabledCategories: {
                    Performance: true,
                    Recovery: true,
                    Nutrition: true,
                    Mental: true,
                    Injury: true,
                    Gamification: true,
                    Predictive: true
                },
                frequency: 'medium'
            };
        }

        if (JSON.stringify(currentSettings) !== JSON.stringify(profile.settings)) {
            updateProfile({ ...profile, settings: currentSettings });
        }
    }, []);

    // --- NOTIFICATION MANAGEMENT ---
    const toggleChannel = (channel: keyof AdvancedNotificationSettings['channels']) => {
        const settings = profile.settings!.notificationSettings!;
        updateProfile({
            ...profile,
            settings: {
                ...profile.settings!,
                notificationSettings: {
                    ...settings,
                    channels: { ...settings.channels, [channel]: !settings.channels[channel] }
                }
            }
        });
    };

    const updateQuietHours = (field: 'start' | 'end' | 'enabled', value: any) => {
        const settings = profile.settings!.notificationSettings!;
        updateProfile({
            ...profile,
            settings: {
                ...profile.settings!,
                notificationSettings: {
                    ...settings,
                    quietHours: { ...settings.quietHours, [field]: value }
                }
            }
        });
    };

    const toggleNotificationCategory = (cat: NotificationCategory) => {
        const settings = profile.settings!.notificationSettings!;
        updateProfile({
            ...profile,
            settings: {
                ...profile.settings!,
                notificationSettings: {
                    ...settings,
                    categories: { 
                        ...settings.categories, 
                        [cat]: { ...settings.categories[cat], enabled: !settings.categories[cat].enabled } 
                    }
                }
            }
        });
    };

    const addCustomReminder = () => {
        const newReminder: Reminder = {
            id: `rem_${Date.now()}`,
            title: 'یادآور جدید',
            time: '09:00',
            days: [0, 1, 2, 3, 4, 5, 6],
            isEnabled: true,
            category: 'Custom',
            channels: ['push', 'in-app']
        };
        const settings = profile.settings!.notificationSettings!;
        updateProfile({
            ...profile,
            settings: {
                ...profile.settings!,
                notificationSettings: {
                    ...settings,
                    customReminders: [...settings.customReminders, newReminder]
                }
            }
        });
    };

    const updateReminder = (id: string, updates: Partial<Reminder>) => {
        const settings = profile.settings!.notificationSettings!;
        const updated = settings.customReminders.map(r => r.id === id ? { ...r, ...updates } : r);
        updateProfile({
            ...profile,
            settings: {
                ...profile.settings!,
                notificationSettings: { ...settings, customReminders: updated }
            }
        });
    };

    const deleteReminder = (id: string) => {
        const settings = profile.settings!.notificationSettings!;
        const updated = settings.customReminders.filter(r => r.id !== id);
        updateProfile({
            ...profile,
            settings: {
                ...profile.settings!,
                notificationSettings: { ...settings, customReminders: updated }
            }
        });
    };

    // --- AI PREFERENCES ---
    const updateAIPreference = (updates: Partial<AIPreferences>) => {
        const currentAI = profile.settings!.aiPreferences!;
        updateProfile({
            ...profile,
            settings: {
                ...profile.settings!,
                aiPreferences: { ...currentAI, ...updates }
            }
        });
    };

    const toggleAICategory = (cat: AIInsightCategory) => {
        const currentAI = profile.settings!.aiPreferences!;
        const updatedCats = { ...currentAI.enabledCategories, [cat]: !currentAI.enabledCategories[cat] };
        updateAIPreference({ enabledCategories: updatedCats });
    };

    if (!profile.settings || !profile.settings.notificationSettings || !profile.settings.aiPreferences) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Loading Settings...</div>;

    const notifSettings = profile.settings.notificationSettings;
    const aiSettings = profile.settings.aiPreferences;

    return (
        <div className="flex flex-col h-full space-y-6">
            
            {/* Top Tabs */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 shrink-0 overflow-x-auto">
                {[
                    { id: 'notifications', icon: Bell, label: 'اعلان‌ها' },
                    { id: 'ai', icon: Brain, label: 'مربی هوشمند' },
                    { id: 'security', icon: Shield, label: 'امنیت و حریم خصوصی' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`flex-1 min-w-[100px] py-3 rounded-lg font-bold flex items-center justify-center transition-all text-xs md:text-sm whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <tab.icon className="w-4 h-4 ml-2" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                
                {/* --- NOTIFICATIONS TAB --- */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* Channels & Quiet Hours */}
                        <div className="energetic-card p-6 border-blue-500/30">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Bell className="text-blue-400"/> کانال‌های دریافت</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {Object.entries(notifSettings.channels).map(([channel, enabled]) => (
                                    <button 
                                        key={channel} 
                                        onClick={() => toggleChannel(channel as any)}
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${enabled ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black/20 border-gray-600 text-gray-500'}`}
                                    >
                                        <span className="capitalize font-bold text-sm">{channel}</span>
                                        <span className="text-[10px] mt-1">{enabled ? 'فعال' : 'غیرفعال'}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <Moon className="text-indigo-400"/>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">ساعات سکوت (Quiet Hours)</h4>
                                        <p className="text-xs text-gray-400">عدم ارسال اعلان در ساعات استراحت</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="time" 
                                        value={notifSettings.quietHours.start} 
                                        onChange={e => updateQuietHours('start', e.target.value)}
                                        className="bg-gray-800 text-white p-2 rounded text-xs border border-gray-600"
                                    />
                                    <span className="text-gray-500">تا</span>
                                    <input 
                                        type="time" 
                                        value={notifSettings.quietHours.end} 
                                        onChange={e => updateQuietHours('end', e.target.value)}
                                        className="bg-gray-800 text-white p-2 rounded text-xs border border-gray-600"
                                    />
                                    <button 
                                        onClick={() => updateQuietHours('enabled', !notifSettings.quietHours.enabled)}
                                        className={`ml-2 p-2 rounded-full ${notifSettings.quietHours.enabled ? 'text-green-400 bg-green-900/20' : 'text-gray-500 bg-gray-800'}`}
                                    >
                                        {notifSettings.quietHours.enabled ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="energetic-card p-6 bg-gray-900">
                            <h3 className="text-lg font-bold text-white mb-4">دسته‌بندی اعلان‌ها</h3>
                            <div className="space-y-2">
                                {Object.entries(notifSettings.categories).map(([cat, config]) => {
                                    const c = config as { enabled: boolean };
                                    return (
                                    <div key={cat} className="flex justify-between items-center p-3 bg-black/20 rounded-lg border border-white/5">
                                        <span className="text-sm text-white">{cat}</span>
                                        <button 
                                            onClick={() => toggleNotificationCategory(cat as NotificationCategory)}
                                            className={`${c.enabled ? 'text-green-400' : 'text-gray-600'}`}
                                        >
                                            {c.enabled ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
                                        </button>
                                    </div>
                                )})}
                            </div>
                        </div>

                        {/* Custom Reminders */}
                        <div className="energetic-card p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Clock className="text-yellow-400"/> یادآورهای شخصی</h3>
                                <button onClick={addCustomReminder} className="text-xs bg-yellow-600 hover:bg-yellow-500 text-black px-3 py-1.5 rounded font-bold flex items-center">
                                    <Plus size={14} className="mr-1"/> افزودن یادآور
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {notifSettings.customReminders.map(rem => (
                                    <div key={rem.id} className="p-4 bg-black/20 rounded-xl border border-white/10 relative group">
                                        <div className="flex gap-4 mb-3">
                                            <input 
                                                value={rem.title} 
                                                onChange={e => updateReminder(rem.id, { title: e.target.value })}
                                                className="flex-1 bg-transparent border-b border-gray-700 focus:border-yellow-500 outline-none text-white text-sm"
                                            />
                                            <input 
                                                type="time"
                                                value={rem.time}
                                                onChange={e => updateReminder(rem.id, { time: e.target.value })}
                                                className="bg-gray-800 text-white p-1 rounded text-xs"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-1">
                                                {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((d, idx) => (
                                                    <button 
                                                        key={idx}
                                                        onClick={() => {
                                                            const newDays = rem.days.includes(idx) ? rem.days.filter(x => x !== idx) : [...rem.days, idx];
                                                            updateReminder(rem.id, { days: newDays });
                                                        }}
                                                        className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center transition ${rem.days.includes(idx) ? 'bg-yellow-600 text-black' : 'bg-gray-700 text-gray-400'}`}
                                                    >
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => updateReminder(rem.id, { isEnabled: !rem.isEnabled })} className={`${rem.isEnabled ? 'text-green-400' : 'text-gray-600'}`}>
                                                    {rem.isEnabled ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                                                </button>
                                                <button onClick={() => deleteReminder(rem.id)} className="text-gray-600 hover:text-red-400">
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- AI COACH SETTINGS --- */}
                {activeTab === 'ai' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="energetic-card p-6 border-cyan-500/30 bg-cyan-900/10">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center"><Brain className="mr-2 text-cyan-400"/> تنظیمات مربی هوشمند</h3>
                            
                            {/* Aggressiveness */}
                            <div className="mb-8">
                                <h4 className="font-bold text-white text-sm mb-3">سطح جدیت (Aggressiveness)</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    {(['conservative', 'balanced', 'proactive'] as const).map(mode => (
                                        <button 
                                            key={mode} 
                                            onClick={() => updateAIPreference({ aggressiveness: mode })}
                                            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${aiSettings.aggressiveness === mode ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-black/20 border-gray-600 text-gray-500'}`}
                                        >
                                            <span className="capitalize font-bold text-sm">{mode}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    {aiSettings.aggressiveness === 'conservative' ? 'پیشنهادات ملایم و با احتیاط.' : 
                                     aiSettings.aggressiveness === 'balanced' ? 'تعادل بین پیشرفت و ریکاوری.' : 
                                     'فشار حداکثری برای پیشرفت سریع.'}
                                </p>
                            </div>

                            {/* Categories */}
                            <div>
                                <h4 className="font-bold text-white text-sm mb-3">حوزه‌های فعال</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {Object.entries(aiSettings.enabledCategories).map(([cat, enabled]) => (
                                        <button 
                                            key={cat} 
                                            onClick={() => toggleAICategory(cat as AIInsightCategory)}
                                            className={`p-2 rounded-lg text-xs font-bold border transition ${enabled ? 'bg-cyan-900/50 text-cyan-300 border-cyan-500/50' : 'bg-black/20 text-gray-500 border-gray-700'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === 'security' && (
                    <SecuritySettings profile={profile} updateProfile={updateProfile} />
                )}

            </div>
        </div>
    );
};

export default SettingsCenter;
