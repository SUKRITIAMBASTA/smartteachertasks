import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReportDoc extends Document {
  targetId: string;
  targetType: 'comment' | 'ticket' | 'lesson' | 'resource';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReportDoc>(
  {
    targetId: { type: String, required: true },
    targetType: { type: String, enum: ['comment', 'ticket', 'lesson', 'resource'], required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  },
  { timestamps: true }
);

const Report: Model<IReportDoc> =
  mongoose.models.Report || mongoose.model<IReportDoc>('Report', ReportSchema);
export default Report;
