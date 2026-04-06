import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSettingDoc extends Document {
  gradingScale: string;
  baseRubricPrompt: string;
  minAttendanceThreshold: number;
  failingGradeThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSettingDoc>(
  {
    gradingScale: { type: String, default: 'Percentage (0 - 100%)' },
    baseRubricPrompt: { type: String, default: 'You are an expert college professor designing a lesson plan...' },
    minAttendanceThreshold: { type: Number, default: 75 },
    failingGradeThreshold: { type: Number, default: 40 },
  },
  { timestamps: true }
);

const SystemSetting: Model<ISystemSettingDoc> =
  mongoose.models.SystemSetting || mongoose.model<ISystemSettingDoc>('SystemSetting', SystemSettingSchema);
export default SystemSetting;
