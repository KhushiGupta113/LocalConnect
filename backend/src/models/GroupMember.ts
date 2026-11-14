import mongoose, { Document, Schema } from 'mongoose';

export interface IGroupMember extends Document {
  user: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  createdAt: Date;
}

const groupMemberSchema = new Schema<IGroupMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

groupMemberSchema.index({ user: 1, group: 1 }, { unique: true });

export const GroupMember = mongoose.model<IGroupMember>('GroupMember', groupMemberSchema);

