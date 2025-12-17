
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, SubscriptionTier } from '../types';
import { calculatePrice, submitManualPayment, uploadReceipt, getWalletAddress } from '../services/pricingService';
import { 
    Wallet, Loader2, ChevronRight, Copy, ArrowRight, 
    AlertTriangle, ShieldCheck, ExternalLink, Zap,
    Upload, Check, FileText
} from 'lucide-react';

interface PaymentCheckoutProps {
    targetTier: SubscriptionTier;
    setTargetTier: (tier: SubscriptionTier) => void;
    profile: UserProfile;
    updateProfile: (p: UserProfile) => void;
    onBack: () => void;
    onSuccess: (status: 'active' | 'pending') => void;
    initialDuration?: number; 
}

const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({ targetTier, profile, updateProfile, onBack, onSuccess, initialDuration }) => {
    const [duration, setDuration] = useState<number>(initialDuration || 3); 
    const [step, setStep] = useState(initialDuration ? 2 : 1); 
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Form State
    const [txId, setTxId] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialDuration) {
            setDuration(initialDuration);
            setStep(2);
        }
    }, [initialDuration]);

    const pricing = calculatePrice(targetTier, duration);
    const walletAddress = getWalletAddress();
    const exchangeLink = 'https://ok-ex.io/buy-and-sell/USDT/?refer=224384';

    const handleCopyWallet = () => {
        navigator.clipboard.writeText(walletAddress);
        alert('آدرس کیف پول کپی شد.');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReceiptFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!txId) {
            setErrorMsg("لطفا شناسه تراکنش (TXID) را وارد کنید.");
            return;
        }
        setIsProcessing(true);
        setErrorMsg('');

        try {
            // 1. Upload Receipt if present
            let receiptUrl = '';
            if (receiptFile) {
                const uploadResult = await uploadReceipt(receiptFile);
                if (uploadResult.success && uploadResult.url) {
                    receiptUrl = uploadResult.url;
                }
            }

            // 2. Submit Payment Record
            await submitManualPayment({
                userId: profile.id,
                userName: profile.name,
                plan: targetTier,
                amount: pricing.totalUSD,
                method: 'usdt_trc20',
                tx_id: txId,
                receipt_url: receiptUrl,
                durationMonths: duration
            });

            // 3. Success Handler (Trigger 'Under Review' status in parent)
            setTimeout(() => {
                setIsProcessing(false);
                onSuccess('pending'); 
            }, 1500);

        } catch (e) {
            console.error(e);
            setErrorMsg("خطا در ثبت تراکنش. لطفا مجدد تلاش کنید.");
            setIsProcessing(false);
        }
    };

    // --- RENDER HELPERS ---

    const renderSummaryCard = () => (
        <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-6 sticky top-6 shadow-xl">
            <h3 className="text-white font-bold mb-4 flex items-center border-b border-gray-700 pb-4">
                <ShieldCheck className="mr-2 text-green-400"/> خلاصه سفارش
            </h3>
            
            <div className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-300">
                    <span>پلن انتخابی:</span>
                    <span className="font-bold text-yellow-400">
                        {targetTier === 'elite_plus' ? 'Elite Plus' : 'Elite'} Membership
                    </span>
                </div>
                <div className="flex justify-between text-gray-300">
                    <span>مدت اعتبار:</span>
                    <span className="font-bold text-white">{duration} ماه</span>
                </div>
                
                <div className="border-t border-gray-700 pt-4 flex justify-between items-end">
                    <span className="text-gray-400 mb-1">مبلغ نهایی:</span>
                    <div className="text-right">
                        <span className="block text-3xl font-black text-white" dir="ltr">${pricing.totalUSD} <span className="text-sm font-normal text-gray-500">USDT</span></span>
                    </div>
                </div>
            </div>

            {step > 1 && (
                <div className="mt-6 pt-6 border-t border-gray-700 bg-blue-900/10 -mx-6 -mb-6 p-4 rounded-b-2xl">
                    <div className="flex items-start gap-2 text-xs text-blue-200">
                        <Zap size={16} className="mt-0.5 shrink-0 text-yellow-400"/>
                        <p>با انتقال داخلی در صرافی اوکی اکسچنج، کارمزد انتقال <span className="font-bold text-white">۰ درصد</span> خواهد بود.</p>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in pb-20 text-right" dir="rtl">
            <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white mb-6 transition group">
                <ChevronRight size={20} className="rotate-180 ml-1 group-hover:-translate-x-1 transition-transform"/> بازگشت به پلن‌ها
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: STEPS */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Progress Stepper */}
                    <div className="flex items-center justify-between bg-[#1E293B] p-4 rounded-xl border border-gray-700">
                        {!initialDuration && (
                            <>
                                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white' : 'text-gray-500'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600' : 'bg-gray-700'}`}>1</div>
                                    <span className="hidden sm:inline font-bold">انتخاب دوره</span>
                                </div>
                                <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                            </>
                        )}
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-white' : 'text-gray-500'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`}>{initialDuration ? 1 : 2}</div>
                            <span className="hidden sm:inline font-bold">راهنما</span>
                        </div>
                        <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-white' : 'text-gray-500'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-600' : 'bg-gray-700'}`}>{initialDuration ? 2 : 3}</div>
                            <span className="hidden sm:inline font-bold">تایید</span>
                        </div>
                    </div>

                    {/* STEP 1: DURATION (If not passed) */}
                    {step === 1 && !initialDuration && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <h2 className="text-2xl font-bold text-white mb-2">مدت زمان اشتراک را انتخاب کنید</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 3, 12].map(m => {
                                    const p = calculatePrice(targetTier, m);
                                    const isSelected = duration === m;
                                    return (
                                        <div 
                                            key={m}
                                            onClick={() => setDuration(m)}
                                            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'bg-blue-900/20 border-blue-500 shadow-blue-900/20' : 'bg-[#1E293B] border-gray-700 hover:border-gray-500'}`}
                                        >
                                            <div className="text-center">
                                                <h4 className="text-lg font-bold text-white mb-2">{m} ماهه</h4>
                                                <div className="text-2xl font-black text-blue-400 mb-1" dir="ltr">${p.totalUSD}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition flex items-center shadow-lg">
                                    ادامه <ArrowRight size={18} className="mr-2 rotate-180"/>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: OK EXCHANGE GUIDE */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="bg-[#1E293B] border border-gray-700 rounded-2xl overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-4 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="font-bold text-white flex items-center gap-2"><Wallet className="text-yellow-400"/> راهنمای پرداخت (انتقال داخلی)</h3>
                                </div>
                                
                                <div className="p-6 space-y-8">
                                    
                                    {/* Step 1 */}
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 text-white border border-gray-600 flex items-center justify-center font-bold shadow-lg z-10">1</div>
                                            <div className="w-0.5 h-full bg-gray-700 -mt-2 -mb-2"></div>
                                        </div>
                                        <div className="pb-2 w-full">
                                            <h4 className="font-bold text-white mb-1">ورود به صرافی اوکی اکسچنج</h4>
                                            <p className="text-sm text-gray-400 mb-2">اگر حساب ندارید ثبت‌نام کنید، سپس تتر (USDT) بخرید.</p>
                                            <a 
                                                href={exchangeLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg transition"
                                            >
                                                ورود به صرافی <ExternalLink size={12} className="mr-1"/>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Step 2 & 3 */}
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white border border-blue-400 flex items-center justify-center font-bold shadow-lg shadow-blue-500/50 z-10">2</div>
                                            <div className="w-0.5 h-full bg-gray-700 -mt-2 -mb-2"></div>
                                        </div>
                                        <div className="pb-6 w-full">
                                            <h4 className="font-bold text-white mb-2">انتقال داخلی تتر (Internal Transfer)</h4>
                                            <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                                مبلغ <span className="text-green-400 font-bold font-mono text-lg mx-1" dir="ltr">${pricing.totalUSD}</span> تتر را به آدرس کیف پول زیر انتقال دهید.
                                                <br/>
                                                <span className="text-yellow-400 text-xs mt-1 block">* توجه: کارمزد انتقال داخلی صفر است.</span>
                                            </p>
                                            
                                            <div onClick={handleCopyWallet} className="bg-black/40 p-4 rounded-xl border border-blue-500/50 flex items-center justify-between cursor-pointer hover:bg-black/60 transition group mb-2">
                                                <div className="flex-1 overflow-hidden">
                                                    <span className="text-xs text-gray-500 block mb-1">آدرس مقصد (TRC20):</span>
                                                    <code className="text-[#22C1C3] font-mono font-bold text-sm md:text-base break-all" dir="ltr">{walletAddress}</code>
                                                </div>
                                                <div className="bg-gray-700 group-hover:bg-blue-600 text-white p-2 rounded-lg transition ml-3"><Copy size={18}/></div>
                                            </div>
                                            <p className="text-[10px] text-gray-500">روی آدرس کلیک کنید تا کپی شود.</p>
                                        </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 text-white border border-gray-600 flex items-center justify-center font-bold shadow-lg z-10">3</div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1">دریافت کد پیگیری (TXID)</h4>
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                پس از انجام تراکنش، کد TXID را کپی کنید و اسکرین‌شات بگیرید.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={() => !initialDuration ? setStep(1) : onBack()} className="text-gray-400 hover:text-white px-4">بازگشت</button>
                                <button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition flex items-center shadow-lg hover:shadow-blue-500/20 hover:scale-105 transform">
                                    مرحله بعد: ثبت رسید <ArrowRight size={18} className="mr-2 rotate-180"/>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SUBMISSION FORM */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="bg-[#1E293B] border border-gray-700 rounded-2xl p-8">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                    <FileText className="mr-2 text-green-400"/> ثبت اطلاعات پرداخت
                                </h3>
                                
                                <div className="space-y-6">
                                    {/* TXID Input */}
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2 font-bold">کد پیگیری تراکنش (TXID) <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={txId}
                                            onChange={e => setTxId(e.target.value)}
                                            placeholder="مثلا: 89d3...a2b1"
                                            className="w-full bg-black/30 border border-gray-600 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition font-mono text-sm"
                                            dir="ltr"
                                        />
                                    </div>

                                    {/* Receipt Upload */}
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2 font-bold">تصویر رسید (اختیاری)</label>
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-black/20 hover:bg-black/30"
                                        >
                                            {receiptFile ? (
                                                <div className="flex items-center text-green-400">
                                                    <Check size={24} className="mr-2"/>
                                                    <span className="font-bold">{receiptFile.name}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload size={24} className="text-gray-500 mb-2"/>
                                                    <span className="text-gray-400 text-sm">برای آپلود تصویر کلیک کنید</span>
                                                </>
                                            )}
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                onChange={handleFileChange} 
                                                accept="image/*" 
                                                className="hidden" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {errorMsg && (
                                    <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-3 rounded-lg text-sm mt-6 flex items-center justify-center">
                                        <AlertTriangle size={16} className="ml-2"/> {errorMsg}
                                    </div>
                                )}

                                <button 
                                    onClick={handleSubmit} 
                                    disabled={isProcessing}
                                    className="w-full mt-8 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : "تایید و ارسال برای بررسی"}
                                </button>
                                
                                <p className="text-center text-xs text-gray-500 mt-4">
                                    با کلیک بر روی دکمه بالا، اطلاعات برای واحد مالی ارسال شده و حساب شما به وضعیت "در حال بررسی" تغییر می‌کند.
                                </p>
                            </div>
                            
                            <div className="flex justify-start">
                                <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white px-4">بازگشت به راهنما</button>
                            </div>
                        </div>
                    )}

                </div>

                {/* RIGHT COLUMN: SUMMARY (Sticky) */}
                <div className="hidden lg:block">
                    {renderSummaryCard()}
                </div>

                {/* Mobile Summary */}
                <div className="lg:hidden mt-8">
                    {renderSummaryCard()}
                </div>

            </div>
        </div>
    );
};

export default PaymentCheckout;
