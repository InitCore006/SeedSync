import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import BankCard from '@/components/profile/BankCard';
import EmptyState from '@/components/common/EmptyState';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';
import { BankDetails } from '@/types/profile.types';

export default function BankDetailsScreen() {
  const {
    bankDetails,
    isLoading,
    fetchBankDetails,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    setPrimaryAccount,
  } = useProfile();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountType: 'savings' as 'savings' | 'current',
  });

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBankDetails();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      accountHolderName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
      accountType: 'savings',
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEdit = (account: BankDetails) => {
    setFormData({
      accountHolderName: account.accountHolderName,
      accountNumber: account.accountNumber,
      confirmAccountNumber: account.accountNumber,
      ifscCode: account.ifscCode,
      bankName: account.bankName,
      branchName: account.branchName,
      accountType: account.accountType,
    });
    setEditingId(account.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Bank Account',
      'Are you sure you want to delete this bank account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBankAccount(id);
              Alert.alert('Success', 'Bank account deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete bank account');
            }
          },
        },
      ]
    );
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimaryAccount(id);
      Alert.alert('Success', 'Primary account updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to set primary account');
    }
  };

  const validateForm = () => {
    if (!formData.accountHolderName.trim()) {
      Alert.alert('Error', 'Please enter account holder name');
      return false;
    }
    if (!formData.accountNumber.trim()) {
      Alert.alert('Error', 'Please enter account number');
      return false;
    }
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      Alert.alert('Error', 'Account numbers do not match');
      return false;
    }
    if (!formData.ifscCode.trim() || formData.ifscCode.length !== 11) {
      Alert.alert('Error', 'Please enter valid IFSC code (11 characters)');
      return false;
    }
    if (!formData.bankName.trim()) {
      Alert.alert('Error', 'Please enter bank name');
      return false;
    }
    if (!formData.branchName.trim()) {
      Alert.alert('Error', 'Please enter branch name');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingId) {
        await updateBankAccount(editingId, {
          accountHolderName: formData.accountHolderName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode.toUpperCase(),
          bankName: formData.bankName,
          branchName: formData.branchName,
          accountType: formData.accountType,
        });
        Alert.alert('Success', 'Bank account updated successfully');
      } else {
        await addBankAccount({
          accountHolderName: formData.accountHolderName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode.toUpperCase(),
          bankName: formData.bankName,
          branchName: formData.branchName,
          accountType: formData.accountType,
          isVerified: false,
          isPrimary: bankDetails.length === 0,
        });
        Alert.alert('Success', 'Bank account added successfully');
      }
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save bank account');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Bank Details</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading && bankDetails.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.content}>
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerIcon}>ℹ️</Text>
              <Text style={styles.infoBannerText}>
                Your bank details are used for receiving payments from crop sales and government
                subsidies. Please ensure all information is accurate.
              </Text>
            </View>

            {/* Add/Edit Form */}
            {showAddForm && (
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>
                    {editingId ? 'Edit Bank Account' : 'Add Bank Account'}
                  </Text>
                  <Pressable onPress={resetForm}>
                    <Text style={styles.cancelButton}>✕</Text>
                  </Pressable>
                </View>

                <Input
                  label="Account Holder Name"
                  value={formData.accountHolderName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, accountHolderName: text })
                  }
                  placeholder="Enter account holder name"
                  autoCapitalize="words"
                />

                <Input
                  label="Account Number"
                  value={formData.accountNumber}
                  onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
                  placeholder="Enter account number"
                  keyboardType="number-pad"
                  secureTextEntry={!editingId}
                />

                <Input
                  label="Confirm Account Number"
                  value={formData.confirmAccountNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmAccountNumber: text })
                  }
                  placeholder="Re-enter account number"
                  keyboardType="number-pad"
                />

                <Input
                  label="IFSC Code"
                  value={formData.ifscCode}
                  onChangeText={(text) =>
                    setFormData({ ...formData, ifscCode: text.toUpperCase() })
                  }
                  placeholder="Enter IFSC code"
                  autoCapitalize="characters"
                  maxLength={11}
                />

                <Input
                  label="Bank Name"
                  value={formData.bankName}
                  onChangeText={(text) => setFormData({ ...formData, bankName: text })}
                  placeholder="Enter bank name"
                />

                <Input
                  label="Branch Name"
                  value={formData.branchName}
                  onChangeText={(text) => setFormData({ ...formData, branchName: text })}
                  placeholder="Enter branch name"
                />

                <Select
                  label="Account Type"
                  value={formData.accountType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, accountType: value as 'savings' | 'current' })
                  }
                  options={[
                    { label: 'Savings Account', value: 'savings' },
                    { label: 'Current Account', value: 'current' },
                  ]}
                />

                <View style={styles.formActions}>
                  <Button
                    label="Cancel"
                    onPress={resetForm}
                    variant="outline"
                    style={styles.formActionButton}
                  />
                  <Button
                    label={editingId ? 'Update' : 'Add Account'}
                    onPress={handleSubmit}
                    loading={isLoading}
                    style={styles.formActionButton}
                  />
                </View>
              </View>
            )}

            {/* Bank Accounts List */}
            {!showAddForm && (
              <>
                {bankDetails.length === 0 ? (
                  <EmptyState
                    icon="🏦"
                    title="No Bank Accounts"
                    description="Add your bank account to receive payments"
                    actionLabel="Add Bank Account"
                    onAction={() => setShowAddForm(true)}
                  />
                ) : (
                  <>
                    <View style={styles.accountsList}>
                      {bankDetails.map((account) => (
                        <BankCard
                          key={account.id}
                          account={account}
                          onEdit={() => handleEdit(account)}
                          onDelete={() => handleDelete(account.id)}
                          onSetPrimary={() => handleSetPrimary(account.id)}
                        />
                      ))}
                    </View>

                    <Button
                      label="+ Add Another Bank Account"
                      onPress={() => setShowAddForm(true)}
                      variant="outline"
                      style={styles.addButton}
                    />
                  </>
                )}
              </>
            )}

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Text style={styles.securityNoteIcon}>🔒</Text>
              <Text style={styles.securityNoteText}>
                Your bank details are encrypted and stored securely. We will never share your
                information with third parties without your consent.
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
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  formTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  cancelButton: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  formActionButton: {
    flex: 1,
  },
  accountsList: {
    marginBottom: spacing.md,
  },
  addButton: {
    marginBottom: spacing.md,
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