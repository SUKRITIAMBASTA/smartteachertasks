// app/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  Users, ClipboardList, CheckSquare, Activity, Settings,
  BookOpen, Calendar, GraduationCap, Sparkles, TrendingUp,
  AlertCircle, Shield, FileText, Bot, BrainCircuit,
  Megaphone, TrendingDown, ArrowRight, BookMarked,
  Building2, Landmark, Wallet
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

// ─────────────────────────────────────────
// SHARED STAT CARD
// ─────────────────────────────────────────
const colorMap: Record<string, { bg: string; icon: string; glow: string }> = {
  indigo: { bg: 'bg-indigo-50 border-indigo-100', icon: 'text-indigo-600', glow: 'bg-indigo-400' },
  emerald: { bg: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-600', glow: 'bg-emerald-400' },
  amber: { bg: 'bg-amber-50 border-amber-100', icon: 'text-amber-600', glow: 'bg-amber-400' },
  rose: { bg: 'bg-rose-50 border-rose-100', icon: 'text-rose-600', glow: 'bg-rose-400' },
  blue: { bg: 'bg-blue-50 border-blue-100', icon: 'text-blue-600', glow: 'bg-blue-400' },
  cyan: { bg: 'bg-cyan-50 border-cyan-100', icon: 'text-cyan-600', glow: 'bg-cyan-400' },
  purple: { bg: 'bg-purple-50 border-purple-100', icon: 'text-purple-600', glow: 'bg-purple-400' },
};

function StatCard({ title, value, label, icon, color }: { title: string; value: any; label: string; icon: React.ReactNode; color: string }) {
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

// ─────────────────────────────────────────
// ADMIN DASHBOARD (Logistics Focus)
// ─────────────────────────────────────────
function AdminDashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8 pb-12">
      <motion.div variants={item} className="glass-card p-7 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-cyan-500/5" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Landmark size={32} />
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] bg-blue-50 px-2 py-1 rounded-full border border-blue-100">Institutional Provost</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight mb-3">University Logistics Hub</h2>
            <p className="text-sm text-slate-500 leading-relaxed">Central command for academic scheduling, resource allocation, and institutional broadcasts.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/schedule-manager" className="btn btn-primary shadow-blue-100">
                <Sparkles size={16} /> AI Automation
             </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Students" value="2,840" label="Across all Depts" icon={<Users size={20} />} color="blue" />
        <StatCard title="Lecture Halls" value="18" label="Available" icon={<Building2 size={20} />} color="emerald" />
        <StatCard title="Exam Centers" value="12" label="Allocated" icon={<Calendar size={20} />} color="purple" />
        <StatCard title="Fee Collection" value="92%" label="Current Period" icon={<Wallet size={20} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" /> Academic Schedules
          </h3>
          <div className="space-y-3">
            <Link href="/schedule-manager" className="block p-3 rounded-xl bg-white/60 border border-white hover:border-blue-100 hover:shadow-sm transition-all group">
              <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600">Class Routine</div>
              <div className="text-xs text-slate-500 font-medium">Automatic routine generation</div>
            </Link>
            <Link href="/schedule-manager" className="block p-3 rounded-xl bg-white/60 border border-white hover:border-blue-100 hover:shadow-sm transition-all group">
              <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600">Exam Timetable</div>
              <div className="text-xs text-slate-500 font-medium">Mid-sem & End-sem schedules</div>
            </Link>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <Megaphone size={16} className="text-amber-500" /> Administrative Notices
          </h3>
          <div className="space-y-3">
            <Link href="/resources" className="block p-3 rounded-xl bg-white/60 border border-white hover:border-amber-100 hover:shadow-sm transition-all group">
              <div className="text-sm font-bold text-slate-800 group-hover:text-amber-600">Fee Notices</div>
              <div className="text-xs text-slate-500 font-bold tracking-tighter uppercase opacity-40">Financial Bulletins</div>
            </Link>
            <Link href="/resources" className="block p-3 rounded-xl bg-white/60 border border-white hover:border-amber-100 hover:shadow-sm transition-all group">
              <div className="text-sm font-bold text-slate-800 group-hover:text-amber-600">Institutional Holidays</div>
              <div className="text-xs text-slate-500 font-bold tracking-tighter uppercase opacity-40">Broadcast Calendar</div>
            </Link>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-5">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" /> Resource Statistics
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600">Lab Occupancy</span>
              <span className="text-xs font-black text-emerald-600">65%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 w-[65%] h-full rounded-full"></div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs font-bold text-slate-600">Room Utilization</span>
              <span className="text-xs font-black text-blue-600">82%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 w-[82%] h-full rounded-full"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// FACULTY DASHBOARD (Same as before)
// ─────────────────────────────────────────
function FacultyDashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8 pb-12">
      <motion.div variants={item} className="glass-card p-7 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-cyan-500/5 to-purple-500/5" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
            <Sparkles size={28} className="animate-pulse" />
          </div>
          <div className="flex-grow">
             <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">AI Teaching Assistant</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Live</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-3">Faculty Portal</h2>
            <div className="text-sm text-slate-700 max-w-2xl p-4 bg-white/60 backdrop-blur-md rounded-xl border border-white shadow-sm italic leading-relaxed relative">
              <span className="relative z-10">"Good morning! Your curriculum dashboard is ready. I recommend reviewing your upcoming 'Digital Logic' lesson as student engagement has been peaking in that subject area."</span>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
             <Link href="/lesson-plans" className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm text-white flex items-center gap-2 text-sm font-bold">
               <BrainCircuit size={16} /> Generate Lesson
             </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Upcoming Classes" value="3" label="Today" icon={<Calendar size={20} />} color="blue" />
        <StatCard title="Assignments to Grade" value="24" label="Action Required" icon={<CheckSquare size={20} />} color="amber" />
        <StatCard title="Students Monitored" value="120" label="Across 4 Sections" icon={<Users size={20} />} color="emerald" />
        <StatCard title="Avg Attendance" value="88%" label="Slight Increase" icon={<TrendingUp size={20} />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="glass-card overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-white/60 flex items-center justify-between">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
              <ClipboardList size={15} className="text-indigo-500" /> Recent Lesson Plans
            </h3>
            <Link href="/lesson-plans" className="text-[10px] font-black text-indigo-600 hover:text-indigo-500 flex items-center gap-1 uppercase tracking-widest border-b border-indigo-200 pb-0.5">
              Manage All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Topic</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { id: 1, topic: 'Introduction to Algorithms', sub: 'CS101', status: 'Ready to Share' },
                  { id: 2, topic: 'Data Structures: Trees', sub: 'CS102', status: 'Draft' },
                  { id: 3, topic: 'Machine Learning Basics', sub: 'CS301', status: 'Shared' }
                ].map((l) => (
                  <tr key={l.id} className="hover:bg-white/60 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-semibold text-slate-700">{l.topic}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">{l.sub}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                        l.status === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        l.status === 'Shared' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-6 lg:col-span-1 border-t-4 border-rose-500">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
              <AlertCircle size={16} className="text-rose-500" /> Priority Alerts
            </h3>
          </div>
          <div className="space-y-3">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100/50">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-rose-600 bg-rose-100">
                   <TrendingDown size={14} />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-bold text-slate-800 truncate">Attendance Alert</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">BTech CSE • SEM 3</div>
                </div>
             </div>
             <div className="text-center p-4">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Live Monitoring...</span>
             </div>
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <motion.div variants={item} className="glass-card p-6">
           <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
             <Bot size={16} className="text-purple-500" /> Academic AI Suite
           </h3>
           <div className="grid grid-cols-2 gap-3">
             <Link href="/lesson-plans" className="p-4 rounded-xl border border-slate-100 bg-white/50 hover:bg-white transition-all hover:shadow-sm">
               <BrainCircuit className="text-purple-500 mb-2" size={20} />
               <div className="text-sm font-bold text-slate-800">Generate Quizzes</div>
             </Link>
             <Link href="/grading" className="p-4 rounded-xl border border-slate-100 bg-white/50 hover:bg-white transition-all hover:shadow-sm">
               <CheckSquare className="text-indigo-500 mb-2" size={20} />
               <div className="text-sm font-bold text-slate-800">Auto-Grade Tasks</div>
             </Link>
             <div className="p-4 rounded-xl border border-slate-100 bg-white/50 hover:bg-white transition-all hover:shadow-sm cursor-pointer col-span-2 flex items-center justify-between text-indigo-600">
                <div>
                   <div className="text-sm font-bold text-slate-800">Suggest Strategy</div>
                   <div className="text-xs text-slate-500 mt-1">AI-powered pedagogical advice</div>
                </div>
                <Sparkles size={20}/>
             </div>
           </div>
         </motion.div>
         
         <motion.div variants={item} className="glass-card p-6">
           <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
             <BookOpen size={16} className="text-cyan-500" /> Teaching Resources
           </h3>
           <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                 <div className="flex items-center gap-3">
                    <FileText className="text-slate-400" size={18} />
                    <span className="text-sm font-bold text-slate-700">Digital Logic Slides</span>
                 </div>
                 <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">PDF</span>
              </div>
              <Link href="/resources" className="block text-center text-xs font-bold text-indigo-600 hover:text-indigo-500 mt-2">
                Manage Resource Bank
              </Link>
           </div>
         </motion.div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// STUDENT DASHBOARD (Same as before)
// ─────────────────────────────────────────
function StudentDashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8 pb-12">
      <motion.div variants={item} className="glass-card p-7 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5" />
        <div className="relative z-10 flex items-center gap-5 justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <GraduationCap size={28} />
            </div>
            <div>
              <div className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.3em] mb-1 bg-cyan-50 px-2 py-1 rounded-full border border-cyan-100 inline-block">Student Portal</div>
              <h2 className="text-xl font-black text-slate-800">Welcome Back</h2>
              <p className="text-sm text-slate-500 mt-1">Ready to learn? Check your upcoming assignments and access AI support.</p>
            </div>
          </div>
          <div className="hidden md:block">
            <button className="px-4 py-2 border border-slate-200 bg-white shadow-sm rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-all">
              <Bot size={16} className="text-indigo-500" /> Ask AI Doubt
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard title="Upcoming Deadlines" value="2" label="Due this week" icon={<Calendar size={20} />} color="rose" />
        <StatCard title="Active Courses" value="5" label="Enrolled" icon={<BookOpen size={20} />} color="blue" />
        <StatCard title="Current GPA" value="3.8" label="Top 15%" icon={<Activity size={20} />} color="emerald" />
        <StatCard title="New Lessons" value="3" label="Unread resources" icon={<FileText size={20} />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest mb-5">
            <CheckSquare size={16} className="text-indigo-500" /> Pending Tasks
          </h3>
          <div className="space-y-4">
             <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex justify-between items-center">
                <div>
                   <div className="text-sm font-bold text-slate-800">Operating Systems Quiz</div>
                   <div className="text-xs text-rose-500 font-medium">Due Tomorrow</div>
                </div>
                <button className="text-xs font-bold bg-white border border-rose-200 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50">Take Quiz</button>
             </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-6">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest mb-5">
            <BookMarked size={16} className="text-amber-500" /> Recent Learning
          </h3>
          <div className="space-y-3">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-white hover:bg-white transition-all cursor-pointer">
                <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                   <FileText size={16} />
                </div>
                <div className="flex-grow">
                   <div className="text-sm font-bold text-slate-800">Advanced Digital Logic</div>
                   <div className="text-xs text-slate-500">2 hours ago</div>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
             </div>
          </div>
        </motion.div>
      </div>
      
      <motion.div variants={item} className="glass-card p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-slate-50/50">
        <Bot size={32} className="text-indigo-500 mb-3" />
        <h3 className="font-bold text-lg text-slate-800">Need academic help?</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-4">Our AI tutor can explain topics, provide practice questions, and help with doubts.</p>
        <button className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-sm transition-all focus:ring-4 ring-indigo-100 flex items-center gap-2">
           <Sparkles size={16} /> Chat with AI Tutor
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      <div className="glass-card h-36 bg-slate-100/80 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-32 bg-slate-100/80 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card h-64 bg-slate-100/80 rounded-2xl" />
        <div className="glass-card h-64 bg-slate-100/80 rounded-2xl" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'student';

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [session]);

  if (loading) return <DashboardSkeleton />;

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'faculty') return <FacultyDashboard />;
  return <StudentDashboard />;
}