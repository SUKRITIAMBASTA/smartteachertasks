'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import AnnouncementCard from './AnnouncementCard';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
};

interface AnnouncementListProps {
  announcements: any[];
  role: string | undefined;
  onTogglePin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
}

export default function AnnouncementList({ announcements, role, onTogglePin, onDelete }: AnnouncementListProps) {
  if (announcements.length === 0) {
    return (
      <div className="glass-card p-20 text-center space-y-4">
         <div className="inline-flex p-4 bg-slate-50 rounded-3xl text-slate-300">
           <Megaphone size={48} />
         </div>
         <h3 className="text-xl font-bold text-slate-800">No active broadcasts</h3>
         <p className="text-slate-500 max-w-xs mx-auto text-sm">
           The communication channel is currently quiet. Check back later for university updates.
         </p>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-4">
      {announcements.map((ann) => (
        <AnnouncementCard 
          key={ann._id} 
          ann={ann} 
          role={role} 
          onTogglePin={onTogglePin} 
          onDelete={onDelete} 
        />
      ))}
    </motion.div>
  );
}
