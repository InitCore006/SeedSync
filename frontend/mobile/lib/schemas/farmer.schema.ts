import { z } from 'zod';
import { phoneSchema, passwordSchema } from './auth.schema';

// ============================================================================
// FARMER REGISTRATION SCHEMA (Complete - All in One)
// ============================================================================

export const farmerRegistrationSchema = z.object({
  // User fields
  phone_number: phoneSchema,
  password: passwordSchema,
  password_confirm: z.string(),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  preferred_language: z.string().optional(),
  
  // Profile fields
  date_of_birth: z.string().optional(),
  gender: z.enum(['M', 'F', 'O']).optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  village: z.string().optional(),
  block: z.string().optional(),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string()
    .length(6, 'Pincode must be 6 digits')
    .regex(/^\d{6}$/, 'Invalid pincode'),
  
  // Bank details (optional)
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  ifsc_code: z.string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code')
    .optional()
    .or(z.literal('')),
  account_holder_name: z.string().optional(),
  education_level: z.string().optional(),
  
  // Farmer fields
  total_land_area: z.number().min(0.01, 'Land area must be greater than 0'),
  irrigated_land: z.number().min(0).optional(),
  rain_fed_land: z.number().min(0).optional(),
  farmer_category: z.enum(['marginal', 'small', 'semi_medium', 'medium', 'large']).optional(),
  caste_category: z.enum(['general', 'obc', 'sc', 'st']).optional(),
  
  // Government schemes (optional)
  has_kisan_credit_card: z.boolean().optional(),
  kcc_number: z.string().optional(),
  has_pmfby_insurance: z.boolean().optional(),
  pmfby_policy_number: z.string().optional(),
  has_pm_kisan: z.boolean().optional(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ['password_confirm'],
}).refine((data) => {
  const total = data.total_land_area;
  const irrigated = data.irrigated_land || 0;
  const rainfed = data.rain_fed_land || 0;
  return (irrigated + rainfed) <= total;
}, {
  message: "Irrigated + Rain-fed land cannot exceed total land",
  path: ['total_land_area'],
});

// ============================================================================
// PROFILE UPDATE SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  date_of_birth: z.string().optional(),
  gender: z.enum(['M', 'F', 'O']).optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  village: z.string().optional(),
  block: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string()
    .length(6, 'Pincode must be 6 digits')
    .regex(/^\d{6}$/, 'Invalid pincode')
    .optional(),
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  ifsc_code: z.string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code')
    .optional(),
  account_holder_name: z.string().optional(),
  education_level: z.string().optional(),
});

export const updateFarmerSchema = z.object({
  total_land_area: z.number().min(0.01).optional(),
  irrigated_land: z.number().min(0).optional(),
  rain_fed_land: z.number().min(0).optional(),
  farmer_category: z.enum(['marginal', 'small', 'semi_medium', 'medium', 'large']).optional(),
  caste_category: z.enum(['general', 'obc', 'sc', 'st']).optional(),
  has_kisan_credit_card: z.boolean().optional(),
  kcc_number: z.string().optional(),
  has_pmfby_insurance: z.boolean().optional(),
  pmfby_policy_number: z.string().optional(),
  has_pm_kisan: z.boolean().optional(),
});