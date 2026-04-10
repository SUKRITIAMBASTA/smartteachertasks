'use client';

import React from 'react';
import { Building } from 'lucide-react';

export default function StructureHeader() {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
        <Building className="text-indigo-600" size={32} />
        Academic Structure
      </h1>
      <p className="text-sm text-slate-500 mt-1 font-medium">
        Manage classes, assign teachers to subjects, and configure academic sessions across the institution.
      </p>
    </div>
  );
}
