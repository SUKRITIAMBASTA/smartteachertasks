// app/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  Ticket, AlertCircle, CheckCircle2, Sparkles,
  ArrowRight, Activity, Zap, Shield, BarChart3,
  Clock, Megaphone, BookOpen, Users, TrendingDown,
  UserX, GraduationCap
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
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          <div className="w-1 h-1 rounded-full bg-slate-200" />
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
// ADMIN DASHBOARD
// ─────────────────────────────────────────
function AdminDashboard({ ticketStats, recentTickets, announcements, warnings, summary, insight }: any) {
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <motion.div variants={item} className="glass-card p-7 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Shield size={32} />
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">Admin Control Center</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight mb-3">System Overview</h2>
            <div className="text-sm text-slate-700 max-w-2xl p-4 bg-white/60 backdrop-blur-md rounded-xl border border-white shadow-sm italic leading-relaxed relative">
              <span className="relative z-10">{insight || 'Loading AI classroom intelligence briefing...'}</span>
            </div>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="text-center px-5 py-3 rounded-2xl bg-white/80 border border-white shadow-sm">
              <div className="text-2xl font-black text-slate-800">{summary?.avgAttendance || 0}%</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Attendance</div>
            </div>
            <div className="text-center px-5 py-3 rounded-2xl bg-white/80 border border-white shadow-sm">
              <div className="text-2xl font-black text-slate-800">{summary?.avgScore || 0}%</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">GPA Avg</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Open Tickets" value={ticketStats.open} label="Pending Action" icon={<AlertCircle size={20} />} color="amber" />
        <StatCard title="In Progress" value={ticketStats.inProgress} label="Being Handled" icon={<Clock size={20} />} color="blue" />
        <StatCard title="Resolved" value={ticketStats.resolved} label="Tasks Completed" icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatCard title="Total Tickets" value={ticketStats.total} label="All Time" icon={<Ticket size={20} />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Early Warnings */}
        <motion.div variants={item} className="glass-card p-6 lg:col-span-1 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-16 h-16 opacity-5 rotate-12 text-rose-500"><Shield size={64} /></div>
          <div className="flex items-center justify-between mb-5 relative z-10">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
              <AlertCircle size={16} className="text-rose-500" /> Early Warnings
            </h3>
            <span className="text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-100 px-2 py-1 rounded-full uppercase tracking-widest">
              {warnings?.length || 0} alerts
            </span>
          </div>
          <div className="space-y-3 relative z-10">
            {warnings?.length > 0 ? warnings.slice(0, 4).map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-white hover:bg-white transition-all cursor-pointer group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 text-white text-xs font-black flex items-center justify-center shrink-0">
                  {s.name?.[0]}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-bold text-slate-800 truncate">{s.name}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">{s.details}</div>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-rose-400 transition-colors shrink-0" />
              </div>
            )) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500 border border-emerald-100">
                  <CheckCircle2 size={28} />
                </div>
                <div className="font-bold text-slate-700 text-sm">All Clear</div>
                <p className="text-slate-400 text-xs mt-1">No students at risk</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Tickets Table */}
        <motion.div variants={item} className="glass-card overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-white/60 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
                <Ticket size={15} className="text-indigo-500" /> Operational Logs
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 ml-5">Real-time Support Activity</p>
            </div>
            <Link href="/tickets" className="text-[10px] font-black text-indigo-600 hover:text-indigo-500 flex items-center gap-1 uppercase tracking-widest border-b border-indigo-200 pb-0.5">
              Full Log <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Incident</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTickets.slice(0, 6).map((t: any) => (
                  <tr key={t._id} className="hover:bg-white/60 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-semibold text-slate-700">{t.title}</td>
                    <td className="px-6 py-3.5">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${t.status === 'open' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        t.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${t.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        t.priority === 'high' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                          'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {t.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentTickets.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">No recent tickets.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Announcements */}
      <motion.div variants={item} className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
            <Megaphone size={15} className="text-amber-500" /> Broadcast Center
          </h3>
          <Link href="/announcements" className="text-[10px] font-black text-amber-600 hover:text-amber-500 uppercase tracking-widest border-b border-amber-200 pb-0.5">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.slice(0, 3).map((ann: any) => (
            <div key={ann._id} className="p-5 rounded-2xl bg-white/60 border border-white hover:bg-white transition-all cursor-pointer group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{ann.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{ann.content}</p>
            </div>
          ))}
          {announcements.length === 0 && <div className="text-slate-400 text-sm col-span-3 py-6 text-center">No announcements yet.</div>}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// FACULTY DASHBOARD
// ─────────────────────────────────────────
function FacultyDashboard({ ticketStats, recentTickets, announcements, warnings, summary, insight }: any) {
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8 pb-12">
      {/* AI Insight Banner */}
      <motion.div variants={item} className="glass-card p-7 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-cyan-500/5 to-purple-500/5" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
            <Sparkles size={28} className="animate-pulse" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">AI Classroom Briefing</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Live Telemetry</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-3">Advanced Classroom Insights</h2>
            <div className="text-sm text-slate-700 max-w-2xl p-4 bg-white/60 backdrop-blur-md rounded-xl border border-white shadow-sm italic leading-relaxed relative">
              <span className="relative z-10">{insight || 'Generating your classroom intelligence briefing...'}</span>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="text-center px-5 py-3 rounded-2xl bg-white/80 border border-white shadow-sm">
              <div className="text-2xl font-black text-slate-800">{summary?.avgAttendance || 0}%</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Attendance</div>
            </div>
            <div className="text-center px-5 py-3 rounded-2xl bg-white/80 border border-white shadow-sm">
              <div className="text-2xl font-black text-slate-800">{summary?.avgScore || 0}%</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">GPA Avg</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Open Tickets" value={ticketStats.open} label="Pending Review" icon={<AlertCircle size={20} />} color="amber" />
        <StatCard title="In Progress" value={ticketStats.inProgress} label="Active Sessions" icon={<Clock size={20} />} color="blue" />
        <StatCard title="Resolved" value={ticketStats.resolved} label="Closed" icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatCard title="Benchmark" value="85%" label="Semester Goal" icon={<BarChart3 size={20} />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Early Warnings */}
        <motion.div variants={item} className="glass-card p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
              <AlertCircle size={16} className="text-rose-500" /> At-Risk Students
            </h3>
            <span className="text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-100 px-2 py-1 rounded-full uppercase tracking-widest">
              {warnings?.length || 0} alerts
            </span>
          </div>
          <div className="space-y-3">
            {warnings?.length > 0 ? warnings.slice(0, 5).map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-white hover:bg-white transition-all cursor-pointer group">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-black ${s.reason === 'low_attendance' ? 'bg-amber-400' : 'bg-rose-400'}`}>
                  {s.reason === 'low_attendance' ? <UserX size={14} /> : <TrendingDown size={14} />}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-bold text-slate-800 truncate">{s.name}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{s.details}</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500 border border-emerald-100">
                  <CheckCircle2 size={22} />
                </div>
                <div className="font-bold text-slate-700 text-sm">All Clear</div>
                <p className="text-slate-400 text-xs mt-1">No at-risk students</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tickets */}
        <motion.div variants={item} className="glass-card overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-white/60 flex items-center justify-between">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
              <Ticket size={15} className="text-indigo-500" /> My Tickets
            </h3>
            <Link href="/tickets" className="text-[10px] font-black text-indigo-600 hover:text-indigo-500 flex items-center gap-1 uppercase tracking-widest border-b border-indigo-200 pb-0.5">
              All Tickets <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTickets.slice(0, 5).map((t: any) => (
                  <tr key={t._id} className="hover:bg-white/60 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-semibold text-slate-700">{t.title}</td>
                    <td className="px-6 py-3.5">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${t.status === 'open' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        t.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${t.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        t.priority === 'high' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                          'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {t.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentTickets.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">No tickets found.</div>}
          </div>
        </motion.div>
      </div>

      {/* Announcements */}
      <motion.div variants={item} className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
            <Megaphone size={15} className="text-amber-500" /> Announcements
          </h3>
          <Link href="/announcements" className="text-[10px] font-black text-amber-600 hover:text-amber-500 uppercase tracking-widest border-b border-amber-200 pb-0.5">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.slice(0, 3).map((ann: any) => (
            <div key={ann._id} className="p-5 rounded-2xl bg-white/60 border border-white hover:bg-white transition-all cursor-pointer group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{ann.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{ann.content}</p>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-slate-400 text-sm col-span-3 text-center py-6">No announcements.</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// STUDENT DASHBOARD
// ─────────────────────────────────────────
function StudentDashboard({ ticketStats, recentTickets, announcements }: any) {
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <motion.div variants={item} className="glass-card p-7 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <GraduationCap size={28} />
          </div>
          <div>
            <div className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.3em] mb-1 bg-cyan-50 px-2 py-1 rounded-full border border-cyan-100 inline-block">Student Portal</div>
            <h2 className="text-xl font-black text-slate-800">Welcome to SmartTeach</h2>
            <p className="text-sm text-slate-500 mt-1">Track your tickets, access resources, and stay updated with announcements.</p>
          </div>
        </div>
      </motion.div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <StatCard title="My Open Tickets" value={ticketStats.open} label="Awaiting Response" icon={<Ticket size={20} />} color="amber" />
        <StatCard title="In Progress" value={ticketStats.inProgress} label="Being Handled" icon={<Clock size={20} />} color="blue" />
        <StatCard title="Resolved" value={ticketStats.resolved} label="All Done" icon={<CheckCircle2 size={20} />} color="emerald" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My Recent Tickets */}
        <motion.div variants={item} className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/60 flex items-center justify-between">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
              <Ticket size={15} className="text-indigo-500" /> My Tickets
            </h3>
            <Link href="/tickets" className="text-[10px] font-black text-indigo-600 flex items-center gap-1 uppercase tracking-widest border-b border-indigo-200 pb-0.5">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentTickets.slice(0, 4).map((t: any) => (
              <div key={t._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/60 transition-colors">
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-semibold text-slate-700 truncate">{t.title}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shrink-0 ${t.status === 'open' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  t.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>
            ))}
            {recentTickets.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">No tickets yet. <Link href="/tickets" className="text-indigo-500 font-bold">Create one →</Link></div>}
          </div>
        </motion.div>

        {/* Announcements */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
              <Megaphone size={15} className="text-amber-500" /> Announcements
            </h3>
            <Link href="/announcements" className="text-[10px] font-black text-amber-600 uppercase tracking-widest border-b border-amber-200 pb-0.5">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {announcements.slice(0, 4).map((ann: any) => (
              <div key={ann._id} className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-white hover:bg-white transition-all cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-bold text-slate-800 line-clamp-1">{ann.title}</div>
                  <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ann.content}</div>
                </div>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-slate-400 text-sm text-center py-6">No announcements.</p>}
          </div>
        </motion.div>
      </div>

      {/* Quick Links */}
      <motion.div variants={item} className="glass-card p-6">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-5">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { href: '/tickets', icon: <Ticket size={20} />, label: 'Submit Ticket', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { href: '/resources', icon: <BookOpen size={20} />, label: 'Browse Resources', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { href: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements', color: 'text-amber-600 bg-amber-50 border-amber-100' },
          ].map(q => (
            <Link key={q.href} href={q.href}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-md ${q.color}`}>
              {q.icon}
              <span className="font-bold text-sm">{q.label}</span>
            </Link>
          ))}
        </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card h-64 bg-slate-100/80 rounded-2xl" />
        <div className="glass-card lg:col-span-2 h-64 bg-slate-100/80 rounded-2xl" />
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

  const [ticketStats, setTicketStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const userRole = (session.user as any)?.role || 'student';

    (async () => {
      try {
        // ✅ SAFE BASE FETCHES
        const [statsRes, ticketsRes, annRes] = await Promise.all([
          fetch('/api/tickets?stats=true'),
          fetch('/api/tickets'),
          fetch('/api/announcements'),
        ]);

        // ✅ SET DATA SAFELY
        const statsJson = await statsRes.json();
        setTicketStats(statsJson || { total: 0, open: 0, inProgress: 0, resolved: 0 });

        const ticketsData = await ticketsRes.json();
        setRecentTickets(Array.isArray(ticketsData) ? ticketsData : []);

        const annData = await annRes.json();
        setAnnouncements(Array.isArray(annData) ? annData : []);

        // ✅ SAFE AI FETCH (DO NOT BREAK APP)
        if (userRole !== 'student') {
          try {
            const aiRes = await fetch('/api/analytics/ai-insights');

            if (aiRes.ok) {
              const aiJson = await aiRes.json();
              setAiData(aiJson);
            } else {
              console.log('AI API not available');
            }

          } catch (err) {
            console.log('AI fetch failed (safe ignore)');
          }
        }

      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    })();

  }, [session]);

  if (loading) return <DashboardSkeleton />;

  const { summary, warnings, insight } = aiData || {};
  const props = { ticketStats, recentTickets, announcements, warnings, summary, insight };

  if (role === 'admin') return <AdminDashboard   {...props} />;
  if (role === 'faculty') return <FacultyDashboard {...props} />;
  return <StudentDashboard {...props} />;
}