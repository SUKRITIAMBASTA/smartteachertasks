import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Department from '@/models/Department';
import Room from '@/models/Room';
import Subject from '@/models/Subject';
import Session from '@/models/Session';
import bcrypt from 'bcryptjs';

/**
 * 🚀 Institutional High-Speed Seeder
 * Optimized with bulk 'insertMany' to prevent request timeouts.
 * Populates Admin, Faculty, Students, and Academic Structure.
 */
export async function GET() {
  try {
    await dbConnect();
    
    // 🧹 Clean Institutional Slate
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Room.deleteMany({}),
      Subject.deleteMany({}),
      Session.deleteMany({})
    ]);

    // 🔑 0. Encrypt Institutional Credentials
    const adminPassword = await bcrypt.hash('admin123', 10);
    const facultyPassword = await bcrypt.hash('password123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    await User.create({
      name: 'System Administrator',
      email: 'admin@smartteach.edu',
      password: adminPassword,
      role: 'admin',
      department: 'Administration'
    });

    // 🏛️ 1. Bulk Create Schools & Branches
    const schoolBranches = [
      { name: 'School of Engineering', branches: ['CSE', 'ECE', 'ME', 'Civil'] },
      { name: 'School of Business', branches: ['BBA', 'MBA', 'BMS'] },
      { name: 'School of IT', branches: ['BCA', 'MCA'] },
      { name: 'School of Media', branches: ['BJMC', 'MJMC'] }
    ];

    const departmentData: any[] = [];
    for (const school of schoolBranches) {
      for (const branch of school.branches) {
        departmentData.push({ 
          name: school.name, 
          branch: branch, 
          shift: branch.startsWith('M') ? 'afternoon' : 'morning' 
        });
      }
    }
    const depts = await Department.insertMany(departmentData);

    // 🏢 2. Bulk Create Campus Physical Model (5 Floors, 50 Rooms)
    const roomBatch: any[] = [];
    for (let floor = 1; floor <= 5; floor++) {
        for (let r = 1; r <= 10; r++) {
            const roomNo = `${floor}${r < 10 ? '0' : ''}${r}`;
            roomBatch.push({
                roomNo,
                type: (floor === 2 || floor === 4) && r <= 3 ? 'complab' : 'classroom',
                capacity: (floor === 2 || floor === 4) && r <= 3 ? 30 : 60
            });
        }
    }
    await Room.insertMany(roomBatch);

    // 📅 3. Create Session
    await Session.create({
      name: 'Academic Session 2026',
      type: 'odd',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-12-31'),
      isActive: true
    });

    // 👨‍🏫 4. Bulk Create Faculty Registry (50 Members)
    const facultyNames = ['Prof. Sharma', 'Dr. Gupta', 'Prof. Verma', 'Dr. Singh', 'Prof. Reddy', 'Dr. Iyer', 'Prof. Kapoor', 'Dr. Das'];
    const facultyData: any[] = [];
    for (let i = 0; i < 50; i++) {
        const d = depts[i % depts.length];
        facultyData.push({
            name: `${facultyNames[i % facultyNames.length]} (${d.branch})`,
            email: `faculty${i}@smartteach.edu`,
            password: facultyPassword,
            role: 'faculty',
            departmentId: d._id,
            department: d.branch,
            semester: 0
        });
    }
    const faculties = await User.insertMany(facultyData);

    // 🎓 5. Bulk Create Student Cohorts (100+ Students)
    const studentData: any[] = [];
    depts.forEach((d) => {
      [1, 3, 5, 7].forEach(sem => {
        for (let s = 1; s <= 2; s++) {
          studentData.push({
            name: `Student ${d.branch}-S${sem}-${s}`,
            email: `student.${d.branch.toLowerCase()}.${sem}.${s}@smartteach.edu`,
            password: studentPassword,
            role: 'student',
            departmentId: d._id,
            department: d.branch,
            semester: sem
          });
        }
      });
    });
    const students = await User.insertMany(studentData);

    // 📚 6. Bulk Create High-Density Subjects (150+ Units)
    const subjectsData: any[] = [];
    depts.forEach((dept) => {
        [1, 3, 5, 7].forEach(sem => {
            subjectsData.push({
                name: `${dept.branch} Core S${sem}`,
                code: `${dept.branch}-${sem}01`,
                departmentId: dept._id,
                semester: sem,
                assignedFaculty: faculties[Math.floor(Math.random() * faculties.length)]._id
            });
            subjectsData.push({
                name: `${dept.branch} Lab S${sem}`,
                code: `${dept.branch}-${sem}01L`,
                departmentId: dept._id,
                semester: sem,
                assignedFaculty: faculties[Math.floor(Math.random() * faculties.length)]._id
            });
        });
    });
    await Subject.insertMany(subjectsData);

    return NextResponse.json({ 
        success: true, 
        message: 'Institutional Database Refined', 
        stats: { 
            branches: depts.length, 
            faculty: faculties.length,
            students: students.length,
            subjects: subjectsData.length
        },
        credentials: {
          admin: 'admin@smartteach.edu / admin123',
          faculty: 'faculty0@smartteach.edu / password123',
          student: 'student.cse.1.1@smartteach.edu / student123'
        }
    });
  } catch (error: any) {
    console.error('Seed Failure:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
