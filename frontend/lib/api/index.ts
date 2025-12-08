import { api } from './client';
import {
  LoginRequest,
  RegisterRequest,
  OTPRequest,
  AuthResponse,
  User,
  UserProfile,
  ProcurementLot,
  CreateLotRequest,
  Bid,
  CreateBidRequest,
  FPOProfile,
  FPOMembership,
  TraceabilityRecord,
  NationalDashboardData,
  FPOHealthScore,
  APIResponse,
  PaginatedResponse,
} from '@/lib/types';

// ============= Authentication APIs =============
export const authAPI = {
  // Register new user - sends OTP automatically
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/users/register/', data),

  // Send OTP for login
  sendLoginOTP: (phone_number: string) =>
    api.post('/users/send-otp/', { phone_number, purpose: 'login' }),

  // Send OTP for any purpose
  sendOTP: (data: { phone_number: string; purpose: 'registration' | 'login' | 'password_reset' }) =>
    api.post('/users/send-otp/', data),

  // Login with phone + OTP (no password)
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/users/login/', data),

  // Verify OTP
  verifyOTP: (data: OTPRequest) =>
    api.post<AuthResponse>('/users/verify-otp/', data),

  // Resend OTP
  resendOTP: (phone_number: string) =>
    api.post('/users/resend-otp/', { phone_number }),

  // Get current user profile
  getProfile: () =>
    api.get<APIResponse<UserProfile>>('/users/profile/'),

  // Update profile
  updateProfile: (data: Partial<UserProfile>) =>
    api.patch<APIResponse<UserProfile>>('/users/profile/', data),

  // Logout
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  },
};

// ============= Lots APIs =============
export const lotsAPI = {
  // Get all lots with filters
  getLots: (params?: {
    page?: number;
    page_size?: number;
    crop_type?: string;
    status?: string;
    quality_grade?: string;
    min_price?: number;
    max_price?: number;
  }) => api.get<PaginatedResponse<ProcurementLot>>('/lots/procurement/', { params }),

  // Get lot by ID
  getLot: (id: string) =>
    api.get<APIResponse<ProcurementLot>>(`/lots/procurement/${id}/`),

  // Create new lot
  createLot: (data: CreateLotRequest) =>
    api.post<APIResponse<ProcurementLot>>('/lots/procurement/', data),

  // Update lot
  updateLot: (id: string, data: Partial<CreateLotRequest>) =>
    api.patch<APIResponse<ProcurementLot>>(`/lots/procurement/${id}/`, data),

  // Delete lot
  deleteLot: (id: string) =>
    api.delete(`/lots/procurement/${id}/`),

  // Upload lot image
  uploadImage: (lotId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.upload<APIResponse>(`/lots/${lotId}/upload-image/`, formData);
  },

  // Get market prices
  getMarketPrices: (crop?: string) =>
    api.get<APIResponse>('/lots/market-prices/', { params: { crop } }),
};

// ============= Bids APIs =============
export const bidsAPI = {
  // Get all bids
  getBids: (params?: { page?: number; lot_id?: string }) =>
    api.get<PaginatedResponse<Bid>>('/bids/', { params }),

  // Get bid by ID
  getBid: (id: string) =>
    api.get<APIResponse<Bid>>(`/bids/${id}/`),

  // Create bid
  createBid: (data: CreateBidRequest) =>
    api.post<APIResponse<Bid>>('/bids/create/', data),

  // Accept bid
  acceptBid: (id: string) =>
    api.post<APIResponse>(`/bids/${id}/accept/`),

  // Reject bid
  rejectBid: (id: string) =>
    api.post<APIResponse>(`/bids/${id}/reject/`),

  // Get bids for specific lot
  getLotBids: (lotId: string) =>
    api.get<PaginatedResponse<Bid>>(`/bids/lot/${lotId}/`),

  // Get my bids (sent and received)
  getMyBids: () =>
    api.get<APIResponse>('/bids/my-bids/'),
};

