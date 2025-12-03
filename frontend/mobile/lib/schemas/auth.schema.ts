import { z } from 'zod';

export const phoneSchema = z.string()
  .regex(/^[6-9]\d{9}$/, 'Invalid phone number. Must be a valid 10-digit Indian mobile number');

export const otpSchema = z.string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

export const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .max(50, 'Password must not exceed 50 characters');

export const loginSchema = z.object({
  phone_number: phoneSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  phone_number: phoneSchema,
  password: passwordSchema,
  password_confirm: z.string(),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  role: z.enum(['farmer', 'fpo', 'processor', 'buyer']),
  preferred_language: z.string().optional(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ['password_confirm'],
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: passwordSchema,
  new_password_confirm: z.string(),
}).refine((data) => data.new_password === data.new_password_confirm, {
  message: "Passwords don't match",
  path: ['new_password_confirm'],
});

export const sendOTPSchema = z.object({
  phone_number: phoneSchema,
});

export const verifyOTPSchema = z.object({
  phone_number: phoneSchema,
  otp: otpSchema,
});

export const forgotPasswordSchema = z.object({
  phone_number: phoneSchema,
});

export const resetPasswordSchema = z.object({
  phone_number: phoneSchema,
  otp: otpSchema,
  new_password: passwordSchema,
  new_password_confirm: z.string(),
}).refine((data) => data.new_password === data.new_password_confirm, {
  message: "Passwords don't match",
  path: ['new_password_confirm'],
});