import dbConnect from './db';
import Department from '../models/Department';
import User from '../models/User';
import Subject from '../models/Subject';
import Room from '../models/Room';
import bcrypt from 'bcryptjs';

// ──────────────────────────── INSTITUTIONAL HIERARCHY ────────────────────────────

const INSTITUTIONS = [
  { id: 'ASET', name: 'Amity School of Engineering & Technology, Patna', branches: ['CSE', 'AI', 'Civil', 'Mechanical', 'Applied Sciences'] },
  { id: 'AIIT', name: 'Amity Institute of Information Technology, Patna', branches: ['BCA', 'MCA'] },
  { id: 'ALS',  name: 'Amity Law School, Patna', branches: ['Law'] },
  { id: 'ABS',  name: 'Amity Business School, Patna', branches: ['Management'] },
];

// ──────────────────────────── FACULTY REGISTRY ────────────────────────────

const FACULTY = [
  // ASET - CSE
  { name: 'Dr. Siddhartha Sankar Biswas', email: 'ssbiswas@ptn.amity.edu', institution: 'ASET', branch: 'CSE', designation: 'Professor' },
  { name: 'Dr. Anand Kumar', email: 'akumar@ptn.amity.edu', institution: 'ASET', branch: 'CSE', designation: 'Associate Professor' },
  // ASET - AI
  { name: 'Dr. Lalita Kumari', email: 'lkumari@ptn.amity.edu', institution: 'ASET', branch: 'AI', designation: 'Assistant Professor' },
  { name: 'Dr. Priya Ranjan', email: 'pranjan@ptn.amity.edu', institution: 'ASET', branch: 'AI', designation: 'Associate Professor' },
  // ASET - Applied Sciences
  { name: 'Dr. Shweta Singh', email: 'ssingh@ptn.amity.edu', institution: 'ASET', branch: 'Applied Sciences', designation: 'Assistant Professor' },
  // ASET - Mechanical
  { name: 'Dr. S. K. Singh', email: 'sksingh@ptn.amity.edu', institution: 'ASET', branch: 'Mechanical', designation: 'Professor' },
  // ASET - Civil
  { name: 'Dr. Rakesh Verma', email: 'rverma@ptn.amity.edu', institution: 'ASET', branch: 'Civil', designation: 'Assistant Professor' },
  // AIIT
  { name: 'Dr. Rashmi Shekhar', email: 'rshekhar@ptn.amity.edu', institution: 'AIIT', branch: 'MCA', designation: 'Associate Professor' },
  { name: 'Mr. Arvind Madheshiya', email: 'amadheshiya@ptn.amity.edu', institution: 'AIIT', branch: 'BCA', designation: 'Assistant Professor' },
  { name: 'Ms. Neha Kumari', email: 'nkumari@ptn.amity.edu', institution: 'AIIT', branch: 'BCA', designation: 'Assistant Professor' },
  // ALS
  { name: 'Prof. Vivek Singh', email: 'vsingh@ptn.amity.edu', institution: 'ALS', branch: 'Law', designation: 'Director' },
  // ABS
  { name: 'Dr. Meena Sharma', email: 'msharma@ptn.amity.edu', institution: 'ABS', branch: 'Management', designation: 'Associate Professor' },
  // Additional Faculty for Depth
  { name: 'Dr. Rajesh Kumar', email: 'rkumar@ptn.amity.edu', institution: 'ASET', branch: 'CSE', designation: 'Associate Professor' },
  { name: 'Dr. Sunita Sharma', email: 'ssharma@ptn.amity.edu', institution: 'ABS', branch: 'Management', designation: 'Professor' },
  { name: 'Prof. Amit Verma', email: 'averma@ptn.amity.edu', institution: 'ALS', branch: 'Law', designation: 'Assistant Professor' },
  { name: 'Dr. Kavita Singh', email: 'ksingh@ptn.amity.edu', institution: 'AIIT', branch: 'MCA', designation: 'Associate Professor' },
  { name: 'Mr. Rahul Gupta', email: 'rgupta@ptn.amity.edu', institution: 'AIIT', branch: 'BCA', designation: 'Assistant Professor' },
];

// ──────────────────────── STUDENT DATA (SEMESTER-WISE) ────────────────────────

