import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGradeDoc extends Document {
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  
  // Internal Marks (Total 40)
  attendanceMarks: number;    // 0-5
  assignmentMarks: number;    // 0-5 (Lab Record/Assignment)
  midSemMarks: number;        // 0-10
  internalVivaMarks: number;   // 0-10
  externalVivaMarks: number;   // 0-10 (Viva taken by external, but counts in internal 40 part of the sheet)
  
  // External Marks (Total 60)
  endSemMarks: number;        // 0-60
  
  // Computed
  totalMarks: number;         // sum of all above (0-100)
  grade: string;              // A+, A, B, etc.
  
  gradedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema = new Schema<IGradeDoc>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    
    attendanceMarks: { type: Number, default: 0, min: 0, max: 5 },
    assignmentMarks: { type: Number, default: 0, min: 0, max: 5 },
    midSemMarks: { type: Number, default: 0, min: 0, max: 10 },
    internalVivaMarks: { type: Number, default: 0, min: 0, max: 10 },
    externalVivaMarks: { type: Number, default: 0, min: 0, max: 10 },
    
    endSemMarks: { type: Number, default: 0, min: 0, max: 60 },
    
    totalMarks: { type: Number, default: 0 },
    grade: { type: String, default: 'F' },
    
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Pre-save hook to calculate total and grade
GradeSchema.pre('save', function(next) {
  this.totalMarks = 
    (this.attendanceMarks || 0) + 
    (this.assignmentMarks || 0) + 
    (this.midSemMarks || 0) + 
    (this.internalVivaMarks || 0) + 
    (this.externalVivaMarks || 0) + 
    (this.endSemMarks || 0);

  const t = this.totalMarks;
  if (t > 90) this.grade = 'A+';
  else if (t > 80) this.grade = 'A';
  else if (t > 70) this.grade = 'B';
  else if (t > 60) this.grade = 'C';
  else if (t > 50) this.grade = 'D';
  else if (t > 40) this.grade = 'E';
  else this.grade = 'F';

  next();
});

const Grade: Model<IGradeDoc> = mongoose.models.Grade || mongoose.model<IGradeDoc>('Grade', GradeSchema);
export default Grade;
