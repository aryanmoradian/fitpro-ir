
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, RecoveryTask, RecoveryFrequency, RecoveryCategory, RecoveryIntensity, RecoveryLog } from '../types';
import { checkRecoveryPrerequisites, getTaskStatus, getDefaultRecoveryTasks } from '../services/recoveryService';
import { 
    Lock, Check, Plus, Trash2, Edit2, Info, RefreshCw, Calendar, 
    RotateCcw, Activity, ShieldCheck, Clock, Layers, Save, X, Filter, FileText
} from 'lucide-react';

interface RecoveryWidgetProps {
    profile: UserProfile;
    updateProfile: (p: UserProfile) => void;
}

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => (
    <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mt-2">
        <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out" 
            style={{ width: `${percentage}%` }}
        ></div>
    </div>
);

const TaskItem: React.FC<{ 
    task: RecoveryTask; 
    logs: RecoveryLog[];
    onToggle: (id: string) => void; 
    onDelete: (id: string) => void; 
}> = ({ task, logs, onToggle, onDelete }) => {
    const status = getTaskStatus(task, logs);
    const isDone = status === 'Done';

    return (
        <div className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${isDone ? 'bg-green-900/10 border-green-500/30' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => onToggle(task.id)}>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-500 text-transparent'}`}>
                    <Check size={14} strokeWidth={3} />
                </div>
                <div>
                    <span className={`text-sm font-medium block transition ${isDone ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{task.title}</span>
                    <div className="flex gap-2 text-[10px] text-gray-500 mt-0.5">
                        <span className="flex items-center"><Layers size={10} className="mr-1"/> {task.category}</span>
                        <span className="flex items-center"><Clock size={10} className="mr-1"/> {task.durationTarget} min</span>
                    </div>
                </div>
            </div>
            {task.isCustom && (
                <button 
                    onClick={() => onDelete(task.id)} 
                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
};

const CustomTaskModal: React.FC<{ 
    onSave: (task: RecoveryTask) => void; 
    onClose: () => void; 
}> = ({ onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<RecoveryCategory>('Active Recovery');
    const [duration, setDuration] = useState(15);
    const [intensity, setIntensity] = useState<RecoveryIntensity>('Low');
    const [notes, setNotes] = useState('');
    const [freq, setFreq] = useState<RecoveryFrequency>('Daily');

    const handleSave = () => {
        if (!title) return alert("نام متد الزامی است.");
        onSave({
            id: `cust_rec_${Date.now()}`,
            title,
            category,
            durationTarget: duration,
            intensity,
            frequency: freq,
            isCustom: true,
            notes
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] border border-gray-600 rounded-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">افزودن متد ریکاوری</h3>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">نام متد <span className="text-red-500">*</span></label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full input-styled p-3" placeholder="مثلا: سونا بخار"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">دسته‌بندی</label>
                            <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full input-styled p-3">
                                <option value="Active Recovery">Active Recovery</option>
                                <option value="Passive Recovery">Passive Recovery</option>
                                <option value="Thermal">Thermal (Cold/Heat)</option>
                                <option value="Manual Therapy">Manual Therapy</option>
                                <option value="Sleep">Sleep Hygiene</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">تناوب</label>
                            <select value={freq} onChange={e => setFreq(e.target.value as any)} className="w-full input-styled p-3">
                                <option value="Daily">روزانه</option>
                                <option value="Weekly">هفتگی</option>
                                <option value="Monthly">ماهانه</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">مدت زمان (دقیقه)</label>
                            <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} className="w-full input-styled p-3"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">شدت</label>
                            <select value={intensity} onChange={e => setIntensity(e.target.value as any)} className="w-full input-styled p-3">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 block mb-1">توضیحات / پروتکل</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full input-styled p-3 h-20 resize-none" placeholder="نکات اجرایی..."/>
                    </div>

                    <button onClick={handleSave} className="w-full btn-primary py-3 rounded-xl font-bold mt-2">ذخیره و افزودن</button>
                </div>
            </div>
        </div>
    );
};

const HistoryTable: React.FC<{ logs: RecoveryLog[] }> = ({ logs }) => {
    const [filter, setFilter] = useState<'Daily' | 'Weekly' | 'Monthly' | 'All'>('All');

    const filteredLogs = logs.filter(l => {
        if (filter === 'All') return true;
        // Simple filter based on log timestamp vs now. 
        // Real implementation would group them. Here we just show list.
        return true; 
    }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const exportData = () => {
        const csvContent = "data:text/csv;charset=utf-8," + "Date,Task,Category,Status\n" + 
            filteredLogs.map(l => `${l.date},${l.taskTitle},${l.category},${l.status}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "recovery_history.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                <div className="flex gap-2">
                    {['All', 'Daily', 'Weekly'].map((f: any) => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)} 
                            className={`px-3 py-1 rounded text-xs transition ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <button onClick={exportData} className="text-xs flex items-center text-green-400 hover:underline">
                    <FileText size={12} className="mr-1"/> Export CSV
                </button>
            </div>

            <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-right text-xs">
                    <thead className="bg-gray-800 text-gray-400 font-bold">
                        <tr>
                            <th className="p-3">تاریخ</th>
                            <th className="p-3">نام متد</th>
                            <th className="p-3 hidden md:table-cell">دسته‌بندی</th>
                            <th className="p-3">وضعیت</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-gray-300">
                        {filteredLogs.length === 0 ? (
                            <tr><td colSpan={4} className="p-4 text-center text-gray-500">موردی ثبت نشده است.</td></tr>
                        ) : (
                            filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-white/5">
                                    <td className="p-3 font-mono">{log.date}</td>
                                    <td className="p-3 font-bold text-white">{log.taskTitle}</td>
                                    <td className="p-3 hidden md:table-cell">{log.category}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded ${log.status === 'Completed' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                            {log.status === 'Completed' ? 'انجام شد' : 'ناقص'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const RecoveryWidget: React.FC<RecoveryWidgetProps> = ({ profile, updateProfile }) => {
    const [activeTab, setActiveTab] = useState<'checklist' | 'history'>('checklist');
    const [tasks, setTasks] = useState<RecoveryTask[]>(profile.recoveryProfile?.tasks || getDefaultRecoveryTasks());
    const [logs, setLogs] = useState<RecoveryLog[]>(profile.recoveryProfile?.logs || []);
    const [isLocked, setIsLocked] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFreq, setActiveFreq] = useState<RecoveryFrequency>('Daily');

    useEffect(() => {
        const canAccess = checkRecoveryPrerequisites(profile.trainingLogs, profile.nutritionLogs);
        setIsLocked(!canAccess);
        if (profile.recoveryProfile?.tasks) setTasks(profile.recoveryProfile.tasks);
        if (profile.recoveryProfile?.logs) setLogs(profile.recoveryProfile.logs);
    }, [profile.trainingLogs, profile.nutritionLogs, profile.recoveryProfile]);

    const saveToProfile = (newTasks: RecoveryTask[], newLogs: RecoveryLog[]) => {
        setTasks(newTasks);
        setLogs(newLogs);
        updateProfile({
            ...profile,
            recoveryProfile: { tasks: newTasks, logs: newLogs }
        });
    };

    const toggleTask = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const today = new Date().toISOString().split('T')[0];
        const existingLogIndex = logs.findIndex(l => l.taskId === taskId && l.date === today);
        
        let newLogs = [...logs];
        
        if (existingLogIndex >= 0) {
            // Toggle off (remove log)
            newLogs.splice(existingLogIndex, 1);
        } else {
            // Add log
            const newLog: RecoveryLog = {
                id: `rec_log_${Date.now()}`,
                taskId: task.id,
                taskTitle: task.title,
                category: task.category,
                date: today,
                status: 'Completed',
                timestamp: new Date().toISOString()
            };
            newLogs.push(newLog);
        }
        
        saveToProfile(tasks, newLogs);
    };

    const handleAddTask = (newTask: RecoveryTask) => {
        saveToProfile([...tasks, newTask], logs);
    };

    const handleDeleteTask = (id: string) => {
        if(confirm("حذف این مورد؟")) {
            saveToProfile(tasks.filter(t => t.id !== id), logs);
        }
    };

    const calculateProgress = (freq: RecoveryFrequency) => {
        const freqTasks = tasks.filter(t => t.frequency === freq);
        if (freqTasks.length === 0) return 0;
        const completed = freqTasks.filter(t => getTaskStatus(t, logs) === 'Done').length;
        return Math.round((completed / freqTasks.length) * 100);
    };

    return (
        <div className="energetic-card p-0 overflow-hidden relative bg-[#1E293B] border-gray-700 min-h-[500px]">
            {/* Header */}
            <div className="p-6 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-blue-400" /> مدیریت ریکاوری هوشمند
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">برنامه‌ریزی برای بازسازی بدن و پیشگیری از آسیب</p>
                </div>
                {!isLocked && (
                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                        <button onClick={() => setActiveTab('checklist')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'checklist' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>چک‌لیست</button>
                        <button onClick={() => setActiveTab('history')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>تاریخچه</button>
                    </div>
                )}
            </div>

            {/* Locked Overlay */}
            {isLocked && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-gray-600 shadow-2xl">
                        <Lock size={40} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">بخش ریکاوری قفل است</h2>
                    <p className="text-gray-300 max-w-md leading-relaxed mb-6">
                        برای دسترسی به ابزارهای ریکاوری، سیستم نیاز به حداقل <span className="text-blue-400 font-bold">یک هفته</span> داده‌های تمرین و تغذیه دارد.
                    </p>
                </div>
            )}

            {/* Content Area */}
            <div className={`p-6 ${isLocked ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
                
                {activeTab === 'checklist' && (
                    <>
                        <div className="flex md:hidden bg-black/30 p-1 rounded-lg mb-6 overflow-x-auto">
                            {['Daily', 'Weekly', 'Monthly'].map((f: any) => (
                                <button key={f} onClick={() => setActiveFreq(f)} className={`flex-1 py-2 px-4 rounded-md text-xs font-bold transition ${activeFreq === f ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{f}</button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as RecoveryFrequency[]).map(freq => (
                                <div key={freq} className={`space-y-4 ${activeFreq !== freq ? 'hidden md:block' : ''}`}>
                                    <div className="flex justify-between items-end mb-2">
                                        <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b-2 border-blue-500 pb-1">{freq}</h4>
                                        <span className="text-xs text-blue-300 font-mono">{calculateProgress(freq)}%</span>
                                    </div>
                                    <ProgressBar percentage={calculateProgress(freq)} />
                                    
                                    <div className="space-y-2 mt-4 min-h-[200px]">
                                        {tasks.filter(t => t.frequency === freq).map(task => (
                                            <TaskItem key={task.id} task={task} logs={logs} onToggle={toggleTask} onDelete={handleDeleteTask} />
                                        ))}
                                    </div>

                                    <button 
                                        onClick={() => setIsModalOpen(true)} 
                                        className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-500 hover:text-blue-400 hover:border-blue-500/50 text-xs font-bold flex items-center justify-center transition"
                                    >
                                        <Plus size={14} className="mr-1"/> مورد جدید
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'history' && (
                    <HistoryTable logs={logs} />
                )}
            </div>

            {isModalOpen && <CustomTaskModal onSave={handleAddTask} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default RecoveryWidget;
