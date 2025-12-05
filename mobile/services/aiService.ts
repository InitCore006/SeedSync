import api from './api';
import { ENDPOINTS } from '@/constants/config';
import { AxiosResponse } from 'axios';

export const aiAPI = {
  // Detect disease from crop image
  detectDisease: (imageUri: string, crop_type: string): Promise<AxiosResponse<any>> => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'leaf.jpg';
    
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    } as any);
    formData.append('crop_type', crop_type);

    return api.post(ENDPOINTS.AI.DETECT_DISEASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Predict price for next N days
  predictPrice: (crop_type: string, days: number = 30): Promise<AxiosResponse<any>> => {
    return api.post(ENDPOINTS.AI.PREDICT_PRICE, {
      crop_type,
      days,
    });
  },
};
