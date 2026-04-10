'use client';

import React, { useState } from 'react';
import { Plus, Calendar, Edit2, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionSectionProps {
  sessions: any[];
  onRefresh?: () => void;
}

export default function SessionSection({ sessions, onRefresh }: SessionSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'even',
    startDate: '',
    endDate: '',
    isActive: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/academic-structure/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setShowModal(false);
      onRefresh && onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 border-2 border-indigo-50/50 shadow-xl shadow-indigo-100/10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
           <Calendar className="text-indigo-600" size={24} />
           Institutional Academic Cycles
        </h2>
        <button 
           className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all uppercase tracking-widest"
           onClick={() => {
             setForm({ name: '', type: 'even', startDate: '', endDate: '', isActive: true });
             setShowModal(true);
           }}
        >
           <Plus size={16} /> Create Cycle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {sessions.map((s, i) => (
           <div key={i} className={`p-6 border-2 rounded-2xl relative transition-all group hover:shadow-md ${
             s.isActive ? 'border-emerald-100 bg-emerald-50/30 shadow-emerald-100/20' : 'border-slate-100 bg-slate-50/50'
           }`}>
              {s.isActive && (
                <div className="absolute top-4 right-4 text-[9px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 shadow-sm animate-pulse">
                  Active
                </div>
              )}
              <Calendar className={s.isActive ? 'text-emerald-500 mb-3' : 'text-slate-400 mb-3'} size={28} />
              <h3 className="font-black text-slate-800 uppercase tracking-tight">{s.name}</h3>
              <p className="text-xs text-slate-500 mt-2 font-bold flex items-center gap-2">
                 <span className="opacity-50">DATES:</span> {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
              </p>
              <div className="mt-3 inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                Type: {s.type} Cycle
              </div>

              <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-indigo-200 transition-all flex items-center gap-2">
                   <Edit2 size={12}/> Edit
                </button>
                {s.isActive && (
                  <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white border border-rose-200 rounded-xl text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center gap-2">
                    <ShieldAlert size={12}/> Terminate
                  </button>
                )}
              </div>
           </div>
         ))}
         {sessions.length === 0 && (
            <div className="col-span-full p-20 text-center space-y-4">
               <Calendar size={48} className="mx-auto text-slate-200" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                  No academic cycles programmed in the system.
               </p>
            </div>
         )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}} className="glass-card w-full max-w-md p-8 relative z-10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Calendar size={20} className="text-indigo-600"/> Setup Core Cycle</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-800"><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Cycle Title</label>
                  <input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="e.g. Spring Session 2026"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Semester Type</label>
                    <select value={form.type} onChange={e=>setForm({...form, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none uppercase text-xs">
                      <option value="even">Even Semester</option>
                      <option value="odd">Odd Semester</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Status</label>
                    <div className="flex items-center h-[46px] ml-1">
                      <label className="flex items-center gap-2 cursor-pointer relative">
                        <input type="checkbox" className="sr-only peer" checked={form.isActive} onChange={e=>setForm({...form, isActive:e.target.checked})}/>
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="text-xs font-bold text-slate-600">Active</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Start Date</label>
                    <input type="date" required value={form.startDate} onChange={e=>setForm({...form, startDate:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-slate-600"/>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">End Date</label>
                    <input type="date" required value={form.endDate} onChange={e=>setForm({...form, endDate:e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-slate-600"/>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px]">
                   {loading ? 'Processing...' : 'Confirm Cycle Block'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
