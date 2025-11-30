import { z } from 'zod';

export const addCropSchema = z.object({
  name: z.string().min(2, 'Crop name must be at least 2 characters'),
  variety: z.string().min(2, 'Variety must be at least 2 characters'),
  category: z.enum(['oilseed', 'pulse', 'cereal', 'vegetable', 'fruit', 'cash_crop']),
  plantingDate: z.string().min(1, 'Planting date is required'),
  expectedHarvestDate: z.string().min(1, 'Expected harvest date is required'),
  area: z.number().positive('Area must be greater than 0'),
  areaUnit: z.enum(['acre', 'hectare', 'bigha']),
  soilType: z.string().min(1, 'Soil type is required'),
  irrigationType: z.enum(['drip', 'sprinkler', 'flood', 'rainfed']),
  seedSource: z.string().min(2, 'Seed source is required'),
  seedCost: z.number().positive('Seed cost must be greater than 0'),
  expectedYield: z.number().positive('Expected yield must be greater than 0'),
  notes: z.string().optional(),
});

export const updateCropSchema = addCropSchema.partial().extend({
  status: z.enum(['planning', 'planted', 'growing', 'flowering', 'harvesting', 'harvested', 'failed']).optional(),
  actualHarvestDate: z.string().optional(),
  actualYield: z.number().positive().optional(),
});

export const addCropActivitySchema = z.object({
  cropId: z.string().min(1, 'Crop ID is required'),
  type: z.enum(['irrigation', 'fertilizer', 'pesticide', 'weeding', 'inspection', 'harvesting', 'other']),
  title: z.string().min(2, 'Activity title is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  date: z.string().min(1, 'Date is required'),
  cost: z.number().positive().optional(),
  quantity: z.string().optional(),
  notes: z.string().optional(),
});

export const addHarvestRecordSchema = z.object({
  cropId: z.string().min(1, 'Crop ID is required'),
  harvestDate: z.string().min(1, 'Harvest date is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  quality: z.enum(['A', 'B', 'C']),
  moistureContent: z.number().min(0).max(100, 'Moisture content must be between 0-100%'),
  storageLocation: z.string().optional(),
  soldQuantity: z.number().min(0).optional(),
  soldPrice: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export type AddCropInput = z.infer<typeof addCropSchema>;
export type UpdateCropInput = z.infer<typeof updateCropSchema>;
export type AddCropActivityInput = z.infer<typeof addCropActivitySchema>;
export type AddHarvestRecordInput = z.infer<typeof addHarvestRecordSchema>;