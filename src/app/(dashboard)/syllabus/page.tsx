'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Sparkles, Loader2, ChevronDown, Trash2, Edit3,
  CheckCircle2, AlertCircle, Plus, Save, FlipHorizontal2,
  Beaker, Users, GraduationCap, FileText, BookMarked, ListChecks, ClipboardList
} from 'lucide-react';
import { toast } from 'react-toastify';

/*──────────────────────────────────────────────────────────────
  Helpers
──────────────────────────────────────────────────────────────*/
function Badge({ children, color = 'indigo' }: { children: React.ReactNode; color?: string }) {
  const cls: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald:'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:  'bg-amber-50 text-amber-600 border-amber-100',
    slate:  'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${cls[color] || cls.slate}`}>
      {children}
    </span>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
        <Icon size={12} className="text-indigo-400" /> {title}
      </h3>
      {children}
    </div>
  );
}

/*──────────────────────────────────────────────────────────────
  Syllabus Viewer (read mode)
──────────────────────────────────────────────────────────────*/
function SyllabusViewer({ syllabus, onEdit, onDelete, onPublish, onGenerateCoursePlan, generatingPlan }: {
  syllabus: any; onEdit: () => void; onDelete: () => void; onPublish: () => void; onGenerateCoursePlan: () => void; generatingPlan: boolean;
}) {
  const sub = syllabus.subjectId;
  return (
    <div className="space-y-6">
      {/* Subject Header */}
      <div className="glass-card p-6 bg-gradient-to-br from-indigo-50 to-slate-50 border-2 border-indigo-100">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-800">{sub?.name || 'Unknown Subject'}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge color="indigo">Code: {sub?.code}</Badge>
              <Badge color="amber">Semester {syllabus.semester}</Badge>
              <Badge color={syllabus.approvalStatus === 'published' ? 'emerald' : 'slate'}>
                {syllabus.approvalStatus}
              </Badge>
              <Badge color="slate">{syllabus.creditHours} Credits</Badge>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={onGenerateCoursePlan}
              disabled={generatingPlan}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-100 disabled:opacity-50">
              {generatingPlan ? <Loader2 size={12} className="animate-spin" /> : <ClipboardList size={12} />}
              {generatingPlan ? 'Generating...' : 'Generate Course Plan'}
            </button>
            {syllabus.approvalStatus !== 'published' && (
              <button onClick={onPublish}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all">
                <CheckCircle2 size={12} /> Publish
              </button>
            )}
            <button onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all">
              <Edit3 size={12} /> Edit
            </button>
            <button onClick={onDelete}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-rose-100 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
        {syllabus.courseDescription && (
          <p className="mt-4 text-sm text-slate-600 leading-relaxed border-l-4 border-indigo-200 pl-4">
            {syllabus.courseDescription}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pedagogy */}
        {syllabus.pedagogy && (
          <div className="glass-card p-5">
            <Section icon={GraduationCap} title="Pedagogy for Course Delivery">
              <p className="text-sm text-slate-600 leading-relaxed">{syllabus.pedagogy}</p>
            </Section>
          </div>
        )}

        {/* PSDA */}
        {syllabus.psda?.length > 0 && (
          <div className="glass-card p-5">
            <Section icon={ListChecks} title="Professional Skill Development Activities (PSDA)">
              <ol className="space-y-1">
                {syllabus.psda.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="font-black text-indigo-400 flex-shrink-0">{toRoman(i + 1)}.</span>
                    {item}
                  </li>
                ))}
              </ol>
            </Section>
          </div>
        )}
      </div>

      {/* Course Modules */}
      {syllabus.modules?.length > 0 && (
        <div className="glass-card p-5">
          <Section icon={BookOpen} title="Course Modules">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {syllabus.modules.map((mod: any) => (
                <div key={mod.unitNo} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Unit {mod.unitNo}</span>
                    <span className="text-[9px] font-black text-slate-400">{mod.hours}h</span>
                  </div>
                  <p className="font-black text-slate-800 text-[11px] mb-2">{mod.title}</p>
                  <ul className="space-y-0.5">
                    {mod.topics?.map((t: string, i: number) => (
                      <li key={i} className="text-[10px] text-slate-500 flex items-start gap-1">
                        <span className="text-indigo-300 flex-shrink-0">•</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* Mandatory Experiments */}
      {syllabus.mandatoryExperiments?.length > 0 && (
        <div className="glass-card p-5">
          <Section icon={Beaker} title="Lab / Practical Details — Mandatory Experiments">
            <div className="space-y-3">
              {syllabus.mandatoryExperiments.map((exp: any) => (
                <div key={exp.no} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-[11px]">
                    {exp.no}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-[11px] mb-1">{exp.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* Optional Experiments */}
      {syllabus.optionalExperiments?.length > 0 && (
        <div className="glass-card p-5">
          <Section icon={Beaker} title="Lab / Practical Details — Optional / Additional Experiments">
            <div className="space-y-2">
              {syllabus.optionalExperiments.map((exp: any) => (
                <div key={exp.no} className="flex gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="flex-shrink-0 w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center font-black text-[10px]">
                    {exp.no}
                  </div>
                  <div>
                    <p className="font-black text-slate-700 text-[11px]">{exp.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* Textbooks + References */}
      {(syllabus.textbooks?.length > 0 || syllabus.references?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {syllabus.textbooks?.length > 0 && (
            <div className="glass-card p-5">
              <Section icon={BookMarked} title="Recommended Textbooks">
                <ol className="space-y-1.5">
                  {syllabus.textbooks.map((t: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="font-black text-indigo-400">{i + 1}.</span>{t}
                    </li>
                  ))}
                </ol>
              </Section>
            </div>
          )}
          {syllabus.references?.length > 0 && (
            <div className="glass-card p-5">
              <Section icon={FileText} title="Reference Books">
                <ol className="space-y-1.5">
                  {syllabus.references.map((r: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="font-black text-slate-400">{i + 1}.</span>{r}
                    </li>
                  ))}
                </ol>
              </Section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function toRoman(n: number) {
  const map = ['i','ii','iii','iv','v','vi','vii','viii','ix','x'];
  return map[n - 1] || n;
}

/*──────────────────────────────────────────────────────────────
  Main Page
──────────────────────────────────────────────────────────────*/
export default function SyllabusPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  const [subjects,          setSubjects]          = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [filterSem,         setFilterSem]         = useState<string>('');
  const [generating,        setGenerating]        = useState(false);
  const [loadingSyllabus,   setLoadingSyllabus]   = useState(false);
  const [syllabi,           setSyllabi]           = useState<any[]>([]);
  const [activeSyllabus,    setActiveSyllabus]    = useState<any>(null);
  const [editMode,          setEditMode]          = useState(false);
  const [editData,          setEditData]          = useState<any>(null);
  const [saving,            setSaving]            = useState(false);
  const [error,             setError]             = useState('');
  const [success,           setSuccess]           = useState('');
  const [generatingPlan,    setGeneratingPlan]    = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Load assigned subjects
  useEffect(() => {
    if (!session) return;
    const load = async () => {
      const endpoint = role === 'admin'
        ? '/api/academic-structure/subjects'
        : '/api/faculty/teaching?type=subjects';
      const res  = await fetch(endpoint);
      const data = await res.json();
      const arr  = Array.isArray(data) ? data : [];
      setSubjects(arr);
      if (arr.length) setSelectedSubjectId(arr[0]._id);
    };
    load();
  }, [session, role]);

  // Load syllabi list
  const loadSyllabi = async () => {
    setLoadingSyllabus(true);
    try {
      const res = await fetch('/api/syllabus');
      const d   = await res.json();
      setSyllabi(Array.isArray(d) ? d : []);
    } catch { /* silent */ }
    finally { setLoadingSyllabus(false); }
  };

  useEffect(() => { if (session) loadSyllabi(); }, [session]);

  // Unique semesters from subjects
  const semesters = useMemo(() => [...new Set(subjects.map(s => s.semester))].sort((a,b)=>a-b), [subjects]);

  // Filtered subject list
  const filteredSubjects = useMemo(() => {
    if (!filterSem) return subjects;
    return subjects.filter(s => String(s.semester) === filterSem);
  }, [subjects, filterSem]);

  const handleGenerate = async () => {
    if (!selectedSubjectId) return setError('Select a subject first.');
    setGenerating(true);
    setError('');
    try {
      const res  = await fetch('/api/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: selectedSubjectId, generateWithAI: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      await loadSyllabi();
      setActiveSyllabus(data);
      setEditMode(false);
      setSuccess('Syllabus generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this syllabus?')) return;
    await fetch(`/api/syllabus?id=${id}`, { method: 'DELETE' });
    setSyllabi(s => s.filter(x => x._id !== id));
    if (activeSyllabus?._id === id) setActiveSyllabus(null);
  };

  const handlePublish = async (id: string) => {
    await fetch(`/api/syllabus?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus: 'published' }),
    });
    await loadSyllabi();
    setActiveSyllabus((prev: any) => prev ? { ...prev, approvalStatus: 'published' } : prev);
  };

  const startEdit = (syl: any) => {
    setEditData(JSON.parse(JSON.stringify(syl)));
    setEditMode(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/syllabus?id=${editData._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadSyllabi();
      setActiveSyllabus(data);
      setEditMode(false);
      setSuccess('Syllabus saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedSubject = subjects.find(s => s._id === selectedSubjectId);

  // Generate Course Plan from active syllabus
  const handleGenerateCoursePlan = async () => {
    if (!activeSyllabus?.subjectId?._id) {
      toast.warning('No subject linked to this syllabus.');
      return;
    }
    setGeneratingPlan(true);
    try {
      const res = await fetch('/api/lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: activeSyllabus.subjectId._id,
          duration: '45 mins per day (Mon–Fri)',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      toast.success('15-week course plan generated from this syllabus!');
    } catch (e: any) {
      toast.error(e.message || 'Course plan generation failed.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (status === 'loading') return null;

  return (
    <div className="space-y-6 pb-12 px-4 md:px-0">

      {/* Page Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <BookOpen size={24} className="text-indigo-500" /> Syllabus Manager
          </h1>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            AI-generated · Subject-wise · Semester-wise · Used by Lesson Plan Generator
          </p>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-sm font-bold flex items-center gap-2">
            <AlertCircle size={16} />{error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />{success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT: Subject selector + generate + archive list */}
        <div className="space-y-4">
          {/* Generator */}
          <div className="glass-card p-5 border-2 border-indigo-50">
            <h2 className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles size={13} className="text-indigo-400" /> Generate Syllabus
            </h2>

            {/* Semester filter */}
            <div className="mb-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Filter by Semester</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterSem('')}
                  className={`px-3 py-1 rounded-lg font-black text-[10px] border transition-all ${!filterSem ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200'}`}
                >All</button>
                {semesters.map(s => (
                  <button key={s} onClick={() => setFilterSem(String(s))}
                    className={`px-3 py-1 rounded-lg font-black text-[10px] border transition-all ${filterSem === String(s) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200'}`}>
                    Sem {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject dropdown */}
            <div className="space-y-1 mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-indigo-400 appearance-none pr-10"
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                >
                  {filteredSubjects.length === 0
                    ? <option>No subjects found</option>
                    : filteredSubjects.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} — Sem {s.semester}
                        </option>
                      ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {selectedSubject && (
                <p className="text-[10px] text-indigo-500 font-bold mt-1">
                  Code: {selectedSubject.code} · Sem {selectedSubject.semester}
                </p>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !selectedSubjectId}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generating ? 'AI Generating Syllabus...' : 'Generate with AI'}
            </button>
          </div>

          {/* Archive list */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syllabus Archive ({syllabi.length})</p>
            {loadingSyllabus ? (
              <div className="glass-card p-6 text-center"><Loader2 size={20} className="animate-spin mx-auto text-indigo-300" /></div>
            ) : syllabi.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <BookOpen size={28} className="mx-auto text-slate-200 mb-2" />
                <p className="text-sm font-bold text-slate-400">No syllabi yet</p>
              </div>
            ) : (
              syllabi.map(s => {
                const sub = s.subjectId;
                return (
                  <div key={s._id}
                    onClick={() => { setActiveSyllabus(s); setEditMode(false); }}
                    className={`glass-card p-4 cursor-pointer border-2 transition-all hover:shadow-md ${activeSyllabus?._id === s._id ? 'border-indigo-300 bg-indigo-50/40' : 'border-transparent hover:border-slate-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-slate-800 truncate">{sub?.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Sem {s.semester}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${s.approvalStatus === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {s.approvalStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Viewer / Editor */}
        <div className="lg:col-span-2">
          {!activeSyllabus ? (
            <div className="glass-card p-16 text-center">
              <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="font-black text-slate-400 text-sm uppercase tracking-widest">Select or generate a syllabus</p>
              <p className="text-[11px] text-slate-300 mt-1">Generated syllabi are automatically used by the Lesson Plan Generator</p>
            </div>
          ) : editMode ? (
            <SyllabusEditor
              data={editData}
              onChange={setEditData}
              onSave={handleSave}
              onCancel={() => setEditMode(false)}
              saving={saving}
            />
          ) : (
            <SyllabusViewer
              syllabus={activeSyllabus}
              onEdit={() => startEdit(activeSyllabus)}
              onDelete={() => handleDelete(activeSyllabus._id)}
              onPublish={() => handlePublish(activeSyllabus._id)}
              onGenerateCoursePlan={handleGenerateCoursePlan}
              generatingPlan={generatingPlan}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/*──────────────────────────────────────────────────────────────
  Syllabus Editor
──────────────────────────────────────────────────────────────*/
function SyllabusEditor({ data, onChange, onSave, onCancel, saving }: {
  data: any; onChange: (d: any) => void; onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const set = (field: string, value: any) => onChange({ ...data, [field]: value });

  const updateListItem = (field: string, idx: number, value: string) => {
    const arr = [...(data[field] || [])];
    arr[idx] = value;
    set(field, arr);
  };

  const addListItem = (field: string) => set(field, [...(data[field] || []), '']);
  const removeListItem = (field: string, idx: number) => {
    const arr = [...(data[field] || [])];
    arr.splice(idx, 1);
    set(field, arr);
  };

  const updateExpField = (field: string, idx: number, key: string, value: any) => {
    const arr = [...(data[field] || [])];
    arr[idx] = { ...arr[idx], [key]: value };
    set(field, arr);
  };

  const addExp = (field: string) => {
    const arr = data[field] || [];
    set(field, [...arr, { no: arr.length + 1, title: '', description: '' }]);
  };

  const removeExp = (field: string, idx: number) => {
    const arr = [...(data[field] || [])];
    arr.splice(idx, 1);
    set(field, arr);
  };

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 flex items-center justify-between">
        <p className="font-black text-slate-700 text-sm flex items-center gap-2">
          <Edit3 size={16} className="text-indigo-500" /> Editing: {data.subjectId?.name}
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:border-slate-300 transition-all">
            Cancel
          </button>
          <button onClick={onSave} disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Save
          </button>
        </div>
      </div>

      {/* Course Description */}
      <div className="glass-card p-5 space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Description</label>
        <textarea rows={3} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-sm outline-none focus:border-indigo-400 resize-none"
          value={data.courseDescription || ''} onChange={e => set('courseDescription', e.target.value)} />
      </div>

      {/* Pedagogy */}
      <div className="glass-card p-5 space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedagogy</label>
        <textarea rows={4} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-sm outline-none focus:border-indigo-400 resize-none"
          value={data.pedagogy || ''} onChange={e => set('pedagogy', e.target.value)} />
      </div>

      {/* PSDA */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PSDA Activities</label>
          <button onClick={() => addListItem('psda')} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-black text-[10px] hover:bg-indigo-100 transition-all">
            <Plus size={11} /> Add
          </button>
        </div>
        {(data.psda || []).map((item: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input className="flex-1 px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-indigo-400"
              value={item} onChange={e => updateListItem('psda', i, e.target.value)} placeholder={`Activity ${toRoman(i+1)}`} />
            <button onClick={() => removeListItem('psda', i)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Mandatory Experiments */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mandatory Experiments</label>
          <button onClick={() => addExp('mandatoryExperiments')} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-black text-[10px] hover:bg-indigo-100 transition-all">
            <Plus size={11} /> Add
          </button>
        </div>
        {(data.mandatoryExperiments || []).map((exp: any, i: number) => (
          <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0">{exp.no}</span>
              <input className="flex-1 px-3 py-2 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-indigo-400"
                value={exp.title || ''} onChange={e => updateExpField('mandatoryExperiments', i, 'title', e.target.value)} placeholder="Experiment title" />
              <button onClick={() => removeExp('mandatoryExperiments', i)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-all">
                <Trash2 size={13} />
              </button>
            </div>
            <textarea rows={2} className="w-full px-3 py-2 bg-white border-2 border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 resize-none"
              value={exp.description || ''} onChange={e => updateExpField('mandatoryExperiments', i, 'description', e.target.value)} placeholder="Description of what students implement..." />
          </div>
        ))}
      </div>

      {/* Textbooks */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Textbooks</label>
          <button onClick={() => addListItem('textbooks')} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-black text-[10px] hover:bg-indigo-100 transition-all">
            <Plus size={11} /> Add
          </button>
        </div>
        {(data.textbooks || []).map((item: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input className="flex-1 px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-indigo-400"
              value={item} onChange={e => updateListItem('textbooks', i, e.target.value)} placeholder="Book Title by Author (Publisher, Year)" />
            <button onClick={() => removeListItem('textbooks', i)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
