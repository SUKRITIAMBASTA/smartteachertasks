import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartmentDoc extends Document {
  institution: string; // e.g. ASET, ALS, AIIT
  name: string; // e.g. Computer Science Engineering, Law
  branch: string; // e.g. CSE, AI, IT
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartmentDoc>(
  {
    institution: { type: String, required: true },
    name: { type: String, required: true },
    branch: { type: String, required: true },
  },
  { timestamps: true }
);

const Department: Model<IDepartmentDoc> =
  mongoose.models.Department || mongoose.model<IDepartmentDoc>('Department', DepartmentSchema);
export default Department;
