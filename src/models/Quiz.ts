import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface IQuizDoc extends Document {
  title: string;
  description?: string;
  departmentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  semester: number;
  moduleName: string;
  moduleId: string;
  createdBy: mongoose.Types.ObjectId;
  levels: {
    easy: IQuestion[];
    medium: IQuestion[];
    hard: IQuestion[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String },
});

const QuizSchema = new Schema<IQuizDoc>(
  {
    title: { type: String, required: true },
    description: { type: String },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    semester: { type: Number, required: true },
    moduleName: { type: String, required: true },
    moduleId: { type: String, default: '1' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    levels: {
      easy: [QuestionSchema],
      medium: [QuestionSchema],
      hard: [QuestionSchema],
    },
  },
  { timestamps: true }
);

const Quiz: Model<IQuizDoc> = mongoose.models.Quiz || mongoose.model<IQuizDoc>('Quiz', QuizSchema);
export default Quiz;
