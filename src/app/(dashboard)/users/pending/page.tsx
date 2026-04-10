'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, FileWarning, CheckCircle, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import UserTable from '@/components/users/UserTable';
import UserModal from '@/components/users/UserModal';

/**
 * Verification Dashboard: Pending Documents
 * Focuses on institutional compliance and document verification.
 */
export default function PendingDocsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && role !== 'admin') router.push('/dashboard');
  }, [status, role, router]);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users?idPending=true&limit=100');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setError('System: Failed to synchronize pending document registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && role === 'admin') {
      fetchPendingUsers();
    }
  }, [session, role]);

  const handleVerify = async (user: any) => {
    if (!user.idDocumentUrl) {
      toast.warning('Action Blocked: No ID document found for this user.');
      return;
    }
    
    try {
      const res = await fetch(`/api/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user._id, isVerified: true })
      });
      if (res.ok) fetchPendingUsers();
    } catch {
      setError('System: Verification update failed.');
    }
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setShowModal(true);
  };

  if (role !== 'admin') return null;

  return (
    <div className="space-y-6 pb-12 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FileWarning className="text-indigo-600" size={32} />
            Pending Documents
          </h1>
          <p className="text-slate-400 font-medium text-sm mt-1">Identity verification queue for institutional compliance.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold shadow-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Filtering Registry...</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden shadow-xl shadow-slate-100/50 border-2 border-indigo-50/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Identity</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Document Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{u.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{u.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.idDocumentUrl ? (
                        <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 w-fit">
                          <CheckCircle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Uploaded</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 w-fit">
                          <AlertCircle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Missing ID</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {!u.idDocumentUrl ? (
                          <button 
                            onClick={() => handleOpenEdit(u)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
                          >
                            <Upload size={14} /> Upload ID
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleVerify(u)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10"
                          >
                            <CheckCircle size={14} /> Verify User
                          </button>
                        )}
                        <a 
                          href={u.idDocumentUrl || '#'} 
                          target="_blank" 
                          rel="noreferrer"
                          className={`p-2 rounded-lg transition-all ${u.idDocumentUrl ? 'text-indigo-400 hover:bg-indigo-50' : 'text-slate-200 cursor-not-allowed'}`}
                        >
                          <FileWarning size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="inline-flex p-4 bg-emerald-50 rounded-3xl text-emerald-300">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Queue Cleared</h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm">All identity documents are currently synchronized and verified.</p>
            </div>
          )}
        </div>
      )}

      <UserModal 
        showModal={showModal}
        mode="edit"
        editingUser={editingUser}
        departments={[]}
        onClose={() => setShowModal(false)}
        onSuccess={fetchPendingUsers}
        onError={setError}
      />
    </div>
  );
}
