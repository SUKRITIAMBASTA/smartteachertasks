import { config } from 'dotenv';
config({ path: '.env.local' });
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Department from '../models/Department';
import Subject from '../models/Subject';

async function seed() {
  const dbConnect = (await import('../lib/db')).default;
  await dbConnect();
  console.log('Connected to MongoDB');

  const hashedPassword = await bcrypt.hash('password123', 12);

  // 1. Ensure Department ASET-CSE exists
  let asetCSE = await Department.findOne({ institution: 'ASET', branch: 'CSE' });
  if (!asetCSE) {
    asetCSE = await Department.create({
      institution: 'ASET',
      name: 'Amity School of Engineering & Technology',
      branch: 'CSE'
    });
    console.log('Created Department: ASET-CSE');
  }

  // 2. Create Admin
  await User.findOneAndUpdate(
    { email: 'admin@gmail.com' },
    {
      name: 'System Admin',
      password: hashedPassword,
      role: 'admin',
      institution: 'ASET',
      status: 'active'
    },
    { upsert: true, new: true }
  );
  console.log('Seeded Admin: admin@gmail.com');

  // 3. Create Main Faculty
  const mainFaculty = await User.findOneAndUpdate(
    { email: 'faculty@gmail.com' },
    {
      name: 'Main Faculty',
      password: hashedPassword,
      role: 'faculty',
      institution: 'ASET',
      departmentId: asetCSE._id,
      status: 'active'
    },
    { upsert: true, new: true }
  );
  console.log('Seeded Faculty: faculty@gmail.com');

  // 4. Create Abhishek Anand
  const profAbhishek = await User.findOneAndUpdate(
    { email: 'abhishek@gmail.com' },
    {
      name: 'Prof Abhishek Anand',
      password: hashedPassword,
      role: 'faculty',
      institution: 'ASET',
      departmentId: asetCSE._id,
      status: 'active'
    },
    { upsert: true, new: true }
  );
  console.log('Seeded Faculty: Abhishek Anand');

  // 5. Create Shipy Singh
  const profShipy = await User.findOneAndUpdate(
    { email: 'shipy@gmail.com' },
    {
      name: 'Shipy Singh',
      password: hashedPassword,
      role: 'faculty',
      institution: 'ASET',
      departmentId: asetCSE._id,
      status: 'active'
    },
    { upsert: true, new: true }
  );
  console.log('Seeded Faculty: Shipy Singh');

  // 6. Create Student
  await User.findOneAndUpdate(
    { email: 'student@gmail.com' },
    {
      name: 'Student User',
      password: hashedPassword,
      role: 'student',
      institution: 'ASET',
      departmentId: asetCSE._id,
      semester: 6,
      status: 'active'
    },
    { upsert: true, new: true }
  );
  console.log('Seeded Student: student@gmail.com (Sem 6)');

  // 7. Seed Subjects
  const subjectData = [
    { name: 'Compiler Design', code: 'CD501', sem: 5, faculty: mainFaculty._id },
    { name: 'Theory of Computation', code: 'TOC301', sem: 3, faculty: mainFaculty._id },
    { name: 'DBMS', code: 'DBMS101', sem: 1, faculty: mainFaculty._id },
    { name: 'Compiler Design', code: 'CD601', sem: 6, faculty: profAbhishek._id },
    { name: 'Data Mining', code: 'DM601', sem: 6, faculty: profShipy._id },
  ];

  for (const s of subjectData) {
    const sub = await Subject.findOneAndUpdate(
      { name: s.name, semester: s.sem, departmentId: asetCSE._id },
      {
        code: s.code,
        assignedFaculty: s.faculty,
        session: s.sem % 2 === 0 ? 'even' : 'odd',
        syllabus: `Syllabus for ${s.name} (Semester ${s.sem})`
      },
      { upsert: true, new: true }
    );
    
    // Link to faculty portfolio
    await User.findByIdAndUpdate(s.faculty, {
      $addToSet: { assignedSubjects: { name: s.name, semester: s.sem } }
    });
  }
  console.log('Seeded 5 Subjects and linked to faculty portfolios');

  console.log('Custom Seeding Complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
