import mongoose, { Document, Schema } from 'mongoose';

export interface ICommentLike extends Document {
  user: mongoose.Types.ObjectId;
  comment: mongoose.Types.ObjectId;
  createdAt: Date;
}

const commentLikeSchema = new Schema<ICommentLike>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

commentLikeSchema.index({ user: 1, comment: 1 }, { unique: true });

export const CommentLike = mongoose.model<ICommentLike>('CommentLike', commentLikeSchema);

