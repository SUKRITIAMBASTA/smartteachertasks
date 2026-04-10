'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import LessonPlanCard from './LessonPlanCard';

interface LessonPlanListProps {
  plans: any[];
  onDelete: (id: string) => void;
}

export default function LessonPlanList({ plans, onDelete }: LessonPlanListProps) {
  if (plans.length === 0) {
    return (
      <div className="glass-card p-20 text-center space-y-4">
         <div className="inline-flex p-4 bg-slate-50 rounded-3xl text-slate-300">
           <BookOpen size={48} />
         </div>
         <h3 className="text-xl font-bold text-slate-800">No Institutional Plans</h3>
         <p className="text-slate-500 max-w-xs mx-auto text-sm">
           Generate a subject outline to populate your faculty archives.
         </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map(plan => (
        <LessonPlanCard 
          key={plan._id} 
          plan={plan} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}
