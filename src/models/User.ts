import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssignedSubject {
  name: string;
  semester: number;
}

export interface IUserDoc extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'faculty' | 'student';
  institution: string; // e.g. ASET, ALS, ABS
  departmentId: mongoose.Types.ObjectId; // Reference to Department
  semester: number;
  shift: 'morning' | 'evening';
  assignedSubjects: IAssignedSubject[]; // For faculty teaching roles
  avatar: string;
  idDocumentUrl: string; // URL to verification document
  isVerified: boolean;
  idPending: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'faculty', 'student'], default: 'student' },
    institution: { type: String, default: 'General' },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    semester: { type: Number, default: 1 },
    shift: { type: String, enum: ['morning', 'evening'], default: 'morning' },
    assignedSubjects: [
      {
        name: { type: String },
        semester: { type: Number }
      }
    ],
    avatar: { type: String, default: '' },
    idDocumentUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    idPending: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User: Model<IUserDoc> = mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
export default User;
