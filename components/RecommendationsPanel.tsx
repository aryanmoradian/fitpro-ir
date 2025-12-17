
import React, { useState } from 'react';
import { Recommendation } from '../types';
import { 
    Zap, Filter, ChevronDown, ChevronUp, CheckCircle2, 
    ArrowRight, Clock, BarChart2, Layers
} from 'lucide-react';

interface Props {
    recommendations: Recommendation[];
    onApply: (id: string) => void;
}

const PriorityBadge: React.FC<{ priority: number }> = ({ priority }) => {
    if (priority === 1) return <span className="bg-red-500/20 text-red-400 border border-red-500/50 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Critical</span>;
    if (priority === 2) return <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 text-[10px] font-bold px-2 py-0.5 rounded uppercase">High</span>;
    return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/50 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Normal</span>;
};

const RecItem: React.FC<{ 
    rec: Recommendation; 
    onApply: (id: string) => void;
}> = ({ rec, onApply }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`border rounded-xl transition-all duration-300 overflow-hidden ${expanded ? 'bg-[#1a1c23] border-blue-500/40 shadow-lg' : 'bg-[#151915] border-[#3E4A3E] hover:border-gray-500'}`}>
            {/* Header / Summary */}
            <div className="p-4 cursor-pointer flex items-start gap-3" onClick={() => setExpanded(!expanded)}>
                <div className={`mt-1 p-2 rounded-lg ${rec.priority === 1 ? 'bg-red-900/20 text-red-400' : 'bg-blue-900/20 text-blue-400'}`}>
                    <Zap size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-white truncate pr-2">{rec.title}</h4>
                        <PriorityBadge priority={rec.priority} />
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                        {rec.explanation}
                    </p>
                    
                    {!expanded && (
                         <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                             <span className="flex items-center"><Clock size={10} className="mr-1"/> {rec.expectedTimeframe}</span>
                             <span className="flex items-center"><BarChart2 size={10} className="mr-1"/> {Math.round(rec.confidenceScore * 100)}% Confidence</span>
                         </div>
                    )}
                </div>
                <button className="text-gray-500 hover:text-white transition">
                    {expanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </button>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5 animate-in slide-in-from-top-2">
                    <div className="mt-4 space-y-3">
                        {/* Action List */}
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Action Plan</span>
                            <div className="space-y-2">
                                {rec.actions.map((action, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-black/30 p-2 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-gray-200">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            {action.label}
                                        </div>
                                        {action.type !== 'advice' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onApply(rec.id); }}
                                                className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded flex items-center"
                                            >
                                                Apply <ArrowRight size={10} className="ml-1"/>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center gap-2 pt-2">
                            <span className="text-[10px] text-gray-500">Related Metrics:</span>
                            {rec.relatedMetrics.map(m => (
                                <span key={m} className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">{m}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const RecommendationsPanel: React.FC<Props> = ({ recommendations, onApply }) => {
    const [filter, setFilter] = useState<'All' | 'High'>('All');

    const filtered = filter === 'High' 
        ? recommendations.filter(r => r.priority <= 2)
        : recommendations;

    return (
        <div className="h-full flex flex-col bg-[#111318] border border-[#3E4A3E] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#3E4A3E] bg-[#151915] flex justify-between items-center shrink-0">
                <h3 className="font-black text-white text-lg flex items-center gap-2">
                    <Layers className="text-[#D4FF00]" size={20}/>
                    توصیه‌های هوشمند
                </h3>
                <div className="flex bg-black/40 p-0.5 rounded-lg">
                    <button 
                        onClick={() => setFilter('All')} 
                        className={`px-3 py-1 text-[10px] font-bold rounded transition ${filter === 'All' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilter('High')} 
                        className={`px-3 py-1 text-[10px] font-bold rounded transition ${filter === 'High' ? 'bg-red-900/50 text-red-200' : 'text-gray-500'}`}
                    >
                        High Priority
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {filtered.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <CheckCircle2 size={40} className="mb-2 opacity-20"/>
                        <p className="text-sm">No recommendations at this moment.</p>
                    </div>
                ) : (
                    filtered.map(rec => <RecItem key={rec.id} rec={rec} onApply={onApply} />)
                )}
            </div>
        </div>
    );
};
