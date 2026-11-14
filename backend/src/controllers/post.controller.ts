import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { Bookmark } from '../models/Bookmark.js';
import { Like } from '../models/Like.js';
import { Post, type IPost } from '../models/Post.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { formatTimeLabel } from '../utils/timeLabel.js';

function serializePost(
  post: any,
  viewerUserId?: string,
  likedPostIds = new Set<string>(),
  savedPostIds = new Set<string>()
) {
  const postId = post._id.toString();
  const authorId = post.author?._id ? post.author._id.toString() : post.author?.toString();
  const isLiked = likedPostIds.has(postId);
  const isSaved = savedPostIds.has(postId);
  const isViewerOwned = Boolean(viewerUserId && authorId === viewerUserId);

  const authorPhoto = post.author?.photoUri || post.photoUri;

  return {
    id: postId,
    authorName: isViewerOwned && post.author?.fullName ? post.author.fullName : post.authorName,
    authorMeta: post.authorMeta,
    authorKind: post.authorKind || 'photo',
    initials: post.initials,
    photo: authorPhoto ? { uri: authorPhoto } : undefined,
    verified: post.verified,
    timeLabel: formatTimeLabel(post.createdAt),
    sortIndex: -new Date(post.createdAt).getTime(),
    badge: post.badge,
    body: post.body,
    category: post.category,
    accent: post.accent,
    attachment: post.attachment,
    image: post.image ? { uri: post.image } : (post.photos && post.photos[0] ? { uri: post.photos[0] } : undefined),
    imageLabel: post.imageLabel,
    photos: post.photos || [],
    recommendation: post.recommendation,
    appreciation: post.appreciationCount || 0,
    commentsLabel: String(post.commentsCount || 0),
    appreciated: isLiked,
    appreciationIcon: isLiked ? 'heart-outline' : 'thumb-up-outline',
    location: post.location,
    saved: isSaved,
    viewerOwned: isViewerOwned,
    poll: post.poll,
    shares: post.shares || 0,
  };
}

export async function getFeed(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { category, search, location, sort } = req.query;
    const filter: Record<string, any> = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (location && typeof location === 'string' && location.trim().length > 0) {
      filter.location = { $regex: new RegExp(location.trim(), 'i') };
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim();
      filter.$or = [
        { authorName: { $regex: q, $options: 'i' } },
        { body: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    const sortOption: Record<string, 1 | -1> =
      sort === 'appreciated' ? { appreciationCount: -1, createdAt: -1 } : { createdAt: -1 };

    const posts = await Post.find(filter).sort(sortOption).populate('author', 'fullName handle photoUri neighborhood');

    let likedIds = new Set<string>();
    let savedIds = new Set<string>();

    if (req.user) {
      const likes = await Like.find({ user: req.user._id });
      likedIds = new Set(likes.map((l) => l.post.toString()));
      const bookmarks = await Bookmark.find({ user: req.user._id });
      savedIds = new Set(bookmarks.map((b) => b.post.toString()));
    }

    const currentUserId = req.user?._id.toString();
    const serialized = posts.map((post) => serializePost(post, currentUserId, likedIds, savedIds));

    sendSuccess(res, serialized);
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching feed', 500);
  }
}

export async function getPostById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate('author', 'fullName handle photoUri neighborhood');

    if (!post) {
      sendError(res, 'Post not found', 404);
      return;
    }

    let likedIds = new Set<string>();
    let savedIds = new Set<string>();

    if (req.user) {
      const liked = await Like.exists({ user: req.user._id, post: post._id });
      if (liked) likedIds.add(post._id.toString());
      const saved = await Bookmark.exists({ user: req.user._id, post: post._id });
      if (saved) savedIds.add(post._id.toString());
    }

    const serialized = serializePost(post, req.user?._id.toString(), likedIds, savedIds);
    sendSuccess(res, serialized);
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching post', 500);
  }
}

export async function createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Sign in before publishing.', 401);
      return;
    }

    const { body, category, location, photos, urgent, poll, attachment, recommendation } = req.body;

    const newPost = await Post.create({
      author: user._id,
      authorName: user.fullName,
      authorMeta: user.neighborhood,
      authorKind: 'photo',
      verified: user.verified ?? true,
      body: body.trim(),
      category: urgent ? 'alerts' : category || 'general',
      location: location.trim(),
      photos: photos || [],
      image: photos && photos.length > 0 ? photos[0] : undefined,
      poll: poll && poll.trim().length > 0 ? poll.trim() : undefined,
      accent: Boolean(urgent),
      badge: urgent
        ? { label: 'Safety Notice', tone: 'danger', icon: 'alert' }
        : category === 'events'
        ? { label: 'Upcoming', tone: 'primary', icon: 'calendar' }
        : undefined,
      attachment,
      recommendation,
      appreciationCount: 0,
      commentsCount: 0,
      shares: 0,
    });

    const populated = await newPost.populate('author', 'fullName handle photoUri neighborhood');
    const serialized = serializePost(populated, user._id.toString());

    sendSuccess(res, serialized, 'Post published successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Error publishing post', 500);
  }
}

export async function toggleLike(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      sendError(res, 'Post not found', 404);
      return;
    }

    const existingLike = await Like.findOne({ user: user._id, post: post._id });
    let appreciated = false;

    if (existingLike) {
      await existingLike.deleteOne();
      post.appreciationCount = Math.max(0, post.appreciationCount - 1);
    } else {
      await Like.create({ user: user._id, post: post._id });
      post.appreciationCount += 1;
      appreciated = true;
    }

    await post.save();
    sendSuccess(res, { appreciated, appreciation: post.appreciationCount });
  } catch (error: any) {
    sendError(res, error.message || 'Error toggling like', 500);
  }
}

export async function toggleBookmark(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      sendError(res, 'Post not found', 404);
      return;
    }

    const existingBookmark = await Bookmark.findOne({ user: user._id, post: post._id });
    let saved = false;

    if (existingBookmark) {
      await existingBookmark.deleteOne();
    } else {
      await Bookmark.create({ user: user._id, post: post._id });
      saved = true;
    }

    sendSuccess(res, { saved });
  } catch (error: any) {
    sendError(res, error.message || 'Error toggling bookmark', 500);
  }
}

export async function getSavedPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const bookmarks = await Bookmark.find({ user: user._id }).populate({
      path: 'post',
      populate: { path: 'author', select: 'fullName handle photoUri neighborhood' },
    });

    const likes = await Like.find({ user: user._id });
    const likedIds = new Set(likes.map((l) => l.post.toString()));
    const savedIds = new Set(bookmarks.map((b) => (b.post as any)?._id?.toString()));

    const posts = bookmarks
      .filter((b) => b.post !== null)
      .map((b) => serializePost(b.post, user._id.toString(), likedIds, savedIds));

    sendSuccess(res, posts);
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching saved posts', 500);
  }
}

export async function getMyPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'fullName handle photoUri neighborhood');

    const likes = await Like.find({ user: user._id });
    const likedIds = new Set(likes.map((l) => l.post.toString()));
    const bookmarks = await Bookmark.find({ user: user._id });
    const savedIds = new Set(bookmarks.map((b) => b.post.toString()));

    const serialized = posts.map((p) => serializePost(p, user._id.toString(), likedIds, savedIds));
    sendSuccess(res, serialized);
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching my posts', 500);
  }
}

