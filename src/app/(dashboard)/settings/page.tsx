'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Settings, Sliders, CheckSquare, BrainCircuit, Activity, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SystemSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && role !== 'admin') router.push('/dashboard');
  }, [status, role, router]);

  const [activeTab, setActiveTab] = useState<'grading' | 'ai' | 'rules'>('grading');

  if (status === 'loading') return <div className="p-6">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Settings className="text-slate-600" /> System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Configure global platform rules, grading systems, and AI models.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('grading')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'grading' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Grading Criteria</button>
        <button onClick={() => setActiveTab('ai')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ai' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>AI Prompts & Models</button>
        <button onClick={() => setActiveTab('rules')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'rules' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Platform Rules</button>
      </div>

      {activeTab === 'grading' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <CheckSquare className="text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800">Grading Templates</h2>
          </div>
          
          <div className="space-y-5">
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Default Grading Scale</label>
               <select className="form-select bg-white border border-slate-200 rounded-lg px-4 py-2 w-full md:w-1/2 text-sm">
                  <option>Letter Grades (A, B, C, D, F)</option>
                  <option>Percentage (0 - 100%)</option>
                  <option>Points Based</option>
               </select>
             </div>
             
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Standard Rubric Outline</label>
               <textarea className="form-textarea bg-white border border-slate-200 rounded-lg px-4 py-2 w-full h-32 text-sm" placeholder="Enter default markdown format for grading rubrics..."></textarea>
               <p className="text-xs text-slate-500 mt-1">This will be used as the base template when faculty auto-generate rubrics.</p>
             </div>

             <button className="btn btn-primary flex items-center gap-2 text-sm"><Save size={16}/> Save Grading Settings</button>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BrainCircuit className="text-purple-500" />
            <h2 className="text-lg font-bold text-slate-800">AI Context & Prompts</h2>
          </div>
          
          <div className="space-y-5">
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Teacher Lesson Generation Base Prompt</label>
               <textarea defaultValue="You are an expert college professor designing a lesson plan..." className="form-textarea bg-white border border-slate-200 rounded-lg px-4 py-2 w-full h-24 text-sm"></textarea>
             </div>
             
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Student Chatbot Persona</label>
               <textarea defaultValue="You are a helpful teaching assistant guiding a student without giving away direct answers..." className="form-textarea bg-white border border-slate-200 rounded-lg px-4 py-2 w-full h-24 text-sm"></textarea>
             </div>

             <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div>
                   <div className="font-bold text-slate-800 text-sm">Allow AI Auto-Grading</div>
                   <div className="text-xs text-slate-500">Permit AI to automatically score objective questions.</div>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle1" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" style={{ right: 0, borderColor: '#6366f1' }}/>
                    <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-indigo-500 cursor-pointer"></label>
                </div>
             </div>

             <button className="btn btn-primary flex items-center gap-2 text-sm"><Save size={16}/> Save AI Preferences</button>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800">Platform Thresholds</h2>
          </div>
          
          <div className="space-y-5">
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Minimum Attendance Threshold (%)</label>
               <input type="number" defaultValue="75" className="form-input bg-white border border-slate-200 rounded-lg px-4 py-2 w-full md:w-1/3 text-sm" />
               <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Triggers At-Risk warning if below</p>
             </div>

             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Failing Grade Threshold (%)</label>
               <input type="number" defaultValue="40" className="form-input bg-white border border-slate-200 rounded-lg px-4 py-2 w-full md:w-1/3 text-sm" />
             </div>

             <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50 mt-4">
                <div>
                   <div className="font-bold text-slate-800 text-sm">Auto-Lock Student Accounts on Extreme Low Attendance</div>
                   <div className="text-xs text-slate-500">Automatically restrict portal access if attendance drops below 30%</div>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle2" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" style={{ right: 0, borderColor: '#cbd5e1' }}/>
                    <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer"></label>
                </div>
             </div>

             <button className="btn btn-primary flex items-center gap-2 text-sm"><Save size={16}/> Save Rules</button>
          </div>
        </div>
      )}

    </motion.div>
  );
}
