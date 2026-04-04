'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Sparkles, Plus, Trash2,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/Skeleton';

interface StudentGrade {
  id: string;
  studentName: string;
  studentId: string;
  scores: { [key: string]: number };
  totalScore: number;
  feedback: string;
  isGenerating?: boolean;
}

export default function GradingInterface() {
  const { id } = useParams();
  const router = useRouter();

  const [rubric, setRubric] = useState<any>(null);
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const rubricRes = await fetch(`/api/grading/rubrics?id=${id}`);
      const rubricData = await rubricRes.json();
      setRubric(rubricData);

      setStudents([
        generateEmptyStudent(rubricData),
        generateEmptyStudent(rubricData)
      ]);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  const generateEmptyStudent = (rubricData: any): StudentGrade => ({
    id: Math.random().toString(36).slice(2),
    studentName: '',
    studentId: '',
    scores: rubricData?.criteria?.reduce((acc: any, c: any) => {
      acc[c.name] = 0;
      return acc;
    }, {}) || {},
    totalScore: 0,
    feedback: '',
  });

  const addStudent = () => {
    setStudents(prev => [...prev, generateEmptyStudent(rubric)]);
  };

  const removeStudent = (index: number) => {
    if (students.length <= 1) return;
    setStudents(prev => prev.filter((_, i) => i !== index));
  };

  const updateStudent = (index: number, field: string, value: any) => {
    setStudents(prev => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };

  const updateScore = (studentIndex: number, criterionName: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const max = rubric?.criteria?.find((c: any) => c.name === criterionName)?.maxMarks || 0;
    const finalValue = Math.min(Math.max(0, numValue), max);

    setStudents(prev => {
      const updated = [...prev];
      updated[studentIndex].scores[criterionName] = finalValue;

      updated[studentIndex].totalScore = Object.values(updated[studentIndex].scores)
        .reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0);

      return updated;
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);

    const validStudents = students.filter(s => s.studentName.trim());

    if (validStudents.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one student.' });
      setSaving(false);
      return;
    }

    try {
      await fetch('/api/grading/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rubricId: id, gradesData: validStudents }),
      });

      setMessage({ type: 'success', text: 'Saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !rubric) {
    return (
      <div className="glass-card p-6 text-center animate-pulse">
        Loading grading interface...
      </div>
    );
  }

  const maxTotalPoints =
    rubric?.criteria?.reduce((sum: number, c: any) => sum + (c.maxMarks || 0), 0) || 0;

  return (
    <div className="space-y-8 pb-12">

      {/* Header */}
      <div className="flex justify-between items-center">
        <Link href="/grading" className="text-slate-500 hover:text-slate-700 flex gap-2">
          <ArrowLeft size={18} /> Back
        </Link>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`alert-${message.type} text-center`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="glass-card overflow-auto">
        <table className="w-full">

          <thead>
            <tr>
              <th>Name</th>
              {rubric.criteria.map((c: any) => (
                <th key={c.name}>{c.name}</th>
              ))}
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {students.map((s, i) => (
              <tr key={s.id}>

                <td>
                  <input
                    className="form-input"
                    value={s.studentName}
                    onChange={(e) => updateStudent(i, 'studentName', e.target.value)}
                  />
                </td>

                {rubric.criteria.map((c: any) => (
                  <td key={c.name}>
                    <input
                      type="number"
                      min={0}
                      max={c.maxMarks}
                      className="form-input w-20"
                      value={s.scores[c.name]}
                      onChange={(e) => updateScore(i, c.name, e.target.value)}
                    />
                  </td>
                ))}

                <td>{s.totalScore} / {maxTotalPoints}</td>

                <td>
                  <button onClick={() => removeStudent(i)}>
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Add Student */}
      <button onClick={addStudent} className="btn btn-secondary">
        <Plus size={16} /> Add Student
      </button>

    </div>
  );
}