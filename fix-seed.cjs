/**
 * SMARTTEACH — FIX SEED
 * 1. Reassigns each faculty to exactly 3 subjects across different semesters
 * 2. Creates 10-15 student accounts per department × semester
 * Run: node fix-seed.cjs
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const dotenv   = require('dotenv');
dotenv.config({ path: '.env.local' });

const SubjectSchema = new mongoose.Schema({
  name: String, code: String,
  departmentId: mongoose.Schema.Types.ObjectId,
  semester: Number, session: String, syllabus: String,
  assignedFaculty: mongoose.Schema.Types.ObjectId,
});
const DeptSchema = new mongoose.Schema({ name: String, branch: String, institution: String });
const UserSchema  = new mongoose.Schema({
  name: String, role: String, email: String,
  password: String, departmentId: mongoose.Schema.Types.ObjectId,
  semester: Number, shift: String, institution: String,
  isVerified: Boolean, idPending: Boolean,
});

// First names + last names pool for realistic student names
const FIRST_NAMES = [
  'Aarav','Aditi','Akash','Amrita','Ananya','Arjun','Ayush','Bhavana','Deepak','Devika',
  'Gaurav','Ishaan','Kavya','Kunal','Lakshmi','Manav','Meera','Nikhil','Nisha','Priya',
  'Rahul','Riya','Rohit','Sana','Shiv','Shreya','Siddharth','Simran','Tanvi','Varun',
  'Vikram','Vishal','Yogesh','Zara','Aditya','Alisha','Chirag','Divya','Harsh','Kiran',
  'Mohan','Pallavi','Pooja','Rajat','Sneha','Tarun','Usha','Vinay','Yash','Anjali',
];
const LAST_NAMES = [
  'Sharma','Kumar','Singh','Gupta','Verma','Mehta','Joshi','Patel','Mishra','Rao',
  'Nair','Iyer','Shah','Agarwal','Sinha','Kapoor','Pillai','Bose','Das','Chatterjee',
  'Ambasta','Pandey','Tiwari','Chauhan','Saxena','Banerjee','Reddy','Naidu','Menon','Yadav',
];

function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makeName() {
  return `${randItem(FIRST_NAMES)} ${randItem(LAST_NAMES)}`;
}

function makeEmail(name, idx) {
  return `${name.toLowerCase().replace(/\s+/g, '.')}${idx}@amity.edu`;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const Subject = mongoose.models.Subject    || mongoose.model('Subject',    SubjectSchema);
    const Dept    = mongoose.models.Department || mongoose.model('Department', DeptSchema);
    const User    = mongoose.models.User       || mongoose.model('User',       UserSchema);

    const SEMS = [1, 3, 5, 7];

    // ──────────────────────────────────────────────────
    // STEP 1: Assign each faculty exactly 3 subjects
    //         (one per randomised semester, across one dept)
    // ──────────────────────────────────────────────────
    console.log('[1/2] Reassigning faculty to exactly 3 subjects each...');

    // Clear all existing faculty assignments
    await Subject.updateMany({}, { $unset: { assignedFaculty: '' } });

    const faculty   = await User.find({ role: 'faculty' }).lean();
    const allSubjects = await Subject.find().lean();

    // Group subjects: deptId → semester → subjects[]
    const subjectMap = {};
    for (const s of allSubjects) {
      const d = s.departmentId.toString();
      if (!subjectMap[d]) subjectMap[d] = {};
      if (!subjectMap[d][s.semester]) subjectMap[d][s.semester] = [];
      subjectMap[d][s.semester].push(s);
    }

    const allDepts = await Dept.find().lean();

    // Faculty assignment tracking — each subject should be picked once
    const assignmentUpdates = [];
    const usedSubjectIds = new Set();

    for (const fac of faculty) {
      // Pick a random department for this faculty member
      const dept = randItem(allDepts);
      const deptId = dept._id.toString();
      const deptSubs = subjectMap[deptId] || {};

      // Get available semesters for this department
      const availSems = Object.keys(deptSubs).map(Number).filter(s => deptSubs[s]?.length > 0);
      if (availSems.length === 0) continue;

      // Pick 3 different semesters (or fewer if not enough)
      const pickedSems = [];
      const shuffled = [...availSems].sort(() => Math.random() - 0.5);
      for (const sem of shuffled) {
        if (pickedSems.length >= 3) break;
        pickedSems.push(sem);
      }

      // Pick one subject per semester (prefer non-lab, non-already-assigned)
      for (const sem of pickedSems) {
        const semSubs = (deptSubs[sem] || []).filter(s => !usedSubjectIds.has(s._id.toString()));
        if (!semSubs.length) continue;

        // Prefer non-lab subjects for primary assignment
        const nonLab = semSubs.filter(s => !s.name.toLowerCase().includes('lab'));
        const picked = nonLab.length ? randItem(nonLab) : randItem(semSubs);

        usedSubjectIds.add(picked._id.toString());
        assignmentUpdates.push({
          updateOne: {
            filter: { _id: picked._id },
            update: { $set: { assignedFaculty: fac._id } },
          },
        });
        console.log(`   → ${fac.name.padEnd(28)} ← ${picked.name} (Sem ${sem}, ${dept.branch})`);
      }
    }

    if (assignmentUpdates.length > 0) {
      await Subject.bulkWrite(assignmentUpdates);
    }
    console.log(`\n   ✓ Assigned ${assignmentUpdates.length} subject-faculty pairs.\n`);

    // ──────────────────────────────────────────────────
    // STEP 2: Create students (10-12 per dept × semester)
    //         Skip if enough already exist
    // ──────────────────────────────────────────────────
    console.log('[2/2] Seeding student accounts (10-12 per dept × semester)...');

    const hashedPassword = await bcrypt.hash('student123', 10);
    const studentDocs    = [];
    let globalIdx = 1;

    for (const dept of allDepts) {
      for (const sem of SEMS) {
        // Check existing students for this dept+sem
        const existing = await User.countDocuments({
          role: 'student',
          departmentId: dept._id,
          semester: sem,
        });
        if (existing >= 8) {
          console.log(`   ↳ ${dept.branch} Sem ${sem}: ${existing} students already exist — skipping`);
          continue;
        }

        const count = randInt(10, 12);
        for (let i = 0; i < count; i++) {
          const name  = makeName();
          const email = makeEmail(name, globalIdx++);
          const shift = [1, 7].includes(sem) ? 'morning' : 'evening';
          studentDocs.push({
            name,
            email,
            password:     hashedPassword,
            role:         'student',
            departmentId: dept._id,
            semester:     sem,
            institution:  dept.institution || dept.name,
            shift,
            isVerified:   true,
            idPending:    false,
          });
        }
        console.log(`   ✓ ${dept.name} | ${dept.branch} | Sem ${sem} → ${count} students queued`);
      }
    }

    if (studentDocs.length > 0) {
      // Insert in batches to avoid duplicate email conflicts
      let inserted = 0;
      const BATCH = 50;
      for (let i = 0; i < studentDocs.length; i += BATCH) {
        const batch = studentDocs.slice(i, i + BATCH);
        try {
          const res = await User.insertMany(batch, { ordered: false });
          inserted += res.length;
        } catch (e) {
          // ordered:false means partial inserts succeed even if some emails clash
          inserted += (e.insertedDocs?.length || 0);
        }
      }
      console.log(`\n   ✓ Inserted ${inserted} new student accounts.`);
    } else {
      console.log('\n   ✓ All departments already have sufficient students.');
    }

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty  = await User.countDocuments({ role: 'faculty' });
    const assignedSubs  = await Subject.countDocuments({ assignedFaculty: { $exists: true, $ne: null } });

    console.log('\n═══════════════════════════════════════════════');
    console.log(`  Total Faculty:          ${totalFaculty}`);
    console.log(`  Total Students:         ${totalStudents}`);
    console.log(`  Subjects with Faculty:  ${assignedSubs}`);
    console.log('═══════════════════════════════════════════════\n');
    process.exit(0);

  } catch (err) {
    console.error('\n✗ FIX-SEED FAILED:', err.message);
    console.error(err);
    process.exit(1);
  }
}

run();
