'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-components
import LessonPlanHeader from '@/components/lesson-plans/LessonPlanHeader';
import LessonPlanGenerator from '@/components/lesson-plans/LessonPlanGenerator';
import LessonPlanList from '@/components/lesson-plans/LessonPlanList';

/**
 * Academic Lesson Planning Page
 * Enables faculty to generate AI-powered curriculum structures and manage archives.
 */
export default function LessonPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔒 Role Restriction: Only Faculty & Admin
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && role === 'student') {
      router.push('/dashboard');
    }
  }, [status, role, router]);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/lesson-plans');
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load institutional plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && role !== 'student') fetchPlans();
  }, [session, role]);

  const handleDelete = async (id: string) => {
    if (!confirm('Permanent Wipe: Proceed with document deletion?')) return;
    try {
      await fetch(`/api/lesson-plans?id=${id}`, { method: 'DELETE' });
      setPlans(prev => prev.filter(p => p._id !== id));
    } catch {
      setError('Deletion protocol failed.');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Accessing Faculty Archives...</p>
      </div>
    );
  }

  if (role === 'student') return null;

  return (
    <div className="space-y-8 pb-12 px-4 md:px-0">
      
      {/* 1. Header & Context */}
      <LessonPlanHeader />

      {/* 2. Error Feedback */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold shadow-sm flex items-center gap-3"
          >
            <ShieldAlert size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. AI Generation Interface */}
      <LessonPlanGenerator 
        role={role}
        onPlanGenerated={(newPlan) => setPlans([newPlan, ...plans])}
        onError={setError}
      />

      {/* 4. Archives / List Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-800">Faculty Archives</h2>
        <LessonPlanList 
          plans={plans} 
          onDelete={handleDelete} 
        />
      </div>
    </div>
  );
}