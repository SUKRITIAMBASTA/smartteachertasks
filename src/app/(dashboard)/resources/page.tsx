'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import {
  Plus, X, FolderOpen, Trash2, FileText,
  FileSpreadsheet, FileImage, Download, Search,
  Filter, CloudUpload, CheckCircle2,
  Calendar, BookOpen, ScrollText, ClipboardList, AlertTriangle, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fileIcons: Record<string, any> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
};

const categoryLabels: Record<string, { color: string; icon: any }> = {
  'Lecture Notes': { color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: BookOpen },
  'Syllabus': { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: ScrollText },
  'Reference Material': { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: FileText },
  'Fee Notice': { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Wallet },
  'Holiday Broadcast': { color: 'text-rose-600 bg-rose-50 border-rose-100', icon: Calendar },
  'Academic Exam Schedule': { color: 'text-purple-600 bg-purple-50 border-purple-100', icon: ClipboardList },
  'Other': { color: 'text-slate-600 bg-slate-50 border-slate-100', icon: FolderOpen },
};

export default function ResourcesPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || 'student';
  const isElevated = ['admin', 'faculty'].includes(role);

  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    category: 'Lecture Notes',
    tags: '',
    file: null as File | null
  });

  const availableCategories = useMemo(() => {
    if (role === 'faculty') return ['Lecture Notes', 'Syllabus', 'Reference Material', 'Other'];
    if (role === 'admin') return ['Fee Notice', 'Holiday Broadcast', 'Academic Exam Schedule', 'Lecture Notes', 'Syllabus', 'Other'];
    return [];
  }, [role]);

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchResources();
  }, [session]);

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const title = r.title?.toLowerCase() || '';
      const matchesSearch = title.includes(searchQuery.toLowerCase());
      const matchesFilter = filterCategory === 'All' || r.category === filterCategory;
      return matchesSearch && matchesFilter;
    });
  }, [resources, searchQuery, filterCategory]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file) return setError('Please select a file');
    if (!user?.accessToken) return setError('Google Drive not linked. Please connect your account.');

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', form.file);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('course', form.course);
      formData.append('category', form.category);
      formData.append('tags', form.tags);

      const res = await fetch('/api/resources', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      setShowModal(false);
      setForm({
        title: '',
        description: '',
        course: '',
        category: availableCategories[0] || 'Other',
        tags: '',
        file: null
      });
      fetchResources();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      const res = await fetch(`/api/resources?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchResources();
    } catch {
      setError('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Accessing Academic Library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 px-4 md:px-0">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FolderOpen className="text-indigo-600" size={32} />
            University Resource Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">Official materials, timetables, and notes synced from Faculty Drive.</p>
        </div>

        {isElevated && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            <CloudUpload size={20} />
            Upload Materials
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center justify-between shadow-sm"
          >
            <span>{error}</span>
            <button onClick={() => setError('')}><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Search resources by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Filter size={16} className="text-slate-400" />
            <select
              className="bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Lecture Notes">Lecture Notes</option>
              <option value="Syllabus">Syllabus</option>
              <option value="Reference Material">Reference Material</option>
              <option value="Class Timetable">Class Timetable</option>
              <option value="Exam Schedule - Mid Sem">Mid-Sem Exams</option>
              <option value="Exam Schedule - End Sem">End-Sem Exams</option>
            </select>
          </div>
        </div>
      </div>

      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredResources.map((r, idx) => {
              const fileType = r.fileType?.toLowerCase() || 'document';
              const Icon = fileIcons[fileType] || fileIcons[r.fileName?.split('.').pop() || ''] || FileText;
              const cat = categoryLabels[r.category] || categoryLabels['Other'];
              const CatIcon = cat.icon;

              return (
                <motion.div
                  layout
                  key={r._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card group relative p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-default overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                      <Icon className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={24} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${cat.color}`}>
                          <CatIcon size={12} />
                          {r.category}
                       </span>
                       {role === 'admin' || (r.uploadedBy?._id === user?.id || r.uploadedBy === user?.id) ? (
                         <button onClick={() => handleDelete(r._id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                           <Trash2 size={16} />
                         </button>
                       ) : null}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 line-clamp-1">{r.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{r.description || 'No description provided.'}</p>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department / Course</span>
                       <span className="text-sm font-bold text-slate-700">{r.course || 'Universal'}</span>
                    </div>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href={r.url?.includes('/view') ? r.url.replace('/view', '/export?format=pdf') : r.url}
                      download={r.fileName}
                      target="_blank"
                      className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"
                      title="Download Material"
                    >
                      <Download size={20} />
                    </motion.a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
           <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
           <h3 className="text-xl font-bold text-slate-800">No resources found</h3>
           <p className="text-slate-500 max-w-xs mx-auto mt-2">Check back later for updated course materials.</p>
        </div>
      )}

      {/* Modal - Restricted to Admin/Faculty */}
      {isElevated && (
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
                className="glass-card w-full max-w-xl p-8 relative z-10 overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="absolute top-0 right-0 p-4">
                  <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                     <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <CloudUpload size={24} />
                     </div>
                     Direct-to-Drive Share
                  </h2>
                  <p className="text-slate-500 mt-1">Upload securely to your personnel Google Drive.</p>

                  {!user?.accessToken && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4 ring-1 ring-amber-200">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                         <AlertTriangle className="text-amber-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-amber-900 uppercase tracking-widest leading-none mb-1">Google Connection Required</p>
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">Access to the Faculty Drive is needed to host your resource binaries. Link your account to enable the upload button.</p>
                        <button 
                          onClick={() => signIn('google', { callbackUrl: '/resources' })}
                          className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-lg shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                          <CloudUpload size={14} />
                          CONNECT GOOGLE DRIVE
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleUpload} className="space-y-6">
                  
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={!user?.accessToken}
                      required
                    />
                    <div className={`p-8 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center gap-3 ${!user?.accessToken ? 'bg-slate-50/50 border-slate-100 opacity-60' : form.file ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 group-hover:border-indigo-400 bg-slate-50'}`}>
                       {form.file ? (
                          <>
                             <CheckCircle2 className="text-emerald-500" size={32} />
                             <div className="text-center">
                                <div className="text-sm font-bold text-slate-800 truncate max-w-[300px]">{form.file.name}</div>
                                <div className="text-xs text-slate-500 font-medium capitalize">{(form.file.size / 1024).toFixed(2)} KB</div>
                             </div>
                          </>
                       ) : (
                          <>
                             <CloudUpload className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={32} />
                             <div className="text-center">
                                <div className="text-sm font-bold text-slate-800">Click to upload or drag & drop</div>
                                <div className="text-xs text-slate-500 font-medium whitespace-nowrap">Upload directly to your Drive storage</div>
                             </div>
                          </>
                       )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Resource Title</label>
                      <input
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors"
                        placeholder="e.g. CS101 Lecture Notes"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category</label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors appearance-none"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Brief Context</label>
                    <textarea
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors h-16 resize-none"
                      placeholder="What is this material about?"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                     <button 
                       type="button" 
                       onClick={() => setShowModal(false)}
                       className="py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                     >
                       Cancel
                     </button>
                     <button 
                       type="submit" 
                       disabled={submitting || !user?.accessToken}
                       className="py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                     >
                       {submitting ? 'Sharing...' : 'Share Now'}
                     </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}