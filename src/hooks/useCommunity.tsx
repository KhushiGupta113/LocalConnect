import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  apiAddComment,
  apiCreatePost,
  apiGetComments,
  apiGetFeed,
  apiGetMyGroups,
  apiGetMyRSVPs,
  apiGetNotifications,
  apiMarkAllNotificationsRead,
  apiMarkNotificationRead,
  apiToggleCommentLike,
  apiToggleEventRSVP,
  apiToggleGroup,
  apiTogglePostBookmark,
  apiTogglePostLike,
  apiUploadImage,
} from '../services/api';
import { createComments } from '../services/comments';
import { createFeed } from '../services/feed';
import { createNotifications } from '../services/notifications';
import type { Comment, AppNotification } from '../types/community';
import type { FeedPost, PostCategory } from '../types/post';
import { useAuth } from './useAuth';

export type PublishInput = {
  body: string;
  category: PostCategory;
  location: string;
  photos: string[];
  urgent: boolean;
  poll?: string;
};

type CommunityValue = {
  posts: FeedPost[];
  comments: Comment[];
  notifications: AppNotification[];
  unreadCount: number;
  joinedGroupIds: string[];
  rsvpIds: string[];
  toggleLike: (id: string) => void;
  toggleSaved: (id: string) => void;
  publish: (input: PublishInput) => Promise<string | null>;
  addComment: (postId: string, body: string, parentId?: string) => Promise<string | null>;
  toggleCommentLike: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleGroup: (id: string) => void;
  toggleRsvp: (id: string) => void;
  fetchCommentsForPost: (postId: string) => Promise<void>;
  refreshFeed: () => Promise<void>;
};

