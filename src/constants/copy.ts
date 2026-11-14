export const communityGuidelines =
  'Be respectful, keep posts about this neighborhood, and do not share another resident’s private information. Safety notices should describe what you observed and where.';

export const neighborhoodVerification =
  'A later phase will confirm that you live in the selected area. This phase keeps your neighborhood on this device for the current app session only.';

export const laterPhase = {
  google:
    'Google sign-in needs a Google Cloud project and is not part of this phase. Use email and password to continue.',
  passkey:
    'Passkeys need device credential services and are not part of this phase. Use email and password to continue.',
  forgotPassword:
    'Password reset needs an email service and is not part of this phase. If you created an account during this session, use that password. A new email can sign in with any password of at least 8 characters because there is no server yet.',
  attachment:
    'Maple Ave Detour & Hydrant Plan is shown as in the design. The PDF file itself is not bundled in this phase.',
  comments:
    'Neighbor replies open on the post details screen, which is planned for a later phase.',
  discover:
    'Discover will list nearby places, events, and neighbors. That screen is planned for a later phase.',
  createPost:
    'The post composer from the design is planned for a later phase. Nothing is published from this screen.',
  notifications:
    'Alerts will list replies, safety notices, and event reminders. That screen is planned for a later phase. The badge on the tab matches the design count of 3.',
  profile:
    'The full profile layout is planned for a later phase. The name, email, and neighborhood below come from this session. Sign out returns you to the login screen.',
} as const;
