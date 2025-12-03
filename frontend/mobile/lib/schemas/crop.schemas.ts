import { z } from 'zod';

// ============================================================================
// CROP FORM SCHEMAS
// ============================================================================

export const cropFormSchema = z.object({
  crop_type: z.string({
    required_error: 'Crop type is required',
  }).min(1, 'Crop type is required'),

  variety: z.string({
    required_error: 'Variety is required',
  }).min(1, 'Variety is required'),

  planting_date: z.string({
    required_error: 'Planting date is required',
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),

  expected_harvest_date: z.string({
    required_error: 'Expected harvest date is required',
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),

  planted_area: z.number({
    required_error: 'Planted area is required',
    invalid_type_error: 'Planted area must be a number',
  }).positive('Planted area must be greater than 0')
    .max(10000, 'Planted area cannot exceed 10,000 acres'),

  estimated_yield: z.number({
    invalid_type_error: 'Estimated yield must be a number',
  }).positive('Estimated yield must be greater than 0')
    .max(100000, 'Estimated yield cannot exceed 100,000 quintals')
    .optional(),

  // Location fields
  location_address: z.string().optional(),

  latitude: z.number({
    invalid_type_error: 'Latitude must be a number',
  }).min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),

  longitude: z.number({
    invalid_type_error: 'Longitude must be a number',
  }).min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),

  district: z.string({
    required_error: 'District is required',
  }).min(1, 'District is required'),

  state: z.string({
    required_error: 'State is required',
  }).min(1, 'State is required'),

  // Optional FPO
  fpo: z.string().optional(),
}).refine(
  (data) => {
    const plantingDate = new Date(data.planting_date);
    const harvestDate = new Date(data.expected_harvest_date);
    return harvestDate > plantingDate;
  },
  {
    message: 'Harvest date must be after planting date',
    path: ['expected_harvest_date'],
  }
).refine(
  (data) => {
    const plantingDate = new Date(data.planting_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return plantingDate <= today;
  },
  {
    message: 'Planting date cannot be in the future',
    path: ['planting_date'],
  }
).refine(
  (data) => {
    // If latitude is provided, longitude must also be provided and vice versa
    if (data.latitude !== undefined && data.longitude === undefined) {
      return false;
    }
    if (data.longitude !== undefined && data.latitude === undefined) {
      return false;
    }
    return true;
  },
  {
    message: 'Both latitude and longitude must be provided together',
    path: ['latitude'],
  }
);

export const updateCropSchema = z.object({
  variety: z.string({
    required_error: 'Variety is required',
  }).min(1, 'Variety is required'),

  planted_area: z.number({
    required_error: 'Planted area is required',
    invalid_type_error: 'Planted area must be a number',
  }).positive('Planted area must be greater than 0')
    .max(10000, 'Planted area cannot exceed 10,000 acres'),

  expected_harvest_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .optional(),

  estimated_yield: z.number({
    invalid_type_error: 'Estimated yield must be a number',
  }).positive('Estimated yield must be greater than 0')
    .max(100000, 'Estimated yield cannot exceed 100,000 quintals')
    .optional(),

  location_address: z.string().optional(),
}).partial(); // Make all fields optional for update

// ============================================================================
// CROP INPUT SCHEMA
// ============================================================================

export const cropInputSchema = z.object({
  crop: z.string({
    required_error: 'Crop ID is required',
  }).uuid('Invalid crop ID'),

  input_type: z.enum(['fertilizer', 'pesticide', 'herbicide', 'seed', 'irrigation', 'other'], {
    required_error: 'Input type is required',
    invalid_type_error: 'Invalid input type',
  }),

  input_name: z.string({
    required_error: 'Input name is required',
  }).min(1, 'Input name is required')
    .max(200, 'Input name cannot exceed 200 characters'),

  quantity: z.number({
    required_error: 'Quantity is required',
    invalid_type_error: 'Quantity must be a number',
  }).positive('Quantity must be greater than 0')
    .max(1000000, 'Quantity cannot exceed 1,000,000'),

  unit: z.string({
    required_error: 'Unit is required',
  }).min(1, 'Unit is required')
    .max(50, 'Unit cannot exceed 50 characters'),

  application_date: z.string({
    required_error: 'Application date is required',
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),

  cost: z.number({
    invalid_type_error: 'Cost must be a number',
  }).nonnegative('Cost cannot be negative')
    .max(10000000, 'Cost cannot exceed 10,000,000')
    .optional(),

  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
}).refine(
  (data) => {
    const applicationDate = new Date(data.application_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return applicationDate <= today;
  },
  {
    message: 'Application date cannot be in the future',
    path: ['application_date'],
  }
);

// ============================================================================
// OBSERVATION SCHEMA
// ============================================================================

export const observationSchema = z.object({
  crop: z.string({
    required_error: 'Crop ID is required',
  }).uuid('Invalid crop ID'),

  observation_date: z.string({
    required_error: 'Observation date is required',
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),

  plant_height: z.number({
    invalid_type_error: 'Plant height must be a number',
  }).positive('Plant height must be greater than 0')
    .max(1000, 'Plant height cannot exceed 1000 cm')
    .optional(),

  leaf_color: z.string()
    .max(100, 'Leaf color cannot exceed 100 characters')
    .optional(),

  pest_infestation: z.boolean().default(false),

  disease_detected: z.boolean().default(false),

  disease_name: z.string()
    .max(200, 'Disease name cannot exceed 200 characters')
    .optional(),

  soil_moisture: z.number({
    invalid_type_error: 'Soil moisture must be a number',
  }).min(0, 'Soil moisture cannot be negative')
    .max(100, 'Soil moisture cannot exceed 100%')
    .optional(),

  temperature: z.number({
    invalid_type_error: 'Temperature must be a number',
  }).min(-50, 'Temperature cannot be less than -50°C')
    .max(70, 'Temperature cannot exceed 70°C')
    .optional(),

  rainfall: z.number({
    invalid_type_error: 'Rainfall must be a number',
  }).min(0, 'Rainfall cannot be negative')
    .max(1000, 'Rainfall cannot exceed 1000 mm')
    .optional(),

  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),

  image: z.any().optional(), // File upload handled separately
}).refine(
  (data) => {
    const observationDate = new Date(data.observation_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return observationDate <= today;
  },
  {
    message: 'Observation date cannot be in the future',
    path: ['observation_date'],
  }
).refine(
  (data) => {
    // If disease is detected, disease name should be provided
    if (data.disease_detected && !data.disease_name) {
      return false;
    }
    return true;
  },
  {
    message: 'Disease name is required when disease is detected',
    path: ['disease_name'],
  }
);

// ============================================================================
// HARVEST SCHEMA
// ============================================================================

export const harvestSchema = z.object({
  crop: z.string({
    required_error: 'Crop ID is required',
  }).uuid('Invalid crop ID'),

  harvest_date: z.string({
    required_error: 'Harvest date is required',
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),

  total_yield: z.number({
    required_error: 'Total yield is required',
    invalid_type_error: 'Total yield must be a number',
  }).positive('Total yield must be greater than 0')
    .max(1000000, 'Total yield cannot exceed 1,000,000 quintals'),

  oil_content: z.number({
    required_error: 'Oil content is required',
    invalid_type_error: 'Oil content must be a number',
  }).min(0, 'Oil content cannot be negative')
    .max(100, 'Oil content cannot exceed 100%'),

  moisture_level: z.number({
    required_error: 'Moisture level is required',
    invalid_type_error: 'Moisture level must be a number',
  }).min(0, 'Moisture level cannot be negative')
    .max(100, 'Moisture level cannot exceed 100%'),

  quality_grade: z.enum(['A', 'B', 'C', 'D'], {
    required_error: 'Quality grade is required',
    invalid_type_error: 'Invalid quality grade',
  }),

  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
}).refine(
  (data) => {
    const harvestDate = new Date(data.harvest_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return harvestDate <= today;
  },
  {
    message: 'Harvest date cannot be in the future',
    path: ['harvest_date'],
  }
);

// ============================================================================
// STATUS UPDATE SCHEMA
// ============================================================================

export const statusUpdateSchema = z.object({
  status: z.enum(['growing', 'flowering', 'matured', 'harvested', 'sold'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status',
  }),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CropFormData = z.infer<typeof cropFormSchema>;
export type UpdateCropData = z.infer<typeof updateCropSchema>;
export type CropInputFormData = z.infer<typeof cropInputSchema>;
export type ObservationFormData = z.infer<typeof observationSchema>;
export type HarvestFormData = z.infer<typeof harvestSchema>;
export type StatusUpdateData = z.infer<typeof statusUpdateSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate crop form data
 */
export function validateCropForm(data: unknown): {
  success: boolean;
  data?: CropFormData;
  errors?: Record<string, string[]>;
} {
  try {
    const validated = cropFormSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: ['Validation failed'] } };
  }
}

/**
 * Validate crop input data
 */
export function validateCropInput(data: unknown): {
  success: boolean;
  data?: CropInputFormData;
  errors?: Record<string, string[]>;
} {
  try {
    const validated = cropInputSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: ['Validation failed'] } };
  }
}

/**
 * Validate observation data
 */
export function validateObservation(data: unknown): {
  success: boolean;
  data?: ObservationFormData;
  errors?: Record<string, string[]>;
} {
  try {
    const validated = observationSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: ['Validation failed'] } };
  }
}

/**
 * Validate harvest data
 */
export function validateHarvest(data: unknown): {
  success: boolean;
  data?: HarvestFormData;
  errors?: Record<string, string[]>;
} {
  try {
    const validated = harvestSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: ['Validation failed'] } };
  }
}

