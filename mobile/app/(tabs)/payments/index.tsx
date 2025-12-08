import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
<<<<<<< Updated upstream
import { AppHeader, Sidebar, Loading } from '@/components';
=======
import { Loading } from '@/components';
>>>>>>> Stashed changes
import { COLORS } from '@/constants/colors';
import { paymentsAPI } from '@/services/paymentsService';
import { usePaymentsStore } from '@/store/paymentsStore';
import { Payment } from '@/types/api';
import { getStatusInfo } from '@/constants/crops';

export default function PaymentsScreen() {
  const { payments, setPayments } = usePaymentsStore();
<<<<<<< Updated upstream
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [walletData, setWalletData] = useState<any>(null);
=======
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
>>>>>>> Stashed changes

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
<<<<<<< Updated upstream
      const [paymentsRes, walletRes] = await Promise.all([
        paymentsAPI.getMyPayments(),
        paymentsAPI.getMyWallet(),
      ]);
      setPayments(paymentsRes.data);
      setWalletData(walletRes.data);
=======
      const response = await paymentsAPI.getMyPayments();
      setPayments(response.data);
>>>>>>> Stashed changes
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };

  const filteredPayments = filter === 'all'
    ? payments
    : payments.filter(payment => payment.status === filter);

  const renderPayment = ({ item }: { item: Payment }) => {
    const statusInfo = getStatusInfo('payment', item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/payments/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentId}>Payment #{item.id}</Text>
            <Text style={styles.paymentDate}>
              {new Date(item.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.amountRow}>
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Gross Amount</Text>
              <Text style={styles.amountValue}>
                ₹{item.gross_amount.toLocaleString('en-IN')}
              </Text>
            </View>
            {item.commission_amount > 0 && (
              <View style={styles.deductionSection}>
                <Text style={styles.deductionLabel}>Commission</Text>
                <Text style={styles.deductionValue}>
                  -₹{item.commission_amount.toLocaleString('en-IN')}
                </Text>
              </View>
            )}
          </View>

          {item.tax_amount > 0 && (
            <View style={styles.taxRow}>
              <Text style={styles.taxLabel}>Tax ({item.tax_percentage}%)</Text>
              <Text style={styles.taxValue}>
                ₹{item.tax_amount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Net Amount</Text>
            <Text style={styles.netValue}>
              ₹{item.net_amount.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.methodRow}>
            <Ionicons
              name={
                item.payment_method === 'upi'
                  ? 'wallet-outline'
                  : item.payment_method === 'bank_transfer'
                  ? 'card-outline'
                  : 'cash-outline'
              }
              size={16}
              color={COLORS.secondary}
            />
            <Text style={styles.methodText}>
              {item.payment_method.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
<<<<<<< Updated upstream
    return (
      <View style={{ flex: 1 }}>
        <AppHeader 
          title="Payments"
          onMenuPress={() => setSidebarVisible(true)}
        />
        <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        <Loading />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppHeader 
        title="Payments"
        onMenuPress={() => setSidebarVisible(true)}
      />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      <View style={styles.container}>
      {/* Wallet Balance Card */}
      {walletData && (
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <Ionicons name="wallet" size={24} color={COLORS.primary} />
            <Text style={styles.walletTitle}>Wallet Balance</Text>
          </View>
          <Text style={styles.walletBalance}>₹{walletData.balance.toLocaleString('en-IN')}</Text>
          <View style={styles.walletStats}>
            <View style={styles.walletStat}>
              <Text style={styles.walletStatLabel}>Pending</Text>
              <Text style={styles.walletStatValue}>
                ₹{walletData.pending_payments.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.walletDivider} />
            <View style={styles.walletStat}>
              <Text style={styles.walletStatLabel}>Total Earned</Text>
              <Text style={styles.walletStatValue}>
                ₹{walletData.total_earned.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>
      )}

=======
    return <Loading />;
  }

  return (
    <View style={styles.container}>
>>>>>>> Stashed changes
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'failed' && styles.filterTabActive]}
          onPress={() => setFilter('failed')}
        >
          <Text style={[styles.filterText, filter === 'failed' && styles.filterTextActive]}>
            Failed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Received</Text>
          <Text style={styles.summaryValue}>
            ₹
            {payments
              .filter(p => p.status === 'completed')
              .reduce((sum, p) => sum + p.net_amount, 0)
              .toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
            ₹
            {payments
              .filter(p => p.status === 'pending')
              .reduce((sum, p) => sum + p.net_amount, 0)
              .toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredPayments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color={COLORS.secondary} />
            <Text style={styles.emptyText}>No payments found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all'
                ? 'Your payment history will appear here'
                : `No ${filter} payments`}
            </Text>
          </View>
        }
      />
    </View>
<<<<<<< Updated upstream
    </View>
  );
}



=======
  );
}

>>>>>>> Stashed changes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
<<<<<<< Updated upstream
  walletCard: {
    backgroundColor: COLORS.primary,
    padding: 20,
    margin: 16,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  walletBalance: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
  },
  walletStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletStat: {
    flex: 1,
  },
  walletStatLabel: {
    fontSize: 13,
    color: COLORS.white + 'CC',
    marginBottom: 4,
  },
  walletStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  walletDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.white + '40',
    marginHorizontal: 16,
  },
=======
>>>>>>> Stashed changes
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentId: {
    fontSize: 16,
    fontWeight: '600',
<<<<<<< Updated upstream
    color: COLORS.primary,
=======
    color: COLORS.text,
>>>>>>> Stashed changes
    fontFamily: 'monospace',
  },
  paymentDate: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountSection: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
<<<<<<< Updated upstream
    color: COLORS.primary,
=======
    color: COLORS.text,
>>>>>>> Stashed changes
    marginTop: 2,
  },
  deductionSection: {
    alignItems: 'flex-end',
  },
  deductionLabel: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  deductionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.error,
    marginTop: 2,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  taxLabel: {
    fontSize: 13,
    color: COLORS.secondary,
  },
  taxValue: {
    fontSize: 14,
    fontWeight: '500',
<<<<<<< Updated upstream
    color: COLORS.primary,
=======
    color: COLORS.text,
>>>>>>> Stashed changes
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  netLabel: {
    fontSize: 14,
    fontWeight: '600',
<<<<<<< Updated upstream
    color: COLORS.primary,
=======
    color: COLORS.text,
>>>>>>> Stashed changes
  },
  netValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
<<<<<<< Updated upstream
    color: COLORS.primary,
=======
    color: COLORS.text,
>>>>>>> Stashed changes
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
