import axios from 'axios';

const WEATHER_API_KEY = '2b7aa3ec278eb3ed6ff75c50af0b2b1a';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  icon: string;
  city: string;
  alert?: string;
}

export const weatherService = {
  /**
   * Get weather by coordinates
   */
  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: 'metric',
        },
      });

      const data = response.data;
      return {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        rainfall: data.rain?.['1h'] || 0,
        icon: data.weather[0].icon,
        city: data.name,
        alert: data.main.humidity > 80 ? 'High humidity. Watch for fungal infections and ensure good ventilation.' : undefined,
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      throw error;
    }
  },

  /**
   * Get weather by city name
   */
  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
        params: {
          q: city,
          appid: WEATHER_API_KEY,
          units: 'metric',
        },
      });

      const data = response.data;
      return {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        rainfall: data.rain?.['1h'] || 0,
        icon: data.weather[0].icon,
        city: data.name,
        alert: data.main.humidity > 80 ? 'High humidity. Watch for fungal infections and ensure good ventilation.' : undefined,
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      throw error;
    }
  },

  /**
   * Get weather icon name for Ionicons
   */
  getWeatherIcon(condition: string, icon: string): string {
    const isNight = icon.includes('n');
    
    switch (condition.toLowerCase()) {
      case 'clear':
        return isNight ? 'moon' : 'sunny';
      case 'clouds':
        return isNight ? 'cloudy-night' : 'cloudy';
      case 'rain':
      case 'drizzle':
        return 'rainy';
      case 'thunderstorm':
        return 'thunderstorm';
      case 'snow':
        return 'snow';
      case 'mist':
      case 'smoke':
      case 'haze':
      case 'fog':
        return 'cloud';
      default:
        return 'partly-sunny';
    }
  },

  /**
   * Get greeting based on time of day
   */
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  },
};
