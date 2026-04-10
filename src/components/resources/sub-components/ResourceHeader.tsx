'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, CloudUpload } from 'lucide-react';

interface ResourceHeaderProps {
  isElevated: boolean;
  onUploadClick: () => void;
}

export default function ResourceHeader({ isElevated, onUploadClick }: ResourceHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <FolderOpen className="text-indigo-600" size={32} />
          University Resource Hub
        </h1>
        <p className="text-slate-500 text-sm mt-1">Official materials, checkpoints, and quizzes synced for your semester.</p>
      </div>

      {isElevated && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUploadClick}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <CloudUpload size={20} />
          Upload Materials
        </motion.button>
      )}
    </div>
  );
}
