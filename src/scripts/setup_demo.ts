import { config } from 'dotenv';
config({ path: '.env.local' });
import mongoose from 'mongoose';
import User from '../models/User';
import Subject from '../models/Subject';
import Quiz from '../models/Quiz';

async function setupDemo() {
  // Use dynamic import for dbConnect to ensure env is ready
  const dbConnect = (await import('../lib/db')).default;
  await dbConnect();
  console.log('Connected to MongoDB');

  // 1. Update Student
  const student = await User.findOneAndUpdate(
    { email: 'student@gmail.com' },
    { semester: 1 },
    { new: true }
  );
  if (student) {
    console.log('✅ Updated student@gmail.com to Semester 1');
  }

  // 2. Ensure S1 Quiz exists by faculty@gmail.com
  const faculty = await User.findOne({ email: 'faculty@gmail.com' });
  if (!faculty) {
    console.log('❌ faculty@gmail.com not found');
    process.exit(1);
  }

  const subject = await Subject.findOne({ name: 'DBMS', semester: 1 });
  if (!subject) {
    console.log('❌ DBMS Sem 1 subject not found');
    process.exit(1);
  }

  const existingQuiz = await Quiz.findOne({ subjectId: subject._id, createdBy: faculty._id });
  if (!existingQuiz) {
    console.log('Creating demo quiz for DBMS S1...');
    await Quiz.create({
      title: 'DBMS — Introduction to SQL (S1 Demo)',
      description: 'Foundational assessment for Semester 1 DBMS students.',
      departmentId: subject.departmentId,
      subjectId: subject._id,
      semester: 1,
      moduleName: 'Introduction to SQL',
      moduleId: '1',
      createdBy: faculty._id,
      levels: {
        easy: [
          { text: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Queue List', 'System Query Logic', 'Standard Query Level'], correctIndex: 0, explanation: 'SQL is the standard language for relational databases.' }
        ],
        medium: [
          { text: 'Which command is used to remove all records from a table without deleting the structure?', options: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'], correctIndex: 2, explanation: 'TRUNCATE resets the table while keeping the schema.' }
        ],
        hard: [
          { text: 'Which property ensures that a transaction is all or nothing?', options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], correctIndex: 0, explanation: 'Atomicity ensures that a transaction is treated as a single unit.' }
        ]
      }
    });
    console.log('✅ Created DBMS Semester 1 Demo Quiz');
  } else {
    console.log('✅ DBMS Semester 1 Quiz already exists');
  }

  console.log('Demo setup complete!');
  process.exit(0);
}

setupDemo().catch(err => {
  console.error(err);
  process.exit(1);
});
