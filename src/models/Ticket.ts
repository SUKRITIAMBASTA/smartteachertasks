import mongoose, { Schema, Document, Model } from 'mongoose';

const CommentSchema = new Schema(
  {
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export interface ITicketDoc extends Document {
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  comments: { text: string; author: mongoose.Types.ObjectId; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicketDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['technical', 'academic', 'administrative', 'infrastructure', 'other'],
      default: 'other',
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    comments: [CommentSchema],
  },
  { timestamps: true }
);

const Ticket: Model<ITicketDoc> = mongoose.models.Ticket || mongoose.model<ITicketDoc>('Ticket', TicketSchema);
export default Ticket;
