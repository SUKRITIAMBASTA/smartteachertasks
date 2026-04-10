'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Inbox } from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string | number;
  primary: string;
  secondary: string;
  status?: string;
  statusColor?: string;
}

interface DashboardRecentActivityProps {
  title: string;
  icon: React.ReactNode;
  items: ActivityItem[];
  viewAllHref: string;
  columns: string[];
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

export default function DashboardRecentActivity({ title, icon, items, viewAllHref, columns }: DashboardRecentActivityProps) {
  return (
    <motion.div 
      variants={item}
      className="glass-card overflow-hidden h-full border-2 border-slate-50/50"
    >
      <div className="p-5 border-b border-white/60 flex items-center justify-between bg-white/20">
        <h3 className="font-black text-slate-800 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
          <span className="p-1 px-1.5 bg-slate-50 rounded-lg">{icon}</span>
          {title}
        </h3>
        <Link href={viewAllHref} className="text-[10px] font-black text-indigo-600 hover:text-indigo-500 flex items-center gap-1 uppercase tracking-widest border-b border-indigo-200 pb-0.5 transition-all">
          Manage All <ArrowRight size={12} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/60 border-b border-slate-100 uppercase text-[8px] font-black tracking-widest text-slate-400">
              <th className="px-6 py-3">{columns[0]}</th>
              <th className="px-6 py-3">{columns[1]}</th>
              <th className="px-6 py-3 text-right">{columns[2]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-white/60 transition-colors group">
                <td className="px-6 py-4 text-sm font-black text-slate-700 tracking-tight">{item.primary}</td>
                <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.secondary}</td>
                <td className="px-6 py-4 text-right">
                  {item.status && (
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl border-b-2 shadow-sm ${item.statusColor || 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      {item.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {items.length === 0 && (
          <div className="p-12 text-center space-y-3">
             <Inbox size={32} className="mx-auto text-slate-200" />
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Archive Empty</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
