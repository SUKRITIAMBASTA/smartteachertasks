import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Ticket from '@/models/Ticket';
import Announcement from '@/models/Announcement';
import Resource from '@/models/Resource';
import Rubric from '@/models/Rubric';
import Grade from '@/models/Grade';
import Attendance from '@/models/Attendance';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await dbConnect();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), 
      Ticket.deleteMany({}), 
      Announcement.deleteMany({}), 
      Resource.deleteMany({}),
      Rubric.deleteMany({}),
      Grade.deleteMany({}),
      Attendance.deleteMany({})
    ]);

    const hash = await bcrypt.hash('password123', 12);

    // Create users
    const admin = await User.create({ name: 'Dr. Admin', email: 'admin@college.edu', password: hash, role: 'admin', department: 'Administration' });
    const faculty1 = await User.create({ name: 'Prof. Sharma', email: 'sharma@college.edu', password: hash, role: 'faculty', department: 'Computer Science' });
    const faculty2 = await User.create({ name: 'Prof. Gupta', email: 'gupta@college.edu', password: hash, role: 'faculty', department: 'Mathematics' });
    const student1 = await User.create({ name: 'Rahul Kumar', email: 'rahul@college.edu', password: hash, role: 'student', department: 'Computer Science' });
    const student2 = await User.create({ name: 'Priya Singh', email: 'priya@college.edu', password: hash, role: 'student', department: 'Mathematics' });
    const student3 = await User.create({ name: 'Amit Verma', email: 'amit@college.edu', password: hash, role: 'student', department: 'Computer Science' });

    // Create tickets
    await Ticket.create([
      { title: 'Projector not working in Room 204', description: 'The ceiling projector in Room 204 has stopped displaying. Classes are affected.', category: 'infrastructure', priority: 'high', status: 'open', createdBy: faculty1._id },
      { title: 'Need access to MATLAB license', description: 'I need MATLAB for my coursework but the lab computers show license expired.', category: 'technical', priority: 'medium', status: 'in_progress', createdBy: student1._id, assignedTo: admin._id },
    ]);

    // Create announcements
    await Announcement.create([
      { title: 'Mid-Semester Examination Schedule Released', content: 'The mid-semester examination schedule has been published.', author: admin._id, targetRoles: ['admin', 'faculty', 'student'], pinned: true },
    ]);

    // Create resources
    await Resource.create([
      { title: 'Course Syllabus Template', description: 'Standard template for creating course syllabi', url: '#', fileType: 'document', uploadedBy: admin._id, tags: ['template', 'syllabus'] },
    ]);

    // --- NEW SEED DATA FOR ANALYTICS ---

    // 1. Rubrics
    const r1 = await Rubric.create({ 
      title: 'Mid-Term Project', 
      description: 'First major project of the semester', 
      criteria: [{ name: 'Implementation', maxMarks: 70 }, { name: 'Report', maxMarks: 30 }], 
      createdBy: faculty1._id 
    });
    const r2 = await Rubric.create({ 
      title: 'Lab Assessment 1', 
      description: 'Weekly lab check', 
      criteria: [{ name: 'Execution', maxMarks: 50 }, { name: 'Questions', maxMarks: 50 }], 
      createdBy: faculty1._id 
    });
    const r3 = await Rubric.create({ 
      title: 'Quiz 1', 
      description: 'Multiple choice questions', 
      criteria: [{ name: 'Score', maxMarks: 100 }], 
      createdBy: faculty1._id 
    });

    // 2. Grades
    await Grade.create([
      { studentName: student1.name, studentId: 'S101', rubricId: r1._id, scores: [{ criterionName: 'Implementation', score: 60 }, { criterionName: 'Report', score: 25 }], totalScore: 85, maxTotalScore: 100, gradedBy: faculty1._id, feedback: 'Excellent technical work.' },
      { studentName: student2.name, studentId: 'S102', rubricId: r1._id, scores: [{ criterionName: 'Implementation', score: 50 }, { criterionName: 'Report', score: 20 }], totalScore: 70, maxTotalScore: 100, gradedBy: faculty1._id, feedback: 'Good effort.' },
      { studentName: student3.name, studentId: 'S103', rubricId: r1._id, scores: [{ criterionName: 'Implementation', score: 30 }, { criterionName: 'Report', score: 15 }], totalScore: 45, maxTotalScore: 100, gradedBy: faculty1._id, feedback: 'Needs improvement in implementation.' },
      
      { studentName: student1.name, studentId: 'S101', rubricId: r2._id, scores: [{ criterionName: 'Execution', score: 45 }, { criterionName: 'Questions', score: 40 }], totalScore: 85, maxTotalScore: 100, gradedBy: faculty1._id },
      { studentName: student2.name, studentId: 'S102', rubricId: r2._id, scores: [{ criterionName: 'Execution', score: 40 }, { criterionName: 'Questions', score: 35 }], totalScore: 75, maxTotalScore: 100, gradedBy: faculty1._id },
      
      { studentName: student1.name, studentId: 'S101', rubricId: r3._id, scores: [{ criterionName: 'Score', score: 92 }], totalScore: 92, maxTotalScore: 100, gradedBy: faculty1._id },
      { studentName: student2.name, studentId: 'S102', rubricId: r3._id, scores: [{ criterionName: 'Score', score: 88 }], totalScore: 88, maxTotalScore: 100, gradedBy: faculty1._id },
      { studentName: student3.name, studentId: 'S103', rubricId: r3._id, scores: [{ criterionName: 'Score', score: 65 }], totalScore: 65, maxTotalScore: 100, gradedBy: faculty1._id },
    ]);

    // 3. Attendance
    const today = new Date();
    const attendanceData: any[] = [];
    for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        [student1, student2, student3].forEach(s => {
            const status = Math.random() > 0.15 ? 'present' : (Math.random() > 0.5 ? 'absent' : 'late');
            attendanceData.push({ studentId: s._id, date, status });
        });
    }
    await Attendance.insertMany(attendanceData);

    return NextResponse.json({ success: true, message: 'Database seeded with Analytics data successfully', credentials: { email: 'admin@college.edu / sharma@college.edu / rahul@college.edu', password: 'password123' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
