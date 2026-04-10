import dbConnect from '@/lib/db';
import Grade from '@/models/Grade';
import User from '@/models/User';
import Subject from '@/models/Subject';
import Rubric from '@/models/Rubric';
import mongoose from 'mongoose';

/* ── Rubric (legacy) ─────────────────────────────────────── */
export async function createRubric(data: any) {
  await dbConnect();
  return await Rubric.create(data);
}

export async function getRubrics(teacherId: string, role: string) {
  await dbConnect();
  if (role === 'admin') return await Rubric.find().sort({ createdAt: -1 });
  return await Rubric.find({ createdBy: teacherId }).sort({ createdAt: -1 });
}

export async function getRubricById(id: string) {
  await dbConnect();
  return await Rubric.findById(id);
}

/* ── Subjects assigned to a faculty member ───────────────── */
export async function getFacultySubjects(facultyId: string) {
  await dbConnect();
  return Subject.find({ assignedFaculty: new mongoose.Types.ObjectId(facultyId) })
    .sort({ semester: 1, name: 1 })
    .lean();
}

/* ── Students a faculty member teaches ───────────────────── */
export async function getStudentsForFaculty(facultyId: string) {
  await dbConnect();

  const subjects = await Subject.find({
    assignedFaculty: new mongoose.Types.ObjectId(facultyId),
  }).lean();

  if (!subjects.length) return [];

  const deptIds  = [...new Set(subjects.map((s) => s.departmentId.toString()))];
  const semesters = [...new Set(subjects.map((s) => s.semester))];

  const students = await User.find({
    role: 'student',
    semester: { $in: semesters },
    departmentId: { $in: deptIds.map((id) => new mongoose.Types.ObjectId(id)) },
  })
    .select('name email departmentId semester')
    .sort({ name: 1 })
    .lean();

  return students;
}

/* ── Submit / update marks (triggers pre-save hooks) ─────── */
export async function submitMarks(data: any) {
  await dbConnect();

  const { studentId, subjectId, gradedBy, ...marks } = data;

  // Use find + save so Mongoose pre-save hooks (totalMarks + grade calc) fire
  let gradeDoc = await Grade.findOne({
    student: new mongoose.Types.ObjectId(studentId),
    subject: new mongoose.Types.ObjectId(subjectId),
  });

  if (gradeDoc) {
    // Update fields
    Object.assign(gradeDoc, { ...marks, gradedBy: new mongoose.Types.ObjectId(gradedBy) });
  } else {
    gradeDoc = new Grade({
      student:    new mongoose.Types.ObjectId(studentId),
      subject:    new mongoose.Types.ObjectId(subjectId),
      gradedBy:   new mongoose.Types.ObjectId(gradedBy),
      ...marks,
    });
  }

  await gradeDoc.save(); // triggers pre-save → totalMarks + grade
  return gradeDoc.toObject();
}

/* ── All grades for a subject (faculty/admin) ────────────── */
export async function getGradesForSubject(subjectId: string) {
  await dbConnect();
  return Grade.find({ subject: new mongoose.Types.ObjectId(subjectId) })
    .populate('student', 'name email departmentId semester')
    .sort({ totalMarks: -1 })
    .lean();
}

/* ── All grades for a student (student self-view) ────────── */
export async function getStudentGrades(studentId: string) {
  await dbConnect();
  return Grade.find({ student: new mongoose.Types.ObjectId(studentId) })
    .populate('subject', 'name code semester')
    .sort({ createdAt: -1 })
    .lean();
}

/* ── Summary stats for a subject ─────────────────────────── */
export async function getSubjectGradeSummary(subjectId: string) {
  await dbConnect();
  const grades = await Grade.find({ subject: new mongoose.Types.ObjectId(subjectId) }).lean();
  if (!grades.length) return { count: 0, avg: 0, pass: 0, fail: 0, distribution: {} };

  const total = grades.reduce((s, g) => s + g.totalMarks, 0);
  const distribution: Record<string, number> = {};
  grades.forEach((g) => {
    distribution[g.grade] = (distribution[g.grade] || 0) + 1;
  });

  return {
    count:        grades.length,
    avg:          +(total / grades.length).toFixed(2),
    pass:         grades.filter((g) => g.totalMarks >= 40).length,
    fail:         grades.filter((g) => g.totalMarks < 40).length,
    distribution,
  };
}
