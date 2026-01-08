
import React from 'react';
import { Memo } from '../types';

interface TodoCalendarProps {
  memos: Memo[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  isSevenDayView: boolean;
  onSevenDayViewToggle: () => void;
}

// Helper to get YYYY-MM-DD in local time
const getLocalISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TodoCalendar: React.FC<TodoCalendarProps> = ({ 
  memos, 
  selectedDate, 
  onDateSelect, 
  isSevenDayView, 
  onSevenDayViewToggle 
}) => {
  // Generate next 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const getTaskCountForDate = (date: Date) => {
    const targetDateStr = getLocalISODate(date);
    return memos.filter(m => {
      // Prioritize the AI extracted dueDate, fallback to creation date (local)
      const memoDateStr = m.analysis?.dueDate || getLocalISODate(new Date(m.timestamp));
      return memoDateStr === targetDateStr;
    }).length;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-500 flex flex-col items-center">
      <div className="w-full max-w-sm flex items-center justify-between mb-2 px-1">
        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Schedule</h3>
        <button 
          onClick={onSevenDayViewToggle}
          className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase transition-all border ${
            isSevenDayView 
            ? 'text-white bg-indigo-600 border-indigo-600 shadow-sm' 
            : 'text-indigo-500 bg-indigo-50 border-indigo-100 hover:bg-indigo-100'
          }`}
        >
          7-Day View
        </button>
      </div>
      
      <div className="flex justify-center gap-1.5 w-full">
        {days.map((date, idx) => {
          const count = getTaskCountForDate(date);
          const active = !isSevenDayView && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(date)}
              className={`w-11 flex flex-col items-center py-2 rounded-lg border transition-all ${
                active 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 scale-105 z-10' 
                : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
              }`}
            >
              <span className={`text-[8px] font-bold uppercase mb-0.5 ${active ? 'text-indigo-100' : 'text-slate-400'}`}>
                {date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
              </span>
              <span className="text-xs font-black mb-0.5">
                {date.getDate()}
              </span>
              
              <div className="flex gap-0.5 mt-0.5 h-1 items-center">
                {count > 0 ? (
                  <div 
                    className={`w-1 h-1 rounded-full ${active ? 'bg-white' : 'bg-amber-400'}`}
                  />
                ) : (
                  isToday && !active ? (
                    <div className="w-1 h-1 rounded-full bg-indigo-400 opacity-50" />
                  ) : (
                    <div className="w-1 h-1" />
                  )
                )}
                {count > 1 && <span className={`text-[7px] font-bold ${active ? 'text-white' : 'text-amber-500'}`}>+</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TodoCalendar;
