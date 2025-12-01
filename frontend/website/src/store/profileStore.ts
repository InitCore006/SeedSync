import { create } from 'zustand';
import { FPO, Processor, Retailer } from '../types';

interface ProfileState {
  fpo: FPO | null;
  processor: Processor | null;
  retailer: Retailer | null;
  setFPO: (fpo: FPO | null) => void;
  setProcessor: (processor: Processor | null) => void;
  setRetailer: (retailer: Retailer | null) => void;
  clearProfiles: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  fpo: null,
  processor: null,
  retailer: null,
  setFPO: (fpo) => set({ fpo }),
  setProcessor: (processor) => set({ processor }),
  setRetailer: (retailer) => set({ retailer }),
  clearProfiles: () => set({ fpo: null, processor: null, retailer: null }),
}));