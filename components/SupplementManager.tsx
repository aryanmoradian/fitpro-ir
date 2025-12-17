
import React, { useState, useEffect } from 'react';
import { UserProfile, Supplement, SupplementType, SupplementTiming } from '../types';
import { generateSupplementRecommendations, calculateStackAdherence, getGoalAlignment, SUPPLEMENT_DB } from '../services/supplementService';
import SupplementHistoryWidget from './SupplementHistoryWidget';
import { 
    Pill, Plus, Trash2, Edit2, Check, X, TrendingUp, Info, 
    Zap, Activity, Clock, AlertTriangle, ShieldCheck, CheckCircle2,
    ShoppingBag, ArrowRight, Sparkles
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';

interface SupplementManagerProps {
    profile: UserProfile;
    updateProfile: (p: UserProfile) => void;
}

const SupplementCard: React.FC<{ 
    supplement: Supplement; 
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (s: Supplement) => void;
}> = ({ supplement, onToggle, onDelete, onEdit }) => {
    return (
        <div className={`p-4 rounded-xl border transition-all relative group ${supplement.isActive ? 'bg-[#1E293B] border-blue-500/30' : 'bg-black/20 border-white/5 opacity-70'}`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${supplement.isActive ? 'bg-blue-900/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                        <Pill size={20} />
                    </div>
                    <div>
                        <h4 className={`font-bold ${supplement.isActive ? 'text-white' : 'text-gray-400'}`}>{supplement.name}</h4>
                        <span className="text-xs text-gray-500">{supplement.dosage} • {supplement.timing.join(', ')}</span>
                    </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => onEdit(supplement)} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"><Edit2 size={14}/></button>
                    <button onClick={() => onDelete(supplement.id)} className="p-1.5 hover:bg-red-900/30 rounded text-gray-400 hover:text-red-400"><Trash2 size={14}/></button>
                </div>
            </div>
            
            <div className="mt-3 flex justify-between items-center">
                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                    supplement.priority === 'Essential' ? 'bg-green-900/20 border-green-500/30 text-green-400' : 
                    supplement.priority === 'Advanced' ? 'bg-purple-900/20 border-purple-500/30 text-purple-400' : 
                    'bg-gray-800 border-gray-600 text-gray-400'
                }`}>
                    {supplement.priority === 'Essential' ? 'ضروری' : supplement.priority === 'Advanced' ? 'پیشرفته' : 'اختیاری'}
                </span>
                <button 
                    onClick={() => onToggle(supplement.id)}
                    className={`text-xs px-3 py-1 rounded-lg font-bold transition ${supplement.isActive ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                    {supplement.isActive ? 'فعال' : 'غیرفعال'}
                </button>
            </div>
        </div>
    );
};

const SupplementFormModal: React.FC<{ 
    initialData?: Supplement; 
    onSave: (s: Supplement) => void; 
    onClose: () => void; 
}> = ({ initialData, onSave, onClose }) => {
    const [form, setForm] = useState<Partial<Supplement>>(initialData || {
        name: '', type: 'Other', dosage: '', timing: [], priority: 'Optional', isActive: true
    });

    const handleTimingToggle = (t: SupplementTiming) => {
        const current = form.timing || [];
        const updated = current.includes(t) ? current.filter(x => x !== t) : [...current, t];
        setForm({ ...form, timing: updated });
    };

    const handleSubmit = () => {
        if (!form.name || !form.dosage) return alert("نام و دوز مصرفی الزامی است.");
        onSave({
            id: form.id || `cust_sup_${Date.now()}`,
            name: form.name!,
            type: form.type || 'Other',
            dosage: form.dosage!,
            timing: form.timing || [],
            priority: form.priority || 'Optional',
            isActive: form.isActive !== undefined ? form.isActive : true,
            notes: form.notes
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#1E293B] border border-gray-600 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Pill className="text-blue-400"/> {initialData ? 'ویرایش مکمل' : 'افزودن مکمل جدید'}</h3>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">نام مکمل</label>
                            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full input-styled p-2" placeholder="مثلا: Whey Protein"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">نوع</label>
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value as SupplementType})} className="w-full input-styled p-2">
                                {['Protein', 'Creatine', 'Pre-Workout', 'Amino', 'Vitamin', 'FatBurner', 'Health', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 block mb-1">دوز مصرفی</label>
                        <input value={form.dosage} onChange={e => setForm({...form, dosage: e.target.value})} className="w-full input-styled p-2" placeholder="مثلا: ۱ اسکوپ"/>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 block mb-2">زمان مصرف</label>
                        <div className="flex flex-wrap gap-2">
                            {['Morning', 'Pre-Workout', 'Intra-Workout', 'Post-Workout', 'Before Bed', 'With Meal'].map((t) => (
                                <button 
                                    key={t} 
                                    onClick={() => handleTimingToggle(t as SupplementTiming)}
                                    className={`px-3 py-1 rounded-full text-xs border transition ${form.timing?.includes(t as SupplementTiming) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-gray-600 text-gray-400'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">اولویت</label>
                            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})} className="w-full input-styled p-2">
                                <option value="Essential">Essential (ضروری)</option>
                                <option value="Optional">Optional (اختیاری)</option>
                                <option value="Advanced">Advanced (پیشرفته)</option>
                            </select>
                        </div>
                        <div className="flex items-center mt-6">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 mr-2"/>
                                <span className="text-sm text-gray-300">فعال (در حال مصرف)</span>
                            </label>
                        </div>
                    </div>

                    <button onClick={handleSubmit} className="w-full btn-primary py-3 rounded-xl font-bold mt-4">ذخیره</button>
                </div>
            </div>
        </div>
    );
};

const SupplementManager: React.FC<SupplementManagerProps> = ({ profile, updateProfile }) => {
    const [activeTab, setActiveTab] = useState<'tracker' | 'stack' | 'recommendations' | 'analytics'>('tracker');
    const [stack, setStack] = useState<Supplement[]>(profile.supplements || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Supplement | undefined>(undefined);
    const [recommendations, setRecommendations] = useState<Supplement[]>([]);

    useEffect(() => {
        if (activeTab === 'recommendations' && recommendations.length === 0) {
            setRecommendations(generateSupplementRecommendations(profile));
        }
    }, [activeTab, profile]);

    const updateStack = (newStack: Supplement[]) => {
        setStack(newStack);
        updateProfile({ ...profile, supplements: newStack });
    };

    const handleSave = (s: Supplement) => {
        const index = stack.findIndex(i => i.id === s.id);
        if (index >= 0) {
            const updated = [...stack];
            updated[index] = s;
            updateStack(updated);
        } else {
            updateStack([...stack, s]);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("حذف این مکمل؟")) {
            updateStack(stack.filter(s => s.id !== id));
        }
    };

    const handleToggle = (id: string) => {
        updateStack(stack.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    };

    const handleAddRecommendation = (rec: Supplement) => {
        const exists = stack.some(s => s.name === rec.name);
        if (exists) return alert("این مکمل در لیست شما موجود است.");
        
        const newSupp = { ...rec, id: `add_rec_${Date.now()}`, isActive: true };
        updateStack([...stack, newSupp]);
        alert(`${rec.name} به لیست شما اضافه شد.`);
    };

    const adherenceScore = calculateStackAdherence(stack);
    const goalScore = getGoalAlignment(stack, profile.goalType || 'Maintenance');
    
    const typeDistribution = stack.reduce((acc, curr) => {
        if (!curr.isActive) return acc;
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const chartData = Object.entries(typeDistribution).map(([name, value]) => ({ name, value }));
    const COLORS = ['#3b82f6', '#10b981', '#facc15', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="flex flex-col h-full space-y-6" dir="rtl">
            
            {/* Top Navigation */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 shrink-0 overflow-x-auto w-fit mx-auto md:mx-0">
                <button onClick={() => setActiveTab('tracker')} className={`px-6 py-2 rounded-lg font-bold transition flex items-center ${activeTab === 'tracker' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    <CheckCircle2 className="w-4 h-4 ml-2"/> چک‌لیست
                </button>
                <button onClick={() => setActiveTab('stack')} className={`px-6 py-2 rounded-lg font-bold transition flex items-center ${activeTab === 'stack' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    <Pill className="w-4 h-4 ml-2"/> استک من
                </button>
                <button onClick={() => setActiveTab('recommendations')} className={`px-6 py-2 rounded-lg font-bold transition flex items-center ${activeTab === 'recommendations' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    <Zap className="w-4 h-4 ml-2"/> مربی هوشمند
                </button>
                <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2 rounded-lg font-bold transition flex items-center ${activeTab === 'analytics' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    <Activity className="w-4 h-4 ml-2"/> آنالیز
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                
                {/* --- TRACKER --- */}
                {activeTab === 'tracker' && (
                    <SupplementHistoryWidget profile={profile} updateProfile={updateProfile} />
                )}

                {/* --- MY STACK --- */}
                {activeTab === 'stack' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center bg-[#1E293B] p-4 rounded-xl border border-gray-700">
                            <div>
                                <h3 className="font-bold text-white text-lg">مکمل‌های من</h3>
                                <p className="text-xs text-gray-400 mt-1">{stack.filter(s => s.isActive).length} فعال • {stack.length} کل</p>
                            </div>
                            <button onClick={() => { setEditingItem(undefined); setIsModalOpen(true); }} className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center shadow-lg">
                                <Plus size={16} className="mr-2"/> افزودن
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stack.map(supp => (
                                <SupplementCard 
                                    key={supp.id} 
                                    supplement={supp} 
                                    onToggle={handleToggle}
                                    onDelete={handleDelete}
                                    onEdit={(s) => { setEditingItem(s); setIsModalOpen(true); }}
                                />
                            ))}
                            {stack.length === 0 && (
                                <div className="col-span-full text-center py-20 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                                    <Pill size={48} className="mx-auto mb-4 opacity-30"/>
                                    <p>لیست مکمل شما خالی است.</p>
                                    <button onClick={() => setActiveTab('recommendations')} className="text-blue-400 hover:underline mt-2">مشاهده پیشنهادات هوشمند</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- RECOMMENDATIONS --- */}
                {activeTab === 'recommendations' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-6 rounded-2xl border border-purple-500/30 flex items-start gap-4">
                            <Zap className="text-yellow-400 w-12 h-12 shrink-0 bg-white/10 p-2 rounded-xl"/>
                            <div>
                                <h3 className="font-bold text-white text-lg">پیشنهادات هوشمند مربی (AI)</h3>
                                <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                                    لیست زیر مکمل‌های عمومی هستند که بر اساس علم تمرین برای هدف <span className="text-yellow-400 font-bold capitalize">{profile.goalType}</span> توصیه می‌شوند.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendations.map(rec => (
                                <div key={rec.id} className="bg-[#1E293B] p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white">{rec.name}</h4>
                                            {rec.priority === 'Essential' && <span className="text-[9px] bg-green-900/50 text-green-400 px-2 py-0.5 rounded border border-green-500/20">ضروری</span>}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{rec.type} • {rec.dosage}</p>
                                    </div>
                                    <button onClick={() => handleAddRecommendation(rec)} className="bg-white/5 hover:bg-blue-600 hover:text-white text-blue-400 p-2 rounded-lg transition border border-blue-500/30">
                                        <Plus size={20}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- ANALYTICS --- */}
                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                        {/* Scores */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="energetic-card p-4 flex flex-col justify-center items-center bg-blue-900/10 border-blue-500/30">
                                <span className="text-xs text-gray-400 font-bold uppercase">تطابق با هدف</span>
                                <div className="text-4xl font-black text-blue-400 mt-2">{goalScore}%</div>
                                <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                    <div className="bg-blue-500 h-full" style={{width: `${goalScore}%`}}></div>
                                </div>
                            </div>
                            <div className="energetic-card p-4 flex flex-col justify-center items-center bg-green-900/10 border-green-500/30">
                                <span className="text-xs text-gray-400 font-bold uppercase">پوشش ضروریات</span>
                                <div className="text-4xl font-black text-green-400 mt-2">{adherenceScore}%</div>
                                <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                    <div className="bg-green-500 h-full" style={{width: `${adherenceScore}%`}}></div>
                                </div>
                            </div>
                        </div>

                        {/* Distribution Chart */}
                        <div className="energetic-card p-6 flex flex-col items-center">
                            <h3 className="font-bold text-white mb-4">توزیع نوع مکمل‌ها</h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{backgroundColor: '#1f2937', borderRadius: '8px', border: 'none'}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                {chartData.map((entry, index) => (
                                    <div key={index} className="flex items-center text-[10px] text-gray-400">
                                        <div className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                        {entry.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Insights */}
                        <div className="energetic-card p-6 bg-yellow-900/10 border-yellow-500/20 lg:col-span-2">
                            <h3 className="font-bold text-yellow-400 flex items-center mb-3"><Info className="mr-2"/> نکات بهینه‌سازی</h3>
                            <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                                {goalScore < 50 && <li>استک شما با هدف {profile.goalType} هماهنگی کمی دارد. پیشنهادات هوشمند را بررسی کنید.</li>}
                                {adherenceScore < 100 && <li>برخی از مکمل‌های ضروری (مانند مولتی‌ویتامین یا امگا-۳) در لیست فعال شما نیستند.</li>}
                                <li>زمان‌بندی مصرف کراتین (بعد از تمرین) برای جذب بهتر توصیه می‌شود.</li>
                                {stack.filter(s => s.type === 'Pre-Workout').length > 1 && <li>هشدار: مصرف همزمان چند مکمل Pre-Workout یا کافئین‌دار ممکن است باعث بی‌خوابی شود.</li>}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <SupplementFormModal 
                    initialData={editingItem} 
                    onSave={handleSave} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default SupplementManager;
