'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UserPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  count: number;
  onPageChange: (page: number) => void;
}

export default function UserPagination({ page, totalPages, total, count, onPageChange }: UserPaginationProps) {
  return (
    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
      <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">
        Showing <span className="font-black text-indigo-600">{count}</span> of <span className="font-black text-indigo-600">{total}</span> Active Identities
      </p>
      
      <div className="flex items-center gap-2">
        <button 
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all hover:shadow-md"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                page === i + 1 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-500'
              }`}
            >
              {i + 1}
            </button>
          )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
        </div>
        
        <button 
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all hover:shadow-md"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
