'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2 } from 'lucide-react';
import { FILE_ICONS, CATEGORY_LABELS } from '../ResourceConstants';

interface ResourceCardProps {
  resource: any;
  user: any;
  role: string;
  onDelete: (id: string) => void;
  idx: number;
}

export default function ResourceCard({ resource, user, role, onDelete, idx }: ResourceCardProps) {
  const ext = resource.fileName?.split('.').pop()?.toLowerCase() || resource.fileType?.toLowerCase() || 'default';
  const Icon = FILE_ICONS[ext] || FILE_ICONS['default'];
  const cat = CATEGORY_LABELS[resource.category] || CATEGORY_LABELS['Other'];
  const CatIcon = cat.icon;

  const canDelete = role === 'admin' || (resource.uploadedBy?._id === user?.id || resource.uploadedBy === user?.id);

  return (
    <motion.div
      layout
      key={resource._id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="glass-card group relative p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-default overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
          <Icon className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={24} />
        </div>
        
        <div className="flex items-center gap-2">
           <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${cat.color}`}>
              <CatIcon size={12} />
              {resource.category}
           </span>
           {canDelete && (
             <button onClick={() => onDelete(resource._id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
               <Trash2 size={16} />
             </button>
           )}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1 line-clamp-1">{resource.title}</h3>
      <p className="text-sm text-slate-500 line-clamp-2 mb-3 h-10">{resource.description || 'No description provided.'}</p>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-500">.{ext}</span>
        <span className="text-[10px] font-bold text-slate-400">{resource.fileSize}</span>
      </div>

      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex flex-col">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course</span>
           <div className="flex items-center gap-2">
             <span className="text-sm font-bold text-slate-700">{resource.course || 'Universal'}</span>
             {resource.semester && (
               <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                 Sem {resource.semester}
               </span>
             )}
           </div>
        </div>
        <motion.a
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          href={`/api/resources/download?id=${resource._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
          title={`Download ${resource.fileName}`}
        >
          <Download size={20} />
        </motion.a>
      </div>
    </motion.div>
  );
}
