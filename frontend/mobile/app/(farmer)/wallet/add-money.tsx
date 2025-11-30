import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useWallet } from '@/hooks/useWallet';
import PaymentMethodCard from '@/components/wallet/PaymentMethodCard';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import { colors } from '@/lib/constants/colors';
import { typography } from '@/lib/constants/typography';
import { spacing } from '@/lib/constants/spacing';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function AddMoneyScreen() {
  const { paymentMethods, isLoading, addMoneyToWallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!selectedMethodId) {
      Alert.alert('Payment Method Required', 'Please select a payment method');
      return;
    }

    try {
      setIsProcessing(true);
      await addMoneyToWallet(parseFloat(amount), selectedMethodId);
      Alert.alert(
        'Success',
        `₹${amount} has been added to your wallet`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add money. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Add Money</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Quick Amounts */}
          <View style={styles.quickAmounts}>
            {QUICK_AMOUNTS.map((value) => (
              <Pressable
                key={value}
                style={({ pressed }) => [
                  styles.quickAmountButton,
                  pressed && styles.quickAmountButtonPressed,
                ]}
                onPress={() => handleQuickAmount(value)}
              >
                <Text style={styles.quickAmountText}>₹{value}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          
          {isLoading && <LoadingSpinner />}

          {!isLoading && paymentMethods.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyText}>No payment methods added</Text>
            </View>
          )}

          {!isLoading && paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onPress={() => setSelectedMethodId(method.id)}
              showRadio
              isSelected={selectedMethodId === method.id}
            />
          ))}
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Money will be added instantly to your wallet after successful payment
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            (!amount || !selectedMethodId || isProcessing) && styles.addButtonDisabled,
            pressed && styles.addButtonPressed,
          ]}
          onPress={handleAddMoney}
          disabled={!amount || !selectedMethodId || isProcessing}
        >
          {isProcessing ? (
            <LoadingSpinner color={colors.surface} />
          ) : (
            <Text style={styles.addButtonText}>
              Add ₹{amount || '0'} to Wallet
            </Text>
          )}
        </Pressable>
      </View>
    </View>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountButtonPressed: {
    backgroundColor: `${colors.primary}20`,
    borderColor: colors.primary,
  },
  quickAmountText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.accent}15`,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.border,
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  addButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});