const STUDENTS = [
  // ASET CSE - Even Semesters
  { name: 'Aarav Sharma', email: 'aarav.cse2@ptn.amity.edu', institution: 'ASET', branch: 'CSE', semester: 2, shift: 'morning' },
  { name: 'Diya Patel', email: 'diya.cse2@ptn.amity.edu', institution: 'ASET', branch: 'CSE', semester: 2, shift: 'morning' },
  { name: 'Rohan Gupta', email: 'rohan.cse4@ptn.amity.edu', institution: 'ASET', branch: 'CSE', semester: 4, shift: 'morning' },
  { name: 'Ananya Singh', email: 'ananya.cse4@ptn.amity.edu', institution: 'ASET', branch: 'CSE', semester: 4, shift: 'morning' },
  { name: 'Kulsum Fatima', email: 'kulsum.cse6@ptn.amity.edu', institution: 'ASET', branch: 'CSE', semester: 6, shift: 'morning' },
  { name: 'Sukriti Ambasta', email: 'sukriti.cse6@ptn.amity.edu', institution: 'ASET', branch: 'CSE', semester: 6, shift: 'morning' },
  { name: 'Lavanya Kumari', email: 'lavanya.cse6@ptn.amity.edu', institution: 'ASET', branch: 'CSE', semester: 6, shift: 'morning' },
  { name: 'Ritik Kumar', email: 'ritik.cse6@ptn.amity.edu', institution: 'ASET', branch: 'CSE', semester: 6, shift: 'morning' },
  { name: 'Vikash Raj', email: 'vikash.cse8@ptn.amity.edu', institution: 'ASET', branch: 'CSE', semester: 8, shift: 'morning' },
  // ASET CSE Evening
  { name: 'Priya Kumari', email: 'priya.cse4e@ptn.amity.edu', institution: 'ASET', branch: 'CSE', semester: 4, shift: 'evening' },
  { name: 'Amit Raj', email: 'amit.cse4e@ptn.amity.edu', institution: 'ASET', branch: 'CSE', semester: 4, shift: 'evening' },
  // ASET AI
  { name: 'Sneha Verma', email: 'sneha.ai2@ptn.amity.edu', institution: 'ASET', branch: 'AI', semester: 2, shift: 'morning' },
  { name: 'Karan Thakur', email: 'karan.ai4@ptn.amity.edu', institution: 'ASET', branch: 'AI', semester: 4, shift: 'morning' },
  { name: 'Neha Gupta', email: 'neha.ai6@ptn.amity.edu', institution: 'ASET', branch: 'AI', semester: 6, shift: 'morning' },
  // ASET Mechanical
  { name: 'Rahul Singh', email: 'rahul.me6@ptn.amity.edu', institution: 'ASET', branch: 'Mechanical', semester: 6, shift: 'morning' },
  // ASET Civil
  { name: 'Pooja Rani', email: 'pooja.ce4@ptn.amity.edu', institution: 'ASET', branch: 'Civil', semester: 4, shift: 'morning' },
  // AIIT BCA
  { name: 'Aditya Kumar', email: 'aditya.bca2@ptn.amity.edu', institution: 'AIIT', branch: 'BCA', semester: 2, shift: 'morning' },
  { name: 'Sonal Mishra', email: 'sonal.bca4@ptn.amity.edu', institution: 'AIIT', branch: 'BCA', semester: 4, shift: 'morning' },
  { name: 'Manish Yadav', email: 'manish.bca4@ptn.amity.edu', institution: 'AIIT', branch: 'BCA', semester: 4, shift: 'morning' },
  // AIIT MCA
  { name: 'Ritu Singh', email: 'ritu.mca2@ptn.amity.edu', institution: 'AIIT', branch: 'MCA', semester: 2, shift: 'morning' },
  { name: 'Deepak Kumar', email: 'deepak.mca4@ptn.amity.edu', institution: 'AIIT', branch: 'MCA', semester: 4, shift: 'morning' },
  // ALS Law
  { name: 'Shreya Jha', email: 'shreya.law2@ptn.amity.edu', institution: 'ALS', branch: 'Law', semester: 2, shift: 'morning' },
  // ABS Management
  { name: 'Arjun Mehta', email: 'arjun.mba2@ptn.amity.edu', institution: 'ABS', branch: 'Management', semester: 2, shift: 'morning' },
  // Additional Students for Depth
  { name: 'Sanya Malhotra', email: 'sanya.cse2@ptn.amity.edu', institution: 'ASET', branch: 'CSE', semester: 2, shift: 'morning' },
  { name: 'Ishaan Khattar', email: 'ishaan.mba2@ptn.amity.edu', institution: 'ABS', branch: 'Management', semester: 2, shift: 'morning' },
  { name: 'Anjali Bhardwaj', email: 'anjali.law4@ptn.amity.edu', institution: 'ALS', branch: 'Law', semester: 4, shift: 'morning' },
  { name: 'Kabir Singh', email: 'kabir.mca2@ptn.amity.edu', institution: 'AIIT', branch: 'MCA', semester: 2, shift: 'morning' },
  { name: 'Riya Sen', email: 'riya.bca6@ptn.amity.edu', institution: 'AIIT', branch: 'BCA', semester: 6, shift: 'morning' },
];

