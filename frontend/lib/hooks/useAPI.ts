import useSWR, { SWRConfiguration } from 'swr';
import useSWRMutation from 'swr/mutation';
import { API } from '@/lib/api';
import { ENV } from '@/lib/constants';
import type { PaginatedResponse, APIResponse } from '@/lib/types';

// Default SWR configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: ENV.SWR_REVALIDATE_ON_FOCUS,
  revalidateOnReconnect: ENV.SWR_REVALIDATE_ON_RECONNECT,
  dedupingInterval: ENV.SWR_DEDUPE_INTERVAL,
  shouldRetryOnError: false, // Don't retry on errors to prevent logout loops
  onError: (error) => {
    // Only log non-401 errors (401 is handled by axios interceptor)
    if (error?.response?.status !== 401) {
      console.error('SWR Error:', error?.response?.status, error?.response?.data);
    }
  },
};

// ============= Lots Hooks =============
export function useLots(params?: any) {
  const { data, error, isLoading, mutate } = useSWR(
    params ? ['/lots', params] : '/lots',
    () => API.lots.getLots(params),
    defaultConfig
  );

  return {
    lots: data?.data?.results || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useLot(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/lots/${id}` : null,
    () => (id ? API.lots.getLot(id) : null),
    defaultConfig
  );

  return {
    lot: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMarketPrices(crop?: string) {
  const { data, error, isLoading } = useSWR(
    crop ? `/lots/market-prices?crop=${crop}` : '/lots/market-prices',
    () => API.lots.getMarketPrices(crop),
    defaultConfig
  );

  return {
    prices: data?.data,
    isLoading,
    isError: error,
  };
}

// ============= Bids Hooks =============
export function useBids(params?: any) {
  const { data, error, isLoading, mutate } = useSWR(
    params ? ['/bids', params] : '/bids',
    () => API.bids.getBids(params),
    defaultConfig
  );

  return {
    bids: data?.data?.results || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useLotBids(lotId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    lotId ? `/bids/lot/${lotId}` : null,
    () => (lotId ? API.bids.getLotBids(lotId) : null),
    defaultConfig
  );

  return {
    bids: data?.data?.results || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMyBids() {
  const { data, error, isLoading, mutate } = useSWR(
    '/bids/my-bids',
    () => API.bids.getMyBids(),
    defaultConfig
  );

  return {
    myBids: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============= FPO Hooks =============
export function useFPOProfile() {
  const { data, error, isLoading, mutate } = useSWR(
    '/fpo/profile',
    () => API.fpo.getProfile(),
    defaultConfig
  );

  return {
    profile: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFPODashboard() {
  const { data, error, isLoading } = useSWR(
    '/fpo/dashboard',
    () => API.fpo.getDashboard(),
    defaultConfig
  );

  return {
    dashboard: data?.data,
    isLoading,
    isError: error,
  };
}

export function useFPOMembers(params?: any) {
  const { data, error, isLoading, mutate } = useSWR(
    params ? ['/fpo/members', params] : '/fpo/members',
    () => API.fpo.getMembers(params),
    defaultConfig
  );

  return {
    members: data?.data?.results || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFPOProcurement(params?: any) {
  const { data, error, isLoading } = useSWR(
    params ? ['/fpo/procurement', params] : '/fpo/procurement',
    () => API.fpo.getProcurement(params),
    defaultConfig
  );

  return {
    opportunities: data?.data?.results || [],
    meta: data?.meta,
    isLoading,
    isError: error,
  };
}

export function useFPOWarehouses() {
  const { data, error, isLoading, mutate } = useSWR(
    '/fpo/warehouses',
    () => API.fpo.getWarehouses(),
    defaultConfig
  );

  return {
    warehouses: Array.isArray(data?.data) ? data.data : [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFPOBids(params?: any) {
  const { data, error, isLoading, mutate } = useSWR(
    params ? ['/fpo/bids', params] : '/fpo/bids',
    () => API.fpo.getBids(params),
    defaultConfig
  );

  return {
    bids: data?.data?.results || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// ============= Processor Hooks =============
export function useProcessorDashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    '/processors/dashboard',
    () => API.processor.getDashboard(),
    defaultConfig
  );

  return {
    dashboard: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProcessorProfile() {
  const { data, error, isLoading, mutate } = useSWR(
    '/processors/profile',
    () => API.processor.getProfile(),
    defaultConfig
  );

  return {
    profile: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProcessorBids(params?: any) {
  const { data, error, isLoading, mutate } = useSWR(
    params ? ['/processors/bids', params] : '/processors/bids',
    () => API.processor.getBids(params),
    defaultConfig
  );

  return {
    bids: data?.data?.results || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProcessorProcurement(params?: any) {
  const { data, error, isLoading, mutate } = useSWR(
    params ? ['/processors/procurement', params] : '/processors/procurement',
    () => API.processor.getProcurement(params),
    defaultConfig
  );

  return {
    lots: data?.data?.results || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProcessorInventory() {
  const { data, error, isLoading, mutate } = useSWR(
    '/processors/inventory',
    () => API.processor.getInventory(),
    defaultConfig
  );

  return {
    inventory: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProcessingBatches(params?: any) {
  const { data, error, isLoading, mutate } = useSWR(
    params ? ['/processors/batches', params] : '/processors/batches',
    () => API.processor.getBatches(params),
    defaultConfig
  );

  return {
    batches: data?.data?.results || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============= Blockchain Hooks =============
export function useTraceability(lotId: string | null) {
  const { data, error, isLoading } = useSWR(
    lotId ? `/blockchain/trace/${lotId}` : null,
    () => (lotId ? API.blockchain.getTrace(lotId) : null),
    defaultConfig
  );

  return {
    trace: data?.data,
    isLoading,
    isError: error,
  };
}

// ============= Government Hooks =============
export function useGovtDashboard() {
  const { data, error, isLoading } = useSWR(
    '/government/dashboard',
    () => API.government.getDashboard(),
    {
      ...defaultConfig,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  return {
    dashboard: data?.data,
    isLoading,
    isError: error,
  };
}

export function useGovtHeatmap(params?: any) {
  const { data, error, isLoading } = useSWR(
    params ? ['/government/heatmap', params] : '/government/heatmap',
    () => API.government.getHeatmap(params),
    defaultConfig
  );

  return {
    heatmap: data?.data,
    isLoading,
    isError: error,
  };
}

export function useGovtFPOs(params?: any) {
  const { data, error, isLoading } = useSWR(
    params ? ['/government/fpos', params] : '/government/fpos',
    () => API.government.getFPOs(params),
    defaultConfig
  );

  return {
    fpos: data?.data?.results || [],
    meta: data?.meta,
    isLoading,
    isError: error,
  };
}

export function useApprovalQueue() {
  const { data, error, isLoading, mutate } = useSWR(
    '/government/approvals',
    () => API.government.getApprovals(),
    defaultConfig
  );

  return {
    approvals: data?.data?.results || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============= Crops Hooks =============
export function useCropsList() {
  const { data, error, isLoading } = useSWR(
    '/crops/master',
    () => API.crops.getCrops(),
    {
      ...defaultConfig,
      revalidateOnFocus: false, // Don't revalidate - static data
    }
  );

  return {
    crops: data?.data,
    isLoading,
    isError: error,
  };
}

export function useMandiPrices(params?: any) {
  const { data, error, isLoading } = useSWR(
    params ? ['/crops/mandi-prices', params] : '/crops/mandi-prices',
    () => API.crops.getMandiPrices(params),
    defaultConfig
  );

  return {
    prices: data?.data?.results || [],
    meta: data?.meta,
    isLoading,
    isError: error,
  };
}

export function usePriceTrends(crop: string, days?: number) {
  const { data, error, isLoading } = useSWR(
    crop ? `/crops/price-trends?crop=${crop}&days=${days || 30}` : null,
    () => (crop ? API.crops.getPriceTrends(crop, days) : null),
    defaultConfig
  );

  return {
    trends: data?.data,
    isLoading,
    isError: error,
  };
}

// ============= Notifications Hooks =============
export function useNotifications(params?: any) {
  const { data, error, isLoading, mutate } = useSWR(
    params ? ['/notifications', params] : '/notifications',
    () => API.notifications.getAll(params),
    {
      ...defaultConfig,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    notifications: data?.data?.results || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============= User Profile Hook =============
export function useUserProfile() {
  const { data, error, isLoading, mutate } = useSWR(
    '/users/profile',
    () => API.auth.getProfile(),
    defaultConfig
  );

  return {
    profile: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}
