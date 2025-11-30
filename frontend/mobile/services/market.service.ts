import {
  MarketPrice,
  PriceHistory,
  Market,
  PriceAlert,
  TradeDemand,
  MyListing,
  TradeInquiry,
  MarketNews,
  CropAnalytics,
  GovernmentScheme,
  MSPInfo,
  Crop,
} from '@/types/market.types';

class MarketService {
  private baseUrl = 'https://api.seedsync.com'; // Mock URL

  // Get all available crops
  async getCrops(): Promise<Crop[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
      {
        id: '1',
        name: 'Wheat',
        nameHindi: 'गेहूं',
        category: 'cereals',
        icon: '🌾',
        varieties: ['HD-2967', 'PBW-343', 'WH-1105'],
        unit: 'quintal',
      },
      {
        id: '2',
        name: 'Rice',
        nameHindi: 'चावल',
        category: 'cereals',
        icon: '🍚',
        varieties: ['Basmati', 'Non-Basmati', 'Sona Masuri'],
        unit: 'quintal',
      },
      {
        id: '3',
        name: 'Cotton',
        nameHindi: 'कपास',
        category: 'other',
        icon: '🌼',
        varieties: ['MCU-5', 'Shankar-6', 'RCH-2'],
        unit: 'quintal',
      },
      {
        id: '4',
        name: 'Soybean',
        nameHindi: 'सोयाबीन',
        category: 'oilseeds',
        icon: '🫘',
        varieties: ['JS-335', 'JS-9305', 'JS-9560'],
        unit: 'quintal',
      },
      {
        id: '5',
        name: 'Tomato',
        nameHindi: 'टमाटर',
        category: 'vegetables',
        icon: '🍅',
        varieties: ['Hybrid', 'Desi', 'Cherry'],
        unit: 'quintal',
      },
    ];
  }

  // Get market prices
  async getMarketPrices(filters?: {
    cropId?: string;
    state?: string;
    district?: string;
  }): Promise<MarketPrice[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockPrices: MarketPrice[] = [
      {
        id: '1',
        cropId: '1',
        cropName: 'Wheat',
        variety: 'HD-2967',
        marketName: 'Nagpur APMC',
        marketId: 'M001',
        state: 'Maharashtra',
        district: 'Nagpur',
        price: 2150,
        minPrice: 2100,
        maxPrice: 2200,
        modalPrice: 2150,
        unit: 'quintal',
        date: new Date().toISOString(),
        priceChange: 50,
        priceChangePercent: 2.38,
        trend: 'up',
      },
      {
        id: '2',
        cropId: '3',
        cropName: 'Cotton',
        variety: 'MCU-5',
        marketName: 'Wardha Market',
        marketId: 'M002',
        state: 'Maharashtra',
        district: 'Wardha',
        price: 6200,
        minPrice: 6000,
        maxPrice: 6400,
        modalPrice: 6200,
        unit: 'quintal',
        date: new Date().toISOString(),
        priceChange: 100,
        priceChangePercent: 1.64,
        trend: 'up',
      },
      {
        id: '3',
        cropId: '4',
        cropName: 'Soybean',
        variety: 'JS-335',
        marketName: 'Akola APMC',
        marketId: 'M003',
        state: 'Maharashtra',
        district: 'Akola',
        price: 4500,
        minPrice: 4400,
        maxPrice: 4600,
        modalPrice: 4500,
        unit: 'quintal',
        date: new Date().toISOString(),
        priceChange: -30,
        priceChangePercent: -0.66,
        trend: 'down',
      },
      {
        id: '4',
        cropId: '5',
        cropName: 'Tomato',
        marketName: 'Nagpur Vegetable Market',
        marketId: 'M004',
        state: 'Maharashtra',
        district: 'Nagpur',
        price: 1200,
        minPrice: 1000,
        maxPrice: 1400,
        modalPrice: 1200,
        unit: 'quintal',
        date: new Date().toISOString(),
        priceChange: 0,
        priceChangePercent: 0,
        trend: 'stable',
      },
    ];

    return mockPrices;
  }

  // Get price history for a crop
  async getPriceHistory(cropId: string, days: number = 30): Promise<PriceHistory[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const history: PriceHistory[] = [];
    const basePrice = 2000 + Math.random() * 2000;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const variation = Math.random() * 200 - 100;
      const price = basePrice + variation;

      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
        minPrice: Math.round(price - 50),
        maxPrice: Math.round(price + 50),
        volume: Math.floor(Math.random() * 1000) + 500,
      });
    }

    return history;
  }

  // Get nearby markets
  async getNearbyMarkets(latitude: number, longitude: number): Promise<Market[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return [
      {
        id: 'M001',
        name: 'Nagpur APMC',
        type: 'APMC',
        state: 'Maharashtra',
        district: 'Nagpur',
        address: 'Kalamna Market Yard, Nagpur',
        latitude: 21.1458,
        longitude: 79.0882,
        distance: 5.2,
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        operatingHours: '6:00 AM - 6:00 PM',
        facilities: ['Weighing', 'Storage', 'Grading', 'Auction'],
        contactNumber: '+91 712 2531234',
        isEnamIntegrated: true,
        popularCrops: ['Wheat', 'Cotton', 'Soybean'],
      },
      {
        id: 'M002',
        name: 'Wardha Market',
        type: 'APMC',
        state: 'Maharashtra',
        district: 'Wardha',
        address: 'Main Market Yard, Wardha',
        latitude: 20.7333,
        longitude: 78.6000,
        distance: 75.5,
        operatingDays: ['Monday', 'Wednesday', 'Friday'],
        operatingHours: '7:00 AM - 5:00 PM',
        facilities: ['Weighing', 'Storage', 'Grading'],
        contactNumber: '+91 7152 234567',
        isEnamIntegrated: false,
        popularCrops: ['Cotton', 'Soybean', 'Tur Dal'],
      },
    ];
  }

  // Price alerts
  async createPriceAlert(alert: Omit<PriceAlert, 'id' | 'createdAt'>): Promise<PriceAlert> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      ...alert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
  }

  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
      {
        id: '1',
        userId,
        cropId: '1',
        cropName: 'Wheat',
        targetPrice: 2200,
        condition: 'above',
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
      {
        id: '2',
        userId,
        cropId: '3',
        cropName: 'Cotton',
        targetPrice: 6000,
        condition: 'below',
        marketId: 'M001',
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ];
  }

  async deletePriceAlert(alertId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Trade & Demand
  async getTradeDemands(filters?: {
    type?: 'buy' | 'sell';
    cropName?: string;
    state?: string;
  }): Promise<TradeDemand[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
      {
        id: '1',
        type: 'sell',
        cropName: 'Wheat',
        variety: 'HD-2967',
        quantity: 100,
        unit: 'quintal',
        pricePerUnit: 2200,
        totalPrice: 220000,
        location: 'Nagpur',
        district: 'Nagpur',
        state: 'Maharashtra',
        description: 'High quality wheat, freshly harvested. Ready for immediate delivery.',
        contactName: 'Ramesh Patil',
        contactNumber: '+91 98765 43210',
        postedBy: 'user123',
        postedAt: new Date(Date.now() - 3600000).toISOString(),
        expiresAt: new Date(Date.now() + 604800000).toISOString(),
        status: 'active',
        verified: true,
      },
      {
        id: '2',
        type: 'buy',
        cropName: 'Cotton',
        variety: 'MCU-5',
        quantity: 50,
        unit: 'quintal',
        pricePerUnit: 6100,
        totalPrice: 305000,
        location: 'Wardha',
        district: 'Wardha',
        state: 'Maharashtra',
        description: 'Looking for good quality cotton. Bulk quantity preferred.',
        contactName: 'Suresh Kumar',
        contactNumber: '+91 98123 45678',
        postedBy: 'user456',
        postedAt: new Date(Date.now() - 7200000).toISOString(),
        expiresAt: new Date(Date.now() + 518400000).toISOString(),
        status: 'active',
        verified: false,
      },
    ];
  }

  async createTradeListing(listing: Omit<TradeDemand, 'id' | 'postedAt' | 'status'>): Promise<TradeDemand> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      ...listing,
      id: Date.now().toString(),
      postedAt: new Date().toISOString(),
      status: 'active',
    };
  }

  async getMyListings(userId: string): Promise<MyListing[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
      {
        id: '1',
        type: 'sell',
        cropName: 'Soybean',
        variety: 'JS-335',
        quantity: 75,
        unit: 'quintal',
        pricePerUnit: 4550,
        totalPrice: 341250,
        description: 'Premium quality soybean',
        status: 'active',
        views: 45,
        inquiries: 8,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        expiresAt: new Date(Date.now() + 432000000).toISOString(),
      },
    ];
  }

  // Market News
  async getMarketNews(): Promise<MarketNews[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return [
      {
        id: '1',
        title: 'Cotton Prices Surge Amid Supply Shortage',
        summary: 'Cotton prices have increased by 15% in major markets due to reduced supply.',
        content: 'Full article content here...',
        category: 'price',
        source: 'Agricultural Times',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        tags: ['cotton', 'prices', 'market'],
        isFeatured: true,
      },
      {
        id: '2',
        title: 'New MSP Announced for Kharif Crops',
        summary: 'Government announces minimum support prices for upcoming kharif season.',
        content: 'Full article content here...',
        category: 'policy',
        source: 'Ministry of Agriculture',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        tags: ['msp', 'policy', 'kharif'],
        isFeatured: true,
      },
    ];
  }

  // Analytics
  async getCropAnalytics(cropId: string): Promise<CropAnalytics> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      cropId,
      cropName: 'Wheat',
      currentPrice: 2150,
      weeklyChange: 2.5,
      monthlyChange: 5.2,
      yearlyChange: 12.8,
      highestPrice: 2300,
      lowestPrice: 1950,
      averagePrice: 2100,
      volatilityIndex: 6.5,
      demandTrend: 'high',
      supplyTrend: 'balanced',
      seasonalPattern: 'Prices typically peak during March-April',
      bestSellingMonths: ['March', 'April', 'May'],
      forecast: {
        nextWeek: 2180,
        nextMonth: 2250,
        confidence: 75,
      },
    };
  }

  // Government Schemes
  async getGovernmentSchemes(state?: string): Promise<GovernmentScheme[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return [
      {
        id: '1',
        name: 'PM-KISAN',
        nameHindi: 'प्रधानमंत्री किसान सम्मान निधि',
        description: 'Income support scheme providing ₹6000 annually to farmers',
        benefits: ['₹6000 per year', 'Direct benefit transfer', 'No intermediaries'],
        eligibility: ['Small and marginal farmers', 'Land ownership documents'],
        documents: ['Aadhaar Card', 'Land Records', 'Bank Account'],
        applicationProcess: [
          'Visit PM-KISAN portal',
          'Register with Aadhaar',
          'Submit land details',
          'Verification by authorities',
        ],
        contactInfo: {
          phone: '155261',
          email: 'pmkisan-ict@gov.in',
          website: 'https://pmkisan.gov.in',
        },
        isActive: true,
        category: 'subsidy',
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  // MSP Information
  async getMSPInfo(): Promise<MSPInfo[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
      {
        id: '1',
        cropName: 'Wheat',
        year: '2024-25',
        season: 'rabi',
        mspPrice: 2125,
        previousYearPrice: 2015,
        increase: 110,
        increasePercent: 5.46,
        effectiveFrom: '2024-04-01',
        announcedOn: '2024-02-15',
        variety: 'General',
        notes: 'MSP applicable for notified wheat varieties.',
        unit: 'quintal',
      },
      {
        id: '2',
        cropName: 'Paddy',
        year: '2024-25',
        season: 'kharif',
        mspPrice: 2183,
        previousYearPrice: 2040,
        increase: 143,
        increasePercent: 7.01,
        effectiveFrom: '2024-10-01',
        announcedOn: '2024-06-12',
        variety: 'Swarna',
        notes: 'MSP announced for common kharif paddy varieties.',
        unit: 'quintal',
      },
    ];
  }
}

export const marketService = new MarketService();