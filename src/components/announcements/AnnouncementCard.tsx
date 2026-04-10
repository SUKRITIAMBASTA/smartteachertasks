'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Pin, Trash2, PinOff } from 'lucide-react';

interface AnnouncementCardProps {
  ann: any;
  role: string | undefined;
  onTogglePin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
}

const item = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.3 } }
};

export default function AnnouncementCard({ ann, role, onTogglePin, onDelete }: AnnouncementCardProps) {
  return (
    <motion.div
      variants={item}
      className={`glass-card p-6 group relative hover:shadow-xl hover:shadow-indigo-500/5 transition-all ${ann.pinned ? 'ring-2 ring-indigo-500/20 bg-indigo-50/5' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-3 mb-3">
            {ann.pinned && (
              <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 bg-white border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                <Pin size={10} className="fill-indigo-600" /> TOP PRIORITY
              </span>
            )}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded">
              FOR: {ann.targetRoles?.join(', ')}
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{ann.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">{ann.content}</p>
          
          <div className="flex items-center gap-2 mt-5">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[11px] font-black text-indigo-600">
              {ann.author?.name?.[0] || 'A'}
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{ann.author?.name || 'Academic Admin'}</span>
          </div>
        </div>

        {role === 'admin' && (
          <div className="flex items-center gap-1 transition-opacity">
            <button
              onClick={() => onTogglePin(ann._id, ann.pinned)}
              className={`p-2 rounded-xl transition-all ${ann.pinned ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-indigo-500 hover:bg-slate-50'}`}
              title={ann.pinned ? "Unpin Announcement" : "Pin to Top (Max 3)"}
            >
              {ann.pinned ? <PinOff size={18} /> : <Pin size={18} />}
            </button>
            <button
              onClick={() => onDelete(ann._id)}
              className="p-2 rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
              title="Delete Broadcast"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
