
import React, { useState, useEffect } from 'react';
import { getUserActivities } from '../services/adminService';
import { UserActivity } from '../types';
import { Activity, Clock, Monitor, Globe } from 'lucide-react';

const AdminActivityMonitor: React.FC = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await getUserActivities();
      setActivities(data);
    };
    fetch();
    const interval = setInterval(fetch, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Activity /> مانیتورینگ فعالیت کاربران</h2>
      <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-right text-sm text-gray-300">
          <thead className="bg-black/30 uppercase text-xs font-bold text-gray-500">
            <tr>
              <th className="p-4">زمان ثبت</th>
              <th className="p-4">شناسه کاربر</th>
              <th className="p-4">نوع رویداد</th>
              <th className="p-4">جزئیات دستگاه</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {activities.map(act => (
              <tr key={act.id} className="hover:bg-white/5 transition">
                <td className="p-4 flex items-center gap-2 text-xs font-mono"><Clock size={14}/> {act.timestamp}</td>
                <td className="p-4 text-white font-medium text-xs font-mono">{act.userId}</td>
                <td className="p-4">
                  <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-xs font-bold">{act.eventType}</span>
                  {act.eventData && <div className="mt-1 text-[10px] text-gray-500 truncate max-w-xs" dir="ltr">{JSON.stringify(act.eventData)}</div>}
                </td>
                <td className="p-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Monitor size={14}/> 
                        <span className="truncate max-w-[150px] inline-block" dir="ltr">{act.deviceInfo || 'Unknown'}</span>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {activities.length === 0 && (
            <div className="p-8 text-center text-gray-500">هیچ فعالیتی ثبت نشده است.</div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityMonitor;
