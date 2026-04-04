import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResourceDoc extends Document {
  title: string;
  description: string;
  url: string;
  fileType: string;
  fileName: string;
  fileSize: string;
  course: string;
  cloudinaryId?: string;
  uploadedBy: mongoose.Types.ObjectId;
  tags: string[];
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
    cloudinaryId: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Resource: Model<IResourceDoc> =
  mongoose.models.Resource || mongoose.model<IResourceDoc>('Resource', ResourceSchema);
export default Resource;
