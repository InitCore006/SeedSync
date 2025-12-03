import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  UserProfile,
  FarmerProfile,
  CompleteProfile,
  BankDetails,
  BankDetailsFormData,
  Document,
  DocumentUploadData,
  AppSettings,
  UpdateUserProfileRequest,
  UpdateFarmerProfileRequest,
  ProfileCompletionStatus,
} from '@/types/profile.types';

export const profileService = {
  // ============================================================================
  // USER PROFILE
  // ============================================================================

  async getCompleteProfile(): Promise<CompleteProfile> {
    const response = await apiClient.get('/users/profile/');
    return response.data;
  },

  async updateUserProfile(data: UpdateUserProfileRequest): Promise<UserProfile> {
    const response = await apiClient.patch('/users/profile/', data);
    return response.data;
  },

  async uploadProfileImage(imageUri: string): Promise<string> {
    const formData = new FormData();
    
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    
    formData.append('profile_picture', {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    } as any);

    const response = await apiClient.patch('/users/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.profile_picture;
  },

  // ============================================================================
  // FARMER PROFILE (Combined Update)
  // ============================================================================

  async getFarmerProfile(): Promise<FarmerProfile> {
    const response = await apiClient.get('/farmers/me/');
    return response.data;
  },

  async updateFarmerProfile(data: any): Promise<any> {
    // This endpoint updates user + profile + farmer in one request
    const response = await apiClient.patch('/farmers/me/', data);
    return response.data;
  },

  // ============================================================================
  // BANK DETAILS
  // ============================================================================

  async getBankDetails(): Promise<BankDetails[]> {
    const response = await apiClient.get('/users/bank-details/');
    return response.data;
  },

  async addBankAccount(data: BankDetailsFormData): Promise<BankDetails> {
    const response = await apiClient.post('/users/bank-details/', data);
    return response.data;
  },

  async updateBankAccount(id: string, data: Partial<BankDetailsFormData>): Promise<BankDetails> {
    const response = await apiClient.patch(`/users/bank-details/${id}/`, data);
    return response.data;
  },

  async deleteBankAccount(id: string): Promise<void> {
    await apiClient.delete(`/users/bank-details/${id}/`);
  },

  async setPrimaryAccount(id: string): Promise<void> {
    await apiClient.post(`/users/bank-details/${id}/set-primary/`);
  },

  // ============================================================================
  // DOCUMENTS
  // ============================================================================

  async getDocuments(): Promise<Document[]> {
    const response = await apiClient.get('/users/documents/');
    return response.data;
  },

  async uploadDocument(data: DocumentUploadData): Promise<Document> {
    const formData = new FormData();
    
    formData.append('document_type', data.documentType);
    if (data.documentNumber) {
      formData.append('document_number', data.documentNumber);
    }
    formData.append('file', {
      uri: data.file.uri,
      type: data.file.type,
      name: data.file.name,
    } as any);

    const response = await apiClient.post('/users/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/users/documents/${id}/`);
  },

  // ============================================================================
  // SETTINGS
  // ============================================================================

  async getSettings(): Promise<AppSettings> {
    const response = await apiClient.get('/users/settings/');
    return response.data;
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const response = await apiClient.patch('/users/settings/', settings);
    return response.data;
  },

  // ============================================================================
  // PROFILE COMPLETION
  // ============================================================================

  async getProfileCompletion(): Promise<ProfileCompletionStatus> {
    const response = await apiClient.get('/users/profile/completion/');
    return response.data;
  },
};