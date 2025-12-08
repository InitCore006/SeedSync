const HUGGINGFACE_API_URL = 'https://prembagga29-croprecommendation.hf.space/predict';

export interface CropPredictionInput {
  state: string;
  district: string;
  season: string;
  soil_type: string;
  water_level: string;
}

export interface CropPredictionResponse {
  crop: string;
}

/**
 * Crop Recommendation Service using trained Hugging Face model
 */
export const cropRecommendationService = {
  /**
   * Get crop recommendation from ML model
   */
  predictCrop: async (input: CropPredictionInput): Promise<string> => {
    try {
      const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: input.state.toLowerCase(),
          district: input.district.toLowerCase(),
          season: input.season.toLowerCase(),
          soil_type: input.soil_type.toLowerCase().replace(' soil', ''),
          water_level: input.water_level.toLowerCase(),
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: CropPredictionResponse = await response.json();
      
      // Capitalize crop name for display
      return data.crop.charAt(0).toUpperCase() + data.crop.slice(1);
    } catch (error) {
      console.error('Crop Prediction Error:', error);
      throw new Error('Failed to get crop recommendation. Please check your connection and try again.');
    }
  },
};
