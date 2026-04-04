import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendanceDoc extends Document {
  studentId: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late';
  session: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendanceDoc>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
    session: { type: String, default: 'General' },
  },
  { timestamps: true }
);

const Attendance: Model<IAttendanceDoc> = mongoose.models.Attendance || mongoose.model<IAttendanceDoc>('Attendance', AttendanceSchema);
export default Attendance;
