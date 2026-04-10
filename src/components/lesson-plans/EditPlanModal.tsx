'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Edit3, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';

interface EditPlanModalProps {
  plan: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPlan: any) => void;
}

export default function EditPlanModal({ plan, isOpen, onClose, onUpdate }: EditPlanModalProps) {
  const [editedPlan, setEditedPlan] = useState({ ...plan });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/lesson-plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plan._id, ...editedPlan }),
      });
      if (!res.ok) throw new Error('Failed to update plan archives.');
      const updated = await res.json();
      onUpdate(updated);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateWeekTopic = (weekNo: number, val: string) => {
    const newWeeks = editedPlan.weeks.map((w: any) => 
      w.weekNo === weekNo ? { ...w, topic: val } : w
    );
    setEditedPlan({ ...editedPlan, weeks: newWeeks });
  };

  const updateModuleTitle = (modNo: number, val: string) => {
    const newMods = editedPlan.modules.map((m: any) => 
      m.moduleNo === modNo ? { ...m, title: val } : m
    );
    setEditedPlan({ ...editedPlan, modules: newMods });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Edit3 size={20} className="text-indigo-600" />
              Institutional Editor
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Refining Curriculum: {plan.subjectId?.name || plan.subject}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[11px] font-bold flex items-center gap-2 animate-pulse">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* 1. Modules Section */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Plus size={12} className="text-indigo-500" /> Syllabus Unit Management
            </h4>
            <div className="grid gap-3">
              {(editedPlan.modules || []).map((m: any) => (
                <div key={m.moduleNo} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-indigo-400 transition-all">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">M{m.moduleNo}</span>
                  <div className="flex-1">
                    <input 
                      className="w-full bg-transparent border-none outline-none font-black text-slate-800 text-sm placeholder:text-slate-300"
                      value={m.title}
                      onChange={(e) => updateModuleTitle(m.moduleNo, e.target.value)}
                      placeholder="Enter Unit Title..."
                    />
                    <textarea 
                      className="w-full bg-transparent border-none outline-none text-[11px] text-slate-500 italic mt-1 resize-none h-12"
                      value={m.summary}
                      onChange={(e) => {
                        const newMods = editedPlan.modules.map((mod: any) => 
                          mod.moduleNo === m.moduleNo ? { ...mod, summary: e.target.value } : mod
                        );
                        setEditedPlan({ ...editedPlan, modules: newMods });
                      }}
                      placeholder="Module summary..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Weeks Section (Simplified topics) */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Plus size={12} className="text-purple-500" /> Weekly Topic Roadmap (15 Weeks)
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {(editedPlan.weeks || []).map((w: any) => (
                <div key={w.weekNo} className="p-4 bg-white border-2 border-slate-50 rounded-2xl hover:border-purple-100 focus-within:border-purple-400 transition-all">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-black text-purple-600 uppercase">Week {w.weekNo}</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase underline">Mod {w.moduleNo}</span>
                  </div>
                  <input 
                    className="w-full bg-transparent border-none outline-none font-bold text-slate-700 text-[11px]"
                    value={w.topic}
                    onChange={(e) => updateWeekTopic(w.weekNo, e.target.value)}
                    placeholder="Week Topic..."
                  />
                </div>
              ))}
            </div>
          </section>

          {/* 3. Assessment Section */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Logic</h4>
            <textarea 
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-indigo-400 transition-all text-[11px] text-slate-600 font-medium italic min-h-[100px]"
              value={editedPlan.assessment}
              onChange={(e) => setEditedPlan({ ...editedPlan, assessment: e.target.value })}
            />
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? 'Processing...' : 'Save & Publish'}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