// ============= FPO APIs =============
export const fpoAPI = {
  // Get FPO profile
  getProfile: () =>
    api.get<APIResponse<FPOProfile>>('/fpos/profile/'),

  // Update FPO profile
  updateProfile: (data: Partial<FPOProfile>) =>
    api.patch<APIResponse<FPOProfile>>('/fpos/profile/', data),

  // Get FPO dashboard data
  getDashboard: () =>
    api.get<APIResponse>('/fpos/dashboard/'),

  // Get members
  getMembers: (params?: { page?: number }) =>
    api.get<PaginatedResponse<FPOMembership>>('/fpos/members/', { params }),

  // Add member
  addMember: (phone_number: string) =>
    api.post<APIResponse>('/fpos/members/', { phone_number }),

  // Get procurement opportunities
  getProcurement: (params?: { 
    view?: 'available' | 'all';
    crop_type?: string; 
    quality_grade?: string;
    max_price?: number;
    page?: number;
  }) =>
    api.get<PaginatedResponse<ProcurementLot>>('/fpos/procurement/', { params }),

  // Get warehouses
  getWarehouses: () =>
    api.get<APIResponse>('/fpos/warehouses/'),
  
  // Create warehouse
  createWarehouse: (data: {
    warehouse_name: string;
    warehouse_code: string;
    warehouse_type: 'godown' | 'cold_storage' | 'warehouse' | 'shed';
    address: string;
    village?: string;
    district: string;
    state: string;
    pincode: string;
    capacity_quintals: number;
    latitude?: number;
    longitude?: number;
    has_scientific_storage?: boolean;
    has_pest_control?: boolean;
    has_fire_safety?: boolean;
    has_security?: boolean;
    weighing_capacity_quintals?: number;
    has_loading_unloading_facility?: boolean;
    has_quality_testing_lab?: boolean;
    incharge_name?: string;
    incharge_phone?: string;
    is_operational?: boolean;
    operational_since?: string;
    notes?: string;
  }) =>
    api.post<APIResponse>('/fpos/warehouses/', data),
  
  // Update warehouse
  updateWarehouse: (id: string, data: any) =>
    api.put<APIResponse>('/fpos/warehouses/', { id, ...data }),
  
  // Delete warehouse
  deleteWarehouse: (id: string) =>
    api.delete<APIResponse>('/fpos/warehouses/', { params: { id } }),
  
  // Get bids on FPO lots
  getBids: (params?: { status?: string }) =>
    api.get<APIResponse>('/fpos/bids/', { params }),
  
  // Accept bid
  acceptBid: (bid_id: string) =>
    api.patch<APIResponse>('/fpos/bids/', { bid_id, action: 'accept' }),
  
  // Reject bid
  rejectBid: (bid_id: string) =>
    api.patch<APIResponse>('/fpos/bids/', { bid_id, action: 'reject' }),
  
  // Create farmer account (for FPO to onboard farmers)
  createFarmer: (data: {
    phone_number: string;
    full_name: string;
    father_name?: string;
    total_land_acres: number;
    district: string;
    state: string;
    pincode: string;
    village?: string;
    primary_crops?: string[];
  }) =>
    api.post<APIResponse>('/fpos/create-farmer/', data),
  
  // Create lot on behalf of farmer member
  createFarmerLot: (data: {
    farmer_phone_number?: string;
    farmer_id?: string;
    crop_type: string;
    crop_variety?: string;
    crop_master_code?: string;
    crop_variety_code?: string;
    quantity_quintals: number;
    expected_price_per_quintal: number;
    harvest_date: string;
    quality_grade?: string;
    moisture_content?: number;
    oil_content?: number;
    warehouse_id?: string;
    description?: string;
    location_latitude?: number;
    location_longitude?: number;
  }) =>
    api.post<APIResponse>('/fpos/create-farmer-lot/', data),
  
  // Remove member (deactivate membership)
  removeMember: (membership_id: string) =>
    api.delete<APIResponse>(`/fpos/members/${membership_id}/remove/`),
  
  // Create aggregated bulk lot from member lots
  createAggregatedLot: (data: {
    parent_lot_ids: string[];
    crop_type: string;
    quality_grade: string;
    expected_price_per_quintal: number;
    warehouse_id?: string;
    description?: string;
  }) =>
    api.post<APIResponse>('/fpos/create-aggregated-lot/', data),
  
  // Assign warehouse to lot (FPO only)
  assignWarehouse: (data: {
    lot_id: string;
    warehouse_id: string;
  }) =>
    api.post<APIResponse>('/fpos/assign-warehouse/', data),
  
  // Get warehouse inventory details
  getWarehouseInventory: (warehouse_id?: string) =>
    api.get<APIResponse>('/fpos/warehouse-inventory/', { 
      params: warehouse_id ? { warehouse_id } : undefined 
    }),
};

// ============= Marketplace APIs =============
export const marketplaceAPI = {
  // Get marketplace listings (individual + FPO aggregated)
  getLots: (params?: {
    crop_type?: string;
    quality_grade?: string;
    listing_type?: string;
  }) =>
    api.get<PaginatedResponse<ProcurementLot>>('/lots/procurement/marketplace/', { params }),

  // Get processed products for B2B marketplace
  getProducts: (params?: {
    product_type?: string;
    processing_type?: string;
    quality_grade?: string;
    processor_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
  }) =>
    api.get<APIResponse>('/marketplace/products/', { params }),
};

