import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { Comment } from '../models/Comment.js';
import { CommentLike } from '../models/CommentLike.js';
import { Notification } from '../models/Notification.js';
import { Post } from '../models/Post.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { formatTimeLabel } from '../utils/timeLabel.js';

export async function getComments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId }).sort({ createdAt: 1 });

    let likedIds = new Set<string>();
    if (req.user) {
      const commentLikes = await CommentLike.find({
        user: req.user._id,
        comment: { $in: comments.map((c) => c._id) },
      });
      likedIds = new Set(commentLikes.map((cl) => cl.comment.toString()));
    }

    const currentUserId = req.user?._id.toString();

    const formatted = comments.map((c) => {
      const id = c._id.toString();
      const isAuthor = Boolean(currentUserId && c.author.toString() === currentUserId);
      return {
        id,
        postId: c.post.toString(),
        authorName: isAuthor && req.user ? req.user.fullName : c.authorName,
        authorMeta: c.authorMeta,
        body: c.body,
        timeLabel: formatTimeLabel(c.createdAt),
        likes: c.likesCount,
        liked: likedIds.has(id),
        parentId: c.parentId ? c.parentId.toString() : undefined,
        isAuthor,
      };
    });

    sendSuccess(res, formatted);
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching comments', 500);
  }
}

export async function createComment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Sign in before commenting.', 401);
      return;
    }

    const { postId } = req.params;
    const { body, parentId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      sendError(res, 'Post not found', 404);
      return;
    }

    const newComment = await Comment.create({
      post: post._id,
      author: user._id,
      authorName: user.fullName,
      authorMeta: user.neighborhood,
      body: body.trim(),
      parentId: parentId || null,
      likesCount: 0,
    });

    post.commentsCount += 1;
    await post.save();

    // Trigger notification if commenting on another user's post
    if (!post.author.equals(user._id)) {
      await Notification.create({
        recipient: post.author,
        sender: user._id,
        kind: 'comment',
        title: user.fullName,
        body: `${user.fullName} commented on your update.`,
        post: post._id,
        preview: body.trim().slice(0, 100),
        unread: true,
      });
    }

    const formatted = {
      id: newComment._id.toString(),
      postId: post._id.toString(),
      authorName: user.fullName,
      authorMeta: user.neighborhood,
      body: newComment.body,
      timeLabel: 'Just now',
      likes: 0,
      liked: false,
      parentId: newComment.parentId ? newComment.parentId.toString() : undefined,
      isAuthor: true,
    };

    sendSuccess(res, formatted, 'Comment added successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Error adding comment', 500);
  }
}

export async function toggleCommentLike(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) {
      sendError(res, 'Comment not found', 404);
      return;
    }

    const existingLike = await CommentLike.findOne({ user: user._id, comment: comment._id });
    let liked = false;

    if (existingLike) {
      await existingLike.deleteOne();
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      await CommentLike.create({ user: user._id, comment: comment._id });
      comment.likesCount += 1;
      liked = true;
    }

    await comment.save();
    sendSuccess(res, { liked, likes: comment.likesCount });
  } catch (error: any) {
    sendError(res, error.message || 'Error liking comment', 500);
  }
}

