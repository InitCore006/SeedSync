import { useEffect, useCallback } from 'react';
import { useSchemeStore } from '@/store/schemeStore';
import { schemeService } from '@/services/scheme.service';
import { SchemeFilters, SchemeApplication } from '@/types/scheme.types';

export const useSchemes = () => {
  const {
    schemes,
    filters,
    bookmarkedSchemes,
    applications,
    isLoading,
    error,
    setSchemes,
    setFilters,
    toggleBookmark,
    setApplications,
    addApplication,
    setLoading,
    setError,
    resetFilters,
  } = useSchemeStore();

  const loadSchemes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await schemeService.getAllSchemes();
      setSchemes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schemes');
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  }, [setSchemes, setLoading, setError]);

  const loadApplications = useCallback(async () => {
    try {
      const data = await schemeService.getMyApplications();
      setApplications(data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
      setApplications([]);
    }
  }, [setApplications]);

  const searchSchemes = useCallback(
    async (searchFilters: SchemeFilters) => {
      try {
        setLoading(true);
        setError(null);
        setFilters(searchFilters);
        const data = await schemeService.getFilteredSchemes(searchFilters);
        setSchemes(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search schemes');
        setSchemes([]);
      } finally {
        setLoading(false);
      }
    },
    [setSchemes, setFilters, setLoading, setError]
  );

  const getBookmarkedSchemes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await schemeService.getBookmarkedSchemes(bookmarkedSchemes);
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
      return [];
    } finally {
      setLoading(false);
    }
  }, [bookmarkedSchemes, setLoading, setError]);

  const checkEligibility = useCallback(
    async (schemeId: string, farmerData: any) => {
      try {
        setLoading(true);
        const result = await schemeService.checkEligibility(schemeId, farmerData);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check eligibility');
        return { isEligible: false, reasons: ['Error checking eligibility'] };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const applyForScheme = useCallback(
    async (schemeId: string, applicationData?: any) => {
      try {
        setLoading(true);
        setError(null);
        
        const newApplication = await schemeService.applyForScheme(schemeId, applicationData);
        addApplication(newApplication);
        
        return newApplication;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to apply for scheme');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addApplication, setLoading, setError]
  );

  const withdrawApplication = useCallback(
    async (applicationId: string) => {
      try {
        setLoading(true);
        await schemeService.withdrawApplication(applicationId);
        
        // Update local state
        const updatedApplications = applications.filter(app => app.id !== applicationId);
        setApplications(updatedApplications);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to withdraw application');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applications, setApplications, setLoading, setError]
  );

  // Load initial data
  useEffect(() => {
    loadSchemes();
    loadApplications();
  }, []);

  return {
    schemes: schemes || [],
    filters: filters || {},
    bookmarkedSchemes: bookmarkedSchemes || [],
    applications: applications || [],
    isLoading: isLoading || false,
    error: error || null,
    loadSchemes,
    loadApplications,
    searchSchemes,
    toggleBookmark,
    getBookmarkedSchemes,
    checkEligibility,
    applyForScheme,
    withdrawApplication,
    resetFilters,
  };
};