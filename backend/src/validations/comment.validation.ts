import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.string().trim().min(1, 'Write a comment first.').max(300, 'Comments are limited to 300 characters.'),
  parentId: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

