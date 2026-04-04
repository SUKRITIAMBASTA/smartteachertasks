'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Ticket, BrainCircuit, Library, Users, Mail, GraduationCap } from 'lucide-react';

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">

      {/* --- BACKGROUND GLOW --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* --- NAVBAR --- */}
      <header className="relative z-50 px-6 lg:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-indigo-600" size={32} />
          <span className="text-xl font-black tracking-tight text-slate-900">SmartTeach.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/register" className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-full transition-all shadow-md shadow-slate-900/20 active:scale-95">
            Get Started
          </Link>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 px-6 pt-20 pb-32 lg:pt-32 lg:pb-40 max-w-5xl mx-auto text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest relative overflow-hidden group">
            <span className="absolute inset-0 bg-indigo-100 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
            <span className="relative z-10 flex items-center gap-1.5"><BrainCircuit size={14} /> AI-Powered Platform</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1] mb-6">
            Smart Support System <br className="hidden md:block" /> for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Teachers</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Automate academic workflows, manage student tickets seamlessly, and gain real-time performance insights all from one modern interface.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-1 active:scale-95 text-lg">
              Get Started <ArrowRight size={20} />
            </Link>
            <Link href="/login" className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl shadow-sm border border-slate-200 transition-all text-lg">
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section className="relative z-10 px-6 py-24 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          {/* Hackathon Meta Banner */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mb-20">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Domain</span>
              <span className="text-sm font-bold text-slate-800">Web Development</span>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Problem Statement</span>
              <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">PS1003</span>
            </div>
            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Team Name</span>
              <span className="text-sm font-bold text-slate-800">Dev Dynasty</span>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-4">Streamline Your Classroom</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">SmartTeach is an intelligent academic assistant built to relieve educators from administrative overhead so they can focus on teaching.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Ticket, color: 'text-rose-500', bg: 'bg-rose-50', title: 'Ticket Management', desc: 'Resolve student queries systematically with prioritized task queues and real-time status tracking.' },
              { icon: BrainCircuit, color: 'text-indigo-500', bg: 'bg-indigo-50', title: 'Performance Intelligence', desc: 'Identify at-risk students instantly through automated attendance and GPA telemetry analysis.' },
              { icon: Library, color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Resource Hub', desc: 'Centralized cloud storage for organizing lesson plans, assignments, and academic materials.' },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.bg} ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={26} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TEAM SECTION --- */}
      <section className="relative z-10 px-6 py-24 lg:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-4">Meet The Team</h2>
            <p className="text-slate-500 font-medium">6th Semester B.Tech CSE, Amity University Patna</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { name: 'Kulsum', role: 'Frontend & UI', color: 'from-pink-500 to-rose-400' },
              { name: 'Lavanya', role: 'Backend Logic', color: 'from-violet-500 to-purple-400' },
              { name: 'Sukriti', role: 'Database & API', color: 'from-cyan-500 to-blue-400' },
              { name: 'Ritik', role: 'Full Stack Dev', color: 'from-emerald-500 to-teal-400' }
            ].map((member, i) => (
              <div key={i} className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full mb-5 flex items-center justify-center text-2xl lg:text-3xl font-black text-white bg-gradient-to-br ${member.color} shadow-lg`}>
                  {member.name.charAt(0)}
                </div>
                <h4 className="text-lg font-bold text-slate-800">{member.name}</h4>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 text-center">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER / CONTACT --- */}
      <footer className="relative z-10 bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white">
            <GraduationCap size={24} />
            <span className="font-bold tracking-tight">SmartTeach.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
              <Mail size={16} /> Contact Team
            </Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-slate-800 text-xs text-center md:text-left flex flex-col md:flex-row justify-between gap-4">
          <p>© 2026 Dev Dynasty. Created for Hackathon PS1003.</p>
          <div className="flex items-center justify-center gap-4 text-slate-500">
            <span>Amity University Patna</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
