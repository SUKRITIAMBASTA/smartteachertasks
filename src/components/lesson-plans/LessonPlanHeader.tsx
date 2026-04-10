'use client';

import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

export default function LessonPlanHeader() {
  return (
    <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <BookOpen size={24} className="text-indigo-500" />
          Lesson Plan Generator
        </h1>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          AI-generated weekly plans · Subject-wise · Syllabus-aligned
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
        <Sparkles size={14} className="text-indigo-500 animate-pulse" />
        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Powered by DeepSeek AI</span>
      </div>
    </div>
  );
}
