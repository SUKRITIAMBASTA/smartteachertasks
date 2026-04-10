'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Building2, Calendar, Wallet, Landmark, 
  Sparkles, Megaphone, Activity, LayoutGrid 
} from 'lucide-react';
import StatCard from './StatCard';

// Modular Widgets
import DashboardHero from './widgets/DashboardHero';
import DashboardQuickActions from './widgets/DashboardQuickActions';
import DashboardRecentActivity from './widgets/DashboardRecentActivity';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

/**
 * Institutional Logistics Hub
 * Central command for academic scheduling, resource allocation, and institutional broadcasts.
 */
export default function AdminDashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8 pb-12">
      
      {/* 1. Administrative Hero Banner */}
      <DashboardHero 
        title="University Logistics Hub"
        description="Central command for academic scheduling, resource allocation, and institutional broadcasts. Monitor departmental performance and session synchronization."
        roleLabel="Institutional Provost"
        actionLabel="AI Automation"
        actionHref="/schedule-manager"
        actionIcon={<Sparkles size={16} />}
        icon={<Landmark size={32} />}
        gradientFrom="blue-500/5"
        gradientTo="indigo-500/5"
      />

      {/* 2. Global Institutional Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Students" value="2,840" label="Across all Depts" icon={<Users size={20} />} color="blue" />
        <StatCard title="Lecture Halls" value="18" label="Available" icon={<Building2 size={20} />} color="emerald" />
        <StatCard title="Exam Centers" value="12" label="Allocated" icon={<Calendar size={20} />} color="purple" />
        <StatCard title="Fee Collection" value="92%" label="Current Period" icon={<Wallet size={20} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 3. Scheduling Suite */}
        <DashboardQuickActions 
          title="Academic Schedules"
          icon={<Calendar size={16} className="text-blue-500" />}
          actions={[
            { title: 'Class Routine', description: 'Automatic routine generation', href: '/schedule-manager', icon: <LayoutGrid size={20} />, color: 'text-blue-500', span: true },
            { title: 'Exam Timetable', description: 'Mid-sem & End-sem schedules', href: '/schedule-manager', icon: <Calendar size={20} />, color: 'text-indigo-500', span: true }
          ]}
        />
        
        {/* 4. Communication Hub */}
        <DashboardQuickActions 
          title="Administrative Notices"
          icon={<Megaphone size={16} className="text-amber-500" />}
          actions={[
            { title: 'Fee Notices', description: 'Financial Bulletins', href: '/resources', icon: <Wallet size={20} />, color: 'text-amber-500', span: true },
            { title: 'Institutional Holidays', description: 'Broadcast Calendar', href: '/resources', icon: <Megaphone size={20} />, color: 'text-rose-500', span: true }
          ]}
        />

        {/* 5. Resource Telemetry Block */}
        <div className="glass-card p-6 border-2 border-slate-50/50">
           <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest mb-6 flex items-center gap-3">
             <span className="p-1.5 bg-slate-50 rounded-lg shadow-inner"><Activity size={16} className="text-emerald-500" /></span>
             Resource Utilization
           </h3>
           <div className="space-y-6">
              {[
                { label: 'Lab Occupancy', value: '65%', color: 'bg-emerald-500' },
                { label: 'Room Utilization', value: '82%', color: 'bg-blue-500' }
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">{stat.label}</span>
                      <span className="text-slate-800">{stat.value}</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                      <div className={`${stat.color} h-full rounded-full`} style={{ width: stat.value }}></div>
                   </div>
                </div>
              ))}
              <div className="pt-2 text-center">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] animate-pulse">Monitoring Real-Time Telemetry...</p>
              </div>
           </div>
        </div>

      </div>
    </motion.div>
  );
}
