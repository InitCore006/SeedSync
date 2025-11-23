import { useEffect, useState } from 'react';
import { useFarmerStore } from '@/store/farmerStore';
import { Lot, LotStatus } from '@/types/farmer.types';

export const useLots = (status?: LotStatus) => {
  const {
    lots,
    lotsLoading,
    selectedLot,
    loadLots,
    loadLotDetail,
    createLot,
    updateLot,
    deleteLot,
  } = useFarmerStore();

  const [refreshing, setRefreshing] = useState(false);

  // Load lots on mount
  useEffect(() => {
    loadLots(status);
  }, [status]);

  // Refresh function for pull-to-refresh
  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadLots(status);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter lots by status
  const activeLots = lots.filter((lot) => lot.status === 'ACTIVE');
  const soldLots = lots.filter((lot) => lot.status === 'SOLD');
  const expiredLots = lots.filter((lot) => lot.status === 'EXPIRED');
  const draftLots = lots.filter((lot) => lot.status === 'DRAFT');

  return {
    lots,
    activeLots,
    soldLots,
    expiredLots,
    draftLots,
    lotsLoading,
    selectedLot,
    refreshing,
    loadLots,
    loadLotDetail,
    createLot,
    updateLot,
    deleteLot,
    refresh,
  };
};