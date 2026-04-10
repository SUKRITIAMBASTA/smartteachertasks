'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-components
import StructureHeader from '@/components/academic-structure/StructureHeader';
import StructureTabs from '@/components/academic-structure/StructureTabs';
import DepartmentSection from '@/components/academic-structure/DepartmentSection';
import SubjectSection from '@/components/academic-structure/SubjectSection';
import SessionSection from '@/components/academic-structure/SessionSection';

/**
 * Institutional Academic Structure Configuration
 * Orchestrates administrative setup of Departments, Curriculum, and Academic Cycles.
 */
export default function AcademicStructurePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  // Local State
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects' | 'sessions'>('classes');
  const [departments, setDepartments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔒 Administrative Guard
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && role !== 'admin') router.push('/dashboard');
  }, [status, role, router]);

  // Data Pipeline
  const fetchData = async () => {
    try {
      setLoading(true);
      const [depRes, subRes, sesRes] = await Promise.all([
        fetch('/api/academic-structure/departments'),
        fetch('/api/academic-structure/subjects'),
        fetch('/api/academic-structure/sessions')
      ]);

      const [deps, subs, sess] = await Promise.all([
        depRes.json(),
        subRes.json(),
        sesRes.json()
      ]);

      setDepartments(deps);
      setSubjects(subs);
      setSessions(sess);
    } catch (err) {
      console.error('Failed to synchronize academic structure:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && role === 'admin') fetchData();
  }, [session, role]);

  if (status === 'loading' || (loading && departments.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Structural Registry...</p>
      </div>
    );
  }

  if (role !== 'admin') return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-8 pb-12 px-4 md:px-0"
    >
      {/* 1. Administrative Branding */}
      <StructureHeader />

      {/* 2. Unit Configuration Navigation */}
      <StructureTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 3. Sectional View Orchestration */}
      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: 10 }}
           transition={{ duration: 0.2 }}
        >
          {activeTab === 'classes' && <DepartmentSection departments={departments} />}
          {activeTab === 'subjects' && <SubjectSection subjects={subjects} onRefresh={fetchData} />}
          {activeTab === 'sessions' && <SessionSection sessions={sessions} onRefresh={fetchData} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
