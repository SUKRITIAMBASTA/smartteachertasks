import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuizResultDoc extends Document {
  studentId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  score: number;
  totalQuestions: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  completedAt: Date;
}

const QuizResultSchema = new Schema<IQuizResultDoc>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  },
  { timestamps: true }
);

const QuizResult: Model<IQuizResultDoc> =
  mongoose.models.QuizResult || mongoose.model<IQuizResultDoc>('QuizResult', QuizResultSchema);
export default QuizResult;
