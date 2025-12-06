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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import SignatureCanvas from 'react-native-signature-canvas';
import { Button, Input } from '@/components';
import { COLORS } from '@/constants/colors';
import { logisticsAPI } from '@/services/logisticsService';

export default function PickupCompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [formData, setFormData] = useState({
    actual_quantity: '',
    quality_notes: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSignature = (sig: string) => {
    setSignature(sig);
    setShowSignaturePad(false);
  };

  const handleSubmit = async () => {
    if (!formData.actual_quantity) {
      Alert.alert('Error', 'Please enter actual quantity');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Error', 'Please upload at least one photo of loaded goods');
      return;
    }

    if (!signature) {
      Alert.alert('Error', 'Please capture farmer signature');
      return;
    }

    Alert.alert(
      'Confirm Pickup',
      'Are you sure you want to mark pickup as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              await logisticsAPI.updateShipmentStatus(parseInt(id), {
                status: 'in_transit',
                pickup_completed_at: new Date().toISOString(),
                actual_quantity_quintals: parseFloat(formData.actual_quantity),
                quality_notes: formData.quality_notes || undefined,
              });

              // Upload photos and signature
              for (const photo of photos) {
                await logisticsAPI.uploadPickupPhoto(parseInt(id), photo);
              }
              await logisticsAPI.uploadSignature(parseInt(id), 'pickup', signature);

              Alert.alert('Success', 'Pickup marked as complete', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              console.error('Failed to mark pickup complete:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to mark pickup complete');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.info} />
          <Text style={styles.instructionsText}>
            Please verify the goods, take photos, capture farmer's signature, and enter actual quantity before marking pickup as complete.
          </Text>
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos of Loaded Goods *</Text>
          <View style={styles.photosRow}>
            {photos.map((uri, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addPhotoBtn} onPress={pickPhotos}>
              <Ionicons name="camera" size={32} color={COLORS.secondary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quantity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actual Quantity</Text>
          <Input
            label="Quantity (Quintals) *"
            placeholder="Enter actual loaded quantity"
            value={formData.actual_quantity}
            onChangeText={(text) => setFormData({ ...formData, actual_quantity: text })}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Quality Check */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality Check</Text>
          <Input
            label="Quality Notes"
            placeholder="Any quality observations or issues"
            value={formData.quality_notes}
            onChangeText={(text) => setFormData({ ...formData, quality_notes: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Signature Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farmer Signature *</Text>
          {signature ? (
            <View style={styles.signaturePreview}>
              <Image
                source={{ uri: signature }}
                style={styles.signatureImage}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.retakeSignatureBtn}
                onPress={() => setShowSignaturePad(true)}
              >
                <Text style={styles.retakeText}>Retake Signature</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.signatureBtn}
              onPress={() => setShowSignaturePad(true)}
            >
              <Ionicons name="create-outline" size={24} color={COLORS.primary} />
              <Text style={styles.signatureBtnText}>Capture Farmer Signature</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* QR Code Scanner */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QR Code Verification (Optional)</Text>
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => Alert.alert('QR Scanner', 'QR scanner will be implemented')}
          >
            <Ionicons name="qr-code-outline" size={24} color={COLORS.secondary} />
            <Text style={styles.scanBtnText}>Scan Lot QR Code</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Mark Pickup Complete"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <View style={styles.signaturePadContainer}>
          <View style={styles.signaturePadHeader}>
            <Text style={styles.signaturePadTitle}>Farmer Signature</Text>
            <TouchableOpacity onPress={() => setShowSignaturePad(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <SignatureCanvas
            onOK={handleSignature}
            onEmpty={() => Alert.alert('Error', 'Please provide a signature')}
            descriptionText="Sign above"
            clearText="Clear"
            confirmText="Confirm"
            webStyle={`.m-signature-pad {box-shadow: none; border: none;} 
                      .m-signature-pad--body {border: none;}
                      .m-signature-pad--footer {display: none;}`}
          />
          <View style={styles.signaturePadActions}>
            <TouchableOpacity
              style={styles.signatureClearBtn}
              onPress={() => {
                // Clear signature - handled by SignatureCanvas
              }}
            >
              <Text style={styles.signatureClearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  instructionsCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.info + '10',
    borderRadius: 8,
    marginBottom: 24,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  photosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoWrapper: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  addPhotoBtn: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 4,
  },
  signatureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  signatureBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.primary,
  },
  signaturePreview: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signatureImage: {
    width: '100%',
    height: 150,
  },
  retakeSignatureBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  retakeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scanBtnText: {
    fontSize: 15,
    color: COLORS.text,
  },
  submitBtn: {
    marginTop: 8,
  },
  signaturePadContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  signaturePadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  signaturePadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  signaturePadActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  signatureClearBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  signatureClearText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.error,
  },
});
