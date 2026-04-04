'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell
} from 'recharts';
import {
  Users, CheckCircle, Award, BookOpen,
  TrendingUp, Calendar, Download, Sparkles
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Skeleton, CardSkeleton } from '@/components/Skeleton';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AnalyticsDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const { attendance, distribution, trends, summary } = data || {};

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Performance Analytics</h1>
          <p className="text-slate-500 text-sm">A holistic overview of student engagement and academic progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="glass-card flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-800 transition-all text-xs font-bold uppercase tracking-widest shadow-sm">
            <Calendar size={14} />
            Last 30 Days
          </button>
          <button className="btn btn-primary btn-sm flex items-center gap-2">
            <Download size={14} />
            Export Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={summary?.totalStudents || 0}
          icon={<Users className="text-indigo-500" />}
          trend="+2 Recently Added"
          color="indigo"
        />
        <StatCard
          title="Avg. Attendance"
          value={`${summary?.avgAttendance || 0}%`}
          icon={<CheckCircle className="text-emerald-500" />}
          trend="Performing as Expected"
          color="emerald"
        />
        <StatCard
          title="Class GPA"
          value={`${summary?.avgScore || 0}%`}
          icon={<Award className="text-amber-500" />}
          trend="+5% Improvement"
          color="amber"
        />
        <StatCard
          title="Assessments"
          value={summary?.totalAssessments || 0}
          icon={<BookOpen className="text-rose-500" />}
          trend="3 Scheduled Next"
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Chart */}
        <motion.div variants={itemVariants} className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Calendar className="text-indigo-500" size={18} />
                Attendance Trends
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Daily Present & Absence Insights
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />Present
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-50 border border-rose-100">
                <span className="w-2 h-2 rounded-full bg-rose-500" />Absent
              </div>
            </div>
          </div>
          <div className="h-72 w-full ml-[-15px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(15,23,42,0.12)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 700, fontSize: 11 }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="Present" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={16} />
                <Bar dataKey="Absent" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Marks Distribution */}
        <motion.div variants={itemVariants} className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={18} />
                Grade Bracket Distribution
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Student Performance Counts per Category
              </p>
            </div>
          </div>
          <div className="h-72 w-full ml-[-20px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(15,23,42,0.12)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 700, fontSize: 11 }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                  {distribution?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Performance Area Chart */}
        <motion.div variants={itemVariants} className="glass-card p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={18} />
                Longitudinal Progress
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                Average Class Achievement Across Assessment Cycles
              </p>
            </div>
            <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              LIVE TELEMETRY
            </div>
          </div>
          <div className="h-80 w-full ml-[-10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(15,23,42,0.12)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 700, fontSize: 11 }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="average"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAvg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, trend, color }: { title: string; value: any; icon: React.ReactNode; trend: string; color: string }) {
  const colorMap: Record<string, { bg: string; glow: string }> = {
    indigo:  { bg: 'bg-indigo-50 border border-indigo-100',  glow: 'bg-indigo-400' },
    emerald: { bg: 'bg-emerald-50 border border-emerald-100', glow: 'bg-emerald-400' },
    amber:   { bg: 'bg-amber-50 border border-amber-100',    glow: 'bg-amber-400'   },
    rose:    { bg: 'bg-rose-50 border border-rose-100',      glow: 'bg-rose-400'    },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      className="glass-card p-6 flex items-center gap-5 group relative overflow-hidden cursor-default"
    >
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full ${c.glow} opacity-10 -mr-6 -mt-6 blur-2xl group-hover:scale-125 transition-transform duration-700`} />
      <div className={`w-13 h-13 p-3 rounded-2xl ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0`}>
        {icon}
      </div>
      <div className="relative z-10 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-1">{value}</h4>
        <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">{trend}</span>
      </div>
    </motion.div>
  );
}
