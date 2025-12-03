// ============================================================================
// CROP TYPES (Aligned with Backend)
// ============================================================================

export type CropType =
  | 'groundnut'
  | 'mustard'
  | 'sunflower'
  | 'soybean'
  | 'sesame'
  | 'safflower'
  | 'castor'
  | 'linseed'
  | 'niger';

export type CropStatus =
  | 'planted'
  | 'growing'
  | 'flowering'
  | 'matured'
  | 'harvested'
  | 'processed'
  | 'sold';

export type InputType =
  | 'fertilizer'
  | 'pesticide'
  | 'herbicide'
  | 'seed'
  | 'irrigation';

export type QualityGrade = 'A' | 'B' | 'C' | 'D';

// ============================================================================
// MAIN CROP INTERFACE
// ============================================================================

export interface Crop {
  id: string;
  crop_id: string;
  farmer: string;
  fpo?: string;
  crop_type: CropType;
  crop_type_display: string;
  variety: string;
  planted_area: number;
  planting_date: string;
  expected_harvest_date: string;
  actual_harvest_date?: string;
  latitude?: number;
  longitude?: number;
  location_address: string;
  district: string;
  state: string;
  status: CropStatus;
  status_display: string;
  estimated_yield?: number;
  actual_yield?: number;
  oil_content_percentage?: number;
  moisture_content?: number;
  quality_grade?: QualityGrade;
  blockchain_hash?: string;
  farmer_name: string;
  fpo_name?: string;
  days_since_planting: number;
  days_until_harvest: number;
  created_at: string;
  updated_at: string;
}

export interface CropDetail extends Crop {
  farmer: {
    id: string;
    name: string;
    phone: string;
  };
  fpo?: {
    id: string;
    name: string;
  };
  added_by?: {
    id: string;
    name: string;
    role: string;
  };
  inputs_count: number;
  observations_count: number;
  has_harvest_record: boolean;
}

// ============================================================================
// CROP INPUT
// ============================================================================

export interface CropInput {
  id: string;
  crop: string;
  input_type: InputType;
  input_type_display: string;
  input_name: string;
  quantity: number;
  unit: string;
  application_date: string;
  cost?: number;
  notes?: string;
  added_by_name: string;
  created_at: string;
}

// ============================================================================
// CROP OBSERVATION
// ============================================================================

export interface CropObservation {
  id: string;
  crop: string;
  observation_date: string;
  plant_height?: number;
  leaf_color?: string;
  pest_infestation: boolean;
  disease_detected: boolean;
  disease_name?: string;
  soil_moisture?: number;
  temperature?: number;
  rainfall?: number;
  image?: string;
  image_url?: string;
  ai_analysis_result?: any;
  notes?: string;
  recorded_by_name: string;
  created_at: string;
}

// ============================================================================
// HARVEST RECORD
// ============================================================================

export interface HarvestRecord {
  id: string;
  crop: string;
  crop_details: {
    crop_id: string;
    crop_type: string;
    variety: string;
  };
  harvest_date: string;
  total_yield: number;
  oil_content: number;
  moisture_level: number;
  foreign_matter?: number;
  quality_grade: QualityGrade;
  storage_location?: string;
  storage_method?: string;
  organic_certified: boolean;
  certification_number?: string;
  market_price_per_quintal?: number;
  total_revenue?: number;
  harvested_by_name: string;
  created_at: string;
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface CropStatistics {
  total_crops: number;
  total_area: number;
  by_status: { [key: string]: number };
  by_crop_type: { [key: string]: number };
  active_crops: number;
  harvested_crops: number;
}

// ============================================================================
// FORM DATA
// ============================================================================

export interface CropFormData {
  crop_type: CropType;
  variety: string;
  planted_area: number;
  planting_date: string;
  expected_harvest_date: string;
  latitude?: number;
  longitude?: number;
  location_address?: string;
  district: string;
  state: string;
  estimated_yield?: number;
}

export interface UpdateCropData {
  variety?: string;
  planted_area?: number;
  expected_harvest_date?: string;
  status?: CropStatus;
  estimated_yield?: number;
  actual_yield?: number;
  oil_content_percentage?: number;
  moisture_content?: number;
  quality_grade?: QualityGrade;
  location_address?: string;
}

export interface CropInputFormData {
  crop: string;
  input_type: InputType;
  input_name: string;
  quantity: number;
  unit: string;
  application_date: string;
  cost?: number;
  notes?: string;
}

export interface ObservationFormData {
  crop: string;
  observation_date: string;
  plant_height?: number;
  leaf_color?: string;
  pest_infestation: boolean;
  disease_detected: boolean;
  disease_name?: string;
  soil_moisture?: number;
  temperature?: number;
  rainfall?: number;
  image?: any;
  notes?: string;
}

export interface HarvestFormData {
  crop: string;
  harvest_date: string;
  total_yield: number;
  oil_content: number;
  moisture_level: number;
  foreign_matter?: number;
  quality_grade: QualityGrade;
  storage_location?: string;
  storage_method?: string;
  organic_certified: boolean;
  certification_number?: string;
  market_price_per_quintal?: number;
  total_revenue?: number;
}

// ============================================================================
// TIMELINE EVENT
// ============================================================================

export interface TimelineEvent {
  event: string;
  date: string;
  status?: string;
  notes?: string;
  yield?: string;
}