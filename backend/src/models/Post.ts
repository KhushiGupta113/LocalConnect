import mongoose, { Document, Schema } from 'mongoose';

export type PostCategory =
  | 'general'
  | 'alerts'
  | 'events'
  | 'lost'
  | 'recommendations'
  | 'sale';

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  authorName: string;
  authorMeta?: string;
  authorKind: 'organization' | 'photo' | 'initials';
  initials?: string;
  verified?: boolean;
  body: string;
  category: PostCategory;
  accent?: boolean;
  badge?: {
    label: string;
    tone: 'danger' | 'primary';
    icon: 'alert' | 'calendar';
  };
  attachment?: {
    title: string;
    meta: string;
  };
  image?: string;
  imageLabel?: string;
  photos?: string[];
  recommendation?: {
    author: string;
    business: string;
    quote: string;
  };
  poll?: string;
  appreciationCount: number;
  commentsCount: number;
  shares: number;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorName: { type: String, required: true },
    authorMeta: { type: String },
    authorKind: {
      type: String,
      enum: ['organization', 'photo', 'initials'],
      default: 'photo',
    },
    initials: { type: String },
    verified: { type: Boolean, default: false },
    body: { type: String, required: true, maxlength: 500 },
    category: {
      type: String,
      enum: ['general', 'alerts', 'events', 'lost', 'recommendations', 'sale'],
      required: true,
      index: true,
    },
    accent: { type: Boolean, default: false },
    badge: {
      label: { type: String },
      tone: { type: String, enum: ['danger', 'primary'] },
      icon: { type: String, enum: ['alert', 'calendar'] },
    },
    attachment: {
      title: { type: String },
      meta: { type: String },
    },
    image: { type: String },
    imageLabel: { type: String },
    photos: [{ type: String }],
    recommendation: {
      author: { type: String },
      business: { type: String },
      quote: { type: String },
    },
    poll: { type: String },
    appreciationCount: { type: Number, default: 0, index: true },
    commentsCount: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    location: { type: String, required: true, index: true },
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

export const Post = mongoose.model<IPost>('Post', postSchema);

