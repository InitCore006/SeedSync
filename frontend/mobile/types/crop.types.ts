export interface Crop {
  id: string;
  farmerId: string;
  name: string;
  variety: string;
  category: 'oilseed' | 'pulse' | 'cereal' | 'vegetable' | 'fruit' | 'cash_crop';
  plantingDate: string; // ISO date
  expectedHarvestDate: string; // ISO date
  actualHarvestDate?: string; // ISO date
  area: number; // in acres
  areaUnit: 'acre' | 'hectare' | 'bigha';
  fieldLocation: {
    latitude: number;
    longitude: number;
    address: string;
    surveyNumber?: string;
  };
  status: 'planning' | 'planted' | 'growing' | 'flowering' | 'harvesting' | 'harvested' | 'failed';
  soilType: string;
  irrigationType: 'drip' | 'sprinkler' | 'flood' | 'rainfed';
  seedSource: string;
  seedCost: number;
  expectedYield: number; // in quintals
  actualYield?: number; // in quintals
  growthStage: {
    current: string;
    percentage: number;
    daysRemaining: number;
  };
  healthScore: number; // 0-100
  riskFactors: RiskFactor[];
  weather: WeatherData;
  images: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskFactor {
  id: string;
  type: 'pest' | 'disease' | 'weather' | 'soil' | 'nutrient';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: string;
  resolved: boolean;
  recommendations: string[];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  forecast: {
    date: string;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    temperature: number;
    rainfall: number;
  }[];
}

export interface CropActivity {
  id: string;
  cropId: string;
  type: 'irrigation' | 'fertilizer' | 'pesticide' | 'weeding' | 'inspection' | 'harvesting' | 'other';
  title: string;
  description: string;
  date: string;
  cost?: number;
  quantity?: string;
  images?: string[];
  notes?: string;
  performedBy?: string;
  createdAt: string;
}

export interface HarvestRecord {
  id: string;
  cropId: string;
  harvestDate: string;
  quantity: number; // in quintals
  quality: 'A' | 'B' | 'C';
  moistureContent: number; // percentage
  storageLocation?: string;
  soldQuantity?: number;
  soldPrice?: number;
  revenue?: number;
  images: string[];
  notes?: string;
  createdAt: string;
}

export interface FarmAnalytics {
  totalCrops: number;
  activeCrops: number;
  totalArea: number;
  avgYield: number;
  totalRevenue: number;
  profitMargin: number;
  cropPerformance: {
    cropName: string;
    yield: number;
    revenue: number;
    profitMargin: number;
  }[];
  seasonalTrends: {
    season: string;
    avgYield: number;
    revenue: number;
  }[];
  soilHealthIndex: number;
  waterUsageEfficiency: number;
}

export interface CropRecommendation {
  cropName: string;
  variety: string;
  suitabilityScore: number; // 0-100
  expectedYield: number;
  expectedRevenue: number;
  investmentRequired: number;
  seasonality: string;
  reasons: string[];
  risks: string[];
}