import mongoose, { Document, Schema } from 'mongoose';

export type DiscoverHub = 'civic' | 'market' | 'skills' | 'pets' | 'events';

export interface IGroup extends Document {
  name: string;
  summary: string;
  activity: string;
  hub: DiscoverHub;
  miles: number;
  membersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    summary: { type: String, required: true },
    activity: { type: String, default: 'Active' },
    hub: {
      type: String,
      enum: ['civic', 'market', 'skills', 'pets', 'events'],
      required: true,
      index: true,
    },
    miles: { type: Number, default: 1.0 },
    membersCount: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

export const Group = mongoose.model<IGroup>('Group', groupSchema);

