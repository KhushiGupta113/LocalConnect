import type { AppNotification } from '../types/community';

export function createNotifications(): AppNotification[] {
  return [
    {
      id: 'n1',
      kind: 'alert',
      title: 'Urgent Alert',
      body: 'Water main inspection schedule adjusted for Maple Ave tomorrow.',
      timeLabel: '10m ago',
      section: 'Today',
      unread: true,
      postId: 'water-main',
    },
    {
      id: 'n2',
      kind: 'like',
      title: 'Elena Rostova',
      body: 'Elena Rostova and 8 other neighbors liked your garden restoration post.',
      timeLabel: '25m ago',
      section: 'Today',
      unread: true,
      postId: 'my-garden',
      preview: 'Weekend volunteer garden restoration at Maple St Park is confirmed.',
    },
    {
      id: 'n3',
      kind: 'comment',
      title: 'Marcus Vance',
      body: 'Marcus Vance commented on your update.',
      timeLabel: '1h ago',
      section: 'Today',
      unread: true,
      postId: 'my-garden',
      preview: 'I will bring 4 extra potting trowels.',
    },
    {
      id: 'n4',
      kind: 'community',
      title: 'David Kim',
      body: 'David Kim started following updates in Oakridge Commons.',
      timeLabel: '3h ago',
      section: 'Earlier',
      unread: false,
    },
    {
      id: 'n5',
      kind: 'event',
      title: 'Community Event',
      body: 'Oakridge Monthly Book Swap begins tomorrow at 10:30 AM at the Community Pavilion.',
      timeLabel: 'Yesterday',
      section: 'Earlier',
      unread: false,
      postId: 'harvest-fest',
    },
  ];
}
