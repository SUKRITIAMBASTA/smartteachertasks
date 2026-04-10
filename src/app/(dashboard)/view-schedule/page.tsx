'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import React from 'react';
import { ChevronDown, Filter, BookOpen, GraduationCap } from 'lucide-react';

// Sub-components
import ScheduleHeader from '@/components/schedule/ScheduleHeader';
import ScheduleGrid, { DAYS, SLOTS } from '@/components/schedule/ScheduleGrid';
import ScheduleFooter from '@/components/schedule/ScheduleFooter';

/**
 * Institutional Routine View
 * Displays the officially approved academic calendar with support for dynamic filtering.
 */
export default function ViewSchedulePage() {
  const { data: session } = useSession();
  const user: any = session?.user;
  
  // State for data
  const [schedules, setSchedules] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [facultyAssignments, setFacultyAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for filters
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedSem, setSelectedSem] = useState<number | ''>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // 1. Initial Data Load (Departments)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const dRes = await fetch('/api/academic-structure/departments');
        const dData = await dRes.json();
        setDepartments(Array.isArray(dData) ? dData : []);

        // If faculty, fetch their specific teaching assignments for the lock logic
        if (user?.role === 'faculty') {
          const fRes = await fetch('/api/faculty/teaching?type=subjects');
          const fData = await fRes.json();
          setFacultyAssignments(Array.isArray(fData) ? fData : []);
        }
      } catch (err) {
        console.error('Failed to load metadata');
      }
    };
    fetchInitialData();
  }, [user]);

  // 2. Set defaults based on user profile
  useEffect(() => {
    if (user) {
      if (user.departmentId && !selectedDeptId) setSelectedDeptId(user.departmentId);
      if (user.semester && selectedSem === '') setSelectedSem(user.semester);
    }
  }, [user]);

  // 3. Fetch schedules based on filters
  useEffect(() => {
    const fetchApprovedSchedules = async () => {
      if (!user?.role) return;
      
      try {
        setLoading(true);
        // Build query string based on filters
        const params = new URLSearchParams();
        if (selectedDeptId) params.append('departmentId', selectedDeptId);
        if (selectedSem) params.append('semester', selectedSem.toString());
        
        // Note: status filter is handled internally by the API based on user role 
        // to enforce institutional publication rules.
        
        const res = await fetch(`/api/schedule?${params.toString()}`);
        const data = await res.json();
        const scheduleList = Array.isArray(data) ? data : [];
        setSchedules(scheduleList);

        // Extract unique subjects from the fetched routine for the subject filter
        const uniqueSubjectsMap = new Map();
        scheduleList.forEach(s => {
          if (s.subjectId && s.subjectId._id) {
            uniqueSubjectsMap.set(s.subjectId._id, s.subjectId);
          }
        });
        setSubjects([...uniqueSubjectsMap.values()]);

      } catch (err) {
        setError('Failed to sync with institutional registry.');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedSchedules();
  }, [user, selectedDeptId, selectedSem]);

  // 4. Memoized Grid Logic (with Subject Filtering)
  const routineGrid = useMemo(() => {
    const grid: any = {};
    DAYS.forEach(day => {
      grid[day] = {};
      SLOTS.forEach(slot => { grid[day][slot] = null; });
    });

    schedules.forEach(s => {
      // If a specific subject is selected, filter the grid
      if (selectedSubjectId && s.subjectId?._id !== selectedSubjectId) return;

      const d = new Date(s.date);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      if (grid[dayName]) {
        grid[dayName][s.timeSlot] = s;
      }
    });
    return grid;
  }, [schedules, selectedSubjectId]);

  const currentDeptName = departments.find(d => d._id === selectedDeptId)?.branch || user?.department || 'General';

  if (loading && schedules.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
         <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
         <p className="font-black text-slate-300 uppercase tracking-widest">Syncing Official Registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 px-4 md:px-0">
      
      {/* 1. Official Header */}
      <ScheduleHeader 
        department={currentDeptName} 
        semester={Number(selectedSem) || user?.semester || 1} 
      />

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 p-5 glass-card border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] tracking-widest uppercase mb-2 md:mb-0 w-full md:w-auto mr-4">
          <Filter size={16} /> Filters
        </div>

        {/* Branch Filter */}
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Branch / Dept</label>
          <div className="relative">
            <select 
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                setSelectedSubjectId(''); // Reset subject filter when dept changes
              }}
              disabled={user?.role === 'student'}
              className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 transition-all font-bold text-xs appearance-none ${user?.role === 'student' ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <option value="">All Institutional Departments</option>
              {departments
                .filter(d => {
                   if (user?.role === 'faculty') {
                     // Faculty can only see depts where they teach
                     return facultyAssignments.some(sub => sub.departmentId === d._id);
                   }
                   return true;
                })
                .map((d) => (
                  <option key={d._id} value={d._id}>{d.name} — {d.branch}</option>
                ))}
            </select>
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>

        {/* Semester Filter */}
        <div className="w-32 space-y-1">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Semester</label>
          <div className="relative">
            <select 
              value={selectedSem}
              onChange={(e) => {
                setSelectedSem(e.target.value ? Number(e.target.value) : '');
                setSelectedSubjectId('');
              }}
              disabled={user?.role === 'student'}
              className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 transition-all font-bold text-xs appearance-none ${user?.role === 'student' ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {!user || user.role !== 'student' && <option value="">Select Sem</option>}
              {[1, 2, 3, 4, 5, 6, 7, 8]
                .filter(s => {
                  if (user?.role === 'faculty') {
                    // Faculty are STRICTLY locked to semesters they teach in
                    return facultyAssignments.some(sub => sub.semester === s);
                  }
                  if (user?.role === 'student') {
                    return s === (user.semester || 1);
                  }
                  return true; // Admin sees all
                })
                .map(s => (
                  <option key={s} value={s}>Sem {s}</option>
                ))}
            </select>
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>

        {/* Subject Filter (Dynamic) */}
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Filter by Subject</label>
          <div className="relative">
            <select 
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 transition-all font-bold text-xs appearance-none"
            >
              {user?.role !== 'faculty' && <option value="">Display Full Timetable</option>}
              {subjects
                .filter(s => {
                   if (user?.role === 'faculty') {
                     // Faculty can ONLY see subjects they teach
                     return facultyAssignments.some(sub => sub._id === s._id);
                   }
                   return true;
                })
                .map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
            </select>
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* 2.5 Draft Status Notice (for validation/testing) */}
      {schedules.some(s => s.status === 'pending_approval') && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg"><GraduationCap size={16} /></div>
            <p className="text-[10px] font-black tracking-widest uppercase">Institutional Draft — Pending Official Publication</p>
          </div>
          <p className="text-[9px] font-bold text-slate-400">View-only validation mode active</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-bold shadow-sm">
           {error}
        </div>
      )}

      {/* 3. Amity-Style Compact Grid */}
      <div className="relative">
        {loading && schedules.length > 0 && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <ScheduleGrid routineGrid={routineGrid} />
      </div>

      {/* 4. Official Publication Footer */}
      <ScheduleFooter />
    </div>
  );
}
