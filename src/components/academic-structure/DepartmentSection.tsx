'use client';

import React from 'react';
import { Plus, Edit2, Trash2, LayoutGrid } from 'lucide-react';
import { toast } from 'react-toastify';

interface DepartmentSectionProps {
  departments: any[];
}

export default function DepartmentSection({ departments }: DepartmentSectionProps) {
  return (
    <div className="glass-card p-6 border-2 border-indigo-50/50 shadow-xl shadow-indigo-100/10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
           <LayoutGrid className="text-indigo-600" size={24} />
           Institutional Departments
        </h2>
        <button 
           className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all uppercase tracking-widest"
           onClick={() => toast.info('Administrative Action: Module under design')}
        >
           <Plus size={16} /> Add Department
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 uppercase tracking-widest text-[10px] font-black text-slate-400">
              <th className="px-6 py-4">Department Name</th>
              <th className="px-6 py-4">Branch Code</th>
              <th className="px-6 py-4">Current Shift</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {departments.map((d, i) => (
              <tr key={i} className="hover:bg-slate-50/50 group transition-all">
                 <td className="px-6 py-4 text-sm font-black text-slate-800 uppercase tracking-tight">{d.name}</td>
                 <td className="px-6 py-4 text-xs text-slate-500 font-bold">
                    <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">{d.branch}</span>
                 </td>
                 <td className="px-6 py-4 text-xs font-black uppercase text-indigo-500">{d.shift}</td>
                 <td className="px-6 py-4 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"><Edit2 size={14}/></button>
                   <button className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"><Trash2 size={14}/></button>
                 </td>
              </tr>
            ))}
            {departments.length === 0 && (
               <tr>
                  <td colSpan={4} className="p-12 text-center text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">
                     No departments configured in the registry.
                  </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
