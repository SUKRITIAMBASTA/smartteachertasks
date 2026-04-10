'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface DashboardHeroProps {
  title: string;
  description: string;
  roleLabel: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: React.ReactNode;
  icon?: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

export default function DashboardHero({ 
  title, description, roleLabel, actionLabel, actionHref, actionIcon, icon, gradientFrom = 'indigo-500/5', gradientTo = 'purple-500/5' 
}: DashboardHeroProps) {
  return (
    <motion.div 
      variants={item}
      initial="hidden"
      animate="visible"
      className="glass-card p-7 relative overflow-hidden border-2 border-slate-50/50"
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`} />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
          {icon || <Sparkles size={28} className="animate-pulse" />}
        </div>
        <div className="flex-grow">
           <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">{roleLabel}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Live Terminal</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{title}</h2>
          <div className="text-sm text-slate-600 max-w-2xl leading-relaxed italic opacity-80 bg-white/40 backdrop-blur-sm p-3 rounded-xl border border-white/40">
             "{description}"
          </div>
        </div>
        
        {actionLabel && actionHref && (
          <div className="flex gap-3 shrink-0 self-end md:self-center">
             <Link href={actionHref} className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest active:scale-95">
               {actionIcon} {actionLabel}
             </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
