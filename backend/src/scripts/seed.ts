import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Comment } from '../models/Comment.js';
import { Event } from '../models/Event.js';
import { Group } from '../models/Group.js';
import { Notification } from '../models/Notification.js';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { hashPassword } from '../services/auth.service.js';

async function seed() {
  await connectDB();
  console.log('Seeding LocalConnect database...');

  // Clear existing collections
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
  await Event.deleteMany({});
  await Group.deleteMany({});
  await Notification.deleteMany({});

  const defaultPassword = await hashPassword('Oakridge#2026');

  // 1. Create Users
  const maya = await User.create({
    fullName: 'Maya Lindqvist',
    email: 'maya@oakridge.org',
    password: defaultPassword,
    neighborhood: 'Oakridge Commons',
    neighborhoodDetail: 'Ward 4 • Southwest Precinct Boundary',
    handle: 'mayalind',
    bio: 'Urban gardener, sustainability advocate & Oakridge Commons resident for 6 years. Always happy to lend garden tools and organize block cleanups!',
    role: 'Block Representative',
    street: '12th & Elmwood St',
    neighborCount: 328,
    followingCount: 142,
    streetPrivate: true,
    showContact: true,
    urgentAlerts: true,
    verified: true,
  });

  const elena = await User.create({
    fullName: 'Elena Rostova',
    email: 'elena@oakridge.org',
    password: defaultPassword,
    neighborhood: 'Oakridge Commons',
    neighborhoodDetail: 'Community Garden Lead',
    handle: 'elenagarden',
    bio: 'Lead organizer for the Oakridge Community Garden and Annual Harvest Fest.',
    role: 'Garden Lead',
    street: 'Maple St',
    neighborCount: 240,
    followingCount: 98,
    verified: true,
  });

  const david = await User.create({
    fullName: 'David Kim',
    email: 'david.k@oakridge.org',
    password: defaultPassword,
    neighborhood: '4th Street',
    neighborhoodDetail: 'Ward 3 • Riverside',
    handle: 'davidk',
    bio: 'New neighbor on 4th St. EV enthusiast and woodworker.',
    role: 'Resident',
    street: '4th St',
    neighborCount: 110,
    followingCount: 45,
    verified: true,
  });

  const council = await User.create({
    fullName: 'Oakridge Neighborhood Council',
    email: 'council@oakridge.org',
    password: defaultPassword,
    neighborhood: 'Oakridge Commons',
    handle: 'oakridgecouncil',
    bio: 'Official Oakridge Neighborhood Council civic safety and public notices.',
    role: 'Municipal Authority',
    street: 'City Hall Suite 4',
    neighborCount: 890,
    followingCount: 12,
    verified: true,
  });

  // 2. Create Posts
  const gardenPost = await Post.create({
    author: maya._id,
    authorName: maya.fullName,
    authorMeta: maya.neighborhood,
    authorKind: 'photo',
    verified: true,
    body: 'Our weekend volunteer garden restoration at Maple St Park is officially confirmed! We received 20 perennial seedling flats from the city nursery. Gloves and shovels will be provided, but bring your favorite watering can.',
    category: 'events',
    imageLabel: 'Maple St Park',
    location: 'Maple St Park',
    appreciationCount: 52,
    commentsCount: 3,
    shares: 6,
    badge: {
      label: 'Confirmed',
      tone: 'primary',
      icon: 'calendar',
    },
  });

  const lostKeysPost = await Post.create({
    author: maya._id,
    authorName: maya.fullName,
    authorMeta: maya.neighborhood,
    authorKind: 'photo',
    verified: true,
    body: 'Found a set of bronze keys near the 4th St bus stop this morning. Handed them to the corner bakery so they stay safe until claimed. Please ask for Martha at the front counter.',
    category: 'lost',
    location: '4th St bus stop',
    appreciationCount: 18,
    commentsCount: 0,
    shares: 2,
  });

  const waterMainPost = await Post.create({
    author: council._id,
    authorName: council.fullName,
    authorKind: 'organization',
    verified: true,
    body: 'Annual water main inspection on Maple Ave tomorrow from 9am–1pm. Water pressure may temporarily fluctuate. Tap below for the local detour map and alternate parking guidelines.',
    category: 'alerts',
    location: 'Maple Avenue',
    accent: true,
    badge: {
      label: 'Safety Notice',
      tone: 'danger',
      icon: 'alert',
    },
    attachment: {
      title: 'Maple Ave Detour & Hydrant Plan',
      meta: 'PDF • 1.2 MB',
    },
    appreciationCount: 24,
    commentsCount: 1,
    shares: 14,
  });

  const harvestFestPost = await Post.create({
    author: elena._id,
    authorName: elena.fullName,
    authorMeta: 'Community Garden',
    authorKind: 'photo',
    verified: true,
    body: 'Harvest fest prep is underway! Bring your homegrown herbs and join us this Saturday at 10 AM. We’ll have fresh mint tea, plant starters, and potting tables set up by the gazebo.',
    category: 'events',
    location: 'Gazebo Plots',
    appreciationCount: 52,
    commentsCount: 1,
    shares: 9,
    badge: {
      label: 'Sat, 10:00 AM',
      tone: 'primary',
      icon: 'calendar',
    },
  });

  const electricianPost = await Post.create({
    author: david._id,
    authorName: david.fullName,
    authorMeta: '4th St',
    authorKind: 'initials',
    initials: 'DK',
    verified: false,
    body: 'Anyone have a reliable local electrician recommendation? Moving into 4th St next week and need an EV charger installed plus a breaker inspection. Thanks in advance!',
    category: 'recommendations',
    location: '4th Street',
    recommendation: {
      author: 'Sarah C.',
      business: 'Oakridge Electric & Solar',
      quote: 'Installed our Level 2 charger last month, punctual and neat.',
    },
    appreciationCount: 7,
    commentsCount: 1,
    shares: 0,
  });

  // 3. Create Comments
  const c1 = await Comment.create({
    post: gardenPost._id,
    author: david._id,
    authorName: 'Marcus Vance',
    authorMeta: 'Oakridge Resident',
    body: 'Sounds amazing! I can bring 4 extra potting trowels and some lavender clippings.',
    likesCount: 4,
  });

  const c2 = await Comment.create({
    post: gardenPost._id,
    author: elena._id,
    authorName: 'Sarah Jenkins',
    authorMeta: 'Maple St South',
    body: 'Will there be parking by the south gate?',
    likesCount: 2,
  });

  await Comment.create({
    post: gardenPost._id,
    parentId: c2._id,
    author: elena._id,
    authorName: 'Elena Rostova',
    authorMeta: 'Garden Lead',
    body: 'Yes, the south lot is open. Overflow parking is by the community school.',
    likesCount: 5,
  });

  await Comment.create({
    post: waterMainPost._id,
    author: maya._id,
    authorName: 'Priya Shah',
    authorMeta: 'Maple Ave',
    body: 'Thanks for the notice. We will fill jugs tonight.',
    likesCount: 3,
  });

  await Comment.create({
    post: harvestFestPost._id,
    author: david._id,
    authorName: 'Luis Ortega',
    authorMeta: 'Gazebo Plots',
    body: 'I can bring mint and a folding table.',
    likesCount: 6,
  });

  await Comment.create({
    post: electricianPost._id,
    author: elena._id,
    authorName: 'Sarah C.',
    authorMeta: '4th St',
    body: 'Oakridge Electric & Solar installed our Level 2 charger last month.',
    likesCount: 7,
  });

  // 4. Create Discover Events
  await Event.create([
    {
      title: 'Weekend Volunteer Garden Restoration',
      when: 'Sat 9:00 AM • Maple Park',
      summary:
        'Join neighbors to clear fallen brush, refresh compost beds, and plant cold-hardy native bulbs.',
      miles: 0.8,
      goingCount: 42,
      hub: 'events',
      featured: true,
      note: 'Tools & gloves provided',
    },
    {
      title: 'Oakridge Monthly Book Swap & Coffee',
      when: 'Sun 10:30 AM • Bean & Leaf Cafe',
      miles: 1.4,
      goingCount: 18,
      hub: 'events',
      note: '18 attending',
    },
    {
      title: 'Neighborhood Watch Safety Briefing',
      when: 'Tuesday 7:00 PM • Community Center',
      miles: 1.9,
      goingCount: 26,
      hub: 'civic',
      note: 'Ward 4 Council present',
    },
  ]);

  // 5. Create Discover Groups
  await Group.create([
    {
      name: 'Oakridge Green Thumbs',
      membersCount: 340,
      summary: 'Seed sharing, composting advice, and plant cuttings in Oakridge.',
      activity: 'Very active',
      miles: 0.6,
      hub: 'events',
    },
    {
      name: '4th Ward Parents Group',
      membersCount: 185,
      summary: 'Playdates, school carpools, babysitting swaps, and family events.',
      activity: 'Daily posts',
      miles: 1.2,
      hub: 'civic',
    },
    {
      name: 'Maple Tool Library',
      membersCount: 96,
      summary: 'Borrow drills, ladders, and garden tools from neighbors.',
      activity: 'Weekly',
      miles: 0.9,
      hub: 'skills',
    },
    {
      name: 'Oakridge Dog Walkers',
      membersCount: 120,
      summary: 'Morning walks, lost-pet alerts, and sitter swaps.',
      activity: 'Daily posts',
      miles: 1.1,
      hub: 'pets',
    },
  ]);

  // 6. Create Notifications for Maya
  await Notification.create([
    {
      recipient: maya._id,
      kind: 'alert',
      title: 'Urgent Alert',
      body: 'Water main inspection schedule adjusted for Maple Ave tomorrow.',
      post: waterMainPost._id,
      unread: true,
    },
    {
      recipient: maya._id,
      sender: elena._id,
      kind: 'like',
      title: 'Elena Rostova',
      body: 'Elena Rostova and 8 other neighbors liked your garden restoration post.',
      post: gardenPost._id,
      preview: 'Weekend volunteer garden restoration at Maple St Park is confirmed.',
      unread: true,
    },
    {
      recipient: maya._id,
      sender: david._id,
      kind: 'comment',
      title: 'Marcus Vance',
      body: 'Marcus Vance commented on your update.',
      post: gardenPost._id,
      preview: 'I will bring 4 extra potting trowels.',
      unread: true,
    },
    {
      recipient: maya._id,
      sender: david._id,
      kind: 'community',
      title: 'David Kim',
      body: 'David Kim started following updates in Oakridge Commons.',
      unread: false,
    },
    {
      recipient: maya._id,
      kind: 'event',
      title: 'Community Event',
      body: 'Oakridge Monthly Book Swap begins tomorrow at 10:30 AM at the Community Pavilion.',
      post: harvestFestPost._id,
      unread: false,
    },
  ]);

  console.log('Seed completed successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

