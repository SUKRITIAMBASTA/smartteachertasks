'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Plus, X, Megaphone, Pin, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setShowModal(false);
      setForm({ title: '', content: '', targetRoles: ['admin', 'faculty', 'student'], pinned: false });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
    fetchAnnouncements();
  };

  if (loading) return (
    <div className="space-y-6 pb-12 animate-pulse">
      {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-32 skeleton" />)}
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
              <Megaphone size={18} />
            </div>
            Announcements
          </h1>
          <p className="text-sm text-slate-500 mt-1">Department-wide broadcast center</p>
        </div>
        {/* Only admin can create announcements */}
        {role === 'admin' && (
          <button
            className="btn btn-primary btn-sm flex items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> New Announcement
          </button>
        )}
      </div>

      {/* Announcement List */}
      {announcements.length > 0 ? (
        <motion.div variants={container} initial="hidden" animate="visible" className="space-y-4">
          {announcements.map((ann: any) => (
            <motion.div
              key={ann._id}
              variants={item}
              className={`glass-card p-6 group hover:shadow-md transition-all ${ann.pinned ? 'border-l-4 border-l-indigo-500' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {ann.pinned && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        <Pin size={9} /> Pinned
                      </span>
                    )}
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300">•</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {ann.targetRoles?.join(', ')}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">{ann.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{ann.content}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-400 to-purple-400 flex items-center justify-center text-[9px] font-black text-white uppercase">
                      {ann.author?.name?.[0] || 'A'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ann.author?.name || 'Admin'}</span>
                  </div>
                </div>
                {/* Only admin can delete */}
                {role === 'admin' && (
                  <button
                    onClick={() => handleDelete(ann._id)}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="glass-card p-16 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400 border border-amber-100">
            <Megaphone size={32} />
          </div>
          <h3 className="font-bold text-slate-700 text-lg mb-2">No Announcements Yet</h3>
          <p className="text-slate-400 text-sm">
            {role === 'admin' ? 'Create the first announcement to broadcast to the department.' : 'Check back later for department updates.'}
          </p>
        </div>
      )}

      {/* Create Modal – admin only */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Announcement</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    className="form-input"
                    placeholder="Announcement title..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    className="form-input"
                    rows={5}
                    placeholder="Write your announcement..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="form-group">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.pinned}
                      onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                      className="w-4 h-4 rounded accent-indigo-600"
                    />
                    <span>Pin this announcement</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
