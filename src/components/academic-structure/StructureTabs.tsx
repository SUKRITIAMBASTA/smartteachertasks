'use client';

import React from 'react';
import { LayoutGrid, BookOpen, Calendar } from 'lucide-react';

interface StructureTabsProps {
  activeTab: 'classes' | 'subjects' | 'sessions';
  onTabChange: (tab: 'classes' | 'subjects' | 'sessions') => void;
}

export default function StructureTabs({ activeTab, onTabChange }: StructureTabsProps) {
  const tabs = [
    { id: 'classes', label: 'Classes & Departments', icon: LayoutGrid },
    { id: 'subjects', label: 'Subjects & Assignments', icon: BookOpen },
    { id: 'sessions', label: 'Academic Sessions', icon: Calendar },
  ];

  return (
    <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
              isActive 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon size={14} />
            {tab.label.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
