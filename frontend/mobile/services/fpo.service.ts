import { FPO, Membership, FPOEvent } from '@/types/fpo.types';

// Mock data
const MOCK_FPOS: FPO[] = [
  {
    id: '1',
    name: 'Hisar Farmers Producer Company',
    type: 'producer-company',
    description: 'A collective of 500+ farmers focusing on wheat, rice, and cotton production with modern farming techniques.',
    location: 'Hisar',
    district: 'Hisar',
    state: 'Haryana',
    established: '2018',
    memberCount: 523,
    contactPerson: 'Rajesh Kumar',
    phoneNumber: '+91 98765 11111',
    email: 'info@hisarfpc.com',
    services: ['Collective Marketing', 'Input Supply', 'Training', 'Equipment Rental'],
    crops: ['Wheat', 'Rice', 'Cotton', 'Mustard'],
    benefits: [
      'Better prices through collective bargaining',
      'Subsidized inputs',
      'Free training programs',
      'Equipment rental at minimal cost',
    ],
    membershipFee: 1000,
    website: 'https://hisarfpc.com',
  },
  {
    id: '2',
    name: 'Organic Farmers Cooperative - Haryana',
    type: 'cooperative',
    description: 'Promoting organic farming practices and helping farmers get organic certification and premium markets.',
    location: 'Rohtak',
    district: 'Rohtak',
    state: 'Haryana',
    established: '2020',
    memberCount: 234,
    contactPerson: 'Sunita Devi',
    phoneNumber: '+91 98765 22222',
    services: ['Organic Certification', 'Premium Market Access', 'Training', 'Quality Testing'],
    crops: ['Organic Wheat', 'Organic Vegetables', 'Organic Cotton'],
    benefits: [
      'Organic certification assistance',
      'Access to premium markets',
      'Better prices for organic produce',
      'Technical guidance',
    ],
    membershipFee: 500,
  },
  {
    id: '3',
    name: 'Women Farmers Self Help Group',
    type: 'self-help-group',
    description: 'Empowering women farmers through collective activities, skill development, and financial inclusion.',
    location: 'Hansi',
    district: 'Hisar',
    state: 'Haryana',
    established: '2019',
    memberCount: 87,
    contactPerson: 'Meera Singh',
    phoneNumber: '+91 98765 33333',
    services: ['Microfinance', 'Skill Training', 'Product Marketing', 'Value Addition'],
    crops: ['Vegetables', 'Fruits', 'Dairy Products'],
    benefits: [
      'Easy access to credit',
      'Skill development training',
      'Value-added product making',
      'Direct market linkage',
    ],
    membershipFee: 200,
  },
];

const MOCK_EVENTS: FPOEvent[] = [
  {
    id: '1',
    fpoId: '1',
    title: 'Modern Irrigation Techniques Workshop',
    description: 'Learn about drip irrigation, sprinkler systems, and water conservation methods.',
    date: '2024-12-05',
    time: '10:00 AM',
    location: 'Hisar FPC Office',
    eventType: 'workshop',
  },
  {
    id: '2',
    fpoId: '1',
    title: 'Monthly General Meeting',
    description: 'Discussion on upcoming season planning and input procurement.',
    date: '2024-12-10',
    time: '3:00 PM',
    location: 'Community Hall, Hisar',
    eventType: 'meeting',
  },
  {
    id: '3',
    fpoId: '2',
    title: 'Organic Farming Training',
    description: 'Comprehensive training on organic farming practices and certification process.',
    date: '2024-12-08',
    time: '9:00 AM',
    location: 'Training Center, Rohtak',
    eventType: 'training',
  },
];

class FPOService {
  async getAllFPOs(): Promise<FPO[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return MOCK_FPOS;
  }

  async getFPOById(id: string): Promise<FPO | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_FPOS.find((fpo) => fpo.id === id) || null;
  }

  async getFPOsByLocation(district: string, state: string): Promise<FPO[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_FPOS.filter(
      (fpo) => fpo.district === district && fpo.state === state
    );
  }

  async getMembership(): Promise<Membership | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Mock: User is not a member yet
    return null;
  }

  async applyForMembership(fpoId: string): Promise<Membership> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    return {
      fpoId,
      status: 'applied',
      benefits: [],
    };
  }

  async getFPOEvents(fpoId?: string): Promise<FPOEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (fpoId) {
      return MOCK_EVENTS.filter((event) => event.fpoId === fpoId);
    }
    
    return MOCK_EVENTS;
  }

  async registerForEvent(eventId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export const fpoService = new FPOService();