'use client';

import React from 'react';
import { User as UserIcon, Mail, Shield } from 'lucide-react';

interface ProfileIdentityProps {
  user: any;
}

export default function ProfileIdentity({ user }: ProfileIdentityProps) {
  const roleColors: any = {
    admin: 'bg-indigo-600 text-white',
    faculty: 'bg-blue-500 text-white',
    student: 'bg-emerald-500 text-white'
  };

  return (
    <div className="glass-card p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-10 border-2 border-indigo-50/50">
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
                <Mail size={16} className="text-indigo-400" /> {user.email}
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                <Shield size={16} className="text-indigo-400" /> System {user.role?.toUpperCase()} Node
             </div>
          </div>
       </div>
    </div>
  );
}
