import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  neighborhood: z.string().trim().min(2, 'Choose or enter your neighborhood.'),
  neighborhoodDetail: z.string().optional().default(''),
  email: z.string().trim().email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Use at least one uppercase letter.')
    .regex(/[a-z]/, 'Use at least one lowercase letter.')
    .regex(/[0-9]/, 'Use at least one number.'),
  confirmPassword: z.string(),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: 'Agree to the guidelines to create an account.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

