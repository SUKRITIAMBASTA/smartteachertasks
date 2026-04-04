import dbConnect from '@/lib/db';
import LessonPlan from '@/models/LessonPlan';

export async function createLessonPlan(data: {
  subject: string;
  topic: string;
  duration: string;
  objectives: string[];
  activities: { time: string; description: string }[];
  assessment: string;
  createdBy: string;
}) {
  await dbConnect();
  const lessonPlan = await LessonPlan.create(data);
  return lessonPlan.toObject();
}

export async function getLessonPlans(userId: string, role: string) {
  await dbConnect();
  if (role === 'admin') {
    return LessonPlan.find().populate('createdBy', 'name email').sort({ createdAt: -1 }).lean();
  }
  return LessonPlan.find({ createdBy: userId }).populate('createdBy', 'name email').sort({ createdAt: -1 }).lean();
}

export async function deleteLessonPlan(id: string) {
  await dbConnect();
  return LessonPlan.findByIdAndDelete(id).lean();
}
