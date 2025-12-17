
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyLog, AppView, Quest, RewardItem, Badge, XPActivity, Challenge } from '../types';
import { generateGamifiedQuests } from '../services/geminiService';
import { 
  Trophy, Star, Coins, Zap, CheckCircle2, Lock, ShoppingBag, 
  Gift, Crown, Sparkles, User, Palette, Shield, Flame, History, Plus, Edit2, X, Target
} from 'lucide-react';

interface RewardsCenterProps {
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  logs: DailyLog[];
  setCurrentView: (view: AppView) => void;
}

// --- MOCK REWARD ITEMS ---
const STORE_ITEMS: RewardItem[] = [
    { id: 'item_1', name: 'تم نئون (Neon)', description: 'ظاهر اپلیکیشن را به حالت نئونی تغییر دهید.', cost: 500, iconName: 'Palette', category: 'Theme', isPurchased: false },
    { id: 'item_2', name: 'تم طلایی (Gold)', description: 'ظاهر لوکس طلایی برای پروفایل شما.', cost: 800, iconName: 'Crown', category: 'Theme', isPurchased: false },
    { id: 'item_3', name: 'قاب پروفایل قهرمان', description: 'یک قاب ویژه دور عکس پروفایل شما.', cost: 300, iconName: 'User', category: 'Avatar', isPurchased: false },
    { id: 'item_4', name: 'کد تخفیف ۱۰٪ مکمل', description: 'برای خرید از فروشگاه مکمل پرو.', cost: 1000, iconName: 'ShoppingBag', category: 'Discount', isPurchased: false },
    { id: 'item_5', name: 'روز تقلب مجاز', description: 'یک روز بدون کاهش استریک (Streak Freeze).', cost: 200, iconName: 'Shield', category: 'Feature', isPurchased: false },
];

// --- SUB-COMPONENTS ---

const GamificationHeader: React.FC<{ profile: UserProfile }> = ({ profile }) => {
    const level = Math.floor(profile.xp / 1000) + 1;
    const progress = (profile.xp % 1000) / 10; // 0-100%
    const nextLevelXP = 1000 - (profile.xp % 1000);

    return (
        <div className="energetic-card p-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-purple-500/30">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* Level Circle */}
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" fill="transparent" stroke="#1f2937" strokeWidth="8"/>
                        <circle 
                            cx="48" cy="48" r="40" 
                            fill="transparent" 
                            stroke="#8b5cf6" 
                            strokeWidth="8" 
                            strokeDasharray={251} 
                            strokeDashoffset={251 - (251 * progress) / 100} 
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-xs text-purple-300 font-bold">سطح</span>
                        <span className="text-3xl font-black text-white">{level}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 w-full">
                    <h2 className="text-2xl font-black text-white mb-2">{profile.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
                        <span className="flex items-center"><Star className="w-4 h-4 text-yellow-400 mr-1"/> {profile.xp.toLocaleString()} XP</span>
                        <span className="flex items-center"><Coins className="w-4 h-4 text-yellow-500 mr-1"/> {profile.coins.toLocaleString()} سکه</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000" style={{width: `${progress}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">{nextLevelXP} XP تا سطح بعدی</p>
                </div>

                {/* Coin Wallet */}
                <div className="bg-black/30 p-4 rounded-xl border border-yellow-500/20 text-center min-w-[120px]">
                    <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-bounce"/>
                    <div className="text-2xl font-black text-yellow-300">{profile.coins}</div>
                    <div className="text-xs text-yellow-600 font-bold">موجودی کیف پول</div>
                </div>
            </div>
        </div>
    );
};

