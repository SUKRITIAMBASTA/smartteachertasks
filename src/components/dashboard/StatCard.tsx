'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

const colorMap: Record<string, { bg: string; icon: string; glow: string }> = {
  indigo: { bg: 'bg-indigo-50 border-indigo-100', icon: 'text-indigo-600', glow: 'bg-indigo-400' },
  emerald: { bg: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-600', glow: 'bg-emerald-400' },
  amber: { bg: 'bg-amber-50 border-amber-100', icon: 'text-amber-600', glow: 'bg-amber-400' },
  rose: { bg: 'bg-rose-50 border-rose-100', icon: 'text-rose-600', glow: 'bg-rose-400' },
  blue: { bg: 'bg-blue-50 border-blue-100', icon: 'text-blue-600', glow: 'bg-blue-400' },
  cyan: { bg: 'bg-cyan-50 border-cyan-100', icon: 'text-cyan-600', glow: 'bg-cyan-400' },
  purple: { bg: 'bg-purple-50 border-purple-100', icon: 'text-purple-600', glow: 'bg-purple-400' },
};

interface StatCardProps {
  title: string;
  value: any;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export default function StatCard({ title, value, label, icon, color }: StatCardProps) {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      className="glass-card p-6 relative overflow-hidden cursor-default group"
    >
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full ${c.glow} opacity-10 -mr-6 -mt-6 blur-2xl group-hover:scale-125 transition-transform duration-700`} />
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${c.bg} ${c.icon} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</div>
        <div className="text-3xl font-black text-slate-800 tabular-nums tracking-tighter leading-none mb-2">{value}</div>
        <div className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${c.icon}`}>
          <Activity size={9} />
          {label}
        </div>
      </div>
    </motion.div>
  );
}
