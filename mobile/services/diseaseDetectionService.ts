import api from './api';
import { AxiosResponse } from 'axios';

export interface DiseaseDetectionResponse {
  disease: string;
  confidence_percentage: number;
  crop_type: string;
  solution: {
    disease_name: string;
    description: string;
    symptoms: string[];
    prevention: string[];
    treatment: string[];
    chemicals: string[];
    recommended_dose: string;
    cost_estimate: string;
    expert_contact: string;
  };
}

export const diseaseDetectionService = {
  /**
   * Detect crop disease from image
   */
  detectDisease: async (
    imageUri: string,
    cropType: 'groundnut' | 'soybean' | 'sunflower'
  ): Promise<DiseaseDetectionResponse> => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'crop-image.jpg';

    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    } as any);

    formData.append('crop_type', cropType);

    try {
      const response: AxiosResponse<any> = await api.post('/advisories/disease-predict/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('🔍 Full Response:', JSON.stringify(response.data, null, 2));
      
      // Handle both response formats:
      // Format 1: { status, message, data: {...} }
      // Format 2: { disease, confidence_percentage, ... } (direct data)
      let extractedData: DiseaseDetectionResponse;
      
      if (response.data.data) {
        // Format 1: Nested data
        console.log('✅ Using nested data format');
        extractedData = response.data.data;
      } else if (response.data.disease) {
        // Format 2: Direct data
        console.log('✅ Using direct data format');
        extractedData = response.data;
      } else {
        console.error('❌ Unknown response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      console.log('🔍 Extracted Data:', extractedData);
      console.log('✅ Disease:', extractedData.disease);
      console.log('✅ Confidence:', extractedData.confidence_percentage);
      
      return extractedData;
    } catch (error: any) {
      console.error('❌ Disease Detection Error:', error);
      console.error('❌ Error Response:', error.response?.data);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to detect disease'
      );
    }
  },
};
