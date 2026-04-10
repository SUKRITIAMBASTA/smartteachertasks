'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Plus, Shield, Settings } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface UserHeaderProps {
  onRegister: () => void;
}

export default function UserHeader({ onRegister }: UserHeaderProps) {
  // Nav-link subcomponent for consistent styling
  const HeaderLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link 
        href={href}
        className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold border border-slate-200 transition-all hover:bg-slate-200 text-sm"
      >
        {children}
      </Link>
    </motion.div>
  );

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <UsersIcon className="text-indigo-600" size={32} />
          User Directory
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage institutional roles and departmental access controls.</p>
      </div>

      <div className="flex gap-3">
        <HeaderLink href="/users/pending">
          <Shield size={18} className="text-indigo-500" />
          Pending Docs
        </HeaderLink>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={async () => {
            if (confirm('System Sync: This will initialize verification fields for all users. Proceed?')) {
              const res = await fetch('/api/admin/migrate', { method: 'POST' });
              const data = await res.json();
              toast.success(`Sync Complete: ${data.modifiedCount} records updated.`);
            }
          }}
          className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all"
          title="System Sync"
        >
          <Settings size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRegister}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700"
        >
          <Plus size={20} />
          Register New User
        </motion.button>
      </div>
    </div>
  );
}
