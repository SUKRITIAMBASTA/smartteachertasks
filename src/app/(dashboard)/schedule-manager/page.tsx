'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Zap, 
  Building2, Sparkles, Filter, ShieldCheck, 
  Beaker, Users, GraduationCap, ChevronRight,
  BookOpen, ClipboardList, PenTool, Maximize2, Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const CONFIG = {
  routine: {
    slots: ['8:30 am-9:15 am', '9:20 am- 10:05 am', '10:10 am - 10:55 am', '11:00 am- 11:45 am', '11:50 am- 12:35pm', '01:00 pm - 1:45 pm', '1:50 pm- 2:35 pm', '2:40 pm- 3:25 pm', '3:30 pm- 4:15 pm', '04:20 pm- 05:05 pm'],
    header: 'CLASS SCHEDULE',
    colors: { bg: 'bg-[#FFF200]', text: 'text-slate-900' }
  },
  midsem: {
    slots: ['10:00am-12:30pm', '01:30pm-04:00pm'],
    header: 'MID-SEM EXAMINATION SCHEDULE',
    colors: { bg: 'bg-orange-400', text: 'text-white' }
  },
  endsem: {
    slots: ['10:00am-01:00pm'],
    header: 'END-SEM EXAMINATION SCHEDULE',
    colors: { bg: 'bg-red-600', text: 'text-white' }
  }
};

