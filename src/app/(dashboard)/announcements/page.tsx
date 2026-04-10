'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-components
import AnnouncementHeader from '@/components/announcements/AnnouncementHeader';
import AnnouncementList from '@/components/announcements/AnnouncementList';
import AnnouncementModal from '@/components/announcements/AnnouncementModal';

/**
 * Announcements Management Page
 * Orchestrates campus broadcasts, pinning priorities, and role-based views.
 */
export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Data Fetching
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      setError('Communication sync failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchAnnouncements();
  }, [session]);

  // Priority Actions (Pin/Unpin)
  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    setError('');
    try {
      const res = await fetch('/api/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pinned: !currentPinned }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update priority status');
      }

      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Administrative Actions (Delete)
  const handleDelete = async (id: string) => {
    if (!confirm('Permanent Action: Delete this announcement?')) return;
    try {
      await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      fetchAnnouncements();
    } catch {
      setError('Delete protocol failed.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-16 bg-slate-100/50 rounded-2xl w-1/3" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card h-32 bg-slate-100/50 rounded-2xl" />
        ))}
      </div>
    );
  }

  const pinnedCount = announcements.filter(a => a.pinned).length;

  return (
    <div className="space-y-8 pb-12 px-4 md:px-0">
      
      {/* 1. Header & Quick Actions */}
      <AnnouncementHeader 
        role={role} 
        pinnedCount={pinnedCount} 
        onNewBroadcast={() => { setError(''); setShowModal(true); }} 
      />

      {/* 2. Notifications/Error Feedback */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Content: Announcement Feed */}
      <AnnouncementList 
        announcements={announcements} 
        role={role} 
        onTogglePin={handleTogglePin} 
        onDelete={handleDelete} 
      />

      {/* 4. Overlay: Creation Modal */}
      {role === 'admin' && (
        <AnnouncementModal 
          showModal={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchAnnouncements}
          onError={setError}
        />
      )}
    </div>
  );
}
