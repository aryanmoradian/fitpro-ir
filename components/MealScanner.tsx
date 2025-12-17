
import React, { useState, useRef } from 'react';
import { analyzeFoodImage } from '../services/geminiService';
import { Camera, Upload, RefreshCw, AlertTriangle, CheckCircle2, Info, Activity, Flame, Zap } from 'lucide-react';
import { UserProfile, AppView, ScanAnalysisResult } from '../types';

interface MealScannerProps {
  profile?: UserProfile;
  setCurrentView?: (view: AppView) => void;
}

const MealScanner: React.FC<MealScannerProps> = ({ profile, setCurrentView }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ScanAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setAnalysis(null);
        setError(null);
        // Immediately analyze upon selection
        analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64: string) => {
    if (!profile) return;
    setIsAnalyzing(true);
    try {
        // Prepare context for better AI analysis
        const context = {
            goal: profile.goalType,
            restrictions: profile.nutritionProfile?.dietaryRestrictions || [],
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
        };

        // Remove data URL prefix for API
        const base64Data = base64.split(',')[1];
        const result = await analyzeFoodImage(base64Data, context);
        
        if (result) {
            setAnalysis(result);
        } else {
            setError("خطا در تحلیل تصویر. لطفا مجدد تلاش کنید.");
        }
    } catch (e) {
        setError("خطا در ارتباط با سرور.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const getInflammatoryColor = (level: string) => {
      switch(level) {
          case 'Low': return 'text-green-400 bg-green-900/20 border-green-500/30';
          case 'Medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
          case 'High': return 'text-red-400 bg-red-900/20 border-red-500/30';
          default: return 'text-gray-400 bg-gray-800';
      }
  };

  const getRatingColor = (grade: string) => {
      if (grade.startsWith('A')) return 'text-green-400';
      if (grade.startsWith('B')) return 'text-blue-400';
      if (grade.startsWith('C')) return 'text-yellow-400';
      return 'text-red-400';
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center h-full relative p-4 animate-in fade-in">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black mb-2 tracking-wide flex items-center justify-center text-white">
             <Camera className="ml-3 text-blue-400" />
             اسکن هوشمند خوراکی
        </h2>
        <p className="text-gray-400 text-sm">تحلیل عمیق مواد مغذی، ریزمغذی‌ها و شاخص التهابی با هوش مصنوعی</p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Image & Upload */}
        <div className="energetic-card p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
            <div className="relative w-full h-full flex flex-col items-center justify-center">
                {imagePreview ? (
                    <img src={imagePreview} alt="Food" className="max-h-80 rounded-xl object-contain shadow-2xl border border-white/10" />
                ) : (
                    <div 
                        onClick={triggerUpload}
                        className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-2xl p-12 flex flex-col items-center cursor-pointer transition group"
                    >
                        <div className="bg-blue-900/20 p-4 rounded-full mb-4 group-hover:scale-110 transition">
                            <Camera className="w-12 h-12 text-blue-400" />
                        </div>
                        <span className="text-gray-300 font-bold">برای اسکن کلیک کنید</span>
                        <span className="text-xs text-gray-500 mt-2">پشتیبانی از JPG, PNG</span>
                    </div>
                )}
                
                {imagePreview && (
                    <button 
                        onClick={triggerUpload}
                        className="mt-6 flex items-center text-sm text-gray-400 hover:text-white transition bg-black/40 px-4 py-2 rounded-lg"
                    >
                        <RefreshCw size={14} className="mr-2"/> اسکن مجدد
                    </button>
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

        {/* Right: Analysis Result */}
        <div className="energetic-card p-0 overflow-hidden relative flex flex-col">
            {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <RefreshCw className="w-12 h-12 animate-spin text-blue-500" />
                    <p className="text-gray-400 animate-pulse">در حال آنالیز ترکیبات...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-red-400 p-6 text-center">
                    <AlertTriangle size={48} className="mb-4"/>
                    <p>{error}</p>
                </div>
            ) : analysis ? (
                <div className="flex flex-col h-full bg-[#0F172A]">
                    {/* Header: Name & Rating */}
                    <div className="p-6 bg-gray-900/50 border-b border-white/5 flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-black text-white mb-1">{analysis.foodName}</h3>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded border ${getInflammatoryColor(analysis.inflammatoryIndex)}`}>
                                    التهاب: {analysis.inflammatoryIndex}
                                </span>
                                <span className="text-xs text-gray-500">{analysis.calories} kcal</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <span className={`text-4xl font-black ${getRatingColor(analysis.rating)}`}>{analysis.rating}</span>
                            <span className="block text-[10px] text-gray-500 uppercase">امتیاز ارزش</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                        
                        {/* Warnings */}
                        {analysis.warnings && analysis.warnings.length > 0 && (
                            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2 text-red-400 font-bold text-sm">
                                    <AlertTriangle size={16}/> هشدار مصرف
                                </div>
                                <ul className="list-disc list-inside text-xs text-red-200/80 space-y-1">
                                    {analysis.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Macros Grid */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center"><Activity size={14} className="mr-2"/> درشت‌مغذی‌ها</h4>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-blue-900/20 border border-blue-500/20 p-2 rounded-lg text-center">
                                    <span className="block text-xs text-blue-300">پروتئین</span>
                                    <span className="font-bold text-white">{analysis.macros.protein}g</span>
                                </div>
                                <div className="bg-green-900/20 border border-green-500/20 p-2 rounded-lg text-center">
                                    <span className="block text-xs text-green-300">کربوهیدرات</span>
                                    <span className="font-bold text-white">{analysis.macros.carbs}g</span>
                                </div>
                                <div className="bg-yellow-900/20 border border-yellow-500/20 p-2 rounded-lg text-center">
                                    <span className="block text-xs text-yellow-300">چربی</span>
                                    <span className="font-bold text-white">{analysis.macros.fats}g</span>
                                </div>
                                <div className="bg-gray-800/50 p-2 rounded-lg text-center col-span-1.5">
                                    <span className="block text-[10px] text-gray-400">فیبر</span>
                                    <span className="font-bold text-white text-sm">{analysis.macros.fiber}g</span>
                                </div>
                                <div className="bg-gray-800/50 p-2 rounded-lg text-center col-span-1.5">
                                    <span className="block text-[10px] text-gray-400">قند</span>
                                    <span className="font-bold text-white text-sm">{analysis.macros.sugar}g</span>
                                </div>
                            </div>
                        </div>

                        {/* Analysis & Context */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl">
                                <h4 className="text-sm font-bold text-purple-300 mb-2 flex items-center"><Zap size={14} className="mr-2"/> تحلیل هدفمند</h4>
                                <p className="text-xs text-gray-300 leading-relaxed mb-3">{analysis.goalAlignment}</p>
                                <div className="flex flex-wrap gap-1">
                                    {analysis.micros.map((m, i) => (
                                        <span key={i} className="text-[10px] bg-purple-900/40 text-purple-200 px-2 py-1 rounded">{m}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                <h4 className="text-sm font-bold text-gray-400 mb-1 flex items-center"><Flame size={14} className="mr-2"/> دلیل شاخص التهاب</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">{analysis.inflammatoryReason}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Info size={48} className="mb-4 text-gray-600"/>
                    <p className="text-gray-400 text-sm">تصویر خوراکی خود را آپلود کنید تا هوش مصنوعی آن را آنالیز کند.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MealScanner;
