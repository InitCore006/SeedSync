import { useState, useEffect, useCallback } from 'react';
import { useCropStore } from '@/store/cropStore';

export function useCrops() {
  const {
    crops,
    statistics,
    isLoading,
    error,
    fetchMyCrops,
    fetchStatistics,
  } = useCropStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchMyCrops(),
        fetchStatistics(),
      ]);
    } catch (error) {
      console.error('Error loading crops data:', error);
    }
  };

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    crops,
    statistics,
    isLoading,
    error,
    refreshing,
    refresh,
  };
}

export function useCropDetail(cropId: string | undefined) {
  const {
    selectedCrop,
    inputs,
    observations,
    harvests,
    timeline,
    isLoadingDetail,
    fetchCropById,
    fetchCropInputs,
    fetchObservations,
    fetchHarvests,
    fetchCropTimeline,
  } = useCropStore();

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cropId && isValidUUID(cropId)) {
      loadCropData();
    } else if (cropId) {
      setError('Invalid crop ID');
    }
  }, [cropId]);

  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const loadCropData = async () => {
    if (!cropId || !isValidUUID(cropId)) {
      setError('Invalid crop ID');
      return;
    }

    setError(null);
    try {
      await Promise.all([
        fetchCropById(cropId),
        fetchCropInputs(cropId),
        fetchObservations(cropId),
        fetchHarvests(cropId),
        fetchCropTimeline(cropId),
      ]);
    } catch (err) {
      console.error('Error loading crop data:', err);
      setError('Failed to load crop data');
    }
  };

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCropData();
    } finally {
      setRefreshing(false);
    }
  }, [cropId]);

  return {
    crop: selectedCrop,
    inputs,
    observations,
    harvests,
    timeline,
    isLoading: isLoadingDetail,
    refreshing,
    refresh,
    error,
  };
}

export function useCropFilters() {
  const { crops } = useCropStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredCrops = crops.filter((crop) => {
    // Status filter
    if (selectedStatus !== 'all' && crop.status !== selectedStatus) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        crop.crop_type_display.toLowerCase().includes(query) ||
        crop.variety.toLowerCase().includes(query) ||
        crop.crop_id.toLowerCase().includes(query) ||
        crop.district.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return {
    filteredCrops,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
  };
}