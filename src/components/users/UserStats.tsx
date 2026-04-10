'use client';

import React from 'react';

interface UserStatsProps {
  stats: {
    total: number;
    admins: number;
    faculty: number;
    students: number;
  };
  loading: boolean;
}

export default function UserStats({ stats, loading }: UserStatsProps) {
  const statItems = [
    { label: 'Total Accounts', value: stats.total, color: 'indigo' },
    { label: 'Administrators', value: stats.admins, color: 'rose' },
    { label: 'Faculty Staff', value: stats.faculty, color: 'blue' },
    { label: 'Students', value: stats.students, color: 'emerald' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((stat, i) => (
        <div key={i} className="glass-card p-4 text-center border-b-2 border-transparent hover:border-indigo-100 transition-all">
          <div className="text-2xl font-black text-slate-800">
            {loading ? '...' : stat.value}
          </div>
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
