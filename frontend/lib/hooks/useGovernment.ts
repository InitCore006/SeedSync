import useSWR from 'swr';
import { API } from '@/lib/api';
import { useState, useCallback } from 'react';

// Hook for national dashboard
export function useNationalDashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    '/government/dashboard',
    () => API.government.getDashboard()
  );

  return {
    dashboard: data?.data?.data,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook for state heatmap
export function useStateHeatmap(cropType?: string, year?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    cropType || year ? ['/government/heatmap', cropType, year] : '/government/heatmap',
    () => API.government.getHeatmap({ crop_type: cropType, year })
  );

  return {
    heatmap: data?.data?.data,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook for FPO monitoring
export function useFPOMonitoring(state?: string, district?: string) {
  const [filters, setFilters] = useState({ state, district });
  
  const { data, error, isLoading, mutate } = useSWR(
    ['/government/fpo-monitoring', filters.state, filters.district],
    () => API.government.getFPOMonitoring(filters),
    { revalidateOnFocus: false }
  );

  const updateFilters = useCallback((newFilters: { state?: string; district?: string }) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    data: data?.data?.data,
    fpos: data?.data?.data?.fpos || [],
    stats: data?.data?.data?.stats || {},
    isLoading,
    error,
    refresh: mutate,
    updateFilters,
  };
}

// Hook for farmer registry
export function useFarmerRegistry(
  state?: string, 
  district?: string, 
  kycStatus?: string, 
  cropType?: string
) {
  const [filters, setFilters] = useState({ state, district, kyc_status: kycStatus, crop_type: cropType });
  
  const { data, error, isLoading, mutate } = useSWR(
    ['/government/farmer-registry', filters.state, filters.district, filters.kyc_status, filters.crop_type],
    () => API.government.getFarmerRegistry(filters),
    { revalidateOnFocus: false }
  );

  const updateFilters = useCallback((newFilters: {
    state?: string;
    district?: string;
    kyc_status?: string;
    crop_type?: string;
  }) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    data: data?.data?.data,
    farmers: data?.data?.data?.farmers || [],
    stats: data?.data?.data?.stats || {},
    isLoading,
    error,
    refresh: mutate,
    updateFilters,
  };
}

// Hook for processor monitoring
export function useProcessorMonitoring(state?: string) {
  const [filterState, setFilterState] = useState(state);
  
  const { data, error, isLoading, mutate } = useSWR(
    ['/government/processor-monitoring', filterState],
    () => API.government.getProcessorMonitoring({ state: filterState }),
    { revalidateOnFocus: false }
  );

  return {
    data: data?.data?.data,
    processors: data?.data?.data?.processors || [],
    stats: data?.data?.data,
    isLoading,
    error,
    refresh: mutate,
    setFilterState,
  };
}

// Hook for retailer analytics
export function useRetailerAnalytics(state?: string) {
  const [filterState, setFilterState] = useState(state);
  
  const { data, error, isLoading, mutate } = useSWR(
    ['/government/retailer-analytics', filterState],
    () => API.government.getRetailerAnalytics({ state: filterState }),
    { revalidateOnFocus: false }
  );

  return {
    data: data?.data?.data,
    retailers: data?.data?.data?.retailers || [],
    stats: data?.data?.data,
    isLoading,
    error,
    refresh: mutate,
    setFilterState,
  };
}

// Hook for supply chain tracking
export function useSupplyChainTracking(status?: string, cropType?: string) {
  const [filters, setFilters] = useState({ status, crop_type: cropType });
  
  const { data, error, isLoading, mutate } = useSWR(
    ['/government/supply-chain-tracking', filters.status, filters.crop_type],
    () => API.government.getSupplyChainTracking(filters),
    { revalidateOnFocus: false }
  );

  const updateFilters = useCallback((newFilters: { status?: string; crop_type?: string }) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    data: data?.data?.data,
    shipments: data?.data?.data?.shipments || [],
    stats: data?.data?.data?.stats || {},
    isLoading,
    error,
    refresh: mutate,
    updateFilters,
  };
}

// Hook for procurement analytics
export function useProcurementAnalytics(
  cropType?: string,
  state?: string,
  days?: string
) {
  const [filters, setFilters] = useState({ crop_type: cropType, state, days });
  
  const { data, error, isLoading, mutate } = useSWR(
    ['/government/procurement-analytics', filters.crop_type, filters.state, filters.days],
    () => API.government.getProcurementAnalytics(filters),
    { revalidateOnFocus: false }
  );

  const updateFilters = useCallback((newFilters: {
    crop_type?: string;
    state?: string;
    days?: string;
  }) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    data: data?.data?.data,
    summary: data?.data?.data?.summary || {},
    cropBreakdown: data?.data?.data?.crop_breakdown || [],
    dailyTrends: data?.data?.data?.daily_trends || [],
    statusDistribution: data?.data?.data?.status_distribution || [],
    isLoading,
    error,
    refresh: mutate,
    updateFilters,
  };
}

// Hook for market prices
export function useMarketPrices(
  cropType?: string,
  state?: string,
  days?: string
) {
  const [filters, setFilters] = useState({ crop_type: cropType, state, days });
  
  const { data, error, isLoading, mutate } = useSWR(
    ['/government/market-prices', filters.crop_type, filters.state, filters.days],
    () => API.government.getMarketPrices(filters),
    { revalidateOnFocus: false }
  );

  const updateFilters = useCallback((newFilters: {
    crop_type?: string;
    state?: string;
    days?: string;
  }) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    data: data?.data?.data,
    summary: data?.data?.data?.summary || {},
    cropPrices: data?.data?.data?.crop_prices || [],
    priceTrends: data?.data?.data?.price_trends || [],
    isLoading,
    error,
    refresh: mutate,
    updateFilters,
  };
}

// Hook for approval queue
export function useApprovalQueue() {
  const { data, error, isLoading, mutate } = useSWR(
    '/government/approvals',
    () => API.government.getApprovals()
  );

  const approve = useCallback(async (userId: string) => {
    await API.government.approve(userId);
    mutate();
  }, [mutate]);

  const reject = useCallback(async (userId: string, reason?: string) => {
    await API.government.reject(userId, reason);
    mutate();
  }, [mutate]);

  return {
    approvals: data?.data?.results || [],
    isLoading,
    error,
    refresh: mutate,
    approve,
    reject,
  };
}
