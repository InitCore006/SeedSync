import { create } from 'zustand';
import { GovernmentScheme, SchemeFilters, SchemeApplication } from '@/types/scheme.types';

interface SchemeState {
  schemes: GovernmentScheme[];
  filters: SchemeFilters;
  bookmarkedSchemes: string[];
  applications: SchemeApplication[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSchemes: (schemes: GovernmentScheme[]) => void;
  setFilters: (filters: SchemeFilters) => void;
  toggleBookmark: (schemeId: string) => void;
  setApplications: (applications: SchemeApplication[]) => void;
  addApplication: (application: SchemeApplication) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetFilters: () => void;
}

export const useSchemeStore = create<SchemeState>((set) => ({
  schemes: [],
  filters: {},
  bookmarkedSchemes: [],
  applications: [],
  isLoading: false,
  error: null,

  setSchemes: (schemes) => set({ schemes }),
  
  setFilters: (filters) => set({ filters }),
  
  toggleBookmark: (schemeId) =>
    set((state) => ({
      bookmarkedSchemes: state.bookmarkedSchemes.includes(schemeId)
        ? state.bookmarkedSchemes.filter((id) => id !== schemeId)
        : [...state.bookmarkedSchemes, schemeId],
    })),
  
  setApplications: (applications) => set({ applications }),
  
  addApplication: (application) =>
    set((state) => ({
      applications: [...state.applications, application],
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  resetFilters: () => set({ filters: {} }),
}));