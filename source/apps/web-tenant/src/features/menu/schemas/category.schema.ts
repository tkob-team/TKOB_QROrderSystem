import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Category name must be at least 1 character')
    .max(100, 'Category name must not exceed 100 characters'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .nullable()
    .default(null),
  displayOrder: z.union([
    z.coerce.number().int('Display order must be a whole number').nonnegative('Display order must be 0 or higher'),
    z.literal('')
  ]).optional().nullable().transform((val) => val === '' ? null : val).default(null),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
}) as any;

export type CategoryFormData = {
  name: string;
  description?: string | null;
  displayOrder?: number | string | null;
  status: 'ACTIVE' | 'INACTIVE';
};
