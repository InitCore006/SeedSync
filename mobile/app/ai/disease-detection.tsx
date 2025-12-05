import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Button, Loading } from '@/components';
import { COLORS } from '@/constants/colors';
import { aiAPI } from '@/services/aiService';

interface DetectionResult {
  disease: string;
  confidence: number;
  treatment: string;
}

export default function DiseaseDetectionScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cropType, setCropType] = useState('mustard');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    const permissionFunc = useCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permissionFunc();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant permission to continue');
      return;
    }

    const launchFunc = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await launchFunc({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setResult(null);
    }
  };

  const handleDetect = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setLoading(true);
    try {
      const response = await aiAPI.detectDisease(imageUri, cropType);
      setResult(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to detect disease');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Disease Detection</Text>
        <Text style={styles.subtitle}>
          Upload a leaf image for AI-powered disease diagnosis
        </Text>
      </View>

      <View style={styles.content}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Take Photo"
            onPress={() => pickImage(true)}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="Choose from Gallery"
            onPress={() => pickImage(false)}
            variant="outline"
            style={styles.actionButton}
          />
        </View>

        <View style={styles.selector}>
          <Text style={styles.label}>Crop Type</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={cropType}
              onValueChange={(value) => setCropType(value)}
            >
              <Picker.Item label="Mustard" value="mustard" />
              <Picker.Item label="Groundnut" value="groundnut" />
              <Picker.Item label="Soybean" value="soybean" />
              <Picker.Item label="Sunflower" value="sunflower" />
            </Picker>
          </View>
        </View>

        <Button
          title="Detect Disease"
          onPress={handleDetect}
          loading={loading}
          disabled={!imageUri}
        />

        {loading && <Loading />}

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Detection Result</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Disease:</Text>
              <Text style={styles.resultValue}>{result.disease}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Confidence:</Text>
              <Text style={styles.resultValue}>
                {(result.confidence * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.treatmentSection}>
              <Text style={styles.treatmentTitle}>Recommended Treatment:</Text>
              <Text style={styles.treatmentText}>{result.treatment}</Text>
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
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  placeholder: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
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
  resultCard: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  treatmentSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  treatmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  treatmentText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
