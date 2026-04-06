'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  Plus, X, Ticket as TicketIcon, Trash2, 
  CheckCircle, PlayCircle, Clock, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TicketsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to synchronize with support database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchTickets();
  }, [session]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return setError('All fields required.');
    
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      setShowModal(false);
      setForm({ title: '', description: '', category: 'other', priority: 'medium' });
      fetchTickets();
    } catch {
      setError('Failed to broadcast ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) fetchTickets();
    } catch {
      setError('Status update signal failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanent Wipe: Proceed with ticket deletion?')) return;
    try {
      const res = await fetch(`/api/tickets?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchTickets();
    } catch {
      setError('Deletion protocol failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <TicketIcon className="text-indigo-600" size={32} />
            Support Helpdesk
          </h1>
          <p className="text-slate-500 text-sm mt-1">Submit academic or technical queries to the administration hub.</p>
        </div>

        {role !== 'admin' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700"
          >
            <Plus size={20} />
            Raise Ticket
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold shadow-sm flex items-center gap-3"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Directory Table */}
      <div className="glass-card overflow-hidden shadow-xl shadow-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Inquiry Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Priority</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {tickets.map((t, idx) => (
                <tr key={t._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm mb-1">{t.title}</span>
                      <span className="text-xs text-slate-400 line-clamp-1 max-w-xs">{t.description}</span>
                      <span className="inline-block w-fit mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
                        {t.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      t.priority === 'urgent' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                      t.priority === 'high' ? 'text-amber-600 bg-amber-50 border-amber-100' :
                      'text-slate-600 bg-slate-50 border-slate-100'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border flex items-center justify-center gap-1.5 w-fit mx-auto ${
                      t.status === 'resolved' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                      t.status === 'in_progress' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                      'text-indigo-600 bg-indigo-50 border-indigo-100'
                    }`}>
                      {t.status === 'resolved' && <CheckCircle size={10} />}
                      {t.status === 'in_progress' && <Clock size={10} />}
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{t.createdBy?.name || 'System'}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      {role === 'admin' ? (
                        <>
                          <button 
                            onClick={() => handleStatusChange(t._id, 'in_progress')}
                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Set In Progress"
                          >
                            <PlayCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(t._id, 'resolved')}
                            className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Mark as Done"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(t._id)}
                            className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Purge Ticket"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-300 italic font-medium">Awaiting Review</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tickets.length === 0 && (
          <div className="p-20 text-center space-y-4">
             <div className="inline-flex p-4 bg-slate-50 rounded-3xl text-slate-300">
               <TicketIcon size={48} />
             </div>
             <h3 className="text-xl font-bold text-slate-800">Inbox Clear</h3>
             <p className="text-slate-500 max-w-xs mx-auto">No pending support requests detected in the system.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setShowModal(false)}
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
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-800">
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
                    onClick={() => setShowModal(false)}
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
    </div>
  );
}