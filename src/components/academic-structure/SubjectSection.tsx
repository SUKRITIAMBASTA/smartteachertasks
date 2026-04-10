'use client';

import React, { useState } from 'react';
import { BookOpen, Plus, Users, Trash2, X, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

interface SubjectSectionProps {
  subjects: any[];
  onRefresh?: () => void;
}

export default function SubjectSection({ subjects, onRefresh }: SubjectSectionProps) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFaculty = async () => {
    try {
      const res = await fetch('/api/users?role=faculty&limit=100');
      const data = await res.json();
      setFacultyList(data.users || []);
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
    }
  };

  const handleAssign = async (facultyId: string) => {
    setLoading(true);
    try {
      await fetch('/api/academic-structure/subjects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSubject._id, assignedFaculty: facultyId })
      });
      setShowAssignModal(false);
      onRefresh && onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanent Action: Delete this subject from curriculum?')) return;
    try {
      await fetch(`/api/academic-structure/subjects?id=${id}`, { method: 'DELETE' });
      onRefresh && onRefresh();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <div className="glass-card p-6 border-2 border-indigo-50/50 shadow-xl shadow-indigo-100/10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
             <BookOpen className="text-indigo-600" size={24} />
             Curriculum & Faculty Assignment
          </h2>
          <button 
             className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all uppercase tracking-widest"
             onClick={() => toast.info('Administrative Action: Module under design')}
          >
             <Plus size={16} /> Add Subject
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest text-[10px] font-black text-slate-400">
                <th className="px-6 py-4">Subject Identity</th>
                <th className="px-6 py-4">Institutional Unit</th>
                <th className="px-6 py-4">Assigned Evaluator</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subjects.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50/50 group transition-all">
                   <td className="px-6 py-4">
                      <div className="flex flex-col">
                         <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{s.name}</span>
                         <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block w-fit border border-slate-200">
                            {s.code}
                         </span>
                      </div>
                   </td>
                   <td className="px-6 py-4">
                      <div className="flex flex-col">
                         <span className="text-xs font-black text-indigo-600">{s.departmentId?.name}</span>
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.departmentId?.branch}</span>
                      </div>
                   </td>
                   <td className="px-6 py-4">
                      {!s.assignedFaculty ? (
                         <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 animate-pulse">UNASSIGNED</span>
                      ) : (
                         <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">{s.assignedFaculty?.name.toUpperCase()}</span>
                      )}
                   </td>
                    <td className="px-6 py-4 flex gap-2 justify-end pt-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setSelectedSubject(s);
                          fetchFaculty();
                          setShowAssignModal(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 flex items-center gap-1.5 text-xs font-black transition-all"
                      >
                        <Users size={12}/> Assign
                      </button>
                      <button 
                        onClick={() => handleDelete(s._id)}
                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                 <tr>
                    <td colSpan={4} className="p-12 text-center text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">
                       No subjects configured in the curriculum database.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowAssignModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}} className="glass-card w-full max-w-md p-8 relative z-10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Users size={20} className="text-indigo-600"/> Faculty Assignment</h3>
                <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-800"><X size={20}/></button>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Subject: <span className="text-slate-800">{selectedSubject?.name}</span></p>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {facultyList.map((f) => (
                  <button
                    key={f._id}
                    disabled={loading}
                    onClick={() => handleAssign(f._id)}
                    className="w-full p-4 flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-300 hover:bg-white transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <GraduationCap size={16}/>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{f.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{f.institution}</p>
                      </div>
                    </div>
                    {selectedSubject?.assignedFaculty?._id === f._id && (
                      <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">CURRENT</span>
                    )}
                  </button>
                ))}
                {facultyList.length === 0 && (
                  <p className="text-center py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">No faculty registered.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
