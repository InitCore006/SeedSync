export interface WeatherCondition {
  id: string;
  main: string; // Clear, Clouds, Rain, etc.
  description: string;
  icon: string;
}

export interface CurrentWeather {
  timestamp: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  cloudiness: number;
  visibility: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  conditions: WeatherCondition[];
  rainfall?: number;
  dewPoint: number;
}

export interface HourlyForecast {
  timestamp: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  precipitationProbability: number;
  conditions: WeatherCondition[];
  cloudiness: number;
}

export interface DailyForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
    morning: number;
    day: number;
    evening: number;
    night: number;
  };
  feelsLike: {
    morning: number;
    day: number;
    evening: number;
    night: number;
  };
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  precipitationProbability: number;
  rainfall?: number;
  conditions: WeatherCondition[];
  sunrise: string;
  sunset: string;
  uvIndex: number;
  moonPhase: number;
}

export interface WeatherAlert {
  id: string;
  event: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  urgency: 'immediate' | 'expected' | 'future';
  startTime: string;
  endTime: string;
  description: string;
  instructions?: string;
  affectedAreas: string[];
}

export interface SoilMoisture {
  timestamp: string;
  level: number; // percentage
  status: 'very-dry' | 'dry' | 'optimal' | 'wet' | 'saturated';
  irrigationRecommended: boolean;
  daysUntilIrrigation?: number;
}

export interface FarmingRecommendation {
  id: string;
  type: 'planting' | 'irrigation' | 'harvesting' | 'spraying' | 'fertilizer' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  validUntil: string;
  weatherBased: boolean;
  reason: string;
}

export interface WeatherData {
  location: {
    name: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
  soilMoisture?: SoilMoisture;
  recommendations: FarmingRecommendation[];
  lastUpdated: string;
}

export interface WeatherHistory {
  date: string;
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  rainfall: number;
  humidity: number;
}

export interface SeasonalData {
  season: 'summer' | 'monsoon' | 'winter' | 'spring';
  averageTemperature: number;
  averageRainfall: number;
  typicalConditions: string[];
  bestCrops: string[];
}

// Notification Types
export interface NotificationSettings {
  weatherAlerts: boolean;
  cropReminders: boolean;
  priceAlerts: boolean;
  marketUpdates: boolean;
  aiInsights: boolean;
  communityPosts: boolean;
}

export interface Notification {
  id: string;
  type: 'weather' | 'crop' | 'price' | 'market' | 'ai' | 'community' | 'system';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  imageUrl?: string;
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}