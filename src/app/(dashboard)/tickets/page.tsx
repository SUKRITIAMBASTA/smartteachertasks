'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Plus, X, Ticket as TicketIcon } from 'lucide-react';

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
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchTickets();
  }, [session]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.description) {
      setError('Please fill all required fields');
      return;
    }

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
      setForm({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium'
      });

      fetchTickets();
    } catch {
      setError('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse text-center">
        Loading tickets...
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
          <h2>Support Tickets</h2>

          {/* Only student/faculty create */}
          {role !== 'admin' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowModal(true)}
            >
              <Plus size={16} /> New Ticket
            </button>
          )}
        </div>

        {tickets.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((t: any) => (
                <tr key={t._id}>
                  <td className="font-semibold text-slate-800">{t.title}</td>

                  <td className="capitalize">{t.category}</td>

                  <td>
                    <span className={`badge badge-${t.priority}`}>
                      {t.priority}
                    </span>
                  </td>

                  <td>
                    <span className={`badge badge-${t.status}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td>{t.createdBy?.name || 'Unknown'}</td>

                  <td>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <TicketIcon size={48} />
            <h3>No tickets found</h3>
            <p>Create your first support ticket</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Create New Ticket</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body space-y-4">

                <input
                  className="form-input"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                />

                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="technical">Technical</option>
                    <option value="academic">Academic</option>
                    <option value="administrative">Administrative</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="other">Other</option>
                  </select>

                  <select
                    className="form-select"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}