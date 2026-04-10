'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// These must match exactly what seed.cjs writes to DB
export const SLOTS = [
  '8:30 am-9:15 am',
  '9:20 am-10:05 am',
  '10:10 am-10:55 am',
  '11:00 am-11:45 am',
  '11:50 am-12:35 pm',
  '1:00 pm-1:45 pm',
  '1:50 pm-2:35 pm',
  '2:40 pm-3:25 pm',
  '3:30 pm-4:15 pm',
  '4:20 pm-5:05 pm',
];

// Normalise for DB comparison
function normaliseSlot(s: string) {
  return s.replace(/\s/g, '').toLowerCase();
}

interface ScheduleGridProps {
  routineGrid: any;
}

export default function ScheduleGrid({ routineGrid }: ScheduleGridProps) {
  return (
    <div className="bg-white border-[3px] border-slate-900 rounded-sm shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[1100px]">
          {/* Header */}
          <div className="text-center font-black border-b-[3px] border-slate-900">
            <div className="bg-[#58CCFF] py-2 text-xl tracking-[0.25em] uppercase text-slate-900 border-b-[3px] border-slate-900">
              AMITY UNIVERSITY PATNA
            </div>
            <div className="bg-[#FFCC33] py-1.5 text-xs tracking-widest uppercase text-slate-900">
              APPROVED ACADEMIC SESSION 2026-27
            </div>
          </div>

          <div className="grid grid-cols-[80px_repeat(5,1fr)_40px_repeat(5,1fr)] bg-white">
            <div className="border-r-[3px] border-b-[3px] border-slate-900 bg-slate-50 p-2 font-black text-[10px] text-center uppercase flex items-center justify-center">
              Day/Time
            </div>

            {SLOTS.map((slot, i) => (
              <React.Fragment key={i}>
                {i === 5 && (
                  <div className="bg-slate-900 row-span-7 border-b-[3px] border-r-[3px] border-slate-900 flex items-center justify-center z-10">
                    <span className="rotate-[-90deg] font-black text-[9px] tracking-[0.4em] text-white uppercase opacity-40">
                      BREAK
                    </span>
                  </div>
                )}
                <div className="border-r-[3px] border-b-[3px] border-slate-900 bg-slate-50 p-2 text-center flex items-center justify-center">
                  <span className="font-black text-[8px] tracking-tight uppercase leading-none">{slot}</span>
                </div>
              </React.Fragment>
            ))}

            {DAYS.map(day => (
              <React.Fragment key={day}>
                <div className="border-r-[3px] border-b-[3px] border-slate-900 bg-slate-50 p-2 font-black text-[9px] flex items-center justify-center uppercase">
                  {day}
                </div>
                {SLOTS.map((slot, idx) => {
                  // Try exact match first, fall back to normalised match
                  let item = routineGrid[day]?.[slot];
                  if (!item) {
                    const normSlot = normaliseSlot(slot);
                    const matchKey = Object.keys(routineGrid[day] || {}).find(
                      k => normaliseSlot(k) === normSlot
                    );
                    item = matchKey ? routineGrid[day][matchKey] : null;
                  }
                  return (
                    <div
                      key={idx}
                      className={`border-r-[3px] border-b-[3px] border-slate-900 min-h-[80px] p-1.5 flex flex-col items-center justify-center text-center transition-all ${
                        item?.isLab ? 'bg-[#FFFFCC]' : 'hover:bg-slate-50'
                      }`}
                    >
                      {item ? (
                        <div className="space-y-0.5 w-full">
                          <div className="text-[8px] font-black leading-tight text-slate-800 px-1 uppercase tracking-tighter line-clamp-2">
                            {item.subjectId?.name || '—'}
                          </div>
                          <div className="text-[7px] font-bold text-slate-400 italic truncate">
                            {item.facultyId?.name || ''}
                          </div>
                          <div className="flex items-center justify-center gap-0.5 mt-0.5">
                            <MapPin size={7} className="text-blue-500" />
                            <span className="text-[7px] font-black text-blue-600 uppercase">
                              Rm {item.roomId?.roomNo || '—'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
