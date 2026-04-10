'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, ChevronDown, Brain, BarChart3, Award,
  Trash2, CheckCircle2, XCircle, AlertCircle, BookOpen, ClipboardList
} from 'lucide-react';

export default function QuizzesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  // Generation state
  const [subjects,          setSubjects]          = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [numQuestions,      setNumQuestions]      = useState(10);
  const [difficulty,        setDifficulty]        = useState('balanced');
  const [generating,        setGenerating]        = useState(false);
  const [genError,          setGenError]          = useState('');

  // Module/Topic focus
  const [syllabus,          setSyllabus]          = useState<any>(null);
  const [selectedModuleNo,  setSelectedModuleNo]  = useState<number | ''>('');
  const [topicFilter,       setTopicFilter]       = useState('');
  const [loadingSyllabus,   setLoadingSyllabus]   = useState(false);

  // Quiz list state
  const [quizzes,     setQuizzes]     = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeQuiz,  setActiveQuiz]  = useState<any>(null);
  
  // Attempt state
  const [answers,   setAnswers]   = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Load subjects
  useEffect(() => {
    if (!session) return;
    const fetchSubs = async () => {
      try {
        const endpoint = role === 'student'
          ? `/api/academic-structure/subjects?semester=${(session.user as any).semester || 1}`
          : '/api/faculty/teaching?type=subjects';
        const res  = await fetch(endpoint);
        const data = await res.json();
        const arr  = Array.isArray(data) ? data : [];
        setSubjects(arr);
        if (arr.length > 0) setSelectedSubjectId(arr[0]._id);
      } catch { /* silent */ }
    };
    fetchSubs();
  }, [session, role]);

  // Load syllabus for selected subject to enable module-wise generation
  useEffect(() => {
    if (!selectedSubjectId) {
      setSyllabus(null);
      return;
    }
    const fetchSyllabus = async () => {
      setLoadingSyllabus(true);
      try {
        const res = await fetch('/api/syllabus');
        const data = await res.json();
        const match = (Array.isArray(data) ? data : []).find(
          (s: any) => s.subjectId?._id === selectedSubjectId || s.subjectId === selectedSubjectId
        );
        setSyllabus(match || null);
        setSelectedModuleNo('');
      } catch {
        setSyllabus(null);
      } finally {
        setLoadingSyllabus(false);
      }
    };
    fetchSyllabus();
  }, [selectedSubjectId]);

  // Load quiz list
  const fetchQuizzes = async () => {
    setLoadingList(true);
    try {
      const res  = await fetch('/api/quizzes');
      const data = await res.json();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setLoadingList(false); }
  };

  useEffect(() => { if (session) fetchQuizzes(); }, [session]);

  // Generate quiz
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;
    setGenerating(true);
    setGenError('');
    try {
      const res  = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subjectId: selectedSubjectId, 
          numQuestions, 
          difficulty,
          moduleNo: selectedModuleNo || undefined,
          topicFilter: topicFilter || undefined,
          save: true
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      await fetchQuizzes();
      // Open the newly generated quiz
      setActiveQuiz(data.quiz);
      setAnswers({});
      setSubmitted(false);
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this quiz?')) return;
    await fetch(`/api/quizzes?id=${id}`, { method: 'DELETE' });
    setQuizzes(q => q.filter(x => x._id !== id));
    if (activeQuiz?._id === id) setActiveQuiz(null);
  };

  // Score calc
  const allQuestions = activeQuiz
    ? [...(activeQuiz.levels?.easy || []), ...(activeQuiz.levels?.medium || []), ...(activeQuiz.levels?.hard || [])]
    : [];

  const score = submitted
    ? allQuestions.reduce((s, q, i) => s + (answers[i] === q.correctIndex ? 1 : 0), 0)
    : 0;

  const levelLabel: Record<string, string> = {
    easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard',
  };

  const selectedSubjectObj = subjects.find(s => s._id === selectedSubjectId);
  
  if (status === 'loading') return null;

  return (
    <div className="space-y-6 pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="glass-card p-6">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Brain size={24} className="text-purple-500" /> Quiz Generator
        </h1>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          AI-powered, syllabus-aligned assessments · Subject-wise · Semester-wise
        </p>
      </div>

      {/* Generator Panel (faculty/admin only) */}
      {['faculty', 'admin'].includes(role) && (
        <div className="glass-card p-6 border-2 border-purple-50">
          <h2 className="text-base font-black text-slate-700 mb-5 flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400 animate-pulse" /> Generate New Quiz
          </h2>
          <form onSubmit={handleGenerate} className="grid md:grid-cols-4 gap-4">
            {/* Subject */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-purple-400 appearance-none pr-10"
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  required
                >
                  {subjects.length === 0
                    ? <option>No subjects found</option>
                    : subjects.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} — Sem {s.semester} ({s.code})
                        </option>
                      ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {selectedSubjectObj && (
                <p className="text-[10px] text-purple-500 font-bold pl-1">
                  Sem {selectedSubjectObj.semester} · {selectedSubjectObj.code}
                </p>
              )}
            </div>

            {/* Questions count */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Questions</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-purple-400 appearance-none pr-10"
                  value={numQuestions}
                  onChange={e => setNumQuestions(Number(e.target.value))}
                >
                  {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Questions</option>)}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Difficulty</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-purple-400 appearance-none pr-10"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                >
                  <option value="balanced">Balanced</option>
                  <option value="easy-focus">Easy Focus</option>
                  <option value="hard-focus">Hard Focus</option>
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Module Picker (Dynamic from Syllabus) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Module (Optional)</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-purple-400 appearance-none pr-10"
                  value={selectedModuleNo}
                  onChange={e => setSelectedModuleNo(e.target.value ? Number(e.target.value) : '')}
                  disabled={loadingSyllabus || !syllabus}
                >
                  <option value="">Full Subject Assessment</option>
                  {syllabus?.modules?.map((m: any) => (
                    <option key={m.unitNo} value={m.unitNo}>
                      Unit {m.unitNo}: {m.title}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {loadingSyllabus && <Loader2 size={12} className="animate-spin text-purple-400" />}
                  <ChevronDown size={15} className="text-slate-400 pointer-events-none" />
                </div>
              </div>
              {!loadingSyllabus && !syllabus && selectedSubjectId && (
                <p className="text-[9px] text-amber-500 font-bold pl-1 italic">No structured syllabus found for this subject. Full assessment only.</p>
              )}
            </div>

            {/* Topic Filter */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Specific Topic Focus (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-purple-400"
                placeholder="e.g. Backpropagation, SQL Joins..."
                value={topicFilter}
                onChange={e => setTopicFilter(e.target.value)}
              />
            </div>

            {/* Generate Btn */}
            <div className="md:col-span-4">
              <button
                type="submit"
                disabled={generating || !selectedSubjectId}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-purple-100 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {generating ? 'AI Generating Quiz...' : 'Generate Quiz from Subject Syllabus'}
              </button>
            </div>

            {genError && (
              <div className="md:col-span-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold flex items-center gap-2">
                <AlertCircle size={15} /> {genError}
              </div>
            )}
          </form>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quiz list */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ClipboardList size={12} /> Quiz Archive ({quizzes.length})
          </h3>
          {loadingList ? (
            <div className="glass-card p-8 text-center">
              <Loader2 size={24} className="animate-spin mx-auto text-purple-400" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Brain size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm font-bold text-slate-400">No quizzes yet.</p>
              <p className="text-[10px] text-slate-300">Generate one above.</p>
            </div>
          ) : (
            quizzes.map(q => (
              <div
                key={q._id}
                onClick={() => { setActiveQuiz(q); setAnswers({}); setSubmitted(false); }}
                className={`glass-card p-4 cursor-pointer border-2 transition-all hover:shadow-md ${
                  activeQuiz?._id === q._id ? 'border-purple-300 bg-purple-50/50' : 'border-transparent hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-slate-800 truncate">{q.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                      Sem {q.semester} · {(q.levels?.easy?.length || 0) + (q.levels?.medium?.length || 0) + (q.levels?.hard?.length || 0)} Qs
                    </p>
                  </div>
                  {['faculty', 'admin'].includes(role) && (
                    <button onClick={e => handleDelete(q._id, e)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Active Quiz */}
        <div className="lg:col-span-2">
          {!activeQuiz ? (
            <div className="glass-card p-16 text-center">
              <Brain size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="font-black text-slate-400 text-sm uppercase tracking-widest">Select a quiz to attempt</p>
            </div>
          ) : (
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-800">{activeQuiz.title}</h2>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">{activeQuiz.description}</p>
                </div>
                {submitted && (
                  <div className="flex flex-col items-center px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                    <span className="text-2xl font-black text-indigo-700">{score}/{allQuestions.length}</span>
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Score</span>
                  </div>
                )}
              </div>

              {/* Preview Banner for Staff */}
              {role !== 'student' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700">
                  <AlertCircle size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Preview Mode: Only students can submit assessments.</p>
                </div>
              )}

              {(['easy', 'medium', 'hard'] as const).map(level => {
                const qs = activeQuiz.levels?.[level] || [];
                if (!qs.length) return null;
                const offset = level === 'medium'
                  ? (activeQuiz.levels?.easy?.length || 0)
                  : level === 'hard'
                  ? (activeQuiz.levels?.easy?.length || 0) + (activeQuiz.levels?.medium?.length || 0)
                  : 0;
                return (
                  <div key={level} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600">
                        {levelLabel[level]}
                      </span>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>
                    {qs.map((q: any, qi: number) => {
                      const globalIdx = offset + qi;
                      const chosen    = answers[globalIdx];
                      return (
                        <div key={qi} className={`p-4 rounded-2xl border-2 transition-all ${
                          submitted
                            ? chosen === q.correctIndex
                              ? 'border-emerald-200 bg-emerald-50'
                              : 'border-rose-200 bg-rose-50'
                            : 'border-slate-100 bg-white'
                        }`}>
                          <p className="font-bold text-sm text-slate-800 mb-3">
                            <span className="text-slate-400 font-black">{globalIdx + 1}.</span> {q.text}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt: string, oi: number) => (
                              <button
                                key={oi}
                                disabled={submitted || role !== 'student'}
                                onClick={() => !submitted && setAnswers(a => ({ ...a, [globalIdx]: oi }))}
                                className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                                  submitted
                                    ? oi === q.correctIndex
                                      ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                                      : oi === chosen
                                      ? 'border-rose-400 bg-rose-100 text-rose-700'
                                      : 'border-slate-100 text-slate-400'
                                    : chosen === oi
                                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-100 hover:border-slate-300 text-slate-600'
                                }`}
                              >
                                <span className="font-black mr-2">{['A','B','C','D'][oi]}.</span>{opt}
                              </button>
                            ))}
                          </div>
                          {submitted && q.explanation && (
                            <p className="mt-3 text-[11px] text-slate-500 font-bold bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                              💡 {q.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {!submitted ? (
                role === 'student' ? (
                  <button
                    onClick={() => setSubmitted(true)}
                    disabled={Object.keys(answers).length < allQuestions.length}
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <Award size={16} /> Submit Quiz
                  </button>
                ) : (
                  <div className="w-full py-3.5 bg-slate-100 text-slate-400 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                     PREVIEW MODE ONLY
                  </div>
                )
              ) : (
                <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 text-center">
                  <p className="font-black text-indigo-700 text-xl mb-1">{score}/{allQuestions.length} Correct</p>
                  <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest">
                    {score >= allQuestions.length * 0.8 ? '🏆 Excellent!' : score >= allQuestions.length * 0.5 ? '✅ Good effort' : '📖 Review required'}
                  </p>
                  <button
                    onClick={() => { setAnswers({}); setSubmitted(false); }}
                    className="mt-3 px-5 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all"
                  >
                    Retry Quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
