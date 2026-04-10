import { config } from 'dotenv';
config({ path: '.env.local' });
import mongoose from 'mongoose';
import User from '../models/User';
import dbConnect from '../lib/db';

async function update() {
  await dbConnect();
  const res = await User.findOneAndUpdate(
    { email: 'student@gmail.com' },
    { semester: 1 },
    { new: true }
  );
  if (res) {
    console.log('✅ Updated student@gmail.com to Semester 1');
    console.log('Current Semester:', res.semester);
  } else {
    console.log('❌ student@gmail.com not found');
  }
  process.exit(0);
}

update().catch(err => {
    console.error(err);
    process.exit(1);
});
