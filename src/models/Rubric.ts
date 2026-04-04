import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRubricCriterion {
  name: string;
  maxMarks: number;
}

export interface IRubricDoc extends Document {
  title: string;
  description: string;
  criteria: IRubricCriterion[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RubricSchema = new Schema<IRubricDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    criteria: [
      {
        name: { type: String, required: true },
        maxMarks: { type: Number, required: true, min: 0 },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Rubric: Model<IRubricDoc> = mongoose.models.Rubric || mongoose.model<IRubricDoc>('Rubric', RubricSchema);
export default Rubric;
