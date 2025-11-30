import {
  ScanResult,
  CropPlan,
  PricePrediction,
  YieldPrediction,
  ChatMessage,
  ChatSession,
  AIAlert,
} from '@/types/ai.types';

// Mock Scan Results
const MOCK_SCAN_RESULTS: ScanResult[] = [
  {
    id: 'scan-001',
    cropName: 'Soybean',
    imageUrl: 'https://example.com/soybean-scan.jpg',
    timestamp: '2024-11-27T10:30:00Z',
    healthScore: 78,
    confidence: 89,
    overallStatus: 'warning',
    growthStage: 'Flowering Stage',
    detections: [
      {
        id: 'det-001',
        type: 'pest',
        category: 'pest',
        name: 'Leaf Miner',
        severity: 'medium',
        confidence: 87,
        affectedArea: 15,
        description: 'Leaf miner larvae detected on upper leaves',
        symptoms: ['White serpentine trails on leaves', 'Leaf discoloration', 'Reduced photosynthesis'],
        causes: ['High humidity', 'Dense planting', 'Poor air circulation'],
      },
    ],
    recommendations: [
      {
        id: 'rec-001',
        title: 'Apply Neem-based Pesticide',
        type: 'immediate',
        priority: 'high',
        description: 'Use organic neem oil spray to control leaf miner population',
        estimatedCost: 450,
        expectedOutcome: 'Control infestation within 7-10 days',
        timeframe: 'Apply within 48 hours',
        treatments: [
          {
            id: 'treat-001',
            name: 'Neem Oil Spray',
            type: 'organic',
            dosage: '5ml per liter of water',
            application: 'Foliar spray on affected plants',
            frequency: 'Every 7 days for 3 weeks',
            precautions: ['Apply in early morning or evening', 'Avoid spraying during flowering'],
            cost: 450,
          },
        ],
      },
    ],
  },
];

// Mock Crop Plans
const MOCK_CROP_PLANS: CropPlan[] = [
  {
    id: 'plan-001',
    season: 'kharif',
    year: 2025,
    location: {
      district: 'Nagpur',
      state: 'Maharashtra',
    },
    soilType: 'Black Cotton Soil',
    irrigationAvailable: true,
    expectedRevenue: 285000,
    recommendations: [
      {
        cropName: 'Soybean',
        variety: 'JS 335',
        suitabilityScore: 92,
        expectedYield: 20,
        expectedPrice: 4500,
        expectedRevenue: 90000,
        investmentRequired: 25000,
        profitMargin: 72,
        duration: 120,
        waterRequirement: 'medium',
        marketDemand: 'high',
        reasons: [
          'Ideal for black cotton soil',
          'High market demand',
          'Good monsoon forecast',
          'Proven variety for this region',
        ],
        risks: ['Pest infestation during flowering', 'Price volatility'],
      },
      {
        cropName: 'Cotton',
        variety: 'BT Cotton',
        suitabilityScore: 88,
        expectedYield: 15,
        expectedPrice: 6000,
        expectedRevenue: 90000,
        investmentRequired: 35000,
        profitMargin: 61,
        duration: 150,
        waterRequirement: 'high',
        marketDemand: 'high',
        reasons: [
          'High returns per acre',
          'Strong textile demand',
          'Suitable for local climate',
        ],
        risks: ['Higher water requirement', 'Bollworm risk'],
      },
    ],
    rotationPlan: [
      {
        season: 'Kharif 2025',
        year: 2025,
        primaryCrop: 'Soybean',
        benefits: ['Nitrogen fixation', 'Soil improvement', 'Good cash crop'],
        nutrients: {
          nitrogen: 'Adds nitrogen to soil',
          phosphorus: 'Moderate requirement',
          potassium: 'Moderate requirement',
        },
      },
      {
        season: 'Rabi 2025-26',
        year: 2026,
        primaryCrop: 'Wheat',
        secondaryCrop: 'Gram',
        benefits: ['Utilizes residual nitrogen', 'Good winter crop', 'Market stability'],
        nutrients: {
          nitrogen: 'High requirement',
          phosphorus: 'High requirement',
          potassium: 'Moderate requirement',
        },
      },
    ],
    calendar: {
      id: 'cal-001',
      cropName: 'Soybean',
      activities: [
        {
          id: 'act-001',
          type: 'sowing',
          title: 'Land Preparation & Sowing',
          description: 'Plow field, apply basal fertilizers, and sow seeds',
          startDate: '2025-06-15',
          endDate: '2025-06-30',
          isRecurring: false,
          priority: 'high',
          cost: 8000,
        },
        {
          id: 'act-002',
          type: 'irrigation',
          title: 'First Irrigation',
          description: 'Critical irrigation after germination',
          startDate: '2025-07-05',
          isRecurring: false,
          priority: 'high',
        },
      ],
    },
    riskAssessment: {
      overallRisk: 'medium',
      riskScore: 45,
      factors: [
        {
          category: 'Weather',
          risk: 'Erratic rainfall patterns',
          probability: 40,
          impact: 60,
          mitigation: 'Install drip irrigation system',
        },
      ],
      recommendations: [
        'Invest in weather monitoring',
        'Maintain crop insurance',
        'Diversify with multiple crops',
      ],
    },
  },
];

