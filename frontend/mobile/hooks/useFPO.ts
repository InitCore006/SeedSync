import { useEffect, useCallback } from 'react';
import { useFPOStore } from '@/store/fpoStore';
import { fpoService } from '@/services/fpo.service';
import { FPOFilters } from '@/types/fpo.types';

export const useFPO = () => {
  const {
    fpos,
    memberships,
    events,
    isLoading,
    error,
    setFPOs,
    setMemberships,
    addMembership,
    setEvents,
    setLoading,
    setError,
  } = useFPOStore();

  const loadFPOs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fpoService.getAllFPOs();
      setFPOs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FPOs');
      setFPOs([]);
    } finally {
      setLoading(false);
    }
  }, [setFPOs, setLoading, setError]);

  const searchFPOs = useCallback(
    async (filters: FPOFilters) => {
      try {
        setLoading(true);
        setError(null);
        const data = await fpoService.getFilteredFPOs(filters);
        setFPOs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search FPOs');
        setFPOs([]);
      } finally {
        setLoading(false);
      }
    },
    [setFPOs, setLoading, setError]
  );

  const loadMemberships = useCallback(async () => {
    try {
      const data = await fpoService.getMyMemberships();
      setMemberships(data || []);
    } catch (err) {
      console.error('Failed to load memberships:', err);
      setMemberships([]);
    }
  }, [setMemberships]);

  const loadEvents = useCallback(async (fpoId?: string) => {
    try {
      setLoading(true);
      const data = await fpoService.getFPOEvents(fpoId);
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [setEvents, setLoading, setError]);

  const applyForMembership = useCallback(
    async (fpoId: string) => {
      try {
        setLoading(true);
        setError(null);
        const membership = await fpoService.applyForMembership(fpoId);
        addMembership(membership);
        return membership;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to apply for membership');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addMembership, setLoading, setError]
  );

  const registerForEvent = useCallback(
    async (eventId: string) => {
      try {
        setLoading(true);
        setError(null);
        await fpoService.registerForEvent(eventId);
        // Reload events to update registration status
        await loadEvents();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to register for event');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadEvents, setLoading, setError]
  );

  useEffect(() => {
    loadFPOs();
    loadMemberships();
  }, []);

  return {
    fpos: fpos || [],
    memberships: memberships || [],
    events: events || [],
    isLoading: isLoading || false,
    error: error || null,
    loadFPOs,
    searchFPOs,
    loadMemberships,
    loadEvents,
    applyForMembership,
    registerForEvent,
  };
};