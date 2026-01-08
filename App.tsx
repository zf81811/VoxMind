
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from './components/Layout';
import Recorder from './components/Recorder';
import MemoCard from './components/MemoCard';
import MemoDetail from './components/MemoDetail';
import TodoCalendar from './components/TodoCalendar';
import { Memo, SceneMode, MemoStructuredData } from './types';
import { analyzeTranscript } from './services/geminiService';

// Helper to get YYYY-MM-DD in local time
const getLocalISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const App: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [currentMode, setCurrentMode] = useState<SceneMode>(SceneMode.ALL);
  const [selectedTodoDate, setSelectedTodoDate] = useState<Date>(new Date());
  const [isSevenDayView, setIsSevenDayView] = useState<boolean>(true);
  const [isAnyProcessing, setIsAnyProcessing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('voxmind_memos');
    if (saved) {
      setMemos(JSON.parse(saved));
    } else {
      const welcome: Memo = {
        id: 'welcome',
        timestamp: Date.now(),
        transcription: 'Welcome to VoxMind. Tap the mic to record your first thought or use the keyboard to type.',
        analysis: {
          title: 'Welcome to your Second Brain',
          summary: 'VoxMind uses Gemini AI to organize your thoughts (voice or text) into actionable wisdom.',
          categories: ['Idea'],
          type: 'Note' as any,
          keyPoints: ['Voice capturing', 'Text manual entry', 'AI auto-organization', 'Scene mode optimization'],
          actionItems: ['Record a 30-second idea', 'Type a quick task using the keyboard icon']
        },
        sceneMode: SceneMode.IDEA,
        isProcessing: false
      };
      setMemos([welcome]);
    }
  }, []);

  useEffect(() => {
    if (memos.length > 0) {
      localStorage.setItem('voxmind_memos', JSON.stringify(memos));
    }
  }, [memos]);

  // When switching to TODO mode, default to Seven Day View
  useEffect(() => {
    if (currentMode === SceneMode.TODO) {
      setIsSevenDayView(true);
    }
  }, [currentMode]);

  const filteredMemos = useMemo(() => {
    let list = memos;
    if (currentMode !== SceneMode.ALL) {
      // Logic: A memo matches if its analysis categories include the current mode
      list = list.filter(m => {
        if (!m.analysis) return m.sceneMode === currentMode;
        return m.analysis.categories.some(cat => cat.toLowerCase().includes(currentMode.toLowerCase().replace('to-do', 'todo')));
      });
    }
    
    // If we are in To-do mode, we filter by the selected calendar logic
    if (currentMode === SceneMode.TODO) {
      if (isSevenDayView) {
        // Show all tasks for the next 7 days
        const start = new Date();
        start.setHours(0,0,0,0);
        const end = new Date();
        end.setDate(end.getDate() + 7);
        end.setHours(23,59,59,999);

        list = list.filter(m => {
          const memoDate = m.analysis?.dueDate ? new Date(m.analysis.dueDate) : new Date(m.timestamp);
          return memoDate >= start && memoDate <= end;
        });
      } else {
        const targetDateStr = getLocalISODate(selectedTodoDate);
        list = list.filter(m => {
          const memoDateStr = m.analysis?.dueDate || getLocalISODate(new Date(m.timestamp));
          return memoDateStr === targetDateStr;
        });
      }
    }
    
    return list;
  }, [memos, currentMode, selectedTodoDate, isSevenDayView]);

  const processContent = async (content: string, hintMode: SceneMode, memoId: string) => {
    try {
      const structuredData: MemoStructuredData = await analyzeTranscript(content, hintMode);
      
      // Determine primary scene mode from categories, ignoring 'To-do' if others are present for primary assignment
      let primaryMode = SceneMode.IDEA;
      const nonTodoCategory = structuredData.categories.find(cat => !cat.toLowerCase().includes('todo'));
      
      if (nonTodoCategory) {
        const cat = nonTodoCategory.toLowerCase();
        if (cat.includes('study')) primaryMode = SceneMode.STUDY;
        else if (cat.includes('meeting')) primaryMode = SceneMode.MEETING;
        else if (cat.includes('personal')) primaryMode = SceneMode.PERSONAL;
        else if (cat.includes('idea')) primaryMode = SceneMode.IDEA;
      } else if (structuredData.categories.some(cat => cat.toLowerCase().includes('todo'))) {
        primaryMode = SceneMode.TODO;
      }

      setMemos(prev => prev.map(m => m.id === memoId ? {
        ...m,
        transcription: content,
        analysis: structuredData,
        sceneMode: primaryMode,
        isProcessing: false
      } : m));

    } catch (err) {
      console.error("AI Analysis Failed:", err);
      setMemos(prev => prev.map(m => m.id === memoId ? {
        ...m,
        transcription: content || "Failed to process content.",
        isProcessing: false
      } : m));
    } finally {
      setIsAnyProcessing(false);
    }
  };

  const handleStartRecording = () => {
    // Optional: Add haptic feedback or sound
  };

  const handleStopRecording = async (audioBlob: Blob) => {
    setIsAnyProcessing(true);
    const newMemoId = Date.now().toString();
    const hintMode = currentMode === SceneMode.ALL ? SceneMode.IDEA : currentMode;
    
    const tempMemo: Memo = {
      id: newMemoId,
      timestamp: Date.now(),
      transcription: "Transcribing and processing audio...",
      sceneMode: hintMode,
      isProcessing: true
    };
    
    setMemos(prev => [tempMemo, ...prev]);
    // In a real app, you would process the audioBlob with a speech-to-text service
    // Simulation:
    const simulatedTranscript = "在碳盘查的项目会上，领导关注生态合作方案，下周二要去服务商谈合作方案";
    await processContent(simulatedTranscript, hintMode, newMemoId);
  };

  const handleTextSubmit = async (text: string) => {
    setIsAnyProcessing(true);
    const newMemoId = Date.now().toString();
    const hintMode = currentMode === SceneMode.ALL ? SceneMode.IDEA : currentMode;
    
    const tempMemo: Memo = {
      id: newMemoId,
      timestamp: Date.now(),
      transcription: text,
      sceneMode: hintMode,
      isProcessing: true
    };
    
    setMemos(prev => [tempMemo, ...prev]);
    await processContent(text, hintMode, newMemoId);
  };

  const handleCalendarDateSelect = (date: Date) => {
    setSelectedTodoDate(date);
    setIsSevenDayView(false);
  };

  return (
    <Layout>
      <div className="px-6 pt-6 pb-24">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-1">Your Mind, Organized.</h2>
          <p className="text-slate-500 font-medium">Capture thoughts at the speed of sound.</p>
        </div>

        <div className="flex gap-2 justify-center flex-wrap pb-4 mb-8 sticky top-16 bg-white/80 backdrop-blur-md z-10 py-2">
          {(Object.values(SceneMode)).map((mode) => (
            <button
              key={mode}
              onClick={() => setCurrentMode(mode)}
              disabled={isAnyProcessing}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                currentMode === mode 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Enhanced To-do Calendar Section */}
        {currentMode === SceneMode.TODO && (
          <TodoCalendar 
            memos={memos.filter(m => m.analysis?.categories?.some(cat => cat.toLowerCase().includes('todo')))} 
            selectedDate={selectedTodoDate}
            onDateSelect={handleCalendarDateSelect}
            isSevenDayView={isSevenDayView}
            onSevenDayViewToggle={() => setIsSevenDayView(true)}
          />
        )}

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {currentMode === SceneMode.ALL ? 'Recent Activities' : 
               currentMode === SceneMode.TODO ? (isSevenDayView ? 'Next 7 Days Tasks' : `${selectedTodoDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Tasks`) : 
               `${currentMode} Activities`}
            </h3>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
              {filteredMemos.length} {currentMode === SceneMode.ALL ? 'TOTAL' : currentMode.toUpperCase()}
            </span>
          </div>
          
          {filteredMemos.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300 animate-in fade-in duration-700">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <p className="font-bold text-center">
                {currentMode === SceneMode.TODO 
                  ? (isSevenDayView ? "No tasks scheduled for the next 7 days." : `No tasks scheduled for ${selectedTodoDate.toLocaleDateString('en-US', { weekday: 'long' })}.`)
                  : `No ${currentMode.toLowerCase()} recordings yet.`}
              </p>
            </div>
          ) : (
            filteredMemos.map(memo => (
              <MemoCard 
                key={memo.id} 
                memo={memo} 
                onClick={setSelectedMemo} 
              />
            ))
          )}
        </div>
      </div>

      {selectedMemo && (
        <MemoDetail 
          memo={selectedMemo} 
          onClose={() => setSelectedMemo(null)} 
        />
      )}

      <Recorder 
        onStart={handleStartRecording} 
        onStop={handleStopRecording} 
        onTextSubmit={handleTextSubmit}
        isProcessing={isAnyProcessing}
        selectedMode={currentMode === SceneMode.ALL ? SceneMode.IDEA : currentMode}
        onModeChange={setCurrentMode}
      />
    </Layout>
  );
};

export default App;
