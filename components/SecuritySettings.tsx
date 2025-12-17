
import React, { useState, useEffect } from 'react';
import { UserProfile, SecurityProfile, SessionInfo, AuditLogEntry } from '../types';
import { getAuditLogs, getActiveSessions, revokeSession, toggleTwoFactor, getDefaultSecurityProfile } from '../services/securityService';
import { 
    Shield, Lock, Smartphone, Globe, AlertTriangle, Eye, EyeOff, FileText, 
    Trash2, RefreshCw, CheckCircle, XCircle, Download, KeyRound, LogOut, Edit 
} from 'lucide-react';

interface SecuritySettingsProps {
    profile: UserProfile;
    updateProfile: (p: UserProfile) => void;
}

const PrivacyToggle: React.FC<{ 
    label: string; 
    description: string; 
    value: boolean; 
    onChange: () => void; 
    icon?: React.ElementType 
}> = ({ label, description, value, onChange, icon: Icon }) => (
    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-blue-500/30 transition">
        <div className="flex items-start gap-3">
            {Icon && <div className="mt-1 bg-gray-800 p-2 rounded-lg text-gray-400"><Icon size={18}/></div>}
            <div>
                <h4 className="font-bold text-white text-sm">{label}</h4>
                <p className="text-xs text-gray-400 mt-1">{description}</p>
            </div>
        </div>
        <button 
            onClick={onChange}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${value ? 'bg-green-600' : 'bg-gray-700'}`}
        >
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
    </div>
);

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ profile, updateProfile }) => {
    const [activeTab, setActiveTab] = useState<'privacy' | 'security' | 'audit'>('privacy');
    const [loading, setLoading] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [sessions, setSessions] = useState<SessionInfo[]>([]);

    // Ensure security profile exists
    useEffect(() => {
        if (!profile.settings?.security) {
            updateProfile({
                ...profile,
                settings: { ...profile.settings!, security: getDefaultSecurityProfile() }
            });
        }
    }, []);

    // Load data on tab switch
    useEffect(() => {
        if (activeTab === 'audit') {
            setLoading(true);
            getAuditLogs().then(logs => { setAuditLogs(logs); setLoading(false); });
        }
        if (activeTab === 'security') {
            setLoading(true);
            getActiveSessions().then(sess => { setSessions(sess); setLoading(false); });
        }
    }, [activeTab]);

    const security = profile.settings?.security || getDefaultSecurityProfile();

    const updatePrivacy = (key: keyof SecurityProfile['privacyConfig']) => {
        const newPrivacy = { ...security.privacyConfig, [key]: !security.privacyConfig[key] };
        updateProfile({
            ...profile,
            settings: { ...profile.settings!, security: { ...security, privacyConfig: newPrivacy } }
        });
    };

    const handle2FAToggle = async () => {
        setLoading(true);
        const newState = await toggleTwoFactor(security.twoFactorEnabled);
        updateProfile({
            ...profile,
            settings: { ...profile.settings!, security: { ...security, twoFactorEnabled: newState } }
        });
        setLoading(false);
    };

    const handleRevokeSession = async (id: string) => {
        if (confirm("آیا از لغو دسترسی این دستگاه مطمئن هستید؟")) {
            await revokeSession(id);
            setSessions(prev => prev.filter(s => s.id !== id));
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in">
            {/* Tab Nav */}
            <div className="flex space-x-2 space-x-reverse mb-6 border-b border-gray-700 pb-1">
                <button 
                    onClick={() => setActiveTab('privacy')} 
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === 'privacy' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    حریم خصوصی
                </button>
                <button 
                    onClick={() => setActiveTab('security')} 
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === 'security' ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    امنیت حساب
                </button>
                <button 
                    onClick={() => setActiveTab('audit')} 
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === 'audit' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    تاریخچه و داده‌ها
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                
                {/* --- PRIVACY TAB --- */}
                {activeTab === 'privacy' && (
                    <div className="space-y-6">
                        <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 flex items-start gap-3">
                            <Shield className="text-blue-400 shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-blue-300 text-sm">کنترل کامل داده‌ها</h4>
                                <p className="text-xs text-blue-200 mt-1">
                                    شما تعیین می‌کنید چه کسی به اطلاعات حساس شما دسترسی داشته باشد. مربیان تنها به مواردی که شما مجاز کنید دسترسی دارند.
                                </p>
                            </div>
                        </div>

                        <h3 className="text-white font-bold text-lg border-r-4 border-blue-500 pr-3">دسترسی مربی</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PrivacyToggle 
                                label="اشتراک‌گذاری وزن و ترکیب بدنی" 
                                description="اجازه مشاهده وزن، چربی و عکس‌های پیشرفت"
                                value={security.privacyConfig.shareWeight}
                                onChange={() => updatePrivacy('shareWeight')}
                            />
                            <PrivacyToggle 
                                label="اشتراک‌گذاری تغذیه" 
                                description="مشاهده کالری مصرفی و برنامه غذایی"
                                value={security.privacyConfig.shareNutrition}
                                onChange={() => updatePrivacy('shareNutrition')}
                            />
                            <PrivacyToggle 
                                label="سوابق پزشکی" 
                                description="دسترسی به اطلاعات آسیب‌ها و بیماری‌ها"
                                value={security.privacyConfig.shareMedical}
                                onChange={() => updatePrivacy('shareMedical')}
                                icon={AlertTriangle}
                            />
                            <PrivacyToggle 
                                label="اجازه ویرایش برنامه" 
                                description="مربی می‌تواند برنامه تمرینی شما را تغییر دهد"
                                value={security.privacyConfig.allowCoachEdit}
                                onChange={() => updatePrivacy('allowCoachEdit')}
                                icon={Edit}
                            />
                        </div>

                        <h3 className="text-white font-bold text-lg border-r-4 border-purple-500 pr-3 mt-4">دسترسی عمومی</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PrivacyToggle 
                                label="پروفایل عمومی" 
                                description="نام و سطح شما در جستجوها و لیدربرد نمایش داده شود"
                                value={security.privacyConfig.publicProfile}
                                onChange={() => updatePrivacy('publicProfile')}
                                icon={Globe}
                            />
                            <PrivacyToggle 
                                label="اشتراک‌گذاری تمرینات" 
                                description="دوستان می‌توانند فعالیت‌های ورزشی شما را ببینند"
                                value={security.privacyConfig.shareWorkouts}
                                onChange={() => updatePrivacy('shareWorkouts')}
                            />
                        </div>
                    </div>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === 'security' && (
                    <div className="space-y-8">
                        {/* 2FA Section */}
                        <div className="energetic-card p-6 border-red-500/30">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${security.twoFactorEnabled ? 'bg-green-600' : 'bg-red-600'}`}>
                                        <Lock className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">تایید دو مرحله‌ای (2FA)</h3>
                                        <p className="text-sm text-gray-400">
                                            {security.twoFactorEnabled ? 'حساب شما با امنیت بالا محافظت می‌شود.' : 'برای امنیت بیشتر، تایید دو مرحله‌ای را فعال کنید.'}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handle2FAToggle} 
                                    disabled={loading}
                                    className={`px-6 py-2 rounded-lg font-bold transition ${security.twoFactorEnabled ? 'bg-gray-700 text-red-400 hover:bg-gray-600' : 'btn-primary'}`}
                                >
                                    {loading ? <RefreshCw className="animate-spin"/> : security.twoFactorEnabled ? 'غیرفعال کردن' : 'فعال‌سازی'}
                                </button>
                            </div>
                        </div>

                        {/* Password Change */}
                        <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><KeyRound size={20} className="text-yellow-400"/> رمز عبور</h3>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-400">آخرین تغییر: {security.lastPasswordChange || 'هرگز'}</p>
                                <button className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition">تغییر رمز عبور</button>
                            </div>
                        </div>

                        {/* Active Sessions */}
                        <div>
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Smartphone size={20} className="text-blue-400"/> نشست‌های فعال</h3>
                            <div className="space-y-3">
                                {loading ? <div className="text-center p-4 text-gray-500">در حال بارگذاری...</div> : 
                                 sessions.map(sess => (
                                    <div key={sess.id} className="flex justify-between items-center p-4 bg-gray-800 rounded-xl border border-gray-700">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${sess.isCurrent ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                                <Smartphone size={24}/>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{sess.device} {sess.isCurrent && <span className="text-green-400 text-xs ml-2">(دستگاه فعلی)</span>}</h4>
                                                <p className="text-xs text-gray-500">{sess.location} • {sess.ip}</p>
                                                <p className="text-xs text-gray-400 mt-1">آخرین فعالیت: {sess.lastActive}</p>
                                            </div>
                                        </div>
                                        {!sess.isCurrent && (
                                            <button onClick={() => handleRevokeSession(sess.id)} className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-900/20 text-xs font-bold transition flex items-center">
                                                <LogOut size={16} className="mr-1"/> خروج
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- AUDIT TAB --- */}
                {activeTab === 'audit' && (
                    <div className="space-y-6">
                        <div className="bg-yellow-900/10 p-4 rounded-xl border border-yellow-500/20 flex items-start gap-3">
                            <FileText className="text-yellow-400 shrink-0 mt-1"/>
                            <div>
                                <h4 className="font-bold text-yellow-300 text-sm">شفافیت و کنترل</h4>
                                <p className="text-xs text-yellow-200/70 mt-1">
                                    تمام فعالیت‌های حساس حساب شما در اینجا ثبت می‌شود. اگر فعالیت مشکوکی مشاهده کردید، سریعاً رمز عبور خود را تغییر دهید.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                            <table className="w-full text-right">
                                <thead className="bg-black/30 text-xs text-gray-500 uppercase font-bold">
                                    <tr>
                                        <th className="p-4">فعالیت</th>
                                        <th className="p-4">تاریخ</th>
                                        <th className="p-4">ماژول</th>
                                        <th className="p-4">IP</th>
                                        <th className="p-4">وضعیت</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-800">
                                    {loading ? (
                                        <tr><td colSpan={5} className="p-4 text-center text-gray-500">در حال دریافت...</td></tr>
                                    ) : auditLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-white/5 transition">
                                            <td className="p-4 text-white font-medium">
                                                {log.action}
                                                <span className="block text-xs text-gray-500 font-normal mt-0.5">{log.details}</span>
                                            </td>
                                            <td className="p-4 text-gray-400 font-mono text-xs">{new Date(log.timestamp).toLocaleString('fa-IR')}</td>
                                            <td className="p-4 text-gray-300">{log.module}</td>
                                            <td className="p-4 text-gray-500 font-mono text-xs">{log.ip}</td>
                                            <td className="p-4">
                                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit ${
                                                    log.status === 'Success' ? 'bg-green-900/30 text-green-400' : 
                                                    log.status === 'Warning' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'
                                                }`}>
                                                    {log.status === 'Success' ? <CheckCircle size={12}/> : log.status === 'Warning' ? <AlertTriangle size={12}/> : <XCircle size={12}/>}
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-gray-700 pt-6 mt-8">
                            <h4 className="font-bold text-red-400 mb-4">ناحیه خطر (Danger Zone)</h4>
                            <div className="flex gap-4">
                                <button className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-white/5 flex items-center">
                                    <Download size={16} className="mr-2"/> دانلود تمام داده‌ها (GDPR)
                                </button>
                                <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                                    <Trash2 size={16} className="mr-2"/> حذف حساب کاربری
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SecuritySettings;
