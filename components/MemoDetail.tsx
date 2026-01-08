
import React from 'react';
import { Memo, SceneMode } from '../types';
import MindMap from './MindMap';

interface MemoDetailProps {
  memo: Memo;
  onClose: () => void;
}

const MemoDetail: React.FC<MemoDetailProps> = ({ memo, onClose }) => {
  if (memo.isProcessing || !memo.analysis) return null;

  const { analysis } = memo;
  const categories = analysis.categories || [];
  const isTodo = categories.some(cat => cat.toLowerCase().includes('todo') || cat.toLowerCase().includes('to-do'));
  const isStudy = categories.some(cat => cat.toLowerCase().includes('study') || cat.toLowerCase().includes('idea'));

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col animate-in slide-in-from-right duration-300">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center flex-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">AI Organized Insights</span>
          <h2 className="text-sm font-bold text-slate-800">{new Date(memo.timestamp).toLocaleDateString()}</h2>
        </div>
        <button className="p-2 text-indigo-600 font-bold text-sm">Export</button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {categories.map((cat, idx) => (
              <span key={idx} className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                {cat}
              </span>
            ))}
            {isTodo && analysis.dueDate && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(analysis.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4">{analysis.title}</h1>
          <div className="relative group">
            <p className="text-slate-600 text-lg leading-relaxed border-l-4 border-indigo-100 pl-4 py-1 italic">
              {analysis.summary}
            </p>
          </div>
        </div>

        {/* Mind Map Section for Learning/Ideas */}
        {isStudy && analysis.mindMapNodes && analysis.mindMapNodes.length > 0 && (
          <section className="mb-10">
            <MindMap nodes={analysis.mindMapNodes} />
          </section>
        )}

        {/* Key Points */}
        <section className="mb-10">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Key Highlights
          </h3>
          <ul className="grid gap-3">
            {analysis.keyPoints.map((point, idx) => (
              <li key={idx} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-xs font-black text-indigo-600 shadow-sm">
                  {idx + 1}
                </div>
                <p className="text-slate-700 font-medium pt-0.5">{point}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Action Items */}
        {analysis.actionItems.length > 0 && (
          <section className="mb-10">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Checklist
            </h3>
            <div className="space-y-3">
              {analysis.actionItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-amber-50/30 hover:border-amber-100 cursor-pointer transition-all group">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-amber-400 flex items-center justify-center transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 scale-0 group-hover:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-slate-700 font-bold">{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Original Transcript */}
        <section className="mt-16 pt-8 border-t border-slate-100 opacity-40 hover:opacity-100 transition-opacity">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Voice Input Source</h3>
          <div className="bg-slate-50 p-4 rounded-xl text-slate-500 text-xs italic leading-relaxed">
            "{memo.transcription}"
          </div>
        </section>
      </div>

      {/* Floating Actions */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-2xl flex items-center gap-2 active:scale-95 transition-all">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
            Play Original
          </button>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-2xl shadow-indigo-200 active:scale-95 transition-all">
            Send to Notion
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoDetail;
