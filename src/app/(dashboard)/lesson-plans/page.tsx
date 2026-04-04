'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  Sparkles, Loader2, BookOpen,
  Clock, Target, ListChecks,
  Trash2, ChevronDown, ChevronUp
} from 'lucide-react';

export default function LessonPlansPage() {
  const { data: session } = useSession();

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    topic: '',
    duration: '60 mins'
  });
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [error, setError] = useState('');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/lesson-plans');
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchPlans();
  }, [session]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.subject || !form.topic) {
      setError('Please fill all fields');
      return;
    }

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
      setError(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    await fetch(`/api/lesson-plans?id=${id}`, { method: 'DELETE' });
    setPlans(plans.filter(p => p._id !== id));
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse text-center">
        Loading lesson plans...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">

      {/* ERROR */}
      {error && (
        <div className="alert-error text-center">{error}</div>
      )}

      {/* GENERATOR */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-500" />
          AI Lesson Generator
        </h2>

        <form onSubmit={handleGenerate} className="grid md:grid-cols-4 gap-4">

          <input
            className="form-input"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />

          <input
            className="form-input"
            placeholder="Topic"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
          />

          <select
            className="form-select"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          >
            <option>30 mins</option>
            <option>60 mins</option>
            <option>90 mins</option>
          </select>

          <button className="btn btn-primary">
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </form>
      </div>

      {/* CURRENT PLAN */}
      {currentPlan && (
        <div className="glass-card p-6 space-y-4 border border-indigo-200">

          <h3 className="font-bold text-lg">
            {currentPlan.topic}
          </h3>

          {/* Objectives */}
          <div>
            <h4 className="font-semibold flex gap-2 items-center">
              <Target size={16} /> Objectives
            </h4>
            <ul className="list-disc pl-5 text-sm text-slate-600">
              {(currentPlan.objectives || []).map((o: string, i: number) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>

          {/* Activities */}
          <div>
            <h4 className="font-semibold flex gap-2 items-center">
              <Clock size={16} /> Activities
            </h4>
            {(currentPlan.activities || []).map((a: any, i: number) => (
              <div key={i} className="text-sm">
                <strong>{a.time}</strong> - {a.description}
              </div>
            ))}
          </div>

          {/* Assessment */}
          <div>
            <h4 className="font-semibold flex gap-2 items-center">
              <ListChecks size={16} /> Assessment
            </h4>
            <p className="text-sm text-slate-600">
              {currentPlan.assessment}
            </p>
          </div>

        </div>
      )}

      {/* HISTORY */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg">Saved Plans</h2>

        {plans.map(plan => (
          <div key={plan._id} className="glass-card p-4">

            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{plan.topic}</h4>
                <p className="text-xs text-slate-500">
                  {plan.subject} • {plan.duration}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="btn btn-sm"
                  onClick={() =>
                    setExpandedPlanId(
                      expandedPlanId === plan._id ? null : plan._id
                    )
                  }
                >
                  {expandedPlanId === plan._id ? <ChevronUp /> : <ChevronDown />}
                </button>

                <button
                  onClick={() => handleDelete(plan._id)}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {expandedPlanId === plan._id && (
              <div className="mt-3 text-sm text-slate-600">
                {plan.assessment}
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}