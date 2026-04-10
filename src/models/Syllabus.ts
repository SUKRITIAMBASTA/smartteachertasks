import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExperiment {
  no: number;
  title: string;
  description: string;
}

export interface IModule {
  unitNo: number;
  title: string;
  topics: string[];
  hours: number;
}

export interface ISyllabusDoc extends Document {
  subjectId:    mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  semester:     number;
  createdBy:    mongoose.Types.ObjectId;

  // Overview
  courseDescription: string;
  creditHours:       number;

  // Pedagogy
  pedagogy: string;

  // Professional Skill Development Activities
  psda: string[];

  // Units / Modules
  modules: IModule[];

  // Lab Experiments
  mandatoryExperiments: IExperiment[];
  optionalExperiments:  IExperiment[];

  // References
  textbooks:  string[];
  references: string[];

  approvalStatus: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const ExperimentSchema = new Schema<IExperiment>(
  {
    no:          { type: Number, required: true },
    title:       { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const ModuleSchema = new Schema<IModule>(
  {
    unitNo: { type: Number, required: true },
    title:  { type: String, required: true },
    topics: [{ type: String }],
    hours:  { type: Number, default: 10 },
  },
  { _id: false }
);

const SyllabusSchema = new Schema<ISyllabusDoc>(
  {
    subjectId:    { type: Schema.Types.ObjectId, ref: 'Subject',    required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    semester:     { type: Number, required: true },
    createdBy:    { type: Schema.Types.ObjectId, ref: 'User',       required: true },

    courseDescription: { type: String, default: '' },
    creditHours:       { type: Number, default: 3  },

    pedagogy: { type: String, default: '' },
    psda:     [{ type: String }],

    modules:              [ModuleSchema],
    mandatoryExperiments: [ExperimentSchema],
    optionalExperiments:  [ExperimentSchema],

    textbooks:  [{ type: String }],
    references: [{ type: String }],

    approvalStatus: { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  { timestamps: true }
);

// One syllabus per subject
SyllabusSchema.index({ subjectId: 1 }, { unique: true });

const Syllabus: Model<ISyllabusDoc> =
  mongoose.models.Syllabus || mongoose.model<ISyllabusDoc>('Syllabus', SyllabusSchema);
export default Syllabus;
