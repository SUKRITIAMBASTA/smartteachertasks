'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Trash2, Clock, ChevronDown, ChevronUp,
  Brain, CheckCircle2, Loader2, Target, AlignLeft, ClipboardCheck,
  Calendar, Layers, Zap, Edit3
} from 'lucide-react';

import EditPlanModal from './EditPlanModal';

interface LessonPlanCardProps {
  plan: any;
  onDelete: (id: string) => void;
  onUpdate?: (updatedPlan: any) => void;
}

export default function LessonPlanCard({ plan, onDelete, onUpdate }: LessonPlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewType, setViewType] = useState<'day' | 'week' | 'month' | 'module'>('module');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [pubError, setPubError] = useState('');

  const weeks = plan.weeks || [];
  const currentWeek = weeks.find((w: any) => w.weekNo === selectedWeek) || weeks[0];
  const months = plan.months || [];

  const handlePublishQuiz = async () => {
    if (!plan.subjectId?._id && !plan.subjectId) {
      setPubError('No subject linked — regenerate this plan.');
      return;
    }
    setPublishing(true);
    setPubError('');
    try {
      const subjectId = plan.subjectId?._id || plan.subjectId;
      const res = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, numQuestions: 10, difficulty: 'balanced' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Quiz generation failed');
      }
      setPublished(true);
    } catch (err: any) {
      setPubError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const subjectName = plan.subjectId?.name || plan.subject || 'N/A';
  const semesterNo  = plan.subjectId?.semester || plan.semester || '—';
  const subjectCode = plan.subjectId?.code || '';

  return (
    <motion.div
      layout
      className="glass-card p-6 flex flex-col hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
    >
      {/* Top row */}
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
          <BookOpen size={22} />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"
            title="Refine Curriculum"
          >
            <Edit3 size={16} />
          </button>
          <button onClick={() => onDelete(plan._id)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Subject title */}
      <h4 className="font-black text-slate-800 text-sm leading-tight mb-1 line-clamp-2">{subjectName}</h4>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {semesterNo && (
          <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
            Sem {semesterNo}
          </span>
        )}
        {subjectCode && (
          <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            {subjectCode}
          </span>
        )}
        <span className="text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock size={9} /> {plan.duration}
        </span>
      </div>

      {/* Intro Summary */}
      <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 italic leading-relaxed">
        {plan.weekSummary || `Institutional curriculum roadmap for ${subjectName}.`}
      </p>

      {/* Assessment preview */}
      <p className="text-[10px] text-slate-400 line-clamp-1 mb-4 border-l-2 border-indigo-100 pl-3">
        📝 {plan.assessment?.substring(0, 80)}...
      </p>

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 py-2.5 bg-slate-50 text-slate-700 text-[10px] font-black rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
        >
          {isExpanded ? 'COLLAPSE' : 'EXPLORE SYLLABUS'}
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        <button
          onClick={handlePublishQuiz}
          disabled={publishing || published}
          className={`flex-1 py-2.5 border-2 text-[10px] font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${
            published
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
              : 'bg-white border-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600'
          } disabled:opacity-60`}
        >
          {publishing ? <Loader2 size={13} className="animate-spin" /> : published ? <CheckCircle2 size={13} /> : <Brain size={13} />}
          {publishing ? 'Generating...' : published ? 'Quiz Ready' : 'Sync Quiz'}
        </button>
      </div>

      {pubError && (
        <p className="mt-2 text-[10px] font-bold text-rose-500 text-center">{pubError}</p>
      )}

      {/* 🚀 Navigation / Filters (Only when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-100 flex flex-col gap-6">
              
              {/* Filter Toggle: Day | Week | Month | Module */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit self-center sm:self-start">
                <button
                  onClick={() => setViewType('day')}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${viewType === 'day' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Zap size={12} /> Day
                </button>
                <button
                  onClick={() => setViewType('week')}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${viewType === 'week' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Calendar size={12} /> Week
                </button>
                <button
                  onClick={() => setViewType('month')}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${viewType === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Layers size={12} /> Month
                </button>
                <button
                  onClick={() => setViewType('module')}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${viewType === 'module' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  <BookOpen size={12} /> Module
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex flex-col sm:flex-row gap-6 min-h-[350px]">
                
                {/* SIDEBAR: Week Selector (Scrollable) */}
                {(viewType === 'week' || viewType === 'day') && (
                  <div className="w-full sm:w-16 flex flex-row sm:flex-col gap-2 max-h-[450px] overflow-x-auto sm:overflow-y-auto pb-2 sm:pb-0 pr-0 sm:pr-2 custom-scrollbar shrink-0">
                    {weeks.map((w: any) => (
                      <button
                        key={w.weekNo}
                        onClick={() => setSelectedWeek(w.weekNo)}
                        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center text-[10px] font-black rounded-xl border-2 transition-all ${
                          selectedWeek === w.weekNo 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' 
                            : 'border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        W{w.weekNo}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1 space-y-6">
                  
                  {/* 0. MODULE VIEW (Unit Grouping) */}
                  {viewType === 'module' && (
                    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {(plan.modules || []).map((m: any) => (
                        <div key={m.moduleNo} className="space-y-3">
                          <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
                            <div>
                              <h5 className="font-black text-[10px] uppercase tracking-widest text-indigo-400 mb-1">Module {m.moduleNo}</h5>
                              <h6 className="font-black text-sm">{m.title}</h6>
                            </div>
                            <span className="text-[9px] font-black bg-indigo-500 px-3 py-1 rounded-full">{m.duration}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">{m.summary}</p>
                          
                          {/* Weeks in this module */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {weeks.filter((w: any) => w.moduleNo === m.moduleNo).map((w: any) => (
                              <button
                                key={w.weekNo}
                                onClick={() => { setSelectedWeek(w.weekNo); setViewType('week'); }}
                                className="p-3 bg-white border border-slate-200 rounded-xl text-left hover:border-indigo-400 transition-all group"
                              >
                                <span className="block text-[8px] font-black text-slate-400 group-hover:text-indigo-400 uppercase">Week {w.weekNo}</span>
                                <span className="block text-[10px] font-bold text-slate-700 truncate">{w.topic}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 1. MONTH VIEW (Phases) */}
                  {viewType === 'month' && (
                    <div className="grid gap-4">
                      {months.length > 0 ? months.map((m: any) => (
                        <div key={m.monthNo} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 group hover:border-indigo-300 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-black text-indigo-600 text-[10px] uppercase tracking-widest flex items-center gap-2">
                              <span className="w-5 h-5 bg-indigo-600 text-white rounded flex items-center justify-center text-[9px]">M{m.monthNo}</span>
                              {m.title}
                            </h5>
                            <span className="text-[9px] font-bold text-slate-400 uppercase bg-white px-2 py-0.5 rounded-full border border-slate-100">{m.weekRange}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{m.summary}</p>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                          <Layers size={32} className="mb-2 opacity-20" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">No Monthly Phases Available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. WEEK VIEW (Summary & Objectives) */}
                  {viewType === 'week' && currentWeek && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                        <h5 className="font-black text-slate-800 text-sm mb-1.5 flex items-center gap-2">
                          <span className="text-indigo-500">Week {currentWeek.weekNo}:</span> 
                          {currentWeek.topic}
                        </h5>
                        <p className="text-[11px] text-slate-500 italic mb-6 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                          {currentWeek.summary}
                        </p>
                        
                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Target size={12} className="text-indigo-400" /> Key Learning Objectives
                          </label>
                          <div className="grid gap-2">
                            {currentWeek.objectives?.map((obj: string, idx: number) => (
                              <div key={idx} className="flex gap-3 items-start text-[11px] text-slate-600">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0" />
                                <span className="font-medium">{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. DAY VIEW (Detailed Activities) */}
                  {viewType === 'day' && currentWeek && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h5 className="font-black text-slate-800 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlignLeft size={12} className="text-indigo-500" /> Detailed Lessons: Week {currentWeek.weekNo}
                      </h5>
                      <div className="grid gap-3">
                        {currentWeek.days?.map((d: any, idx: number) => {
                          const isString = typeof d === 'string';
                          const dayTitle = isString ? d.split(':')[0]?.trim() : d.title;
                          const dayDesc = isString ? d.split(':').slice(1).join(':')?.trim() : d.description;
                          const dayNo = isString ? idx + 1 : (d.dayNo || idx + 1);
                          
                          return (
                            <div key={idx} className="group flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-500/5 transition-all">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white flex flex-col items-center justify-center shrink-0 transition-all">
                                <span className="text-[8px] font-black uppercase leading-none mb-0.5">DAY</span>
                                <span className="text-xs font-black leading-none">{dayNo}</span>
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                                  {dayTitle || `Lesson ${dayNo}`}
                                </p>
                                <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">
                                  {dayDesc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Assessment Section at Bottom */}
              <div className="p-5 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200">
                <h6 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ClipboardCheck size={14} /> Full Semester Assessment Roadmap
                </h6>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic opacity-90">
                  {plan.assessment}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <EditPlanModal 
        plan={plan}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={(updated) => onUpdate && onUpdate(updated)}
      />
    </motion.div>
  );
}
