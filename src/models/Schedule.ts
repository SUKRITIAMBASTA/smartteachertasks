import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScheduleDoc extends Document {
  departmentId: mongoose.Types.ObjectId;
  semester: number;
  date: Date;
  timeSlot: string; // e.g., "08:30-09:10"
  shift: 'morning' | 'evening';
  subjectId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  isLab: boolean;
  type: 'routine' | 'midsem' | 'endsem';
  status: 'pending_approval' | 'approved' | 'adjusted';
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<IScheduleDoc>(
  {
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    semester: { type: Number, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    shift: { type: String, enum: ['morning', 'evening'], default: 'morning' },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    isLab: { type: Boolean, default: false },
    type: { type: String, enum: ['routine', 'midsem', 'endsem'], default: 'routine' },
    status: { type: String, enum: ['pending_approval', 'approved', 'adjusted'], default: 'pending_approval' },
  },
  { timestamps: true }
);

const Schedule: Model<IScheduleDoc> =
  mongoose.models.Schedule || mongoose.model<IScheduleDoc>('Schedule', ScheduleSchema);
export default Schedule;
