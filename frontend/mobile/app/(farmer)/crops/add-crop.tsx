import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCrops } from '@/hooks/useCrops';
import {Button} from '@/components/common/Button';
import Select from '@/components/common/Select';
import DatePicker from '@/components/common/DatePicker';
import {Input} from '@/components/common/Input';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';


export default function AddCropScreen() {
  const { addCrop, isLoading } = useCrops();
  
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    category: 'oilseed' as any,
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    area: '',
    areaUnit: 'acre' as any,
    soilType: '',
    irrigationType: 'drip' as any,
    seedSource: '',
    seedCost: '',
    expectedYield: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const cropCategories = [
    { label: 'Oilseed', value: 'oilseed' },
    { label: 'Pulse', value: 'pulse' },
    { label: 'Cereal', value: 'cereal' },
    { label: 'Vegetable', value: 'vegetable' },
    { label: 'Fruit', value: 'fruit' },
    { label: 'Cash Crop', value: 'cash_crop' },
  ];

  const areaUnits = [
    { label: 'Acre', value: 'acre' },
    { label: 'Hectare', value: 'hectare' },
    { label: 'Bigha', value: 'bigha' },
  ];

  const irrigationTypes = [
    { label: 'Drip Irrigation', value: 'drip' },
    { label: 'Sprinkler', value: 'sprinkler' },
    { label: 'Flood Irrigation', value: 'flood' },
    { label: 'Rainfed', value: 'rainfed' },
  ];

  const soilTypes = [
    { label: 'Black Cotton Soil', value: 'Black Cotton Soil' },
    { label: 'Red Sandy Soil', value: 'Red Sandy Soil' },
    { label: 'Alluvial Soil', value: 'Alluvial Soil' },
    { label: 'Laterite Soil', value: 'Laterite Soil' },
    { label: 'Clay Soil', value: 'Clay Soil' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Crop name is required';
    if (!formData.variety.trim()) newErrors.variety = 'Variety is required';
    if (!formData.area || parseFloat(formData.area) <= 0) {
      newErrors.area = 'Valid area is required';
    }
    if (!formData.expectedHarvestDate) {
      newErrors.expectedHarvestDate = 'Expected harvest date is required';
    }
    if (!formData.soilType) newErrors.soilType = 'Soil type is required';
    if (!formData.seedSource.trim()) newErrors.seedSource = 'Seed source is required';
    if (!formData.seedCost || parseFloat(formData.seedCost) <= 0) {
      newErrors.seedCost = 'Valid seed cost is required';
    }
    if (!formData.expectedYield || parseFloat(formData.expectedYield) <= 0) {
      newErrors.expectedYield = 'Valid expected yield is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }

    try {
      // Calculate expected harvest date (if not set, default to 120 days)
      const plantDate = new Date(formData.plantingDate);
      const harvestDate = formData.expectedHarvestDate || 
        new Date(plantDate.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await addCrop({
        name: formData.name,
        variety: formData.variety,
        category: formData.category,
        plantingDate: formData.plantingDate,
        expectedHarvestDate: harvestDate,
        area: parseFloat(formData.area),
        areaUnit: formData.areaUnit,
        soilType: formData.soilType,
        irrigationType: formData.irrigationType,
        seedSource: formData.seedSource,
        seedCost: parseFloat(formData.seedCost),
        expectedYield: parseFloat(formData.expectedYield),
        notes: formData.notes,
        fieldLocation: {
          latitude: 21.1458,
          longitude: 79.0882,
          address: 'Village Kalamb, Nagpur, Maharashtra',
        },
        growthStage: {
          current: 'Germination',
          percentage: 5,
          daysRemaining: Math.ceil(
            (new Date(harvestDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ),
        },
        weather: {
          temperature: 28,
          humidity: 65,
          rainfall: 0,
          windSpeed: 10,
          forecast: [],
        },
      });

      Alert.alert('Success', 'Crop added successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add crop');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Add New Crop</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Crop Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crop Details</Text>

            <Input
              label="Crop Name *"
              placeholder="e.g., Soybean, Wheat, Cotton"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              error={errors.name}
            />

            <Input
              label="Variety *"
              placeholder="e.g., JS 335, HD 2967"
              value={formData.variety}
              onChangeText={(text) => setFormData({ ...formData, variety: text })}
              error={errors.variety}
            />

            <Select
              label="Category *"
              options={cropCategories}
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            />
          </View>

          {/* Planting Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planting Information</Text>

            <DatePicker
              label="Planting Date *"
              value={formData.plantingDate}
              onChange={(date) => setFormData({ ...formData, plantingDate: date })}
            />

            <DatePicker
              label="Expected Harvest Date *"
              value={formData.expectedHarvestDate}
              onChange={(date) => setFormData({ ...formData, expectedHarvestDate: date })}
              error={errors.expectedHarvestDate}
            />

            <View style={styles.row}>
              <View style={{ flex: 2 }}>
                <Input
                  label="Area *"
                  placeholder="e.g., 5"
                  keyboardType="decimal-pad"
                  value={formData.area}
                  onChangeText={(text) => setFormData({ ...formData, area: text })}
                  error={errors.area}
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Select
                  label="Unit *"
                  options={areaUnits}
                  value={formData.areaUnit}
                  onValueChange={(value) => setFormData({ ...formData, areaUnit: value })}
                />
              </View>
            </View>
          </View>

          {/* Field Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Field Information</Text>

            <Select
              label="Soil Type *"
              options={soilTypes}
              value={formData.soilType}
              onValueChange={(value) => setFormData({ ...formData, soilType: value })}
              error={errors.soilType}
            />

            <Select
              label="Irrigation Type *"
              options={irrigationTypes}
              value={formData.irrigationType}
              onValueChange={(value) => setFormData({ ...formData, irrigationType: value })}
            />
          </View>

          {/* Investment Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Investment Details</Text>

            <Input
              label="Seed Source *"
              placeholder="e.g., Maharashtra State Seeds"
              value={formData.seedSource}
              onChangeText={(text) => setFormData({ ...formData, seedSource: text })}
              error={errors.seedSource}
            />

            <Input
              label="Seed Cost (₹) *"
              placeholder="e.g., 3500"
              keyboardType="decimal-pad"
              value={formData.seedCost}
              onChangeText={(text) => setFormData({ ...formData, seedCost: text })}
              error={errors.seedCost}
            />

            <Input
              label="Expected Yield (Quintals) *"
              placeholder="e.g., 20"
              keyboardType="decimal-pad"
              value={formData.expectedYield}
              onChangeText={(text) => setFormData({ ...formData, expectedYield: text })}
              error={errors.expectedYield}
            />
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Add any additional information..."
              multiline
              numberOfLines={4}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholderTextColor={colors.text.secondary}
            />
          </View>

          {/* Submit Button */}
          <Button
            title={isLoading ? 'Adding Crop...' : 'Add Crop'}
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    ...typography.body,
    color: colors.text.primary,
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});