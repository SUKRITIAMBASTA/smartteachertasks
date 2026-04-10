'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingDown, Bell } from 'lucide-react';

interface AlertItem {
  id: string | number;
  title: string;
  meta: string;
  type?: 'danger' | 'warning' | 'info';
}

interface DashboardAlertsProps {
  title: string;
  alerts: AlertItem[];
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

export default function DashboardAlerts({ title, alerts }: DashboardAlertsProps) {
  return (
    <motion.div 
      variants={item}
      className="glass-card p-6 h-full border-t-4 border-rose-500 shadow-xl shadow-rose-500/5"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-slate-800 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
          <AlertCircle size={16} className="text-rose-500" /> {title}
        </h3>
        <Bell size={14} className="text-slate-300 animate-swing" />
      </div>
      
      <div className="space-y-4">
         {alerts.map((alert) => (
           <div key={alert.id} className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100/30 hover:bg-rose-50 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-rose-600 bg-rose-100/50 group-hover:scale-110 transition-transform">
                 <TrendingDown size={18} />
              </div>
              <div className="flex-grow min-w-0">
                <div className="text-sm font-black text-slate-800 truncate tracking-tight">{alert.title}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">{alert.meta}</div>
              </div>
           </div>
         ))}
         
         {alerts.length === 0 && (
           <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-3xl">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] block mb-2">System Tranquil</span>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">No priority incidents reported</p>
           </div>
         )}
         
         <div className="text-center pt-4 border-t border-slate-50">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Monitoring Institutional Node...</span>
         </div>
      </div>
    </motion.div>
  );
}
