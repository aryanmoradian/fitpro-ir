
import React, { useState, useEffect } from 'react';
import { AdminStats } from '../types';
import { getAdminAnalytics } from '../services/pricingService';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Users, DollarSign, Shield, Activity, Video, Mail, Menu, LogOut
} from 'lucide-react';
import AdminUserManagement from './AdminUserManagement';
import AdminFinancePanel from './AdminFinancePanel';
import AdminVideoPanel from './AdminVideoPanel';
import AdminActivityMonitor from './AdminActivityMonitor';
import AdminInbox from './AdminInbox';
import AdminPaymentPanel from './AdminPaymentPanel';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth(); // Connect real logout
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'finance' | 'payments' | 'videos' | 'activity' | 'inbox'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
      getAdminAnalytics().then(setStats);
  }, []);

  const pendingCount = stats?.pendingReviews || 0;

  return (
    <div className="flex h-screen bg-[#0F172A] text-white overflow-hidden font-sans" dir="rtl">
        {/* SIDEBAR */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1E293B] border-l border-gray-700 flex flex-col transition-all duration-300 z-20`}>
            <div className="h-16 flex items-center justify-center border-b border-gray-700">
                {sidebarOpen ? <span className="font-bold text-lg">مدیریت فیت پرو</span> : <Shield className="text-blue-500"/>}
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center p-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>
                    <LayoutDashboard size={20} className="ml-3" /> {sidebarOpen && <span>نمای کلی</span>}
                </button>
                <button onClick={() => setActiveTab('users')} className={`w-full flex items-center p-3 rounded-lg transition ${activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>
                    <Users size={20} className="ml-3" /> {sidebarOpen && <span>مدیریت کاربران</span>}
                </button>
                <button onClick={() => setActiveTab('payments')} className={`w-full flex items-center p-3 rounded-lg transition ${activeTab === 'payments' ? 'bg-blue-600' : 'hover:bg-white/10'} relative`}>
                    <Shield size={20} className="ml-3" /> {sidebarOpen && <span>بررسی پرداخت‌ها</span>}
                    {pendingCount > 0 && (
                        <span className={`absolute bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ${sidebarOpen ? 'left-3' : 'top-2 left-2'}`}>
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center p-3 rounded-lg transition ${activeTab === 'finance' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>
                    <DollarSign size={20} className="ml-3" /> {sidebarOpen && <span>گزارش مالی</span>}
                </button>
                <button onClick={() => setActiveTab('videos')} className={`w-full flex items-center p-3 rounded-lg transition ${activeTab === 'videos' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>
                    <Video size={20} className="ml-3" /> {sidebarOpen && <span>ویدیوها</span>}
                </button>
                <button onClick={() => setActiveTab('activity')} className={`w-full flex items-center p-3 rounded-lg transition ${activeTab === 'activity' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>
                    <Activity size={20} className="ml-3" /> {sidebarOpen && <span>گزارش فعالیت</span>}
                </button>
                <button onClick={() => setActiveTab('inbox')} className={`w-full flex items-center p-3 rounded-lg transition ${activeTab === 'inbox' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>
                    <Mail size={20} className="ml-3" /> {sidebarOpen && <span>صندوق پیام</span>}
                </button>
            </nav>
            
            <div className="p-4 border-t border-gray-700">
                <button onClick={() => { logout(); window.location.reload(); }} className="w-full flex items-center justify-center p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition">
                    <LogOut size={20} className="ml-2" /> {sidebarOpen && <span>خروج مدیر</span>}
                </button>
            </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
            <header className="h-16 bg-[#1E293B]/50 border-b border-gray-700 flex items-center justify-between px-6">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400"><Menu/></button>
                <h2 className="text-xl font-bold capitalize">
                    {activeTab === 'dashboard' && 'داشبورد مدیریتی'}
                    {activeTab === 'users' && 'مدیریت کاربران'}
                    {activeTab === 'payments' && 'بررسی و تایید اشتراک‌ها'}
                    {activeTab === 'finance' && 'گزارشات مالی'}
                    {activeTab === 'videos' && 'مدیریت محتوای ویدیویی'}
                    {activeTab === 'activity' && 'مانیتورینگ فعالیت سیستم'}
                    {activeTab === 'inbox' && 'ارسال پیام و اعلان'}
                </h2>
            </header>

            <div className="flex-1 overflow-y-auto bg-black/20">
                {activeTab === 'dashboard' && stats && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700">
                            <p className="text-gray-400 text-xs uppercase">کل کاربران</p>
                            <h3 className="text-3xl font-black mt-2">{stats.totalUsers}</h3>
                        </div>
                        <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700">
                            <p className="text-gray-400 text-xs uppercase">اعضای ویژه (Elite)</p>
                            <h3 className="text-3xl font-black mt-2 text-yellow-400">{stats.eliteUsers}</h3>
                        </div>
                        <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700 cursor-pointer hover:border-blue-500" onClick={() => setActiveTab('payments')}>
                            <p className="text-gray-400 text-xs uppercase">در انتظار بررسی</p>
                            <h3 className="text-3xl font-black mt-2 text-red-400">{stats.pendingReviews}</h3>
                        </div>
                        <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700">
                            <p className="text-gray-400 text-xs uppercase">درآمد ماهانه</p>
                            <h3 className="text-3xl font-black mt-2 text-green-400">${stats.monthlyRevenue}</h3>
                        </div>
                    </div>
                )}
                {activeTab === 'users' && <AdminUserManagement />}
                {activeTab === 'payments' && <AdminPaymentPanel />}
                {activeTab === 'finance' && <AdminFinancePanel />}
                {activeTab === 'videos' && <AdminVideoPanel />}
                {activeTab === 'activity' && <AdminActivityMonitor />}
                {activeTab === 'inbox' && <AdminInbox />}
            </div>
        </main>
    </div>
  );
};

export default AdminDashboard;
