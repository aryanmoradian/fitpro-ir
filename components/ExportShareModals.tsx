
import React, { useState } from 'react';
import { FileText, Share2, Check, Copy, Download, Loader2, X, Lock, Globe } from 'lucide-react';

// --- PDF EXPORT DIALOG ---
export const PDFExportDialog: React.FC<{ onClose: () => void; onExport: (config: any) => void }> = ({ onClose, onExport }) => {
    const [config, setConfig] = useState({
        includeCharts: true,
        includeRecommendations: true,
        theme: 'dark',
        range: 'lastMonth'
    });
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            onExport(config);
            setIsExporting(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#1E293B] border border-gray-600 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="text-red-400"/> گزارش جامع عملکرد</h3>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 block mb-2 font-bold">بازه زمانی</label>
                        <select 
                            className="w-full input-styled p-3"
                            value={config.range}
                            onChange={(e) => setConfig({...config, range: e.target.value})}
                        >
                            <option value="lastWeek">هفته گذشته</option>
                            <option value="lastMonth">ماه گذشته</option>
                            <option value="last3Months">۳ ماه اخیر</option>
                        </select>
                    </div>

                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-gray-300">نمودارهای پیشرفت</span>
                            <input type="checkbox" checked={config.includeCharts} onChange={e => setConfig({...config, includeCharts: e.target.checked})} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600"/>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-gray-300">توصیه‌های مربی (AI)</span>
                            <input type="checkbox" checked={config.includeRecommendations} onChange={e => setConfig({...config, includeRecommendations: e.target.checked})} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600"/>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <button 
                             onClick={() => setConfig({...config, theme: 'dark'})}
                             className={`p-3 rounded-xl border text-center text-sm font-bold transition ${config.theme === 'dark' ? 'bg-gray-800 border-blue-500 text-white' : 'bg-gray-800/50 border-transparent text-gray-500'}`}
                         >
                             تم تاریک
                         </button>
                         <button 
                             onClick={() => setConfig({...config, theme: 'light'})}
                             className={`p-3 rounded-xl border text-center text-sm font-bold transition ${config.theme === 'light' ? 'bg-gray-200 border-blue-500 text-black' : 'bg-gray-200/50 border-transparent text-gray-500'}`}
                         >
                             تم روشن
                         </button>
                    </div>

                    <button 
                        onClick={handleExport} 
                        disabled={isExporting}
                        className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center shadow-lg mt-4"
                    >
                        {isExporting ? <Loader2 className="animate-spin mr-2"/> : <Download className="mr-2"/>}
                        دانلود PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SHARE WITH COACH DIALOG ---
export const ShareWithCoachDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [link, setLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const generateLink = () => {
        setLoading(true);
        setTimeout(() => {
            setLink(`https://fit-pro.ir/coach-access/${Math.random().toString(36).substring(7)}`);
            setLoading(false);
        }, 1000);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#1E293B] border border-gray-600 rounded-2xl w-full max-w-md p-6 shadow-2xl text-center">
                <div className="flex justify-end mb-2">
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
                </div>
                
                <div className="w-16 h-16 bg-blue-900/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                    <Share2 size={32}/>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">اشتراک‌گذاری با مربی</h3>
                <p className="text-sm text-gray-400 mb-6">یک لینک امن و موقت برای دسترسی مربی به داشبورد تحلیلی خود ایجاد کنید.</p>

                {!link ? (
                    <button 
                        onClick={generateLink} 
                        disabled={loading}
                        className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : 'ایجاد لینک امن'}
                    </button>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-bottom-2">
                        <div className="bg-black/40 p-3 rounded-xl border border-gray-600 flex items-center justify-between">
                            <code className="text-cyan-400 text-xs truncate mr-2">{link}</code>
                            <button onClick={copyLink} className="text-gray-400 hover:text-white">
                                {copied ? <Check size={18} className="text-green-500"/> : <Copy size={18}/>}
                            </button>
                        </div>
                        <p className="text-[10px] text-yellow-500 bg-yellow-900/10 p-2 rounded border border-yellow-500/20">
                            این لینک تا ۴۸ ساعت معتبر است و دسترسی View-Only دارد.
                        </p>
                        <button onClick={onClose} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-xl text-sm font-bold">بستن</button>
                    </div>
                )}
            </div>
        </div>
    );
};
