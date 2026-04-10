import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function getAllUsers(filters: any = {}, page: number = 1, limit: number = 10) {
  await dbConnect();
  const skip = (page - 1) * limit;
  
  const query: any = {};
  if (filters.role) query.role = filters.role;
  if (filters.institution) query.institution = filters.institution;
  if (filters.departmentId) query.departmentId = filters.departmentId;
  if (filters.idPending === 'true') query.idPending = true;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .populate('departmentId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
  const total = await User.countDocuments(query);
  
  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createUser(data: { name: string; email: string; password: string; role: string; institution: string; departmentId?: string; shift: string; semester: number; idDocumentUrl?: string }) {
  await dbConnect();
  const hashed = await bcrypt.hash(data.password, 12);
  const idPending = !data.idDocumentUrl;
  const user = await User.create({ ...data, password: hashed, idPending });
  const obj = user.toObject();
  delete (obj as any).password;
  return obj;
}

export async function updateUser(id: string, data: Partial<{ name: string; role: string; institution: string; departmentId: string; shift: string; semester: number }>) {
  await dbConnect();
  // We only allow updating specific fields for now
  const allowed = ['name', 'role', 'institution', 'departmentId', 'shift', 'semester', 'idDocumentUrl', 'isVerified'];
  const update: any = {};
  Object.keys(data).forEach(key => {
    if (allowed.includes(key)) {
      update[key] = (data as any)[key];
    }
  });

  // Business logic: if verified is true, pending must be false
  if (update.isVerified !== undefined) {
    update.idPending = !update.isVerified;
  } else if (update.idDocumentUrl !== undefined) {
    // If we only updated the document, it's still pending until verified
    update.idPending = true; 
  }

  return User.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
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
