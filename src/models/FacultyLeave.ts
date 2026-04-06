import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFacultyLeaveDoc extends Document {
  facultyId: mongoose.Types.ObjectId;
  date: Date;
  status: 'pending' | 'approved';
  createdAt: Date;
  updatedAt: Date;
}

const FacultyLeaveSchema = new Schema<IFacultyLeaveDoc>(
  {
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  },
  { timestamps: true }
);

const FacultyLeave: Model<IFacultyLeaveDoc> =
  mongoose.models.FacultyLeave || mongoose.model<IFacultyLeaveDoc>('FacultyLeave', FacultyLeaveSchema);
export default FacultyLeave;
