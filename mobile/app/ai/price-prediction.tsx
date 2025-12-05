import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LineChart } from 'react-native-chart-kit';
import { Button, Loading } from '@/components';
import { COLORS } from '@/constants/colors';
import { aiAPI } from '@/services/aiService';

interface PredictionData {
  dates: string[];
  prices: number[];
}

export default function PricePredictionScreen() {
  const [cropType, setCropType] = useState('mustard');
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.predictPrice(cropType, 30);
      setPrediction(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to predict prices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Price Prediction</Text>
        <Text style={styles.subtitle}>
          30-day AI-powered price forecasting
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.selector}>
          <Text style={styles.label}>Select Crop</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={cropType}
              onValueChange={(value) => setCropType(value)}
            >
              <Picker.Item label="Mustard" value="mustard" />
              <Picker.Item label="Groundnut" value="groundnut" />
              <Picker.Item label="Soybean" value="soybean" />
              <Picker.Item label="Sunflower" value="sunflower" />
              <Picker.Item label="Sesame" value="sesame" />
            </Picker>
          </View>
        </View>

        <Button
          title="Predict Prices"
          onPress={handlePredict}
          loading={loading}
        />

        {loading && <Loading />}

        {prediction && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>30-Day Price Forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: prediction.dates.filter((_, i) => i % 5 === 0),
                  datasets: [
                    {
                      data: prediction.prices,
                      color: (opacity = 1) => `rgba(67, 116, 9, ${opacity})`,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={Dimensions.get('window').width * 1.5}
                height={250}
                chartConfig={{
                  backgroundColor: COLORS.white,
                  backgroundGradientFrom: COLORS.white,
                  backgroundGradientTo: COLORS.white,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(67, 116, 9, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: COLORS.primary,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </ScrollView>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Min Price</Text>
                <Text style={styles.statValue}>
                  ₹{Math.min(...prediction.prices).toFixed(0)}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Max Price</Text>
                <Text style={styles.statValue}>
                  ₹{Math.max(...prediction.prices).toFixed(0)}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Avg Price</Text>
                <Text style={styles.statValue}>
                  ₹
                  {(
                    prediction.prices.reduce((a, b) => a + b, 0) /
                    prediction.prices.length
                  ).toFixed(0)}
                </Text>
              </View>
            </View>
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
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  content: {
    padding: 20,
  },
  selector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  chartContainer: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