// ──────────────────────── SUBJECTS (DEPARTMENT + SEMESTER WISE) ────────────────────────

const SUBJECTS = [
  // ── ASET CSE ──
  { name: 'Digital Logic Design', code: 'CSE201', branch: 'CSE', sem: 2, faculty: 'ssbiswas@ptn.amity.edu' },
  { name: 'Data Structures', code: 'CSE202', branch: 'CSE', sem: 2, faculty: 'akumar@ptn.amity.edu' },
  { name: 'Operating Systems', code: 'CSE401', branch: 'CSE', sem: 4, faculty: 'ssbiswas@ptn.amity.edu' },
  { name: 'Database Management Systems', code: 'CSE402', branch: 'CSE', sem: 4, faculty: 'akumar@ptn.amity.edu' },
  { name: 'Computer Networks', code: 'CSE601', branch: 'CSE', sem: 6, faculty: 'ssbiswas@ptn.amity.edu' },
  { name: 'Compiler Design', code: 'CSE602', branch: 'CSE', sem: 6, faculty: 'akumar@ptn.amity.edu' },
  { name: 'Project Phase II (Capstone)', code: 'CSE801', branch: 'CSE', sem: 8, faculty: 'ssbiswas@ptn.amity.edu' },

  // ── ASET AI ──
  { name: 'Introduction to AI', code: 'AI201', branch: 'AI', sem: 2, faculty: 'lkumari@ptn.amity.edu' },
  { name: 'Neural Networks', code: 'AI401', branch: 'AI', sem: 4, faculty: 'pranjan@ptn.amity.edu' },
  { name: 'Artificial Intelligence', code: 'AI601', branch: 'AI', sem: 6, faculty: 'lkumari@ptn.amity.edu' },
  { name: 'Machine Learning', code: 'AI602', branch: 'AI', sem: 6, faculty: 'pranjan@ptn.amity.edu' },

  // ── ASET Applied Sciences ──
  { name: 'Discrete Mathematics', code: 'AS201', branch: 'Applied Sciences', sem: 2, faculty: 'ssingh@ptn.amity.edu' },
  { name: 'Engineering Physics', code: 'AS202', branch: 'Applied Sciences', sem: 2, faculty: 'ssingh@ptn.amity.edu' },

  // ── ASET Mechanical ──
  { name: 'Thermodynamics', code: 'ME401', branch: 'Mechanical', sem: 4, faculty: 'sksingh@ptn.amity.edu' },
  { name: 'Fluid Mechanics', code: 'ME601', branch: 'Mechanical', sem: 6, faculty: 'sksingh@ptn.amity.edu' },

  // ── ASET Civil ──
  { name: 'Structural Analysis', code: 'CE401', branch: 'Civil', sem: 4, faculty: 'rverma@ptn.amity.edu' },

  // ── AIIT BCA ──
  { name: 'Programming in C', code: 'BCA201', branch: 'BCA', sem: 2, faculty: 'amadheshiya@ptn.amity.edu' },
  { name: 'Web Technologies', code: 'BCA202', branch: 'BCA', sem: 2, faculty: 'nkumari@ptn.amity.edu' },
  { name: 'Software Engineering', code: 'BCA401', branch: 'BCA', sem: 4, faculty: 'amadheshiya@ptn.amity.edu' },
  { name: 'Java Programming', code: 'BCA402', branch: 'BCA', sem: 4, faculty: 'nkumari@ptn.amity.edu' },

  // ── AIIT MCA ──
  { name: 'Advanced Java', code: 'MCA201', branch: 'MCA', sem: 2, faculty: 'rshekhar@ptn.amity.edu' },
  { name: 'Cloud Computing', code: 'MCA202', branch: 'MCA', sem: 2, faculty: 'rshekhar@ptn.amity.edu' },
  { name: 'Network Security', code: 'MCA401', branch: 'MCA', sem: 4, faculty: 'rshekhar@ptn.amity.edu' },

  // ── ALS Law ──
  { name: 'Constitutional Law', code: 'LAW201', branch: 'Law', sem: 2, faculty: 'vsingh@ptn.amity.edu' },
  { name: 'Criminal Law', code: 'LAW401', branch: 'Law', sem: 4, faculty: 'vsingh@ptn.amity.edu' },

  // ── ABS Management ──
  { name: 'Principles of Management', code: 'MBA201', branch: 'Management', sem: 2, faculty: 'msharma@ptn.amity.edu' },
  // ── Additional Subjects for New Faculty ──
  { name: 'Theory of Computation', code: 'CSE403', branch: 'CSE', sem: 4, faculty: 'rkumar@ptn.amity.edu' },
  { name: 'Organizational Behavior', code: 'MBA202', branch: 'Management', sem: 2, faculty: 'ssharma@ptn.amity.edu' },
  { name: 'Family Law', code: 'LAW402', branch: 'Law', sem: 4, faculty: 'averma@ptn.amity.edu' },
  { name: 'Big Data Analytics', code: 'MCA203', branch: 'MCA', sem: 2, faculty: 'ksingh@ptn.amity.edu' },
  { name: 'Python for BCA', code: 'BCA601', branch: 'BCA', sem: 6, faculty: 'rgupta@ptn.amity.edu' },
];