// Mock Price Predictions
const MOCK_PRICE_PREDICTIONS: PricePrediction[] = [
  {
    id: 'price-001',
    cropName: 'Soybean',
    variety: 'JS 335',
    market: 'Nagpur Mandi',
    currentPrice: 4500,
    confidence: 82,
    lastUpdated: '2024-11-28T08:00:00Z',
    predictions: [
      { date: '2024-12-28', price: 4650, trend: 'up' },
      { date: '2025-01-28', price: 4800, trend: 'up' },
      { date: '2025-02-28', price: 4550, trend: 'down' },
    ],
    historicalData: [
      { date: '2024-10-28', price: 4200, volume: 1500, trend: 'stable' },
      { date: '2024-11-28', price: 4500, volume: 1800, trend: 'up' },
    ],
    insights: [
      {
        type: 'trend',
        title: 'Upward Trend Expected',
        description: 'Prices likely to increase by 5-7% in next 30 days due to reduced supply',
        impact: 'positive',
        confidence: 85,
      },
      {
        type: 'seasonal',
        title: 'Peak Demand Season',
        description: 'January-February typically sees higher prices due to festival demand',
        impact: 'positive',
        confidence: 90,
      },
    ],
  },
];

// Mock Yield Predictions
const MOCK_YIELD_PREDICTIONS: YieldPrediction[] = [
  {
    id: 'yield-001',
    cropId: 'crop-001',
    cropName: 'Soybean',
    variety: 'JS 335',
    area: 5,
    predictedYield: 19.5,
    confidenceRange: { min: 17.5, max: 21.5 },
    confidence: 84,
    expectedQuality: 'A',
    harvestDate: '2024-11-15',
    factors: [
      {
        name: 'Weather Conditions',
        impact: 15,
        description: 'Favorable rainfall and temperature',
        isPositive: true,
      },
      {
        name: 'Soil Health',
        impact: 10,
        description: 'Good soil organic matter content',
        isPositive: true,
      },
      {
        name: 'Pest Pressure',
        impact: -5,
        description: 'Minor leaf miner infestation detected',
        isPositive: false,
      },
    ],
    optimizations: [
      {
        title: 'Optimize Irrigation Schedule',
        description: 'Adjust irrigation timing based on weather forecast',
        expectedIncrease: 2,
        feasibility: 'easy',
      },
      {
        title: 'Apply Micronutrients',
        description: 'Foliar spray of zinc and boron',
        expectedIncrease: 1.5,
        cost: 800,
        feasibility: 'easy',
      },
    ],
    risks: [
      {
        type: 'pest',
        title: 'Leaf Miner Infestation',
        description: 'Current minor infestation could worsen without treatment',
        probability: 60,
        potentialImpact: 10,
        mitigation: ['Apply neem-based pesticide', 'Monitor weekly'],
      },
    ],
  },
];

// Mock Chat Sessions
const MOCK_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'chat-001',
    title: 'Soybean Pest Control',
    createdAt: '2024-11-27T10:00:00Z',
    updatedAt: '2024-11-27T10:15:00Z',
    messages: [
      {
        id: 'msg-001',
        role: 'user',
        content: 'My soybean crop has small white trails on leaves. What is this?',
        timestamp: '2024-11-27T10:00:00Z',
      },
      {
        id: 'msg-002',
        role: 'assistant',
        content: 'This appears to be leaf miner damage. Leaf miners are small fly larvae that tunnel through leaf tissue. I recommend organic neem oil spray.',
        timestamp: '2024-11-27T10:01:00Z',
        suggestions: [
          'How to apply neem oil?',
          'When to spray?',
          'Alternative treatments?',
        ],
      },
    ],
  },
];

