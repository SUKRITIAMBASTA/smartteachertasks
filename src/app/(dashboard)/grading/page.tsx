'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import { 
  ClipboardCheck, UserCheck, BookOpen, 
  Save, AlertCircle, CheckCircle2, 
  Calculator, GraduationCap, ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function FacultyGradingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [marksData, setMarksData] = useState<Record<string, any>>({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 🔒 Role Protection
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && role === 'student') router.push('/dashboard');
  }, [status, role, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch subjects assigned to faculty
      const subRes = await fetch('/api/faculty/teaching?type=subjects');
      const subs = await subRes.json();
      setSubjects(subs);

      // Fetch students faculty teaches
      const stuRes = await fetch('/api/faculty/teaching?type=students');
      const stus = await stuRes.json();
      setStudents(stus);

      if (subs.length > 0) setSelectedSubject(subs[0]._id);
    } catch {
      setError('Failed to load academic records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && role === 'faculty') fetchData();
  }, [session, role]);

  const fetchExistingGrades = async () => {
    if (!selectedSubject) return;
    try {
      const res = await fetch(`/api/grading/grades?subjectId=${selectedSubject}`);
      const data = await res.json();
      const mapped: Record<string, any> = {};
      data.forEach((g: any) => {
        mapped[g.student._id || g.student] = g;
      });
      setMarksData(mapped);
    } catch {
       console.error('Failed to load existing marks');
    }
  };

  useEffect(() => {
    fetchExistingGrades();
  }, [selectedSubject]);

  const handleMarkChange = (studentId: string, field: string, value: string) => {
    const numValue = Math.min(Number(value) || 0, field === 'endSemMarks' ? 60 : (field === 'attendanceMarks' || field === 'assignmentMarks' ? 5 : 10));
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: numValue
      }
    }));
  };

  const calculateTotal = (sId: string) => {
    const m = marksData[sId] || {};
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

  const handleSave = async (studentId: string) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/grading/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          subjectId: selectedSubject,
          ...marksData[studentId]
        })
      });
      if (res.ok) {
        setSuccess('Marks synchronized successfully.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error();
      }
    } catch {
      setError('Evaluation sync failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <ClipboardCheck className="text-indigo-600" size={32} />
             Specialized Grade Entry
          </h1>
          <p className="text-slate-500 text-sm mt-1">Upload Internal (40) and External (60) marks for assigned student cohorts.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <BookOpen size={20} />
           </div>
           <select 
             className="bg-transparent font-bold text-slate-700 outline-none pr-4"
             value={selectedSubject}
             onChange={(e) => setSelectedSubject(e.target.value)}
           >
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
           </select>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3">
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-bold flex items-center gap-3">
            <CheckCircle2 size={18} /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marks Entry Table */}
      <div className="glass-card overflow-hidden shadow-xl shadow-indigo-100/20">
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
                <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center bg-indigo-50/30">End-Sem (60)</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-indigo-600 tracking-widest text-center font-bold">Total (100)</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-indigo-600 tracking-widest text-center font-bold">Grade</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {students.map((s) => {
                const total = calculateTotal(s._id);
                const grade = getLetterGrade(total);
                const m = marksData[s._id] || {};

                return (
                  <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">{s.department} • SEM {s.semester}</span>
                      </div>
                    </td>
                    
                    {/* Attendance */}
                    <td className="px-2 py-4">
                      <input 
                        type="number" max="5" min="0" placeholder="0"
                        className="w-16 mx-auto block px-2 py-2 bg-white border border-slate-200 rounded-lg text-center font-bold focus:border-indigo-500 outline-none"
                        value={m.attendanceMarks || ''}
                        onChange={(e) => handleMarkChange(s._id, 'attendanceMarks', e.target.value)}
                      />
                    </td>

                    {/* Assignment */}
                    <td className="px-2 py-4">
                      <input 
                        type="number" max="5" min="0" placeholder="0"
                        className="w-16 mx-auto block px-2 py-2 bg-white border border-slate-200 rounded-lg text-center font-bold focus:border-indigo-500 outline-none"
                        value={m.assignmentMarks || ''}
                        onChange={(e) => handleMarkChange(s._id, 'assignmentMarks', e.target.value)}
                      />
                    </td>

                    {/* Mid Sem */}
                    <td className="px-2 py-4">
                      <input 
                        type="number" max="10" min="0" placeholder="0"
                        className="w-16 mx-auto block px-2 py-2 bg-white border border-slate-200 rounded-lg text-center font-bold focus:border-indigo-500 outline-none"
                        value={m.midSemMarks || ''}
                        onChange={(e) => handleMarkChange(s._id, 'midSemMarks', e.target.value)}
                      />
                    </td>

                    {/* Internal Viva */}
                    <td className="px-2 py-4">
                      <input 
                        type="number" max="10" min="0" placeholder="0"
                        className="w-16 mx-auto block px-2 py-2 bg-white border border-slate-200 rounded-lg text-center font-bold focus:border-indigo-500 outline-none"
                        value={m.internalVivaMarks || ''}
                        onChange={(e) => handleMarkChange(s._id, 'internalVivaMarks', e.target.value)}
                      />
                    </td>

                    {/* External Viva */}
                    <td className="px-2 py-4">
                      <input 
                        type="number" max="10" min="0" placeholder="0"
                        className="w-16 mx-auto block px-2 py-2 bg-white border border-slate-200 rounded-lg text-center font-bold focus:border-indigo-500 outline-none"
                        value={m.externalVivaMarks || ''}
                        onChange={(e) => handleMarkChange(s._id, 'externalVivaMarks', e.target.value)}
                      />
                    </td>

                    {/* End Sem */}
                    <td className="px-2 py-4 bg-indigo-50/10">
                      <input 
                        type="number" max="60" min="0" placeholder="0"
                        className="w-16 mx-auto block px-2 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-center font-black text-indigo-700 focus:border-indigo-500 outline-none"
                        value={m.endSemMarks || ''}
                        onChange={(e) => handleMarkChange(s._id, 'endSemMarks', e.target.value)}
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                       <span className="text-sm font-black text-slate-800">{total}</span>
                    </td>

                    <td className="px-4 py-4 text-center">
                       <span className={`text-[11px] font-black px-2 py-1 rounded-md ${
                         grade === 'A+' ? 'bg-emerald-500 text-white' :
                         grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                         grade === 'B' ? 'bg-blue-100 text-blue-700' :
                         grade === 'C' ? 'bg-amber-100 text-amber-700' :
                         'bg-rose-100 text-rose-700'
                       }`}>
                         {grade}
                       </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleSave(s._id)}
                         disabled={saving}
                         className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                         title="Sync Student Marks"
                       >
                         <Save size={20} />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {students.length === 0 && (
          <div className="p-20 text-center space-y-4">
             <div className="inline-flex p-4 bg-slate-50 rounded-3xl text-slate-300">
               <UserCheck size={48} />
             </div>
             <h3 className="text-xl font-bold text-slate-800">No Eligible Students</h3>
             <p className="text-slate-500 max-w-xs mx-auto">Update your subject assignments or semester enrollment to populate this list.</p>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-6 border-l-4 border-emerald-500 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Pass Rate</div>
              <div className="text-2xl font-black text-slate-800">100%</div>
            </div>
            <GraduationCap className="text-emerald-500 opacity-20" size={40} />
         </div>
         
         <div className="glass-card p-6 border-l-4 border-indigo-500 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Class Avg</div>
              <div className="text-2xl font-black text-slate-800">
                 {(students.reduce((acc, s) => acc + calculateTotal(s._id), 0) / (students.length || 1)).toFixed(1)}
              </div>
            </div>
            <Calculator className="text-indigo-500 opacity-20" size={40} />
         </div>

         <div className="glass-card p-6 border-l-4 border-rose-500 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status</div>
              <div className="text-sm font-black text-rose-600 uppercase tracking-widest">
                 {saving ? 'Synchronizing...' : 'Live Draft'}
              </div>
            </div>
            <ArrowRight className="text-rose-500 opacity-20" size={40} />
         </div>
      </div>
    </div>
  );
}