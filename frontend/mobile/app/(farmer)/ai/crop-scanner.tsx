import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAI } from '@/hooks/useAI';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function CropScannerScreen() {
  const { analyzeCrop, isScanning } = useAI();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropName, setCropName] = useState('');

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to scan crops.'
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select or capture an image first');
      return;
    }

    if (!cropName.trim()) {
      Alert.alert('Crop Name Required', 'Please enter the crop name');
      return;
    }

    try {
      await analyzeCrop(selectedImage, cropName);
      Alert.alert('Success', 'Crop analyzed successfully!', [
        {
          text: 'View Results',
          onPress: () => router.push('/(farmer)/ai/scan-history'),
        },
      ]);
      setSelectedImage(null);
      setCropName('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze crop');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Crop Scanner</Text>
        <Pressable onPress={() => router.push('/(farmer)/ai/scan-history')}>
          <Text style={styles.historyButton}>History</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📸</Text>
            <Text style={styles.infoTitle}>AI-Powered Crop Analysis</Text>
            <Text style={styles.infoText}>
              Take a photo or upload an image of your crop to detect diseases, pests, and get
              instant treatment recommendations.
            </Text>
          </View>

          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <Pressable style={styles.removeButton} onPress={() => setSelectedImage(null)}>
                <Text style={styles.removeButtonText}>Remove Image</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.uploadSection}>
              <Text style={styles.uploadTitle}>Select Image</Text>
              <View style={styles.uploadButtons}>
                <Pressable style={styles.uploadButton} onPress={handleTakePhoto}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadButtonText}>Take Photo</Text>
                </Pressable>
                <Pressable style={styles.uploadButton} onPress={handlePickImage}>
                  <Text style={styles.uploadIcon}>🖼️</Text>
                  <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
                </Pressable>
              </View>
            </View>
          )}

          {selectedImage && (
            <View style={styles.formSection}>
              <Input
                label="Crop Name"
                placeholder="e.g., Soybean, Wheat, Cotton"
                value={cropName}
                onChangeText={setCropName}
              />

              <Button
                title={isScanning ? 'Analyzing...' : 'Analyze Crop'}
                onPress={handleAnalyze}
                disabled={isScanning}
                style={styles.analyzeButton}
              />

              {isScanning && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>
                    AI is analyzing your crop image...
                  </Text>
                  <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>What We Detect:</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🦠</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureName}>Diseases</Text>
                  <Text style={styles.featureDesc}>
                    Fungal, bacterial, and viral infections
                  </Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🐛</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureName}>Pest Infestations</Text>
                  <Text style={styles.featureDesc}>
                    Identify harmful insects and larvae
                  </Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🧪</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureName}>Nutrient Deficiency</Text>
                  <Text style={styles.featureDesc}>
                    Detect nitrogen, phosphorus, and potassium deficiency
                  </Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🌡️</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureName}>Environmental Stress</Text>
                  <Text style={styles.featureDesc}>
                    Heat, cold, and water stress detection
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>Tips for Best Results:</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>
                Take photos in natural daylight
              </Text>
              <Text style={styles.tipItem}>
                Focus on affected areas of the plant
              </Text>
              <Text style={styles.tipItem}>
                Include both healthy and affected leaves
              </Text>
              <Text style={styles.tipItem}>
                Avoid blurry or dark images
              </Text>
              <Text style={styles.tipItem}>
                Capture close-up shots for better accuracy
              </Text>
            </View>
          </View>
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
  historyButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  imageContainer: {
    marginBottom: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  removeButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  uploadSection: {
    marginBottom: spacing.md,
  },
  uploadTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  uploadButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: spacing.md,
  },
  analyzeButton: {
    marginTop: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  loadingSubtext: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  featuresSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  featuresTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  featureContent: {
    flex: 1,
  },
  featureName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  featureDesc: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  tipsSection: {
    backgroundColor: `${colors.accent}15`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  tipsTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tipsList: {
    gap: spacing.xs,
  },
  tipItem: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
    paddingLeft: spacing.md,
  },
});