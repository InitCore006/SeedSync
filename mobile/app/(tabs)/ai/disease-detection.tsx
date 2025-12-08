import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/constants/colors';
import { AppHeader, Sidebar, Picker } from '@/components';
import { diseaseDetectionService } from '@/services/diseaseDetectionService';

const CROP_TYPES = [
  { label: 'Groundnut', value: 'groundnut' },
  { label: 'Soybean', value: 'soybean' },
  { label: 'Sunflower', value: 'sunflower' },
];

interface SolutionData {
  disease_name: string;
  description: string;
  symptoms: string[];
  prevention: string[];
  treatment: string[];
  chemicals: string[];
  recommended_dose: string;
  cost_estimate: string;
  expert_contact: string;
}

export default function DiseaseDetectionScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [cropType, setCropType] = useState<'groundnut' | 'soybean' | 'sunflower'>('groundnut');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    disease: string;
    confidence_percentage: number;
    solution: SolutionData;
  } | null>(null);

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let permissionResult;
      
      if (source === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', `Please allow access to your ${source}`);
        return;
      }

      const pickerResult = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!pickerResult.canceled && pickerResult.assets[0]) {
        setImageUri(pickerResult.assets[0].uri);
        setResult(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleDetectDisease = async () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please select a crop image first');
      return;
    }

    console.log('🔍 Starting detection with imageUri:', imageUri);
    console.log('🔍 Crop type:', cropType);
    setLoading(true);
    setResult(null);

    try {
      const detectionResult = await diseaseDetectionService.detectDisease(imageUri, cropType);
      
      console.log('✅ Detection Result Received:', detectionResult);
      console.log('✅ Detection Result Type:', typeof detectionResult);
      console.log('✅ Is null?:', detectionResult === null);
      console.log('✅ Is undefined?:', detectionResult === undefined);
      
      if (!detectionResult) {
        throw new Error('No detection result returned from service');
      }
      
      console.log('✅ Disease:', detectionResult.disease);
      console.log('✅ Confidence:', detectionResult.confidence_percentage);
      console.log('✅ Solution type:', typeof detectionResult.solution);
      console.log('✅ Solution:', detectionResult.solution);
      
      setResult(detectionResult);
      console.log('✅ Result state updated successfully');
    } catch (error: any) {
      console.error('❌ Detection Error:', error);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Error Stack:', error.stack);
      Alert.alert('Error', error.message || 'Failed to detect disease');
    } finally {
      setLoading(false);
      console.log('✅ Loading set to false');
    }
  };

  const resetDetection = () => {
    setImageUri(null);
    setResult(null);
    setCropType('groundnut');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Disease Detection"
        onMenuPress={() => setSidebarVisible(true)}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="scan" size={56} color={COLORS.error} />
          </View>
          <Text style={styles.heroTitle}>AI Disease Detection</Text>
          <Text style={styles.heroSubtitle}>
            Upload a crop image to detect diseases instantly
          </Text>
        </View>

        {/* Crop Type Selection */}
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="leaf" size={20} color={COLORS.text.secondary} />
              <Text style={styles.inputLabel}>Select Crop Type</Text>
            </View>
            <Picker
              selectedValue={cropType}
              onValueChange={(value) => setCropType(value as any)}
              items={CROP_TYPES}
            />
          </View>
        </View>

        {/* Image Picker Section */}
        <View style={styles.imageSection}>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImageUri(null)}
              >
                <Ionicons name="close-circle" size={32} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="image-outline" size={64} color={COLORS.text.tertiary} />
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.pickButton}
              onPress={() => pickImage('camera')}
            >
              <Ionicons name="camera" size={24} color={COLORS.white} />
              <Text style={styles.pickButtonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickButton}
              onPress={() => pickImage('gallery')}
            >
              <Ionicons name="images" size={24} color={COLORS.white} />
              <Text style={styles.pickButtonText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {imageUri && !result && (
            <TouchableOpacity
              style={[styles.detectButton, loading && styles.detectButtonDisabled]}
              onPress={handleDetectDisease}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator color={COLORS.white} />
                  <Text style={styles.detectButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="scan" size={24} color={COLORS.white} />
                  <Text style={styles.detectButtonText}>Detect Disease</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Results Section */}
        {result && (
          <View style={styles.resultCard}>
            
            {/* Image Preview */}
            {imageUri && (
              <View style={styles.resultImageContainer}>
               
                <Image source={{ uri: imageUri }} style={styles.resultImage} />
              </View>
            )}

            <View style={styles.resultHeader}>
              <Ionicons
                name={result.disease.toLowerCase().includes('healthy') ? 'checkmark-circle' : 'alert-circle'}
                size={48}
                color={result.disease.toLowerCase().includes('healthy') ? '#22c55e' : COLORS.error}
              />
              <Text style={styles.resultTitle}>Detection Complete</Text>
            </View>

            <View style={styles.diseaseInfo}>
              <Text style={styles.diseaseLabel}>Detected Disease:</Text>
              <Text style={[
                styles.diseaseName,
                result.disease.toLowerCase().includes('healthy') && styles.healthyText
              ]}>
                {result.disease}
              </Text>
            </View>

            <View style={styles.confidenceBar}>
              <View style={styles.confidenceHeader}>
                <Text style={styles.confidenceLabel}>Confidence</Text>
                <Text style={styles.confidenceValue}>{result.confidence_percentage.toFixed(2)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${result.confidence_percentage}%` },
                  ]}
                />
              </View>
            </View>

            {/* Solution Details */}
            {result.solution && (
              <View style={styles.solutionContainer}>
                <View style={styles.solutionHeader}>
                  <Ionicons name="medical" size={24} color={COLORS.primary} />
                  <Text style={styles.solutionMainTitle}>Treatment Guide</Text>
                </View>

                {/* Disease Name */}
                {result.solution.disease_name && (
                  <View style={styles.solutionSection}>
                    <Text style={styles.diseaseNameText}>{result.solution.disease_name}</Text>
                  </View>
                )}

                {/* Description */}
                {result.solution.description && (
                  <View style={styles.solutionSection}>
                    <Text style={styles.descriptionText}>{result.solution.description}</Text>
                  </View>
                )}

                {/* Symptoms */}
                {result.solution.symptoms && result.solution.symptoms.length > 0 && (
                  <View style={styles.solutionSection}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                      <Text style={styles.sectionTitle}>Symptoms</Text>
                    </View>
                    {result.solution.symptoms.map((symptom, index) => (
                      <View key={index} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{symptom}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Prevention */}
                {result.solution.prevention && result.solution.prevention.length > 0 && (
                  <View style={styles.solutionSection}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="shield-checkmark" size={18} color="#22c55e" />
                      <Text style={styles.sectionTitle}>Prevention</Text>
                    </View>
                    {result.solution.prevention.map((prev, index) => (
                      <View key={index} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{prev}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Treatment */}
                {result.solution.treatment && result.solution.treatment.length > 0 && (
                  <View style={styles.solutionSection}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="medkit" size={18} color={COLORS.primary} />
                      <Text style={styles.sectionTitle}>Treatment Steps</Text>
                    </View>
                    {result.solution.treatment.map((treat, index) => (
                      <View key={index} style={styles.bulletPoint}>
                        <Text style={styles.bulletNumber}>{index + 1}.</Text>
                        <Text style={styles.bulletText}>{treat}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Chemicals */}
                {result.solution.chemicals && result.solution.chemicals.length > 0 && (
                  <View style={styles.solutionSection}>
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="flask" size={18} color={COLORS.warning} />
                      <Text style={styles.sectionTitle}>Recommended Chemicals</Text>
                    </View>
                    {result.solution.chemicals.map((chemical, index) => (
                      <View key={index} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{chemical}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Cost and Dosage */}
                {(result.solution.recommended_dose || result.solution.cost_estimate) && (
                  <View style={styles.costDosageContainer}>
                    {result.solution.recommended_dose && (
                      <View style={styles.infoBox}>
                        <Ionicons name="beaker" size={20} color={COLORS.primary} />
                        <View style={styles.infoBoxContent}>
                          <Text style={styles.infoBoxLabel}>Recommended Dose</Text>
                          <Text style={styles.infoBoxValue}>{result.solution.recommended_dose}</Text>
                        </View>
                      </View>
                    )}
                    
                    {result.solution.cost_estimate && (
                      <View style={styles.infoBox}>
                        <Ionicons name="cash" size={20} color={COLORS.warning} />
                        <View style={styles.infoBoxContent}>
                          <Text style={styles.infoBoxLabel}>Cost Estimate</Text>
                          <Text style={styles.infoBoxValue}>{result.solution.cost_estimate}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Expert Contact */}
                {result.solution.expert_contact && (
                  <View style={styles.expertContactBox}>
                    <Ionicons name="call" size={20} color={COLORS.info} />
                    <Text style={styles.expertContactText}>{result.solution.expert_contact}</Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.resetButton} onPress={resetDetection}>
              <Ionicons name="refresh" size={20} color={COLORS.white} />
              <Text style={styles.resetButtonText}>Scan Another Crop</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Take a clear photo of the affected plant part (leaves, stems, or fruits) for best results. Our AI model will analyze the image and provide disease diagnosis with treatment recommendations.
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  heroIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    margin: 20,
    marginBottom: 0,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 0,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  imageSection: {
    margin: 20,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  placeholderContainer: {
    height: 300,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.text.tertiary,
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pickButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pickButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  detectButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.error,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  detectButtonDisabled: {
    opacity: 0.7,
  },
  detectButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  resultCard: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginTop: 12,
  },
  diseaseInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  diseaseLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  diseaseName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.error,
    textAlign: 'center',
  },
  healthyText: {
    color: '#22c55e',
  },
  confidenceBar: {
    marginBottom: 24,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  solutionBox: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  solutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  solutionText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  resultImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: COLORS.background,
  },
  resultImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  solutionContainer: {
    marginTop: 8,
  },
  solutionMainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  solutionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    marginBottom: 12,
    paddingLeft: 4,
  },
  diseaseNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 20,
    color: COLORS.primary,
    marginRight: 10,
    lineHeight: 22,
    marginTop: -2,
  },
  bulletNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 10,
    lineHeight: 22,
    minWidth: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text.secondary,
  },
  costDosageContainer: {
    marginTop: 4,
    marginBottom: 16,
    gap: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
  },
  infoBoxContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoBoxLabel: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginBottom: 4,
  },
  infoBoxValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  expertContactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  expertContactText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.info,
    flex: 1,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
});
