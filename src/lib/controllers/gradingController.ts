import dbConnect from '@/lib/db';
import Rubric, { IRubricDoc } from '@/models/Rubric';
import Grade, { IGradeDoc } from '@/models/Grade';
import mongoose from 'mongoose';

export async function createRubric(data: any) {
  await dbConnect();
  return await Rubric.create(data);
}

export async function getRubrics(teacherId: string, role: string) {
  await dbConnect();
  if (role === 'admin') {
    return await Rubric.find().sort({ createdAt: -1 });
  }
  return await Rubric.find({ createdBy: teacherId }).sort({ createdAt: -1 });
}

export async function getRubricById(id: string) {
  await dbConnect();
  return await Rubric.findById(id);
}

export async function saveGrades(rubricId: string, gradedBy: string, gradesData: any[]) {
  await dbConnect();
  const results = [];
  
  for (const grade of gradesData) {
    const filter = {
      rubricId: new mongoose.Types.ObjectId(rubricId),
      studentName: grade.studentName,
      gradedBy: new mongoose.Types.ObjectId(gradedBy)
    };
    
    const update = {
      ...grade,
      rubricId: new mongoose.Types.ObjectId(rubricId),
      gradedBy: new mongoose.Types.ObjectId(gradedBy)
    };
    
    // Bulk-like operation using findOneAndUpdate for each
    const result = await Grade.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
      runValidators: true
    });
    results.push(result);
  }
  
  return results;
}

export async function getGradesByRubric(rubricId: string, teacherId: string) {
  await dbConnect();
  return await Grade.find({ 
    rubricId: new mongoose.Types.ObjectId(rubricId),
    gradedBy: new mongoose.Types.ObjectId(teacherId)
  });
}