/**
 * Sanitize form data before submission
 */
export function sanitizeCropFormData(data: CropFormData): CropFormData {
  return {
    ...data,
    variety: data.variety.trim(),
    location_address: data.location_address?.trim(),
    district: data.district.trim(),
    state: data.state.trim(),
  };
}

/**
 * Sanitize input data before submission
 */
export function sanitizeInputData(data: CropInputFormData): CropInputFormData {
  return {
    ...data,
    input_name: data.input_name.trim(),
    unit: data.unit.trim(),
    notes: data.notes?.trim(),
  };
}

/**
 * Sanitize observation data before submission
 */
export function sanitizeObservationData(data: ObservationFormData): ObservationFormData {
  return {
    ...data,
    leaf_color: data.leaf_color?.trim(),
    disease_name: data.disease_name?.trim(),
    notes: data.notes?.trim(),
  };
}

/**
 * Sanitize harvest data before submission
 */
export function sanitizeHarvestData(data: HarvestFormData): HarvestFormData {
  return {
    ...data,
    notes: data.notes?.trim(),
  };
}

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALIDATION_LIMITS = {
  PLANTED_AREA: {
    MIN: 0.01,
    MAX: 10000,
  },
  ESTIMATED_YIELD: {
    MIN: 0.01,
    MAX: 100000,
  },
  PLANT_HEIGHT: {
    MIN: 0.1,
    MAX: 1000,
  },
  SOIL_MOISTURE: {
    MIN: 0,
    MAX: 100,
  },
  TEMPERATURE: {
    MIN: -50,
    MAX: 70,
  },
  RAINFALL: {
    MIN: 0,
    MAX: 1000,
  },
  OIL_CONTENT: {
    MIN: 0,
    MAX: 100,
  },
  MOISTURE_LEVEL: {
    MIN: 0,
    MAX: 100,
  },
  COST: {
    MIN: 0,
    MAX: 10000000,
  },
  QUANTITY: {
    MIN: 0.01,
    MAX: 1000000,
  },
  TOTAL_YIELD: {
    MIN: 0.01,
    MAX: 1000000,
  },
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_DATE: 'Invalid date format',
  FUTURE_DATE: 'Date cannot be in the future',
  PAST_DATE: 'Date must be in the future',
  POSITIVE_NUMBER: 'Must be a positive number',
  NEGATIVE_NUMBER: 'Cannot be negative',
  INVALID_RANGE: 'Value is outside valid range',
  HARVEST_BEFORE_PLANTING: 'Harvest date must be after planting date',
  DISEASE_NAME_REQUIRED: 'Disease name is required when disease is detected',
  COORDINATES_INCOMPLETE: 'Both latitude and longitude must be provided',
} as const;