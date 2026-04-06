'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { 
  Plus, X, Sparkles, Target, Clock, 
  ListChecks, Trash2, ChevronDown, ChevronUp, 
  ShieldAlert, BookOpen, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function LessonPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ subject: '', topic: '', duration: '60 mins' });
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [error, setError] = useState('');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // 🔒 Role Restriction: Only Faculty & Admins (Administrators for audit)
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && role === 'student') {
      // Redirect students away from lesson planning
      router.push('/dashboard');
    }
  }, [status, role, router]);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/lesson-plans');
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load institutional plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && role !== 'student') fetchPlans();
  }, [session, role]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.topic) return setError('Fill all educational parameters.');
    
    setGenerating(true);
    setError('');
    setCurrentPlan(null);

    try {
      const res = await fetch('/api/lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentPlan(data);
      setPlans([data, ...plans]);
    } catch (err: any) {
      setError(err.message || 'AI sequence failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanent Wipe: Proceed with document deletion?')) return;
    await fetch(`/api/lesson-plans?id=${id}`, { method: 'DELETE' });
    setPlans(plans.filter(p => p._id !== id));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (role === 'student') return null;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <BookOpen className="text-indigo-600" size={32} />
             Academic Planning
          </h1>
          <p className="text-slate-500 text-sm mt-1">Generate AI-powered curriculums and lesson structures for your subjects.</p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold shadow-sm flex items-center gap-3"
          >
            <ShieldAlert size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* GENERATOR */}
      <div className="glass-card p-8 border-2 border-indigo-50 shadow-indigo-100/20">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
          <Sparkles size={24} className="text-indigo-500 animate-pulse" />
          Lesson Plan Generator
        </h2>

        <form onSubmit={handleGenerate} className="grid md:grid-cols-4 gap-4">
          <div className="space-y-1.5 focus-within:text-indigo-600">
             <label className="text-[10px] font-black uppercase tracking-widest ml-1">Subject</label>
             <input
               className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
               placeholder="e.g. Data Structures"
               value={form.subject}
               onChange={(e) => setForm({ ...form, subject: e.target.value })}
               required
             />
          </div>

          <div className="space-y-1.5 focus-within:text-indigo-600">
             <label className="text-[10px] font-black uppercase tracking-widest ml-1">Topic</label>
             <input
               className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
               placeholder="e.g. Binary Search Trees"
               value={form.topic}
               onChange={(e) => setForm({ ...form, topic: e.target.value })}
               required
             />
          </div>

          <div className="space-y-1.5 focus-within:text-indigo-600">
             <label className="text-[10px] font-black uppercase tracking-widest ml-1">Time Block</label>
             <select
               className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-600 appearance-none"
               value={form.duration}
               onChange={(e) => setForm({ ...form, duration: e.target.value })}
             >
               <option>30 mins</option>
               <option>60 mins</option>
               <option>90 mins</option>
             </select>
          </div>

          <div className="flex items-end">
            <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {generating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {generating ? 'SYNTHESIZING...' : 'GENERATE'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* RECENT / LIST */}
        <div className="lg:col-span-12 space-y-4">
          <h2 className="text-xl font-black text-slate-800">Faculty Archives</h2>

          {plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map(plan => (
                <motion.div layout id={plan._id} key={plan._id} className="glass-card p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                   <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Target size={24} />
                      </div>
                      <button onClick={() => handleDelete(plan._id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <h4 className="font-black text-slate-800 mb-1">{plan.topic}</h4>
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{plan.subject} • {plan.duration}</span>
                   </div>
                   
                   <div className="mt-6 pt-4 border-t border-slate-50">
                      <p className="text-xs text-slate-500 italic mb-4 line-clamp-2">{plan.assessment?.substring(0, 80)}...</p>
                      <button 
                        onClick={() => setExpandedPlanId(expandedPlanId === plan._id ? null : plan._id)}
                        className="w-full py-2 bg-slate-50 text-slate-700 text-xs font-black rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                      >
                         VIEW FULL STRUCTURE
                         {expandedPlanId === plan._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                   </div>

                   <AnimatePresence>
                    {expandedPlanId === plan._id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 space-y-4 pt-4 border-t-2 border-dashed border-slate-100">
                           <div className="space-y-1">
                              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target size={12}/> Learning Objectives</h5>
                              <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1 font-medium">
                                {plan.objectives?.map((o:any, i:number) => <li key={i}>{o}</li>)}
                              </ul>
                           </div>
                           <div className="space-y-1 pt-2">
                              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> Assessment Plan</h5>
                              <p className="text-xs text-slate-700 font-bold bg-slate-50 p-2 rounded-lg">{plan.assessment}</p>
                           </div>
                        </div>
                      </motion.div>
                    )}
                   </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-20 text-center space-y-4">
               <BookOpen size={48} className="mx-auto text-slate-200" />
               <h3 className="text-xl font-bold text-slate-800">No Institutional Plans</h3>
               <p className="text-slate-500 max-w-xs mx-auto">Generate a subject outline to populate your faculty archives.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}