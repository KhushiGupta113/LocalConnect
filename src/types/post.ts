import type { ImageSourcePropType } from 'react-native';

export type PostCategory =
  | 'general'
  | 'alerts'
  | 'events'
  | 'lost'
  | 'recommendations'
  | 'sale';

export type FeedPost = {
  id: string;
  authorName: string;
  authorMeta?: string;
  authorKind: 'organization' | 'photo' | 'initials';
  initials?: string;
  photo?: ImageSourcePropType;
  verified?: boolean;
  timeLabel: string;
  sortIndex: number;
  badge?: {
    label: string;
    tone: 'danger' | 'primary';
    icon: 'alert' | 'calendar';
  };
  body: string;
  category: PostCategory;
  accent?: boolean;
  attachment?: {
    title: string;
    meta: string;
  };
  image?: ImageSourcePropType;
  imageLabel?: string;
  recommendation?: {
    author: string;
    business: string;
    quote: string;
  };
  appreciation: number;
  commentsLabel: string;
  appreciated: boolean;
  appreciationIcon: 'thumb-up-outline' | 'heart-outline';
  location?: string;
  saved?: boolean;
  viewerOwned?: boolean;
  photos?: string[];
  poll?: string;
  shares?: number;
};

export type FeedCategory = 'all' | PostCategory;

export type FeedSort = 'newest' | 'appreciated';
