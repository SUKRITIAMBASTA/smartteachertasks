'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Calendar, BookOpen, 
  Activity, FileText, CheckSquare, BookMarked, Bot, Sparkles, ArrowRight 
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
 * Student Learning Portal
 * Orchestrates academic progress, upcoming deadlines, and AI-powered educational support.
 */
export default function StudentDashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8 pb-12">
      
      {/* 1. Student Identity Hero */}
      <DashboardHero 
        title="Welcome Back"
        description="Ready to learn? Check your upcoming assignments and access AI support for your current curriculum."
        roleLabel="Student Portal"
        actionLabel="Ask AI Doubt"
        actionHref="/resources"
        actionIcon={<Bot size={16} />}
        icon={<GraduationCap size={28} />}
        gradientFrom="cyan-500/5"
        gradientTo="blue-500/5"
      />

      {/* 2. Personal Academic Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard title="Upcoming Deadlines" value="2" label="Due this week" icon={<Calendar size={20} />} color="rose" />
        <StatCard title="Active Courses" value="5" label="Enrolled" icon={<BookOpen size={20} />} color="blue" />
        <StatCard title="Current GPA" value="3.8" label="Top 15%" icon={<Activity size={20} />} color="emerald" />
        <StatCard title="New Lessons" value="3" label="Unread resources" icon={<FileText size={20} />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 3. Task Management Widget */}
        <DashboardQuickActions 
          title="Pending Tasks"
          icon={<CheckSquare size={16} className="text-indigo-500" />}
          actions={[
            { title: 'Operating Systems Quiz', description: 'Due Tomorrow', href: '/resources', icon: <Calendar size={20} />, color: 'text-rose-500', span: true }
          ]}
        />

        {/* 4. Recent Activity Widget */}
        <DashboardRecentActivity 
          title="Recent Learning"
          icon={<BookMarked size={16} className="text-amber-500" />}
          viewAllHref="/resources"
          columns={['Resource', 'Time', 'Access']}
          items={[
            { id: 1, primary: 'Advanced Digital Logic', secondary: '2 hours ago', status: 'Reviewing', statusColor: 'bg-blue-50 text-blue-600 border-blue-200' }
          ]}
        />
      </div>
      
      {/* 5. AI Tutor CTA Widget */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="glass-card p-10 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-slate-50/50 border-2 border-indigo-50/50 shadow-xl shadow-indigo-100/10"
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 shadow-inner tracking-tighter">
           <Bot size={32} className="animate-bounce" />
        </div>
        <h3 className="font-black text-2xl text-slate-800 tracking-tight">Need academic help?</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-6 mt-2 leading-relaxed opacity-80">Our AI tutor can explain complex topics, provide practice questions, and help clarify doubts across your current curriculum.</p>
        <button className="px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all uppercase tracking-widest flex items-center gap-3 active:scale-95">
           <Sparkles size={16} /> Chat with AI Tutor
        </button>
      </motion.div>
    </motion.div>
  );
}
