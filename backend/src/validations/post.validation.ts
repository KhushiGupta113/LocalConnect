import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.string().trim().min(1, 'Write something for your neighbors.').max(500, 'Posts are limited to 500 characters.'),
  category: z.enum(['general', 'alerts', 'events', 'lost', 'recommendations', 'sale']).default('general'),
  location: z.string().trim().min(1, 'Choose a location.'),
  photos: z.array(z.string()).max(4, 'You can attach up to 4 photos.').optional().default([]),
  urgent: z.boolean().optional().default(false),
  poll: z.string().trim().optional(),
  attachment: z
    .object({
      title: z.string(),
      meta: z.string(),
    })
    .optional(),
  recommendation: z
    .object({
      author: z.string(),
      business: z.string(),
      quote: z.string(),
    })
    .optional(),
});

export const getPostsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  location: z.string().optional(),
  sort: z.enum(['newest', 'appreciated']).optional().default('newest'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

