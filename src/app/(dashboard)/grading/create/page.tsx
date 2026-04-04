'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateRubric() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState([{ name: '', maxMarks: 10 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addCriterion = () => {
    setCriteria([...criteria, { name: '', maxMarks: 10 }]);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length === 1) return;
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const updateCriterion = (index: number, field: string, value: any) => {
    const updated = [...criteria];

    if (field === 'maxMarks') {
      updated[index].maxMarks = Math.max(1, Number(value) || 1); // ✅ FIX
    } else {
      (updated[index] as any)[field] = value;
    }

    setCriteria(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (criteria.some(c => !c.name.trim())) {
      setError('All criteria must have a name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/grading/rubrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, criteria }),
      });

      if (!res.ok) throw new Error('Failed to create rubric');

      const data = await res.json();

      // ✅ success feedback
      router.push(`/grading/${data._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const total = criteria.reduce((sum, c) => sum + c.maxMarks, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div className="flex justify-between items-center">
        <Link href="/grading" className="text-slate-500 hover:text-slate-700 flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-slate-800">Create Rubric</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="glass-card p-6 space-y-4">

          <input
            className="form-input"
            placeholder="Rubric Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="form-input"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

        </div>

        {/* Criteria */}
        <div className="glass-card p-6 space-y-4">

          <div className="flex justify-between">
            <h2 className="font-semibold">Criteria</h2>

            <button type="button" onClick={addCriterion} className="btn btn-primary btn-sm">
              <Plus size={14} /> Add
            </button>
          </div>

          {criteria.map((c, i) => (
            <div key={i} className="flex gap-3 items-center">

              <input
                className="form-input flex-1"
                placeholder="Criterion"
                value={c.name}
                onChange={(e) => updateCriterion(i, 'name', e.target.value)}
              />

              <input
                type="number"
                min={1}
                className="form-input w-24 text-center"
                value={c.maxMarks}
                onChange={(e) => updateCriterion(i, 'maxMarks', e.target.value)}
              />

              <button onClick={() => removeCriterion(i)} type="button">
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          ))}

          <div className="text-sm text-slate-500">
            Total Marks: <span className="font-bold">{total}</span>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="alert-error text-center">{error}</div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button className="btn btn-primary px-6 py-3" disabled={loading}>
            {loading ? 'Saving...' : 'Create Rubric'}
          </button>
        </div>

      </form>
    </div>
  );
}