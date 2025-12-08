import api from './api';
import { ENDPOINTS } from '@/constants/config';
import {
  LogisticsPartner,
  LogisticsPartnerCreateData,
  Vehicle,
  VehicleCreateData,
  Shipment,
  ShipmentCreateData,
  ShipmentUpdateStatus,
  PaginatedResponse,
  ApiSuccess,
} from '@/types/api';
import { AxiosResponse } from 'axios';

export const logisticsAPI = {
  // ============================================
  // LOGISTICS PARTNER
  // ============================================

  /**
   * Get my logistics partner profile
   */
  getMyProfile: (): Promise<AxiosResponse<LogisticsPartner>> => {
    return api.get(ENDPOINTS.LOGISTICS.MY_PROFILE);
  },

  /**
   * Create logistics partner profile (after registration)
   */
  createProfile: (data: LogisticsPartnerCreateData): Promise<AxiosResponse<LogisticsPartner>> => {
    return api.post(ENDPOINTS.LOGISTICS.PARTNERS, data);
  },

  /**
   * Update logistics partner profile
   */
  updateProfile: (id: string, data: FormData | Partial<LogisticsPartner>): Promise<AxiosResponse<LogisticsPartner>> => {
    return api.put(`${ENDPOINTS.LOGISTICS.PARTNERS}${id}/`, data, {
      headers: data instanceof FormData ? {
        'Content-Type': 'multipart/form-data',
      } : undefined,
    });
  },

  /**
   * Get partner statistics
   */
  getStats: (): Promise<
    AxiosResponse<{
      total_vehicles: number;
      total_shipments: number;
      active_shipments: number;
      completed_shipments: number;
      is_verified: boolean;
    }>
  > => {
    return api.get(ENDPOINTS.LOGISTICS.MY_STATS);
  },

  /**
   * Update logistics partner profile
   */
  updateProfile: (p0: string, formDataToSubmit: FormData, data: Partial<LogisticsPartner>): Promise<AxiosResponse<LogisticsPartner>> => {
    return api.patch(ENDPOINTS.LOGISTICS.MY_PROFILE, data);
  },

  // ============================================
  // VEHICLES
  // ============================================

  /**
   * Get all vehicles for logged-in partner
   */
  getVehicles: (params?: {
    vehicle_type?: string;
  }): Promise<AxiosResponse<PaginatedResponse<Vehicle>>> => {
    return api.get(ENDPOINTS.LOGISTICS.VEHICLES, { params });
  },

  /**
   * Add a new vehicle
   */
  addVehicle: (data: VehicleCreateData): Promise<AxiosResponse<Vehicle>> => {
    return api.post(ENDPOINTS.LOGISTICS.VEHICLES, data);
  },

  // ============================================
  // SHIPMENTS / BOOKINGS
  // ============================================

  /**
   * Get all shipments/bookings for the driver
   */
  getShipments: (params?: {
    status?: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
    lot_id?: number;
  }): Promise<AxiosResponse<PaginatedResponse<Shipment>>> => {
    return api.get(ENDPOINTS.LOGISTICS.SHIPMENTS, { params });
  },

  /**
   * Get shipment details
   */
  getShipmentDetail: (id: number): Promise<AxiosResponse<Shipment>> => {
    return api.get(ENDPOINTS.LOGISTICS.SHIPMENT_DETAIL(id));
  },

  /**
   * Accept a booking/trip
   */
  acceptBooking: (
    id: number,
    data: {
      vehicle_id: number;
      estimated_pickup_time?: string;
    }
  ): Promise<AxiosResponse<ApiSuccess<Shipment>>> => {
    return api.post(ENDPOINTS.LOGISTICS.ACCEPT_BOOKING(id), data);
  },

  /**
   * Reject a booking/trip
   */
  rejectBooking: (
    id: number,
    data: {
      rejection_reason: string;
      notes?: string;
    }
  ): Promise<AxiosResponse<ApiSuccess<Shipment>>> => {
    return api.post(ENDPOINTS.LOGISTICS.REJECT_BOOKING(id), data);
  },

  /**
   * Update shipment status (pickup complete, in-transit, delivered)
   */
  updateStatus: (id: number, data: ShipmentUpdateStatus): Promise<AxiosResponse<ApiSuccess<Shipment>>> => {
    return api.post(ENDPOINTS.LOGISTICS.UPDATE_STATUS(id), data);
  },

  /**
   * Update live location during transit
   */
  updateLocation: (
    id: number,
    data: {
      latitude: number;
      longitude: number;
      speed?: number;
      heading?: number;
    }
  ): Promise<AxiosResponse<ApiSuccess>> => {
    return api.post(ENDPOINTS.LOGISTICS.UPDATE_LOCATION(id), data);
  },

  /**
   * Get trip history (completed trips)
   */
  getTripHistory: (params?: {
    start_date?: string;
    end_date?: string;
    crop_type?: string;
  }): Promise<AxiosResponse<PaginatedResponse<Shipment>>> => {
    return api.get(ENDPOINTS.LOGISTICS.TRIP_HISTORY, { params });
  },

  /**
   * Get earnings data
   */
  getEarnings: (): Promise<
    AxiosResponse<{
      total_earnings: number;
      current_month_earnings: number;
      pending_payments: number;
      last_payment_date: string;
      average_earning_per_trip: number;
      payment_history: Array<{
        payment_id: string;
        amount: number;
        trip_count: number;
        payment_date: string;
        status: string;
      }>;
    }>
  > => {
    return api.get(ENDPOINTS.LOGISTICS.EARNINGS);
  },

  /**
   * Get performance metrics
   */
  getPerformance: (): Promise<
    AxiosResponse<{
      total_trips_completed: number;
      on_time_delivery_percentage: number;
      average_rating: number;
      total_distance_km: number;
      current_month_comparison: {
        trips: number;
        earnings: number;
      };
    }>
  > => {
    return api.get(ENDPOINTS.LOGISTICS.PERFORMANCE);
  },

  /**
   * Upload photo (pickup/delivery)
   */
  uploadPhoto: (imageUri: string, type: 'pickup' | 'delivery'): Promise<AxiosResponse<{ url: string }>> => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'photo.jpg';

    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    } as any);

    formData.append('type', type);

    return api.post('/logistics/upload-photo/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Report issue during trip
   */
  reportIssue: (
    shipmentId: number,
    data: {
      issue_type: string;
      issue_description: string;
      issue_photo?: string;
    }
  ): Promise<AxiosResponse<ApiSuccess>> => {
    return api.post(`/logistics/shipments/${shipmentId}/report-issue/`, data);
  },
};
