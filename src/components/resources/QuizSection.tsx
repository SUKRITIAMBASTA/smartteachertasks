'use client';

import { useState, useEffect, useMemo } from 'react';
import { Brain, Sparkles, Trophy, Play, Trash2, Search, Filter, Loader2, BookOpen, GraduationCap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizCreationModal from './QuizCreationModal';
import QuizPlayer from './QuizPlayer';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

export default function QuizSection() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isElevated = ['admin', 'faculty'].includes(user?.role);

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes');
      const data = await res.json();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/quizzes/results');
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Result fetch error');
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchResults();
  }, []);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subjectId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [quizzes, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const res = await fetch(`/api/quizzes?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchQuizzes();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <p className="text-slate-500 font-medium">Synchronizing Academic Checkpoints...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="glass-card flex-1 flex items-center px-4 py-1.5 w-full bg-white/50 border-white/20">
          <Search className="text-slate-400 mr-3" size={18} />
          <input
            className="w-full bg-transparent border-none outline-none text-slate-700 font-medium placeholder-slate-400"
            placeholder="Search quizzes by title or subject..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {isElevated && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all whitespace-nowrap"
          >
            <Sparkles size={20} />
            Create AI Quiz
          </motion.button>
        )}
      </div>

      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredQuizzes.map((q, idx) => {
               const studentResult = results.find(r => r.quizId?._id === q._id);
               return (
                <motion.div
                  layout
                  key={q._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card group relative p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all border-white/20 overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                      <Brain className="text-indigo-600" size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                       {studentResult && (
                         <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100">
                            <Trophy size={12} />
                            <span className="text-[10px] font-black">{studentResult.score}/{studentResult.totalQuestions}</span>
                         </div>
                       )}
                       {isElevated && (
                         <button onClick={() => handleDelete(q._id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                           <Trash2 size={16} />
                         </button>
                       )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 line-clamp-1">{q.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{q.subjectId?.name || 'Subject'}</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Sem {q.semester}</span>
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Module {q.moduleName}</span>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</span>
                       <span className="text-sm font-bold text-slate-700">30 Skill Checks</span>
                    </div>
                    <button
                      onClick={() => setActiveQuiz(q)}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <Play size={18} />
                      Play Quiz
                    </button>
                  </div>
                </motion.div>
               );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <Brain size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No checkpoints found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Check back later for module-wise engagement quizzes.</p>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <QuizCreationModal 
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              fetchQuizzes();
              setShowCreateModal(false);
            }}
          />
        )}
        {activeQuiz && (
          <QuizPlayer 
            quiz={activeQuiz}
            onClose={() => {
              setActiveQuiz(null);
              fetchResults();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
