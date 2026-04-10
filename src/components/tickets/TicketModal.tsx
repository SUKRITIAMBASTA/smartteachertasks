'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

interface TicketModalProps {
  showModal: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function TicketModal({ showModal, onClose, onSuccess, onError }: TicketModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return onError('All fields required.');
    
    setSubmitting(true);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      setForm({ title: '', description: '', category: 'other', priority: 'medium' });
      onSuccess();
      onClose();
    } catch {
      onError('Failed to broadcast ticket.');
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
            className="glass-card w-full max-w-md p-8 relative z-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                 <AlertCircle className="text-indigo-600" size={28} />
                 Request Support
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Inquiry Title</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="Brief summary of the issue..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Contextual Details</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium h-24 resize-none"
                  placeholder="Describe your request in detail..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Request Class</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-600 appearance-none"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="technical">Technical</option>
                    <option value="academic">Academic</option>
                    <option value="administrative">Administrative</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Urgency Level</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-600 appearance-none"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  type="button" 
                  className="py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors text-sm" 
                  onClick={onClose}
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-sm uppercase tracking-widest" 
                  disabled={submitting}
                >
                  {submitting ? 'Broadcasting...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
