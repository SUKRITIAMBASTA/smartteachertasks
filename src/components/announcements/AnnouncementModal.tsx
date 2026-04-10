'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Pin } from 'lucide-react';

interface AnnouncementModalProps {
  showModal: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function AnnouncementModal({ showModal, onClose, onSuccess, onError }: AnnouncementModalProps) {
  const [form, setForm] = useState({ 
    title: '', 
    content: '', 
    targetRoles: ['admin', 'faculty', 'student'], 
    pinned: false 
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create announcement');
      }

      setForm({ title: '', content: '', targetRoles: ['admin', 'faculty', 'student'], pinned: false });
      onSuccess();
      onClose();
    } catch (err: any) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             onClick={onClose}
             className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-xl p-8 relative z-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                 <Megaphone className="text-indigo-600" size={28} />
                 New Broadcast
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Broadcast Title</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  placeholder="e.g., Holiday Notice or Exam Schedule"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Detailed Content</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium h-32 resize-none"
                  placeholder="Provide full details of the announcement..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group cursor-pointer hover:bg-indigo-50/30 transition-colors" onClick={() => setForm({ ...form, pinned: !form.pinned })}>
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg transition-colors ${form.pinned ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300 group-hover:text-indigo-400'}`}>
                      <Pin size={18} className={form.pinned ? 'fill-white' : ''} />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-slate-700">Pin as Priority</div>
                      <div className="text-[10px] text-slate-400 font-medium">Keep at the top of the feed (Max 3)</div>
                   </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${form.pinned ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full transition-all ${form.pinned ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  type="button" 
                  className="py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors" 
                  onClick={onClose}
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest text-sm" 
                  disabled={submitting}
                >
                  {submitting ? 'Broadcasting...' : 'Publish Now'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
