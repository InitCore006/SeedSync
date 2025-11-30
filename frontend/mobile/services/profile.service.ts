import { apiClient } from '@/lib/api/client';
import { UserProfile, BankDetails, Document, AppSettings } from '@/types/profile.types';

class ProfileService {
  // Profile
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get('/profile');
    return response.data;
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.put('/profile', data);
    return response.data;
  }

  async uploadProfileImage(imageUri: string): Promise<string> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const response = await apiClient.post('/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrl;
  }

  // Bank Details
  async getBankDetails(): Promise<BankDetails[]> {
    const response = await apiClient.get('/profile/bank-details');
    return response.data;
  }

  async addBankAccount(
    data: Omit<BankDetails, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<BankDetails> {
    const response = await apiClient.post('/profile/bank-details', data);
    return response.data;
  }

  async updateBankAccount(id: string, data: Partial<BankDetails>): Promise<BankDetails> {
    const response = await apiClient.put(`/profile/bank-details/${id}`, data);
    return response.data;
  }

  async deleteBankAccount(id: string): Promise<void> {
    await apiClient.delete(`/profile/bank-details/${id}`);
  }

  async setPrimaryAccount(id: string): Promise<void> {
    await apiClient.post(`/profile/bank-details/${id}/set-primary`);
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    const response = await apiClient.get('/profile/documents');
    return response.data;
  }

  async uploadDocument(
    type: string,
    fileUri: string,
    documentNumber?: string
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('document', {
      uri: fileUri,
      type: 'image/jpeg',
      name: `${type}.jpg`,
    } as any);
    formData.append('type', type);
    if (documentNumber) {
      formData.append('documentNumber', documentNumber);
    }

    const response = await apiClient.post('/profile/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/profile/documents/${id}`);
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    const response = await apiClient.get('/profile/settings');
    return response.data;
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const response = await apiClient.put('/profile/settings', settings);
    return response.data;
  }

  // Support
  async createSupportTicket(data: {
    category: string;
    subject: string;
    description: string;
  }): Promise<void> {
    await apiClient.post('/support/tickets', data);
  }

  async getSupportTickets() {
    const response = await apiClient.get('/support/tickets');
    return response.data;
  }
}

export const profileService = new ProfileService();