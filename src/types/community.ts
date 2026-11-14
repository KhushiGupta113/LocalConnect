export type Comment = {
  id: string;
  postId: string;
  authorName: string;
  authorMeta: string;
  body: string;
  timeLabel: string;
  likes: number;
  liked: boolean;
  parentId?: string;
  isAuthor?: boolean;
};

export type AppNotification = {
  id: string;
  kind: 'alert' | 'like' | 'comment' | 'community' | 'event';
  title: string;
  body: string;
  timeLabel: string;
  section: 'Today' | 'Earlier';
  unread: boolean;
  postId?: string;
  preview?: string;
};

export type NoticeFilter = 'all' | 'replies' | 'alerts';
