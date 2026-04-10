'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle2, AlertTriangle, ChevronRight, Trophy, RotateCcw, Brain, Save, Loader2 } from 'lucide-react';

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Quiz {
  _id: string;
  title: string;
  moduleName: string;
  levels: {
    easy: Question[];
    medium: Question[];
    hard: Question[];
  };
}

export default function QuizPlayer({ quiz, onClose }: { quiz: Quiz; onClose: () => void }) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentQuestions = difficulty ? quiz.levels[difficulty] : [];

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(idx);
    const correct = idx === currentQuestions[currentIdx].correctIndex;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    
    setAnswers([...answers, idx]);

    setTimeout(() => {
      if (currentIdx < currentQuestions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
        saveResult(score + (correct ? 1 : 0));
      }
    }, 1500);
  };

  const saveResult = async (finalScore: number) => {
    setSaving(true);
    try {
      await fetch('/api/quizzes/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz._id,
          score: finalScore,
          totalQuestions: currentQuestions.length,
          difficultyLevel: difficulty
        })
      });
    } catch (err) {
      console.error('Failed to save score');
    } finally {
      setSaving(false);
    }
  };

  if (!difficulty) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="glass-card w-full max-w-md p-8 relative z-20 text-center border border-white/20"
        >
          <div className="p-4 bg-indigo-500/10 rounded-full w-fit mx-auto mb-6">
            <Brain className="text-indigo-400" size={40} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">{quiz.title}</h2>
          <p className="text-white/40 text-sm mb-8">{quiz.moduleName} - Skill Evaluation</p>
          
          <div className="space-y-3">
             {(['easy', 'medium', 'hard'] as const).map(lvl => (
               <button
                 key={lvl}
                 onClick={() => setDifficulty(lvl)}
                 className={`w-full py-4 px-6 rounded-2xl flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98] transition-all border ${lvl === 'easy' ? 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' : lvl === 'medium' ? 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20' : 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20'}`}
               >
                 <div className="flex flex-col items-start">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${lvl === 'easy' ? 'text-emerald-400' : lvl === 'medium' ? 'text-amber-400' : 'text-rose-400'}`}>{lvl} Level</span>
                    <span className="text-white font-bold">10 Skill Checks</span>
                 </div>
                 <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
               </button>
             ))}
          </div>
          <button onClick={onClose} className="mt-8 text-white/30 hover:text-white transition-colors text-sm font-bold">Maybe Later</button>
        </motion.div>
      </div>
    );
  }

  if (showResult) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass-card w-full max-w-sm p-10 relative z-20 text-center border border-white/20"
          >
            <div className="p-5 bg-yellow-500/20 rounded-full w-fit mx-auto mb-6 shadow-xl shadow-yellow-500/20 border border-yellow-500/30">
              <Trophy className="text-yellow-400" size={56} />
            </div>
            <h2 className="text-3xl font-black text-white mb-1">Session Complete!</h2>
            <p className="text-white/40 mb-8 lowercase tracking-tighter">Performance results archived</p>
            
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 mb-8">
               <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Final Score</div>
               <div className="text-6xl font-black text-white">{score}/{currentQuestions.length}</div>
            </div>

            <div className="flex flex-col gap-3">
               <button 
                 onClick={onClose}
                 className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
               >
                 {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                 {saving ? 'Saving Records...' : 'Finish & Exit'}
               </button>
               <button 
                 onClick={() => {
                    setCurrentIdx(0); setScore(0); setShowResult(false); setDifficulty(null);
                 }}
                 className="w-full py-4 bg-white/5 text-white/60 hover:text-white rounded-2xl font-bold transition-all border border-white/5"
               >
                 Re-attempt different level
               </button>
            </div>
          </motion.div>
        </div>
    );
  }

  const currentQ = currentQuestions[currentIdx];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div 
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="glass-card w-full max-w-2xl p-8 relative z-20 border border-white/20 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 h-1 bg-white/10 w-full">
           <motion.div 
             className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
             initial={{ width: 0 }}
             animate={{ width: `${((currentIdx + 1) / currentQuestions.length) * 100}%` }}
           />
        </div>

        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                {difficulty} Level
              </span>
              <span className="text-white/20 select-none">/</span>
              <span className="text-xs font-bold text-white/60">Module Point {currentIdx + 1} of {currentQuestions.length}</span>
           </div>
           <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
              <X size={20} />
           </button>
        </div>

        <div className="mb-10 min-h-[100px]">
           <motion.h3 
             key={currentIdx}
             initial={{ x: 20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="text-2xl font-bold text-white leading-tight"
           >
             {currentQ.text}
           </motion.h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {currentQ.options.map((opt, i) => {
             const isSelected = selectedOption === i;
             const isCorrectAns = i === currentQ.correctIndex;
             const showFeedback = selectedOption !== null;

             let style = "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 group-hover:border-white/20";
             if (showFeedback) {
               if (isCorrectAns) style = "bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-emerald-400";
               else if (isSelected) style = "bg-rose-500/20 border-rose-500 text-rose-400";
               else style = "bg-white/5 border-white/5 text-white/20 opacity-50";
             }

             return (
               <motion.button
                 key={i}
                 whileHover={!showFeedback ? { scale: 1.02 } : {}}
                 whileTap={!showFeedback ? { scale: 0.98 } : {}}
                 onClick={() => handleOptionSelect(i)}
                 disabled={showFeedback}
                 className={`p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between group ${style}`}
               >
                  <span className="font-medium">{opt}</span>
                  {showFeedback && isCorrectAns && <CheckCircle2 size={20} />}
                  {showFeedback && isSelected && !isCorrectAns && <AlertTriangle size={20} />}
               </motion.button>
             );
           })}
        </div>

        <AnimatePresence>
           {selectedOption !== null && currentQ.explanation && (
             <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl"
             >
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                   <Sparkles size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Professor's Context</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{currentQ.explanation}</p>
             </motion.div>
           )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
