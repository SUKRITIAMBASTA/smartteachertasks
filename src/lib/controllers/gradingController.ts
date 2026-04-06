import dbConnect from '@/lib/db';
import Grade from '@/models/Grade';
import User from '@/models/User';
import Subject from '@/models/Subject';
import Rubric from '@/models/Rubric';
import mongoose from 'mongoose';

/**
 * 📝 Legacy Rubric Support
 */
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

/**
 * 🎓 Fetch students that a faculty member is specifically teaching.
 * Logic: Find all subjects assigned to this faculty, then find all students in those same departments/semesters.
 */
export async function getStudentsForFaculty(facultyId: string) {
  await dbConnect();

  // 1. Find subjects assigned to the faculty
  const subjects = await Subject.find({ assignedFaculty: new mongoose.Types.ObjectId(facultyId) }).lean();
  
  if (!subjects.length) return [];

  // 2. Extract departments and semesters the faculty is teaching in
  const departments = [...new Set(subjects.map(s => s.departmentId.toString()))];
  const semesters = [...new Set(subjects.map(s => s.semester))];

  // 3. Find students matching these criteria
  // We need to resolve department names to IDs if necessary, or vice versa.
  // Assuming User.department is a string name for now based on previous model check.
  const students = await User.find({
    role: 'student',
    semester: { $in: semesters }
    // department filtering could be added here if Department model is linked to User.department string
  }).select('name email department semester').sort({ name: 1 }).lean();

  return students;
}

/**
 * 📝 Submit or update marks for a student in a specific subject.
 */
export async function submitMarks(data: any) {
  await dbConnect();
  
  const { studentId, subjectId, gradedBy, ...marks } = data;

  const filter = {
    student: new mongoose.Types.ObjectId(studentId),
    subject: new mongoose.Types.ObjectId(subjectId),
  };

  const update = {
    ...marks,
    gradedBy: new mongoose.Types.ObjectId(gradedBy),
  };

  // findOneAndUpdate with upsert:true to handle create or update
  // Pre-save hook in Grade.ts will handle totalMarks and Grade calculation
  const result = await Grade.findOneAndUpdate(filter, update, {
    upsert: true,
    new: true,
    runValidators: true
  });

  return result;
}

/**
 * 📊 Get all grades for a specific subject (Admin/Faculty use)
 */
export async function getGradesForSubject(subjectId: string) {
  await dbConnect();
  return Grade.find({ subject: new mongoose.Types.ObjectId(subjectId) })
    .populate('student', 'name email department semester')
    .sort({ totalMarks: -1 })
    .lean();
}

/**
 * 🧒 Get grades for a specific student (Student use)
 */
export async function getStudentGrades(studentId: string) {
  await dbConnect();
  return Grade.find({ student: new mongoose.Types.ObjectId(studentId) })
    .populate('subject', 'name code')
    .sort({ createdAt: -1 })
    .lean();
}

/**
 * 📋 Get subjects assigned to a faculty
 */
export async function getFacultySubjects(facultyId: string) {
  await dbConnect();
  return Subject.find({ assignedFaculty: new mongoose.Types.ObjectId(facultyId) }).lean();
}
