'use client';

import { useState, useEffect } from 'react';
import { X, Brain, Sparkles, Trash2, CheckCircle2, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizForm {
  title: string;
  description: string;
  departmentId: string;
  subjectId: string;
  semester: number;
  moduleName: string;
  levels: {
    easy: Question[];
    medium: Question[];
    hard: Question[];
  };
}

export default function QuizCreationModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState<'easy' | 'medium' | 'hard'>('easy');

  const [form, setForm] = useState<QuizForm>({
    title: '',
    description: '',
    departmentId: user?.departmentId || '',
    subjectId: '',
    semester: user?.semester || 1,
    moduleName: '',
    levels: {
      easy: [],
      medium: [],
      hard: [],
    }
  });

  useEffect(() => {
    fetch('/api/academic-structure/departments').then(res => res.json()).then(setDepartments);
    fetch('/api/academic-structure/subjects').then(res => res.json()).then(setSubjects);
  }, []);

  const handleGenerateAI = async () => {
    if (!form.subjectId) {
      toast.warning('Please select a subject first.');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: form.subjectId,
          difficulty: 'balanced',
          numQuestions: 10,
          save: false // Don't auto-save for the manual editor modal
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.levels) {
        setForm({
          ...form,
          levels: data.levels
        });
        toast.success('AI questions generated! Review them below.');
      }
    } catch (err: any) {
      toast.error('AI Generation failed: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.levels.easy.length === 0) {
      toast.warning('Please add some questions or generate them using AI.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save quiz');
      }
    } catch (err) {
      toast.error('Submission error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="glass-card w-full max-w-5xl h-[90vh] flex flex-col relative z-20 overflow-hidden shadow-2xl bg-white/80 backdrop-blur-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">AI Quiz Orchestrator</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-60">Create multi-level syllabus checkpoints.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6 p-6">
          {/* Sidebar: Config */}
          <div className="w-full md:w-80 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Quiz Title</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all text-sm"
                  placeholder="e.g. Data Structures Foundation"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Department</label>
                  <select
                    required
                    disabled={user?.role !== 'admin'}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-500 transition-all text-sm appearance-none disabled:opacity-50"
                    value={form.departmentId}
                    onChange={e => setForm({ ...form, departmentId: e.target.value })}
                  >
                    <option value="">Select Dept</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.branch})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Subject</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-500 transition-all text-sm appearance-none"
                    value={form.subjectId}
                    onChange={e => {
                        const sub = subjects.find(s => s._id === e.target.value);
                        setForm({ 
                            ...form, 
                            subjectId: e.target.value,
                            semester: sub ? sub.semester : form.semester 
                        });
                    }}
                  >
                    <option value="">Select Subject</option>
                    {subjects.filter(s => s.departmentId?._id === form.departmentId || s.departmentId === form.departmentId).map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Semester</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-500"
                    value={form.semester}
                    onChange={e => setForm({ ...form, semester: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Module</label>
                  <input
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500"
                    placeholder="Module Name/No."
                    value={form.moduleName}
                    onChange={e => setForm({ ...form, moduleName: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={generating}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {generating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {generating ? 'AI Thinking...' : 'AI-Generate Quizzes'}
              </button>
            </div>
          </div>

          {/* Main Area: Question Editor */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {(['easy', 'medium', 'hard'] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setCurrentLevel(lvl)}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentLevel === lvl ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {lvl} ({form.levels[lvl].length})
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {form.levels[currentLevel].length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                  <div className="p-4 bg-white/50 rounded-full mb-4">
                    <Brain className="text-slate-300" size={48} />
                  </div>
                  <h3 className="text-slate-600 font-bold">No questions loaded for this level.</h3>
                  <p className="text-slate-400 text-sm mt-1">Use the AI-generator on the left to populate this instantly.</p>
                </div>
              ) : (
                form.levels[currentLevel].map((q, idx) => (
                  <div key={idx} className="p-5 bg-white border border-slate-100 rounded-2xl space-y-4 relative group shadow-sm">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Q.{idx + 1} • {currentLevel.toUpperCase()}</span>
                      <button 
                        type="button"
                        onClick={() => {
                           const newLvl = [...form.levels[currentLevel]];
                           newLvl.splice(idx, 1);
                           setForm({ ...form, levels: { ...form.levels, [currentLevel]: newLvl } });
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <textarea
                      className="w-full bg-transparent text-slate-800 font-bold text-lg outline-none resize-none placeholder-slate-200"
                      value={q.text}
                      onChange={e => {
                        const newLvl = [...form.levels[currentLevel]];
                        newLvl[idx].text = e.target.value;
                        setForm({ ...form, levels: { ...form.levels, [currentLevel]: newLvl } });
                      }}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2 relative">
                          <input
                            className={`flex-1 px-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-700 outline-none transition-all ${q.correctIndex === oIdx ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 focus:border-indigo-500 bg-white'}`}
                            value={opt}
                            onChange={e => {
                              const newLvl = [...form.levels[currentLevel]];
                              newLvl[idx].options[oIdx] = e.target.value;
                              setForm({ ...form, levels: { ...form.levels, [currentLevel]: newLvl } });
                            }}
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const newLvl = [...form.levels[currentLevel]];
                              newLvl[idx].correctIndex = oIdx;
                              setForm({ ...form, levels: { ...form.levels, [currentLevel]: newLvl } });
                            }}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all ${q.correctIndex === oIdx ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'}`}
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Total questions: <span className="text-indigo-600">{form.levels.easy.length + form.levels.medium.length + form.levels.hard.length}</span>
           </p>
           <div className="flex gap-4 w-full md:w-auto">
              <button onClick={onClose} className="flex-1 md:flex-none px-6 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors">Cancel</button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {loading ? 'Publishing...' : 'Deploy Quiz'}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
