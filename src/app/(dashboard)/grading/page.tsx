'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus, ClipboardCheck, ChevronRight,
  Search, Inbox, Calendar, Star
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Skeleton, CardSkeleton } from '@/components/Skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function GradingDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [rubrics, setRubrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // 🔒 Protect route
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchRubrics = async () => {
    try {
      const res = await fetch('/api/grading/rubrics');
      const data = await res.json();
      setRubrics(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load rubrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchRubrics();
  }, [session]);

  // ✅ Safe filtering
  const filteredRubrics = useMemo(() => {
    return rubrics.filter((r) =>
      (r.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rubrics, searchQuery]);

  // ✅ Loading
  if (loading) {
    return (
      <div className="space-y-10 pb-12">
        <div className="flex justify-between items-center gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-14 w-48 rounded-xl shrink-0" />
        </div>
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >

      {/* ERROR */}
      {error && (
        <div className="alert-error text-center">{error}</div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <ClipboardCheck size={18} />
            Grading Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Manage rubrics and evaluations
          </p>
        </div>

        <Link href="/grading/create" className="btn btn-primary">
          <Plus size={16} /> New Rubric
        </Link>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <input
          className="form-input"
          placeholder="Search rubric..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content */}
      {filteredRubrics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRubrics.map((r) => {
            const total =
              r.criteria?.reduce((sum: number, c: any) => sum + (c.maxMarks || 0), 0) || 0;

            return (
              <motion.div key={r._id} variants={itemVariants}>
                <Link href={`/grading/${r._id}`} className="glass-card p-6 block">

                  <h3 className="font-bold text-slate-800 mb-2">
                    {r.title}
                  </h3>

                  <p className="text-sm text-slate-500 mb-4">
                    {r.description || 'No description'}
                  </p>

                  <div className="flex justify-between text-xs">
                    <span>{total} pts</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>

                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Inbox size={40} className="mx-auto text-slate-400 mb-4" />
          <h3 className="font-bold text-slate-700">No Results</h3>
          <p className="text-sm text-slate-500">
            Try a different search or create a rubric
          </p>
        </div>
      )}
    </motion.div>
  );
}