'use client';

import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function ScheduleFooter() {
  return (
    <footer className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-xl">
       <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-600 rounded-lg"><CalendarIcon size={20} /></div>
          <div>
             <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest leading-tight">Digital Publication Node</p>
             <p className="text-sm font-bold">Amity Official Schedule Sync @ 2026</p>
          </div>
       </div>
       <div className="text-center md:text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Status</p>
          <div className="text-sm font-bold text-green-400 flex items-center gap-2 md:justify-end">
             <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
             OFFICIALLY APPROVED
          </div>
       </div>
    </footer>
  );
}
