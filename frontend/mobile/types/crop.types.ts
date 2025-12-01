export interface Crop {
  id: string;
  crop_id: string;
  crop_type: 'groundnut' | 'mustard' | 'sunflower' | 'soybean' | 'sesame' | 'safflower' | 'castor' | 'linseed' | 'niger';
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
  status: 'planted' | 'growing' | 'flowering' | 'matured' | 'harvested' | 'processed' | 'sold';
  status_display: string;
  estimated_yield?: number;
  actual_yield?: number;
  oil_content_percentage?: number;
  moisture_content?: number;
  quality_grade?: string;
  blockchain_hash?: string;
  farmer_name: string;
  fpo_name?: string;
  days_since_planting: number;
  days_until_harvest: number;
  created_at: string;
  updated_at: string;
}

export interface CropInput {
  id: string;
  crop: string;
  input_type: 'fertilizer' | 'pesticide' | 'herbicide' | 'seed' | 'irrigation';
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
  quality_grade: string;
  storage_location?: string;
  storage_method?: string;
  organic_certified: boolean;
  certification_number?: string;
  market_price_per_quintal?: number;
  total_revenue?: number;
  harvested_by_name: string;
  created_at: string;
}

export interface CropStatistics {
  total_crops: number;
  total_area: number;
  by_status: { [key: string]: number };
  by_crop_type: { [key: string]: number };
  active_crops: number;
  harvested_crops: number;
}

export interface CropFormData {
  crop_type: string;
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