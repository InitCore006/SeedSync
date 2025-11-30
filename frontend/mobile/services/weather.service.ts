import { WeatherData, WeatherHistory, SeasonalData } from '@/types/weather.types';

class WeatherService {
  private baseUrl = 'https://api.seedsync.com'; // Mock URL

  // Get current weather and forecast
  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    // Mock implementation - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockData: WeatherData = {
      location: {
        name: 'Nagpur',
        district: 'Nagpur',
        state: 'Maharashtra',
        latitude,
        longitude,
      },
      current: {
        timestamp: new Date().toISOString(),
        temperature: 32,
        feelsLike: 35,
        humidity: 65,
        pressure: 1013,
        windSpeed: 12,
        windDirection: 180,
        cloudiness: 40,
        visibility: 10000,
        uvIndex: 8,
        sunrise: new Date().setHours(6, 0, 0, 0).toString(),
        sunset: new Date().setHours(18, 30, 0, 0).toString(),
        conditions: [
          {
            id: '1',
            main: 'Clouds',
            description: 'Partly cloudy',
            icon: '02d',
          },
        ],
        rainfall: 0,
        dewPoint: 24,
      },
      hourly: this.generateHourlyForecast(),
      daily: this.generateDailyForecast(),
      alerts: this.generateWeatherAlerts(),
      soilMoisture: {
        timestamp: new Date().toISOString(),
        level: 45,
        status: 'optimal',
        irrigationRecommended: false,
        daysUntilIrrigation: 3,
      },
      recommendations: this.generateRecommendations(),
      lastUpdated: new Date().toISOString(),
    };

    return mockData;
  }

  // Get weather history
  async getWeatherHistory(
    latitude: number,
    longitude: number,
    days: number = 30
  ): Promise<WeatherHistory[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const history: WeatherHistory[] = [];
    const today = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      history.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: 22 + Math.random() * 5,
          max: 32 + Math.random() * 8,
          avg: 27 + Math.random() * 6,
        },
        rainfall: Math.random() > 0.7 ? Math.random() * 50 : 0,
        humidity: 50 + Math.random() * 30,
      });
    }

    return history;
  }

  // Get seasonal data
  async getSeasonalData(state: string): Promise<SeasonalData> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      season: this.getCurrentSeason(),
      averageTemperature: 28,
      averageRainfall: 120,
      typicalConditions: ['Warm', 'Humid', 'Occasional rain'],
      bestCrops: ['Cotton', 'Soybean', 'Maize', 'Rice'],
    };
  }

  // Private helper methods
  private generateHourlyForecast() {
    const hourly = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
      const time = new Date(now);
      time.setHours(now.getHours() + i);

      hourly.push({
        timestamp: time.toISOString(),
        temperature: 25 + Math.random() * 10,
        feelsLike: 27 + Math.random() * 10,
        humidity: 60 + Math.random() * 20,
        windSpeed: 8 + Math.random() * 8,
        precipitation: Math.random() > 0.8 ? Math.random() * 5 : 0,
        precipitationProbability: Math.random() * 100,
        conditions: [
          {
            id: '1',
            main: 'Clear',
            description: 'Clear sky',
            icon: '01d',
          },
        ],
        cloudiness: Math.random() * 100,
      });
    }

    return hourly;
  }

  private generateDailyForecast() {
    const daily = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      daily.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: 22 + Math.random() * 3,
          max: 35 + Math.random() * 5,
          morning: 24 + Math.random() * 2,
          day: 32 + Math.random() * 4,
          evening: 28 + Math.random() * 3,
          night: 23 + Math.random() * 2,
        },
        feelsLike: {
          morning: 26 + Math.random() * 2,
          day: 35 + Math.random() * 4,
          evening: 30 + Math.random() * 3,
          night: 24 + Math.random() * 2,
        },
        humidity: 60 + Math.random() * 20,
        windSpeed: 10 + Math.random() * 8,
        windDirection: Math.random() * 360,
        precipitation: Math.random() > 0.7 ? Math.random() * 20 : 0,
        precipitationProbability: Math.random() * 100,
        rainfall: Math.random() > 0.7 ? Math.random() * 15 : 0,
        conditions: [
          {
            id: '1',
            main: 'Clear',
            description: 'Clear sky',
            icon: '01d',
          },
        ],
        sunrise: '06:00:00',
        sunset: '18:30:00',
        uvIndex: 6 + Math.random() * 4,
        moonPhase: Math.random(),
      });
    }

    return daily;
  }

  private generateWeatherAlerts() {
    const alerts = [];

    if (Math.random() > 0.7) {
      alerts.push({
        id: '1',
        event: 'Heavy Rainfall Warning',
        severity: 'moderate' as const,
        urgency: 'expected' as const,
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        description: 'Heavy rainfall expected in the region. Rainfall may range from 50-100mm.',
        instructions:
          'Postpone spraying activities. Ensure proper drainage in fields. Cover harvested crops.',
        affectedAreas: ['Nagpur', 'Wardha', 'Yavatmal'],
      });
    }

    return alerts;
  }

  private generateRecommendations() {
    return [
      {
        id: '1',
        type: 'irrigation' as const,
        title: 'Irrigation Recommended',
        description: 'Soil moisture is below optimal level. Consider irrigation within 2-3 days.',
        priority: 'medium' as const,
        validUntil: new Date(Date.now() + 259200000).toISOString(),
        weatherBased: true,
        reason: 'No rainfall expected for next 5 days',
      },
      {
        id: '2',
        type: 'spraying' as const,
        title: 'Good Time for Spraying',
        description:
          'Weather conditions are favorable for pesticide/fertilizer spraying. Low wind and no rain expected.',
        priority: 'high' as const,
        validUntil: new Date(Date.now() + 86400000).toISOString(),
        weatherBased: true,
        reason: 'Calm winds and dry conditions',
      },
    ];
  }

  private getCurrentSeason(): 'summer' | 'monsoon' | 'winter' | 'spring' {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 5) return 'summer';
    if (month >= 6 && month <= 9) return 'monsoon';
    if (month >= 10 || month <= 1) return 'winter';
    return 'spring';
  }
}

export const weatherService = new WeatherService();