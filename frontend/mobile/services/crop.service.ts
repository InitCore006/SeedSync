import { Crop, CropActivity, HarvestRecord, FarmAnalytics } from '@/types/crop.types';

// Mock Data
const MOCK_CROPS: Crop[] = [
  {
    id: 'crop-001',
    farmerId: 'farmer-123',
    name: 'Soybean',
    variety: 'JS 335',
    category: 'oilseed',
    plantingDate: '2024-07-15',
    expectedHarvestDate: '2024-11-15',
    area: 5,
    areaUnit: 'acre',
    fieldLocation: {
      latitude: 21.1458,
      longitude: 79.0882,
      address: 'Village Kalamb, Nagpur, Maharashtra',
      surveyNumber: '123/4'
    },
    status: 'growing',
    soilType: 'Black Cotton Soil',
    irrigationType: 'drip',
    seedSource: 'Maharashtra State Seeds Corporation',
    seedCost: 3500,
    expectedYield: 20,
    growthStage: {
      current: 'Flowering Stage',
      percentage: 65,
      daysRemaining: 45
    },
    healthScore: 85,
    riskFactors: [
      {
        id: 'risk-001',
        type: 'pest',
        severity: 'medium',
        title: 'Leaf Miner Detection',
        description: 'Minor leaf miner infestation detected in north section',
        detectedAt: '2024-11-20',
        resolved: false,
        recommendations: [
          'Apply neem-based pesticide',
          'Monitor daily for 1 week',
          'Remove affected leaves'
        ]
      }
    ],
    weather: {
      temperature: 28,
      humidity: 65,
      rainfall: 5,
      windSpeed: 12,
      forecast: [
        { date: '2024-11-28', condition: 'sunny', temperature: 29, rainfall: 0 },
        { date: '2024-11-29', condition: 'cloudy', temperature: 27, rainfall: 2 },
        { date: '2024-11-30', condition: 'rainy', temperature: 25, rainfall: 15 }
      ]
    },
    images: [
      'https://example.com/crop1.jpg',
      'https://example.com/crop2.jpg'
    ],
    notes: 'Looking healthy, regular monitoring needed',
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-11-27T15:30:00Z'
  },
  {
    id: 'crop-002',
    farmerId: 'farmer-123',
    name: 'Groundnut',
    variety: 'TG 37A',
    category: 'oilseed',
    plantingDate: '2024-06-01',
    expectedHarvestDate: '2024-10-15',
    actualHarvestDate: '2024-10-20',
    area: 3,
    areaUnit: 'acre',
    fieldLocation: {
      latitude: 21.1558,
      longitude: 79.0982,
      address: 'Village Kalamb, Nagpur, Maharashtra',
      surveyNumber: '125/2'
    },
    status: 'harvested',
    soilType: 'Red Sandy Soil',
    irrigationType: 'rainfed',
    seedSource: 'Local Market',
    seedCost: 2800,
    expectedYield: 15,
    actualYield: 16.5,
    growthStage: {
      current: 'Harvested',
      percentage: 100,
      daysRemaining: 0
    },
    healthScore: 92,
    riskFactors: [],
    weather: {
      temperature: 28,
      humidity: 65,
      rainfall: 5,
      windSpeed: 12,
      forecast: []
    },
    images: [
      'https://example.com/groundnut1.jpg'
    ],
    createdAt: '2024-06-01T08:00:00Z',
    updatedAt: '2024-10-20T16:00:00Z'
  }
];

const MOCK_ACTIVITIES: CropActivity[] = [
  {
    id: 'activity-001',
    cropId: 'crop-001',
    type: 'irrigation',
    title: 'Drip Irrigation',
    description: 'Regular irrigation for 2 hours',
    date: '2024-11-26',
    cost: 150,
    createdAt: '2024-11-26T06:00:00Z'
  },
  {
    id: 'activity-002',
    cropId: 'crop-001',
    type: 'fertilizer',
    title: 'NPK Application',
    description: 'Applied NPK 19:19:19 fertilizer',
    date: '2024-11-20',
    cost: 850,
    quantity: '25 kg',
    createdAt: '2024-11-20T10:00:00Z'
  },
  {
    id: 'activity-003',
    cropId: 'crop-001',
    type: 'pesticide',
    title: 'Neem Spray',
    description: 'Organic neem pesticide application',
    date: '2024-11-22',
    cost: 450,
    quantity: '5 liters',
    createdAt: '2024-11-22T08:00:00Z'
  }
];

