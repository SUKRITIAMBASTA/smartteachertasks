'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import { 
  BookOpen, Clock, Calendar as CalendarIcon, 
  MapPin, ShieldCheck, GraduationCap, Building2
} from 'lucide-react';
import React from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOTS = ['8:30 am-9:15 am', '9:20 am- 10:05 am', '10:10 am - 10:55 am', '11:00 am- 11:45 am', '11:50 am- 12:35pm', '01:00 pm - 1:45 pm', '1:50 pm- 2:35 pm', '2:40 pm- 3:25 pm', '3:30 pm- 4:15 pm', '04:20 pm- 05:05 pm'];

export default function ViewSchedulePage() {
  const { data: session } = useSession();
  const user: any = session?.user;
  
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApprovedSchedules = async () => {
      if (!user?.role) return;
      
      try {
        // Simple strategy: If student, filter by their sem/dept. If faculty, show their assigned dept.
        const res = await fetch(`/api/schedule?status=approved&departmentId=${user.departmentId || ''}&semester=${user.semester || 1}`);
        const data = await res.json();
        setSchedules(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to sync with institutional registry.');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedSchedules();
  }, [user]);

  const routineGrid = useMemo(() => {
    const grid: any = {};
    DAYS.forEach(day => {
      grid[day] = {};
      SLOTS.forEach(slot => { grid[day][slot] = null; });
    });

    schedules.forEach(s => {
      const d = new Date(s.date);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      if (grid[dayName]) {
        // We match by slot. In a real app we'd match more strictly.
        grid[dayName][s.timeSlot] = s;
      }
    });
    return grid;
  }, [schedules]);

  if (loading) return <div className="p-12 text-center font-black animate-pulse text-slate-300">SYNCING OFFICIAL REGISTRY...</div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      
      <header className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] tracking-widest uppercase mb-1">
              <ShieldCheck size={14} /> Official Academic Publication
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Institutional Routine</h1>
           <p className="text-slate-500 font-medium text-sm mt-1">Validated Calendar for {user?.department || 'General'} 2026-27</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
              <GraduationCap size={18} className="text-slate-400" />
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Semester</p>
                 <p className="text-sm font-bold text-slate-900">S{user?.semester || 1}</p>
              </div>
           </div>
           <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
              <Building2 size={18} className="text-slate-400" />
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Branch</p>
                 <p className="text-sm font-bold text-slate-900">{user?.department || 'N/A'}</p>
              </div>
           </div>
        </div>
      </header>

      {/* AMITY STYLE COMPACT GRID */}
      <div className="bg-white border-[3px] border-slate-900 rounded-sm shadow-2xl overflow-hidden">
         <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
               <div className="text-center font-black border-b-[3px] border-slate-900">
                  <div className="bg-[#58CCFF] py-2 text-xl tracking-[0.25em] uppercase text-slate-900">AMITY UNIVERSITY PATNA</div>
                  <div className="bg-[#FFCC33] py-1.5 text-xs tracking-widest uppercase text-slate-900">APPROVED ACADEMIC SESSION 2026</div>
               </div>

               <div className="grid grid-cols-[80px_repeat(5,1fr)_40px_repeat(5,1fr)] bg-white">
                  <div className="border-r-[3px] border-b-[3px] border-slate-900 bg-slate-50 p-2 font-black text-[10px] text-center uppercase">Day/Time</div>
                  {SLOTS.map((slot, i) => (
                    <React.Fragment key={i}>
                       {i === 5 && (
                         <div className="bg-slate-900 row-span-7 border-b-[3px] border-r-[3px] border-slate-900 flex items-center justify-center z-10">
                            <span className="rotate-[-90deg] font-black text-[9px] tracking-[0.4em] text-white uppercase opacity-40">BREAK</span>
                         </div>
                       )}
                       <div className="border-r-[3px] border-b-[3px] border-slate-900 bg-slate-50 p-2 text-center flex items-center justify-center">
                          <span className="font-black text-[8px] tracking-tight uppercase leading-none">{slot}</span>
                       </div>
                    </React.Fragment>
                  ))}

                  {DAYS.map((day) => (
                    <React.Fragment key={day}>
                       <div className="border-r-[3px] border-b-[3px] border-slate-900 bg-slate-50 p-2 font-black text-[9px] flex items-center justify-center uppercase">{day}</div>
                       {SLOTS.map((slot, idx) => {
                          const item = routineGrid[day]?.[slot];
                          return (
                            <div key={idx} className={`border-r-[3px] border-b-[3px] border-slate-900 min-h-[80px] p-2 flex flex-col items-center justify-center text-center transition-all ${item?.isLab ? 'bg-[#FFFFCC]' : 'hover:bg-slate-50'}`}>
                               {item ? (
                                 <div className="space-y-1">
                                    <div className="text-[9px] font-black leading-tight text-slate-800 px-1 uppercase tracking-tighter">{item.subjectId?.name}</div>
                                    <div className="text-[8px] font-bold text-slate-400 italic">({item.facultyId?.name})</div>
                                    <div className="flex items-center justify-center gap-1 mt-1">
                                       <MapPin size={8} className="text-blue-500" />
                                       <span className="text-[7px] font-black text-blue-600 uppercase">Room {item.roomId?.roomNo}</span>
                                    </div>
                                 </div>
                               ) : (
                                 <div className="w-full h-full" />
                               )}
                            </div>
                          );
                       })}
                    </React.Fragment>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <footer className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-xl">
         <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg"><CalendarIcon size={20} /></div>
            <div>
               <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Digital Publication Node</p>
               <p className="text-sm font-bold">Amity Official Schedule Sync @ 2026</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
            <div className="text-sm font-bold text-green-400 flex items-center gap-2 justify-end">
               <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
               OFFICIALLY APPROVED
            </div>
         </div>
      </footer>
    </div>
  );
}