// ──────────────────────── ROOMS ────────────────────────

const ROOMS = [
  { roomNo: '101', type: 'classroom' as const, capacity: 60 },
  { roomNo: '102', type: 'classroom' as const, capacity: 60 },
  { roomNo: '103', type: 'classroom' as const, capacity: 60 },
  { roomNo: '201', type: 'classroom' as const, capacity: 40 },
  { roomNo: '202', type: 'classroom' as const, capacity: 40 },
  { roomNo: '301', type: 'classroom' as const, capacity: 80 },
  { roomNo: '302', type: 'classroom' as const, capacity: 80 },
  { roomNo: '401', type: 'classroom' as const, capacity: 60 },
  { roomNo: '402', type: 'classroom' as const, capacity: 60 },
  { roomNo: '405', type: 'classroom' as const, capacity: 60 },
  { roomNo: 'Lab-1', type: 'complab' as const, capacity: 30 },
  { roomNo: 'Lab-2', type: 'complab' as const, capacity: 30 },
  { roomNo: 'Lab-3', type: 'complab' as const, capacity: 30 },
  { roomNo: 'Lab-4', type: 'complab' as const, capacity: 30 },
  { roomNo: 'Lab-5', type: 'complab' as const, capacity: 30 },
];

// ══════════════════════════════════════════════════════════════
// SEEDING ORCHESTRATOR
// ══════════════════════════════════════════════════════════════

