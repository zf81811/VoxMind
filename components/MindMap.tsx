
import React from 'react';
import { MindMapNode } from '../types';

interface MindMapProps {
  nodes: MindMapNode[];
}

const MindMap: React.FC<MindMapProps> = ({ nodes }) => {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 overflow-hidden">
      <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Logic Framework
      </h3>
      <div className="relative">
        {nodes.map((node, idx) => (
          <div key={node.id} className="mb-4 last:mb-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
              <div className="bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-sm text-sm font-bold text-slate-700">
                {node.label}
              </div>
            </div>
            {idx < nodes.length - 1 && (
              <div className="ml-1 w-0.5 h-4 bg-indigo-100"></div>
            )}
          </div>
        ))}
        {/* Simple visual connector decor */}
        <div className="absolute top-2 left-1 bottom-2 w-px bg-gradient-to-b from-indigo-200 via-indigo-100 to-transparent -z-10"></div>
      </div>
    </div>
  );
};

export default MindMap;
