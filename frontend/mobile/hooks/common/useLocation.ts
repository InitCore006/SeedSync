import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<LocationCoords | null> => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermission();

      if (!hasPermission) {
        setLoading(false);
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: LocationCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || undefined,
      };

      setLocation(coords);
      setLoading(false);

      return coords;
    } catch (error: any) {
      console.error('Get location error:', error);
      setError(error.message || 'Failed to get location');
      setLoading(false);
      return null;
    }
  };

  const getAddressFromCoords = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        return [
          address.name,
          address.street,
          address.city,
          address.region,
          address.postalCode,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');
      }

      return 'Address not found';
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return 'Address not available';
    }
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    getAddressFromCoords,
    requestPermission,
  };
};