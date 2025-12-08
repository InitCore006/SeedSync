import api from './api';
import { AxiosResponse } from 'axios';
import { weatherService } from './weatherService';

export interface SoilData {
  type: string;
  ph_level: string;
  nutrients: string;
  water_retention: string;
}

export interface CropRecommendation {
  crop_name: string;
  crop_type: string;
  suitability_score: number;
  estimated_yield_per_acre: number;
  total_estimated_yield: number;
  current_msp: number;
  projected_gross_revenue: number;
  estimated_input_costs: {
    seed_cost: number;
    fertilizer_cost: number;
    pesticide_cost: number;
    labor_cost: number;
    irrigation_cost: number;
    total: number;
  };
  net_profit: number;
  profit_per_acre: number;
  growing_period_days: number;
  water_requirement: string;
  season: string;
  advantages: string[];
  challenges: string[];
  best_planting_time: string;
}

export interface CropPlanAnalysis {
  location: {
    district: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  soil_data: SoilData;
  weather_summary: {
    temperature: number;
    humidity: number;
    rainfall: number;
    season: string;
  };
  land_acres: number;
  recommendations: CropRecommendation[];
  analysis_date: string;
}

export interface CropPlan {
  id: number;
  farmer: number;
  crop_type: string;
  crop_name: string;
  land_allocated_acres: number;
  planting_date: string;
  expected_harvest_date: string;
  estimated_yield: number;
  estimated_revenue: number;
  status: 'planned' | 'in_progress' | 'harvested' | 'cancelled';
  cultivation_tasks: CultivationTask[];
  created_at: string;
}

export interface CultivationTask {
  id: number;
  task_name: string;
  description: string;
  scheduled_date: string;
  completed: boolean;
  completed_date?: string;
  notes?: string;
}

export const cropPlannerService = {
  /**
   * Analyze location and provide crop recommendations
   */
  analyzeCropRecommendations: async (
    latitude: number,
    longitude: number,
    land_acres: number,
    district: string,
    state: string
  ): Promise<CropPlanAnalysis> => {
    try {
      const response: AxiosResponse<any> = await api.post('/farmers/crop-planner/analyze/', {
        latitude,
        longitude,
        land_acres,
        district,
        state,
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Crop Planner Analysis Error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to analyze crop recommendations'
      );
    }
  },

  /**
   * Get current MSP for crops from government database
   */
  getCurrentMSP: async (crop_type: string): Promise<number> => {
    try {
      const response = await api.get('/crops/msp/current/', {
        params: { crop_type },
      });

      if (response.data && response.data.length > 0) {
        // Use total_msp which includes bonus, fallback to msp_per_quintal
        return parseFloat(response.data[0].total_msp || response.data[0].msp_per_quintal || 0);
      }
      
      // If no data found in backend, use fallback values
      return cropPlannerService.getDefaultMSP(crop_type);
    } catch (error) {
      console.error('Failed to fetch MSP from backend, using fallback:', error);
      return cropPlannerService.getDefaultMSP(crop_type);
    }
  },

  /**
   * Get default MSP fallback values
   */
  getDefaultMSP: (crop_type: string): number => {
    const defaultMSP: { [key: string]: number } = {
      groundnut: 6377,
      soybean: 4892,
      sunflower: 7050,
      mustard: 5650,
      safflower: 5650,
      sesame: 8635,
      linseed: 6930,
      niger: 7734,
      castor: 6950,
    };
    return defaultMSP[crop_type.toLowerCase()] || 5000;
  },

  /**
   * Get AI-powered crop recommendations using Gemini
   */
  getAICropRecommendations: async (
    state: string,
    district: string,
    latitude: number,
    longitude: number,
    season: string,
    soilType: string,
    weatherData: any
  ): Promise<{
    recommended_crops: Array<{
      crop_name: string;
      crop_type: string;
      suitability_score: number;
      reasoning: string;
      estimated_yield_per_acre: number;
    }>;
  }> => {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are an expert agricultural advisor for Indian oilseed crops. Based on the following parameters, recommend the top 3 most suitable oilseed crops:

📍 LOCATION:
- State: ${state}
- District: ${district}
- Coordinates: ${latitude}, ${longitude}

🌱 SOIL & CLIMATE:
- Soil Type: ${soilType}
- Season: ${season}
- Temperature: ${weatherData?.temp || 'N/A'}°C
- Humidity: ${weatherData?.humidity || 'N/A'}%
- Weather: ${weatherData?.description || 'N/A'}

🌾 OILSEED CROPS TO CONSIDER:
groundnut, soybean, sunflower, mustard, safflower, sesame, linseed, niger, castor

INSTRUCTIONS:
1. Recommend EXACTLY 3 crops most suitable for these conditions
2. Rank by suitability score (0-100)
3. Consider season compatibility, soil type, and climate
4. Provide estimated yield per acre in quintals
5. Give brief reasoning for each recommendation

OUTPUT FORMAT (JSON only, no markdown):
{
  "recommended_crops": [
    {
      "crop_name": "Groundnut",
      "crop_type": "groundnut",
      "suitability_score": 95,
      "reasoning": "Excellent for this region's sandy loam soil and ${season} season. High market demand.",
      "estimated_yield_per_acre": 12
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const text = (await result.response).text().trim();
      const cleaned = text.replace(/```json|```/g, '').trim();
      
      console.log('🤖 Gemini AI Response:', cleaned);
      
      const aiResponse = JSON.parse(cleaned);
      return aiResponse;
    } catch (error) {
      console.error('❌ AI Recommendation Error:', error);
      throw error;
    }
  },

  /**
   * Create a new crop plan (simplified financial model)
   */
  createCropPlan: async (planData: {
    crop_type: string;
    crop_name: string;
    land_acres: number;
    sowing_date: string;
    maturity_days: number;
    season: string;
    msp_price_per_quintal: number;
    estimated_yield_quintals: number;
    estimated_yield_per_acre: number;
    seed_cost: number;
    fertilizer_cost: number;
    pesticide_cost: number;
    labor_cost: number;
    irrigation_cost: number;
    notes?: string;
  }): Promise<any> => {
    try {
      const response = await api.post('/farmers/crop-plan/', planData);
      
      // Handle response - check for both success wrapper and direct data
      if (response.data.success) {
        return response.data.data;
      } else if (response.status === 201 && response.data) {
        // Direct data response without wrapper
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create crop plan');
      }
    } catch (error: any) {
      console.error('❌ Create Crop Plan Error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to create crop plan'
      );
    }
  },

  /**
   * Get all crop plans for the farmer (simplified model)
   */
  getMyCropPlans: async (): Promise<any[]> => {
    try {
      const response = await api.get('/farmers/crop-plan/');
      
      // After axios interceptor unwrapping, response.data is already { results: [...] }
      // Backend sends: { status: "success", data: { results: [...] }, meta: {...} }
      // Interceptor unwraps to: { results: [...] }
      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('❌ Get Crop Plans Error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch crop plans'
      );
    }
  },

  // Alias for consistency - just use the same implementation
  getCropPlans: async (): Promise<any[]> => {
    try {
      const response = await api.get('/farmers/crop-plan/');
      
      // After axios interceptor unwrapping, response.data is already { results: [...] }
      // Backend sends: { status: "success", data: { results: [...] }, meta: {...} }
      // Interceptor unwraps to: { results: [...] }
      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('❌ Get Crop Plans Error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch crop plans'
      );
    }
  },

  /**
   * Update crop plan status
   */
  updateCropPlanStatus: async (
    planId: string | number,
    status: string,
    actualYield?: number
  ): Promise<any> => {
    try {
      const payload: any = { status };
      if (actualYield) {
        payload.actual_yield_quintals = actualYield;
      }

      console.log('🔄 Updating crop plan status:', { planId, payload });
      
      // Use underscores as shown in Django URL patterns
      const url = `/farmers/crop-plan/${planId}/update_status/`;
      console.log('📍 URL:', url);
      
      const response = await api.post(url, payload);
      
      console.log('✅ Update Status Response:', response.data);
      
      // After interceptor unwrapping
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error: any) {
      console.error('❌ Update Status Error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Request URL:', error.config?.url);
      }
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to update crop plan status'
      );
    }
  },

  /**
   * Convert crop plan to procurement lot
   */
  convertPlanToLot: async (planId: string): Promise<any> => {
    try {
      // Use underscores as shown in Django URL patterns
      const response = await api.post(`/farmers/crop-plan/${planId}/convert_to_lot/`);
      
      console.log('✅ Convert to Lot Response:', response.data);
      
      // After interceptor unwrapping, response.data contains the actual data
      if (response.status === 201 || response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to convert to lot');
      }
    } catch (error: any) {
      console.error('❌ Convert to Lot Error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to convert crop plan to lot'
      );
    }
  },

  /**
   * Update crop plan status
   */
  updateCropPlan: async (
    planId: number,
    updates: Partial<CropPlan>
  ): Promise<CropPlan> => {
    try {
      const response: AxiosResponse<CropPlan> = await api.patch(
        `/farmers/crop-plans/${planId}/`,
        updates
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Update Crop Plan Error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update crop plan'
      );
    }
  },

  /**
   * Get soil data based on location (using district/state)
   */
  getSoilData: async (district: string, state: string): Promise<SoilData> => {
    // Simplified soil data based on major oilseed regions
    const soilDatabase: Record<string, SoilData> = {
      // Gujarat - Major groundnut producer
      gujarat: {
        type: 'Sandy loam to medium black soil',
        ph_level: '6.5-7.5',
        nutrients: 'Moderate nitrogen, good phosphorus',
        water_retention: 'Moderate',
      },
      // Madhya Pradesh - Soybean belt
      'madhya pradesh': {
        type: 'Black cotton soil (Vertisol)',
        ph_level: '7.0-8.5',
        nutrients: 'Rich in calcium, moderate nitrogen',
        water_retention: 'High',
      },
      // Rajasthan - Mustard and groundnut
      rajasthan: {
        type: 'Sandy to sandy loam',
        ph_level: '7.0-8.0',
        nutrients: 'Low organic matter, needs fertilization',
        water_retention: 'Low to moderate',
      },
      // Maharashtra - Soybean and groundnut
      maharashtra: {
        type: 'Black soil (Regur)',
        ph_level: '7.5-8.5',
        nutrients: 'Rich in iron, lime, and potash',
        water_retention: 'High',
      },
      // Karnataka - Sunflower and groundnut
      karnataka: {
        type: 'Red sandy loam',
        ph_level: '6.0-7.5',
        nutrients: 'Moderate fertility',
        water_retention: 'Moderate',
      },
      // Andhra Pradesh - Groundnut and sunflower
      'andhra pradesh': {
        type: 'Red loamy to sandy soil',
        ph_level: '6.5-7.5',
        nutrients: 'Good for oilseeds',
        water_retention: 'Moderate',
      },
      // Tamil Nadu - Groundnut
      'tamil nadu': {
        type: 'Red loam to clay loam',
        ph_level: '6.5-7.5',
        nutrients: 'Moderate to high fertility',
        water_retention: 'Moderate to high',
      },
    };

    const stateKey = state.toLowerCase();
    return (
      soilDatabase[stateKey] || {
        type: 'Loamy soil',
        ph_level: '6.5-7.5',
        nutrients: 'Moderate',
        water_retention: 'Moderate',
      }
    );
  },

  /**
   * Determine current season
   */
  getCurrentSeason: (): string => {
    const month = new Date().getMonth() + 1; // 1-12

    if (month >= 6 && month <= 9) {
      return 'kharif'; // Monsoon season (June-September)
    } else if (month >= 10 && month <= 3) {
      return 'rabi'; // Winter season (October-March)
    } else {
      return 'zaid'; // Summer season (March-June)
    }
  },

  /**
   * Calculate cultivation timeline
   */
  calculateCultivationTimeline: (
    plantingDate: string,
    growingPeriodDays: number
  ): CultivationTask[] => {
    const planting = new Date(plantingDate);
    const tasks: CultivationTask[] = [];

    // Task 1: Land preparation (7 days before planting)
    const landPrep = new Date(planting);
    landPrep.setDate(landPrep.getDate() - 7);
    tasks.push({
      id: 1,
      task_name: 'Land Preparation',
      description: 'Plough the field, level the land, and prepare seedbed',
      scheduled_date: landPrep.toISOString().split('T')[0],
      completed: false,
    });

    // Task 2: Sowing
    tasks.push({
      id: 2,
      task_name: 'Sowing',
      description: 'Sow seeds at recommended spacing and depth',
      scheduled_date: plantingDate,
      completed: false,
    });

    // Task 3: First irrigation (3 days after sowing)
    const firstIrrigation = new Date(planting);
    firstIrrigation.setDate(firstIrrigation.getDate() + 3);
    tasks.push({
      id: 3,
      task_name: 'First Irrigation',
      description: 'Provide first irrigation to ensure germination',
      scheduled_date: firstIrrigation.toISOString().split('T')[0],
      completed: false,
    });

    // Task 4: First weeding (20 days after sowing)
    const firstWeeding = new Date(planting);
    firstWeeding.setDate(firstWeeding.getDate() + 20);
    tasks.push({
      id: 4,
      task_name: 'First Weeding & Fertilizer',
      description: 'Remove weeds and apply first dose of fertilizer',
      scheduled_date: firstWeeding.toISOString().split('T')[0],
      completed: false,
    });

    // Task 5: Pest monitoring (30 days after sowing)
    const pestMonitoring = new Date(planting);
    pestMonitoring.setDate(pestMonitoring.getDate() + 30);
    tasks.push({
      id: 5,
      task_name: 'Pest Monitoring',
      description: 'Check for pests and diseases, apply pesticides if needed',
      scheduled_date: pestMonitoring.toISOString().split('T')[0],
      completed: false,
    });

    // Task 6: Second weeding (40 days after sowing)
    const secondWeeding = new Date(planting);
    secondWeeding.setDate(secondWeeding.getDate() + 40);
    tasks.push({
      id: 6,
      task_name: 'Second Weeding',
      description: 'Remove weeds and ensure proper plant growth',
      scheduled_date: secondWeeding.toISOString().split('T')[0],
      completed: false,
    });

    // Task 7: Flowering stage care (60 days after sowing)
    const floweringCare = new Date(planting);
    floweringCare.setDate(floweringCare.getDate() + 60);
    tasks.push({
      id: 7,
      task_name: 'Flowering Stage Care',
      description: 'Monitor moisture levels and apply micronutrients if needed',
      scheduled_date: floweringCare.toISOString().split('T')[0],
      completed: false,
    });

    // Task 8: Pre-harvest preparation (growingPeriod - 10 days)
    const preHarvest = new Date(planting);
    preHarvest.setDate(preHarvest.getDate() + growingPeriodDays - 10);
    tasks.push({
      id: 8,
      task_name: 'Pre-harvest Preparation',
      description: 'Stop irrigation, check crop maturity',
      scheduled_date: preHarvest.toISOString().split('T')[0],
      completed: false,
    });

    // Task 9: Harvesting
    const harvest = new Date(planting);
    harvest.setDate(harvest.getDate() + growingPeriodDays);
    tasks.push({
      id: 9,
      task_name: 'Harvesting',
      description: 'Harvest the crop when 80% pods are mature',
      scheduled_date: harvest.toISOString().split('T')[0],
      completed: false,
    });

    return tasks;
  },
};
