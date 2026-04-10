'use client';

import React from 'react';
import { 
  CheckCircle, PlayCircle, Clock, Trash2 
} from 'lucide-react';

interface TicketRowProps {
  t: any;
  role: string | undefined;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export default function TicketRow({ t, role, onStatusChange, onDelete }: TicketRowProps) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{t.title}</span>
          <span className="text-xs text-slate-400 line-clamp-1 max-w-xs">{t.description}</span>
          <span className="inline-block w-fit mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
            {t.category}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
          t.priority === 'urgent' ? 'text-rose-600 bg-rose-50 border-rose-100' :
          t.priority === 'high' ? 'text-amber-600 bg-amber-50 border-amber-100' :
          'text-slate-600 bg-slate-50 border-slate-100'
        }`}>
          {t.priority}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border flex items-center justify-center gap-1.5 w-fit mx-auto ${
          t.status === 'resolved' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
          t.status === 'in_progress' ? 'text-blue-600 bg-blue-50 border-blue-100' :
          'text-indigo-600 bg-indigo-50 border-indigo-100'
        }`}>
          {t.status === 'resolved' && <CheckCircle size={10} />}
          {t.status === 'in_progress' && <Clock size={10} />}
          {t.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{t.createdBy?.name || 'System'}</span>
          <span className="text-[10px] text-slate-400 font-medium">{new Date(t.createdAt).toLocaleDateString()}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2 transition-opacity">
          {role === 'admin' ? (
            <>
              <button 
                onClick={() => onStatusChange(t._id, 'in_progress')}
                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Set In Progress"
              >
                <PlayCircle size={18} />
              </button>
              <button 
                onClick={() => onStatusChange(t._id, 'resolved')}
                className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                title="Mark as Done"
              >
                <CheckCircle size={18} />
              </button>
              <button 
                onClick={() => onDelete(t._id)}
                className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                title="Purge Ticket"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-300 italic font-medium">Awaiting Review</span>
          )}
        </div>
      </td>
    </tr>
  );
}
