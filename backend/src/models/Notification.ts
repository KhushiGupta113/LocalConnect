import mongoose, { Document, Schema } from 'mongoose';

export type NotificationKind = 'alert' | 'like' | 'comment' | 'community' | 'event';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  kind: NotificationKind;
  title: string;
  body: string;
  unread: boolean;
  post?: mongoose.Types.ObjectId;
  preview?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    kind: {
      type: String,
      enum: ['alert', 'like', 'comment', 'community', 'event'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    unread: { type: Boolean, default: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    preview: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        ret.id = ret._id.toString();
        ret.postId = ret.post ? ret.post.toString() : undefined;
        return ret;
      },
    },
  }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);

