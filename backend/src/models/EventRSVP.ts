import mongoose, { Document, Schema } from 'mongoose';

export interface IEventRSVP extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  createdAt: Date;
}

const eventRSVPSchema = new Schema<IEventRSVP>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

eventRSVPSchema.index({ user: 1, event: 1 }, { unique: true });

export const EventRSVP = mongoose.model<IEventRSVP>('EventRSVP', eventRSVPSchema);

