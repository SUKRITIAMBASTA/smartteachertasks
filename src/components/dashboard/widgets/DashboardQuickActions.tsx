'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface QuickAction {
  title: string;
  description?: string;
  icon: React.ReactNode;
  href: string;
  color?: string;
  span?: boolean;
}

interface DashboardQuickActionsProps {
  title: string;
  icon: React.ReactNode;
  actions: QuickAction[];
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

export default function DashboardQuickActions({ title, icon, actions }: DashboardQuickActionsProps) {
  return (
    <motion.div 
      variants={item}
      className="glass-card p-6 h-full flex flex-col border-2 border-slate-50/50"
    >
      <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
        <span className="p-1.5 bg-slate-50 rounded-lg shadow-inner">{icon}</span>
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4 flex-grow">
        {actions.map((action, i) => (
          <Link 
            key={i} 
            href={action.href} 
            className={`p-5 rounded-3xl border border-slate-100 bg-white/40 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all group ${action.span ? 'col-span-2 flex items-center justify-between' : 'flex flex-col items-start'}`}
          >
            <div>
              <div className={`mb-3 transition-transform group-hover:scale-110 ${action.color || 'text-indigo-500'}`}>
                {action.icon}
              </div>
              <div className="text-sm font-black text-slate-800 tracking-tight">{action.title}</div>
              {action.description && (
                <div className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">{action.description}</div>
              )}
            </div>
            {action.span && <div className="text-indigo-400 group-hover:translate-x-1 transition-transform">→</div>}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
