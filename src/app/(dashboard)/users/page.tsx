'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Plus, X, Users as UsersIcon, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '' });
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
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && role === 'admin') fetchUsers();
  }, [session, role]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'student', department: '' });
      fetchUsers();
    } catch {
      setError('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;

    try {
      await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch {
      setError('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse text-center">
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Error */}
      {error && (
        <div className="alert-error text-center">{error}</div>
      )}

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>User Management</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add User
          </button>
        </div>

        {users.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u: any) => (
                <tr key={u._id}>
                  <td className="font-semibold text-slate-800">{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>{u.department || '—'}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>

                  <td>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="btn btn-sm btn-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <UsersIcon size={48} />
            <h3>No users found</h3>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add User</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body space-y-4">

                <input
                  className="form-input"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />

                <input
                  className="form-input"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />

                <input
                  className="form-input"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="form-select"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>

                  <input
                    className="form-input"
                    placeholder="Department"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}