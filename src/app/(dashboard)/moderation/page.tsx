'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle, FileText, AlertTriangle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContentModerationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && role !== 'admin') router.push('/dashboard');
  }, [status, role, router]);

  const [activeTab, setActiveTab] = useState<'lessons' | 'resources' | 'reports'>('lessons');

  if (status === 'loading') return <div className="p-6">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Shield className="text-rose-500" /> Content Moderation
        </h1>
        <p className="text-sm text-slate-500 mt-1">Review AI-generated lessons, approve shared resources, and monitor reported content.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('lessons')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'lessons' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Lesson Plans (AI)</button>
        <button onClick={() => setActiveTab('resources')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'resources' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Shared Resources</button>
        <button onClick={() => setActiveTab('reports')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'reports' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Reported Content <span className="ml-1 bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded text-[10px]">2</span></button>
      </div>

      {activeTab === 'lessons' && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Review Pending Lesson Plans</h2>
          <div className="space-y-4">
             {[
               { topic: 'Basic Thermodynamics', faculty: 'Dr. Smith', flagged: true },
               { topic: 'Data Structures - Arrays', faculty: 'Prof. Johnson', flagged: false }
             ].map((l, i) => (
                <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${l.flagged ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white/50'}`}>
                   <div className="flex items-start gap-3">
                      <FileText className={l.flagged ? 'text-amber-500' : 'text-slate-400'} size={20} />
                      <div>
                         <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                           {l.topic} 
                           {l.flagged && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">AI Flagged</span>}
                         </div>
                         <div className="text-xs text-slate-500 mt-0.5">Author: {l.faculty}</div>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50">Review</button>
                      <button className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded hover:bg-emerald-100 flex items-center gap-1"><CheckCircle size={14}/> Approve</button>
                      <button className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded hover:bg-rose-100 flex items-center gap-1"><XCircle size={14}/> Reject</button>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Approve Public Resources</h2>
          <div className="text-sm text-slate-500 text-center py-10">All resources are currently approved.</div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">User Reported Content</h2>
          <div className="space-y-4">
             <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start gap-4">
               <AlertTriangle className="text-rose-500 shrink-0" size={24} />
               <div className="flex-grow">
                  <div className="text-sm font-bold text-slate-800">Inappropriate Comment in "Physics 101 Discussion"</div>
                  <div className="text-xs text-slate-600 mt-1 italic">"Reported by 3 students for unprofessional language."</div>
                  <div className="mt-3 flex gap-2">
                     <button className="text-xs font-bold bg-white text-rose-600 border border-rose-200 px-3 py-1.5 rounded hover:bg-rose-50">Delete Comment</button>
                     <button className="text-xs font-bold bg-white text-slate-600 border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50">Dismiss Report</button>
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
