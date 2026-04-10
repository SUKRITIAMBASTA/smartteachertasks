'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import FacultyDashboard from '@/components/dashboard/FacultyDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

/**
 * Main dashboard orchestration page.
 * Uses role-based rendering to show the appropriate institutional hub.
 */
export default function DashboardPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'student';

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session]);

  if (loading) return <DashboardSkeleton />;

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'faculty') return <FacultyDashboard />;
  
  return <StudentDashboard />;
}