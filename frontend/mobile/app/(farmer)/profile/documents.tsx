import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { useCamera } from '@/hooks/useCamera';
import DocumentCard from '@/components/profile/DocumentCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

export default function DocumentsScreen() {
  const {
    documents,
    isLoading,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    getKYCStatus,
  } = useProfile();
  const { pickImage, openCamera } = useCamera();

  const [refreshing, setRefreshing] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [documentNumbers, setDocumentNumbers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  const kycStatus = getKYCStatus();

  const documentTypes = [
    {
      type: 'aadhaar',
      label: 'Aadhaar Card',
      icon: '🆔',
      description: 'Upload front and back of your Aadhaar card',
      required: true,
      needsNumber: true,
    },
    {
      type: 'pan',
      label: 'PAN Card',
      icon: '💳',
      description: 'Upload your PAN card for tax purposes',
      required: true,
      needsNumber: true,
    },
    {
      type: 'land_records',
      label: 'Land Records',
      icon: '📄',
      description: 'Upload land ownership documents (7/12, 8A, etc.)',
      required: false,
      needsNumber: false,
    },
    {
      type: 'bank_passbook',
      label: 'Bank Passbook',
      icon: '🏦',
      description: 'Upload first page of bank passbook showing account details',
      required: true,
      needsNumber: false,
    },
  ];

  const handleUploadOption = (type: string) => {
    Alert.alert('Upload Document', 'Choose upload method:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: '📷 Take Photo',
        onPress: () => handleUpload(type, 'camera'),
      },
      {
        text: '🖼️ Choose from Gallery',
        onPress: () => handleUpload(type, 'gallery'),
      },
    ]);
  };

  const handleUpload = async (type: string, source: 'camera' | 'gallery') => {
    try {
      let imageUri: string | null = null;

      if (source === 'camera') {
        imageUri = await openCamera();
      } else {
        imageUri = await pickImage();
      }

      if (imageUri) {
        setUploadingType(type);
        
        const docType = documentTypes.find((dt) => dt.type === type);
        const documentNumber = docType?.needsNumber ? documentNumbers[type] : undefined;

        if (docType?.needsNumber && !documentNumber) {
          Alert.alert('Error', `Please enter ${docType.label} number first`);
          setUploadingType(null);
          return;
        }

        await uploadDocument(type, imageUri, documentNumber);
        setUploadingType(null);
        Alert.alert('Success', 'Document uploaded successfully. It will be verified shortly.');
        
        // Clear document number after upload
        if (docType?.needsNumber) {
          setDocumentNumbers((prev) => ({ ...prev, [type]: '' }));
        }
      }
    } catch (error) {
      setUploadingType(null);
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  const handleDelete = (id: string, type: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(id);
              Alert.alert('Success', 'Document deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const getDocumentForType = (type: string) => {
    return documents.find((doc) => doc.type === type);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Documents</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading && documents.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.content}>
            {/* KYC Status Card */}
            {kycStatus && (
              <View
                style={[
                  styles.kycStatusCard,
                  kycStatus.isVerified && styles.kycVerified,
                  !kycStatus.isComplete && styles.kycPending,
                ]}
              >
                <View style={styles.kycStatusHeader}>
                  <Text style={styles.kycStatusIcon}>
                    {kycStatus.isVerified ? '✅' : kycStatus.isComplete ? '⏳' : '📋'}
                  </Text>
                  <View style={styles.kycStatusInfo}>
                    <Text style={styles.kycStatusTitle}>
                      {kycStatus.isVerified
                        ? 'KYC Verified'
                        : kycStatus.isComplete
                        ? 'KYC Under Review'
                        : 'KYC Incomplete'}
                    </Text>
                    <Text style={styles.kycStatusDescription}>
                      {kycStatus.isVerified
                        ? 'All documents verified successfully'
                        : kycStatus.isComplete
                        ? 'Documents submitted for verification'
                        : `${kycStatus.pending.length} document(s) pending`}
                    </Text>
                  </View>
                </View>
                {!kycStatus.isComplete && (
                  <View style={styles.kycProgress}>
                    <View style={styles.kycProgressBar}>
                      <View
                        style={[styles.kycProgressFill, { width: `${kycStatus.progress}%` }]}
                      />
                    </View>
                    <Text style={styles.kycProgressText}>{Math.round(kycStatus.progress)}%</Text>
                  </View>
                )}
              </View>
            )}

            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerIcon}>ℹ️</Text>
              <Text style={styles.infoBannerText}>
                Upload clear, readable documents. Documents marked with * are required for KYC
                verification.
              </Text>
            </View>

            {/* Document Types */}
            <View style={styles.documentsSection}>
              {documentTypes.map((docType) => {
                const existingDoc = getDocumentForType(docType.type);
                const isUploading = uploadingType === docType.type;

                return (
                  <View key={docType.type} style={styles.documentTypeCard}>
                    <View style={styles.documentTypeHeader}>
                      <Text style={styles.documentTypeIcon}>{docType.icon}</Text>
                      <View style={styles.documentTypeInfo}>
                        <Text style={styles.documentTypeLabel}>
                          {docType.label}
                          {docType.required && (
                            <Text style={styles.requiredStar}> *</Text>
                          )}
                        </Text>
                        <Text style={styles.documentTypeDescription}>
                          {docType.description}
                        </Text>
                      </View>
                    </View>

                    {docType.needsNumber && !existingDoc && (
                      <Input
                        label={`${docType.label} Number`}
                        value={documentNumbers[docType.type] || ''}
                        onChangeText={(text) =>
                          setDocumentNumbers((prev) => ({ ...prev, [docType.type]: text }))
                        }
                        placeholder={`Enter ${docType.label.toLowerCase()} number`}
                        autoCapitalize="characters"
                      />
                    )}

                    {existingDoc ? (
                      <DocumentCard
                        document={existingDoc}
                        onDelete={() => handleDelete(existingDoc.id, docType.type)}
                        onReupload={() => handleUploadOption(docType.type)}
                      />
                    ) : (
                      <Button
                        label={isUploading ? 'Uploading...' : '📤 Upload Document'}
                        onPress={() => handleUploadOption(docType.type)}
                        loading={isUploading}
                        variant="outline"
                        style={styles.uploadButton}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Upload Guidelines */}
            <View style={styles.guidelinesCard}>
              <Text style={styles.guidelinesTitle}>📌 Upload Guidelines</Text>
              <View style={styles.guidelinesList}>
                <Text style={styles.guidelineItem}>
                  • Ensure documents are clear and all text is readable
                </Text>
                <Text style={styles.guidelineItem}>
                  • Upload original documents, not photocopies
                </Text>
                <Text style={styles.guidelineItem}>
                  • File size should not exceed 5MB
                </Text>
                <Text style={styles.guidelineItem}>
                  • Supported formats: JPG, PNG, PDF
                </Text>
                <Text style={styles.guidelineItem}>
                  • Documents will be verified within 24-48 hours
                </Text>
              </View>
            </View>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Text style={styles.securityNoteIcon}>🔒</Text>
              <Text style={styles.securityNoteText}>
                All documents are encrypted and stored securely. Your information is protected and
                will only be used for verification purposes.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
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
    backgroundColor: colors.surface,
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
    paddingBottom: spacing.xl,
  },
  kycStatusCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  kycVerified: {
    borderLeftColor: colors.success,
  },
  kycPending: {
    borderLeftColor: colors.error,
  },
  kycStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  kycStatusIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  kycStatusInfo: {
    flex: 1,
  },
  kycStatusTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  kycStatusDescription: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  kycProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  kycProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  kycProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  kycProgressText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: `${colors.accent}15`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  infoBannerIcon: {
    fontSize: 20,
  },
  infoBannerText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  documentsSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  documentTypeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  documentTypeHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  documentTypeIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  documentTypeInfo: {
    flex: 1,
  },
  documentTypeLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  requiredStar: {
    color: colors.error,
  },
  documentTypeDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  uploadButton: {
    marginTop: spacing.sm,
  },
  guidelinesCard: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  guidelinesTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  guidelinesList: {
    gap: spacing.xs,
  },
  guidelineItem: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: `${colors.success}10`,
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  securityNoteIcon: {
    fontSize: 16,
  },
  securityNoteText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },
});