// Mock AI Alerts
const MOCK_AI_ALERTS: AIAlert[] = [
  {
    id: 'alert-001',
    type: 'weather',
    severity: 'high',
    title: 'Heavy Rainfall Alert',
    description: 'Heavy rainfall expected in next 48 hours. Take protective measures for standing crops.',
    affectedCrops: ['Soybean', 'Cotton'],
    actionRequired: true,
    actions: [
      'Ensure proper drainage in fields',
      'Delay fertilizer application',
      'Check for water logging',
    ],
    validUntil: '2024-11-30T23:59:59Z',
    createdAt: '2024-11-28T08:00:00Z',
    isRead: false,
  },
  {
    id: 'alert-002',
    type: 'price',
    severity: 'medium',
    title: 'Price Surge Opportunity',
    description: 'Soybean prices expected to increase by 8% in next 15 days',
    affectedCrops: ['Soybean'],
    actionRequired: false,
    actions: ['Consider delaying harvest by 2 weeks', 'Monitor market daily'],
    validUntil: '2024-12-15T23:59:59Z',
    createdAt: '2024-11-28T06:00:00Z',
    isRead: false,
  },
];

// Service Functions
export const aiService = {
  // Crop Scanner
  analyzeCropImage: async (imageUri: string, cropName?: string): Promise<ScanResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...MOCK_SCAN_RESULTS[0],
          id: `scan-${Date.now()}`,
          imageUrl: imageUri,
          cropName: cropName || 'Unknown',
          timestamp: new Date().toISOString(),
        });
      }, 2000);
    });
  },

  getScanHistory: async (): Promise<ScanResult[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_SCAN_RESULTS), 500);
    });
  },

  getScanById: async (scanId: string): Promise<ScanResult | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const scan = MOCK_SCAN_RESULTS.find((s) => s.id === scanId);
        resolve(scan || null);
      }, 300);
    });
  },

  // Crop Planner
  generateCropPlan: async (params: {
    season: 'kharif' | 'rabi' | 'zaid';
    location: { district: string; state: string };
    soilType: string;
    area: number;
    irrigationAvailable: boolean;
  }): Promise<CropPlan> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...MOCK_CROP_PLANS[0],
          id: `plan-${Date.now()}`,
          ...params,
        } as CropPlan);
      }, 1500);
    });
  },

  getCropPlans: async (): Promise<CropPlan[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CROP_PLANS), 500);
    });
  },

  // Price Prediction
  getPricePrediction: async (cropName: string, market?: string): Promise<PricePrediction> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...MOCK_PRICE_PREDICTIONS[0],
          id: `price-${Date.now()}`,
          cropName,
          market: market || 'Nagpur Mandi',
        });
      }, 1000);
    });
  },

  getAllPricePredictions: async (): Promise<PricePrediction[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_PRICE_PREDICTIONS), 500);
    });
  },

  // Yield Prediction
  getYieldPrediction: async (cropId: string): Promise<YieldPrediction> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...MOCK_YIELD_PREDICTIONS[0],
          id: `yield-${Date.now()}`,
          cropId,
        });
      }, 1200);
    });
  },

  getAllYieldPredictions: async (): Promise<YieldPrediction[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_YIELD_PREDICTIONS), 500);
    });
  },

  // AI Chatbot
  sendChatMessage: async (
    sessionId: string,
    message: string,
    attachments?: any[]
  ): Promise<ChatMessage> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const response: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `I understand your question about "${message}". Based on your farming context, here's my recommendation...`,
          timestamp: new Date().toISOString(),
          suggestions: [
            'Tell me more',
            'Alternative solutions?',
            'What are the costs?',
          ],
        };
        resolve(response);
      }, 1500);
    });
  },

  getChatSessions: async (): Promise<ChatSession[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CHAT_SESSIONS), 400);
    });
  },

  getChatSession: async (sessionId: string): Promise<ChatSession | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const session = MOCK_CHAT_SESSIONS.find((s) => s.id === sessionId);
        resolve(session || null);
      }, 300);
    });
  },

  createChatSession: async (title: string): Promise<ChatSession> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const session: ChatSession = {
          id: `chat-${Date.now()}`,
          title,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(session);
      }, 400);
    });
  },

  // AI Alerts
  getAIAlerts: async (): Promise<AIAlert[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_AI_ALERTS), 400);
    });
  },

  markAlertAsRead: async (alertId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const alert = MOCK_AI_ALERTS.find((a) => a.id === alertId);
        if (alert) {
          alert.isRead = true;
        }
        resolve();
      }, 300);
    });
  },

  dismissAlert: async (alertId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = MOCK_AI_ALERTS.findIndex((a) => a.id === alertId);
        if (index !== -1) {
          MOCK_AI_ALERTS.splice(index, 1);
        }
        resolve();
      }, 300);
    });
  },
};