
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyLog, AnalyticsState } from '../types';
import { runAnalyticsPipeline } from '../services/analyticsPipeline';
import { OPSScoreCard, ModuleScoreCard, TrendChart, AlertItem } from './OPSWidgets';
import { RecommendationsPanel } from './RecommendationsPanel';
import { PDFExportDialog, ShareWithCoachDialog } from './ExportShareModals';
import { 
  BarChart2, ShieldCheck, Download, Share2, AlertCircle, Bell, FileText 
} from 'lucide-react';

interface AnalyticsDashboardProps {
  profile: UserProfile;
  logs: DailyLog[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ profile, logs }) => {
  const [analytics, setAnalytics] = useState<AnalyticsState | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Run Pipeline
  useEffect(() => {
      const result = runAnalyticsPipeline(profile, logs);
      setAnalytics(result);
  }, [profile, logs]);

  if (!analytics) return (
      <div className="flex h-full items-center justify-center text-gray-500">
          <div className="text-center">
             <BarChart2 size={48} className="mx-auto mb-4 opacity-20 animate-pulse"/>
             <p>Initializing Analytics Engine...</p>
          </div>
      </div>
  );

  const modules = [
      { key: 'health', label: 'Health Status', score: analytics.ops.breakdown.health },
      { key: 'workout', label: 'Training Load', score: analytics.ops.breakdown.workout },
      { key: 'nutrition', label: 'Nutrition', score: analytics.ops.breakdown.nutrition },
      { key: 'performance', label: 'Records', score: analytics.ops.breakdown.performance },
      { key: 'supplements', label: 'Supplements', score: analytics.ops.breakdown.supplements },
      { key: 'bio', label: 'Bio & Sleep', score: analytics.ops.breakdown.bio },
  ];

  // Helper to transform trend data for chart
  const trendChartData = analytics.weeklyTrend.map(t => ({
      date: t.date,
      value: t.ops,
      ewma: t.ops, // In a real app, calculate actual EWMA
  }));

  return (
    <div className="flex flex-col h-full space-y-6 pb-20" dir="rtl">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-[#151915] p-4 rounded-2xl border border-[#3E4A3E] shadow-xl gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <BarChart2 className="text-[#D4FF00]" size={28} />
            مرکز تحلیل پیشرفته (OPS)
          </h1>
          <p className="text-gray-400 text-xs mt-1 font-mono tracking-wide">
             AI-POWERED PERFORMANCE ANALYTICS • V2.4
          </p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowShare(true)} className="flex items-center gap-2 bg-[#232923] hover:bg-[#2d332d] text-white px-4 py-2 rounded-lg text-xs font-bold border border-white/5 transition">
                <Share2 size={14}/> اشتراک‌گذاری
            </button>
            <button onClick={() => setShowExport(true)} className="flex items-center gap-2 bg-[#D4FF00] hover:bg-white text-black px-4 py-2 rounded-lg text-xs font-bold transition shadow-lg shadow-[#D4FF00]/20">
                <Download size={14}/> گزارش PDF
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        
        {/* 2. Top Grid: OPS & Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1 h-[300px]">
                <OPSScoreCard ops={analytics.ops} sparklineData={analytics.weeklyTrend.map(d => d.ops)} />
            </div>
            <div className="lg:col-span-2 h-[300px]">
                <TrendChart data={trendChartData} />
            </div>
        </div>

        {/* 3. Module Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {modules.map(mod => (
                <ModuleScoreCard 
                    key={mod.key} 
                    moduleKey={mod.key} 
                    label={mod.label} 
                    score={mod.score} 
                    trend="stable" // In real app, calculate per module trend
                />
            ))}
        </div>

        {/* 4. Bottom Grid: Recommendations & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recommendations (2 Cols) */}
            <div className="lg:col-span-2 h-[400px]">
                <RecommendationsPanel 
                    recommendations={analytics.recommendations} 
                    onApply={(id) => alert(`Action applied for ${id}`)}
                />
            </div>

            {/* Alerts Feed (1 Col) */}
            <div className="lg:col-span-1 h-[400px] flex flex-col bg-[#111318] border border-[#3E4A3E] rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-[#3E4A3E] bg-[#151915] flex items-center gap-2">
                    <Bell className="text-red-400" size={20}/>
                    <h3 className="text-white font-bold">هشدارها (System Alerts)</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    {analytics.alerts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <ShieldCheck size={32} className="mb-2 opacity-20"/>
                            <p className="text-xs">All systems nominal.</p>
                        </div>
                    ) : (
                        analytics.alerts.map(alert => (
                            <AlertItem key={alert.id} alert={alert} />
                        ))
                    )}
                </div>
            </div>

        </div>

      </div>

      {/* Modals */}
      {showExport && <PDFExportDialog onClose={() => setShowExport(false)} onExport={() => alert("Report Generated!")} />}
      {showShare && <ShareWithCoachDialog onClose={() => setShowShare(false)} />}
    </div>
  );
};

export default AnalyticsDashboard;
