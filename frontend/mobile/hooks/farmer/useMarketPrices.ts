import { useEffect, useState } from 'react';
import { useFarmerStore } from '@/store/farmerStore';

export const useMarketPrices = (cropType?: string) => {
  const { marketPrices, pricesLoading, loadMarketPrices } = useFarmerStore();

  const [refreshing, setRefreshing] = useState(false);

  // Load prices on mount
  useEffect(() => {
    loadMarketPrices(cropType);
  }, [cropType]);

  // Refresh function
  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadMarketPrices(cropType);
    } finally {
      setRefreshing(false);
    }
  };

  // Get price for specific crop
  const getPriceForCrop = (crop: string, variety?: string) => {
    return marketPrices.find(
      (price) =>
        price.crop_type === crop &&
        (!variety || price.variety === variety)
    );
  };

  return {
    marketPrices,
    pricesLoading,
    refreshing,
    loadMarketPrices,
    refresh,
    getPriceForCrop,
  };
};