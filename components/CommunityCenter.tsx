import React, { useState, useEffect } from 'react';
import { UserProfile, DailyLog, AppView, Challenge, Badge, SocialPost, League } from '../types';
import { generatePersonalizedChallenge } from '../services/geminiService';
import { 
  Trophy, Target, Shield, Star, Users, Zap, Award, Flame, 
  MessageCircle, Heart, Share2, Plus, ArrowRight, Lock, Loader2, CheckCircle2, Sparkles
} from 'lucide-react';

interface CommunityCenterProps {
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  logs: DailyLog[];
  setCurrentView: (view: AppView) => void;
}

// --- MOCK DATA ---
const MOCK_SOCIAL_POSTS: SocialPost[] = [
    { id: '1', authorName: 'Ali Rezaei', content: 'Just hit a new PR on deadlift! 200kg! 🚀', type: 'Achievement', timestamp: '2h ago', likes: 24, comments: 5, isLikedByMe: false },
    { id: '2', authorName: 'Sarah K.', content: 'Completed the "Morning Run" challenge. Feeling great.', type: 'Workout', timestamp: '5h ago', likes: 12, comments: 2, isLikedByMe: true },
    { id: '3', authorName: 'FitPro Bot', content: 'New League Season starts in 3 days! Get ready.', type: 'Status', timestamp: '1d ago', likes: 156, comments: 0, isLikedByMe: false },
];

const PREDEFINED_CHALLENGES: Challenge[] = [
    { id: 'c1', title: 'قهرمان استقامت', description: '۵ روز تمرین در یک هفته', type: 'Consistency', targetValue: 5, currentValue: 0, unit: 'روز', startDate: '', endDate: '', status: 'NotJoined', rewardXP: 500, participantsCount: 1240, isAiGenerated: false },
    { id: 'c2', title: 'سحرخیز باش', description: '۳ روز بیداری قبل از ۷ صبح (ثبت خواب)', type: 'Custom', targetValue: 3, currentValue: 0, unit: 'روز', startDate: '', endDate: '', status: 'NotJoined', rewardXP: 300, participantsCount: 850, isAiGenerated: false },
];

const LEADERBOARD_DATA = [
    { rank: 1, name: 'Amir H.', xp: 15400, tier: 'Elite' },
    { rank: 2, name: 'Negar V.', xp: 14200, tier: 'Pro' },
    { rank: 3, name: 'Reza M.', xp: 13800, tier: 'Pro' },
    { rank: 4, name: 'You', xp: 0, tier: 'Amateur' }, // Will update dynamically
    { rank: 5, name: 'Kaveh S.', xp: 9500, tier: 'Advanced' },
];

// --- SUB-COMPONENTS ---

