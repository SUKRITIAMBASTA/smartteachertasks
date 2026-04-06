'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Building, Plus, Trash2, Edit2, GraduationCap, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AcademicStructurePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && role !== 'admin') router.push('/dashboard');
  }, [status, role, router]);

  const [activeTab, setActiveTab] = useState<'classes' | 'subjects' | 'sessions'>('classes');
  
  const [departments, setDepartments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/academic-structure/departments').then(r => r.json()).then(setDepartments).catch(console.error);
    fetch('/api/academic-structure/subjects').then(r => r.json()).then(setSubjects).catch(console.error);
    fetch('/api/academic-structure/sessions').then(r => r.json()).then(setSessions).catch(console.error);
  }, []);

  if (status === 'loading') return <div className="p-6">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Building className="text-indigo-500" /> Academic Structure
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage classes, assign teachers to subjects, and configure academic sessions.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('classes')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'classes' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Classes & Departments</button>
        <button onClick={() => setActiveTab('subjects')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'subjects' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Subjects & Assignments</button>
        <button onClick={() => setActiveTab('sessions')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'sessions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Academic Sessions</button>
      </div>

      {activeTab === 'classes' && (
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Manage Departments/Branches</h2>
            <button className="btn btn-primary btn-sm flex items-center gap-2" onClick={() => alert('UI under construction')}><Plus size={16} /> Add Class</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest text-[10px] font-black text-slate-400">
              <tr>
                <th className="px-4 py-3">Department Name</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {departments.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                   <td className="px-4 py-3 text-sm font-semibold">{d.name}</td>
                   <td className="px-4 py-3 text-sm text-slate-600">{d.branch}</td>
                   <td className="px-4 py-3 text-sm text-slate-600">{d.shift}</td>
                   <td className="px-4 py-3 flex gap-2">
                     <button className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 size={14}/></button>
                     <button className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"><Trash2 size={14}/></button>
                   </td>
                </tr>
              ))}
              {departments.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-sm text-slate-500">No departments configured</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Subjects & Teacher Assignment</h2>
            <button className="btn btn-primary btn-sm flex items-center gap-2"><Plus size={16} /> Add Subject</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest text-[10px] font-black text-slate-400">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Assigned Faculty</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subjects.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                   <td className="px-4 py-3 text-sm font-semibold">
                      {s.name} <br/>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">{s.code}</span>
                   </td>
                   <td className="px-4 py-3 text-sm text-slate-600">{s.departmentId?.name} - {s.departmentId?.branch}</td>
                   <td className="px-4 py-3 text-sm">
                      {!s.assignedFaculty ? <span className="text-amber-500 font-bold text-xs">Unassigned</span> : <span className="text-emerald-600 font-bold text-xs">{s.assignedFaculty?.name}</span>}
                   </td>
                   <td className="px-4 py-3 flex gap-2 pt-4">
                     <button className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 flex items-center gap-1 text-xs font-bold"><Users size={12}/> Assign</button>
                     <button className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"><Trash2 size={14}/></button>
                   </td>
                </tr>
              ))}
               {subjects.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-sm text-slate-500">No subjects configured</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Academic Sessions</h2>
            <button className="btn btn-primary btn-sm flex items-center gap-2"><Plus size={16} /> Create Session</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {sessions.map((s, i) => (
               <div key={i} className={`p-5 border rounded-xl relative ${s.isActive ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50'}`}>
                  {s.isActive && <div className="absolute top-4 right-4 text-[9px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">Active</div>}
                  <Calendar className={s.isActive ? 'text-emerald-500 mb-2' : 'text-slate-400 mb-2'} size={24} />
                  <h3 className="font-bold text-slate-800">{s.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}</p>
                  <p className="text-xs text-indigo-500 mt-1 font-bold">Type: {s.type.toUpperCase()}</p>
                  <div className="mt-4 flex gap-2">
                    <button className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50">Edit</button>
                    {s.isActive && <button className="text-xs font-bold px-3 py-1.5 bg-white border border-rose-200 rounded text-rose-600 hover:bg-rose-50">End Session</button>}
                  </div>
               </div>
             ))}
             {sessions.length === 0 && <p className="text-slate-500 text-sm">No sessions found.</p>}
          </div>
        </div>
      )}
    </motion.div>
  );
}
