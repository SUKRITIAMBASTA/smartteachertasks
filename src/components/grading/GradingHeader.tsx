'use client';

import React from 'react';
import { ClipboardCheck, BookOpen } from 'lucide-react';

interface GradingHeaderProps {
  subjects: any[];
  selectedSubject: string;
  onSubjectChange: (id: string) => void;
}

export default function GradingHeader({ subjects, selectedSubject, onSubjectChange }: GradingHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
           <ClipboardCheck className="text-indigo-600" size={32} />
           Specialized Grade Entry
        </h1>
        <p className="text-slate-500 text-sm mt-1">Upload Internal (40) and External (60) marks for assigned student cohorts.</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
         <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <BookOpen size={20} />
         </div>
         <select 
           className="bg-transparent font-bold text-slate-700 outline-none pr-4 appearance-none cursor-pointer"
           value={selectedSubject}
           onChange={(e) => onSubjectChange(e.target.value)}
         >
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
            ))}
         </select>
      </div>
    </div>
  );
}
