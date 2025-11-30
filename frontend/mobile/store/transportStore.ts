import { create } from 'zustand';
import { Vehicle, TransportBooking } from '@/types/transport.types';

interface TransportState {
  vehicles: Vehicle[];
  bookings: TransportBooking[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setVehicles: (vehicles: Vehicle[]) => void;
  setBookings: (bookings: TransportBooking[]) => void;
  addBooking: (booking: TransportBooking) => void;
  updateBooking: (bookingId: string, updates: Partial<TransportBooking>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTransportStore = create<TransportState>((set) => ({
  vehicles: [],
  bookings: [],
  isLoading: false,
  error: null,

  setVehicles: (vehicles) => set({ vehicles }),
  
  setBookings: (bookings) => set({ bookings }),
  
  addBooking: (booking) =>
    set((state) => ({
      bookings: [booking, ...state.bookings],
    })),
  
  updateBooking: (bookingId, updates) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, ...updates } : booking
      ),
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));