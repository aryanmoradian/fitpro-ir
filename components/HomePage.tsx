
import React, { useState, useEffect, useRef } from 'react';
import { 
    BarChart2, Dumbbell, Apple, Trophy, TrendingUp, 
    Link as LinkIcon, ShieldCheck, Users, CheckCircle2, ArrowRight,
    Activity, Zap, Brain, MessageSquare, Video, Search, Mic, Volume2, VolumeX,
    Fingerprint, LogIn, ChevronRight, Hexagon, Crown, Feather, Sun
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import MobileMenu from './MobileMenu';
import FloatingCallButton from './FloatingCallButton';
import FPBadge from './FPBadge';

interface HomePageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const MODULES = [
    { id: 'training', label: 'مرکز تمرین (Training)', icon: Dumbbell, status: 'ONLINE' },
    { id: 'nutrition', label: 'مرکز تغذیه (Nutrition)', icon: Apple, status: 'ONLINE' },
    { id: 'health', label: 'مرکز سلامت (Health)', icon: Activity, status: 'ACTIVE' },
    { id: 'supplements', label: 'مدیریت مکمل (Supplements)', icon: Zap, status: 'READY' },
    { id: 'records', label: 'رکورد و قدرت (Records)', icon: Trophy, status: 'TRACKING' },
    { id: 'bio', label: 'تحلیل زیستی (Bio Analysis)', icon: Brain, status: 'AI-SYNC' },
    { id: 'scanner', label: 'اسکنر غذا (Food Scanner)', icon: Search, status: 'OPTICAL' },
    { id: 'videos', label: 'ویدیوها (Education)', icon: Video, status: 'STREAM' },
    { id: 'coach', label: 'مربی هوشمند (Smart Coach)', icon: Users, status: 'CONNECTED' },
    { id: 'messages', label: 'پیام‌ها (Messages)', icon: MessageSquare, status: 'SECURE' },
    { id: 'elite', label: 'عضویت ویژه (Elite)', icon: ShieldCheck, status: 'PREMIUM' },
    { id: 'planner', label: 'طراح هوشمند (AI Planner)', icon: BarChart2, status: 'GENERATING' },
];

const HeritageHero: React.FC<{ onLogin: () => void; onRegister: () => void }> = ({ onLogin, onRegister }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [textVisible, setTextVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setTextVisible(true), 500);
    }, []);

    const handleSpeak = () => {
        if (!('speechSynthesis' in window)) return;
        
        window.speechSynthesis.cancel();

        const title = "به نام خداوند جان و خرد. کزین برتر اندیشه بر نگذرد.";
        const body = "به اکوسیستم فیت پرو خوش آمدید. میراثی از قدرت، دانشی از آینده. اینجا، پهلوانان ساخته می‌شوند.";
        
        const utterance = new SpeechSynthesisUtterance(`${title} ... ${body}`);
        utterance.lang = 'fa-IR';
        utterance.rate = 0.85; // Slower, more epic pace
        utterance.pitch = 0.9; // Slightly deeper
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    return (
        <section className="relative bg-[#05080F] text-white min-h-[90vh] flex flex-col justify-center pt-24 pb-12 overflow-hidden border-b-4 border-[#B45309]">
            
            {/* --- ANCIENT ATMOSPHERE BACKGROUND --- */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] opacity-10 pointer-events-none"></div>
            {/* Golden Sun Glow */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            
            {/* Tactical Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(180,83,9,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(180,83,9,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>

            <div className="container max-w-6xl mx-auto px-4 relative z-10">
                
                {/* 1. HERO CONTENT CORE */}
                <div className="relative flex flex-col items-center text-center">
                    
                    {/* Achaemenid Wing Motif (CSS/SVG Hybrid) */}
                    <div className="flex items-center justify-center gap-4 mb-8 opacity-80">
                        <div className="h-[2px] w-12 md:w-32 bg-gradient-to-l from-amber-500 to-transparent"></div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20"></div>
                            <div className="border-2 border-amber-500/50 p-3 rounded-full bg-[#0F172A] shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                                <Crown size={32} className="text-amber-400" />
                            </div>
                        </div>
                        <div className="h-[2px] w-12 md:w-32 bg-gradient-to-r from-amber-500 to-transparent"></div>
                    </div>

                    {/* Epic Poetry Header */}
                    <h1 className={`text-3xl md:text-5xl font-black tracking-tight mb-6 font-heading text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600 transition-all duration-1000 transform ${textVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        به نام خداوند جان و خرد
                    </h1>

                    {/* Sub-headline */}
                    <h2 className={`text-xl md:text-2xl font-bold text-gray-300 mb-8 max-w-3xl leading-relaxed transition-all duration-1000 delay-300 ${textVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <span className="text-cyan-400">دانش مدرن</span> در کالبد <span className="text-amber-500">میراث باستان</span>
                        <br/>
                        <span className="text-sm md:text-lg text-gray-500 mt-2 block font-light">
                            اکوسیستم جامع فیت پرو: جایی که افسانه پهلوانی با علم ورزش یکی می‌شود.
                        </span>
                    </h2>

                    {/* Audio Interaction */}
                    <button 
                        onClick={handleSpeak}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all mb-12 group ${isSpeaking ? 'bg-amber-900/30 border-amber-500 text-amber-400' : 'bg-white/5 border-white/10 text-gray-400 hover:border-amber-500/50 hover:text-amber-200'}`}
                    >
                        {isSpeaking ? <Volume2 size={16} className="animate-pulse"/> : <Feather size={16} />}
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {isSpeaking ? 'در حال روایت...' : 'شنیدن پیام (Wisdom)'}
                        </span>
                    </button>

                    {/* 2. MODULE HIGHLIGHTS (Persian Pillars) */}
                    <div className="w-full max-w-5xl mb-16">
                         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {MODULES.slice(0, 12).map((mod, idx) => (
                                <div 
                                    key={mod.id}
                                    className="group relative bg-[#0F172A] border border-gray-800 hover:border-amber-500/50 p-3 rounded-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                                    style={{ transitionDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex flex-col items-center text-center relative z-10">
                                        <mod.icon className="w-6 h-6 text-gray-500 group-hover:text-amber-400 mb-2 transition-colors" />
                                        <span className="text-[10px] text-gray-300 font-bold leading-tight group-hover:text-white">{mod.label}</span>
                                    </div>
                                    {/* Golden Shine Effect */}
                                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent skew-x-12 group-hover:animate-[shine_1s_ease-in-out]"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. LOGIN / REGISTER (The Gateway) */}
                    <div className="relative group w-full max-w-md mx-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-[#0F172A] ring-1 ring-white/10 rounded-xl p-2 flex gap-2">
                            <button 
                                onClick={onRegister}
                                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                            >
                                <Sun size={18} className="animate-[spin_10s_linear_infinite]" />
                                ثبت نام و آغاز سفر
                            </button>
                            <button 
                                onClick={onLogin}
                                className="px-6 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm py-4 rounded-lg border border-white/5 transition-all flex items-center justify-center gap-2"
                            >
                                <LogIn size={18} />
                                ورود
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-gray-500 mt-3 font-mono tracking-wider">
                            SECURE GATEWAY • ELITE ACCESS ONLY
                        </p>
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes shine {
                    100% { left: 100%; }
                }
            `}</style>
        </section>
    );
};

const HomePage: React.FC<HomePageProps> = ({ onLogin, onRegister }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const featureModules = [
    { icon: Dumbbell, title: 'مدیریت تمرینات', desc: 'طراحی برنامه، ثبت رکوردها و تحلیل حجم تمرینی.', link: '#' },
    { icon: BarChart2, title: 'آنالیز پیشرفته', desc: 'نمودارهای دقیق پیشرفت و شاخص‌های آمادگی جسمانی.', link: '#' },
    { icon: Apple, title: 'تغذیه هوشمند', desc: 'محاسبه ماکروها، کالری‌شماری و پیشنهادات غذایی.', link: '#' },
    { icon: Users, title: 'ارتباط با مربی', desc: 'دریافت برنامه و بازخورد مستقیم از مربی اختصاصی.', link: '#' },
  ];
  
  const whyFitProItems = [
    { icon: TrendingUp, title: 'رشد سریع‌تر', text: 'با تحلیل داده‌ها، نقاط ضعف خود را بشناسید و سریع‌تر پیشرفت کنید.' },
    { icon: CheckCircle2, title: 'نظم و دقت', text: 'همه چیز ثبت شده و منظم است. دیگر هیچ تمرینی فراموش نمی‌شود.' },
    { icon: LinkIcon, title: 'ارتباط موثر', text: 'فاصله بین مربی و ورزشکار به حداقل می‌رسد.' },
    { icon: ShieldCheck, title: 'اطمینان و امنیت', text: 'داده‌های شما امن است و به محصولات معتبر دسترسی دارید.' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#020617] text-gray-200 font-sans selection:bg-[#F97316] selection:text-black flex flex-col dir-rtl">
      
      {/* 1. Header & Mobile Menu */}
      <Header onOpenMenu={() => setIsMobileMenuOpen(true)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1">
        
        {/* --- HERO SECTION REPLACED --- */}
        <HeritageHero onLogin={onLogin} onRegister={onRegister} />

        {/* --- PROMO MODULE (NEW) --- */}
        <section className="py-16 px-6 bg-[#0F172A] border-b border-[#1E293B]">
            <div className="container max-w-4xl mx-auto">
                <div className="bg-[#1E293B] border border-[#F97316]/30 rounded-3xl p-8 md:p-12 text-center shadow-xl hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F97316] to-transparent"></div>
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#F97316]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">آیا آماده‌ای برای ارتقای سطح خود؟</h2>
                    <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                        با فیت پرو، درصد موفقیت و پیشرفت شما تا <span className="text-[#F97316] font-bold text-2xl font-mono">۲۶٪</span> افزایش می‌یابد. 
                        <span className="block mt-2 text-sm text-gray-500">تحلیل داده‌های واقعی + هوش مصنوعی</span>
                    </p>
                    <button 
                        onClick={onRegister}
                        className="bg-[#F97316] hover:bg-[#EA580C] text-black font-black text-lg px-10 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-orange-500/20 flex items-center justify-center mx-auto"
                    >
                        شروع آزمایشی <ArrowRight className="mr-2 h-5 w-5" />
                    </button>
                </div>
            </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section className="py-24 px-6 bg-[#020617]">
          <div className="container max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">امکانات پلتفرم</h2>
              <div className="w-20 h-1 bg-[#00D26A] mx-auto rounded-full mb-4"></div>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">ابزارهای قدرتمند برای مدیریت کامل سبک زندگی ورزشی شما</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featureModules.map((item, index) => (
                <a 
                  key={index} 
                  href={item.link} 
                  className="flex flex-col items-center text-center bg-[#0F172A] p-8 rounded-3xl border border-[#1E293B] hover:border-[#00D26A]/50 transition-all duration-300 group hover:-translate-y-2"
                >
                  <div className="bg-[#00D26A]/10 text-[#00D26A] w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#00D26A] group-hover:text-black transition-colors duration-300 shadow-[0_0_20px_rgba(0,210,106,0.1)]">
                    <item.icon size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00D26A] transition-colors">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* --- WHY FIT PRO --- */}
        <section className="py-24 px-6 bg-[#0F172A] relative overflow-hidden">
          {/* Grid Texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

          <div className="container max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">چرا ورزشکاران فیت پرو را انتخاب می‌کنند؟</h2>
              <p className="text-gray-400 text-lg">تفاوت در جزئیات و نگاه علمی به ورزش است</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {whyFitProItems.map((item, index) => (
                <div key={index} className="flex items-start gap-5 p-6 rounded-2xl bg-[#1E293B]/50 border border-[#3E4A3E] hover:border-[#F97316]/30 transition-all duration-300">
                  <div className="shrink-0 bg-[#F97316]/10 p-3 rounded-xl text-[#F97316]">
                    <item.icon size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* --- DASHBOARD PREVIEW & TICKER --- */}
        <section className="py-24 px-6 bg-[#020617]">
          <div className="container max-w-7xl mx-auto">
            {/* Ticker */}
            <div className="w-full bg-[#1E293B]/30 border-y border-[#3E4A3E] h-14 flex items-center mb-16 overflow-hidden relative">
              <div className="ticker-move flex items-center gap-12 px-4 whitespace-nowrap text-gray-400 font-mono text-sm">
                 {/* Content repeated for smooth loop */}
                 {[1,2,3].map(i => (
                   <React.Fragment key={i}>
                     <span className="flex items-center gap-2"><Activity size={16} className="text-[#00D26A]"/> SYSTEM STATUS: OPTIMAL</span>
                     <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#00D26A]"/> WORKOUT LOGS: SYNCED</span>
                     <span className="flex items-center gap-2"><TrendingUp size={16} className="text-[#F97316]"/> PERFORMANCE: +12%</span>
                     <span className="flex items-center gap-2"><Apple size={16} className="text-[#F97316]"/> DIET ADHERENCE: 95%</span>
                   </React.Fragment>
                 ))}
              </div>
            </div>
            
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">داشبورد یکپارچه</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">تمام ابزارهای مورد نیاز برای مدیریت حرفه‌ای ورزش و سلامتی در یک نگاه.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="bg-[#1E293B] p-8 rounded-3xl border border-gray-700 hover:border-[#00D26A] transition-all duration-300 group hover:-translate-y-2">
                    <div className="bg-[#0F172A] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-gray-700 group-hover:border-[#00D26A] transition-colors">
                        <Dumbbell className="w-8 h-8 text-[#00D26A]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">مدیریت تمرین</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">ثبت ست‌ها، تکرارها و مشاهده تاریخچه رکوردها با نمودارهای پیشرفت.</p>
                </div>

                {/* Card 2 (Featured) */}
                <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] p-8 rounded-3xl border border-[#F97316]/50 shadow-2xl shadow-[#F97316]/10 transform md:-translate-y-6 relative z-10">
                    <div className="absolute top-0 right-0 bg-[#F97316] text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase">Featured</div>
                    <div className="bg-[#0B0F17] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                        <Apple className="w-8 h-8 text-[#F97316]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">تغذیه هوشمند</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">برنامه غذایی منعطف، جایگزینی هوشمند مواد غذایی و کنترل دقیق کالری.</p>
                </div>

                {/* Card 3 */}
                <div className="bg-[#1E293B] p-8 rounded-3xl border border-gray-700 hover:border-[#00D26A] transition-all duration-300 group hover:-translate-y-2">
                    <div className="bg-[#0F172A] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-gray-700 group-hover:border-[#00D26A] transition-colors">
                        <BarChart2 className="w-8 h-8 text-[#00D26A]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">آنالیز پیشرفته</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">تحلیل داده‌های بدن، روند تغییرات وزن و سایز با گزارش‌های دقیق.</p>
                </div>
            </div>
          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="py-24 px-6 bg-[#0F172A] border-t border-[#1E293B]">
          <div className="container max-w-5xl mx-auto">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-[#020617] to-[#1E293B] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden border border-[#3E4A3E]">
                {/* Decor */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#F97316]/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00D26A]/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10 uppercase tracking-tight">
                  نسخه حرفه‌ای‌تر خودت باش
                </h2>
                <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                  همین حالا به جمع هزاران ورزشکار فیت پرو بپیوند و مسیر موفقیت خود را آغاز کن.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 relative z-10">
                  <button onClick={onLogin} className="w-full sm:w-auto bg-[#F97316] hover:bg-[#EA580C] text-black font-black text-lg px-12 py-4 rounded-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                    شروع رایگان
                  </button>
                  <button onClick={onRegister} className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold text-lg px-12 py-4 rounded-xl transition-all backdrop-blur-md">
                    ساخت حساب کاربری
                  </button>
                </div>
            </div>
          </div>
        </section>

      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Floating Call Button */}
      <FloatingCallButton />
      
    </div>
  );
};

export default HomePage;
