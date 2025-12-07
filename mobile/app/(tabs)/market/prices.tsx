import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { AppHeader, Sidebar, Button, Loading } from '@/components';
import { COLORS } from '@/constants/colors';
import { lotsAPI } from '@/services/lotsService';
import { formatCurrency } from '@/utils/formatters';

interface MarketPrice {
  market_name: string;
  price: number;
  date: string;
}

export default function MarketPricesScreen() {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('mustard');
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFetchPrices = async () => {
    setLoading(true);
    try {
      const response = await lotsAPI.getMarketPrices(selectedCrop);
      setPrices(response.data.prices || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch market prices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        title="Market Prices"
        onMenuPress={() => setSidebarVisible(true)}
        showBackButton
        onBackPress={() => router.back()}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      <ScrollView style={styles.container}>
      <View style={styles.selector}>
        <Text style={styles.label}>Select Crop</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCrop}
            onValueChange={(value) => setSelectedCrop(value)}
          >
            <Picker.Item label="Mustard" value="mustard" />
            <Picker.Item label="Groundnut" value="groundnut" />
            <Picker.Item label="Soybean" value="soybean" />
            <Picker.Item label="Sunflower" value="sunflower" />
            <Picker.Item label="Sesame" value="sesame" />
          </Picker>
        </View>
        <Button
          title="Get Prices"
          onPress={handleFetchPrices}
          loading={loading}
          style={styles.button}
        />
      </View>

      {loading && <Loading />}

      {!loading && prices.length > 0 && (
        <View style={styles.pricesContainer}>
          {prices.map((price, index) => (
            <View key={index} style={styles.priceCard}>
              <View style={styles.priceHeader}>
                <Text style={styles.marketName}>{price.market_name}</Text>
                <Text style={styles.date}>{price.date}</Text>
              </View>
              <Text style={styles.price}>{formatCurrency(price.price)}</Text>
            </View>
          ))}
        </View>
      )}

      {!loading && prices.length === 0 && selectedCrop && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Click "Get Prices" to view market rates
          </Text>
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  selector: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  pricesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  priceCard: {
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
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  marketName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  date: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
  },
});
