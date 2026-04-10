'use client';

import React from 'react';
import { UserCheck } from 'lucide-react';
import GradingRow from './GradingRow';

interface GradingTableProps {
  students: any[];
  marksData: Record<string, any>;
  saving: boolean;
  onMarkChange: (studentId: string, field: string, value: string) => void;
  onSave: (studentId: string) => void;
}

export default function GradingTable({ students, marksData, saving, onMarkChange, onSave }: GradingTableProps) {
  return (
    <div className="glass-card overflow-hidden shadow-xl shadow-indigo-100/20 border-2 border-indigo-50/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest min-w-[200px]">Student Identity</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Attendance (5)</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Lab/Assign (5)</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Mid-Sem (10)</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Int. Viva (10)</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Ext. Viva (10)</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase text-indigo-600 tracking-widest text-center bg-indigo-50/30 font-bold">End-Sem (60)</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase text-indigo-600 tracking-widest text-center font-bold">Total (100)</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase text-indigo-600 tracking-widest text-center font-bold">Grade</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {students.map((s) => (
              <GradingRow 
                key={s._id} 
                student={s} 
                marks={marksData[s._id] || {}} 
                saving={saving} 
                onMarkChange={onMarkChange} 
                onSave={onSave} 
              />
            ))}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <div className="p-20 text-center space-y-4">
           <div className="inline-flex p-4 bg-slate-50 rounded-3xl text-slate-300">
             <UserCheck size={48} />
           </div>
           <h3 className="text-xl font-bold text-slate-800">No Eligible Students</h3>
           <p className="text-slate-500 max-w-xs mx-auto text-sm">
             Update your subject assignments or semester enrollment to populate this evaluation list.
           </p>
        </div>
      )}
    </div>
  );
}
