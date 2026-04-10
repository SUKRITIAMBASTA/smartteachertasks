'use client';

import React from 'react';
import { ShieldCheck, GraduationCap, Building2 } from 'lucide-react';

interface ScheduleHeaderProps {
  department: string;
  semester: number;
}

export default function ScheduleHeader({ department, semester }: ScheduleHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
         <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] tracking-widest uppercase mb-1">
            <ShieldCheck size={14} /> Official Academic Publication
         </div>
         <h1 className="text-3xl font-black text-slate-900 tracking-tight">Institutional Routine</h1>
         <p className="text-slate-500 font-medium text-sm mt-1">Validated Calendar for {department || 'General'} 2026-27</p>
      </div>

      <div className="flex items-center gap-4">
         <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
            <GraduationCap size={18} className="text-slate-400" />
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Semester</p>
               <p className="text-sm font-bold text-slate-900">S{semester || 1}</p>
            </div>
         </div>
         <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
            <Building2 size={18} className="text-slate-400" />
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Branch</p>
               <p className="text-sm font-bold text-slate-900">{department || 'N/A'}</p>
            </div>
         </div>
      </div>
    </header>
  );
}
