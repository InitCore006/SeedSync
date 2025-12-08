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
<<<<<<< Updated upstream
import { Button, Input, CropSelector, VarietySelector, RequestVarietyModal } from '@/components';
import { COLORS } from '@/constants/colors';
import { lotsAPI } from '@/services/lotsService';
import { useLotsStore } from '@/store/lotsStore';
import { useAuthStore } from '@/store/authStore';
import { CropMaster, CropVariety } from '@/services/cropsService';
=======
import { Button, Input } from '@/components';
import { COLORS } from '@/constants/colors';
import { lotsAPI } from '@/services/lotsService';
import { useLotsStore } from '@/store/lotsStore';
import { CROP_TYPES, QUALITY_GRADES } from '@/constants/crops';
>>>>>>> Stashed changes

export default function CreateLotScreen() {
  const { addLot } = useLotsStore();
  const { user } = useAuthStore();
  
  // Crop Selection States
  const [selectedCrop, setSelectedCrop] = useState<CropMaster | null>(null);
  const [selectedVariety, setSelectedVariety] = useState<CropVariety | null>(null);
  const [cropSelectorVisible, setCropSelectorVisible] = useState(false);
  const [varietySelectorVisible, setVarietySelectorVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
<<<<<<< Updated upstream
    harvest_date: new Date().toISOString().split('T')[0],
    quantity_quintals: '',
    expected_price_per_quintal: '',
=======
    crop_type: 'soybean',
    crop_variety: '',
    harvest_date: new Date().toISOString().split('T')[0],
    quantity_quintals: '',
    quality_grade: 'A',
    expected_price_per_quintal: '',
    moisture_content: '',
    oil_content: '',
>>>>>>> Stashed changes
    description: '',
    storage_conditions: '',
    organic_certified: false,
    pickup_address: '',
  });
<<<<<<< Updated upstream
  const [sendToFPO, setSendToFPO] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCropSelect = (crop: CropMaster) => {
    setSelectedCrop(crop);
    setSelectedVariety(null); // Reset variety when crop changes
  };

  const handleVarietySelect = (variety: CropVariety) => {
    setSelectedVariety(variety);
  };