export async function seedInstitutionalData() {
  await dbConnect();
  console.log('══════════════════════════════════════');
  console.log('  AMITY PATNA HUB — SEED PROTOCOL');
  console.log('══════════════════════════════════════');

  // ── PHASE 0: Clean State ──
  console.log('\n🧹 Clearing existing data...');
  await Department.deleteMany({});
  await User.deleteMany({});
  await Subject.deleteMany({});
  await Room.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 12);
  const deptIds: Record<string, any> = {};
  const facultyIds: Record<string, any> = {};

  // ── PHASE 1: Departments ──
  console.log('\n📁 Seeding Departments...');
  for (const inst of INSTITUTIONS) {
    for (const branch of inst.branches) {
      const dept = await Department.create({
        institution: inst.id,
        name: inst.name,
        branch,
      });
      deptIds[`${inst.id}-${branch}`] = dept._id;
    }
  }
  const deptCount = await Department.countDocuments();
  console.log(`   ✅ ${deptCount} departments created.`);

  // ── PHASE 2: Admin Account ──
  console.log('\n👑 Ensuring Admin account...');
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (!existingAdmin) {
    await User.create({
      name: 'System Administrator',
      email: 'admin@ptn.amity.edu',
      password: hashedPassword,
      role: 'admin',
      institution: 'ASET',
      shift: 'morning',
    });
    console.log('   ✅ Admin created (admin@ptn.amity.edu / password123)');
  } else {
    console.log(`   ✅ Admin exists: ${existingAdmin.email}`);
  }

  // ── PHASE 3: Faculty ──
  console.log('\n👨‍🏫 Seeding Faculty...');
  for (const f of FACULTY) {
    const user = await User.create({
      name: f.name,
      email: f.email,
      password: hashedPassword,
      role: 'faculty',
      institution: f.institution,
      departmentId: deptIds[`${f.institution}-${f.branch}`],
      shift: 'morning',
    });
    facultyIds[f.email] = user._id;
  }
  console.log(`   ✅ ${FACULTY.length} faculty members registered.`);

  // ── PHASE 4: Students ──
  console.log('\n🎓 Seeding Students...');
  for (const s of STUDENTS) {
    await User.create({
      name: s.name,
      email: s.email,
      password: hashedPassword,
      role: 'student',
      institution: s.institution,
      departmentId: deptIds[`${s.institution}-${s.branch}`],
      semester: s.semester,
      shift: s.shift,
    });
  }
  console.log(`   ✅ ${STUDENTS.length} students enrolled.`);

  // ── PHASE 5: Subjects with Faculty Allotment ──
  console.log('\n📚 Seeding Subjects & Updating Faculty Portfolios...');
  for (const sub of SUBJECTS) {
    const instId = ['BCA', 'MCA'].includes(sub.branch) ? 'AIIT'
                 : sub.branch === 'Law' ? 'ALS'
                 : sub.branch === 'Management' ? 'ABS'
                 : 'ASET';
    const deptId = deptIds[`${instId}-${sub.branch}`];

    if (deptId) {
      const subject = await Subject.create({
        name: sub.name,
        code: sub.code,
        departmentId: deptId,
        semester: sub.sem,
        session: sub.sem % 2 === 0 ? 'even' : 'odd',
        assignedFaculty: facultyIds[sub.faculty] || null,
        syllabus: `${sub.name} — Semester ${sub.sem} curriculum for ${sub.branch} department.`,
      });

      // Explicitly link the subject to the faculty's portfolio
      if (facultyIds[sub.faculty]) {
        await User.findByIdAndUpdate(
          facultyIds[sub.faculty],
          { $push: { assignedSubjects: { name: sub.name, semester: sub.sem } } }
        );
      }
    }
  }
  console.log(`   ✅ ${SUBJECTS.length} subjects allotted to faculty and portfolios updated.`);

  // ── PHASE 6: Rooms ──
  console.log('\n🏫 Seeding Rooms...');
  await Room.insertMany(ROOMS);
  console.log(`   ✅ ${ROOMS.length} rooms provisioned.`);

  // ── SUMMARY ──
  const totalUsers = await User.countDocuments();
  const totalSubjects = await Subject.countDocuments();
  const totalRooms = await Room.countDocuments();

  console.log('\n══════════════════════════════════════');
  console.log(`  SEED COMPLETE`);
  console.log(`  Users: ${totalUsers} | Subjects: ${totalSubjects} | Rooms: ${totalRooms} | Depts: ${deptCount}`);
  console.log('══════════════════════════════════════\n');

  return {
    success: true,
    message: `Seeded ${totalUsers} users, ${totalSubjects} subjects, ${totalRooms} rooms, ${deptCount} departments.`,
    stats: { users: totalUsers, subjects: totalSubjects, rooms: totalRooms, departments: deptCount },
  };
}
