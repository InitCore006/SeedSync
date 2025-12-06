import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Button, Loading } from '@/components';
import { COLORS } from '@/constants/colors';
import { fpoAPI } from '@/services/fpoService';

interface FPO {
  id: number;
  name: string;
  location: string;
  contact_number: string;
  latitude: number;
  longitude: number;
  distance: number;
}

export default function FPOFinderScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fpos, setFpos] = useState<FPO[]>([]);
  const [loading, setLoading] = useState(false);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const searchFPOs = async () => {
    if (!location) {
      Alert.alert('Error', 'Please enable location first');
      return;
    }

    setLoading(true);
    try {
      const response = await fpoAPI.getNearbyFPOs(
        location.latitude,
        location.longitude,
        50
      );
      setFpos(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to find FPOs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Nearby FPOs</Text>
        <Text style={styles.subtitle}>
          Discover Farmer Producer Organizations in your area
        </Text>
      </View>

      <View style={styles.content}>
        {!location ? (
          <View style={styles.locationPrompt}>
            <Ionicons name="location-outline" size={64} color={COLORS.primary} />
            <Text style={styles.promptText}>
              Enable location to find nearby FPOs
            </Text>
            <Button
              title="Enable Location"
              onPress={getLocation}
              style={styles.button}
            />
          </View>
        ) : (
          <>
            <View style={styles.locationInfo}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              <Text style={styles.locationText}>Location enabled</Text>
            </View>
            <Button
              title="Search Nearby FPOs"
              onPress={searchFPOs}
              loading={loading}
              style={styles.button}
            />
          </>
        )}

        {loading && <Loading />}

        {fpos.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              Found {fpos.length} FPO{fpos.length > 1 ? 's' : ''} nearby
            </Text>
            {fpos.map((fpo) => (
              <View key={fpo.id} style={styles.fpoCard}>
                <View style={styles.fpoHeader}>
                  <Ionicons name="business" size={24} color={COLORS.primary} />
                  <Text style={styles.fpoName}>{fpo.name}</Text>
                </View>
                
                <View style={styles.fpoDetail}>
                  <Ionicons name="location" size={16} color={COLORS.secondary} />
                  <Text style={styles.fpoLocation}>{fpo.location}</Text>
                </View>
                
                <View style={styles.fpoDetail}>
                  <Ionicons name="navigate" size={16} color={COLORS.primary} />
                  <Text style={styles.fpoDistance}>
                    {fpo.distance.toFixed(1)} km away
                  </Text>
                </View>
                
                <View style={styles.fpoDetail}>
                  <Ionicons name="call" size={16} color={COLORS.secondary} />
                  <Text style={styles.fpoContact}>{fpo.contact_number}</Text>
                </View>
                
                <Button
                  title="Call Now"
                  onPress={() => handleCall(fpo.contact_number)}
                  size="small"
                  style={styles.callButton}
                />
              </View>
            ))}
          </View>
        )}

        {!loading && location && fpos.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="sad-outline" size={64} color={COLORS.secondary} />
            <Text style={styles.emptyText}>
              No FPOs found within 50km radius
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  locationPrompt: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  promptText: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 12,
  },
  button: {
    marginTop: 8,
  },
  resultsSection: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  fpoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fpoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fpoName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 12,
    flex: 1,
  },
  fpoDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fpoLocation: {
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: 8,
    flex: 1,
  },
  fpoDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  fpoContact: {
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: 8,
  },
  callButton: {
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 16,
  },
});
