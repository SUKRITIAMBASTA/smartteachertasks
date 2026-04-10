'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Upload, FileCheck, BookOpen, Clock, ChevronDown, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface LessonPlanGeneratorProps {
  onPlanGenerated: (newPlan: any) => void;
  onError: (msg: string) => void;
  role?: string;
}

export default function LessonPlanGenerator({ onPlanGenerated, onError, role }: LessonPlanGeneratorProps) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [duration, setDuration] = useState('45 mins per day (Mon–Fri)');
  const [syllabusContext, setSyllabusContext] = useState('');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Syllabus status tracking
  const [syllabusStatus, setSyllabusStatus] = useState<'loading' | 'found' | 'not_found'>('loading');
  const [syllabusModules, setSyllabusModules] = useState<any[]>([]);

  // Fetch faculty's assigned subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/faculty/teaching?type=subjects');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSubjects(data);
            setSelectedSubjectId(data[0]._id);
            setLoadingSubjects(false);
            return;
          }
        }
        if (role === 'admin') {
          const res2 = await fetch('/api/academic-structure/subjects');
          if (res2.ok) {
            const data2 = await res2.json();
            if (Array.isArray(data2)) {
              setSubjects(data2);
              if (data2.length > 0) setSelectedSubjectId(data2[0]._id);
            }
          }
        }
      } catch {
        // silent
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [role]);

  // Check syllabus availability when subject changes
  useEffect(() => {
    if (!selectedSubjectId) return;
    setSyllabusStatus('loading');
    setSyllabusModules([]);

    const checkSyllabus = async () => {
      try {
        const res = await fetch('/api/syllabus');
        if (res.ok) {
          const data = await res.json();
          const match = (Array.isArray(data) ? data : []).find(
            (s: any) => s.subjectId?._id === selectedSubjectId || s.subjectId === selectedSubjectId
          );
          if (match) {
            setSyllabusStatus('found');
            setSyllabusModules(match.modules || []);
          } else {
            setSyllabusStatus('not_found');
          }
        } else {
          setSyllabusStatus('not_found');
        }
      } catch {
        setSyllabusStatus('not_found');
      }
    };
    checkSyllabus();
  }, [selectedSubjectId]);

  const handleSyllabusUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSyllabusContext('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/faculty/syllabus', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setSyllabusContext(data.text || '');
      setUploadedFileName(file.name);
      toast.success('Syllabus PDF parsed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Syllabus upload failed.');
      onError(err.message || 'Syllabus upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return onError('Please select a subject.');

    setGenerating(true);
    onError('');

    try {
      const res = await fetch('/api/lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: selectedSubjectId, duration, syllabusContext }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed.');

      toast.success('15-week course plan generated from syllabus!');
      onPlanGenerated(data);
    } catch (err: any) {
      toast.error(err.message || 'AI generation failed.');
      onError(err.message || 'AI generation failed. Check API key.');
    } finally {
      setGenerating(false);
    }
  };

  const selectedSubject = subjects.find(s => s._id === selectedSubjectId);

  return (
    <div className="glass-card p-8 border-2 border-indigo-50 shadow-indigo-100/20">
      <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
        <Sparkles size={22} className="text-indigo-500 animate-pulse" />
        AI Course Plan Generator
      </h2>
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-7">
        Select a subject → AI generates a complete 15-week course plan using its syllabus
      </p>

      <form onSubmit={handleGenerate} className="space-y-6">

        {/* Subject Selector */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
              <BookOpen size={11} /> Subject
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-400 transition-all font-bold text-sm appearance-none pr-10"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                disabled={loadingSubjects || generating}
                required
              >
                {loadingSubjects ? (
                  <option>Loading subjects...</option>
                ) : subjects.length === 0 ? (
                  <option value="">No subjects assigned</option>
                ) : (
                  subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
              <Clock size={11} /> Weekly Duration
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-400 transition-all font-bold text-sm appearance-none pr-10"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={generating}
              >
                <option>45 mins per day (Mon–Fri)</option>
                <option>60 mins per day (Mon–Fri)</option>
                <option>90 mins per day (Mon–Fri)</option>
                <option>2 classes/week × 90 mins</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Syllabus Status Indicator */}
        {selectedSubjectId && (
          <div className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all ${
            syllabusStatus === 'found' 
              ? 'bg-emerald-50/50 border-emerald-100' 
              : syllabusStatus === 'not_found' 
              ? 'bg-amber-50/50 border-amber-100' 
              : 'bg-slate-50 border-slate-100'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                syllabusStatus === 'found' 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : syllabusStatus === 'not_found' 
                  ? 'bg-amber-100 text-amber-600' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {syllabusStatus === 'loading' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : syllabusStatus === 'found' ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider">
                  {syllabusStatus === 'loading' && <span className="text-slate-500">Checking syllabus database...</span>}
                  {syllabusStatus === 'found' && <span className="text-emerald-700">✅ Structured Syllabus Found</span>}
                  {syllabusStatus === 'not_found' && <span className="text-amber-700">⚠ No Syllabus — will use basic context</span>}
                </p>
                {syllabusStatus === 'found' && syllabusModules.length > 0 && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                    {syllabusModules.length} modules detected — AI will map weeks to syllabus units
                  </p>
                )}
                {syllabusStatus === 'not_found' && (
                  <p className="text-[10px] text-amber-500 font-bold mt-0.5">
                    Generate a syllabus first for richer course plans
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/syllabus"
              className="flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 transition-all flex-shrink-0"
            >
              <ExternalLink size={12} />
              {syllabusStatus === 'found' ? 'View Syllabus' : 'Create Syllabus'}
            </Link>
          </div>
        )}

        {/* Syllabus Modules Preview (when found) */}
        {syllabusStatus === 'found' && syllabusModules.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {syllabusModules.slice(0, 8).map((mod: any, i: number) => (
              <div key={i} className="px-3 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Unit {mod.unitNo}</span>
                <p className="text-[10px] font-bold text-slate-700 truncate mt-0.5">{mod.title}</p>
                <p className="text-[9px] text-slate-400 font-bold">{mod.hours}h · {mod.topics?.length || 0} topics</p>
              </div>
            ))}
          </div>
        )}

        {/* Syllabus Upload */}
        <div className="p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl transition-all ${
              syllabusContext ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-white text-slate-400 border border-slate-200'
            }`}>
              {uploading ? <Loader2 className="animate-spin" size={20} /> : syllabusContext ? <CheckCircle2 size={20} /> : <Upload size={20} />}
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                Syllabus PDF Upload <span className="text-slate-400 font-medium normal-case">(optional override)</span>
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                {uploadedFileName || 'Override detected syllabus with a custom PDF'}
              </p>
            </div>
          </div>
          <label className="flex-shrink-0 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:border-indigo-500 transition-all">
            {syllabusContext ? 'Replace PDF' : 'Upload PDF'}
            <input type="file" className="hidden" accept=".pdf" onChange={handleSyllabusUpload} disabled={generating || uploading} />
          </label>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={generating || loadingSubjects || !selectedSubjectId}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-wide text-[11px]"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {generating ? 'AI Synthesizing Course Plan from Syllabus...' : 'Generate Full Semester Course Plan'}
        </button>
      </form>
    </div>
  );
}
