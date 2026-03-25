import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const assetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  platformId: z.string().uuid().optional().or(z.literal('')),
  purchaseUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  notes: z.string().max(2000, 'Notes are too long').optional().or(z.literal('')),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const platformSchema = z.object({
  platformName: z.string().min(1, 'Platform name is required').max(100),
  accountName: z.string().min(1, 'Account name is required').max(100),
  platformUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type AssetInput = z.infer<typeof assetSchema>;
export type PlatformInput = z.infer<typeof platformSchema>;
export type TagInput = z.infer<typeof tagSchema>;
