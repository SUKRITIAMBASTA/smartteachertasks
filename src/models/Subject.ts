import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubjectDoc extends Document {
  name: string;
  code: string;
  departmentId: mongoose.Types.ObjectId;
  semester: number;
  syllabus: string;
  requiredClasses: number;
  assignedFaculty: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubjectDoc>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    semester: { type: Number, required: true },
    syllabus: { type: String },
    requiredClasses: { type: Number, default: 40 },
    assignedFaculty: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const Subject: Model<ISubjectDoc> =
  mongoose.models.Subject || mongoose.model<ISubjectDoc>('Subject', SubjectSchema);
export default Subject;
