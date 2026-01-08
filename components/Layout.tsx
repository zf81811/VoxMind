
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto shadow-2xl bg-white relative overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between glass-morphism sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">VoxMind</h1>
        </div>
        <button className="text-sm font-medium px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
          Go Pro
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-32">
        {children}
      </main>

      {/* Persistent Bottom Nav - Placeholder if needed, but we keep controls floating */}
    </div>
  );
};

export default Layout;
