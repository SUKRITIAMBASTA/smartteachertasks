'use client';

import React from 'react';
import { Users as UsersIcon } from 'lucide-react';
import UserRow from './UserRow';

interface UserTableProps {
  users: any[];
  loading: boolean;
  onEdit: (user: any) => void;
  onDelete: (id: string) => void;
  onDirectUpload: (user: any, file: File) => void;
}

export default function UserTable({ users, loading, onEdit, onDelete, onDirectUpload }: UserTableProps) {
  return (
    <div className="glass-card overflow-hidden shadow-xl shadow-slate-100/50 border-2 border-indigo-50/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Identity</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Role Type</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Institutional Unit</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Verification</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right pr-10">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <UserRow 
                key={u._id} 
                u={u} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onDirectUpload={onDirectUpload}
              />
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !loading && (
        <div className="p-20 text-center space-y-4">
           <div className="inline-flex p-4 bg-slate-50 rounded-3xl text-slate-300">
             <UsersIcon size={48} />
           </div>
           <h3 className="text-xl font-bold text-slate-800">Directory Empty</h3>
           <p className="text-slate-500 max-w-xs mx-auto text-sm">
             No users found matching your current institutional criteria.
           </p>
        </div>
      )}
    </div>
  );
}
