import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoomDoc extends Document {
  roomNo: string;
  type: 'classroom' | 'complab';
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoomDoc>(
  {
    roomNo: { type: String, required: true },
    type: { type: String, enum: ['classroom', 'complab'], required: true },
    capacity: { type: Number, default: 60 },
  },
  { timestamps: true }
);

const Room: Model<IRoomDoc> =
  mongoose.models.Room || mongoose.model<IRoomDoc>('Room', RoomSchema);
export default Room;
