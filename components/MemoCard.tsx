
import React from 'react';
import { Memo } from '../types';

interface MemoCardProps {
  memo: Memo;
  onClick: (memo: Memo) => void;
}

const MemoCard: React.FC<MemoCardProps> = ({ memo, onClick }) => {
  const categories = memo.analysis?.categories || [memo.sceneMode];
  const isTodo = categories.some(cat => cat.toLowerCase().includes('todo') || cat.toLowerCase().includes('to-do'));
  
  // Dynamic color mapping for categories
  const getCategoryStyles = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('study')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (c.includes('meeting')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (c.includes('todo') || c.includes('to-do')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (c.includes('idea')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (c.includes('personal')) return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatDueDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      onClick={() => onClick(memo)}
      className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {memo.isProcessing ? (
             <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-slate-100 text-slate-400 border-slate-200">
               Thinking...
             </span>
          ) : (
            categories.map((cat, idx) => (
              <span key={idx} className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors ${getCategoryStyles(cat)}`}>
                {cat}
              </span>
            ))
          )}
          {isTodo && memo.analysis?.dueDate && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDueDate(memo.analysis.dueDate)}
            </span>
          )}
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          {new Date(memo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
        {memo.isProcessing ? 'Capturing Magic...' : (memo.analysis?.title || 'Fragmented Thought')}
      </h3>
      
      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
        {memo.isProcessing ? 'Gemini is processing your thoughts into wisdom...' : memo.analysis?.summary}
      </p>

      {memo.isProcessing && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50">
          <div className="bg-indigo-500 h-full w-1/3 animate-[loading_1.5s_infinite]"></div>
        </div>
      )}
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default MemoCard;
