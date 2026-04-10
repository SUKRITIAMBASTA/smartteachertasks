import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILessonPlanDoc extends Document {
  subject: string;
  topic: string;
  duration: string;
  semester: number;
  subjectId?: mongoose.Types.ObjectId;
  objectives: string[];
  activities?: { time: string; description: string }[];
  assessment: string;
  weekSummary?: string;
  
  // 📅 New Full-Semester Structure
  weeks?: {
    weekNo:     number;
    moduleNo:   number; // 🏷️ Link to Syllabus Module/Unit
    topic:      string;
    objectives: string[];
    days: [
      {
        dayNo:       number;
        title:       string;
        description: string;
      }
    ];
    summary:    string;
  }[];

  modules?: {
    moduleNo:  number;
    title:     string;
    summary:   string;
    duration:  string;
  }[];

  months?: {
    monthNo:   number;
    title:     string;
    summary:   string;
    weekRange: string;
  }[];

  syllabusContext?: string;
  flaggedByAi: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LessonPlanSchema = new Schema<ILessonPlanDoc>(
  {
    subject:   { type: String, required: true, trim: true },
    topic:     { type: String, required: true, trim: true },
    duration:  { type: String, required: true },
    semester:  { type: Number, default: 1 },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    objectives: [{ type: String }],
    activities: [
      {
        time:        { type: String },
        description: { type: String },
      },
    ],
    // 📅 15-WEEK STRUCTURE (Semester-long)
    weeks: [
      {
        weekNo:     Number,
        moduleNo:   Number, // 🏷️ Link to Unit
        topic:      String,
        objectives: [{ type: String }],
        days:       [{ type: String }], // 🚀 Hyper-Compressed Format (Array of Strings)
        summary:    String,
      }
    ],
    modules: [
      {
        moduleNo:  Number,
        title:     String,
        summary:   String,
        duration:  String,
      }
    ],
    months: [
      {
        monthNo:  Number,
        title:    String, // Phase title
        summary:  String, // Mid-term goals, etc.
        weekRange: String, // e.g. "Weeks 1-4"
      }
    ],
    assessment:     { type: String, required: true },
    weekSummary:    { type: String, default: '' },
    syllabusContext:{ type: String, default: '' },
    flaggedByAi:    { type: Boolean, default: false },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdBy:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const LessonPlan: Model<ILessonPlanDoc> =
  mongoose.models.LessonPlan || mongoose.model<ILessonPlanDoc>('LessonPlan', LessonPlanSchema);
export default LessonPlan;
