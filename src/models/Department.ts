import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartmentDoc extends Document {
  name: string;
  branch: string;
  shift: 'morning' | 'afternoon';
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartmentDoc>(
  {
    name: { type: String, required: true },
    branch: { type: String, required: true },
    shift: { type: String, enum: ['morning', 'afternoon'], required: true },
  },
  { timestamps: true }
);

const Department: Model<IDepartmentDoc> =
  mongoose.models.Department || mongoose.model<IDepartmentDoc>('Department', DepartmentSchema);
export default Department;
