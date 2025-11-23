import { apiClient } from '@lib/api/client';
import { API_ENDPOINTS } from '@lib/api/endpoints';
import {
  FarmerRegistrationStep1,
  FarmerRegistrationStep2,
  FarmerRegistrationStep3,
  FarmerRegistrationResponse,
  FarmerProfile,
  Lot,
  CreateLotStep1,
  CreateLotStep2,
  CreateLotStep3,
  MarketPrice,
  Transaction,
  NearbyFPO,
  AvailableWarehouse,
  WarehouseBooking,
  TransportRequest,
  TraceabilityRecord,
  FarmerDashboardStats,
} from '@/types/farmer.types';
import { PaginatedResponse } from '@/types/common.types';

export const farmerService = {
  // ============================================================================
  // REGISTRATION
  // ============================================================================

  async verifyPhone(phone_number: string): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.FARMER.REGISTRATION.VERIFY_PHONE,
      { phone_number }
    );
    return response.data;
  },

  async verifyOTP(phone_number: string, otp: string): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.FARMER.REGISTRATION.VERIFY_OTP,
      { phone_number, otp }
    );
    return response.data;
  },

  async registerStep1(data: FarmerRegistrationStep1): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.FARMER.REGISTRATION.STEP1,
      data
    );
    return response.data;
  },

  async registerStep2(data: FarmerRegistrationStep2): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.FARMER.REGISTRATION.STEP2,
      data
    );
    return response.data;
  },

  async registerStep3(data: FarmerRegistrationStep3): Promise<FarmerRegistrationResponse> {
    const response = await apiClient.post<FarmerRegistrationResponse>(
      API_ENDPOINTS.FARMER.REGISTRATION.STEP3,
      data
    );
    return response.data;
  },

  async getRegistrationProgress(): Promise<any> {
    const response = await apiClient.get(
      API_ENDPOINTS.FARMER.REGISTRATION.PROGRESS
    );
    return response.data;
  },

  async clearRegistrationSession(): Promise<any> {
    const response = await apiClient.post(
      API_ENDPOINTS.FARMER.REGISTRATION.CLEAR_SESSION
    );
    return response.data;
  },

  // ============================================================================
  // PROFILE
  // ============================================================================

  async getMyProfile(): Promise<FarmerProfile> {
    const response = await apiClient.get<FarmerProfile>(
      API_ENDPOINTS.FARMER.PROFILE.MY_PROFILE
    );
    return response.data;
  },

  async updateProfile(data: Partial<FarmerProfile>): Promise<FarmerProfile> {
    const response = await apiClient.patch<{ detail: string; data: FarmerProfile }>(
      API_ENDPOINTS.FARMER.PROFILE.UPDATE_PROFILE,
      data
    );
    return response.data.data;
  },

  async getNearbyFPOs(): Promise<NearbyFPO[]> {
    const response = await apiClient.get<{ count: number; fpos: NearbyFPO[] }>(
      API_ENDPOINTS.FARMER.PROFILE.NEARBY_FPOS
    );
    return response.data.fpos;
  },

  // ============================================================================
  // LOTS (PRODUCE LISTINGS)
  // ============================================================================

  async getMyLots(params?: { status?: string; page?: number }): Promise<PaginatedResponse<Lot>> {
    const response = await apiClient.get<PaginatedResponse<Lot>>(
      API_ENDPOINTS.FARMER.LOTS.MY_LOTS,
      { params }
    );
    return response.data;
  },

  async getLotDetail(id: string): Promise<Lot> {
    const response = await apiClient.get<Lot>(
      API_ENDPOINTS.FARMER.LOTS.DETAIL(id)
    );
    return response.data;
  },

  async createLot(data: CreateLotStep1 & CreateLotStep2 & CreateLotStep3): Promise<Lot> {
    const response = await apiClient.post<Lot>(
      API_ENDPOINTS.FARMER.LOTS.CREATE,
      data
    );
    return response.data;
  },

  async updateLot(id: string, data: Partial<Lot>): Promise<Lot> {
    const response = await apiClient.patch<Lot>(
      API_ENDPOINTS.FARMER.LOTS.UPDATE(id),
      data
    );
    return response.data;
  },

  async deleteLot(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.FARMER.LOTS.DELETE(id));
  },

  async uploadLotImages(id: string, images: FormData): Promise<Lot> {
    const response = await apiClient.post<Lot>(
      API_ENDPOINTS.FARMER.LOTS.UPLOAD_IMAGES(id),
      images,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async markLotAsSold(id: string, soldTo: string, soldPrice: number): Promise<Lot> {
    const response = await apiClient.post<Lot>(
      API_ENDPOINTS.FARMER.LOTS.MARK_SOLD(id),
      { sold_to: soldTo, sold_price: soldPrice }
    );
    return response.data;
  },

  async getMarketPrices(cropType?: string): Promise<MarketPrice[]> {
    const response = await apiClient.get<MarketPrice[]>(
      API_ENDPOINTS.FARMER.LOTS.MARKET_PRICES,
      { params: { crop_type: cropType } }
    );
    return response.data;
  },

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  async getMyTransactions(params?: { page?: number }): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(
      API_ENDPOINTS.FARMER.TRANSACTIONS.LIST,
      { params }
    );
    return response.data;
  },

  async getTransactionDetail(id: string): Promise<Transaction> {
    const response = await apiClient.get<Transaction>(
      API_ENDPOINTS.FARMER.TRANSACTIONS.DETAIL(id)
    );
    return response.data;
  },

  async getFarmerEarnings(): Promise<any> {
    const response = await apiClient.get(
      API_ENDPOINTS.FARMER.TRANSACTIONS.FARMER_EARNINGS
    );
    return response.data;
  },

  // ============================================================================
  // ORDERS
  // ============================================================================

  async getFarmerOrders(params?: { page?: number }): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<PaginatedResponse<any>>(
      API_ENDPOINTS.FARMER.ORDERS.FARMER_ORDERS,
      { params }
    );
    return response.data;
  },

  async getOrderDetail(id: string): Promise<any> {
    const response = await apiClient.get(
      API_ENDPOINTS.FARMER.ORDERS.DETAIL(id)
    );
    return response.data;
  },

  async downloadInvoice(id: string): Promise<Blob> {
    const response = await apiClient.get(
      API_ENDPOINTS.FARMER.ORDERS.INVOICE(id),
      { responseType: 'blob' }
    );
    return response.data;
  },

  // ============================================================================
  // TRACEABILITY
  // ============================================================================

  async getMyTraceabilityRecords(): Promise<TraceabilityRecord[]> {
    const response = await apiClient.get<TraceabilityRecord[]>(
      API_ENDPOINTS.FARMER.TRACEABILITY.MY_RECORDS
    );
    return response.data;
  },

  async getTraceabilityByQR(qrCode: string): Promise<TraceabilityRecord> {
    const response = await apiClient.get<TraceabilityRecord>(
      API_ENDPOINTS.FARMER.TRACEABILITY.QR_CODE(qrCode)
    );
    return response.data;
  },

  // ============================================================================
  // WAREHOUSE BOOKING
  // ============================================================================

  async getAvailableWarehouses(params?: {
    state?: string;
    district?: string;
    capacity?: number;
  }): Promise<AvailableWarehouse[]> {
    const response = await apiClient.get<AvailableWarehouse[]>(
      API_ENDPOINTS.FARMER.WAREHOUSE.AVAILABLE,
      { params }
    );
    return response.data;
  },

  async getMyWarehouseBookings(): Promise<WarehouseBooking[]> {
    const response = await apiClient.get<WarehouseBooking[]>(
      API_ENDPOINTS.FARMER.WAREHOUSE.MY_BOOKINGS
    );
    return response.data;
  },

  async createWarehouseBooking(data: Partial<WarehouseBooking>): Promise<WarehouseBooking> {
    const response = await apiClient.post<WarehouseBooking>(
      API_ENDPOINTS.FARMER.WAREHOUSE.CREATE_BOOKING,
      data
    );
    return response.data;
  },

  // ============================================================================
  // TRANSPORT
  // ============================================================================

  async createTransportRequest(data: Partial<TransportRequest>): Promise<TransportRequest> {
    const response = await apiClient.post<TransportRequest>(
      API_ENDPOINTS.FARMER.TRANSPORT.REQUEST,
      data
    );
    return response.data;
  },

  async getMyTransportRequests(): Promise<TransportRequest[]> {
    const response = await apiClient.get<TransportRequest[]>(
      API_ENDPOINTS.FARMER.TRANSPORT.MY_REQUESTS
    );
    return response.data;
  },

  async getTransportRequestDetail(id: string): Promise<TransportRequest> {
    const response = await apiClient.get<TransportRequest>(
      API_ENDPOINTS.FARMER.TRANSPORT.REQUEST_DETAIL(id)
    );
    return response.data;
  },

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  async getDashboardStats(): Promise<FarmerDashboardStats> {
    const response = await apiClient.get<FarmerDashboardStats>(
      API_ENDPOINTS.USER.DASHBOARD_STATS
    );
    return response.data;
  },
};