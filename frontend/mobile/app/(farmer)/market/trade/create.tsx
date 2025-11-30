import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useMarket } from '@/hooks/useMarket';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function CreateTradeListingScreen() {
  const { type, cropId } = useLocalSearchParams<{ type: 'buy' | 'sell'; cropId?: string }>();
  const { user } = useAuth();
  const { crops, createTradeListing } = useMarket();

  const [selectedCrop, setSelectedCrop] = useState(cropId || '');
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedCropData = crops.find((c) => c.id === selectedCrop);

  const handleSubmit = async () => {
    if (!selectedCrop || !quantity || !pricePerUnit) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const crop = crops.find((c) => c.id === selectedCrop);
    if (!crop) return;

    setLoading(true);
    try {
      await createTradeListing({
        userId: user?.id || 'user123',
        cropId: crop.id,
        cropName: crop.name,
        variety: variety || undefined,
        type: type as 'buy' | 'sell',
        quantity: parseFloat(quantity),
        unit: crop.unit,
        pricePerUnit: parseFloat(pricePerUnit),
        totalPrice: parseFloat(quantity) * parseFloat(pricePerUnit),
        description: description || undefined,
        location: 'User Location', // Get from user profile
        district: 'User District',
        state: 'User State',
        contactName: user?.name || 'Farmer',
        contactNumber: user?.phone || '',
        status: 'active',
        verified: true,
        postedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      Alert.alert('Success', 'Trade listing created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>
            {type === 'buy' ? 'Post Buy Request' : 'Post Sell Offer'}
          </Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Type Badge */}
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeIcon}>
                {type === 'buy' ? '🛒' : '📦'}
              </Text>
              <View style={styles.typeBadgeContent}>
                <Text style={styles.typeBadgeTitle}>
                  {type === 'buy' ? 'Looking to Buy' : 'Available for Sale'}
                </Text>
                <Text style={styles.typeBadgeText}>
                  {type === 'buy'
                    ? 'Create a request to buy crops from other farmers'
                    : 'List your crops for sale to potential buyers'}
                </Text>
              </View>
            </View>

            {/* Crop Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Select Crop <Text style={styles.required}>*</Text>
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cropSelector}
              >
                {crops.map((crop) => (
                  <Pressable
                    key={crop.id}
                    style={[
                      styles.cropOption,
                      selectedCrop === crop.id && styles.cropOptionActive,
                    ]}
                    onPress={() => setSelectedCrop(crop.id)}
                  >
                    <Text style={styles.cropOptionIcon}>{crop.icon}</Text>
                    <Text
                      style={[
                        styles.cropOptionText,
                        selectedCrop === crop.id && styles.cropOptionTextActive,
                      ]}
                    >
                      {crop.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Variety (Optional) */}
            {selectedCropData && selectedCropData.varieties.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.label}>Variety (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Select or enter variety"
                  placeholderTextColor={colors.text.secondary}
                  value={variety}
                  onChangeText={setVariety}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.varietyTags}
                >
                  {selectedCropData.varieties.map((v, index) => (
                    <Pressable
                      key={index}
                      style={styles.varietyTag}
                      onPress={() => setVariety(v)}
                    >
                      <Text style={styles.varietyTagText}>{v}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Quantity */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Quantity ({selectedCropData?.unit || 'quintals'}) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                placeholderTextColor={colors.text.secondary}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>

            {/* Price Per Unit */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Price per {selectedCropData?.unit || 'quintal'} (₹) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter price"
                placeholderTextColor={colors.text.secondary}
                keyboardType="numeric"
                value={pricePerUnit}
                onChangeText={setPrice}
              />
            </View>

            {/* Total Price Display */}
            {quantity && pricePerUnit && (
              <View style={styles.totalPriceCard}>
                <Text style={styles.totalPriceLabel}>Total Value</Text>
                <Text style={styles.totalPriceValue}>
                  ₹{(parseFloat(quantity) * parseFloat(pricePerUnit)).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add details about the crop, quality, location, etc."
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Submit Button */}
            <Pressable
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating...' : 'Create Listing'}
              </Text>
            </Pressable>

            {/* Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                Your listing will be visible to all farmers and buyers on the platform. It will
                automatically expire after 30 days.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  typeBadge: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  typeBadgeIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  typeBadgeContent: {
    flex: 1,
  },
  typeBadgeTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  typeBadgeText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  cropSelector: {
    gap: spacing.sm,
  },
  cropOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    minWidth: 90,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cropOptionActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  cropOptionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  cropOptionText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  cropOptionTextActive: {
    color: colors.primary,
  },
  input: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  varietyTags: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  varietyTag: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 12,
  },
  varietyTagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  totalPriceCard: {
    backgroundColor: `${colors.success}10`,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalPriceLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  totalPriceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.success,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.accent}10`,
    borderRadius: 12,
    padding: spacing.sm,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },
});