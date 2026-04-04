import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function getAllUsers() {
  await dbConnect();
  return User.find().sort({ createdAt: -1 }).lean();
}

export async function createUser(data: { name: string; email: string; password: string; role: string; department: string }) {
  await dbConnect();
  const hashed = await bcrypt.hash(data.password, 12);
  const user = await User.create({ ...data, password: hashed });
  const obj = user.toObject();
  delete (obj as any).password;
  return obj;
}

export async function deleteUser(id: string) {
  await dbConnect();
  return User.findByIdAndDelete(id).lean();
}

export async function getUserStats() {
  await dbConnect();
  const [total, admins, faculty, students] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'faculty' }),
    User.countDocuments({ role: 'student' }),
  ]);
  return { total, admins, faculty, students };
}
