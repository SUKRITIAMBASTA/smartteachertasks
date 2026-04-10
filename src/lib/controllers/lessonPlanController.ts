import dbConnect from '@/lib/db';
import LessonPlan from '@/models/LessonPlan';

export async function createLessonPlan(data: {
  subject: string;
  topic: string;
  duration: string;
  semester?: number;
  subjectId?: any;
  objectives: string[];
  activities: { time: string; description: string }[];
  assessment: string;
  weeks?: any[];
  modules?: any[];
  months?: any[];
  weekSummary?: string;
  syllabusContext?: string;
  createdBy: string;
}) {
  await dbConnect();
  const lessonPlan = await LessonPlan.create(data);
  return lessonPlan.toObject();
}

export async function getLessonPlans(userId: string, role: string) {
  await dbConnect();
  if (role === 'admin') {
    return LessonPlan.find()
      .populate('createdBy', 'name email')
      .populate('subjectId', 'name code semester')
      .sort({ createdAt: -1 })
      .lean();
  }
  return LessonPlan.find({ createdBy: userId })
    .populate('createdBy', 'name email')
    .populate('subjectId', 'name code semester')
    .sort({ createdAt: -1 })
    .lean();
}

export async function updateLessonPlan(id: string, data: any) {
  await dbConnect();
  return LessonPlan.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteLessonPlan(id: string) {
  await dbConnect();
  return LessonPlan.findByIdAndDelete(id).lean();
}
