import { useEffect, useCallback } from 'react';
import { useTransportStore } from '@/store/transportStore';
import { transportService } from '@/services/transport.service';
import { TransportBooking } from '@/types/transport.types';

export const useTransport = () => {
  const {
    vehicles,
    bookings,
    isLoading,
    error,
    setVehicles,
    setBookings,
    addBooking,
    updateBooking,
    setLoading,
    setError,
  } = useTransportStore();

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transportService.getVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [setVehicles, setLoading, setError]);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transportService.getBookings();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [setBookings, setLoading, setError]);

  const createBooking = useCallback(
    async (bookingData: Omit<TransportBooking, 'id' | 'status' | 'createdAt'>) => {
      try {
        setLoading(true);
        setError(null);
        const newBooking = await transportService.createBooking(bookingData);
        addBooking(newBooking);
        return newBooking;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create booking');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addBooking, setLoading, setError]
  );

  const cancelBooking = useCallback(
    async (bookingId: string) => {
      try {
        setLoading(true);
        setError(null);
        await transportService.cancelBooking(bookingId);
        updateBooking(bookingId, { status: 'cancelled' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to cancel booking');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateBooking, setLoading, setError]
  );

  const getTrackingUpdates = useCallback(
    async (bookingId: string) => {
      try {
        const updates = await transportService.getTrackingUpdates(bookingId);
        return updates;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get tracking updates');
        return [];
      }
    },
    [setError]
  );

  const calculateEstimate = useCallback(
    (distance: number, vehicleType: string) => {
      return transportService.calculateEstimate(distance, vehicleType);
    },
    []
  );

  useEffect(() => {
    loadVehicles();
    loadBookings();
  }, []);

  return {
    vehicles,
    bookings,
    isLoading,
    error,
    loadVehicles,
    loadBookings,
    createBooking,
    cancelBooking,
    getTrackingUpdates,
    calculateEstimate,
  };
};