const CommunityContext = createContext<CommunityValue | null>(null);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>(createFeed);
  const [comments, setComments] = useState<Comment[]>(createComments);
  const [notifications, setNotifications] = useState<AppNotification[]>(createNotifications);
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);
  const [rsvpIds, setRsvpIds] = useState<string[]>([]);

  // Load feed, notifications, and RSVPs from backend
  const loadData = async () => {
    try {
      const [remoteFeed, remoteNotifs, remoteGroups, remoteRSVPs] = await Promise.all([
        apiGetFeed(),
        user ? apiGetNotifications() : Promise.resolve(null),
        user ? apiGetMyGroups() : Promise.resolve(null),
        user ? apiGetMyRSVPs() : Promise.resolve(null),
      ]);

      if (remoteFeed && remoteFeed.length > 0) {
        setPosts(remoteFeed);
      }
      if (remoteNotifs) {
        setNotifications(remoteNotifs.notifications);
      }
      if (remoteGroups) {
        setJoinedGroupIds(remoteGroups);
      }
      if (remoteRSVPs) {
        setRsvpIds(remoteRSVPs);
      }
    } catch {
      // Gracefully maintain cached/mock state
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const value = useMemo<CommunityValue>(() => {
    return {
      posts,
      comments,
      notifications,
      unreadCount: notifications.filter((item) => item.unread).length,
      joinedGroupIds,
      rsvpIds,

      toggleLike(id) {
        // Optimistic update
        setPosts((current) =>
          current.map((post) => {
            if (post.id !== id) return post;
            const appreciated = !post.appreciated;
            return {
              ...post,
              appreciated,
              appreciation: post.appreciation + (appreciated ? 1 : -1),
            };
          })
        );
        apiTogglePostLike(id).catch(() => undefined);
      },

      toggleSaved(id) {
        // Optimistic update
        setPosts((current) =>
          current.map((post) => {
            if (post.id !== id) return post;
            return { ...post, saved: post.saved !== true };
          })
        );
        apiTogglePostBookmark(id).catch(() => undefined);
      },

      async publish(input) {
        if (user === null) {
          return 'Sign in before publishing.';
        }
        const body = input.body.trim();
        if (body.length === 0) {
          return 'Write something for your neighbors.';
        }
        if (body.length > 500) {
          return 'Posts are limited to 500 characters.';
        }
        if (input.location.trim().length === 0) {
          return 'Choose a location.';
        }

        // Upload any photos to backend/Cloudinary
        let uploadedPhotos: string[] = [];
        if (input.photos && input.photos.length > 0) {
          const uploads = await Promise.all(
            input.photos.map(async (uri) => {
              if (uri.startsWith('http://') || uri.startsWith('https://')) {
                return uri;
              }
              const cloudUrl = await apiUploadImage(uri);
              return cloudUrl || uri;
            })
          );
          uploadedPhotos = uploads.filter((u): u is string => Boolean(u));
        }

        const apiRes = await apiCreatePost({
          body,
          category: input.urgent ? 'alerts' : input.category,
          location: input.location.trim(),
          photos: uploadedPhotos,
          urgent: input.urgent,
          poll: input.poll,
        });

        if (apiRes.success) {
          setPosts((current) => [apiRes.post, ...current]);
          return null;
        }

        // Fallback local addition if offline
        const localPost: FeedPost = {
          id: `post-${Date.now()}`,
          authorName: user.fullName,
          authorKind: 'photo',
          verified: true,
          timeLabel: 'Just now',
          sortIndex: -Date.now(),
          body,
          category: input.urgent ? 'alerts' : input.category,
          location: input.location.trim(),
          photos: uploadedPhotos.length > 0 ? uploadedPhotos : input.photos,
          image: input.photos[0] !== undefined ? { uri: input.photos[0] } : undefined,
          appreciation: 0,
          commentsLabel: '0',
          appreciated: false,
          appreciationIcon: 'thumb-up-outline',
          viewerOwned: true,
          poll: input.poll,
          accent: input.urgent,
          badge: input.urgent
            ? { label: 'Safety Notice', tone: 'danger', icon: 'alert' }
            : undefined,
          shares: 0,
        };
        setPosts((current) => [localPost, ...current]);
        return null;
      },

      async addComment(postId, body, parentId) {
        const text = body.trim();
        if (user === null) {
          return 'Sign in before commenting.';
        }
        if (text.length === 0) {
          return 'Write a comment first.';
        }
        if (text.length > 300) {
          return 'Comments are limited to 300 characters.';
        }

        const apiRes = await apiAddComment(postId, text, parentId);
        if (apiRes.success) {
          setComments((current) => [...current, apiRes.comment]);
          setPosts((current) =>
            current.map((post) => {
              if (post.id !== postId) return post;
              const count = Number.parseInt(post.commentsLabel, 10);
              const base = Number.isNaN(count) ? 0 : count;
              return { ...post, commentsLabel: String(base + 1) };
            })
          );
          return null;
        }

        // Fallback local addition
        const next: Comment = {
          id: `comment-${Date.now()}`,
          postId,
          parentId,
          authorName: user.fullName,
          authorMeta: user.neighborhood,
          body: text,
          timeLabel: 'Just now',
          likes: 0,
          liked: false,
          isAuthor: true,
        };
        setComments((current) => [...current, next]);
        setPosts((current) =>
          current.map((post) => {
            if (post.id !== postId) return post;
            const count = Number.parseInt(post.commentsLabel, 10);
            const base = Number.isNaN(count) ? 0 : count;
            return { ...post, commentsLabel: String(base + 1) };
          })
        );
        return null;
      },

      toggleCommentLike(id) {
        setComments((current) =>
          current.map((comment) => {
            if (comment.id !== id) return comment;
            const liked = !comment.liked;
            return { ...comment, liked, likes: comment.likes + (liked ? 1 : -1) };
          })
        );
        apiToggleCommentLike(id).catch(() => undefined);
      },

      markNotificationRead(id) {
        setNotifications((current) =>
          current.map((item) => (item.id === id ? { ...item, unread: false } : item))
        );
        apiMarkNotificationRead(id).catch(() => undefined);
      },

      markAllNotificationsRead() {
        setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
        apiMarkAllNotificationsRead().catch(() => undefined);
      },

      toggleGroup(id) {
        setJoinedGroupIds((current) =>
          current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
        apiToggleGroup(id).catch(() => undefined);
      },

      toggleRsvp(id) {
        setRsvpIds((current) =>
          current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
        apiToggleEventRSVP(id).catch(() => undefined);
      },

      async fetchCommentsForPost(postId) {
        const res = await apiGetComments(postId);
        if (res && res.length > 0) {
          setComments((current) => {
            const others = current.filter((c) => c.postId !== postId);
            return [...others, ...res];
          });
        }
      },

      async refreshFeed() {
        const feed = await apiGetFeed();
        if (feed) {
          setPosts(feed);
        }
      },
    };
  }, [comments, joinedGroupIds, notifications, posts, rsvpIds, user]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity(): CommunityValue {
  const value = useContext(CommunityContext);
  if (value === null) {
    throw new Error('useCommunity must be used within CommunityProvider');
  }
  return value;
}
