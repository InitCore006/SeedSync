import useSWR from 'swr';
import { API } from '@/lib/api';

/**
 * Custom hook for fetching retailer dashboard data
 */
export function useRetailerDashboard() {
  const { data, error, mutate, isLoading } = useSWR(
    'retailer-dashboard',
    () => API.retailer.getDashboard()
  );

  return {
    dashboard: data?.data?.data,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}

/**
 * Custom hook for fetching retailer orders
 */
export function useRetailerOrders(status?: string) {
  const { data, error, mutate, isLoading } = useSWR(
    ['retailer-orders', status],
    () => API.retailer.getOrders(status ? { status } : undefined)
  );

  return {
    orders: data?.data?.data || [],
    isLoading,
    isError: error,
    refetch: mutate,
  };
}

/**
 * Custom hook for fetching specific order details
 */
export function useRetailerOrder(orderId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    orderId ? ['retailer-order', orderId] : null,
    () => API.retailer.getOrder(orderId)
  );

  return {
    order: data?.data?.data,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}

/**
 * Custom hook for fetching retailer inventory
 */
export function useRetailerInventory(stockStatus?: string) {
  const { data, error, mutate, isLoading } = useSWR(
    ['retailer-inventory', stockStatus],
    () => API.retailer.getInventory(stockStatus ? { stock_status: stockStatus } : undefined)
  );

  return {
    inventory: data?.data?.data || [],
    isLoading,
    isError: error,
    refetch: mutate,
  };
}

/**
 * Custom hook for fetching retailer suppliers
 */
export function useRetailerSuppliers() {
  const { data, error, mutate, isLoading } = useSWR(
    'retailer-suppliers',
    () => API.retailer.getSuppliers()
  );

  return {
    suppliers: data?.data?.data || [],
    isLoading,
    isError: error,
    refetch: mutate,
  };
}

/**
 * Custom hook for fetching marketplace products
 */
export function useMarketplaceProducts(filters?: {
  product_type?: string;
  processing_type?: string;
  quality_grade?: string;
  processor_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
}) {
  const { data, error, mutate, isLoading } = useSWR(
    ['marketplace-products', filters],
    () => API.marketplace.getProducts(filters)
  );

  return {
    products: data?.data?.data || [],
    isLoading,
    isError: error,
    refetch: mutate,
  };
}
