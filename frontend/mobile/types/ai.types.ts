export interface ScanResult {
  id: string;
  cropName: string;
  imageUrl: string;
  timestamp: string;
  healthScore: number;
  confidence: number;
  detections: Detection[];
  recommendations: Recommendation[];
  growthStage?: string;
  overallStatus: 'healthy' | 'warning' | 'critical';
}

export interface Detection {
  id: string;
  type: 'disease' | 'pest' | 'nutrient' | 'environmental';
  category: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  affectedArea: number;
  description: string;
  symptoms: string[];
  causes: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  type: 'immediate' | 'preventive' | 'long-term';
  priority: 'high' | 'medium' | 'low';
  description: string;
  treatments: Treatment[];
  estimatedCost?: number;
  expectedOutcome: string;
  timeframe: string;
}

export interface Treatment {
  id: string;
  name: string;
  type: 'organic' | 'chemical' | 'biological' | 'cultural';
  dosage?: string;
  application: string;
  frequency: string;
  precautions: string[];
  cost?: number;
}

export interface CropPlan {
  id: string;
  season: 'kharif' | 'rabi' | 'zaid';
  year: number;
  location: {
    district: string;
    state: string;
  };
  soilType: string;
  irrigationAvailable: boolean;
  recommendations: CropRecommendation[];
  rotationPlan: RotationPlan[];
  calendar: FarmingCalendar;
  expectedRevenue: number;
  riskAssessment: RiskAssessment;
}

export interface CropRecommendation {
  cropName: string;
  variety: string;
  suitabilityScore: number;
  expectedYield: number;
  expectedPrice: number;
  expectedRevenue: number;
  investmentRequired: number;
  profitMargin: number;
  duration: number;
  waterRequirement: 'low' | 'medium' | 'high';
  reasons: string[];
  risks: string[];
  marketDemand: 'low' | 'medium' | 'high';
}

export interface RotationPlan {
  season: string;
  year: number;
  primaryCrop: string;
  secondaryCrop?: string;
  benefits: string[];
  nutrients: {
    nitrogen: string;
    phosphorus: string;
    potassium: string;
  };
}

export interface FarmingCalendar {
  id: string;
  cropName: string;
  activities: CalendarActivity[];
}

export interface CalendarActivity {
  id: string;
  type: 'sowing' | 'irrigation' | 'fertilization' | 'pesticide' | 'weeding' | 'harvesting' | 'other';
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  isRecurring: boolean;
  frequency?: string;
  priority: 'high' | 'medium' | 'low';
  cost?: number;
}

export interface PricePrediction {
  id: string;
  cropName: string;
  variety: string;
  market: string;
  currentPrice: number;
  predictions: PricePoint[];
  historicalData: PricePoint[];
  insights: PriceInsight[];
  confidence: number;
  lastUpdated: string;
}

export interface PricePoint {
  date: string;
  price: number;
  volume?: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PriceInsight {
  type: 'trend' | 'seasonal' | 'demand' | 'supply' | 'weather';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface YieldPrediction {
  id: string;
  cropId: string;
  cropName: string;
  variety: string;
  area: number;
  predictedYield: number;
  confidenceRange: {
    min: number;
    max: number;
  };
  confidence: number;
  factors: YieldFactor[];
  optimizations: Optimization[];
  risks: YieldRisk[];
  expectedQuality: 'A' | 'B' | 'C';
  harvestDate: string;
}

export interface YieldFactor {
  name: string;
  impact: number;
  description: string;
  isPositive: boolean;
}

export interface Optimization {
  title: string;
  description: string;
  expectedIncrease: number;
  cost?: number;
  feasibility: 'easy' | 'moderate' | 'difficult';
}

export interface YieldRisk {
  type: 'weather' | 'pest' | 'disease' | 'soil' | 'market';
  title: string;
  description: string;
  probability: number;
  potentialImpact: number;
  mitigation: string[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number;
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskFactor {
  category: string;
  risk: string;
  probability: number;
  impact: number;
  mitigation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  suggestions?: string[];
}

export interface ChatAttachment {
  type: 'image' | 'location' | 'crop';
  url?: string;
  data?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AIAlert {
  id: string;
  type: 'weather' | 'price' | 'pest' | 'disease' | 'market' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedCrops: string[];
  actionRequired: boolean;
  actions: string[];
  validUntil: string;
  createdAt: string;
  isRead: boolean;
}