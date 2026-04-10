'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import { AlertCircle, CheckCircle2, BookOpen, ChevronDown, Users, BarChart3, Award, Save, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const MARK_FIELDS = [
  { key: 'attendanceMarks',   label: 'Attendance', max: 5   },
  { key: 'assignmentMarks',   label: 'Assignment',  max: 5   },
  { key: 'midSemMarks',       label: 'Mid-Sem',     max: 10  },
  { key: 'internalVivaMarks', label: 'Int. Viva',   max: 10  },
  { key: 'externalVivaMarks', label: 'Ext. Viva',   max: 10  },
  { key: 'endSemMarks',       label: 'End-Sem',     max: 60  },
];

function gradeColor(grade: string) {
  const map: Record<string, string> = {
    'A+': 'bg-emerald-100 text-emerald-700',
    'A':  'bg-green-100  text-green-700',
    'B':  'bg-blue-100   text-blue-700',
    'C':  'bg-yellow-100 text-yellow-700',
    'D':  'bg-orange-100 text-orange-700',
    'E':  'bg-red-100    text-red-600',
    'F':  'bg-red-200    text-red-800',
  };
  return map[grade] || 'bg-slate-100 text-slate-600';
}

function calcTotal(row: Record<string, number>) {
  return MARK_FIELDS.reduce((s, f) => s + (Number(row[f.key]) || 0), 0);
}

function calcGrade(total: number) {
  if (total > 90) return 'A+';
  if (total > 80) return 'A';
  if (total > 70) return 'B';
  if (total > 60) return 'C';
  if (total > 50) return 'D';
  if (total > 40) return 'E';
  return 'F';
}

