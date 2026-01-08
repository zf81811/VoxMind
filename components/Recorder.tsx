
import React, { useState, useRef, useEffect } from 'react';
import { SceneMode } from '../types';

interface RecorderProps {
  onStart: () => void;
  onStop: (blob: Blob) => void;
  onTextSubmit: (text: string) => void;
  isProcessing: boolean;
  selectedMode: SceneMode;
  onModeChange: (mode: SceneMode) => void;
}

const Recorder: React.FC<RecorderProps> = ({ onStart, onStop, onTextSubmit, isProcessing, selectedMode, onModeChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTextInputOpen, setIsTextInputOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (isTextInputOpen) setIsTextInputOpen(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/mp3' });
        onStop(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      onStart();
      
      setDuration(0);
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleTextSubmit = () => {
    if (inputText.trim()) {
      onTextSubmit(inputText.trim());
      setInputText('');
      setIsTextInputOpen(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto px-6 pb-10 pt-6 glass-morphism z-30 flex flex-col gap-4 border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {/* Text Input Area - Pops up above the bar */}
      {isTextInputOpen && !isRecording && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative">
            <textarea
              autoFocus
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your thought here..."
              className="w-full h-32 p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none text-white font-medium placeholder:text-slate-500 shadow-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleTextSubmit();
                }
              }}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mr-1">⌘ + Enter</span>
              <button
                onClick={handleTextSubmit}
                disabled={!inputText.trim() || isProcessing}
                className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between relative">
        {/* Left: Duration / Status */}
        <div className="flex-1 flex flex-col">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
            {isRecording ? "RECORDING" : isProcessing ? "ANALYZING" : isTextInputOpen ? "TYPING" : "VOICE FIRST"}
          </span>
          <span className={`text-2xl font-black tabular-nums transition-colors ${isRecording ? 'text-rose-600' : 'text-slate-800'}`}>
            {isRecording ? formatDuration(duration) : (isTextInputOpen ? "..." : "00:00")}
          </span>
        </div>

        {/* Center: Primary Voice Button */}
        <div className="relative flex-shrink-0">
          {isRecording && (
            <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-25"></div>
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 ${
              isRecording 
              ? 'bg-rose-500 hover:bg-rose-600' 
              : isProcessing 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {isRecording ? (
              <div className="w-6 h-6 bg-white rounded-md"></div>
            ) : isProcessing ? (
              <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>

        {/* Right: Secondary Text Input Toggle - Matched to Voice Style */}
        <div className="flex-1 flex justify-end">
          {!isRecording && !isProcessing && (
            <button
              onClick={() => setIsTextInputOpen(!isTextInputOpen)}
              className={`p-3 rounded-full transition-all active:scale-90 shadow-lg border-2 ${
                isTextInputOpen 
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-indigo-100' 
                : 'bg-indigo-600 text-white border-transparent shadow-indigo-200 hover:bg-indigo-700'
              }`}
              title="Type a note"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 14h.01M11 14h.01M15 14h.01M19 14h.01M9 18h6M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recorder;
