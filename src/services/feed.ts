import { images } from '../constants/images';
import type { FeedPost } from '../types/post';
import type { SessionUser } from '../types/user';

export function presentPost(post: FeedPost, user: SessionUser | null): FeedPost {
  if (post.viewerOwned !== true || user === null) {
    return post;
  }
  return {
    ...post,
    authorName: user.fullName,
    authorKind: 'photo',
    photo: user.photoUri !== undefined ? { uri: user.photoUri } : images.maya,
    authorMeta: user.neighborhood,
  };
}

export function createFeed(): FeedPost[] {
  return [
    {
      id: 'my-garden',
      authorName: 'You',
      authorKind: 'photo',
      photo: images.maya,
      verified: true,
      timeLabel: 'Yesterday',
      sortIndex: -2,
      body: 'Our weekend volunteer garden restoration at Maple St Park is officially confirmed! We received 20 perennial seedling flats from the city nursery. Gloves and shovels will be provided, but bring your favorite watering can.',
      category: 'events',
      image: images.garden,
      imageLabel: 'Maple St Park',
      location: 'Maple St Park',
      appreciation: 52,
      commentsLabel: '3',
      appreciated: true,
      appreciationIcon: 'heart-outline',
      viewerOwned: true,
      shares: 6,
    },
    {
      id: 'my-keys',
      authorName: 'You',
      authorKind: 'photo',
      photo: images.maya,
      verified: true,
      timeLabel: '3 days ago',
      sortIndex: -1,
      body: 'Found a set of bronze keys near the 4th St bus stop this morning. Handed them to the corner bakery so they stay safe until claimed. Please ask for Martha at the front counter.',
      category: 'lost',
      location: '4th St bus stop',
      appreciation: 18,
      commentsLabel: '0',
      appreciated: false,
      appreciationIcon: 'thumb-up-outline',
      viewerOwned: true,
    },
    {
      id: 'water-main',
      authorName: 'Oakridge Neighborhood Council',
      authorKind: 'organization',
      verified: true,
      timeLabel: '15m ago',
      sortIndex: 0,
      badge: {
        label: 'Safety Notice',
        tone: 'danger',
        icon: 'alert',
      },
      body: 'Annual water main inspection on Maple Ave tomorrow from 9am–1pm. Water pressure may temporarily fluctuate. Tap below for the local detour map and alternate parking guidelines.',
      category: 'alerts',
      accent: true,
      attachment: {
        title: 'Maple Ave Detour & Hydrant Plan',
        meta: 'PDF • 1.2 MB',
      },
      appreciation: 24,
      commentsLabel: '8',
      appreciated: false,
      appreciationIcon: 'thumb-up-outline',
    },
    {
      id: 'harvest-fest',
      authorName: 'Elena Rostova',
      authorMeta: 'Community Garden',
      authorKind: 'photo',
      photo: images.elena,
      timeLabel: '2h ago',
      sortIndex: 1,
      badge: {
        label: 'Sat, 10:00 AM',
        tone: 'primary',
        icon: 'calendar',
      },
      body: 'Harvest fest prep is underway! Bring your homegrown herbs and join us this Saturday at 10 AM. We’ll have fresh mint tea, plant starters, and potting tables set up by the gazebo.',
      category: 'events',
      image: images.garden,
      imageLabel: 'Gazebo Plots',
      appreciation: 52,
      commentsLabel: '19',
      appreciated: true,
      appreciationIcon: 'heart-outline',
    },
    {
      id: 'electrician',
      authorName: 'David Kim',
      authorMeta: '4th St',
      authorKind: 'initials',
      initials: 'DK',
      timeLabel: '4h ago',
      sortIndex: 2,
      body: 'Anyone have a reliable local electrician recommendation? Moving into 4th St next week and need an EV charger installed plus a breaker inspection. Thanks in advance!',
      category: 'recommendations',
      recommendation: {
        author: 'Sarah C.',
        business: 'Oakridge Electric & Solar',
        quote: 'Installed our Level 2 charger last month, punctual and neat.',
      },
      appreciation: 7,
      commentsLabel: '12 neighbor replies',
      appreciated: false,
      appreciationIcon: 'thumb-up-outline',
    },
  ];
}
