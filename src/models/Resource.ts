import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResourceDoc extends Document {
  title: string;
  description: string;
  url: string;
  fileType: string;
  fileName: string;
  fileSize: string;
  course: string;
  semester: number;
  publicId?: string;
  resourceType?: string;
  departmentId?: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  tags: string[];
  category: 'Lecture Notes' | 'Syllabus' | 'Reference Material' | 'Class Timetable' | 'Exam Schedule - Mid Sem' | 'Exam Schedule - End Sem' | 'Other';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResourceDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    url: { type: String, required: true },
    fileType: { type: String, default: 'document' },
    fileName: { type: String, default: '' },
    fileSize: { type: String, default: '' },
    course: { type: String, default: 'General' },
    semester: { type: Number, default: 1 },
    publicId: { type: String },
    resourceType: { type: String, default: 'raw' },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { 
      type: String, 
      enum: ['Lecture Notes', 'Syllabus', 'Reference Material', 'Class Timetable', 'Exam Schedule - Mid Sem', 'Exam Schedule - End Sem', 'Other'],
      default: 'Other'
    },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Resource: Model<IResourceDoc> =
  mongoose.models.Resource || mongoose.model<IResourceDoc>('Resource', ResourceSchema);
export default Resource;
