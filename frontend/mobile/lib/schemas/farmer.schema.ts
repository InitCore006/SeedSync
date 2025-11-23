import { z } from 'zod';
import { phoneSchema, passwordSchema } from './auth.schema';

// ============================================================================
// FARMER REGISTRATION SCHEMAS
// ============================================================================

export const farmerRegistrationStep1Schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  father_husband_name: z.string().min(1, "Father's/Husband's name is required"),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['M', 'F', 'O'], { required_error: 'Please select gender' }),
  phone_number: phoneSchema,
});

export const farmerRegistrationStep2Schema = z.object({
  total_land_area: z.number()
    .min(0.01, 'Land area must be greater than 0')
    .max(10000, 'Please enter a valid land area'),
  village: z.string().min(1, 'Village is required'),
  block: z.string().optional(),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string()
    .length(6, 'Pincode must be 6 digits')
    .regex(/^\d{6}$/, 'Invalid pincode'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  crops_grown: z.array(z.string()).min(1, 'Select at least one crop'),
  expected_annual_production: z.number()
    .min(0.01, 'Expected production must be greater than 0'),
  has_storage: z.boolean(),
  storage_capacity: z.number().optional(),
});

export const farmerRegistrationStep3Schema = z.object({
  bank_account_number: z.string()
    .min(9, 'Account number must be at least 9 digits')
    .max(18, 'Account number must not exceed 18 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  ifsc_code: z.string()
    .length(11, 'IFSC code must be 11 characters')
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  bank_name: z.string().optional(),
  branch_name: z.string().optional(),
  upi_id: z.string()
    .regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format')
    .optional()
    .or(z.literal('')),
  aadhaar_number: z.string()
    .length(12, 'Aadhaar number must be 12 digits')
    .regex(/^\d{12}$/, 'Invalid Aadhaar number')
    .optional()
    .or(z.literal('')),
  password: passwordSchema,
  password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ['password_confirm'],
});

// ============================================================================
// LOT CREATION SCHEMAS
// ============================================================================

export const createLotStep1Schema = z.object({
  crop_type: z.string().min(1, 'Please select crop type'),
  variety: z.string().min(1, 'Please select variety'),
  quantity: z.number()
    .min(0.01, 'Quantity must be greater than 0')
    .max(100000, 'Please enter a valid quantity'),
  quality_grade: z.enum(['A+', 'A', 'B', 'C'], {
    required_error: 'Please select quality grade',
  }),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
});

export const createLotStep2Schema = z.object({
  moisture_content: z.number()
    .min(0, 'Moisture content must be 0 or greater')
    .max(100, 'Moisture content cannot exceed 100%')
    .optional(),
  oil_content: z.number()
    .min(0, 'Oil content must be 0 or greater')
    .max(100, 'Oil content cannot exceed 100%')
    .optional(),
  foreign_matter: z.number()
    .min(0, 'Foreign matter must be 0 or greater')
    .max(100, 'Foreign matter cannot exceed 100%')
    .optional(),
  damaged_seeds: z.number()
    .min(0, 'Damaged seeds must be 0 or greater')
    .max(100, 'Damaged seeds cannot exceed 100%')
    .optional(),
});

export const createLotStep3Schema = z.object({
  reserve_price: z.number()
    .min(1, 'Reserve price must be greater than 0')
    .max(1000000, 'Please enter a valid price'),
  pickup_location: z.string().min(1, 'Pickup location is required'),
  pickup_latitude: z.number().optional(),
  pickup_longitude: z.number().optional(),
  available_from: z.string().min(1, 'Start date is required'),
  available_to: z.string().min(1, 'End date is required'),
  packaging_type: z.enum(['jute_bags', 'plastic_bags', 'bulk'], {
    required_error: 'Please select packaging type',
  }),
});

// ============================================================================
// PROFILE UPDATE SCHEMA
// ============================================================================

export const updateFarmerProfileSchema = z.object({
  total_land_area: z.number().min(0.01).optional(),
  crops_grown: z.array(z.string()).min(1).optional(),
  expected_annual_production: z.number().min(0.01).optional(),
  has_storage: z.boolean().optional(),
  storage_capacity: z.number().optional(),
  bank_account_number: z.string().optional(),
  ifsc_code: z.string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code')
    .optional(),
  bank_name: z.string().optional(),
  branch_name: z.string().optional(),
  upi_id: z.string()
    .regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID')
    .optional()
    .or(z.literal('')),
});