export type VehicleType = 'mini-truck' | 'truck' | 'tractor-trolley' | 'tempo';
export type BookingStatus = 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';

export interface Vehicle {
  id: string;
  type: VehicleType;
  capacity: string; // e.g., "1 Ton", "5 Ton"
  pricePerKm: number;
  icon: string;
}

export interface TransportBooking {
  id: string;
  vehicleType: VehicleType;
  pickupLocation: string;
  pickupAddress: string;
  deliveryLocation: string;
  deliveryAddress: string;
  distance: number; // in km
  estimatedCost: number;
  scheduledPickup: string;
  estimatedDelivery: string;
  status: BookingStatus;
  cargo: string;
  weight: string;
  contactNumber: string;
  createdAt: string;
  trackingUpdates?: TrackingUpdate[];
}

export interface TrackingUpdate {
  timestamp: string;
  status: string;
  location: string;
  message: string;
}