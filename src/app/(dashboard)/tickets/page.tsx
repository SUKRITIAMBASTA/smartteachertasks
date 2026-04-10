'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-components
import TicketHeader from '@/components/tickets/TicketHeader';
import TicketTable from '@/components/tickets/TicketTable';
import TicketModal from '@/components/tickets/TicketModal';

/**
 * Support Helpdesk Page
 * Orchestrates technical and academic support requests with role-based access.
 */
export default function TicketsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Data Fetching
  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to synchronize with support database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchTickets();
  }, [session]);

  // Administrative Actions (Status Change)
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) fetchTickets();
    } catch {
      setError('Status update signal failed.');
    }
  };

  // Administrative Actions (Delete)
  const handleDelete = async (id: string) => {
    if (!confirm('Permanent Wipe: Proceed with ticket deletion?')) return;
    try {
      const res = await fetch(`/api/tickets?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchTickets();
    } catch {
      setError('Deletion protocol failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Helpdesk...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 px-4 md:px-0">
      
      {/* 1. Header & Quick Actions */}
      <TicketHeader 
        role={role} 
        onRaiseTicket={() => { setError(''); setShowModal(true); }} 
      />

      {/* 2. Notifications/Error Feedback */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold shadow-sm flex items-center gap-3"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Content: Inquiry Directory */}
      <TicketTable 
        tickets={tickets} 
        role={role} 
        onStatusChange={handleStatusChange} 
        onDelete={handleDelete} 
      />

      {/* 4. Overlay: Creation Modal */}
      {role !== 'admin' && (
        <TicketModal 
          showModal={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchTickets}
          onError={setError}
        />
      )}
    </div>
  );
}