=======
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    // Validation
    if (!selectedCrop) {
      Alert.alert('Required Field', 'Please select a crop type');
      setCropSelectorVisible(true);
      return;
    }

    if (!selectedVariety) {
      Alert.alert('Required Field', 'Please select a crop variety');
      setVarietySelectorVisible(true);
      return;
    }

    if (!formData.quantity_quintals || !formData.expected_price_per_quintal) {
      Alert.alert('Required Fields', 'Please fill quantity and expected price');
      return;
    }

    if (images.length < 2) {
      Alert.alert('Images Required', 'Please upload at least 2 images of your crop');
=======
    if (!formData.crop_type || !formData.quantity_quintals || !formData.expected_price_per_quintal) {
      Alert.alert('Error', 'Please fill all required fields');
>>>>>>> Stashed changes
      return;
    }

    if (images.length < 2) {
      Alert.alert('Error', 'Please upload at least 2 images');
      return;
    }

    setLoading(true);
    try {
<<<<<<< Updated upstream
      // Prepare FormData for lot creation with images
      const formDataToSend = new FormData();
      
      // Add crop details
      formDataToSend.append('crop_type', selectedCrop.crop_name);
      formDataToSend.append('crop_master_code', selectedCrop.crop_code);
      formDataToSend.append('crop_variety', selectedVariety.variety_name);
      formDataToSend.append('crop_variety_code', selectedVariety.variety_code);
      
      // Add lot details
      formDataToSend.append('quantity_quintals', formData.quantity_quintals);
      formDataToSend.append('expected_price_per_quintal', formData.expected_price_per_quintal);
      formDataToSend.append('harvest_date', formData.harvest_date);
      
      // Add optional fields
      if (formData.description) {
        formDataToSend.append('description', formData.description);
=======
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
>>>>>>> Stashed changes
      }
      
      // Add images to FormData
      images.forEach((imageUri, index) => {
        const filename = imageUri.split('/').pop() || `image_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formDataToSend.append('uploaded_images', {
          uri: imageUri,
          type,
          name: filename,
        } as any);
      });

      console.log('📦 Creating lot with FormData including images');
      
      // Create lot with images in single request
      const response = await lotsAPI.createLot(formDataToSend);
      const newLot = response.data;
      
      console.log('✅ Lot created successfully:', {
        id: newLot.id,
        lot_number: newLot.lot_number,
        status: newLot.status,
        images_count: newLot.images?.length || 0
      });

      // Add lot to store
      addLot(newLot);
<<<<<<< Updated upstream
      console.log('✅ Lot added to store');

      Alert.alert(
        'Success! 🎉',
        `Your lot "${newLot.lot_number}" has been created successfully and is now visible to buyers.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('❌ Failed to create lot:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message ||
                          'Failed to create lot. Please try again.';
      Alert.alert('Error', errorMessage);
=======
      Alert.alert('Success', 'Lot created successfully! QR code will be generated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Failed to create lot:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create lot');
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
<<<<<<< Updated upstream
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Procurement Lot</Text>
          <Text style={styles.headerSubtitle}>
            List your crop for sale in the marketplace
          </Text>
        </View>

        {/* Step 1: Government Crop Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Select Crop & Variety</Text>
              <Text style={styles.sectionHint}>Government-registered crops only</Text>
            </View>
          </View>

          {/* Crop Selection */}
          <TouchableOpacity
            style={[styles.selectionButton, selectedCrop && styles.selectionButtonActive]}
            onPress={() => setCropSelectorVisible(true)}
          >
            <View style={styles.selectionContent}>
              {selectedCrop ? (
                <>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  <View style={styles.selectionTextContainer}>
                    <Text style={styles.selectionLabel}>Crop Selected</Text>
                    <Text style={styles.selectionValue}>
                      {selectedCrop.crop_name_display}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Ionicons name="leaf-outline" size={24} color={COLORS.secondary} />
                  <View style={styles.selectionTextContainer}>
                    <Text style={styles.selectionPlaceholder}>Select Crop Type *</Text>
                  </View>
                </>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
          </TouchableOpacity>

          {/* Variety Selection */}
          {selectedCrop && (
            <TouchableOpacity
              style={[styles.selectionButton, selectedVariety && styles.selectionButtonActive]}
              onPress={() => setVarietySelectorVisible(true)}
            >
              <View style={styles.selectionContent}>
                {selectedVariety ? (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                    <View style={styles.selectionTextContainer}>
                      <Text style={styles.selectionLabel}>Variety Selected</Text>
                      <Text style={styles.selectionValue}>
                        {selectedVariety.variety_name}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Ionicons name="flower-outline" size={24} color={COLORS.secondary} />
                    <View style={styles.selectionTextContainer}>
                      <Text style={styles.selectionPlaceholder}>Select Variety *</Text>
                    </View>
                  </>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          )}

          {/* Variety Info Card */}
          {selectedCrop && selectedVariety && (
            <View style={styles.cropInfoCard}>
              <View style={styles.cropInfoRow}>
                <Text style={styles.cropInfoLabel}>Maturity:</Text>
                <Text style={styles.cropInfoValue}>{selectedVariety.maturity_days} days</Text>
              </View>
              <View style={styles.cropInfoRow}>
                <Text style={styles.cropInfoLabel}>Yield:</Text>
                <Text style={styles.cropInfoValue}>
                  {selectedVariety.yield_potential_quintals_per_acre} Q/acre
                </Text>
              </View>
              <View style={styles.cropInfoRow}>
                <Text style={styles.cropInfoLabel}>Oil:</Text>
                <Text style={styles.cropInfoValue}>{selectedVariety.oil_content_percentage}%</Text>
              </View>
            </View>
          )}
        </View>

        {/* Step 2: Quantity & Pricing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Quantity & Pricing</Text>
              <Text style={styles.sectionHint}>Enter lot details</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Quantity (Quintals) *"
                value={formData.quantity_quintals}
                onChangeText={(text) =>
                  setFormData({ ...formData, quantity_quintals: text })
                }
                placeholder="100"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Expected Price (₹/Q) *"
                value={formData.expected_price_per_quintal}
                onChangeText={(text) =>
                  setFormData({ ...formData, expected_price_per_quintal: text })
                }
                placeholder="4500"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="Harvest Date *"
            value={formData.harvest_date}
            onChangeText={(text) =>
              setFormData({ ...formData, harvest_date: text })
            }
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* FPO Warehouse Option - Conditional on FPO Membership */}
        {user?.profile?.fpo_membership && (
          <View style={styles.section}>
            <View style={styles.fpoSection}>
              <View style={styles.fpoHeader}>
                <Ionicons name="business" size={24} color={COLORS.primary} />
                <View style={styles.fpoHeaderText}>
                  <Text style={styles.fpoTitle}>FPO Aggregated Listing</Text>
                  <Text style={styles.fpoSubtitle}>
                    Send to {user.profile.fpo_membership.fpo_name}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setSendToFPO(!sendToFPO)}
                activeOpacity={0.7}
              >
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, sendToFPO && styles.checkboxChecked]}>
                    {sendToFPO && (
                      <Ionicons name="checkmark" size={18} color={COLORS.white} />
                    )}
                  </View>
                  <View style={styles.checkboxTextContainer}>
                    <Text style={styles.checkboxLabel}>
                      Send to FPO warehouse for collective listing
                    </Text>
                    <Text style={styles.checkboxHint}>
                      Your lot will be aggregated with others for better pricing
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {sendToFPO && (
                <View style={styles.fpoInfoCard}>
                  <View style={styles.fpoInfoRow}>
                    <Ionicons name="location" size={16} color={COLORS.secondary} />
                    <Text style={styles.fpoInfoLabel}>Warehouse:</Text>
                    <Text style={styles.fpoInfoValue}>
                      {user.profile.fpo_membership.warehouse_name || 'Main Warehouse'}
                    </Text>
                  </View>
                  <View style={styles.fpoInfoRow}>
                    <Ionicons name="information-circle" size={16} color={COLORS.secondary} />
                    <Text style={styles.fpoInfoLabel}>Status:</Text>
                    <Text style={styles.fpoInfoValue}>
                      Auto-assigned to FPO lot
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Step 3: Images */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Upload Images *</Text>
              <Text style={styles.sectionHint}>Add 2-3 clear photos</Text>
            </View>
          </View>

=======
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lot Images * (2-3 required)</Text>
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
        {/* Step 4: Additional Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>4</Text>
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Additional Details</Text>
              <Text style={styles.sectionHint}>Optional</Text>
=======
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
>>>>>>> Stashed changes
            </View>
          </View>

          <Input
<<<<<<< Updated upstream
            label="Description"
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            placeholder="Any additional information about your crop lot..."
=======
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
>>>>>>> Stashed changes
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Create Button */}
        <Button
          title={loading ? "Creating Lot..." : "Create Procurement Lot"}
          onPress={handleCreate}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        />
      </ScrollView>

      {/* Modals */}
      <CropSelector
        visible={cropSelectorVisible}
        onClose={() => setCropSelectorVisible(false)}
        onSelect={handleCropSelect}
        selectedCropCode={selectedCrop?.crop_code}
      />

      {selectedCrop && (
        <>
          <VarietySelector
            visible={varietySelectorVisible}
            onClose={() => setVarietySelectorVisible(false)}
            onSelect={handleVarietySelect}
            onRequestNew={() => setRequestModalVisible(true)}
            cropCode={selectedCrop.crop_code}
            cropName={selectedCrop.crop_name_display}
            selectedVarietyCode={selectedVariety?.variety_code}
          />

          <RequestVarietyModal
            visible={requestModalVisible}
            onClose={() => setRequestModalVisible(false)}
            cropType={selectedCrop.crop_name}
            cropName={selectedCrop.crop_name_display}
          />
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
<<<<<<< Updated upstream
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  sectionHint: {
    fontSize: 13,
    color: COLORS.secondary,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  selectionButtonActive: {
    borderColor: COLORS.success,
    backgroundColor: '#f0fdf4',
  },
  selectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  selectionTextContainer: {
    flex: 1,
  },
  selectionLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 3,
  },
  selectionValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  selectionPlaceholder: {
    fontSize: 15,
    color: COLORS.secondary,
  },
  cropInfoCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#86efac',
    marginTop: 8,
  },
  cropInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  cropInfoLabel: {
    fontSize: 13,
    color: '#166534',
  },
  cropInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
=======
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
>>>>>>> Stashed changes
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
<<<<<<< Updated upstream
    backgroundColor: '#fafafa',
=======
>>>>>>> Stashed changes
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.secondary,
<<<<<<< Updated upstream
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
=======
    marginTop: 4,
>>>>>>> Stashed changes
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
<<<<<<< Updated upstream
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
=======
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
>>>>>>> Stashed changes
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
<<<<<<< Updated upstream
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  submitButton: {
=======
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
>>>>>>> Stashed changes
    marginTop: 8,
    marginBottom: 40,
  },
  fpoSection: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    backgroundColor: COLORS.primary + '08',
    padding: 16,
  },
  fpoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  fpoHeaderText: {
    flex: 1,
  },
  fpoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  fpoSubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  checkboxRow: {
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  checkboxHint: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  fpoInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  fpoInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fpoInfoLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  fpoInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
});
 