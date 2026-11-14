import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  authorName: string;
  authorMeta: string;
  body: string;
  parentId?: mongoose.Types.ObjectId;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorMeta: { type: String, required: true },
    body: { type: String, required: true, maxlength: 300 },
    parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    likesCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        ret.id = ret._id.toString();
        ret.postId = ret.post ? ret.post.toString() : undefined;
        ret.parentId = ret.parentId ? ret.parentId.toString() : undefined;
        return ret;
      },
    },
  }
);

export const Comment = mongoose.model<IComment>('Comment', commentSchema);