// ============= Processor APIs =============
export const processorAPI = {
  // Get processor profile
  getProfile: () =>
    api.get<APIResponse>('/processors/profile/'),

  // Update processor profile
  updateProfile: (data: any) =>
    api.patch<APIResponse>('/processors/profile/', data),

  // Get processor dashboard
  getDashboard: () =>
    api.get<APIResponse>('/processors/dashboard/'),

  // Get bids
  getBids: (params?: { status?: string; page?: number }) =>
    api.get<PaginatedResponse<Bid>>('/processors/bids/', { params }),

  // Place bid
  placeBid: (data: { lot_id: string; bid_amount_per_quintal: number; quantity_quintals: number; remarks?: string }) =>
    api.post<APIResponse>('/processors/bids/', data),

  // Get procurement opportunities
  getProcurement: (params?: { 
    view?: 'available' | 'history';
    crop_type?: string; 
    quality_grade?: string;
    max_price?: number;
    min_quantity?: number;
    source?: 'farmer' | 'fpo';
    page?: number;
  }) =>
    api.get<PaginatedResponse<ProcurementLot>>('/processors/procurement/', { params }),

  // Get processing batches
  getBatches: (params?: { page?: number }) =>
    api.get<PaginatedResponse<any>>('/processors/batches/', { params }),

  // Get inventory
  getInventory: () =>
    api.get<APIResponse>('/processors/inventory/'),

  // Get processed products (oils in liters)
  getProducts: (params?: { 
    product_type?: string; 
    is_available?: boolean;
  }) =>
    api.get<APIResponse>('/processors/products/', { params }),

  // Create processed product
  createProduct: (data: any) =>
    api.post<APIResponse>('/processors/products/', data),

  // Update processed product
  updateProduct: (id: string, data: any) =>
    api.patch<APIResponse>(`/processors/products/${id}/`, data),

  // Delete processed product
  deleteProduct: (id: string) =>
    api.delete(`/processors/products/${id}/`),

  // Processing workflow
  startProcessing: (data: { batch_id: string }) =>
    api.post<APIResponse>('/processors/batches/start-processing/', data),

  completeProcessing: (data: {
    batch_id: string;
    oil_extracted_quintals: number;
    cake_produced_quintals: number;
    waste_quantity_quintals: number;
    quality_grade: string;
  }) =>
    api.post<APIResponse>('/processors/batches/complete-processing/', data),

  getFinishedGoods: () =>
    api.get<APIResponse>('/processors/finished-goods/'),

  listToMarketplace: (data: {
    finished_good_id: string;
    selling_price_per_liter: number;
    packaging_type?: string;
    processing_type?: string;
    description?: string;
  }) =>
    api.post<APIResponse>('/processors/finished-goods/list-to-marketplace/', data),

  // Order management - Incoming orders from retailers
  getOrders: (params?: { status?: string; page?: number }) =>
    api.get<APIResponse>('/processors/orders/', { params }),

  getOrder: (id: string) =>
    api.get<APIResponse>(`/processors/orders/${id}/`),

  updateOrderStatus: (id: string, data: {
    status: string;
    tracking_number?: string;
    notes?: string;
    cancellation_reason?: string;
  }) =>
    api.patch<APIResponse>(`/processors/orders/${id}/status/`, data),

  // Get processing batches (legacy)
  getBatchesManagement: (params?: { page?: number }) =>
    api.get<PaginatedResponse<any>>('/processors/batches-management/', { params }),

  // Create batch
  createBatch: (data: {
    plant: string;
    lot: string;
    initial_quantity_quintals: number;
    processing_method: 'cold_pressed' | 'hot_pressed' | 'expeller_pressed' | 'solvent_extraction';
    expected_completion_date?: string;
    notes?: string;
  }) =>
    api.post<APIResponse>('/processors/batches-management/', data),

  // Get processing plants
  getPlants: () =>
    api.get<APIResponse>('/processors/plants/'),

  // Create processing plant
  createPlant: (data: {
    plant_name: string;
    address: string;
    city: string;
    state: string;
    capacity_quintals_per_day: number;
  }) =>
    api.post<APIResponse>('/processors/plants/', data),

  // Update processing plant
  updatePlant: (id: string, data: {
    plant_name?: string;
    address?: string;
    city?: string;
    state?: string;
    capacity_quintals_per_day?: number;
  }) =>
    api.patch<APIResponse>(`/processors/plants/${id}/`, data),

  // Delete processing plant
  deletePlant: (id: string) =>
    api.delete<APIResponse>(`/processors/plants/${id}/`),

  // Start batch processing
  startBatch: (id: string) =>
    api.post<APIResponse>(`/processors/batches-management/${id}/start_batch/`, {}),

  // Pause batch (set status to on_hold)
  pauseBatch: (id: string) =>
    api.patch<APIResponse>(`/processors/batches-management/${id}/`, { status: 'on_hold' }),

  // Cancel batch
  cancelBatch: (id: string) =>
    api.patch<APIResponse>(`/processors/batches-management/${id}/`, { status: 'cancelled' }),

  // Complete batch with output recording
  completeBatch: (id: string, data: {
    oil_extracted_quintals: number;
    cake_produced_quintals: number;
  }) =>
    api.post<APIResponse>(`/processors/batches-management/${id}/record_output/`, data),
};

