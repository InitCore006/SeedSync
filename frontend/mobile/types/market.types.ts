export interface Crop {
  id: string;
  name: string;
  nameHindi: string;
  category: 'cereals' | 'pulses' | 'oilseeds' | 'vegetables' | 'fruits' | 'spices' | 'other';
  icon: string;
  varieties: string[];
  unit: 'quintal' | 'kg' | 'ton';
}

export interface MarketPrice {
  id: string;
  cropId: string;
  cropName: string;
  variety?: string;
  marketName: string;
  marketId: string;
  state: string;
  district: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  date: string;
  priceChange: number;
  priceChangePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PriceHistory {
  date: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  volume?: number;
}

export interface Market {
  id: string;
  name: string;
  type: 'APMC' | 'Private' | 'E-NAM' | 'Farmers Market';
  state: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  operatingDays: string[];
  operatingHours: string;
  facilities: string[];
  contactNumber?: string;
  isEnamIntegrated: boolean;
  popularCrops: string[];
}

export interface PriceAlert {
  id: string;
  userId: string;
  cropId: string;
  cropName: string;
  targetPrice: number;
  condition: 'above' | 'below';
  marketId?: string;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface TradeDemand {
  id: string;
  type: 'buy' | 'sell';
  cropName: string;
  variety?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  location: string;
  district: string;
  state: string;
  description: string;
  contactName: string;
  contactNumber: string;
  postedBy: string;
  postedAt: string;
  expiresAt: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  images?: string[];
  verified: boolean;
}

export interface MyListing {
  id: string;
  type: 'buy' | 'sell';
  cropName: string;
  variety?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  description: string;
  images?: string[];
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  views: number;
  inquiries: number;
  createdAt: string;
  expiresAt: string;
}

export interface TradeInquiry {
  id: string;
  listingId: string;
  listingType: 'buy' | 'sell';
  cropName: string;
  fromUserId: string;
  fromUserName: string;
  fromUserPhone: string;
  message: string;
  proposedPrice?: number;
  proposedQuantity?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  respondedAt?: string;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'price' | 'policy' | 'trade' | 'weather' | 'general';
  source: string;
  imageUrl?: string;
  publishedAt: string;
  tags: string[];
  isFeatured: boolean;
}

export interface CropAnalytics {
  cropId: string;
  cropName: string;
  currentPrice: number;
  weeklyChange: number;
  monthlyChange: number;
  yearlyChange: number;
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  volatilityIndex: number;
  demandTrend: 'high' | 'medium' | 'low';
  supplyTrend: 'surplus' | 'balanced' | 'deficit';
  seasonalPattern: string;
  bestSellingMonths: string[];
  forecast: {
    nextWeek: number;
    nextMonth: number;
    confidence: number;
  };
}

export interface GovernmentScheme {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  applicationProcess: string[];
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  state?: string;
  isActive: boolean;
  category: 'subsidy' | 'loan' | 'insurance' | 'training' | 'equipment' | 'other';
  lastUpdated: string;
}

export interface MSPInfo {
  variety: any;
  notes: any;
  id: string;
  cropName: string;
  year: string;
  season: 'kharif' | 'rabi';
  mspPrice: number;
  previousYearPrice: number;
  increase: number;
  increasePercent: number;
  effectiveFrom: string;
  announcedOn: string;
  unit: string;
}