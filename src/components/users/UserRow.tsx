'use client';

import React from 'react';
import { Mail, Building2, Pencil, Trash2, CheckCircle, FileWarning, Upload } from 'lucide-react';

interface UserRowProps {
  u: any;
  onEdit: (user: any) => void;
  onDelete: (id: string) => void;
  onDirectUpload: (user: any, file: File) => void;
}

export default function UserRow({ u, onEdit, onDelete, onDirectUpload }: UserRowProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-sm">{u.name}</span>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Mail size={12} className="text-slate-300" /> {u.email}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
          u.role === 'admin' ? 'text-rose-600 bg-rose-50 border-rose-100' :
          u.role === 'faculty' ? 'text-blue-600 bg-blue-50 border-blue-100' :
          'text-emerald-600 bg-emerald-50 border-emerald-100'
        }`}>
          {u.role}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-0.5 items-center">
           <div className="flex items-center gap-2 text-slate-800 text-sm font-black tracking-tight">
             <Building2 size={14} className="text-indigo-400" />
             {u.institution || 'ASET'}
           </div>
           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
             {u.departmentId?.branch || u.departmentId?.name || 'GENERIC UNIT'}
           </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col items-center">
          {u.isVerified ? (
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100" title="Identity Verified">
               <CheckCircle size={12} />
               <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
            </div>
          ) : u.idDocumentUrl ? (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100" title="Awaiting Administrator Review">
               <FileWarning size={12} />
               <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onDirectUpload(u, file);
                }}
                accept="image/*,.pdf" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all group/v" 
                title="Upload ID Document"
              >
                 <Upload size={12} className="group-hover/v:scale-110 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Missing ID</span>
              </button>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-6">
          <button 
            onClick={() => onEdit(u)}
            className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Edit User Profile"
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={() => onDelete(u._id)}
            className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            title="Revoke Access"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
