import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILessonPlanDoc extends Document {
  subject: string;
  topic: string;
  duration: string;
  objectives: string[];
  activities: { time: string; description: string }[];
  assessment: string;
  flaggedByAi: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LessonPlanSchema = new Schema<ILessonPlanDoc>(
  {
    subject: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    duration: { type: String, required: true },
    objectives: [{ type: String }],
    activities: [
      {
        time: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    assessment: { type: String, required: true },
    flaggedByAi: { type: Boolean, default: false },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const LessonPlan: Model<ILessonPlanDoc> =
  mongoose.models.LessonPlan || mongoose.model<ILessonPlanDoc>('LessonPlan', LessonPlanSchema);
export default LessonPlan;
