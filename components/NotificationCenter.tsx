
import React, { useState } from 'react';
import { AppNotification, NotificationCategory } from '../types';
import { Bell, Check, Trash2, Filter, X, ChevronRight, AlertCircle, Trophy, Activity, Zap, Brain } from 'lucide-react';

interface NotificationCenterProps {
    notifications: AppNotification[];
    onClose: () => void;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
    onActionClick: (link: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onClose, onMarkRead, onDelete, onClearAll, onActionClick }) => {
    const [filter, setFilter] = useState<NotificationCategory | 'All'>('All');

    const filteredNotifications = filter === 'All' 
        ? notifications 
        : notifications.filter(n => n.category === filter);

    const getIcon = (cat: NotificationCategory) => {
        switch(cat) {
            case 'Health Alerts': return <Activity className="text-red-400" size={18}/>;
            case 'Gamification Alerts': return <Trophy className="text-yellow-400" size={18}/>;
            case 'AI Insights': return <Brain className="text-purple-400" size={18}/>;
            case 'Goal Reminders': return <Zap className="text-blue-400" size={18}/>;
            default: return <Bell className="text-gray-400" size={18}/>;
        }
    };

    return (
        <div className="absolute top-16 left-4 md:left-20 w-80 md:w-96 bg-[#1E293B] border border-gray-700 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 origin-top-left">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-black/20 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <Bell className="text-white" size={20} />
                    <h3 className="font-bold text-white">اعلان‌ها</h3>
                    <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">{notifications.filter(n => !n.isRead).length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onClearAll} className="text-xs text-gray-400 hover:text-red-400 transition" title="حذف همه">
                        <Trash2 size={16}/>
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X size={20}/>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-2 border-b border-gray-700 overflow-x-auto flex gap-2 custom-scrollbar">
                {['All', 'Health Alerts', 'Goal Reminders', 'AI Insights'].map((cat: any) => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`text-[10px] whitespace-nowrap px-3 py-1 rounded-full transition ${filter === cat ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    >
                        {cat === 'All' ? 'همه' : cat}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <Bell className="mx-auto mb-2 opacity-20" size={32}/>
                        <p className="text-xs">هیچ اعلان جدیدی وجود ندارد.</p>
                    </div>
                ) : (
                    filteredNotifications.map(notif => (
                        <div key={notif.id} className={`p-3 rounded-xl border transition-all relative group ${notif.isRead ? 'bg-transparent border-transparent opacity-60' : 'bg-white/5 border-gray-600'}`}>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 bg-black/30 p-2 rounded-lg">{getIcon(notif.category)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={`text-sm font-bold truncate ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h4>
                                        <span className="text-[10px] text-gray-500">{new Date(notif.timestamp).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{notif.message}</p>
                                    
                                    {notif.actionLink && (
                                        <button 
                                            onClick={() => { onActionClick(notif.actionLink!); onClose(); }}
                                            className="mt-2 text-[10px] text-blue-400 flex items-center hover:underline"
                                        >
                                            مشاهده جزئیات <ChevronRight size={12} className="ml-1"/>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Actions on Hover */}
                            <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/80 p-1 rounded-lg">
                                {!notif.isRead && (
                                    <button onClick={() => onMarkRead(notif.id)} className="p-1 hover:text-green-400 text-gray-400" title="خوانده شد">
                                        <Check size={14}/>
                                    </button>
                                )}
                                <button onClick={() => onDelete(notif.id)} className="p-1 hover:text-red-400 text-gray-400" title="حذف">
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
