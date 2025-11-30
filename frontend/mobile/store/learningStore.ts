import { create } from 'zustand';
import { Course, LearningFilters } from '@/types/learning.types';

interface LearningState {
  courses: Course[];
  bookmarkedCourses: string[];
  filters: LearningFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCourses: (courses: Course[]) => void;
  setFilters: (filters: LearningFilters) => void;
  toggleBookmark: (courseId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetFilters: () => void;
}

export const useLearningStore = create<LearningState>((set) => ({
  courses: [],
  bookmarkedCourses: [],
  filters: {},
  isLoading: false,
  error: null,

  setCourses: (courses) => set({ courses }),
  
  setFilters: (filters) => set({ filters }),
  
  toggleBookmark: (courseId) =>
    set((state) => ({
      bookmarkedCourses: state.bookmarkedCourses.includes(courseId)
        ? state.bookmarkedCourses.filter((id) => id !== courseId)
        : [...state.bookmarkedCourses, courseId],
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  resetFilters: () => set({ filters: {} }),
}));