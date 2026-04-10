'use client';

import React from 'react';
import { Ticket as TicketIcon } from 'lucide-react';
import TicketRow from './TicketRow';

interface TicketTableProps {
  tickets: any[];
  role: string | undefined;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function TicketTable({ tickets, role, onStatusChange, onDelete }: TicketTableProps) {
  return (
    <div className="glass-card overflow-hidden shadow-xl shadow-slate-100/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Inquiry Details</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Priority</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Identity</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {tickets.map((t) => (
              <TicketRow 
                key={t._id} 
                t={t} 
                role={role} 
                onStatusChange={onStatusChange} 
                onDelete={onDelete} 
              />
            ))}
          </tbody>
        </table>
      </div>

      {tickets.length === 0 && (
        <div className="p-20 text-center space-y-4">
           <div className="inline-flex p-4 bg-slate-50 rounded-3xl text-slate-300">
             <TicketIcon size={48} />
           </div>
           <h3 className="text-xl font-bold text-slate-800">Inbox Clear</h3>
           <p className="text-slate-500 max-w-xs mx-auto text-sm">
             No pending support requests detected in the system.
           </p>
        </div>
      )}
    </div>
  );
}
