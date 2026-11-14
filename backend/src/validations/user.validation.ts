import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.').optional(),
  handle: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]{3,20}$/i, 'Use 3–20 letters, numbers, or underscores for your handle.')
    .optional(),
  role: z.string().trim().optional(),
  bio: z.string().max(200, 'Bio must be 200 characters or fewer.').optional(),
  street: z.string().trim().optional(),
  photoUri: z.string().optional(),
  streetPrivate: z.boolean().optional(),
  showContact: z.boolean().optional(),
  urgentAlerts: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

