import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncementDoc extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  targetRoles: string[];
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncementDoc>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetRoles: [{ type: String, enum: ['admin', 'faculty', 'student'] }],
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Announcement: Model<IAnnouncementDoc> =
  mongoose.models.Announcement || mongoose.model<IAnnouncementDoc>('Announcement', AnnouncementSchema);
export default Announcement;