const XPHistoryLog: React.FC<{ xpHistory: XPActivity[] }> = ({ xpHistory }) => {
    return (
        <div className="energetic-card p-6 h-96 overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center"><History className="mr-2 text-blue-400"/> تاریخچه امتیازات (XP Log)</h3>
            <div className="space-y-2">
                {xpHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">هنوز فعالیتی ثبت نشده است.</p>
                ) : (
                    xpHistory.slice().reverse().map((activity) => (
                        <div key={activity.id} className="flex justify-between items-center p-3 bg-black/20 rounded-lg border border-white/5">
                            <div>
                                <span className="text-sm text-white font-bold block">{activity.activity}</span>
                                <span className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString('fa-IR')}</span>
                            </div>
                            <span className="text-green-400 font-mono font-bold">+{activity.xp} XP</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const ChallengeBuilder: React.FC<{ onSave: (challenge: Challenge) => void }> = ({ onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [target, setTarget] = useState(1);
    const [unit, setUnit] = useState('روز');
    const [reward, setReward] = useState(100);

    const handleCreate = () => {
        if (!title) return;
        const newChallenge: Challenge = {
            id: `cust_ch_${Date.now()}`,
            title,
            description: description || 'چالش شخصی',
            type: 'Custom',
            targetValue: target,
            currentValue: 0,
            unit,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Active',
            rewardXP: reward,
            participantsCount: 1,
            isAiGenerated: false
        };
        onSave(newChallenge);
        setTitle('');
        setDescription('');
    };

    return (
        <div className="energetic-card p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Target className="mr-2 text-red-400"/> ساخت چالش شخصی</h3>
            <div className="space-y-4">
                <input placeholder="عنوان چالش (مثلا: هفته بدون قند)" value={title} onChange={e => setTitle(e.target.value)} className="w-full input-styled p-3" />
                <textarea placeholder="توضیحات..." value={description} onChange={e => setDescription(e.target.value)} className="w-full input-styled p-3 h-20 resize-none" />
                <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-xs text-gray-400 block mb-1">هدف</label><input type="number" value={target} onChange={e => setTarget(+e.target.value)} className="w-full input-styled p-2 text-center"/></div>
                    <div><label className="text-xs text-gray-400 block mb-1">واحد</label><input value={unit} onChange={e => setUnit(e.target.value)} className="w-full input-styled p-2 text-center"/></div>
                    <div><label className="text-xs text-gray-400 block mb-1">پاداش (XP)</label><input type="number" value={reward} onChange={e => setReward(+e.target.value)} className="w-full input-styled p-2 text-center"/></div>
                </div>
                <button onClick={handleCreate} className="w-full btn-primary py-2 font-bold mt-2">ایجاد چالش</button>
            </div>
        </div>
    );
};

const BadgeEditorModal: React.FC<{ badge: Badge; onClose: () => void; onSave: (id: string, name: string) => void }> = ({ badge, onClose, onSave }) => {
    const [name, setName] = useState(badge.customName || badge.title);
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">ویرایش نشان افتخار</h3>
                    <button onClick={onClose}><X className="text-gray-400"/></button>
                </div>
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center border-2 border-yellow-500 text-yellow-400">
                        <Star size={40} fill="currentColor"/>
                    </div>
                </div>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full input-styled p-3 mb-4" placeholder="نام دلخواه..." />
                <button onClick={() => { onSave(badge.id, name); onClose(); }} className="w-full btn-primary py-2 font-bold">ذخیره تغییرات</button>
            </div>
        </div>
    );
};

const QuestBoard: React.FC<{ 
    quests: Quest[]; 
    onClaim: (questId: string) => void; 
    onRefresh: () => void;
}> = ({ quests, onClaim, onRefresh }) => {
    return (
        <div className="energetic-card p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center"><Zap className="mr-2 text-blue-400"/> ماموریت‌های روزانه</h3>
                <button onClick={onRefresh} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition">بروزرسانی AI</button>
            </div>

            <div className="space-y-4">
                {quests.map(quest => (
                    <div key={quest.id} className={`p-4 rounded-xl border flex justify-between items-center transition-all ${quest.isCompleted ? 'bg-green-900/10 border-green-500/30' : 'bg-black/20 border-white/5'}`}>
                        <div>
                            <h4 className={`font-bold ${quest.isCompleted ? 'text-green-400' : 'text-white'}`}>{quest.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{quest.description}</p>
                            <div className="flex gap-3 mt-2 text-xs font-mono">
                                <span className="text-purple-300">+{quest.rewardXP} XP</span>
                                <span className="text-yellow-300">+{quest.rewardCoins} Coins</span>
                            </div>
                        </div>
                        
                        <div>
                            {quest.isClaimed ? (
                                <span className="text-gray-500 text-xs font-bold flex items-center"><CheckCircle2 size={16} className="mr-1"/> دریافت شد</span>
                            ) : quest.isCompleted ? (
                                <button onClick={() => onClaim(quest.id)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg animate-pulse">
                                    دریافت جایزه
                                </button>
                            ) : (
                                <div className="text-gray-500 text-xs text-center px-4">
                                    {Math.round((quest.progress / quest.target) * 100)}%
                                    <div className="w-16 h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{width: `${(quest.progress / quest.target) * 100}%`}}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RewardStore: React.FC<{ 
    inventory: RewardItem[]; 
    coins: number; 
    onPurchase: (item: RewardItem) => void; 
}> = ({ inventory, coins, onPurchase }) => {
    
    const isOwned = (itemId: string) => inventory.some(i => i.id === itemId);

    return (
        <div className="energetic-card p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center"><ShoppingBag className="mr-2 text-yellow-400"/> فروشگاه جوایز</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STORE_ITEMS.map(item => {
                    const owned = isOwned(item.id);
                    const canAfford = coins >= item.cost;
                    
                    return (
                        <div key={item.id} className={`p-4 rounded-xl border flex flex-col justify-between h-full transition ${owned ? 'bg-black/40 border-gray-700 opacity-70' : 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-600 hover:border-yellow-500/50'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-black/30 p-3 rounded-lg text-white">
                                    {item.iconName === 'Crown' ? <Crown size={20} className="text-yellow-400"/> : 
                                     item.iconName === 'Palette' ? <Palette size={20} className="text-purple-400"/> : 
                                     item.iconName === 'Shield' ? <Shield size={20} className="text-green-400"/> : 
                                     <Gift size={20} className="text-blue-400"/>}
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${item.category === 'Theme' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>{item.category}</span>
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-white text-sm">{item.name}</h4>
                                <p className="text-xs text-gray-400 mt-1 mb-4 h-8">{item.description}</p>
                            </div>

                            {owned ? (
                                <button disabled className="w-full bg-gray-700 text-gray-400 font-bold py-2 rounded-lg text-xs cursor-default">خریداری شده</button>
                            ) : (
                                <button 
                                    onClick={() => onPurchase(item)} 
                                    disabled={!canAfford}
                                    className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center transition ${canAfford ? 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-lg' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                >
                                    {canAfford ? 'خرید' : 'سکه ناکافی'} 
                                    <span className="ml-2 bg-black/20 px-1.5 rounded flex items-center">{item.cost} <Coins size={10} className="ml-1"/></span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const BadgeVault: React.FC<{ badges: Badge[]; onEdit: (badge: Badge) => void }> = ({ badges, onEdit }) => {
    // Merge earned badges with placeholder locked ones for visual completeness
    const allBadges: Badge[] = [
        ...badges,
        { id: 'l1', title: '50 Workouts', description: 'Complete 50 workouts', tier: 'Gold', isLocked: true, category: 'Training', iconName: 'Dumbbell' },
        { id: 'l2', title: 'Early Riser', description: 'Train before 7AM', tier: 'Silver', isLocked: true, category: 'Consistency', iconName: 'Sun' },
        { id: 'l3', title: 'Social Star', description: 'Share 10 posts', tier: 'Bronze', isLocked: true, category: 'Social', iconName: 'Share' },
    ];

    return (
        <div className="energetic-card p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center"><Trophy className="mr-2 text-red-400"/> گنجینه افتخارات</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {allBadges.map((badge, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => !badge.isLocked && onEdit(badge)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border relative group transition-all hover:scale-105 cursor-pointer ${badge.isLocked ? 'bg-black/30 border-white/5 opacity-50 grayscale cursor-default' : 'bg-gradient-to-br from-white/5 to-white/10 border-white/20 hover:border-yellow-500/50'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-lg ${badge.isLocked ? 'bg-gray-800' : badge.tier === 'Gold' ? 'bg-yellow-500 text-black' : badge.tier === 'Silver' ? 'bg-gray-300 text-black' : 'bg-orange-700 text-white'}`}>
                            {badge.isLocked ? <Lock size={20}/> : <Star size={24} fill="currentColor" />}
                        </div>
                        <span className="text-[10px] font-bold text-white line-clamp-1">{badge.customName || badge.title}</span>
                        {!badge.isLocked && <span className="text-[9px] text-gray-400 mt-1">{badge.tier}</span>}
                        {!badge.isLocked && <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"><Edit2 size={10} className="text-gray-400"/></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const RewardsCenter: React.FC<RewardsCenterProps> = ({ profile, updateProfile, logs, setCurrentView }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'history'>('overview');
    const [quests, setQuests] = useState<Quest[]>(profile.activeQuests || []);
    const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
    
    // Initial Load & Refresh
    const loadQuests = async () => {
        if (quests.length === 0 || quests.every(q => q.isClaimed)) {
            const newQuests = await generateGamifiedQuests(logs, profile);
            setQuests(newQuests);
            updateProfile({ ...profile, activeQuests: newQuests });
        } else {
            const todayLog = logs.find(l => l.date === new Date().toLocaleDateString('fa-IR'));
            if (todayLog) {
                const updated = quests.map(q => {
                    if (q.isCompleted) return q;
                    let newProgress = q.progress;
                    if (q.title.includes('فعالیت') && todayLog.workoutScore > 0) newProgress = 1;
                    if (q.title.includes('خواب') && (todayLog.sleepHours || 0) >= q.target) newProgress = q.target;
                    
                    return { ...q, progress: newProgress, isCompleted: newProgress >= q.target };
                });
                setQuests(updated);
            }
        }
    };

    useEffect(() => {
        loadQuests();
    }, [logs]); 

    const handleClaimQuest = (questId: string) => {
        const quest = quests.find(q => q.id === questId);
        if (!quest || !quest.isCompleted || quest.isClaimed) return;

        alert(`جایزه دریافت شد! +${quest.rewardXP} XP, +${quest.rewardCoins} سکه`);

        // Log XP Activity
        const newActivity: XPActivity = {
            id: Date.now().toString(),
            activity: `Quest: ${quest.title}`,
            xp: quest.rewardXP,
            date: new Date().toISOString(),
            category: 'Achievement'
        };

        updateProfile({
            ...profile,
            xp: profile.xp + quest.rewardXP,
            coins: profile.coins + quest.rewardCoins,
            activeQuests: quests.map(q => q.id === questId ? { ...q, isClaimed: true } : q),
            xpHistory: [...(profile.xpHistory || []), newActivity]
        });
        
        setQuests(prev => prev.map(q => q.id === questId ? { ...q, isClaimed: true } : q));
    };

    const handlePurchase = (item: RewardItem) => {
        if (profile.coins < item.cost) return;
        if (confirm(`آیا از خرید "${item.name}" به قیمت ${item.cost} سکه اطمینان دارید؟`)) {
            updateProfile({
                ...profile,
                coins: profile.coins - item.cost,
                inventory: [...(profile.inventory || []), { ...item, isPurchased: true }]
            });
            alert("خرید با موفقیت انجام شد!");
        }
    };

    const handleCreateChallenge = (challenge: Challenge) => {
        updateProfile({
            ...profile,
            activeChallenges: [...(profile.activeChallenges || []), challenge]
        });
        alert('چالش شخصی ساخته شد!');
    };

    const handleUpdateBadgeName = (id: string, name: string) => {
        const updatedBadges = profile.badges.map(b => b.id === id ? { ...b, customName: name } : b);
        updateProfile({ ...profile, badges: updatedBadges });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in pb-20">
            <GamificationHeader profile={profile} />
            
            {/* Navigation Tabs */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 shrink-0 overflow-x-auto">
                {[
                    { id: 'overview', icon: Trophy, label: 'نمای کلی' },
                    { id: 'challenges', icon: Target, label: 'چالش‌ها' },
                    { id: 'history', icon: History, label: 'تاریخچه XP' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`flex-1 min-w-[120px] py-3 rounded-lg font-bold flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <tab.icon className="w-4 h-4 ml-2" /> {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <QuestBoard quests={quests} onClaim={handleClaimQuest} onRefresh={loadQuests} />
                        <BadgeVault badges={profile.badges} onEdit={setEditingBadge} />
                    </div>
                    <RewardStore inventory={profile.inventory || []} coins={profile.coins} onPurchase={handlePurchase} />
                </>
            )}

            {activeTab === 'challenges' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChallengeBuilder onSave={handleCreateChallenge} />
                    {/* List active custom challenges here if needed */}
                </div>
            )}

            {activeTab === 'history' && (
                <XPHistoryLog xpHistory={profile.xpHistory || []} />
            )}

            {editingBadge && (
                <BadgeEditorModal badge={editingBadge} onClose={() => setEditingBadge(null)} onSave={handleUpdateBadgeName} />
            )}
        </div>
    );
};

export default RewardsCenter;
