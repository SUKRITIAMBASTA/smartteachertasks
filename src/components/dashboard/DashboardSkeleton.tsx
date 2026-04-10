'use client';

import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="glass-card h-36 bg-slate-100/80 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card h-32 bg-slate-100/80 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card h-64 bg-slate-100/80 rounded-2xl" />
        <div className="glass-card h-64 bg-slate-100/80 rounded-2xl" />
      </div>
    </div>
  );
}
