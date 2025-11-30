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

export default function WithdrawScreen() {
  const { balance, paymentMethods, isLoading, withdrawMoney } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!amount || withdrawAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (withdrawAmount > balance.available) {
      Alert.alert(
        'Insufficient Balance',
        'You do not have enough balance to withdraw this amount'
      );
      return;
    }

    if (!selectedMethodId) {
      Alert.alert('Payment Method Required', 'Please select a payment method');
      return;
    }

    try {
      setIsProcessing(true);
      await withdrawMoney(withdrawAmount, selectedMethodId);
      Alert.alert(
        'Success',
        `₹${amount} will be transferred to your account within 1-2 business days`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process withdrawal. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMaxAmount = () => {
    setAmount(balance.available.toString());
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Withdraw Money</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Available Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{balance.available.toFixed(2)}</Text>
        </View>

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
            <Pressable style={styles.maxButton} onPress={handleMaxAmount}>
              <Text style={styles.maxButtonText}>MAX</Text>
            </Pressable>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transfer To</Text>
          
          {isLoading && <LoadingSpinner />}

          {!isLoading && paymentMethods.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyText}>No payment methods added</Text>
            </View>
          )}

          {!isLoading && paymentMethods
            .filter((method) => method.type === 'bank' || method.type === 'upi')
            .map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onPress={() => setSelectedMethodId(method.id)}
                showRadio
                isSelected={selectedMethodId === method.id}
              />
            ))}
        </View>

        {/* Info Notes */}
        <View style={styles.infoNote}>
          <Text style={styles.infoIcon}>⏱️</Text>
          <Text style={styles.infoText}>
            Withdrawal will be processed within 1-2 business days
          </Text>
        </View>

        <View style={styles.infoNote}>
          <Text style={styles.infoIcon}>💰</Text>
          <Text style={styles.infoText}>
            No charges for bank transfers. Standard UPI charges may apply.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.withdrawButton,
            (!amount || !selectedMethodId || isProcessing) && styles.withdrawButtonDisabled,
            pressed && styles.withdrawButtonPressed,
          ]}
          onPress={handleWithdraw}
          disabled={!amount || !selectedMethodId || isProcessing}
        >
          {isProcessing ? (
            <LoadingSpinner color={colors.surface} />
          ) : (
            <Text style={styles.withdrawButtonText}>
              Withdraw ₹{amount || '0'}
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
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.surface,
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
    borderColor: colors.accent,
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
  maxButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  maxButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
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
    marginBottom: spacing.sm,
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
  withdrawButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  withdrawButtonDisabled: {
    backgroundColor: colors.border,
  },
  withdrawButtonPressed: {
    opacity: 0.7,
  },
  withdrawButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});