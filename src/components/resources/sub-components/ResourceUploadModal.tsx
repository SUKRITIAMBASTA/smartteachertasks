'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CloudUpload, CheckCircle2 } from 'lucide-react';
import { ACCEPTED_FORMATS } from '../ResourceConstants';

interface ResourceUploadModalProps {
  showModal: boolean;
  onClose: () => void;
  user: any;
  role: string;
  availableCategories: string[];
  onUploadSuccess: () => void;
}

export default function ResourceUploadModal({ 
  showModal, 
  onClose, 
  user, 
  role, 
  availableCategories,
  onUploadSuccess 
}: ResourceUploadModalProps) {
  const assignedSubjects = user?.assignedSubjects || [];
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: assignedSubjects.length > 0 ? assignedSubjects[0].name : '',
    semester: assignedSubjects.length > 0 ? assignedSubjects[0].semester.toString() : '1',
    category: availableCategories[0] || 'Other',
    tags: '',
    file: null as File | null
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file) return setError('Please select a file');

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', form.file);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('course', form.course);
      formData.append('semester', form.semester);
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

      onUploadSuccess();
      onClose();
      setForm({
        title: '',
        description: '',
        course: assignedSubjects.length > 0 ? assignedSubjects[0].name : '',
        semester: assignedSubjects.length > 0 ? assignedSubjects[0].semester.toString() : '1',
        category: availableCategories[0] || 'Other',
        tags: '',
        file: null
      });
    } catch (err: any) {
      setError(err.message);
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
            className="glass-card w-full max-w-xl p-8 relative z-10 overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 p-4">
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                 <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <CloudUpload size={24} />
                 </div>
                 Upload Resource
              </h2>
              <p className="text-slate-500 mt-1">Share academic materials with your department. Supports all file formats.</p>
              {error && <p className="text-rose-500 text-xs font-bold mt-2">{error}</p>}
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              
              {/* File Drop Zone */}
              <div className="relative group">
                <input
                  type="file"
                  accept={ACCEPTED_FORMATS}
                  onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  required
                />
                <div className={`p-8 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center gap-3 ${form.file ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 group-hover:border-indigo-400 bg-slate-50'}`}>
                   {form.file ? (
                      <>
                         <CheckCircle2 className="text-emerald-500" size={32} />
                         <div className="text-center">
                            <div className="text-sm font-bold text-slate-800 truncate max-w-[300px]">{form.file.name}</div>
                            <div className="text-xs text-slate-500 font-medium capitalize">{(form.file.size / 1024).toFixed(2)} KB • .{form.file.name.split('.').pop()}</div>
                         </div>
                      </>
                   ) : (
                      <>
                         <CloudUpload className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={32} />
                         <div className="text-center">
                            <div className="text-sm font-bold text-slate-800">Click to upload or drag & drop</div>
                            <div className="text-xs text-slate-500 font-medium">PDF, DOCX, CSV, TXT, Images, and more</div>
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Course / Subject</label>
                  <select
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors appearance-none"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    required
                  >
                    {assignedSubjects.length > 0 ? (
                       assignedSubjects.map((sub: any, idx: number) => (
                          <option key={idx} value={sub.name}>{sub.name}</option>
                       ))
                    ) : (
                       <>
                         <option value="General">General / All Courses</option>
                         <option value="Computer Networks">Computer Networks</option>
                         <option value="Data Structures">Data Structures</option>
                         <option value="Machine Learning">Machine Learning</option>
                       </>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Semester</label>
                  <select
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors appearance-none"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    required
                  >
                    {assignedSubjects.length > 0 ? (
                       [...new Set(assignedSubjects.map((s: any) => s.semester))].sort().map((sem: any) => (
                         <option key={sem} value={sem.toString()}>Semester {sem}</option>
                       ))
                    ) : (
                       [1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                          <option key={sem} value={sem.toString()}>Semester {sem}</option>
                       ))
                    )}
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
                   onClick={onClose}
                   className="py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   disabled={submitting}
                   className="py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                 >
                   {submitting ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Uploading...
                     </>
                   ) : (
                     <>
                       <CloudUpload size={18} />
                       Upload Now
                     </>
                   )}
                 </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
