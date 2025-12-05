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
  }) => api.get<PaginatedResponse<ProcurementLot>>('/lots/', { params }),

  // Get lot by ID
  getLot: (id: string) =>
    api.get<APIResponse<ProcurementLot>>(`/lots/${id}/`),

  // Create new lot
  createLot: (data: CreateLotRequest) =>
    api.post<APIResponse<ProcurementLot>>('/lots/create/', data),

  // Update lot
  updateLot: (id: string, data: Partial<CreateLotRequest>) =>
    api.patch<APIResponse<ProcurementLot>>(`/lots/${id}/`, data),

  // Delete lot
  deleteLot: (id: string) =>
    api.delete(`/lots/${id}/`),

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
  addMember: (farmer_id: string, share_capital: number) =>
    api.post<APIResponse>('/fpos/members/add/', { farmer_id, share_capital }),

  // Get procurement opportunities
  getProcurement: (params?: { crop_type?: string; quality_grade?: string }) =>
    api.get<PaginatedResponse<ProcurementLot>>('/fpos/procurement/', { params }),

  // Get warehouses
  getWarehouses: () =>
    api.get<APIResponse>('/fpos/warehouses/'),
};

// ============= Processor APIs =============
export const processorAPI = {
  // Get processor dashboard
  getDashboard: () =>
    api.get<APIResponse>('/processors/dashboard/'),

  // Get procurement opportunities
  getProcurement: (params?: { crop_type?: string }) =>
    api.get<PaginatedResponse<ProcurementLot>>('/processors/procurement/', { params }),

  // Get processing batches
  getBatches: (params?: { page?: number }) =>
    api.get<PaginatedResponse<any>>('/processors/batches/', { params }),

  // Create batch
  createBatch: (data: any) =>
    api.post<APIResponse>('/processors/batches/create/', data),

  // Get inventory
  getInventory: () =>
    api.get<APIResponse>('/processors/inventory/'),
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

// Export all APIs
export const API = {
  auth: authAPI,
  lots: lotsAPI,
  bids: bidsAPI,
  fpo: fpoAPI,
  processor: processorAPI,
  blockchain: blockchainAPI,
  government: governmentAPI,
  crops: cropsAPI,
  notifications: notificationsAPI,
};
