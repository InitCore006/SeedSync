import { Vehicle, TransportBooking, TrackingUpdate } from '@/types/transport.types';

// Mock data
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    type: 'mini-truck',
    capacity: '1 Ton',
    pricePerKm: 15,
    icon: '🚚',
  },
  {
    id: '2',
    type: 'truck',
    capacity: '5 Ton',
    pricePerKm: 25,
    icon: '🚛',
  },
  {
    id: '3',
    type: 'tractor-trolley',
    capacity: '2 Ton',
    pricePerKm: 12,
    icon: '🚜',
  },
  {
    id: '4',
    type: 'tempo',
    capacity: '500 Kg',
    pricePerKm: 10,
    icon: '🛻',
  },
];

const MOCK_BOOKINGS: TransportBooking[] = [
  {
    id: '1',
    vehicleType: 'truck',
    pickupLocation: 'My Farm',
    pickupAddress: 'Village Khairpur, Tehsil Hansi, Hisar',
    deliveryLocation: 'Hisar Mandi',
    deliveryAddress: 'Grain Market, Hisar, Haryana',
    distance: 25,
    estimatedCost: 625,
    scheduledPickup: '2024-11-29T08:00:00',
    estimatedDelivery: '2024-11-29T10:30:00',
    status: 'in-transit',
    cargo: 'Wheat - 50 quintals',
    weight: '5000 Kg',
    contactNumber: '+91 98765 43210',
    createdAt: '2024-11-28T10:00:00',
    trackingUpdates: [
      {
        timestamp: '2024-11-29T08:00:00',
        status: 'Pickup Completed',
        location: 'Khairpur Village',
        message: 'Cargo loaded successfully',
      },
      {
        timestamp: '2024-11-29T08:45:00',
        status: 'In Transit',
        location: 'Near Hansi Bypass',
        message: 'Vehicle on route to Hisar',
      },
    ],
  },
  {
    id: '2',
    vehicleType: 'mini-truck',
    pickupLocation: 'My Farm',
    pickupAddress: 'Village Khairpur, Tehsil Hansi, Hisar',
    deliveryLocation: 'Local Market',
    deliveryAddress: 'Hansi Sabzi Mandi, Haryana',
    distance: 12,
    estimatedCost: 180,
    scheduledPickup: '2024-11-30T06:00:00',
    estimatedDelivery: '2024-11-30T07:00:00',
    status: 'confirmed',
    cargo: 'Fresh Vegetables',
    weight: '500 Kg',
    contactNumber: '+91 98765 43210',
    createdAt: '2024-11-28T15:30:00',
  },
];

class TransportService {
  async getVehicles(): Promise<Vehicle[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_VEHICLES;
  }

  async getBookings(): Promise<TransportBooking[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_BOOKINGS;
  }

  async getBookingById(id: string): Promise<TransportBooking | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_BOOKINGS.find((booking) => booking.id === id) || null;
  }

  async createBooking(
    bookingData: Omit<TransportBooking, 'id' | 'status' | 'createdAt'>
  ): Promise<TransportBooking> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newBooking: TransportBooking = {
      ...bookingData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return newBooking;
  }

  async cancelBooking(bookingId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async getTrackingUpdates(bookingId: string): Promise<TrackingUpdate[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId);
    return booking?.trackingUpdates || [];
  }

  calculateEstimate(distance: number, vehicleType: string): number {
    const vehicle = MOCK_VEHICLES.find((v) => v.type === vehicleType);
    if (!vehicle) return 0;
    return distance * vehicle.pricePerKm;
  }
}

export const transportService = new TransportService();