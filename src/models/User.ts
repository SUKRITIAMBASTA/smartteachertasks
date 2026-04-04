import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserDoc extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'faculty' | 'student';
  department: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'faculty', 'student'], default: 'student' },
    department: { type: String, default: '' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

const User: Model<IUserDoc> = mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
export default User;
