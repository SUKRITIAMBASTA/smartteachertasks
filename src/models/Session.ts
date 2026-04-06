import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISessionDoc extends Document {
  name: string;
  type: 'even' | 'odd';
  startDate: Date;
  endDate: Date;
  holidays: Date[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISessionDoc>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['even', 'odd'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    holidays: [{ type: Date }],
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Session: Model<ISessionDoc> =
  mongoose.models.Session || mongoose.model<ISessionDoc>('Session', SessionSchema);
export default Session;
