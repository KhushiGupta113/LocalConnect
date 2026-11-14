import mongoose, { Document, Schema } from 'mongoose';
import type { DiscoverHub } from './Group.js';

export interface IEvent extends Document {
  title: string;
  when: string;
  date?: Date;
  summary?: string;
  note: string;
  miles: number;
  goingCount: number;
  hub: DiscoverHub;
  featured: boolean;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    when: { type: String, required: true },
    date: { type: Date },
    summary: { type: String },
    note: { type: String, default: '' },
    miles: { type: Number, default: 1.0 },
    goingCount: { type: Number, default: 0 },
    hub: {
      type: String,
      enum: ['civic', 'market', 'skills', 'pets', 'events'],
      required: true,
      index: true,
    },
    featured: { type: Boolean, default: false },
    location: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        ret.id = ret._id.toString();
        ret.going = ret.goingCount;
        return ret;
      },
    },
  }
);

export const Event = mongoose.model<IEvent>('Event', eventSchema);

