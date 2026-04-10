'use client';

import React from 'react';
import { Save } from 'lucide-react';

interface GradingRowProps {
  student: any;
  marks: any;
  saving: boolean;
  onMarkChange: (studentId: string, field: string, value: string) => void;
  onSave: (studentId: string) => void;
}

export default function GradingRow({ student, marks, saving, onMarkChange, onSave }: GradingRowProps) {
  const m = marks || {};
  
  const calculateTotal = () => {
    return (m.attendanceMarks || 0) + (m.assignmentMarks || 0) + (m.midSemMarks || 0) + (m.internalVivaMarks || 0) + (m.externalVivaMarks || 0) + (m.endSemMarks || 0);
  };

  const getLetterGrade = (total: number) => {
    if (total > 90) return 'A+';
    if (total > 80) return 'A';
    if (total > 70) return 'B';
    if (total > 60) return 'C';
    if (total > 50) return 'D';
    if (total > 40) return 'E';
    return 'F';
  };

  const total = calculateTotal();
  const grade = getLetterGrade(total);

  return (
    <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-sm mb-1">{student.name}</span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
            {student.department} • SEM {student.semester}
          </span>
        </div>
      </td>
      
      {/* Dynamic Mark Inputs */}
      {[
        { field: 'attendanceMarks', max: 5 },
        { field: 'assignmentMarks', max: 5 },
        { field: 'midSemMarks', max: 10 },
        { field: 'internalVivaMarks', max: 10 },
        { field: 'externalVivaMarks', max: 10 }
      ].map((cfg) => (
        <td key={cfg.field} className="px-2 py-4">
          <input 
            type="number" max={cfg.max} min="0" placeholder="0"
            className="w-16 mx-auto block px-2 py-2 bg-white border border-slate-200 rounded-lg text-center font-bold focus:border-indigo-500 outline-none transition-all"
            value={m[cfg.field] || ''}
            onChange={(e) => onMarkChange(student._id, cfg.field, e.target.value)}
          />
        </td>
      ))}

      {/* End Sem (Primary Evaluation) */}
      <td className="px-2 py-4 bg-indigo-50/10">
        <input 
          type="number" max="60" min="0" placeholder="0"
          className="w-16 mx-auto block px-2 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-center font-black text-indigo-700 focus:border-indigo-500 outline-none transition-all shadow-sm shadow-indigo-100/50"
          value={m.endSemMarks || ''}
          onChange={(e) => onMarkChange(student._id, 'endSemMarks', e.target.value)}
        />
      </td>

      <td className="px-4 py-4 text-center">
         <span className="text-sm font-black text-slate-800">{total}</span>
      </td>

      <td className="px-4 py-4 text-center">
         <span className={`text-[11px] font-black px-2 py-1 rounded-md border shadow-sm ${
           grade === 'A+' ? 'bg-emerald-500 text-white border-emerald-600' :
           grade === 'A' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
           grade === 'B' ? 'bg-blue-100 text-blue-700 border-blue-200' :
           grade === 'C' ? 'bg-amber-100 text-amber-700 border-amber-200' :
           'bg-rose-100 text-rose-700 border-rose-200'
         }`}>
           {grade}
         </span>
      </td>

      <td className="px-6 py-4 text-right">
         <button 
           onClick={() => onSave(student._id)}
           disabled={saving}
           className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95 disabled:opacity-50"
           title="Sync Student Marks"
         >
           <Save size={20} />
         </button>
      </td>
    </tr>
  );
}
