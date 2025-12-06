import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components';
import { COLORS } from '@/constants/colors';
import { lotsAPI } from '@/services/lotsService';
import { useLotsStore } from '@/store/lotsStore';
import { CROP_TYPES, QUALITY_GRADES } from '@/constants/crops';

export default function CreateLotScreen() {
  const { addLot } = useLotsStore();
  const [formData, setFormData] = useState({
    crop_type: 'soybean',
    crop_variety: '',
    harvest_date: new Date().toISOString().split('T')[0],
    quantity_quintals: '',
    quality_grade: 'A',
    expected_price_per_quintal: '',
    moisture_content: '',
    oil_content: '',
    description: '',
    storage_conditions: '',
    organic_certified: false,
    pickup_address: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      setImages([...images, ...uris].slice(0, 3));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!formData.crop_type || !formData.quantity_quintals || !formData.expected_price_per_quintal) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (images.length < 2) {
      Alert.alert('Error', 'Please upload at least 2 images');
      return;
    }

    setLoading(true);
    try {
      const lotData = {
        crop_type: formData.crop_type,
        crop_variety: formData.crop_variety || undefined,
        harvest_date: formData.harvest_date,
        quantity_quintals: parseFloat(formData.quantity_quintals),
        quality_grade: formData.quality_grade,
        expected_price_per_quintal: parseFloat(formData.expected_price_per_quintal),
        moisture_content: formData.moisture_content ? parseFloat(formData.moisture_content) : undefined,
        oil_content: formData.oil_content ? parseFloat(formData.oil_content) : undefined,
        description: formData.description || undefined,
        storage_conditions: formData.storage_conditions || undefined,
        organic_certified: formData.organic_certified,
        pickup_address: formData.pickup_address || undefined,
      };

      const response = await lotsAPI.createLot(lotData);
      const newLot = response.data;

      // Upload images
      for (const imageUri of images) {
        await lotsAPI.uploadImage(newLot.id, imageUri);
      }

      addLot(newLot);
      Alert.alert('Success', 'Lot created successfully! QR code will be generated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Failed to create lot:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create lot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lot Images * (2-3 required)</Text>
          <View style={styles.imagesRow}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 3 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <Ionicons name="camera" size={32} color={COLORS.secondary} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Crop Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crop Details</Text>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Crop Type *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.crop_type}
                onValueChange={(value) => setFormData({ ...formData, crop_type: value })}
              >
                {Object.entries(CROP_TYPES).map(([key, crop]) => (
                  <Picker.Item key={key} label={`${crop.icon} ${crop.label}`} value={key} />
                ))}
              </Picker>
            </View>
          </View>

          <Input
            label="Crop Variety"
            placeholder="e.g., Pusa Bold, JS-335"
            value={formData.crop_variety}
            onChangeText={(text) => setFormData({ ...formData, crop_variety: text })}
          />

          <Input
            label="Harvest Date *"
            placeholder="YYYY-MM-DD"
            value={formData.harvest_date}
            onChangeText={(text) => setFormData({ ...formData, harvest_date: text })}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Quantity (Quintals) *"
                placeholder="e.g., 50"
                value={formData.quantity_quintals}
                onChangeText={(text) => setFormData({ ...formData, quantity_quintals: text })}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfWidth}>
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Quality Grade *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.quality_grade}
                    onValueChange={(value) => setFormData({ ...formData, quality_grade: value })}
                  >
                    {Object.entries(QUALITY_GRADES).map(([key, grade]) => (
                      <Picker.Item key={key} label={`${key} - ${grade.label}`} value={key} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>

          <Input
            label="Expected Price (₹/Quintal) *"
            placeholder="e.g., 5500"
            value={formData.expected_price_per_quintal}
            onChangeText={(text) => setFormData({ ...formData, expected_price_per_quintal: text })}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Quality Parameters Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality Parameters (Optional)</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Moisture Content (%)"
                placeholder="e.g., 8.5"
                value={formData.moisture_content}
                onChangeText={(text) => setFormData({ ...formData, moisture_content: text })}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Oil Content (%)"
                placeholder="e.g., 38.5"
                value={formData.oil_content}
                onChangeText={(text) => setFormData({ ...formData, oil_content: text })}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setFormData({ ...formData, organic_certified: !formData.organic_certified })}
          >
            <Ionicons
              name={formData.organic_certified ? 'checkbox' : 'square-outline'}
              size={24}
              color={formData.organic_certified ? COLORS.primary : COLORS.secondary}
            />
            <Text style={styles.checkboxLabel}>Organic Certified</Text>
          </TouchableOpacity>
        </View>

        {/* Storage & Pickup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage & Pickup Details</Text>
          
          <Input
            label="Storage Conditions"
            placeholder="e.g., Cold storage, Warehouse"
            value={formData.storage_conditions}
            onChangeText={(text) => setFormData({ ...formData, storage_conditions: text })}
          />

          <Input
            label="Pickup Address"
            placeholder="Complete address for pickup"
            value={formData.pickup_address}
            onChangeText={(text) => setFormData({ ...formData, pickup_address: text })}
            multiline
            numberOfLines={3}
          />

          <Input
            label="Description"
            placeholder="Additional details about the lot"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        <Button
          title="Create Lot"
          onPress={handleCreate}
          loading={loading}
          style={styles.button}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 4,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  button: {
    marginTop: 8,
  },
});
 