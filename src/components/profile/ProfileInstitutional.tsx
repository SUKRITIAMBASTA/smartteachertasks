'use client';

import React from 'react';
import { Building2, GraduationCap, Calendar } from 'lucide-react';

interface ProfileInstitutionalProps {
  user: any;
}

export default function ProfileInstitutional({ user }: ProfileInstitutionalProps) {
  return (
    <div className="glass-card p-8 border-2 border-indigo-50/50 shadow-xl shadow-indigo-100/10 h-full">
      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
         <Building2 size={16} className="text-indigo-500" /> Academic Placement
      </h2>
      <div className="space-y-6">
         <div className="flex items-center justify-between border-b border-slate-100 pb-5 last:border-0">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm"><Building2 size={24} /></div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Department / Branch</p>
                  <p className="text-lg font-bold text-slate-900 leading-tight">{user.department || 'Central Administration'}</p>
               </div>
            </div>
         </div>

         {user.role === 'student' && (
           <div className="flex items-center justify-between border-b border-slate-100 pb-5 last:border-0">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-sm"><GraduationCap size={24} /></div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Academic Status</p>
                   <p className="text-lg font-bold text-slate-900 leading-tight">Semester {user.semester || 1}</p>
                </div>
             </div>
           </div>
         )}

         <div className="flex items-center justify-between border-b border-slate-100 pb-5 last:border-0">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-sm"><Calendar size={24} /></div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Institutional Cycle</p>
                  <p className="text-lg font-bold text-slate-900 leading-tight">Active — 2026-27 Session</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
