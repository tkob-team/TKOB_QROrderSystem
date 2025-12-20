import { z } from 'zod'

// Common field validations
export const phoneRegex = /^[0-9]{10,11}$/
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Checkout form validation
export const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Name must contain only letters'),
  
  phone: z
    .string()
    .regex(phoneRegex, 'Invalid phone number (10-11 digits required)')
    .min(10, 'Phone number must be at least 10 digits')
    .max(11, 'Phone number must not exceed 11 digits'),
  
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  
  tableNumber: z
    .string()
    .min(1, 'Table number is required')
    .regex(/^[0-9]+$/, 'Table number must be a number'),
  
  specialInstructions: z
    .string()
    .max(500, 'Special instructions must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  
  paymentMethod: z.enum(['cash', 'card', 'momo', 'zalopay'], {
    message: 'Please select a payment method',
  }),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

// Item customization validation
export const itemCustomizationSchema = z.object({
  size: z.string().optional(),
  
  toppings: z.array(z.string()).optional(),
  
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Quantity must not exceed 99'),
  
  specialInstructions: z
    .string()
    .max(200, 'Special instructions must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
})

export type ItemCustomizationFormData = z.infer<typeof itemCustomizationSchema>

// Contact form validation (for support/feedback)
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  
  email: z
    .string()
    .email('Invalid email address'),
  
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must not exceed 200 characters'),
  
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must not exceed 1000 characters'),
})

export type ContactFormData = z.infer<typeof contactSchema>

// Login validation
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
  
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register validation
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  
  email: z
    .string()
    .email('Invalid email address'),
  
  phone: z
    .string()
    .regex(phoneRegex, 'Invalid phone number (10-11 digits required)'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>
