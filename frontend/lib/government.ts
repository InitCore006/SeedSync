/**
 * Government Dashboard - Centralized Exports
 * 
 * Import everything you need for government pages from this single file
 */

// Hooks
export {
  useNationalDashboard,
  useStateHeatmap,
  useFPOMonitoring,
  useFarmerRegistry,
  useProcessorMonitoring,
  useRetailerAnalytics,
  useSupplyChainTracking,
  useProcurementAnalytics,
  useMarketPrices,
  useApprovalQueue,
} from './hooks/useGovernment';

// Store
export { useGovernmentStore } from './stores/governmentStore';

// API
export { API } from './api';

// Constants
export { CROPS, INDIAN_STATES, USER_ROLES, ENV } from './constants';

// Types - Government specific
export type {
  FPOMonitoring,
  FPOMonitoringStats,
  FarmerRegistry,
  FarmerRegistryStats,
  ProcessorMonitoring,
  ProcessorMonitoringStats,
  RetailerAnalytics,
  RetailerAnalyticsStats,
  Shipment,
  ShipmentStats,
  ProcurementSummary,
  CropBreakdown,
  DailyTrend,
  StatusDistribution,
  ProcurementAnalytics,
  PriceSummary,
  CropPrice,
  MarketPricesAnalytics,
  GovernmentDashboard,
  StateHeatmap,
  ApprovalRequest,
} from './types';

// Utilities - Government specific
export {
  // Formatting
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatIndianDate,
  quintalsToMetricTons,
  
  // Badges & Status
  getHealthScoreColor,
  getHealthStatus,
  getEfficiencyBadge,
  getFulfillmentBadge,
  getKYCBadge,
  getShipmentStatusBadge,
  getLotStatusBadge,
  getMSPBadge,
  
  // Calculations
  calculateVerificationRate,
  getTrendIndicator,
  daysDifference,
  
  // Data Export
  exportToCSV,
  
  // Helpers
  getStateName,
  getCropDisplayName,
  
  // General Utils
  cn,
  formatDate,
  formatRelativeTime,
  getInitials,
  truncate,
  parseAPIError,
} from './utils';
