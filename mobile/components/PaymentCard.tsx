import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Payment } from '@/types/api';
import { getStatusInfo } from '@/constants/crops';

interface PaymentCardProps {
  payment: Payment;
  onPress: () => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onPress }) => {
  const statusInfo = getStatusInfo(payment.status, 'payment');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.paymentInfo}>
          <View style={[styles.iconContainer, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name="wallet" size={24} color={statusInfo.color} />
          </View>
          <View style={styles.details}>
            <Text style={styles.paymentId}>{payment.payment_id}</Text>
            <Text style={styles.lotNumber}>Lot: {payment.lot_number || 'N/A'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Gross Amount</Text>
          <Text style={styles.amountValue}>₹{payment.gross_amount.toLocaleString('en-IN')}</Text>
        </View>
        
        {payment.commission_amount > 0 && (
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>
              Commission ({payment.commission_percentage}%)
            </Text>
            <Text style={[styles.amountValue, styles.deduction]}>
              -₹{payment.commission_amount.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
        
        {payment.tax_amount > 0 && (
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Tax</Text>
            <Text style={[styles.amountValue, styles.deduction]}>
              -₹{payment.tax_amount.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
        
        <View style={styles.divider} />
        
        <View style={styles.amountRow}>
          <Text style={styles.netLabel}>Net Amount</Text>
          <Text style={styles.netValue}>₹{payment.net_amount.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {payment.payment_method_display && (
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>{payment.payment_method_display}</Text>
          </View>
        )}
        
        {payment.expected_date && payment.status === 'pending' && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>
              Expected: {new Date(payment.expected_date).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        {payment.completed_at && (
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.infoText}>
              Credited on {new Date(payment.completed_at).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        <Text style={styles.date}>
          Initiated {new Date(payment.initiated_at).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {},
  paymentId: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  lotNumber: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountSection: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  deduction: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  netLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  netValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  footer: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  date: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginTop: 4,
  },
});
