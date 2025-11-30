import { create } from 'zustand';
import { FPO, FPOMembership, FPOEvent } from '@/types/fpo.types';

interface FPOState {
  fpos: FPO[];
  memberships: FPOMembership[];
  events: FPOEvent[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setFPOs: (fpos: FPO[]) => void;
  setMemberships: (memberships: FPOMembership[]) => void;
  addMembership: (membership: FPOMembership) => void;
  setEvents: (events: FPOEvent[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFPOStore = create<FPOState>((set) => ({
  fpos: [],
  memberships: [],
  events: [],
  isLoading: false,
  error: null,

  setFPOs: (fpos) => set({ fpos }),
  
  setMemberships: (memberships) => set({ memberships }),
  
  addMembership: (membership) =>
    set((state) => ({
      memberships: [...state.memberships, membership],
    })),
  
  setEvents: (events) => set({ events }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));