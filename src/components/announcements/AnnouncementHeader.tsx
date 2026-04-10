'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus } from 'lucide-react';

interface AnnouncementHeaderProps {
  role: string;
  pinnedCount: number;
  onNewBroadcast: () => void;
}

export default function AnnouncementHeader({ role, pinnedCount, onNewBroadcast }: AnnouncementHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
           <Megaphone className="text-indigo-600" size={32} />
           Campus Broadcasts
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Official announcements and pinned priorities ({pinnedCount}/3 pinned)
        </p>
      </div>
      
      {role === 'admin' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700"
          onClick={onNewBroadcast}
        >
          <Plus size={20} /> New Broadcast
        </motion.button>
      )}
    </div>
  );
}
