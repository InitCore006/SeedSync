import axios from 'axios';

const OPENWEATHER_API_KEY = '2b7aa3ec278eb3ed6ff75c50af0b2b1a';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  location: string;
  country: string;
  icon: string;
  sunrise: number;
  sunset: number;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const weatherService = {
  async getLocationName(coords: LocationCoords): Promise<{ display: string; country: string }> {
    try {
      const response = await axios.get(`${GEO_URL}/reverse`, {
        params: {
          lat: coords.latitude,
          lon: coords.longitude,
          limit: 5, // Get multiple results to find best match
          appid: OPENWEATHER_API_KEY,
        },
      });

      if (response.data && response.data.length > 0) {
        // Get the most specific location (usually first result)
        const primaryLocation = response.data[0];
        
        // Try to find if there's a more specific locality
        let locationName = primaryLocation.name || primaryLocation.local_names?.en || 'Unknown';
        const state = primaryLocation.state || '';
        const country = primaryLocation.country || '';

        // For Indian locations, format as: "Locality, District" or "Locality, State"
        if (country === 'IN') {
          // If we have state information (like Maharashtra)
          if (state) {
            // Check if location name is different from state
            if (locationName !== state) {
              return {
                display: `${locationName}, ${state}`,
                country: country,
              };
            } else {
              // If location name is same as state, just show state
              return {
                display: state,
                country: country,
              };
            }
          }
        }

        // For non-Indian locations or fallback
        if (state && locationName !== state) {
          return {
            display: `${locationName}, ${state}`,
            country: country,
          };
        }

        return {
          display: locationName,
          country: country,
        };
      }

      return { display: 'Unknown Location', country: '' };
    } catch (error) {
      console.error('Reverse Geocoding Error:', error);
      return { display: 'Unknown Location', country: '' };
    }
  },

  async getWeatherByCoords(coords: LocationCoords): Promise<WeatherData> {
    try {
      // Fetch weather data
      const weatherResponse = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat: coords.latitude,
          lon: coords.longitude,
          appid: OPENWEATHER_API_KEY,
          units: 'metric',
        },
      });

      const weatherData = weatherResponse.data;

      // Fetch accurate location name using reverse geocoding
      const locationInfo = await this.getLocationName(coords);

      console.log('Weather Location:', locationInfo); // Debug log

      return {
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
        location: locationInfo.display,
        country: locationInfo.country,
        icon: weatherData.weather[0].icon,
        sunrise: weatherData.sys.sunrise,
        sunset: weatherData.sys.sunset,
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      throw new Error('Failed to fetch weather data');
    }
  },

  getWeatherIcon(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  },

  getFarmingTip(condition: string, temperature: number, humidity: number): string {
    const lowerCondition = condition.toLowerCase();
    
    // Rain-related tips
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      if (lowerCondition.includes('heavy') || lowerCondition.includes('thunder')) {
        return 'Heavy rain expected. Ensure proper drainage and protect sensitive crops.';
      }
      return 'Light rain is beneficial. Check soil moisture before irrigating.';
    }
    
    // Hot weather tips
    if (lowerCondition.includes('clear') && temperature > 35) {
      if (humidity < 40) {
        return 'Hot and dry weather. Water crops early morning or late evening.';
      }
      return 'Hot weather. Ensure adequate watering, especially for young crops.';
    }
    
    // Cloudy weather
    if (lowerCondition.includes('cloud')) {
      if (temperature > 25 && temperature < 32) {
        return 'Perfect weather for field work and transplanting seedlings.';
      }
      return 'Cloudy weather reduces water loss. Good for most farm activities.';
    }
    
    // Cold weather
    if (temperature < 15) {
      return 'Cool weather. Protect sensitive crops and provide proper cover.';
    }
    
    // Moderate warm
    if (temperature > 30 && temperature < 35) {
      if (humidity > 70) {
        return 'Warm and humid. Monitor for pest activity and fungal diseases.';
      }
      return 'Warm conditions. Regular watering needed, watch for water stress.';
    }
    
    // Humid conditions
    if (humidity > 80) {
      return 'High humidity. Watch for fungal infections and ensure good ventilation.';
    }
    
    // Ideal conditions
    if (temperature >= 20 && temperature <= 30 && humidity >= 50 && humidity <= 70) {
      return 'Excellent weather conditions. Ideal for all farming activities.';
    }
    
    return 'Good weather for field activities. Plan your farm work accordingly.';
  },
};