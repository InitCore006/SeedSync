import { create } from 'zustand';
import { ProcurementLot } from '@/types/api';

interface LotsState {
  lots: ProcurementLot[];
  myLots: ProcurementLot[];
  selectedLot: ProcurementLot | null;
  isLoading: boolean;
  setLots: (lots: ProcurementLot[]) => void;
  setMyLots: (lots: ProcurementLot[]) => void;
  setSelectedLot: (lot: ProcurementLot | null) => void;
  addLot: (lot: ProcurementLot) => void;
  updateLot: (id: number, updates: Partial<ProcurementLot>) => void;
  removeLot: (id: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useLotsStore = create<LotsState>((set) => ({
  lots: [],
  myLots: [],
  selectedLot: null,
  isLoading: false,

  setLots: (lots) => set({ lots }),
  
  setMyLots: (lots) => set({ myLots: lots }),
  
  setSelectedLot: (lot) => set({ selectedLot: lot }),
  
  addLot: (lot) => set((state) => ({
    myLots: [lot, ...state.myLots],
    lots: [lot, ...state.lots],
  })),
  
  updateLot: (id, updates) => set((state) => ({
    lots: state.lots.map((lot) =>
      lot.id === id ? { ...lot, ...updates } : lot
    ),
    myLots: state.myLots.map((lot) =>
      lot.id === id ? { ...lot, ...updates } : lot
    ),
    selectedLot: state.selectedLot?.id === id
      ? { ...state.selectedLot, ...updates }
      : state.selectedLot,
  })),
  
  removeLot: (id) => set((state) => ({
    lots: state.lots.filter((lot) => lot.id !== id),
    myLots: state.myLots.filter((lot) => lot.id !== id),
    selectedLot: state.selectedLot?.id === id ? null : state.selectedLot,
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
}));
