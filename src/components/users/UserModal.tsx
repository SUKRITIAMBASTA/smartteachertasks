'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Upload, CheckCircle2 } from 'lucide-react';

interface UserModalProps {
  showModal: boolean;
  mode: 'create' | 'edit';
  editingUser: any;
  departments: any[];
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function UserModal({ 
  showModal, mode, editingUser, departments, onClose, onSuccess, onError 
}: UserModalProps) {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'student', 
    institution: 'ASET',
    departmentId: '', 
    idDocumentUrl: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync form with editing user when modal opens
  useEffect(() => {
    if (mode === 'edit' && editingUser) {
      setForm({
        name: editingUser.name || '',
        email: editingUser.email || '',
        password: '', // Never sync password
        role: editingUser.role || 'student',
        institution: editingUser.institution || 'ASET',
        departmentId: editingUser.departmentId?._id || editingUser.departmentId || '',
        idDocumentUrl: editingUser.idDocumentUrl || ''
      });
    } else {
      setForm({ 
        name: '', email: '', password: '', role: 'student', 
        institution: 'ASET', departmentId: '', idDocumentUrl: ''
      });
    }
  }, [mode, editingUser, showModal]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/soundwaves/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setForm(prev => ({ ...prev, idDocumentUrl: data.secure_url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      onError('System: ID Upload failed. Please check connectivity.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    onError('');

    const url = '/api/users';
    const method = mode === 'create' ? 'POST' : 'PATCH';
    const body = mode === 'create' ? form : { id: editingUser?._id, ...form };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${mode} user.`);
      }

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
            className="glass-card w-full max-w-sm p-5 relative z-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                 <ShieldCheck className="text-indigo-600" size={22} />
                 {mode === 'create' ? 'Register Account' : 'Edit Profile'}
              </h2>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5 focus-within:text-indigo-600">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Identity Name</label>
                <input
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5 focus-within:text-indigo-600">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Official Email</label>
                <input
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold disabled:opacity-50 text-sm"
                  type="email"
                  placeholder="name@university.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={mode === 'edit'}
                  required
                />
              </div>

              {mode === 'create' && (
                <div className="space-y-1.5 focus-within:text-indigo-600">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Secure Password</label>
                  <input
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Assigned Role</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-slate-600 appearance-none text-center text-xs"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="student">STUDENT</option>
                    <option value="faculty">FACULTY</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Institution</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-slate-600 appearance-none text-center text-xs"
                    value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  >
                    <option value="ASET">ASET</option>
                    <option value="ALS">ALS</option>
                    <option value="ABS">ABS</option>
                    <option value="ACCF">ACCF</option>
                    <option value="AIIT">AIIT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Department Unit</label>
                  <select
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-slate-600 appearance-none text-center text-[10px]"
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  >
                    <option value="">Select Branch</option>
                    {departments.filter(d => d.institution === form.institution).map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.branch} - {dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Identity Verification Document</label>
                  <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
                    form.idDocumentUrl ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100 hover:border-indigo-200 bg-slate-50/50'
                  }`}>
                    {uploading ? (
                       <div className="flex flex-col items-center justify-center py-2 space-y-2">
                          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-black text-indigo-600 uppercase">Uploading Proof...</span>
                       </div>
                    ) : form.idDocumentUrl ? (
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                               <CheckCircle2 size={20} />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Verified Document Attached</span>
                               <a href={form.idDocumentUrl} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-500 font-bold hover:underline">View Uploaded ID</a>
                            </div>
                         </div>
                         <button type="button" onClick={() => setForm(prev => ({...prev, idDocumentUrl: ''}))} className="text-rose-400 hover:text-rose-600 p-1">
                            <X size={16} />
                         </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer space-y-2 group">
                        <Upload size={24} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Click to upload ID (PDF/JPG)</p>
                          <p className="text-[9px] text-slate-400 font-medium">Verification required for institutional alignment</p>
                        </div>
                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                      </label>
                    )}
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  type="button" 
                  className="py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors uppercase tracking-widest text-[10px]" 
                  onClick={onClose}
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px]" 
                  disabled={submitting}
                >
                  {submitting ? 'Syncing...' : mode === 'create' ? 'Create Account' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
