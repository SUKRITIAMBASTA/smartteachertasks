'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';

// Sub-components
import UserHeader from '@/components/users/UserHeader';
import UserStats from '@/components/users/UserStats';
import UserFilters from '@/components/users/UserFilters';
import UserTable from '@/components/users/UserTable';
import UserPagination from '@/components/users/UserPagination';
import UserModal from '@/components/users/UserModal';

/**
 * Institutional User Directory
 * Orchestrates administrative access control, account registration, and directory filtering.
 */
export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  // Local State
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, admins: 0, faculty: 0, students: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    role: '',
    institution: '',
    departmentId: '',
    search: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  // 🔒 Route Guard
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && role !== 'admin') router.push('/dashboard');
  }, [status, role, router]);

  // Data Fetching
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.role && { role: filters.role }),
        ...(filters.institution && { institution: filters.institution }),
        ...(filters.departmentId && { departmentId: filters.departmentId }),
        ...(filters.search && { search: filters.search }),
      });

      const res = await fetch(`/api/users?${query}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);

      // Also fetch global stats for cards
      const statsRes = await fetch('/api/users?stats=true');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch {
      setError('System: Failed to synchronize user directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/academic-structure/departments');
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  useEffect(() => {
    if (session && role === 'admin') {
      fetchUsers();
      fetchDepartments();
    }
  }, [session, role, page, filters]);

  // Actions
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingUser(null);
    setShowModal(true);
  };

  const handleOpenEdit = (user: any) => {
    setModalMode('edit');
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDirectUpload = async (user: any, file: File) => {
    setSyncing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');

    try {
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/soundwaves/image/upload`, {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (uploadData.secure_url) {
        const res = await fetch('/api/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: user._id, 
            idDocumentUrl: uploadData.secure_url, 
            isVerified: true 
          })
        });
        if (res.ok) {
          fetchUsers();
          toast.success(`Identity Sync Complete: ${user.name} is now verified.`);
        }
      }
    } catch (err) {
      setError('System: Direct Identity Sync failed.');
    } finally {
      setSyncing(false);
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

  if (loading && page === 1 && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing User Registry...</p>
      </div>
    );
  }

  if (role !== 'admin') return null;

  return (
    <div className="space-y-6 pb-12 px-4 md:px-0">
      
      {/* 1. Admin Header */}
      <UserHeader onRegister={handleOpenCreate} />

      {/* 2. Error Feedback */}
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

      {/* 3. Statistical Overview */}
      <UserStats stats={stats} loading={loading} />

      {/* 4. Search & Institutional Filters */}
      <UserFilters 
        filters={filters} 
        onFiltersChange={(f) => { setFilters(f); setPage(1); }}
        onClear={() => { setFilters({ role: '', institution: '', departmentId: '', search: '' }); setPage(1); }}
      />

      {/* 5. Directory Grid */}
      <div className="space-y-4 relative">
        {syncing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Syncing Identity...</span>
            </div>
          </div>
        )}
        <UserTable 
          users={users}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onDirectUpload={handleDirectUpload}
        />

        {/* 6. Pagination System */}
        <UserPagination 
          page={page}
          totalPages={totalPages}
          total={total}
          count={users.length}
          onPageChange={setPage}
        />
      </div>

      {/* 7. Overlay: Identity Management Modal */}
      <UserModal 
        showModal={showModal}
        mode={modalMode}
        editingUser={editingUser}
        departments={departments}
        onClose={() => setShowModal(false)}
        onSuccess={fetchUsers}
        onError={setError}
      />
    </div>
  );
}