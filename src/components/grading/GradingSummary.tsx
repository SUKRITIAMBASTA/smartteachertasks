'use client';

import React from 'react';
import { GraduationCap, Calculator, ArrowRight } from 'lucide-react';

interface GradingSummaryProps {
  students: any[];
  marksData: Record<string, any>;
  saving: boolean;
}

export default function GradingSummary({ students, marksData, saving }: GradingSummaryProps) {
  
  const calculateTotal = (sId: string) => {
    const m = marksData[sId] || {};
    return (m.attendanceMarks || 0) + (m.assignmentMarks || 0) + (m.midSemMarks || 0) + (m.internalVivaMarks || 0) + (m.externalVivaMarks || 0) + (m.endSemMarks || 0);
  };

  const classAvg = students.length > 0 
    ? (students.reduce((acc, s) => acc + calculateTotal(s._id), 0) / students.length).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="glass-card p-6 border-l-4 border-emerald-500 flex items-center justify-between hover:shadow-lg transition-all group">
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 group-hover:text-emerald-600 transition-colors">Digital Pass Rate</div>
            <div className="text-2xl font-black text-slate-800">100%</div>
          </div>
          <GraduationCap className="text-emerald-500 opacity-20 group-hover:opacity-40 transition-opacity" size={40} />
       </div>
       
       <div className="glass-card p-6 border-l-4 border-indigo-500 flex items-center justify-between hover:shadow-lg transition-all group">
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 group-hover:text-indigo-600 transition-colors">Class Avg Score</div>
            <div className="text-2xl font-black text-slate-800">{classAvg}</div>
          </div>
          <Calculator className="text-indigo-500 opacity-20 group-hover:opacity-40 transition-opacity" size={40} />
       </div>

       <div className="glass-card p-6 border-l-4 border-rose-500 flex items-center justify-between hover:shadow-lg transition-all group">
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 group-hover:text-rose-600 transition-colors">Evaluation Status</div>
            <div className="text-sm font-black text-rose-600 uppercase tracking-widest">
               {saving ? 'Synchronizing...' : 'Official Draft'}
            </div>
          </div>
          <ArrowRight className="text-rose-500 opacity-20 group-hover:opacity-40 transition-opacity" size={40} />
       </div>
    </div>
  );
}
