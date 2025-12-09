import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Loading, Button } from '@/components';
import { COLORS } from '@/constants/colors';
import { paymentsAPI } from '@/services/paymentsService';
import { Payment } from '@/types/api';
import { getStatusInfo } from '@/constants/crops';

export default function PaymentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentDetails();
  }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getPaymentById(parseInt(id));
      
      if (response.data && response.data.data) {
        setPayment(response.data.data);
      } else {
        throw new Error('Payment not found');
      }
    } catch (error: any) {
      console.error('Failed to fetch payment details:', error);
      Alert.alert('Error', 'Failed to load payment details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!payment) return;

    Alert.alert(
      'Verify Payment',
      'Have you received this payment in your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Received',
          onPress: async () => {
            try {
              const response = await paymentsAPI.verifyPayment(payment.id, {
                gateway_transaction_id: `MANUAL_VERIFY_${Date.now()}`
              });
              
              if (response.data && response.data.success) {
                await fetchPaymentDetails();
                Alert.alert('Success', 'Payment verified successfully');
              }
            } catch (error: any) {
              console.error('Failed to verify payment:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to verify payment');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!payment) {
    return null;
  }

  const statusInfo = getStatusInfo('payment', payment.status);
  
  // Safely parse amounts
  const grossAmount = typeof payment.gross_amount === 'string'
    ? parseFloat(payment.gross_amount)
    : payment.gross_amount;
  const commissionAmount = typeof payment.commission_amount === 'string'
    ? parseFloat(payment.commission_amount)
    : payment.commission_amount || 0;
  const taxAmount = typeof payment.tax_amount === 'string'
    ? parseFloat(payment.tax_amount)
    : payment.tax_amount || 0;
  const netAmount = typeof payment.net_amount === 'string'
    ? parseFloat(payment.net_amount)
    : payment.net_amount;
  const commissionPercentage = typeof payment.commission_percentage === 'string'
    ? parseFloat(payment.commission_percentage)
    : payment.commission_percentage || 0;

  return (
    <ScrollView style={styles.container}>
      {/* Status Badge */}
      <View style={styles.statusSection}>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
          <Ionicons
            name={
              payment.status === 'completed'
                ? 'checkmark-circle'
                : payment.status === 'pending'
                ? 'time'
                : 'close-circle'
            }
            size={20}
            color={statusInfo.color}
          />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Payment ID */}
      <View style={styles.section}>
        <Text style={styles.paymentId}>
          {payment.payment_id || `Payment #${payment.id}`}
        </Text>
        <Text style={styles.paymentDate}>
          Created on {new Date(payment.initiated_at || payment.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Amount Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amount Breakdown</Text>
        
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Gross Amount</Text>
            <Text style={styles.breakdownValue}>
              ₹{grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          {commissionAmount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>
                Commission ({commissionPercentage}%)
              </Text>
              <Text style={[styles.breakdownValue, { color: COLORS.error }]}>
                -₹{commissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          )}

          {taxAmount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Tax</Text>
              <Text style={[styles.breakdownValue, { color: COLORS.error }]}>
                -₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          )}

          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Net Amount</Text>
            <Text style={styles.totalValue}>
              ₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.methodCard}>
          <Ionicons
            name={
              payment.payment_method === 'upi'
                ? 'wallet'
                : payment.payment_method === 'bank_transfer'
                ? 'card'
                : 'cash'
            }
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.methodText}>
            {payment.payment_method === 'upi'
              ? 'UPI Transfer'
              : payment.payment_method === 'bank_transfer'
              ? 'Bank Transfer'
              : 'Cash Payment'}
          </Text>
        </View>
      </View>

      {/* Transaction Details */}
      {payment.gateway_transaction_id && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{payment.gateway_transaction_id}</Text>
          </View>
        </View>
      )}

      {/* Timestamps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Payment Created</Text>
              <Text style={styles.timelineDate}>
                {new Date(payment.initiated_at || payment.created_at).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {payment.completed_at && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Payment Completed</Text>
                <Text style={styles.timelineDate}>
                  {new Date(payment.completed_at).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Notes */}
      {payment.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{payment.notes}</Text>
        </View>
      )}

      {/* Action Buttons */}
      {payment.status === 'completed' && (
        <View style={styles.actionSection}>
          <Button
            title="Confirm Payment Received"
            onPress={handleVerifyPayment}
            style={styles.verifyBtn}
          />
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statusSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  paymentId: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  paymentDate: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  timelineDate: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.secondary,
    lineHeight: 22,
  },
  actionSection: {
    padding: 16,
  },
  verifyBtn: {
    backgroundColor: COLORS.success,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: COLORS.success + '10',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
  },
  bottomSpacer: {
    height: 40,
  },
});
