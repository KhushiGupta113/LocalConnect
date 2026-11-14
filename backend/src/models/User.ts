import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  neighborhood: string;
  neighborhoodDetail: string;
  handle: string;
  bio: string;
  role: string;
  street: string;
  photoUri?: string;
  neighborCount: number;
  followingCount: number;
  streetPrivate: boolean;
  showContact: boolean;
  urgentAlerts: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    neighborhood: { type: String, required: true, trim: true, index: true },
    neighborhoodDetail: { type: String, default: '' },
    handle: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    bio: { type: String, maxlength: 200, default: '' },
    role: { type: String, default: 'Resident' },
    street: { type: String, default: '' },
    photoUri: { type: String },
    neighborCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    streetPrivate: { type: Boolean, default: true },
    showContact: { type: Boolean, default: true },
    urgentAlerts: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>('User', userSchema);

