import { useEffect, useState } from 'react';
import { useFarmerStore } from '@/store/farmerStore';
import { Lot, LotStatus } from '@/types/farmer.types';

export const useLots = (status?: LotStatus) => {
  const {
    lots = [],
    lotsLoading = false,
    selectedLot,
    loadLots,
    loadLotDetail,
    createLot,
    updateLot,
    deleteLot,
  } = useFarmerStore() || {};

  const [refreshing, setRefreshing] = useState(false);

  // Load lots on mount
  useEffect(() => {
    if (loadLots) {
      loadLots(status);
    }
  }, [status, loadLots]);

  // Refresh function for pull-to-refresh
  const refresh = async () => {
    if (!loadLots) return;
    setRefreshing(true);
    try {
      await loadLots(status);
    } catch (error) {
      console.error('Error refreshing lots:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter lots by status with null checks
  const activeLots = lots?.filter((lot) => lot?.status === 'ACTIVE') || [];
  const soldLots = lots?.filter((lot) => lot?.status === 'SOLD') || [];
  const expiredLots = lots?.filter((lot) => lot?.status === 'EXPIRED') || [];
  const draftLots = lots?.filter((lot) => lot?.status === 'DRAFT') || [];

  return {
    lots: lots || [],
    activeLots,
    soldLots,
    expiredLots,
    draftLots,
    lotsLoading: lotsLoading || false,
    selectedLot,
    refreshing,
    loadLots: loadLots || (() => Promise.resolve()),
    loadLotDetail: loadLotDetail || (() => Promise.resolve()),
    createLot: createLot || (() => Promise.resolve()),
    updateLot: updateLot || (() => Promise.resolve()),
    deleteLot: deleteLot || (() => Promise.resolve()),
    refresh,
  };
};