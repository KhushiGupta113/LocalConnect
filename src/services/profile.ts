import type { SessionUser } from '../types/user';

export function buildSession(input: {
  fullName: string;
  email: string;
  neighborhood: string;
  neighborhoodDetail: string;
}): SessionUser {
  const localPart = input.email.split('@')[0] ?? 'neighbor';
  const handle = localPart.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'neighbor';
  const maya = input.fullName.toLowerCase().includes('maya');
  return {
    fullName: input.fullName,
    email: input.email.trim(),
    neighborhood: input.neighborhood,
    neighborhoodDetail: input.neighborhoodDetail,
    handle: maya ? 'mayalind' : handle,
    bio: maya
      ? 'Urban gardener, sustainability advocate & Oakridge Commons resident for 6 years. Always happy to lend garden tools and organize block cleanups!'
      : `Neighbor in ${input.neighborhood}.`,
    role: maya ? 'Block Representative' : 'Resident',
    street: maya ? '12th & Elmwood St' : '',
    neighborCount: 328,
    followingCount: 142,
    streetPrivate: true,
    showContact: true,
    urgentAlerts: true,
  };
}
