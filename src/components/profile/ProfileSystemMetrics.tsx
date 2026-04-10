'use client';

import React from 'react';
import { Clock, PenTool, BookOpen, Shield } from 'lucide-react';

export default function ProfileSystemMetrics() {
  const metrics = [
    { label: 'Last Log In', value: 'Active Now', icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-50/30' },
    { label: 'Records Found', value: 'Personal Node Sync', icon: PenTool, color: 'text-indigo-400', bg: 'bg-indigo-50/30' },
    { label: 'Session Data', value: 'Cloud Verified', icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-50/30' },
  ];

  return (
    <div className="glass-card p-8 border-2 border-indigo-50/50 shadow-xl shadow-indigo-100/10 h-full">
      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
         <Shield size={16} className="text-indigo-500" /> System Metrics & Security
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className={`p-5 ${m.bg} rounded-3xl border border-indigo-100/20 hover:border-indigo-200 transition-all group`}>
              <Icon size={24} className={`${m.color} mb-3 group-hover:scale-110 transition-transform`} />
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{m.label}</p>
              <p className="text-sm font-bold text-slate-900 leading-tight">{m.value}</p>
            </div>
          );
        })}
        
        <div className="p-5 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-600/20 text-white group hover:scale-[1.02] transition-transform">
          <Shield size={24} className="text-white/80 mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black text-indigo-200 uppercase mb-1">Security Status</p>
          <p className="text-sm font-bold">MFA Required — 2026</p>
        </div>
      </div>
    </div>
  );
}
