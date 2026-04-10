'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface ResourceFilterProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterCategory: string;
  onFilterChange: (val: string) => void;
}

export default function ResourceFilter({ 
  searchQuery, 
  onSearchChange, 
  filterCategory, 
  onFilterChange 
}: ResourceFilterProps) {
  return (
    <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center shadow-md">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="Search resources by title..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
          <Filter size={16} className="text-slate-400" />
          <select
            className="bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer"
            value={filterCategory}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Lecture Notes">Lecture Notes</option>
            <option value="Syllabus">Syllabus</option>
            <option value="Reference Material">Reference Material</option>
            <option value="Class Timetable">Class Timetable</option>
            <option value="Exam Schedule - Mid Sem">Mid-Sem Exams</option>
            <option value="Exam Schedule - End Sem">End-Sem Exams</option>
          </select>
        </div>
      </div>
    </div>
  );
}
