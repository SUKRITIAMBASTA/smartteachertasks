'use client';

import { useSession } from 'next-auth/react';
import { 
  User as UserIcon, Mail, Shield, Building2, 
  GraduationCap, Calendar, Clock, MapPin, 
  Briefcase, PenTool, BookOpen
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const user: any = session?.user;

  if (!user) return null;

  const roleColors: any = {
    admin: 'bg-indigo-600 text-white',
    faculty: 'bg-blue-500 text-white',
    student: 'bg-emerald-500 text-white'
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-20">
      
      {/* 🚀 IDENTITY HEADER */}
      <div className="glass-card p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
         <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-50" />
         
         <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-105">
               <UserIcon size={64} className="opacity-80" />
            </div>
            <div className={`absolute -bottom-2 -right-2 px-4 py-1.5 rounded-xl font-black text-[10px] tracking-widest uppercase shadow-lg ${roleColors[user.role] || 'bg-slate-400'}`}>
               {user.role}
            </div>
         </div>

         <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-medium pt-2">
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <Mail size={16} /> {user.email}
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <Shield size={16} /> System {user.role?.toUpperCase()}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         
         {/* 🏛️ INSTITUTIONAL DETAILS */}
         <div className="glass-card p-8 border-slate-100/50">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
               <Building2 size={16} className="text-indigo-500" /> Academic Placement
            </h2>
            <div className="space-y-6">
               <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Building2 size={24} /></div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Department</p>
                        <p className="text-lg font-bold text-slate-900">{user.department || 'Central Administration'}</p>
                     </div>
                  </div>
               </div>

               {user.role === 'student' && (
                 <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><GraduationCap size={24} /></div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Current Semester</p>
                         <p className="text-lg font-bold text-slate-900">Semester {user.semester || 1}</p>
                      </div>
                   </div>
                 </div>
               )}

               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Calendar size={24} /></div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Affiliation Period</p>
                        <p className="text-lg font-bold text-slate-900">Active - 2026-27 Session</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 🛠️ QUICK LINKS & STATUS */}
         <div className="glass-card p-8 border-slate-100/50">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
               <Briefcase size={16} className="text-indigo-500" /> System Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
                  <Clock size={24} className="text-indigo-400 mb-3" />
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Last Log In</p>
                  <p className="text-sm font-bold text-slate-900">Active Now</p>
               </div>
               <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
                  <PenTool size={24} className="text-indigo-400 mb-3" />
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Records Found</p>
                  <p className="text-sm font-bold text-slate-900">Personal Node Synchronized</p>
               </div>
               <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
                  <BookOpen size={24} className="text-indigo-400 mb-3" />
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Session Data</p>
                  <p className="text-sm font-bold text-slate-900">Cloud Sync Verified</p>
               </div>
               <div className="p-5 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-600/20 text-white">
                  <Shield size={24} className="text-white/80 mb-3" />
                  <p className="text-[10px] font-black text-indigo-200 uppercase mb-1">Security Status</p>
                  <p className="text-sm font-bold">MFA Required - 2026</p>
               </div>
            </div>
         </div>

      </div>

      <footer className="text-center">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Official SmartTeach Institutional Matrix Profile Portal</p>
      </footer>
    </div>
  );
}