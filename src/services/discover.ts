import type { IconName } from '../components/Icon';

export type DiscoverTopic = {
  id: string;
  label: string;
  alert?: boolean;
};

export type DiscoverEvent = {
  id: string;
  title: string;
  when: string;
  summary?: string;
  miles: number;
  going: number;
  hub: 'civic' | 'market' | 'skills' | 'pets' | 'events';
  featured?: boolean;
  note: string;
};

export type DiscoverGroup = {
  id: string;
  name: string;
  members: number;
  summary: string;
  activity: string;
  miles: number;
  hub: DiscoverEvent['hub'];
};

export type DiscoverHub = {
  id: DiscoverEvent['hub'];
  title: string;
  meta: string;
  icon: IconName;
  tint: 'strong' | 'soft';
};

export const discoverTopics: DiscoverTopic[] = [
  { id: 'festival', label: '#FallFestival' },
  { id: 'detour', label: '#MapleStDetour', alert: true },
  { id: 'tools', label: '#ToolLibrary' },
  { id: 'dogs', label: '#DogWalkersClub' },
  { id: 'safety', label: '#CommunitySafety' },
];

export const discoverEvents: DiscoverEvent[] = [
  {
    id: 'garden-restore',
    title: 'Weekend Volunteer Garden Restoration',
    when: 'Sat 9:00 AM • Maple Park',
    summary:
      'Join neighbors to clear fallen brush, refresh compost beds, and plant cold-hardy native bulbs.',
    miles: 0.8,
    going: 42,
    hub: 'events',
    featured: true,
    note: 'Tools & gloves provided',
  },
  {
    id: 'book-swap',
    title: 'Oakridge Monthly Book Swap & Coffee',
    when: 'Sun 10:30 AM • Bean & Leaf Cafe',
    miles: 1.4,
    going: 18,
    hub: 'events',
    note: '18 attending',
  },
  {
    id: 'watch',
    title: 'Neighborhood Watch Safety Briefing',
    when: 'Tuesday 7:00 PM • Community Center',
    miles: 1.9,
    going: 26,
    hub: 'civic',
    note: 'Ward 4 Council present',
  },
];

export const discoverGroups: DiscoverGroup[] = [
  {
    id: 'thumbs',
    name: 'Oakridge Green Thumbs',
    members: 340,
    summary: 'Seed sharing, composting advice, and plant cuttings in Oakridge.',
    activity: 'Very active',
    miles: 0.6,
    hub: 'events',
  },
  {
    id: 'parents',
    name: '4th Ward Parents Group',
    members: 185,
    summary: 'Playdates, school carpools, babysitting swaps, and family events.',
    activity: 'Daily posts',
    miles: 1.2,
    hub: 'civic',
  },
  {
    id: 'tools',
    name: 'Maple Tool Library',
    members: 96,
    summary: 'Borrow drills, ladders, and garden tools from neighbors.',
    activity: 'Weekly',
    miles: 0.9,
    hub: 'skills',
  },
  {
    id: 'paws',
    name: 'Oakridge Dog Walkers',
    members: 120,
    summary: 'Morning walks, lost-pet alerts, and sitter swaps.',
    activity: 'Daily posts',
    miles: 1.1,
    hub: 'pets',
  },
];

export const discoverHubs: DiscoverHub[] = [
  { id: 'civic', title: 'Civic & Safety', meta: '14 active notices', icon: 'shield', tint: 'strong' },
  { id: 'market', title: 'Marketplace & Free', meta: '86 items listed', icon: 'tag-outline', tint: 'soft' },
  { id: 'skills', title: 'Skills & Handyman', meta: '31 verified helpers', icon: 'hammer', tint: 'soft' },
  { id: 'pets', title: 'Pet Care & Wildlife', meta: '5 lost & found', icon: 'paw', tint: 'strong' },
];

export const radiusOptions = [1, 2, 5];
