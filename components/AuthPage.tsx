
import React, { useState, useEffect } from 'react';
import { 
    Mail, KeyRound, Eye, EyeOff, Loader2, CheckCircle2, 
    AlertTriangle, ShieldCheck, User, ArrowLeft, 
    Crosshair, Fingerprint, Lock, Shield
} from 'lucide-react';
import Logo from './Logo';
import { UserRole, AppView } from '../types';
import { AuthAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  onAuthSuccess: (user: { firstName: string; lastName: string; email: string; role: UserRole }, targetView?: AppView) => void;
  initialMode?: 'login' | 'register';
}

const TacticalInput: React.FC<{
    icon: React.ElementType;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    showPasswordToggle?: boolean;
    onTogglePassword?: () => void;
    isPasswordVisible?: boolean;
    dir?: 'ltr' | 'rtl';
}> = ({ icon: Icon, type, placeholder, value, onChange, error, showPasswordToggle, onTogglePassword, isPasswordVisible, dir = 'ltr' }) => (
    <div className="space-y-1 group">
        <div className={`relative flex items-center bg-[#0B0F17] border-2 rounded-lg transition-all duration-300 ${error ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-[#1E293B] group-hover:border-gray-500 focus-within:border-[#00D26A] focus-within:shadow-[0_0_15px_rgba(0,210,106,0.1)]'}`}>
            <div className={`p-3 text-gray-500 transition-colors ${value ? 'text-[#00D26A]' : 'group-focus-within:text-[#00D26A]'}`}>
                <Icon size={20} />
            </div>
            <div className="h-6 w-px bg-[#1E293B] group-focus-within:bg-[#00D26A]/30 transition-colors"></div>
            <input 
                type={type} 
                placeholder={placeholder} 
                value={value} 
                onChange={onChange} 
                className="w-full bg-transparent text-white px-4 py-3 outline-none text-sm font-bold placeholder-gray-600"
                dir={dir}
            />
            {showPasswordToggle && (
                <button 
                    type="button"
                    onClick={onTogglePassword} 
                    className="p-3 text-gray-500 hover:text-white transition"
                >
                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
            
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20"></div>
        </div>
        {error && (
            <div className="flex items-center gap-1 text-[10px] text-red-400 font-mono animate-in slide-in-from-top-1">
                <AlertTriangle size={10} />
                <span>{error}</span>
            </div>
        )}
    </div>
);

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, initialMode = 'login' }) => {
  const { login: contextLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>(initialMode);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Verify State
  const [verifyCode, setVerifyCode] = useState('');
  
  // Validation & UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(0);

  useEffect(() => { 
      if (initialMode !== mode && mode !== 'verify') {
          setMode(initialMode); 
      }
  }, [initialMode]);

  const checkPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    setSecurityLevel(strength);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrors({ login: "اطلاعات شناسایی ناقص است." });
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
        const response = await AuthAPI.login({ email: loginEmail, password: loginPassword });
        if (response.token) {
            const { user, token } = response;
            // Update Context
            contextLogin(token, user);

            const names = user.name ? user.name.split(' ') : ['User', ''];
            const targetView = user.role === 'admin' ? AppView.ADMIN_DASHBOARD : AppView.DASHBOARD;
            
            onAuthSuccess({
                firstName: names[0],
                lastName: names.slice(1).join(' '),
                email: user.email,
                role: user.role as UserRole
            }, targetView);
        } else {
            setErrors({ login: "عدم تطابق اطلاعات. دسترسی رد شد." });
        }
    } catch (err: any) {
        setErrors({ login: err.message || "خطا در ارتباط با سرور امنیتی." });
    } finally {
        setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!firstName) newErrors.firstName = "نام الزامی است";
    if (!lastName) newErrors.lastName = "نام خانوادگی الزامی است";
    if (!regEmail.includes('@')) newErrors.regEmail = "فرمت ایمیل نامعتبر";
    if (regPassword.length < 6) newErrors.regPassword = "رمز عبور ضعیف (حداقل ۶ کاراکتر)";
    if (regPassword !== confirmPassword) newErrors.confirmPassword = "عدم تطابق رمز عبور";

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setLoading(true);
    try {
        await AuthAPI.register({ first_name: firstName, last_name: lastName, email: regEmail, password: regPassword });
        setMode('verify');
    } catch (err: any) {
        setErrors({ regEmail: err.message || "خطا در ثبت نام. ایمیل تکراری؟" });
    } finally {
        setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!verifyCode) {
          setErrors({ verify: "کد تایید الزامی است" });
          return;
      }
      setLoading(true);
      try {
          const response = await AuthAPI.verifyEmail({ email: regEmail, code: verifyCode });
          if (response.token) {
              // Construct user object since verify endpoint only returns token
              const minimalUser = { id: 'new', email: regEmail, role: 'athlete' as UserRole, name: `${firstName} ${lastName}` };
              
              contextLogin(response.token, minimalUser);
              
              onAuthSuccess({
                firstName: firstName,
                lastName: lastName,
                email: regEmail,
                role: 'athlete'
              });
          }
      } catch (err: any) {
          setErrors({ verify: err.message || "کد نامعتبر است یا منقضی شده" });
      } finally {
          setLoading(false);
      }
  };

  const switchMode = (newMode: 'login' | 'register') => {
      setMode(newMode);
      setErrors({});
      setSecurityLevel(0);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#020617] text-white overflow-hidden relative">
        {/* --- BACKGROUND EFFECTS --- */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-900/10 blur-[120px] pointer-events-none"></div>

        {/* --- LEFT SIDE: THE MISSION (Desktop Only) --- */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 border-l border-[#1E293B] bg-[#05080F]">
            <div className="relative z-10">
                <Logo textClassName="text-white" />
                <div className="mt-12 space-y-6">
                    <h1 className="text-5xl font-black leading-tight uppercase tracking-tight">
                        <span className="text-gray-500 block text-2xl mb-2 font-mono">System Status: Active</span>
                        مسیر قهرمانی <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D26A] to-green-600">
                            از اینجا آغاز می‌شود
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md leading-relaxed border-r-2 border-[#F97316] pr-4">
                        دسترسی به پیشرفته‌ترین ابزارهای تحلیل عملکرد، برنامه نویسی هوشمند و مانیتورینگ بیولوژیک.
                    </p>
                </div>
            </div>

            {/* Tactical Decor */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay grayscale"></div>
            <div className="relative z-10 flex items-center gap-4 text-xs font-mono text-gray-500">
                <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-[#00D26A]"/> SECURE CONNECTION</span>
                <span>•</span>
                <span className="flex items-center gap-2"><Lock size={14} className="text-[#00D26A]"/> ENCRYPTED v2.4</span>
            </div>
        </div>

        {/* --- RIGHT SIDE: THE TERMINAL (Form) --- */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">
            
            {/* Back Button */}
            <button onClick={() => window.location.reload()} className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-white transition group z-20">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/>
                <span className="text-sm font-bold uppercase tracking-widest">Abort</span>
            </button>

            <div className="w-full max-w-md relative">
                {/* Form Container */}
                <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-[#1E293B] p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
                    
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F97316] to-transparent opacity-50"></div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 border-2 ${securityLevel >= 3 || mode === 'verify' ? 'bg-green-900/20 border-green-500' : 'bg-black border-[#3E4A3E]'}`}>
                            {mode === 'login' ? <Fingerprint size={32} className="text-gray-400" /> : mode === 'verify' ? <Mail size={32} className="text-green-400" /> : <User size={32} className="text-gray-400"/>}
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                            {mode === 'login' ? 'تایید هویت' : mode === 'verify' ? 'تایید ایمیل' : 'ثبت نام عامل جدید'}
                        </h2>
                        <p className="text-gray-500 text-xs font-mono mt-2 uppercase tracking-[0.2em]">
                            {mode === 'login' ? 'Identity Verification Required' : mode === 'verify' ? 'Email Confirmation Sent' : 'New Agent Registration Protocol'}
                        </p>
                    </div>

                    {/* Mode Switcher */}
                    {mode !== 'verify' && (
                        <div className="flex p-1 bg-black/40 rounded-lg mb-8 border border-white/5">
                            <button 
                                onClick={() => switchMode('login')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'login' ? 'bg-[#1E293B] text-white shadow-lg border border-gray-600' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                ورود
                            </button>
                            <button 
                                onClick={() => switchMode('register')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'register' ? 'bg-[#1E293B] text-white shadow-lg border border-gray-600' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                ثبت نام
                            </button>
                        </div>
                    )}

                    {/* LOGIN FORM */}
                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-right duration-300">
                            <TacticalInput 
                                icon={Mail} type="email" placeholder="پست الکترونیک (Email)"
                                value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                                error={errors.login}
                                dir="ltr"
                            />
                            <TacticalInput 
                                icon={KeyRound} type={isPasswordVisible ? 'text' : 'password'} placeholder="کد دسترسی (Password)"
                                value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                                showPasswordToggle isPasswordVisible={isPasswordVisible} onTogglePassword={() => setIsPasswordVisible(!isPasswordVisible)}
                                dir="ltr"
                            />
                            
                            <div className="flex justify-between items-center text-xs mt-2">
                                <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white transition">
                                    <input type="checkbox" className="rounded bg-black border-gray-600 focus:ring-0 checked:bg-[#F97316]" />
                                    مرا به خاطر بسپار
                                </label>
                                <a href="#" className="text-[#F97316] hover:underline">فراموشی رمز؟</a>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-[#F97316] hover:bg-[#EA580C] text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-6 uppercase tracking-wider text-sm"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><Crosshair size={18} /> ورود به سیستم</>}
                            </button>
                        </form>
                    )}

                    {/* REGISTER FORM */}
                    {mode === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4 animate-in slide-in-from-left duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <TacticalInput 
                                    icon={User} type="text" placeholder="نام"
                                    value={firstName} onChange={e => setFirstName(e.target.value)}
                                    error={errors.firstName}
                                />
                                <TacticalInput 
                                    icon={User} type="text" placeholder="نام خانوادگی"
                                    value={lastName} onChange={e => setLastName(e.target.value)}
                                    error={errors.lastName}
                                />
                            </div>
                            <TacticalInput 
                                icon={Mail} type="email" placeholder="پست الکترونیک"
                                value={regEmail} onChange={e => setRegEmail(e.target.value)}
                                error={errors.regEmail}
                                dir="ltr"
                            />
                            
                            <div className="space-y-2">
                                <TacticalInput 
                                    icon={KeyRound} type="password" placeholder="رمز عبور"
                                    value={regPassword} onChange={e => { setRegPassword(e.target.value); checkPasswordStrength(e.target.value); }}
                                    error={errors.regPassword}
                                    dir="ltr"
                                />
                                {/* Password Strength Meter */}
                                <div className="flex gap-1 h-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`flex-1 rounded-full transition-colors duration-500 ${i <= securityLevel ? (securityLevel < 2 ? 'bg-red-500' : securityLevel < 3 ? 'bg-yellow-500' : 'bg-[#00D26A]') : 'bg-gray-800'}`}></div>
                                    ))}
                                </div>
                            </div>

                            <TacticalInput 
                                icon={Shield} type="password" placeholder="تکرار رمز عبور"
                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                error={errors.confirmPassword}
                                dir="ltr"
                            />

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-black py-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-6 uppercase tracking-wider text-sm group-hover:border-[#00D26A]/50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> دریافت کد تایید</>}
                            </button>
                        </form>
                    )}

                    {/* VERIFY FORM */}
                    {mode === 'verify' && (
                        <form onSubmit={handleVerify} className="space-y-6 animate-in zoom-in duration-300">
                             <div className="text-center text-sm text-gray-400 mb-4">
                                کدی که به ایمیل <strong>{regEmail}</strong> ارسال شد را وارد کنید.
                             </div>
                             
                             <TacticalInput 
                                icon={ShieldCheck} type="text" placeholder="کد تایید (Verification Code)"
                                value={verifyCode} onChange={e => setVerifyCode(e.target.value)}
                                error={errors.verify}
                                dir="ltr"
                            />
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-[#00D26A] hover:bg-green-500 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(0,210,106,0.3)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-6 uppercase tracking-wider text-sm"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> فعال‌سازی حساب</>}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => setMode('register')}
                                className="w-full text-xs text-gray-500 hover:text-white mt-4"
                            >
                                اصلاح ایمیل یا بازگشت
                            </button>
                        </form>
                    )}
                    
                    {/* Decorative Code */}
                    <div className="absolute bottom-2 left-4 text-[8px] text-gray-700 font-mono pointer-events-none opacity-50">
                        sys_auth_v4.2.1 // connection: stable
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AuthPage;
