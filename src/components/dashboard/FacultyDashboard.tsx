'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, CheckSquare, Users, TrendingUp,
  ClipboardList, AlertCircle, 
  BrainCircuit, Bot, BookOpen, Sparkles 
} from 'lucide-react';
import Link from 'next/link';
import StatCard from './StatCard';

// Modular Widgets
import DashboardHero from './widgets/DashboardHero';
import DashboardQuickActions from './widgets/DashboardQuickActions';
import DashboardRecentActivity from './widgets/DashboardRecentActivity';
import DashboardAlerts from './widgets/DashboardAlerts';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

/**
 * Faculty Management Console
 * Orchestrates teaching logistics, AI curriculum assembly, and student performance telemetry.
 */
export default function FacultyDashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8 pb-12">
      
      {/* 1. AI Augmented Hero Banner */}
      <DashboardHero 
        title="Faculty Portal"
        description="Good morning! Your curriculum dashboard is ready. I recommend reviewing your upcoming 'Digital Logic' lesson as student engagement has been peaking in that subject area."
        roleLabel="AI Teaching Assistant"
        actionLabel="Generate Lesson"
        actionHref="/lesson-plans"
        actionIcon={<BrainCircuit size={16} />}
      />

      {/* 2. Key Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Upcoming Classes" value="3" label="Today" icon={<Calendar size={20} />} color="blue" />
        <StatCard title="Assignments to Grade" value="24" label="Action Required" icon={<CheckSquare size={20} />} color="amber" />
        <StatCard title="Students Monitored" value="120" label="Across 4 Sections" icon={<Users size={20} />} color="emerald" />
        <StatCard title="Avg Attendance" value="88%" label="Slight Increase" icon={<TrendingUp size={20} />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. Primary Activity Feed */}
        <div className="lg:col-span-2">
           <DashboardRecentActivity 
             title="Recent Lesson Plans"
             icon={<ClipboardList size={16} className="text-indigo-500" />}
             viewAllHref="/lesson-plans"
             columns={['Topic', 'Subject', 'Status']}
             items={[
               { id: 1, primary: 'Introduction to Algorithms', secondary: 'CS101', status: 'Ready to Share', statusColor: 'bg-blue-50 text-blue-600 border-blue-200' },
               { id: 2, primary: 'Data Structures: Trees', secondary: 'CS102', status: 'Drafting', statusColor: 'bg-amber-50 text-amber-600 border-amber-200' },
               { id: 3, primary: 'Machine Learning Basics', secondary: 'CS301', status: 'Propagated', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
             ]}
           />
        </div>

        {/* 4. Priority Telemetry Sidebar */}
        <div className="lg:col-span-1">
           <DashboardAlerts 
             title="Priority Alerts"
             alerts={[
               { id: 1, title: 'Attendance Alert', meta: 'BTech CSE • SEM 3', type: 'danger' }
             ]}
           />
        </div>
      </div>
      
      {/* 5. Toolsets & Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <DashboardQuickActions 
           title="Academic AI Suite"
           icon={<Bot size={16} className="text-purple-500" />}
           actions={[
             { title: 'Generate Quizzes', href: '/resources', icon: <BrainCircuit size={20} />, color: 'text-purple-500' },
             { title: 'Auto-Grade Tasks', href: '/grading', icon: <CheckSquare size={20} />, color: 'text-indigo-500' },
             { title: 'Instructional Strategy', href: '#', icon: <Sparkles size={20} />, color: 'text-rose-500', span: true, description: 'AI-powered pedagogical advice' }
           ]}
         />
         
         <div className="glass-card p-6 border-2 border-slate-50/50">
            <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="p-1.5 bg-slate-50 rounded-lg shadow-inner"><BookOpen size={16} className="text-cyan-500" /></span>
              Teaching Resources
            </h3>
            <div className="space-y-4">
               {[
                 { title: 'Digital Logic Slides', type: 'PDF' },
                 { title: 'Algorithm Worksheets', type: 'DOCX' }
               ].map((res, i) => (
                 <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <BookOpen size={16} />
                       </div>
                       <span className="text-sm font-bold text-slate-700">{res.title}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-100 px-2.5 py-1 rounded-lg shadow-sm">{res.type}</span>
                 </div>
               ))}
               <div className="pt-4 mt-2">
                 <Link 
                   href="/resources" 
                   className="block text-center text-xs font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-widest pb-1 border-b-2 border-indigo-50 w-fit mx-auto transition-all"
                 >
                   Manage Resource Bank
                 </Link>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
