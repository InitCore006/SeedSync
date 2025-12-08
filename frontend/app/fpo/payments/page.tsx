/**
 * FPO Payments Dashboard Page
 * Manage payments to farmers from FPO
 */
'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api';
import { Payment } from '@/lib/api/payments';
import { PaymentCard } from '@/components/ui/PaymentCard';
import { StripePaymentModal } from '@/components/ui/StripePaymentModal';
import Loading from '@/components/ui/Loading';
import { Wallet, AlertCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FPOPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    clientSecret: string;
    amount: number;
    publishableKey: string;
  }>({
    isOpen: false,
    clientSecret: '',
    amount: 0,
    publishableKey: '',
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const [paymentsRes, walletRes] = await Promise.all([
        API.payments.getMyPayments(),
        API.payments.getMyWallet(),
      ]);
      
      setPayments(paymentsRes);
      setWalletData(walletRes);
    } catch (error: any) {
      console.error('Failed to fetch payments:', error);
      toast.error(error.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (payment: Payment) => {
    try {
      const response = await API.payments.createStripePaymentIntent(payment.id);
      
      setPaymentModal({
        isOpen: true,
        clientSecret: response.client_secret,
        amount: response.amount,
        publishableKey: response.publishable_key,
      });
      setSelectedPayment(payment);
    } catch (error: any) {
      console.error('Failed to create payment intent:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentModal({ ...paymentModal, isOpen: false });
    toast.success('Payment completed successfully!');
    fetchPayments();
  };

  const filteredPayments = filter === 'all'
    ? payments
    : payments.filter(p => p.status === filter);

  // Separate payments by payer type (outgoing vs incoming)
  const outgoingPayments = filteredPayments.filter(p => p.payer_type === 'fpo');
  const incomingPayments = filteredPayments.filter(p => p.payer_type !== 'fpo');

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payments Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage payments to farmers and track transactions</p>
        </div>

        {/* Wallet Card */}
        {walletData && (
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Wallet Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-green-100 text-sm">Available Balance</p>
                <p className="text-3xl font-bold mt-1">
                  ₹{walletData.balance.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-green-100 text-sm">Pending Payments</p>
                <p className="text-3xl font-bold mt-1">
                  ₹{walletData.pending_payments.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-green-100 text-sm">Total Paid</p>
                <p className="text-3xl font-bold mt-1">
                  ₹{walletData.total_earned.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-500" />
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Failed
            </button>
          </div>
        </div>

        {/* Outgoing Payments (FPO pays farmers) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payments to Farmers</h2>
          {outgoingPayments.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No outgoing payments found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {outgoingPayments.map((payment) => (
                <div key={payment.id} className="relative">
                  <PaymentCard payment={payment} onClick={() => setSelectedPayment(payment)} />
                  {payment.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayNow(payment);
                      }}
                      className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Payments (FPO receives from processors) */}
        {incomingPayments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Incoming Payments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomingPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onClick={() => setSelectedPayment(payment)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stripe Payment Modal */}
      <StripePaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
        clientSecret={paymentModal.clientSecret}
        amount={paymentModal.amount}
        publishableKey={paymentModal.publishableKey}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
