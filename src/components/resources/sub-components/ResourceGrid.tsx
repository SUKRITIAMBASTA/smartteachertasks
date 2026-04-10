'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import ResourceCard from './ResourceCard';

interface ResourceGridProps {
  resources: any[];
  user: any;
  role: string;
  onDelete: (id: string) => void;
}

export default function ResourceGrid({ resources, user, role, onDelete }: ResourceGridProps) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
         <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
         <h3 className="text-xl font-bold text-slate-800">No resources found</h3>
         <p className="text-slate-500 max-w-xs mx-auto mt-2">Check back later for updated course materials.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {resources.map((r, idx) => (
          <ResourceCard 
            key={r._id} 
            resource={r} 
            user={user} 
            role={role} 
            onDelete={onDelete} 
            idx={idx} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
