'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Ticket as TicketIcon, Plus } from 'lucide-react';

interface TicketHeaderProps {
  role: string | undefined;
  onRaiseTicket: () => void;
}

export default function TicketHeader({ role, onRaiseTicket }: TicketHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <TicketIcon className="text-indigo-600" size={32} />
          Support Helpdesk
        </h1>
        <p className="text-slate-500 text-sm mt-1">Submit academic or technical queries to the administration hub.</p>
      </div>

      {role !== 'admin' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRaiseTicket}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700"
        >
          <Plus size={20} />
          Raise Ticket
        </motion.button>
      )}
    </div>
  );
}
