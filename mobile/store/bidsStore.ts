import { create } from 'zustand';
import { Bid } from '@/types/api';

interface BidsState {
  receivedBids: Bid[];
  sentBids: Bid[];
  selectedBid: Bid | null;
  isLoading: boolean;
  setReceivedBids: (bids: Bid[]) => void;
  setSentBids: (bids: Bid[]) => void;
  setSelectedBid: (bid: Bid | null) => void;
  updateBid: (id: number, updates: Partial<Bid>) => void;
  setLoading: (loading: boolean) => void;
}

export const useBidsStore = create<BidsState>((set) => ({
  receivedBids: [],
  sentBids: [],
  selectedBid: null,
  isLoading: false,

  setReceivedBids: (bids) => set({ receivedBids: bids }),
  
  setSentBids: (bids) => set({ sentBids: bids }),
  
  setSelectedBid: (bid) => set({ selectedBid: bid }),
  
  updateBid: (id, updates) => set((state) => ({
    receivedBids: state.receivedBids.map((bid) =>
      bid.id === id ? { ...bid, ...updates } : bid
    ),
    sentBids: state.sentBids.map((bid) =>
      bid.id === id ? { ...bid, ...updates } : bid
    ),
    selectedBid: state.selectedBid?.id === id
      ? { ...state.selectedBid, ...updates }
      : state.selectedBid,
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
}));
