'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import {
  Plus, X, FolderOpen, Trash2, FileText,
  FileSpreadsheet, FileImage, Download, Search,
  Filter, CloudUpload, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const fileIcons: Record<string, any> = {
  document: FileText,
  spreadsheet: FileSpreadsheet,
  image: FileImage,
  pdf: FileText,
};

export default function ResourcesPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    course: '',
    fileType: 'pdf',
    tags: '',
    file: null as File | null
  });

  // ✅ Fetch
  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchResources();
  }, [session]);

  // ✅ Courses filter
  const courses = useMemo(() => {
    const list = new Set(resources.map(r => r.course).filter(Boolean));
    return ['All', ...Array.from(list)];
  }, [resources]);

  // ✅ Safe filter
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const title = r.title?.toLowerCase() || '';
      const desc = r.description?.toLowerCase() || '';

      const matchesSearch =
        title.includes(searchQuery.toLowerCase()) ||
        desc.includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterCourse === 'All' || r.course === filterCourse;

      return matchesSearch && matchesFilter;
    });
  }, [resources, searchQuery, filterCourse]);

  // ✅ Upload (FIXED)
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.file) {
      setError('Please select a file');
      return;
    }

    if (form.file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', form.file);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('course', form.course);
      formData.append('fileType', form.fileType);
      formData.append('tags', form.tags);

      const res = await fetch('/api/resources', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error();

      setShowModal(false);
      setForm({
        title: '',
        description: '',
        course: '',
        fileType: 'pdf',
        tags: '',
        file: null
      });

      fetchResources();
    } catch {
      setError('Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    await fetch(`/api/resources?id=${id}`, { method: 'DELETE' });
    fetchResources();
  };

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse text-center">
        Loading resources...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">

      {/* Error */}
      {error && (
        <div className="alert-error text-center">{error}</div>
      )}

      {/* Header */}
      <div className="flex justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FolderOpen size={20} /> Resources
        </h1>

        {['admin', 'faculty'].includes(role) && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} /> Upload
          </button>
        )}
      </div>

      {/* Search */}
      <div className="glass-card p-4 flex gap-3">
        <input
          className="form-input flex-1"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="form-select"
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
        >
          {courses.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredResources.map(r => {
          const Icon = fileIcons[r.fileType] || FileText;

          return (
            <div key={r._id} className="glass-card p-4 space-y-2">
              <Icon />

              <h3 className="font-bold">{r.title}</h3>
              <p className="text-sm text-slate-500">{r.description}</p>

              <div className="flex justify-between text-xs">
                <span>{r.course}</span>
                <a href={r.url} target="_blank">
                  <Download size={14} />
                </a>
              </div>

              {role === 'admin' && (
                <button
                  onClick={() => handleDelete(r._id)}
                  className="text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Upload Resource</h2>

            <form onSubmit={handleUpload} className="space-y-4">

              <input
                type="file"
                onChange={(e) =>
                  setForm({ ...form, file: e.target.files?.[0] || null })
                }
                required
              />

              <input
                className="form-input"
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <input
                className="form-input"
                placeholder="Course"
                value={form.course}
                onChange={(e) =>
                  setForm({ ...form, course: e.target.value })
                }
              />

              <button className="btn btn-primary">
                {submitting ? 'Uploading...' : 'Upload'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}