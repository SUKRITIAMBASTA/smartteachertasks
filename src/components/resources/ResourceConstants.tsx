import { 
  FileText, FileCode, FileSpreadsheet, FileImage, 
  FileArchive, File, BookOpen, ScrollText, 
  Wallet, Calendar, ClipboardList, FolderOpen 
} from 'lucide-react';

export const FILE_ICONS: Record<string, any> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileCode,
  csv: FileSpreadsheet,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  webp: FileImage,
  gif: FileImage,
  svg: FileImage,
  zip: FileArchive,
  rar: FileArchive,
  default: File,
};

export const CATEGORY_LABELS: Record<string, { color: string; icon: any }> = {
  'Lecture Notes': { color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: BookOpen },
  'Syllabus': { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: ScrollText },
  'Reference Material': { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: FileText },
  'Fee Notice': { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Wallet },
  'Holiday Broadcast': { color: 'text-rose-600 bg-rose-50 border-rose-100', icon: Calendar },
  'Academic Exam Schedule': { color: 'text-purple-600 bg-purple-50 border-purple-100', icon: ClipboardList },
  'Class Timetable': { color: 'text-cyan-600 bg-cyan-50 border-cyan-100', icon: Calendar },
  'Exam Schedule - Mid Sem': { color: 'text-orange-600 bg-orange-50 border-orange-100', icon: ClipboardList },
  'Exam Schedule - End Sem': { color: 'text-red-600 bg-red-50 border-red-100', icon: ClipboardList },
  'Other': { color: 'text-slate-600 bg-slate-50 border-slate-100', icon: FolderOpen },
};

export const ACCEPTED_FORMATS = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp,.gif,.svg,.zip,.rar,.ppt,.pptx';
