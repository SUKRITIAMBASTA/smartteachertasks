'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface UserFiltersProps {
  filters: {
    role: string;
    institution: string;
    departmentId: string;
    search: string;
  };
  onFiltersChange: (newFilters: any) => void;
  onClear: () => void;
}

export default function UserFilters({ filters, onFiltersChange, onClear }: UserFiltersProps) {
  return (
    <div className="glass-card p-4 flex flex-wrap items-center gap-4 shadow-sm border-2 border-indigo-50/50">
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold"
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        />
      </div>

      <select 
        className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-black text-slate-600 appearance-none min-w-[120px] text-center"
        value={filters.role}
        onChange={(e) => onFiltersChange({ ...filters, role: e.target.value })}
      >
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="faculty">FacultyStaff</option>
        <option value="student">StudentBody</option>
      </select>

      <select 
        className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-black text-slate-600 appearance-none min-w-[140px] text-center"
        value={filters.institution}
        onChange={(e) => onFiltersChange({ ...filters, institution: e.target.value })}
      >
        <option value="">All Universities</option>
        <option value="ASET">ASET Engineering</option>
        <option value="ALS">ALS Law Faculty</option>
        <option value="ABS">ABS Business</option>
        <option value="ACCF">ACCF Commerce</option>
        <option value="AIIT">AIIT InformationTech</option>
      </select>

      <button 
        onClick={onClear}
        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
        title="Clear Directory Filters"
      >
        <X size={20} />
      </button>
    </div>
  );
}
