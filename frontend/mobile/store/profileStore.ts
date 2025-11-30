import { create } from 'zustand';
import { UserProfile, BankDetails, Document, AppSettings } from '@/types/profile.types';
import { profileService } from '@/services/profile.service';

interface ProfileState {
  // Data
  profile: UserProfile | null;
  bankDetails: BankDetails[];
  documents: Document[];
  settings: AppSettings | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadProfileImage: (imageUri: string) => Promise<void>;
  
  fetchBankDetails: () => Promise<void>;
  addBankAccount: (data: Omit<BankDetails, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBankAccount: (id: string, data: Partial<BankDetails>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  setPrimaryAccount: (id: string) => Promise<void>;
  
  fetchDocuments: () => Promise<void>;
  uploadDocument: (type: string, fileUri: string, documentNumber?: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial State
  profile: null,
  bankDetails: [],
  documents: [],
  settings: null,
  isLoading: false,
  error: null,

  // Fetch profile
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await profileService.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
        isLoading: false,
      });
    }
  },

  // Update profile
  updateProfile: async (data: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProfile = await profileService.updateProfile(data);
      set({ profile: updatedProfile, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update profile',
        isLoading: false,
      });
      throw error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (imageUri: string) => {
    set({ isLoading: true, error: null });
    try {
      const profileImage = await profileService.uploadProfileImage(imageUri);
      const currentProfile = get().profile;
      if (currentProfile) {
        set({ profile: { ...currentProfile, profileImage }, isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload image',
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch bank details
  fetchBankDetails: async () => {
    try {
      const bankDetails = await profileService.getBankDetails();
      set({ bankDetails });
    } catch (error) {
      console.error('Failed to fetch bank details:', error);
    }
  },

  // Add bank account
  addBankAccount: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newAccount = await profileService.addBankAccount(data);
      set({
        bankDetails: [...get().bankDetails, newAccount],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add bank account',
        isLoading: false,
      });
      throw error;
    }
  },

  // Update bank account
  updateBankAccount: async (id: string, data: Partial<BankDetails>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAccount = await profileService.updateBankAccount(id, data);
      set({
        bankDetails: get().bankDetails.map((acc) => (acc.id === id ? updatedAccount : acc)),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update bank account',
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete bank account
  deleteBankAccount: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await profileService.deleteBankAccount(id);
      set({
        bankDetails: get().bankDetails.filter((acc) => acc.id !== id),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete bank account',
        isLoading: false,
      });
      throw error;
    }
  },

  // Set primary account
  setPrimaryAccount: async (id: string) => {
    try {
      await profileService.setPrimaryAccount(id);
      set({
        bankDetails: get().bankDetails.map((acc) => ({
          ...acc,
          isPrimary: acc.id === id,
        })),
      });
    } catch (error) {
      console.error('Failed to set primary account:', error);
      throw error;
    }
  },

  // Fetch documents
  fetchDocuments: async () => {
    try {
      const documents = await profileService.getDocuments();
      set({ documents });
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  },

  // Upload document
  uploadDocument: async (type: string, fileUri: string, documentNumber?: string) => {
    set({ isLoading: true, error: null });
    try {
      const newDocument = await profileService.uploadDocument(type, fileUri, documentNumber);
      set({
        documents: [...get().documents, newDocument],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload document',
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await profileService.deleteDocument(id);
      set({
        documents: get().documents.filter((doc) => doc.id !== id),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete document',
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch settings
  fetchSettings: async () => {
    try {
      const settings = await profileService.getSettings();
      set({ settings });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  },

  // Update settings
  updateSettings: async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = await profileService.updateSettings(newSettings);
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  // Clear profile
  clearProfile: () => {
    set({
      profile: null,
      bankDetails: [],
      documents: [],
      settings: null,
      isLoading: false,
      error: null,
    });
  },
}));