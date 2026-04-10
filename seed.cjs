/**
 * SMARTTEACH — MASTER SEED SCRIPT
 * - Unique subjects per department + semester
 * - Management split into BBA + MBA
 * - Routine generated for every department
 * Run: node seed.cjs
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

// ──────────── Minimal Schemas ────────────
const SubjectSchema = new mongoose.Schema({
    name: String, code: String,
    departmentId: mongoose.Schema.Types.ObjectId,
    semester: Number, session: String, syllabus: String,
    requiredClasses: { type: Number, default: 40 },
    assignedFaculty: mongoose.Schema.Types.ObjectId
});
const DeptSchema = new mongoose.Schema({ name: String, branch: String, institution: String });
const UserSchema  = new mongoose.Schema({ name: String, role: String, email: String });
const RoomSchema  = new mongoose.Schema({ roomNo: String, type: String, capacity: Number });
const ScheduleSchema = new mongoose.Schema({
    departmentId: mongoose.Schema.Types.ObjectId, semester: Number, date: Date,
    timeSlot: String, shift: String,
    subjectId: mongoose.Schema.Types.ObjectId,
    facultyId: mongoose.Schema.Types.ObjectId,
    roomId:    mongoose.Schema.Types.ObjectId,
    type: String, status: String, isLab: Boolean
});

// ──────────── SUBJECT LIBRARY ────────────
// Every department × every semester has a UNIQUE, realistic subject list
const SUBJECT_LIBRARY = {

  // ── Engineering ──────────────────────────────────────────────────
  CSE: {
    1: [
      { n: 'Problem Solving & C Programming',       lab: false },
      { n: 'Engineering Mathematics I',              lab: false },
      { n: 'Digital Logic & Circuit Design',         lab: false },
      { n: 'Professional Communication Skills',      lab: false },
      { n: 'Environmental Science',                  lab: false },
      { n: 'C Programming Lab',                      lab: true  },
    ],
    3: [
      { n: 'Data Structures & Algorithms',           lab: false },
      { n: 'Computer Organization & Architecture',   lab: false },
      { n: 'Object-Oriented Programming with Java',  lab: false },
      { n: 'Discrete Mathematics',                   lab: false },
      { n: 'Database Management Systems',            lab: false },
      { n: 'Data Structures Lab',                    lab: true  },
    ],
    5: [
      { n: 'Artificial Intelligence',                lab: false },
      { n: 'Software Engineering & Project Mgmt',    lab: false },
      { n: 'Computer Networks',                      lab: false },
      { n: 'Theory of Computation',                  lab: false },
      { n: 'Web Technologies',                       lab: false },
      { n: 'AI & Networks Lab',                      lab: true  },
    ],
    7: [
      { n: 'Cloud Computing & Virtualization',       lab: false },
      { n: 'Machine Learning & Deep Learning',       lab: false },
      { n: 'Cyber Security & Ethical Hacking',       lab: false },
      { n: 'Blockchain Technology',                  lab: false },
      { n: 'Major Project Phase I',                  lab: false },
      { n: 'Cloud & ML Lab',                         lab: true  },
    ],
  },

  IT: {
    1: [
      { n: 'Foundations of Information Technology',  lab: false },
      { n: 'Mathematical Foundations for IT',        lab: false },
      { n: 'Digital Electronics Fundamentals',       lab: false },
      { n: 'Technical Writing & Communication',      lab: false },
      { n: 'Physics for Computer Science',           lab: false },
      { n: 'IT Essentials Lab',                      lab: true  },
    ],
    3: [
      { n: 'Data Structures using Python',           lab: false },
      { n: 'Computer Networks Fundamentals',         lab: false },
      { n: 'Operating Systems',                      lab: false },
      { n: 'Software Development Life Cycle',        lab: false },
      { n: 'Relational Database Systems',            lab: false },
      { n: 'Networks & OS Lab',                      lab: true  },
    ],
    5: [
      { n: 'Internet of Things & Embedded Systems',  lab: false },
      { n: 'Information Security Management',        lab: false },
      { n: 'Mobile Application Development',         lab: false },
      { n: 'Data Mining & Warehousing',              lab: false },
      { n: 'Cloud Services & DevOps',                lab: false },
      { n: 'IoT & Mobile Lab',                       lab: true  },
    ],
    7: [
      { n: 'Big Data Analytics',                     lab: false },
      { n: 'AI-Powered Application Design',          lab: false },
      { n: 'IT Project Management',                  lab: false },
      { n: 'Enterprise Resource Planning',           lab: false },
      { n: 'Capstone Project',                       lab: false },
      { n: 'Big Data Lab',                           lab: true  },
    ],
  },

  ECE: {
    1: [
      { n: 'Basic Electrical Engineering',           lab: false },
      { n: 'Engineering Mathematics I',              lab: false },
      { n: 'Electronic Devices & Circuits',          lab: false },
      { n: 'Engineering Physics',                    lab: false },
      { n: 'Environmental Studies',                  lab: false },
      { n: 'Basic Electronics Lab',                  lab: true  },
    ],
    3: [
      { n: 'Signals & Systems',                      lab: false },
      { n: 'Analog Communication Systems',           lab: false },
      { n: 'Digital Electronics & Logic Design',     lab: false },
      { n: 'Electromagnetic Field Theory',            lab: false },
      { n: 'Control Systems',                        lab: false },
      { n: 'Analog Circuits Lab',                    lab: true  },
    ],
    5: [
      { n: 'Digital Signal Processing',              lab: false },
      { n: 'Wireless Communication',                 lab: false },
      { n: 'VLSI Design & Fabrication',              lab: false },
      { n: 'Microprocessors & Microcontrollers',     lab: false },
      { n: 'Antenna & Wave Propagation',             lab: false },
      { n: 'DSP & VLSI Lab',                         lab: true  },
    ],
    7: [
      { n: 'Embedded Systems Design',                lab: false },
      { n: 'Optical Fiber Communication',            lab: false },
      { n: 'Radar & Satellite Communication',        lab: false },
      { n: 'RF & Microwave Engineering',             lab: false },
      { n: 'Final Year Project',                     lab: false },
      { n: 'Embedded & RF Lab',                      lab: true  },
    ],
  },

  ME: {
    1: [
      { n: 'Engineering Drawing & Graphics',         lab: false },
      { n: 'Engineering Thermodynamics',             lab: false },
      { n: 'Material Science & Metallurgy',          lab: false },
      { n: 'Workshop Technology',                    lab: false },
      { n: 'Engineering Mathematics I',              lab: false },
      { n: 'Workshop Practice Lab',                  lab: true  },
    ],
    3: [
      { n: 'Strength of Materials',                  lab: false },
      { n: 'Kinematics of Machines',                 lab: false },
      { n: 'Fluid Mechanics & Machinery',            lab: false },
      { n: 'Machine Drawing',                        lab: false },
      { n: 'Manufacturing Processes',                lab: false },
      { n: 'Fluid Mechanics Lab',                    lab: true  },
    ],
    5: [
      { n: 'Heat & Mass Transfer',                   lab: false },
      { n: 'Dynamics of Machines',                   lab: false },
      { n: 'IC Engines & Gas Turbines',              lab: false },
      { n: 'Industrial Engineering & Management',    lab: false },
      { n: 'Metrology & Quality Control',            lab: false },
      { n: 'Heat Transfer Lab',                      lab: true  },
    ],
    7: [
      { n: 'Refrigeration & Air Conditioning',       lab: false },
      { n: 'CAD/CAM & CNC Technology',               lab: false },
      { n: 'Mechatronics & Robotics',                lab: false },
      { n: 'Automobile Engineering',                  lab: false },
      { n: 'B.Tech Major Project',                   lab: false },
      { n: 'CAD/CAM Lab',                            lab: true  },
    ],
  },

  CE: {
    1: [
      { n: 'Engineering Mechanics',                  lab: false },
      { n: 'Building Materials & Construction',      lab: false },
      { n: 'Surveying & Levelling',                  lab: false },
      { n: 'Engineering Mathematics I',              lab: false },
      { n: 'Environmental Engineering Basics',       lab: false },
      { n: 'Surveying Lab',                          lab: true  },
    ],
    3: [
      { n: 'Structural Analysis I',                  lab: false },
      { n: 'Geotechnical Engineering',               lab: false },
      { n: 'Transportation Engineering',             lab: false },
      { n: 'Hydraulics & Fluid Mechanics',           lab: false },
      { n: 'Concrete Technology',                    lab: false },
      { n: 'Concrete & Soils Lab',                   lab: true  },
    ],
    5: [
      { n: 'Design of Steel Structures',             lab: false },
      { n: 'Water Supply & Sewage Engineering',      lab: false },
      { n: 'Irrigation Engineering',                 lab: false },
      { n: 'Foundation Engineering',                 lab: false },
      { n: 'Construction Project Management',        lab: false },
      { n: 'Structural Design Lab',                  lab: true  },
    ],
    7: [
      { n: 'Advanced Structural Design',             lab: false },
      { n: 'Smart Infrastructure & BIM',             lab: false },
      { n: 'Earthquake Resistant Design',            lab: false },
      { n: 'Environmental Impact Assessment',        lab: false },
      { n: 'Civil Engineering Project',              lab: false },
      { n: 'BIM & GIS Lab',                          lab: true  },
    ],
  },

  // ── Law ──────────────────────────────────────────────────────────
  LAW: {
    1: [
      { n: 'Law of Torts & Consumer Protection',    lab: false },
      { n: 'Constitutional Law I',                   lab: false },
      { n: 'Legal Methods & Research',               lab: false },
      { n: 'English for Law',                        lab: false },
      { n: 'Political Science for Lawyers',          lab: false },
      { n: 'Moot Court Practice I',                  lab: true  },
    ],
    3: [
      { n: 'Constitutional Law II',                  lab: false },
      { n: 'Contract Law',                           lab: false },
      { n: 'Criminal Law (IPC)',                     lab: false },
      { n: 'Administrative Law',                     lab: false },
      { n: 'Legal Writing & Drafting',               lab: false },
      { n: 'Moot Court Practice II',                 lab: true  },
    ],
    5: [
      { n: 'Company Law & Corporate Governance',    lab: false },
      { n: 'Environmental Law',                      lab: false },
      { n: 'Intellectual Property Rights',           lab: false },
      { n: 'Labour & Industrial Relations Law',      lab: false },
      { n: 'Family Law',                             lab: false },
      { n: 'Clinical Legal Education',               lab: true  },
    ],
    7: [
      { n: 'International Law & Human Rights',       lab: false },
      { n: 'Taxation Law (Direct & Indirect)',       lab: false },
      { n: 'Cyber Law & IT Act',                     lab: false },
      { n: 'Arbitration & Dispute Resolution',       lab: false },
      { n: 'Dissertation / Thesis',                  lab: false },
      { n: 'Legal Aid Clinic',                       lab: true  },
    ],
  },

  // ── Journalism ───────────────────────────────────────────────────
  JOURNALISM: {
    1: [
      { n: 'Introduction to Mass Communication',    lab: false },
      { n: 'Print Journalism & Reporting',          lab: false },
      { n: 'Media History & Economics',              lab: false },
      { n: 'English Literature & Language',         lab: false },
      { n: 'Introduction to Media Studies',         lab: false },
      { n: 'Writing & Editing Workshop',            lab: true  },
    ],
    3: [
      { n: 'Broadcast Journalism (TV & Radio)',     lab: false },
      { n: 'Photojournalism',                        lab: false },
      { n: 'Advertising & Public Relations',         lab: false },
      { n: 'Development Communication',             lab: false },
      { n: 'Media Laws & Ethics',                   lab: false },
      { n: 'Photography & Studio Lab',              lab: true  },
    ],
    5: [
      { n: 'Digital Journalism & Social Media',     lab: false },
      { n: 'Documentary Filmmaking',                lab: false },
      { n: 'Political Communication',               lab: false },
      { n: 'Entertainment & Sports Journalism',     lab: false },
      { n: 'Research Methods in Mass Comm',         lab: false },
      { n: 'Video Production Lab',                  lab: true  },
    ],
    7: [
      { n: 'Convergent Journalism',                 lab: false },
      { n: 'Media Management & Entrepreneurship',   lab: false },
      { n: 'Data Journalism & Fact-Checking',       lab: false },
      { n: 'Crisis Communication',                  lab: false },
      { n: 'Final Portfolio / Thesis',              lab: false },
      { n: 'Media Production Studio',               lab: true  },
    ],
  },

  // ── Management – BBA ─────────────────────────────────────────────
  BBA: {
    1: [
      { n: 'Principles of Management',              lab: false },
      { n: 'Microeconomics for Business',           lab: false },
      { n: 'Business Mathematics & Statistics',     lab: false },
      { n: 'Financial Accounting',                  lab: false },
      { n: 'Business Communication',                lab: false },
      { n: 'Business Computing Lab',                lab: true  },
    ],
    3: [
      { n: 'Marketing Management',                  lab: false },
      { n: 'Human Resource Management',             lab: false },
      { n: 'Business Law & Corporate Regulation',   lab: false },
      { n: 'Organisational Behaviour',              lab: false },
      { n: 'Cost & Management Accounting',          lab: false },
      { n: 'Business Analytics Practical',          lab: true  },
    ],
    5: [
      { n: 'Strategic Management',                  lab: false },
      { n: 'International Business',                lab: false },
      { n: 'Financial Management',                  lab: false },
      { n: 'Sales & Distribution Management',       lab: false },
      { n: 'Consumer Behaviour & Market Research',  lab: false },
      { n: 'Case Study Workshop',                   lab: true  },
    ],
    7: [
      { n: 'Entrepreneurship Development',          lab: false },
      { n: 'Digital Marketing & E-Commerce',        lab: false },
      { n: 'Business Analytics & Big Data',         lab: false },
      { n: 'Corporate Governance & Ethics',         lab: false },
      { n: 'BBA Final Project',                     lab: false },
      { n: 'Project Presentation Lab',              lab: true  },
    ],
  },

  // ── Management – MBA ─────────────────────────────────────────────
  MBA: {
    1: [
      { n: 'Managerial Economics',                  lab: false },
      { n: 'Accounting for Managerial Decisions',   lab: false },
      { n: 'Quantitative Techniques for Managers',  lab: false },
      { n: 'Organisational Theory & Behaviour',     lab: false },
      { n: 'Business Communication & Presentation', lab: false },
      { n: 'Management IT Tools Lab',               lab: true  },
    ],
    3: [
      { n: 'Marketing Strategy & Brand Management', lab: false },
      { n: 'Corporate Finance',                     lab: false },
      { n: 'Operations Research',                   lab: false },
      { n: 'Human Resource Development',            lab: false },
      { n: 'Business Ethics & CSR',                 lab: false },
      { n: 'Live Case Method Lab',                  lab: true  },
    ],
    5: [
      { n: 'Strategic Financial Management',        lab: false },
      { n: 'Supply Chain & Logistics Management',   lab: false },
      { n: 'Derivatives & Risk Management',         lab: false },
      { n: 'International Business Strategy',       lab: false },
      { n: 'Retail & Services Management',          lab: false },
      { n: 'Business Simulation Lab',               lab: true  },
    ],
    7: [
      { n: 'Innovation & Change Management',        lab: false },
      { n: 'Corporate Restructuring & Mergers',     lab: false },
      { n: 'Venture Capital & Private Equity',      lab: false },
      { n: 'Leadership & Executive Skills',         lab: false },
      { n: 'MBA Dissertation',                      lab: false },
      { n: 'Dissertation Defence Lab',              lab: true  },
    ],
  },

  // ── Psychology ───────────────────────────────────────────────────
  PSYCHOLOGY: {
    1: [
      { n: 'Introduction to Psychology',            lab: false },
      { n: 'Biological Bases of Behaviour',         lab: false },
      { n: 'Social Psychology',                     lab: false },
      { n: 'Research Methods in Psychology',        lab: false },
      { n: 'Developmental Psychology',              lab: false },
      { n: 'Psychological Testing Lab',             lab: true  },
    ],
    3: [
      { n: 'Cognitive Psychology',                  lab: false },
      { n: 'Abnormal Psychology',                   lab: false },
      { n: 'Educational Psychology',                lab: false },
      { n: 'Statistics for Psychologists',          lab: false },
      { n: 'Health Psychology',                     lab: false },
      { n: 'Behavioural Experiments Lab',           lab: true  },
    ],
    5: [
      { n: 'Clinical Psychology & Psychotherapy',   lab: false },
      { n: 'Industrial & Organisational Psych',     lab: false },
      { n: 'Neuropsychology',                       lab: false },
      { n: 'Counselling Psychology',                lab: false },
      { n: 'Positive Psychology',                   lab: false },
      { n: 'Counselling Practice Lab',              lab: true  },
    ],
    7: [
      { n: 'Forensic & Criminal Psychology',        lab: false },
      { n: 'Child & Adolescent Therapy',            lab: false },
      { n: 'Cross-Cultural Psychology',             lab: false },
      { n: 'Advanced Psychometrics',                lab: false },
      { n: 'Psychology Thesis / Dissertation',      lab: false },
      { n: 'Psychometric Assessment Lab',           lab: true  },
    ],
  },

  // ── Pharmacy ─────────────────────────────────────────────────────
  PHARMACY: {
    1: [
      { n: 'Pharmaceutical Chemistry I',            lab: false },
      { n: 'Pharmacognosy I',                       lab: false },
      { n: 'Human Anatomy & Physiology I',          lab: false },
      { n: 'Pharmaceutical Analysis I',             lab: false },
      { n: 'Remedial Biology / Remedial Maths',     lab: false },
      { n: 'Pharm Chemistry Lab I',                 lab: true  },
    ],
    3: [
      { n: 'Pharmaceutical Chemistry III',          lab: false },
      { n: 'Pharmacognosy & Phytochemistry II',     lab: false },
      { n: 'Pharmacology I',                        lab: false },
      { n: 'Physical Pharmaceutics II',             lab: false },
      { n: 'Pharmaceutical Microbiology',           lab: false },
      { n: 'Pharmacology Lab I',                    lab: true  },
    ],
    5: [
      { n: 'Medicinal Chemistry I',                 lab: false },
      { n: 'Pharmacology III',                      lab: false },
      { n: 'Hospital & Clinical Pharmacy',          lab: false },
      { n: 'Pharmaceutical Jurisprudence',           lab: false },
      { n: 'Industrial Pharmacy I',                 lab: false },
      { n: 'Clinical Pharmacy Lab',                 lab: true  },
    ],
    7: [
      { n: 'Bioavailability & Bioequivalence',      lab: false },
      { n: 'Computer Aided Drug Design',            lab: false },
      { n: 'Advanced Drug Delivery Systems',        lab: false },
      { n: 'Regulatory Affairs in Pharma',          lab: false },
      { n: 'Pharma Project',                        lab: false },
      { n: 'Drug Design Lab',                       lab: true  },
    ],
  },

  // ── Default (catch-all) ──────────────────────────────────────────
  DEFAULT: {
    1: [
      { n: 'Foundation Studies I',                  lab: false },
      { n: 'Applied Mathematics I',                 lab: false },
      { n: 'Core Concepts I',                       lab: false },
      { n: 'Communication Skills',                  lab: false },
      { n: 'Professional Ethics',                   lab: false },
      { n: 'Foundation Lab I',                      lab: true  },
    ],
    3: [
      { n: 'Core Module III-A',                     lab: false },
      { n: 'Applied Systems III-B',                 lab: false },
      { n: 'Analytical Methods',                    lab: false },
      { n: 'Design Thinking',                       lab: false },
      { n: 'Interdisciplinary Studies',             lab: false },
      { n: 'Methods Lab III',                       lab: true  },
    ],
    5: [
      { n: 'Specialisation Module V-A',             lab: false },
      { n: 'Advanced Analysis V-B',                 lab: false },
      { n: 'Research Methodology',                  lab: false },
      { n: 'Professional Practice',                 lab: false },
      { n: 'Elective Subject',                      lab: false },
      { n: 'Advanced Lab V',                        lab: true  },
    ],
    7: [
      { n: 'Strategic Elective VII',                lab: false },
      { n: 'Industry Internship Module',            lab: false },
      { n: 'Innovation Workshop',                   lab: false },
      { n: 'Research Project',                      lab: false },
      { n: 'Final Year Dissertation',               lab: false },
      { n: 'Project Defence Lab',                   lab: true  },
    ],
  },
};

// ──────────── Time Config ────────────────
const ALL_SLOTS = [
  '8:30 am-9:15 am',   '9:20 am-10:05 am',  '10:10 am-10:55 am',
  '11:00 am-11:45 am', '11:50 am-12:35 pm',
  '1:00 pm-1:45 pm',   '1:50 pm-2:35 pm',   '2:40 pm-3:25 pm',
  '3:30 pm-4:15 pm',   '4:20 pm-5:05 pm'
];
const MORNING_SLOTS = ALL_SLOTS.slice(0, 5);  // Sems 1, 7
const EVENING_SLOTS = ALL_SLOTS.slice(5, 10); // Sems 3, 5
const ODD_SEMS = [1, 3, 5, 7];

// ──────────── Helpers ────────────────────
function branchKey(branch) {
  const b = branch.toUpperCase().replace(/\s+/g, '');
  if (SUBJECT_LIBRARY[b]) return b;
  // Partial matches
  if (b.includes('CSE') || b.includes('COMPUTER'))  return 'CSE';
  if (b.includes('IT'))                              return 'IT';
  if (b.includes('ECE') || b.includes('ELECTRON'))  return 'ECE';
  if (b.includes('ME') || b.includes('MECH'))       return 'ME';
  if (b.includes('CE') || b.includes('CIVIL'))      return 'CE';
  if (b.includes('LAW'))                             return 'LAW';
  if (b.includes('JOURNALISM') || b.includes('MASS')) return 'JOURNALISM';
  if (b.includes('BBA'))                             return 'BBA';
  if (b.includes('MBA'))                             return 'MBA';
  if (b.includes('PSYCH'))                           return 'PSYCHOLOGY';
  if (b.includes('PHARM'))                           return 'PHARMACY';
  return 'DEFAULT';
}

// ──────────── Main ───────────────────────
async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Subject  = mongoose.models.Subject  || mongoose.model('Subject',  SubjectSchema);
    const Dept     = mongoose.models.Department || mongoose.model('Department', DeptSchema);
    const User     = mongoose.models.User     || mongoose.model('User',     UserSchema);
    const Room     = mongoose.models.Room     || mongoose.model('Room',     RoomSchema);
    const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);

    const faculty  = await User.find({ role: 'faculty' }).lean();
    const rooms    = await Room.find().lean();
    const classrooms = rooms.filter(r => r.type === 'classroom');
    const labs       = rooms.filter(r => r.type === 'complab');
    const allRooms   = classrooms.length ? classrooms : rooms; // fallback

    if (!faculty.length) throw new Error('No faculty in DB — seed users first!');
    if (!rooms.length)   throw new Error('No rooms in DB — seed rooms first!');

    // ── Step 1: Ensure Management has BBA + MBA ──────────────────
    console.log('\n[1/3] Ensuring BBA & MBA exist under Management schools...');
    const allDepts = await Dept.find().lean();
    const managementSchools = allDepts.filter(d =>
      d.name.toLowerCase().includes('business') ||
      d.name.toLowerCase().includes('management') ||
      d.name.toLowerCase().includes('abs')
    );

    // Collect unique school names from management-like depts
    const mgmtSchoolNames = [...new Set(managementSchools.map(d => d.name))];
    for (const schoolName of mgmtSchoolNames) {
      const schoolInst = managementSchools.find(d => d.name === schoolName)?.institution || 'ABS';
      const hasBBA = allDepts.some(d => d.name === schoolName && d.branch === 'BBA');
      const hasMBA = allDepts.some(d => d.name === schoolName && d.branch === 'MBA');
      if (!hasBBA) {
        await Dept.create({ name: schoolName, branch: 'BBA', institution: schoolInst });
        console.log(`   ✓ Created BBA under "${schoolName}"`);
      }
      if (!hasMBA) {
        await Dept.create({ name: schoolName, branch: 'MBA', institution: schoolInst });
        console.log(`   ✓ Created MBA under "${schoolName}"`);
      }
    }

    // Remove generic 'Management' branches now replaced by BBA/MBA
    await Dept.deleteMany({ branch: { $in: ['Management', 'management'] } });

    // ── Step 2: Seed Subjects ─────────────────────────────────────
    console.log('\n[2/3] Seeding subjects — unique per department × semester...');
    await Subject.deleteMany({});
    await Schedule.deleteMany({ type: 'routine' });

    const finalDepts = await Dept.find().lean();
    const subjectDocs = [];
    let fi = 0; // faculty round-robin index

    for (const dept of finalDepts) {
      const key = branchKey(dept.branch);
      const lib = SUBJECT_LIBRARY[key] || SUBJECT_LIBRARY.DEFAULT;

      for (const sem of ODD_SEMS) {
        const semSubjects = lib[sem] || SUBJECT_LIBRARY.DEFAULT[sem];
        semSubjects.forEach((sub, i) => {
          const fac = faculty[fi % faculty.length];
          fi++;
          const codePrefix = dept.branch.replace(/\s+/g,'').substring(0, 3).toUpperCase();
          subjectDocs.push({
            name: sub.n,
            code: `${codePrefix}${sem}0${i + 1}`,
            departmentId: dept._id,
            semester: sem,
            session: 'odd',
            syllabus: `${dept.branch} | Semester ${sem} | ${sub.n}: Comprehensive study aligned with Amity University Patna Academic Framework 2026-27.`,
            requiredClasses: sub.lab ? 20 : 40,
            assignedFaculty: fac._id,
          });
        });
      }
    }

    const createdSubjects = await Subject.insertMany(subjectDocs);
    console.log(`   ✓ Seeded ${createdSubjects.length} subjects across ${finalDepts.length} departments.`);

    // ── Step 3: Generate Routines ─────────────────────────────────
    console.log('\n[3/3] Generating weekly routine for every department...');

    // Week starting Mon 13-Apr-2026
    const WEEK_DATES = [1, 2, 3, 4, 5].map(d => {
      const dt = new Date('2026-04-13T00:00:00Z');
      dt.setDate(dt.getDate() + d);
      return dt;
    });

    const routineDocs = [];

    for (const dept of finalDepts) {
      for (const sem of ODD_SEMS) {
        const isMorning = [1, 7].includes(sem);
        const slots = isMorning ? MORNING_SLOTS : EVENING_SLOTS;
        const shift  = isMorning ? 'morning' : 'evening';

        const deptSemSubs = createdSubjects.filter(
          s => s.departmentId.toString() === dept._id.toString() && s.semester === sem
        );
        if (!deptSemSubs.length) continue;

        for (const date of WEEK_DATES) {
          for (const slot of slots) {
            // Rotate through subjects to avoid same subject all day
            const sub   = deptSemSubs[Math.floor(Math.random() * deptSemSubs.length)];
            const room  = sub.name.toLowerCase().includes('lab')
              ? (labs.length ? labs[Math.floor(Math.random() * labs.length)] : allRooms[0])
              : allRooms[Math.floor(Math.random() * allRooms.length)];

            routineDocs.push({
              departmentId: dept._id,
              semester: sem,
              date: new Date(date),
              timeSlot: slot,
              shift,
              subjectId: sub._id,
              facultyId: sub.assignedFaculty,
              roomId: room._id,
              type: 'routine',
              status: 'approved',
              isLab: sub.name.toLowerCase().includes('lab'),
            });
          }
        }
      }
    }

    if (routineDocs.length > 0) {
      await Schedule.insertMany(routineDocs);
      console.log(`   ✓ Published ${routineDocs.length} routine entries across ${finalDepts.length} departments.\n`);
    } else {
      console.log('   ⚠ No routine entries generated (check rooms/depts).\n');
    }

    console.log('═══════════════════════════════════════════════');
    console.log('  SEED COMPLETE — All departments populated');
    console.log('═══════════════════════════════════════════════\n');
    process.exit(0);
  } catch (err) {
    console.error('\n✗ SEED FAILED:', err.message);
    console.error(err);
    process.exit(1);
  }
}

run();