export default function ScheduleManagerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFocused = searchParams.get('focus') === 'true';
  const role = (session?.user as any)?.role;

  const [generating, setGenerating] = useState(false);
  const [scheduleType, setScheduleType] = useState<'routine' | 'midsem' | 'endsem'>('routine');
  
  // Hierarchical State
  const [schools, setSchools] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [depts, setDepts] = useState<any[]>([]); 
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSem, setSelectedSem] = useState(1);

  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState('');

  // 🔒 RBAC Protection
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && role !== 'admin') router.push('/dashboard');
  }, [status, role, router]);

  // 🏛️ Initialize Institutional Registries
  useEffect(() => {
    const fetchData = async () => {
       const deptRes = await fetch('/api/academic-structure/departments').then(r => r.json());
       if (Array.isArray(deptRes)) {
         setDepts(deptRes);
         const uniqueSchools = Array.from(new Set(deptRes.map((d: any) => d.name)));
         setSchools(uniqueSchools);
         if (uniqueSchools.length > 0) setSelectedSchool(uniqueSchools[0]);
       }
    };
    fetchData();
  }, []);

  // 🌳 Hierarchical Filter Logic
  const filteredBranches = useMemo(() => {
    const branches = depts.filter(d => d.name === selectedSchool);
    if (branches.length > 0 && !branches.some(b => b._id === selectedBranch)) {
       setSelectedBranch(branches[0]._id);
    }
    return branches;
  }, [selectedSchool, depts]);

  const fetchRoutines = async () => {
    if (!selectedBranch) return;
    setLoadingSchedule(true);
    try {
      const res = await fetch(`/api/schedule?type=${scheduleType}&departmentId=${selectedBranch}&semester=${selectedSem}`);
      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch {
      setError('Institutional registry sync failed.');
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [scheduleType, selectedBranch, selectedSem]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/ai/schedule', {
         method: 'POST',
         body: JSON.stringify({ type: scheduleType, numClassrooms: 30, numLabs: 5 }),
         headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) fetchRoutines();
      else setError(data.error || 'Generation failed');
    } catch(err) { 
      setError('AI Orchestrator connectivity issues.');
    } finally { 
      setGenerating(false); 
    }
  };

  const handleApprove = async () => {
    setLoadingSchedule(true);
    try {
      const res = await fetch('/api/schedule/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: scheduleType, departmentId: selectedBranch, semester: selectedSem })
      });
      const data = await res.json();
      if (data.success) fetchRoutines();
    } catch { setError('Approval sequence failure.'); }
    finally { setLoadingSchedule(false); }
  };

  const toggleFocus = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isFocused) params.delete('focus');
    else params.set('focus', 'true');
    router.push(`?${params.toString()}`);
  };

  const currentConfig = CONFIG[scheduleType];
  const isPending = useMemo(() => schedules.length > 0 && schedules.some(s => s.status === 'pending_approval'), [schedules]);
  const branchName = useMemo(() => depts.find(d => d._id === selectedBranch)?.branch || 'CSE', [depts, selectedBranch]);
  const currentDeptBranch = branchName;
  const currentRoomNo = useMemo(() => schedules[0]?.roomId?.roomNo || '508', [schedules]);

  const routineGrid = useMemo(() => {
    const grid: any = {};
    DAYS.forEach(day => {
      grid[day] = {};
      currentConfig.slots.forEach(slot => { grid[day][slot] = null; });
    });

    schedules.forEach(s => {
      const d = new Date(s.date);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      if (grid[dayName]) {
         const slotIdx = schedules.indexOf(s) % currentConfig.slots.length;
         grid[dayName][currentConfig.slots[slotIdx]] = s;
      }
    });
    return grid;
  }, [schedules, currentConfig]);

  if (status === 'loading') return null;

  return (
    <div className={`space-y-6 pb-12 transition-all duration-700 ${isFocused ? 'p-8 bg-slate-50 min-h-screen' : ''}`}>
      
      {/* Institutional Mode Selector */}
      <div className={`flex flex-col lg:flex-row items-center justify-between gap-4 ${isFocused ? 'max-w-[1400px] mx-auto' : ''}`}>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
           {[
             { id: 'routine', icon: BookOpen, label: 'ROUTINE' },
             { id: 'midsem', icon: ClipboardList, label: 'MID-SEM' },
             { id: 'endsem', icon: PenTool, label: 'END-SEM' }
           ].map((t) => (
             <button
               key={t.id}
               onClick={() => setScheduleType(t.id as any)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] tracking-widest uppercase transition-all ${
                 scheduleType === t.id ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
                <t.icon size={14} /> {t.label}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-3">
           <button onClick={toggleFocus} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
              {isFocused ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
           </button>
           <button 
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] tracking-[0.15em] shadow-lg hover:bg-black transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
           >
              {generating ? <Clock className="animate-spin" size={14} /> : <Sparkles size={14} />}
              {generating ? 'GENERATING...' : 'AI RE-GENERATE'}
           </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isFocused ? '' : 'xl:grid-cols-4'} gap-6 ${isFocused ? 'max-w-[1400px] mx-auto' : ''}`}>
        
        {/* Hierarchical Filter - Hide Sidebar style when focused */}
        {!isFocused && (
          <div className="xl:col-span-1 space-y-4">
             <div className="glass-card p-5 border-slate-200 bg-white shadow-xl shadow-blue-500/5">
                <h2 className="text-[9px] font-black text-slate-400 flex items-center gap-2 mb-6 uppercase tracking-[0.2em]">
                   <Filter size={12} /> Institutional Hierarchy
                </h2>
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">University School</label>
                      <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                         {schools.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Academic Branch</label>
                      <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                         {filteredBranches.map(b => <option key={b._id} value={b._id}>{b.branch}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Semester</label>
                      <div className="grid grid-cols-4 gap-1.5">
                         {[1, 3, 5, 7].map(s => <button key={s} onClick={() => setSelectedSem(s)} className={`py-2 rounded-xl font-black text-[10px] border-2 transition-all ${selectedSem === s ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border-slate-50 hover:border-blue-100'}`}>S{s}</button>)}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* PIXEL-PERFECT AMITY GRID */}
        <div className={`${isFocused ? 'w-full' : 'xl:col-span-3'} space-y-4`}>
           
           <AnimatePresence>
              {schedules.length > 0 && isPending && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xl">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg"><Clock size={16} /></div>
                      <p className="text-[10px] font-black tracking-widest uppercase">Draft Pending Official Publication</p>
                   </div>
                   <button onClick={handleApprove} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-black text-[9px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all outline-none">APPROVE & PUBLISH</button>
                </motion.div>
              )}
           </AnimatePresence>

           {/* COMPACT INSTITUTIONAL TABLE */}
           <div className="bg-white border-[3px] border-slate-900 rounded-sm shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                 <div className="min-w-[1100px]">
                    <header className="text-center font-black border-b-[3px] border-slate-900">
                       <div className="bg-[#58CCFF] py-2.5 text-xl border-b-[3px] border-slate-900 tracking-[0.25em] uppercase text-slate-900">AMITY UNIVERSITY PATNA</div>
                       <div className="bg-[#FFCC33] py-2 text-md border-b-[3px] border-slate-900 tracking-widest uppercase text-slate-900">{selectedSchool}</div>
                       <div className={`${currentConfig.colors.bg} ${currentConfig.colors.text} py-1.5 text-[11px] tracking-widest font-black uppercase`}>
                          {currentConfig.header} - {currentDeptBranch} S{selectedSem} (Room {currentRoomNo}) 
                       </div>
                    </header>

                    <div className={`grid ${scheduleType === 'endsem' ? 'grid-cols-[80px_repeat(5,1fr)]' : scheduleType === 'midsem' ? 'grid-cols-[80px_repeat(2,1fr)]' : 'grid-cols-[80px_repeat(5,1fr)_40px_repeat(5,1fr)]'} bg-white relative`}>
                       
                       <div className="border-r-[3px] border-b-[3px] border-slate-900 bg-slate-50 p-2 font-black text-[10px] text-center uppercase">Day/Time</div>
                       {currentConfig.slots.map((slot, i) => (
                          <React.Fragment key={i}>
                             {scheduleType === 'routine' && i === 5 && (
                               <div className="bg-slate-900 row-span-7 border-b-[3px] border-r-[3px] border-slate-900 flex items-center justify-center z-10">
                                  <span className="rotate-[-90deg] font-black text-[10px] tracking-[0.5em] text-white uppercase opacity-30">BREAK</span>
                               </div>
                             )}
                             <div className="border-r-[3px] border-b-[3px] border-slate-900 bg-slate-50 p-2 text-center flex items-center justify-center">
                                <span className="font-black text-[9px] tracking-tight uppercase leading-none">{slot}</span>
                             </div>
                          </React.Fragment>
                       ))}

                       {DAYS.map((day) => (
                          <React.Fragment key={day}>
                             <div className="border-r-[3px] border-b-[3px] border-slate-900 bg-slate-50 p-2 font-black text-[10px] flex items-center justify-center uppercase">{day}</div>
                             {currentConfig.slots.map((slot, idx) => {
                                const item = routineGrid[day]?.[slot];
                                return (
                                  <div key={idx} className={`border-r-[3px] border-b-[3px] border-slate-900 min-h-[85px] p-2 flex flex-col items-center justify-center text-center transition-all ${item?.isLab ? 'bg-[#FFFF99]' : 'hover:bg-slate-50'}`}>
                                     {item ? (
                                       <div className="space-y-1">
                                          <div className="text-[9px] font-black leading-tight text-slate-800 px-1 uppercase tracking-tighter">{item.subjectId?.name}</div>
                                          <div className={`text-[8px] font-bold ${scheduleType !== 'routine' ? 'text-blue-600 font-black' : 'text-slate-400 italic'}`}>
                                             {scheduleType === 'routine' ? `(${item.facultyId?.name})` : `Invig: ${item.facultyId?.name.split(' ')[1]}`}
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

           <footer className="flex items-center justify-between px-6 py-3 bg-white rounded-2xl border-2 border-slate-200 text-[8px] font-black text-slate-300 uppercase tracking-widest shadow-sm">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-blue-200" />
                 * Official Institutional Matrix 2026-27
              </div>
              <p>Amity University Patna - Digital Node</p>
           </footer>
        </div>

      </div>
    </div>
  );
}

import React from 'react';
