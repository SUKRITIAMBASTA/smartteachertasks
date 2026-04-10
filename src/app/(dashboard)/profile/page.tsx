'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

// Sub-components
import ProfileIdentity from '@/components/profile/ProfileIdentity';
import ProfileInstitutional from '@/components/profile/ProfileInstitutional';
import ProfileSystemMetrics from '@/components/profile/ProfileSystemMetrics';

/**
 * Personal Identity Portal
 * Orchestrates user identity, academic placement, and system telemetry across all roles.
 */
export default function ProfilePage() {
  const { data: session } = useSession();
  const user: any = session?.user;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Identity Node...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1000px] mx-auto space-y-8 pb-20 px-4 md:px-0"
    >
      {/* 🚀 1. Identity Header */}
      <ProfileIdentity user={user} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         
         {/* 🏛️ 2. Institutional Details */}
         <ProfileInstitutional user={user} />

         {/* 🛠️ 3. System Metrics & Status */}
         <ProfileSystemMetrics />

      </div>

      <footer className="text-center pt-8">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Official SmartTeach Institutional Matrix Profile Portal</p>
      </footer>
    </motion.div>
  );
}