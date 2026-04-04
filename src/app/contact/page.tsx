'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageCircle, Link as Linkedin, ArrowLeft, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct the mailto URL
    const email = 'sukritiambasta@gmail.com';
    const encodedSubject = encodeURIComponent(`SmartTeach Inquiry: ${form.subject}`);
    const encodedBody = encodeURIComponent(`Name: ${form.name}\n\nMessage:\n${form.message}`);

    // Trigger the client email app
    window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col relative overflow-hidden">

      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Navbar Minimal */}
      <header className="relative z-50 px-6 py-6 w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <GraduationCap className="text-indigo-600" size={28} />
          <span className="text-xl font-black tracking-tight text-slate-900">SmartTeach.</span>
        </Link>
        <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Get in Touch</h1>
            <p className="text-slate-500 text-sm">Have questions about the platform? Send us a message directly!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Message</label>
              <textarea
                required
                rows={4}
                placeholder="Write your message here..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm resize-none"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <Mail size={18} /> Send via Email
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-slate-200 flex-grow" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or connect via</span>
            <div className="h-px bg-slate-200 flex-grow" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://www.linkedin.com/in/sukriti-ambasta-222826230/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 hover:border-blue-200 transition-colors"
            >
              <Linkedin size={18} /> LinkedIn Profile
            </a>

            <a
              href="https://wa.me/918986411839?text=Hello%20SmartTeach%20Team,%20I%20have%20a%20query!"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 hover:border-emerald-200 transition-colors"
            >
              <MessageCircle size={18} /> WhatsApp Us
            </a>
          </div>

        </motion.div>
      </main>

    </div>
  );
}
