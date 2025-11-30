import { useEffect, useCallback } from 'react';
import { useLearningStore } from '@/store/learningStore';
import { learningService } from '@/services/learning.service';
import { LearningFilters } from '@/types/learning.types';

export const useLearning = () => {
  const {
    courses,
    bookmarkedCourses,
    filters,
    isLoading,
    error,
    setCourses,
    setFilters,
    toggleBookmark,
    setLoading,
    setError,
    resetFilters,
  } = useLearningStore();

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await learningService.getAllCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [setCourses, setLoading, setError]);

  const searchCourses = useCallback(
    async (searchFilters: LearningFilters) => {
      try {
        setLoading(true);
        setError(null);
        setFilters(searchFilters);
        const data = await learningService.getFilteredCourses(searchFilters);
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search courses');
      } finally {
        setLoading(false);
      }
    },
    [setCourses, setFilters, setLoading, setError]
  );

  const getBookmarkedCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await learningService.getBookmarkedCourses(bookmarkedCourses);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
      return [];
    } finally {
      setLoading(false);
    }
  }, [bookmarkedCourses, setLoading, setError]);

  useEffect(() => {
    loadCourses();
  }, []);

  return {
    courses,
    bookmarkedCourses,
    filters,
    isLoading,
    error,
    loadCourses,
    searchCourses,
    toggleBookmark,
    getBookmarkedCourses,
    resetFilters,
  };
};