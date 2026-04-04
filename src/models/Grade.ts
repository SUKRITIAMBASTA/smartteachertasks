import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGradeCriterion {
  criterionName: string;
  score: number;
}

export interface IGradeDoc extends Document {
  studentName: string;
  studentId: string;
  rubricId: mongoose.Types.ObjectId;
  scores: IGradeCriterion[];
  totalScore: number;
  maxTotalScore: number;
  feedback: string;
  gradedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema = new Schema<IGradeDoc>(
  {
    studentName: { type: String, required: true, trim: true },
    studentId: { type: String, default: '' },
    rubricId: { type: Schema.Types.ObjectId, ref: 'Rubric', required: true },
    scores: [
      {
        criterionName: { type: String, required: true },
        score: { type: Number, required: true, default: 0, min: 0 },
      },
    ],
    totalScore: { type: Number, required: true, default: 0 },
    maxTotalScore: { type: Number, required: true, default: 0 },
    feedback: { type: String, default: '' },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Grade: Model<IGradeDoc> = mongoose.models.Grade || mongoose.model<IGradeDoc>('Grade', GradeSchema);
export default Grade;