const MOCK_HARVESTS: HarvestRecord[] = [
  {
    id: 'harvest-001',
    cropId: 'crop-002',
    harvestDate: '2024-10-20',
    quantity: 16.5,
    quality: 'A',
    moistureContent: 8.5,
    storageLocation: 'Warehouse A',
    soldQuantity: 16.5,
    soldPrice: 5200,
    revenue: 85800,
    images: ['https://example.com/harvest1.jpg'],
    notes: 'Excellent quality harvest',
    createdAt: '2024-10-20T16:00:00Z'
  }
];

const MOCK_ANALYTICS: FarmAnalytics = {
  totalCrops: 8,
  activeCrops: 2,
  totalArea: 25,
  avgYield: 18.5,
  totalRevenue: 456000,
  profitMargin: 42.5,
  cropPerformance: [
    { cropName: 'Soybean', yield: 20, revenue: 180000, profitMargin: 45 },
    { cropName: 'Groundnut', yield: 16.5, revenue: 85800, profitMargin: 48 },
    { cropName: 'Cotton', yield: 15, revenue: 120000, profitMargin: 38 }
  ],
  seasonalTrends: [
    { season: 'Kharif 2024', avgYield: 19, revenue: 285000 },
    { season: 'Rabi 2023-24', avgYield: 17.5, revenue: 171000 }
  ],
  soilHealthIndex: 78,
  waterUsageEfficiency: 82
};

// Service Functions
export const cropService = {
  // Get all crops for farmer
  getAllCrops: async (): Promise<Crop[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CROPS), 500);
    });
  },

  // Get active crops only
  getActiveCrops: async (): Promise<Crop[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeCrops = MOCK_CROPS.filter(c => 
          ['planted', 'growing', 'flowering', 'harvesting'].includes(c.status)
        );
        resolve(activeCrops);
      }, 500);
    });
  },

  // Get crop by ID
  getCropById: async (cropId: string): Promise<Crop | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const crop = MOCK_CROPS.find(c => c.id === cropId);
        resolve(crop || null);
      }, 300);
    });
  },

  // Add new crop
  addCrop: async (cropData: Partial<Crop>): Promise<Crop> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const defaults = {
          farmerId: 'farmer-123',
          status: 'planted',
          healthScore: 100,
          riskFactors: [],
          images: []
        } as Partial<Crop>;

        const newCrop: Crop = Object.assign(
          { id: `crop-${Date.now()}` } as Partial<Crop>,
          defaults,
          cropData as Crop,
          { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ) as Crop;

        MOCK_CROPS.push(newCrop);
        resolve(newCrop);
      }, 800);
    });
  },

  // Update crop
  updateCrop: async (cropId: string, updates: Partial<Crop>): Promise<Crop> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_CROPS.findIndex(c => c.id === cropId);
        if (index === -1) {
          reject(new Error('Crop not found'));
          return;
        }
        MOCK_CROPS[index] = {
          ...MOCK_CROPS[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        resolve(MOCK_CROPS[index]);
      }, 600);
    });
  },

  // Delete crop
  deleteCrop: async (cropId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = MOCK_CROPS.findIndex(c => c.id === cropId);
        if (index === -1) {
          reject(new Error('Crop not found'));
          return;
        }
        MOCK_CROPS.splice(index, 1);
        resolve();
      }, 400);
    });
  },

  // Get crop activities
  getCropActivities: async (cropId: string): Promise<CropActivity[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activities = MOCK_ACTIVITIES.filter(a => a.cropId === cropId);
        resolve(activities);
      }, 400);
    });
  },

  // Add crop activity
  addCropActivity: async (activityData: Partial<CropActivity>): Promise<CropActivity> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { createdAt: _createdAt, id: _id, ...otherData } = activityData as CropActivity;
        const newActivity: CropActivity = {
          id: `activity-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...otherData
        };
        MOCK_ACTIVITIES.push(newActivity);
        resolve(newActivity);
      }, 500);
    });
  },

  // Get harvest records
  getHarvestRecords: async (cropId?: string): Promise<HarvestRecord[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (cropId) {
          const records = MOCK_HARVESTS.filter(h => h.cropId === cropId);
          resolve(records);
        } else {
          resolve(MOCK_HARVESTS);
        }
      }, 400);
    });
  },

  // Add harvest record
  addHarvestRecord: async (harvestData: Partial<HarvestRecord>): Promise<HarvestRecord> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { id: _id, createdAt: _createdAt, images: _images, ...otherData } = harvestData as HarvestRecord;
        const newHarvest: HarvestRecord = {
          id: `harvest-${Date.now()}`,
          images: [],
          createdAt: new Date().toISOString(),
          ...otherData
        };
        MOCK_HARVESTS.push(newHarvest);
        resolve(newHarvest);
      }, 600);
    });
  },

  // Get farm analytics
  getFarmAnalytics: async (): Promise<FarmAnalytics> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ANALYTICS), 700);
    });
  }
};