export default function FacultyGradingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  const [subjects,         setSubjects]         = useState<any[]>([]);
  const [students,         setStudents]         = useState<any[]>([]);
  const [selectedSubject,  setSelectedSubject]  = useState('');
  const [filterSem,        setFilterSem]        = useState<number | ''>('');
  const [marksData,        setMarksData]        = useState<Record<string, any>>({});
  const [saving,           setSaving]           = useState<Record<string, boolean>>({});
  const [saved,            setSaved]            = useState<Record<string, boolean>>({});
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [success,          setSuccess]          = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && role === 'student') router.push('/dashboard');
  }, [status, role, router]);

  /* ------ Fetch subjects & students ------ */
  useEffect(() => {
    if (!session || role === 'student') return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [subRes, stuRes] = await Promise.all([
          fetch('/api/faculty/teaching?type=subjects'),
          fetch('/api/faculty/teaching?type=students'),
        ]);
        const [subs, stus] = await Promise.all([subRes.json(), stuRes.json()]);
        const subArr = Array.isArray(subs) ? subs : [];
        const stuArr = Array.isArray(stus) ? stus : [];
        setSubjects(subArr);
        setStudents(stuArr);
        if (subArr.length > 0) setSelectedSubject(subArr[0]._id);
      } catch {
        setError('Failed to load academic records.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, role]);

  /* ------ Load existing grades for selected subject ------ */
  useEffect(() => {
    if (!selectedSubject) return;
    const loadGrades = async () => {
      try {
        const res = await fetch(`/api/grading/grades?subjectId=${selectedSubject}`);
        const data = await res.json();
        const mapped: Record<string, any> = {};
        if (Array.isArray(data)) {
          data.forEach((g: any) => {
            const sid = g.student?._id || g.student;
            mapped[sid] = {
              attendanceMarks:   g.attendanceMarks   || 0,
              assignmentMarks:   g.assignmentMarks   || 0,
              midSemMarks:       g.midSemMarks       || 0,
              internalVivaMarks: g.internalVivaMarks || 0,
              externalVivaMarks: g.externalVivaMarks || 0,
              endSemMarks:       g.endSemMarks       || 0,
            };
          });
        }
        setMarksData(mapped);
        setSaved({});
      } catch {
        /* silent */
      }
    };
    loadGrades();
  }, [selectedSubject]);

  /* ------ Derived ------ */
  const selectedSubjectObj = subjects.find(s => s._id === selectedSubject);
  const subjectSemesters   = [...new Set(subjects.map((s: any) => s.semester))].sort((a,b) => a-b);

  const filteredStudents = useMemo(() => {
    if (!filterSem) return students;
    return students.filter(s => s.semester === filterSem);
  }, [students, filterSem]);

  /* ------ Mark change ------ */
  const handleMarkChange = (studentId: string, field: string, value: string, max: number) => {
    const n = Math.min(Math.max(Number(value) || 0, 0), max);
    setMarksData(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [field]: n } }));
    setSaved(prev => ({ ...prev, [studentId]: false }));
  };

  /* ------ Save ------ */
  const handleSave = async (studentId: string) => {
    setSaving(prev => ({ ...prev, [studentId]: true }));
    setError('');
    try {
      const res = await fetch('/api/grading/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, subjectId: selectedSubject, ...(marksData[studentId] || {}) }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(prev => ({ ...prev, [studentId]: true }));
      setSuccess('Marks saved successfully.');
      setTimeout(() => setSuccess(''), 2500);
    } catch {
      setError('Save failed — retry.');
    } finally {
      setSaving(prev => ({ ...prev, [studentId]: false }));
    }
  };

  /* ------ Stats ------ */
  const stats = useMemo(() => {
    const entries = filteredStudents.map(s => {
      const row = marksData[s._id] || {};
      const total = calcTotal(row);
      return { total, grade: calcGrade(total) };
    });
    const count = entries.length;
    const avg   = count ? +(entries.reduce((s, e) => s + e.total, 0) / count).toFixed(1) : 0;
    const pass  = entries.filter(e => e.total >= 40).length;
    const dist: Record<string, number> = {};
    entries.forEach(e => { dist[e.grade] = (dist[e.grade] || 0) + 1; });
    return { count, avg, pass, fail: count - pass, dist };
  }, [filteredStudents, marksData]);

  if (loading || status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Grading Grid...</p>
      </div>
    );
  }

  if (role === 'student') return null;

  return (
    <div className="space-y-6 pb-12 px-4 md:px-0">

      {/* Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Award size={24} className="text-indigo-500" /> Grading System
          </h1>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Subject-wise · Semester-wise · Auto-grade calculation
          </p>
        </div>
        {/* Semester quick filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester:</span>
          {(['', ...subjectSemesters] as any[]).map(sem => (
            <button
              key={sem}
              onClick={() => setFilterSem(sem === '' ? '' : sem)}
              className={`px-3 py-1.5 rounded-lg font-black text-[10px] border transition-all ${
                filterSem === (sem === '' ? '' : sem)
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                  : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'
              }`}
            >
              {sem === '' ? 'All' : `Sem ${sem}`}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-sm font-bold flex items-center gap-2">
            <AlertCircle size={16} />{error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />{success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject selector + Stats row */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Subject picker */}
        <div className="md:col-span-2 glass-card p-5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-2">
            <BookOpen size={11} /> Select Subject
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-400 font-bold text-sm appearance-none pr-10"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              {subjects.length === 0 ? (
                <option>No subjects assigned yet</option>
              ) : (
                subjects.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} — Sem {s.semester} ({s.code})
                  </option>
                ))
              )}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          {selectedSubjectObj && (
            <p className="text-[10px] text-indigo-500 font-bold mt-2">
              Semester {selectedSubjectObj.semester} · Code: {selectedSubjectObj.code}
            </p>
          )}
        </div>

        {/* Stats */}
        {[
          { label: 'Students', value: stats.count, icon: Users,      color: 'text-blue-600' },
          { label: 'Avg Marks', value: `${stats.avg}/100`, icon: TrendingUp, color: 'text-indigo-600' },
          { label: 'Pass Rate', value: stats.count ? `${Math.round(stats.pass/stats.count*100)}%` : '—', icon: BarChart3, color: 'text-emerald-600' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-800">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grade Distribution */}
      {stats.count > 0 && (
        <div className="glass-card p-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Grade Distribution</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.dist).sort().map(([g, n]) => (
              <div key={g} className={`px-4 py-2 rounded-xl font-black text-[11px] border ${gradeColor(g)}`}>
                {g}: {n} student{n > 1 ? 's' : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grading Table */}
      {filteredStudents.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="font-black text-slate-400 text-sm uppercase tracking-widest">No students found for this selection.</p>
          <p className="text-[10px] text-slate-300 mt-1">Ensure students are registered in the same department & semester as your subjects.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="text-left px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sem</th>
                  {MARK_FIELDS.map(f => (
                    <th key={f.key} className="px-2 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      {f.label}<br /><span className="text-slate-300">/{f.max}</span>
                    </th>
                  ))}
                  <th className="px-3 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-3 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => {
                  const row   = marksData[student._id] || {};
                  const total = calcTotal(row);
                  const grade = calcGrade(total);
                  const isSaving = saving[student._id];
                  const isSaved  = saved[student._id];
                  return (
                    <tr key={student._id} className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                      <td className="px-5 py-3">
                        <p className="font-bold text-sm text-slate-800">{student.name}</p>
                        <p className="text-[10px] text-slate-400">{student.email}</p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-[11px] font-black text-slate-500">S{student.semester}</span>
                      </td>
                      {MARK_FIELDS.map(f => (
                        <td key={f.key} className="px-2 py-3">
                          <input
                            type="number"
                            min={0}
                            max={f.max}
                            value={row[f.key] ?? ''}
                            onChange={e => handleMarkChange(student._id, f.key, e.target.value, f.max)}
                            className="w-14 text-center px-2 py-2 bg-white border-2 border-slate-100 rounded-lg font-black text-sm outline-none focus:border-indigo-400 transition-all"
                            placeholder="0"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-3 text-center">
                        <span className="font-black text-slate-800">{total}</span>
                        <span className="text-slate-300 text-xs">/100</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-3 py-1 rounded-lg font-black text-[11px] ${gradeColor(grade)}`}>
                          {grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleSave(student._id)}
                          disabled={isSaving}
                          className={`flex items-center gap-1.5 mx-auto px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            isSaved
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-95'
                          } disabled:opacity-50`}
                        >
                          {isSaving ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : isSaved ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <Save size={12} />
                          )}
                          {isSaved ? 'Saved' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}