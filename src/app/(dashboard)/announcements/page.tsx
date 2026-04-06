'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Plus, X, Megaphone, Pin, Trash2, PinOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
};
const item = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.3 } }
};

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [showModal,     setShowModal]     = useState(false);
  const [form, setForm] = useState({ title: '', content: '', targetRoles: ['admin', 'faculty', 'student'], pinned: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const res  = await fetch('/api/announcements');
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (session) fetchAnnouncements(); }, [session]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
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

      setShowModal(false);
      setForm({ title: '', content: '', targetRoles: ['admin', 'faculty', 'student'], pinned: false });
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    setError('');
    try {
      const res = await fetch('/api/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pinned: !currentPinned }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update pin status');
      }

      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message);
      // Auto-hide error after 5s
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanent Action: Delete this announcement?')) return;
    await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
    fetchAnnouncements();
  };

  if (loading) return (
    <div className="space-y-6 pb-12 animate-pulse">
      {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-32" />)}
    </div>
  );

  const pinnedCount = announcements.filter(a => a.pinned).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <Megaphone className="text-indigo-600" size={32} />
             Campus Broadcasts
          </h1>
          <p className="text-sm text-slate-500 mt-1">Official announcements and pinned priorities ({pinnedCount}/3 pinned)</p>
        </div>
        {role === 'admin' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100"
            onClick={() => { setError(''); setShowModal(true); }}
          >
            <Plus size={20} /> New Broadcast
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement List */}
      {announcements.length > 0 ? (
        <motion.div variants={container} initial="hidden" animate="visible" className="space-y-4">
          {announcements.map((ann: any) => (
            <motion.div
              key={ann._id}
              variants={item}
              className={`glass-card p-6 group relative hover:shadow-xl hover:shadow-indigo-500/5 transition-all ${ann.pinned ? 'ring-2 ring-indigo-500/20 bg-indigo-50/5' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    {ann.pinned && (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 bg-white border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        <Pin size={10} className="fill-indigo-600" /> TOP PRIORITY
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded">
                      FOR: {ann.targetRoles?.join(', ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{ann.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">{ann.content}</p>
                  
                  <div className="flex items-center gap-2 mt-5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[11px] font-black text-indigo-600">
                      {ann.author?.name?.[0] || 'A'}
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{ann.author?.name || 'Academic Admin'}</span>
                  </div>
                </div>

                {role === 'admin' && (
                  <div className="flex items-center gap-1 transition-opacity">
                    <button
                      onClick={() => handleTogglePin(ann._id, ann.pinned)}
                      className={`p-2 rounded-xl transition-all ${ann.pinned ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-indigo-500 hover:bg-slate-50'}`}
                      title={ann.pinned ? "Unpin Announcement" : "Pin to Top (Max 3)"}
                    >
                      {ann.pinned ? <PinOff size={18} /> : <Pin size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="p-2 rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
                      title="Delete Broadcast"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="glass-card p-20 text-center space-y-4">
           <Megaphone size={48} className="mx-auto text-slate-200" />
           <h3 className="text-xl font-bold text-slate-800">No active broadcasts</h3>
           <p className="text-slate-500 max-w-xs mx-auto">The communication channel is currently quiet. Check back later for university updates.</p>
        </div>
      )}

      {/* Create Modal */}
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
              className="glass-card w-full max-w-xl p-8 relative z-10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                   <Megaphone className="text-indigo-600" size={28} />
                   New Broadcast
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-800">
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
                    onClick={() => setShowModal(false)}
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
    </div>
  );
}
