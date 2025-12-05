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
import { Button, Input } from '@/components';
import { COLORS } from '@/constants/colors';
import { lotsAPI } from '@/services/lotsService';
import { useLotsStore } from '@/store/lotsStore';

export default function CreateLotScreen() {
  const { addLot } = useLotsStore();
  const [formData, setFormData] = useState({
    crop_type: '',
    variety: '',
    quantity: '',
    unit: 'quintal',
    base_price: '',
    location: '',
    description: '',
  });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!formData.crop_type || !formData.variety || !formData.quantity || !formData.base_price) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const lotData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        base_price: parseFloat(formData.base_price),
      };

      const response = await lotsAPI.createLot(lotData);
      const newLot = response.data;

      if (imageUri) {
        await lotsAPI.uploadImage(newLot.id, imageUri);
      }

      addLot(newLot);
      Alert.alert('Success', 'Lot created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
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
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input
          label="Crop Type *"
          placeholder="e.g., Mustard, Groundnut"
          value={formData.crop_type}
          onChangeText={(text) => setFormData({ ...formData, crop_type: text })}
        />

        <Input
          label="Variety *"
          placeholder="e.g., Pusa Bold"
          value={formData.variety}
          onChangeText={(text) => setFormData({ ...formData, variety: text })}
        />

        <Input
          label="Quantity *"
          placeholder="Enter quantity"
          value={formData.quantity}
          onChangeText={(text) => setFormData({ ...formData, quantity: text })}
          keyboardType="decimal-pad"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Unit</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.unit}
              onValueChange={(value) => setFormData({ ...formData, unit: value })}
            >
              <Picker.Item label="Quintal" value="quintal" />
              <Picker.Item label="Ton" value="ton" />
              <Picker.Item label="Kg" value="kg" />
            </Picker>
          </View>
        </View>

        <Input
          label="Base Price (₹) *"
          placeholder="Enter price per unit"
          value={formData.base_price}
          onChangeText={(text) => setFormData({ ...formData, base_price: text })}
          keyboardType="decimal-pad"
        />

        <Input
          label="Location"
          placeholder="e.g., Village, District"
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
        />

        <Input
          label="Description"
          placeholder="Additional details"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

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
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 8,
  },
});