// ============= Blockchain APIs =============
export const blockchainAPI = {
  // Generate QR code for lot
  generateQR: (lot_id: string) =>
    api.post<APIResponse>('/blockchain/generate-qr/', { lot_id }),

  // Get traceability record
  getTrace: (lot_id: string) =>
    api.get<APIResponse<TraceabilityRecord>>(`/blockchain/trace/${lot_id}/`),

  // Verify QR code
  verifyQR: (qr_code: string) =>
    api.get<APIResponse>('/blockchain/verify-qr/', { params: { qr_code } }),

  // Download certificate
  downloadCertificate: (lot_id: string) =>
    api.get(`/blockchain/certificate/${lot_id}/`, { responseType: 'blob' }),
};

// ============= Government APIs =============
export const governmentAPI = {
  // Get national dashboard
  getDashboard: () =>
    api.get<APIResponse<NationalDashboardData>>('/government/dashboard/'),

  // Get state heatmap data
  getHeatmap: (params?: { crop_type?: string; year?: number }) =>
    api.get<APIResponse>('/government/heatmap/', { params }),

  // Get district performance
  getDistricts: (params?: { state?: string; crop_type?: string }) =>
    api.get<PaginatedResponse<any>>('/government/districts/', { params }),

  // Get FPO monitoring data
  getFPOs: (params?: { state?: string; health_score_min?: number }) =>
    api.get<PaginatedResponse<FPOHealthScore>>('/government/fpos/', { params }),

  // Get approval queue
  getApprovals: () =>
    api.get<PaginatedResponse<any>>('/government/approvals/'),

  // Approve registration
  approve: (user_id: string) =>
    api.post<APIResponse>(`/government/approve/${user_id}/`),

  // Reject registration
  reject: (user_id: string, reason?: string) =>
    api.post<APIResponse>(`/government/reject/${user_id}/`, { reason }),
};

// ============= Crops APIs =============
export const cropsAPI = {
  // Get crop master list
  getCrops: () =>
    api.get<APIResponse>('/crops/master/'),

  // Get mandi prices
  getMandiPrices: (params?: { crop?: string; mandi?: string; date?: string }) =>
    api.get<PaginatedResponse<any>>('/crops/mandi-prices/', { params }),

  // Get MSP records
  getMSP: (params?: { crop?: string; year?: number }) =>
    api.get<PaginatedResponse<any>>('/crops/msp/', { params }),

  // Get price trends
  getPriceTrends: (crop: string, days?: number) =>
    api.get<APIResponse>('/crops/price-trends/', { params: { crop, days } }),
};

// ============= Notifications APIs =============
export const notificationsAPI = {
  // Get all notifications
  getAll: (params?: { is_read?: boolean; page?: number }) =>
    api.get<PaginatedResponse<any>>('/notifications/', { params }),

  // Mark as read
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read/`),

  // Mark all as read
  markAllAsRead: () =>
    api.post('/notifications/mark-all-read/'),
};

// ============= Retailer APIs =============
export const retailerAPI = {
  // Get retailer dashboard
  getDashboard: () =>
    api.get<APIResponse>('/retailers/dashboard/'),

  // Get orders
  getOrders: (params?: { status?: string }) =>
    api.get<APIResponse>('/retailers/orders/', { params }),

  // Create order (quick order with just product_id and quantity_liters)
  createOrder: (data: { product_id: string; quantity_liters: number }) =>
    api.post<APIResponse>('/retailers/orders/quick/', data),

  // Get order details
  getOrder: (id: string) =>
    api.get<APIResponse>(`/retailers/orders/${id}/`),

  // Download invoice
  downloadInvoice: async (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('seedsync_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const response = await fetch(`${apiUrl}/retailers/orders/${id}/invoice/`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }
    return await response.blob();
  },

  // Get inventory
  getInventory: (params?: { stock_status?: string }) =>
    api.get<APIResponse>('/retailers/inventory/', { params }),

  // Get suppliers
  getSuppliers: () =>
    api.get<APIResponse>('/retailers/suppliers/'),
};

// Import payments API
import { paymentsAPI } from './payments';

// Export all APIs
export const API = {
  auth: authAPI,
  lots: lotsAPI,
  bids: bidsAPI,
  fpo: fpoAPI,
  processor: processorAPI,
  retailer: retailerAPI,
  blockchain: blockchainAPI,
  government: governmentAPI,
  crops: cropsAPI,
  notifications: notificationsAPI,
  marketplace: marketplaceAPI,
  payments: paymentsAPI,
};

export default API;