const LeaderboardWidget: React.FC<{ userXP: number; userTier: string }> = ({ userXP, userTier }) => {
    // Merge user into leaderboard and sort
    const data = [...LEADERBOARD_DATA];
    const userIndex = data.findIndex(d => d.name === 'You');
    if (userIndex !== -1) {
        data[userIndex].xp = userXP;
        data[userIndex].tier = userTier;
    }
    const sorted = data.sort((a,b) => b.xp - a.xp);

    return (
        <div className="energetic-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Trophy className="mr-2 text-yellow-400"/> جدول رده‌بندی (League Ranking)</h3>
            <div className="space-y-2">
                {sorted.map((entry, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${entry.name === 'You' ? 'bg-blue-900/30 border-blue-500/50' : 'bg-black/20 border-white/5'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : idx === 2 ? 'bg-orange-700 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                {idx + 1}
                            </div>
                            <div>
                                <span className={`font-bold ${entry.name === 'You' ? 'text-blue-400' : 'text-white'}`}>{entry.name}</span>
                                <span className="text-[10px] block text-gray-500">{entry.tier} League</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="font-mono font-bold text-white">{entry.xp.toLocaleString()}</span>
                            <span className="text-[10px] text-gray-500 block">XP</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ChallengeCard: React.FC<{ 
    challenge: Challenge; 
    onJoin: (id: string) => void; 
    progress?: number; // Calculated progress from logs
}> = ({ challenge, onJoin, progress = 0 }) => {
    const isJoined = challenge.status === 'Active' || challenge.status === 'Completed';
    const percent = Math.min(100, Math.round((progress / challenge.targetValue) * 100));

    return (
        <div className={`p-4 rounded-xl border relative overflow-hidden transition-all ${isJoined ? 'bg-blue-900/10 border-blue-500/30' : 'bg-black/20 border-white/10 hover:border-white/30'}`}>
            {challenge.isAiGenerated && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">AI Recommended</div>
            )}
            
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-white">{challenge.title}</h4>
                <span className="text-xs text-yellow-400 font-bold flex items-center"><Zap size={12} className="mr-1"/> {challenge.rewardXP} XP</span>
            </div>
            
            <p className="text-xs text-gray-400 mb-4">{challenge.description}</p>
            
            {isJoined ? (
                <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                        <span>پیشرفت</span>
                        <span>{progress} / {challenge.targetValue} {challenge.unit}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all duration-1000" style={{width: `${percent}%`}}></div>
                    </div>
                    {percent >= 100 && (
                        <div className="mt-2 text-center text-green-400 text-xs font-bold flex items-center justify-center">
                            <CheckCircle2 size={12} className="mr-1"/> تکمیل شد!
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] text-gray-500 flex items-center"><Users size={10} className="mr-1"/> {challenge.participantsCount} شرکت‌کننده</span>
                    <button onClick={() => onJoin(challenge.id)} className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition font-bold">
                        شرکت می‌کنم
                    </button>
                </div>
            )}
        </div>
    );
};

const TrophyRoom: React.FC<{ badges: Badge[] }> = ({ badges }) => {
    // Ensure we have some badges to show, even if locked
    const displayBadges: Badge[] = [
        ...badges,
        { id: 'locked1', title: 'Early Bird', description: 'Complete 10 morning workouts', iconName: 'Sun', tier: 'Silver', isLocked: true, category: 'Consistency' },
        { id: 'locked2', title: 'Heavy Lifter', description: 'Lift 10,000kg total volume', iconName: 'Dumbbell', tier: 'Gold', isLocked: true, category: 'Training' },
        { id: 'locked3', title: 'Social Butterfly', description: 'Add 5 friends', iconName: 'Users', tier: 'Bronze', isLocked: true, category: 'Social' },
    ];

    return (
        <div className="energetic-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Award className="mr-2 text-purple-400"/> تالار افتخارات (Trophy Room)</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {displayBadges.map((badge) => (
                    <div key={badge.id} className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 text-center border transition group ${badge.isLocked ? 'bg-black/20 border-white/5 opacity-50' : 'bg-gradient-to-br from-white/5 to-white/10 border-white/20 hover:border-yellow-500/50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${badge.isLocked ? 'bg-gray-800' : badge.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' : badge.tier === 'Silver' ? 'bg-gray-400/20 text-gray-300' : 'bg-orange-700/20 text-orange-400'}`}>
                            {badge.isLocked ? <Lock size={20}/> : <Star size={24} fill="currentColor" />}
                        </div>
                        <span className="text-xs font-bold text-white line-clamp-1">{badge.title}</span>
                        <span className="text-[10px] text-gray-500 mt-1">{badge.tier}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SocialFeed: React.FC = () => {
    return (
        <div className="energetic-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Users className="mr-2 text-green-400"/> فعالیت دوستان</h3>
            <div className="space-y-4">
                {MOCK_SOCIAL_POSTS.map(post => (
                    <div key={post.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">
                                    {post.authorName.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{post.authorName}</h4>
                                    <span className="text-xs text-gray-500">{post.timestamp}</span>
                                </div>
                            </div>
                            {post.type === 'Achievement' && <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">Achievement</span>}
                        </div>
                        <p className="text-sm text-gray-300 mb-3">{post.content}</p>
                        <div className="flex gap-4 text-gray-500 text-xs">
                            <button className="flex items-center hover:text-red-400 transition"><Heart size={14} className="mr-1"/> {post.likes}</button>
                            <button className="flex items-center hover:text-blue-400 transition"><MessageCircle size={14} className="mr-1"/> {post.comments}</button>
                            <button className="flex items-center hover:text-white transition"><Share2 size={14} className="mr-1"/> Share</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const CommunityCenter: React.FC<CommunityCenterProps> = ({ profile, updateProfile, logs, setCurrentView }) => {
    const [activeTab, setActiveTab] = useState<'hub' | 'challenges' | 'leaderboard'>('hub');
    const [challenges, setChallenges] = useState<Challenge[]>(profile.activeChallenges.length > 0 ? profile.activeChallenges : PREDEFINED_CHALLENGES);
    const [isGenerating, setIsGenerating] = useState(false);

    // AI Generator Handler
    const handleGenerateChallenge = async () => {
        setIsGenerating(true);
        const newChallenge = await generatePersonalizedChallenge(logs, profile);
        if (newChallenge) {
            // Add to list and auto-join
            const joinedChallenge = { ...newChallenge, status: 'Active' as const };
            const updated = [joinedChallenge, ...challenges];
            setChallenges(updated);
            updateProfile({ ...profile, activeChallenges: updated });
        } else {
            alert("فعلا چالش جدیدی موجود نیست.");
        }
        setIsGenerating(false);
    };

    const handleJoinChallenge = (id: string) => {
        const updated = challenges.map(c => c.id === id ? { ...c, status: 'Active' as const } : c);
        setChallenges(updated);
        updateProfile({ ...profile, activeChallenges: updated });
    };

    // Calculate dynamic progress for active challenges
    const getProgress = (challenge: Challenge) => {
        if (challenge.status === 'NotJoined') return 0;
        
        // Simple logic: Count workouts in last 7 days for demo
        // In real app, this would filter logs between startDate and endDate
        if (challenge.type === 'Consistency' || challenge.type === 'WorkoutCount') {
            const recentLogs = logs.slice(-7);
            return recentLogs.filter(l => l.workoutScore > 0).length;
        }
        return 0; // Default
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Top Nav */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 shrink-0 overflow-x-auto">
                {[
                    { id: 'hub', icon: Users, label: 'هاب اجتماعی' },
                    { id: 'challenges', icon: Target, label: 'چالش‌ها' },
                    { id: 'leaderboard', icon: Trophy, label: 'رده‌بندی' },
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

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {activeTab === 'hub' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                        {/* Profile Summary Card */}
                        <div className="col-span-1 lg:col-span-2 bg-gradient-to-r from-gray-900 via-indigo-900/30 to-gray-900 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-black text-white border-4 border-gray-800 shadow-lg">
                                    {profile.level}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                                    <p className="text-sm text-gray-400">{profile.sportLevel} • {profile.xp.toLocaleString()} XP</p>
                                </div>
                            </div>
                            <div className="text-right hidden md:block">
                                <div className="text-xs text-gray-500">لیگ فعلی</div>
                                <div className="text-lg font-bold text-yellow-400 flex items-center gap-1 justify-end"><Shield size={16}/> Gold League</div>
                            </div>
                        </div>

                        <SocialFeed />
                        <TrophyRoom badges={profile.badges} />
                    </div>
                )}

                {activeTab === 'challenges' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* AI Challenge Generator */}
                        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6 rounded-2xl border border-purple-500/30 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white text-lg flex items-center"><Sparkles className="mr-2 text-purple-400"/> چالش اختصاصی هوش مصنوعی</h3>
                                <p className="text-sm text-gray-400 mt-1">بر اساس عملکرد هفته گذشته، یک چالش جدید دریافت کنید.</p>
                            </div>
                            <button onClick={handleGenerateChallenge} disabled={isGenerating} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-sm flex items-center transition">
                                {isGenerating ? <Loader2 className="animate-spin"/> : 'ساخت چالش'}
                            </button>
                        </div>

                        <h3 className="font-bold text-white text-lg">چالش‌های فعال و پیشنهادی</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {challenges.map(c => (
                                <ChallengeCard 
                                    key={c.id} 
                                    challenge={c} 
                                    onJoin={handleJoinChallenge} 
                                    progress={getProgress(c)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'leaderboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                        <div className="lg:col-span-2">
                            <LeaderboardWidget userXP={profile.xp} userTier={profile.sportLevel || 'Amateur'} />
                        </div>
                        <div className="space-y-4">
                            <div className="energetic-card p-6 bg-yellow-900/10 border-yellow-500/30">
                                <h4 className="font-bold text-yellow-400 mb-2">قوانین لیگ</h4>
                                <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
                                    <li>هر فصل لیگ ۳۰ روز طول می‌کشد.</li>
                                    <li>۳ نفر برتر به لیگ بالاتر صعود می‌کنند.</li>
                                    <li>XP بر اساس امتیاز تمرین و پایبندی محاسبه می‌شود.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityCenter;