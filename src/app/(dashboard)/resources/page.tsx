'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import { FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-components
import ResourceHeader from '@/components/resources/sub-components/ResourceHeader';
import ResourceFilter from '@/components/resources/sub-components/ResourceFilter';
import ResourceGrid from '@/components/resources/sub-components/ResourceGrid';
import ResourceUploadModal from '@/components/resources/sub-components/ResourceUploadModal';

/**
 * Institutional Resource Hub
 * Orchestrates academic materials.
 */
export default function ResourcesPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || 'student';
  const isElevated = ['admin', 'faculty'].includes(role);

  // State
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [error, setError] = useState('');

  // UI Tokens based on role
  const availableCategories = useMemo(() => {
    if (role === 'faculty') return ['Lecture Notes', 'Syllabus', 'Reference Material', 'Other'];
    if (role === 'admin') return ['Fee Notice', 'Holiday Broadcast', 'Academic Exam Schedule', 'Lecture Notes', 'Syllabus', 'Other'];
    return [];
  }, [role]);

  // Data Fetching
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

  // Logic
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const title = r.title?.toLowerCase() || '';
      const matchesSearch = title.includes(searchQuery.toLowerCase());
      const matchesFilter = filterCategory === 'All' || r.category === filterCategory;
      return matchesSearch && matchesFilter;
    });
  }, [resources, searchQuery, filterCategory]);

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
      
      {/* 1. Header & Quick Actions */}
      <ResourceHeader 
        isElevated={isElevated} 
        onUploadClick={() => setShowModal(true)} 
      />

      {/* 2. Primary Navigation */}
      <div className="flex items-center p-1.5 bg-slate-100 rounded-3xl w-fit">
         <div className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white text-indigo-600 font-black text-sm shadow-sm">
           <FileText size={18} />
           ACADEMIC FILES
         </div>
      </div>

      {/* 3. Main Content Display */}
      <div className="space-y-8">
        {/* Notifications */}
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

        {/* Filter Bar */}
        <ResourceFilter 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterCategory={filterCategory}
          onFilterChange={setFilterCategory}
        />

        {/* Results Grid */}
        <ResourceGrid 
          resources={filteredResources}
          user={user}
          role={role}
          onDelete={handleDelete}
        />
      </div>

      {/* 4. Overlay: Upload Modal */}
      {isElevated && (
        <ResourceUploadModal 
          showModal={showModal}
          onClose={() => setShowModal(false)}
          user={user}
          role={role}
          availableCategories={availableCategories}
          onUploadSuccess={fetchResources}
        />
      )}
    </div>
  );
}