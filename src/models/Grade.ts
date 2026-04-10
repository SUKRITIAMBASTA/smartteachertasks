import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGradeDoc extends Document {
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;

  // Internal Marks (Total 40)
  attendanceMarks: number;    // 0–5
  assignmentMarks: number;    // 0–5
  midSemMarks: number;        // 0–10
  internalVivaMarks: number;  // 0–10
  externalVivaMarks: number;  // 0–10

  // External Marks (Total 60)
  endSemMarks: number;        // 0–60

  // Computed
  totalMarks: number;
  grade: string;

  gradedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema = new Schema<IGradeDoc>(
  {
    student:  { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    subject:  { type: Schema.Types.ObjectId, ref: 'Subject', required: true },

    attendanceMarks:   { type: Number, default: 0, min: 0, max: 5  },
    assignmentMarks:   { type: Number, default: 0, min: 0, max: 5  },
    midSemMarks:       { type: Number, default: 0, min: 0, max: 10 },
    internalVivaMarks: { type: Number, default: 0, min: 0, max: 10 },
    externalVivaMarks: { type: Number, default: 0, min: 0, max: 10 },
    endSemMarks:       { type: Number, default: 0, min: 0, max: 60 },

    totalMarks: { type: Number, default: 0 },
    grade:      { type: String, default: 'F' },

    gradedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Helper — reusable from both pre-save hook and controller
export function computeGrade(doc: Partial<IGradeDoc>): { totalMarks: number; grade: string } {
  const totalMarks =
    (doc.attendanceMarks   || 0) +
    (doc.assignmentMarks   || 0) +
    (doc.midSemMarks       || 0) +
    (doc.internalVivaMarks || 0) +
    (doc.externalVivaMarks || 0) +
    (doc.endSemMarks       || 0);

  let grade = 'F';
  if      (totalMarks > 90) grade = 'A+';
  else if (totalMarks > 80) grade = 'A';
  else if (totalMarks > 70) grade = 'B';
  else if (totalMarks > 60) grade = 'C';
  else if (totalMarks > 50) grade = 'D';
  else if (totalMarks > 40) grade = 'E';

  return { totalMarks, grade };
}

// Use a virtual to avoid the Mongoose pre('save') type conflict in this TS version
GradeSchema.pre<IGradeDoc>('validate', function () {
  const { totalMarks, grade } = computeGrade(this);
  this.totalMarks = totalMarks;
  this.grade      = grade;
});

const Grade: Model<IGradeDoc> =
  mongoose.models.Grade || mongoose.model<IGradeDoc>('Grade', GradeSchema);
export default Grade;
