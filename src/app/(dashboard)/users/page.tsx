'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import { Plus, X, Users as UsersIcon, Trash2, CheckCircle, Ban, Pencil, ShieldCheck, Mail, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'student', 
    department: 'General' 
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const role = (session?.user as any)?.role;

  // 🔒 Protect route
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && role !== 'admin') router.push('/dashboard');
  }, [status, role, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setError('System: Failed to synchronize user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && role === 'admin') fetchUsers();
  }, [session, role]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingId(null);
    setForm({ name: '', email: '', password: '', role: 'student', department: 'General' });
    setShowModal(true);
  };

  const handleOpenEdit = (user: any) => {
    setModalMode('edit');
    setEditingId(user._id);
    setForm({ 
      name: user.name, 
      email: user.email, 
      password: '', // Don't show password
      role: user.role, 
      department: user.department || 'General' 
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const url = '/api/users';
    const method = modalMode === 'create' ? 'POST' : 'PATCH';
    const body = modalMode === 'create' ? form : { id: editingId, ...form };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      setShowModal(false);
      fetchUsers();
    } catch {
      setError(`Failed to ${modalMode} user. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanent Action: Deleting this user will remove all associated data. Proceed?')) return;

    try {
      await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch {
      setError('System: Wipe operation failed.');
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
            <UsersIcon className="text-indigo-600" size={32} />
            User Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage institutional roles and departmental access controls.</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          Register New User
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold shadow-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Total Accounts', value: users.length, color: 'indigo' },
           { label: 'Administrators', value: users.filter(u => u.role === 'admin').length, color: 'rose' },
           { label: 'Faculty Staff', value: users.filter(u => u.role === 'faculty').length, color: 'blue' },
           { label: 'Students', value: users.filter(u => u.role === 'student').length, color: 'emerald' },
         ].map((stat, i) => (
           <div key={i} className="glass-card p-4 text-center">
              <div className="text-2xl font-black text-slate-800">{stat.value}</div>
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{stat.label}</div>
           </div>
         ))}
      </div>

      {/* Directory Table */}
      <div className="glass-card overflow-hidden shadow-xl shadow-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Role Type</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Department</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Joined</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">{u.name}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail size={12} /> {u.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      u.role === 'admin' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                      u.role === 'faculty' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                      'text-emerald-600 bg-emerald-50 border-emerald-100'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                       <Building2 size={16} className="text-slate-300" />
                       {u.department || 'General'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                    {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(u)}
                        className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit User Profile"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u._id)}
                        className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Revoke Access"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-20 text-center space-y-4">
             <div className="inline-flex p-4 bg-slate-50 rounded-3xl text-slate-300">
               <UsersIcon size={48} />
             </div>
             <h3 className="text-xl font-bold text-slate-800">Directory Empty</h3>
             <p className="text-slate-500 max-w-xs mx-auto">Click "Register New User" to begin institutional setup.</p>
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
                   <ShieldCheck className="text-indigo-600" size={28} />
                   {modalMode === 'create' ? 'Register Account' : 'Edit Profile'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-800">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Identity Name</label>
                  <input
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    placeholder="Enter full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Official Email</label>
                  <input
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium disabled:opacity-50"
                    type="email"
                    placeholder="name@university.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={modalMode === 'edit'}
                    required
                  />
                </div>

                {modalMode === 'create' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Secure Password</label>
                    <input
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-600 appearance-none"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="student">STUDENT</option>
                      <option value="faculty">FACULTY</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Department</label>
                    <input
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                      placeholder="CSE, MBA, etc."
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                    />
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
                    className="py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all" 
                    disabled={submitting}
                  >
                    {submitting ? 'Syncing...' : modalMode === 'create' ? 'Create Account' : 'Save Changes'}
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