/**
 * Retailer Payments Dashboard Page
 * Manage payments to processors using wallet
 */
'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api';
import { Payment } from '@/lib/api/payments';
import Loading from '@/components/ui/Loading';
import Card, { CardContent } from '@/components/ui/Card';
import { Wallet, AlertCircle, Filter, TrendingUp, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

function RetailerPaymentsContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const [paymentsRes, walletRes] = await Promise.all([
        API.payments.getPendingPayments(),
        API.payments.getMyWallet(),
      ]);
      
      // Get all payments for display
      const allPaymentsRes = await API.payments.getMyPayments();
      
      // Extract data from API response (backend wraps in { status, message, data })
      const paymentsData = (allPaymentsRes as any)?.data || allPaymentsRes || [];
      const walletData = (walletRes as any)?.data || walletRes || { balance: 0, pending_payments: 0, total_earned: 0, currency: 'INR' };
      
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setWalletData(walletData);
    } catch (error: any) {
      console.error('Failed to fetch payments:', error);
      toast.error(error.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;
    
    setProcessing(true);
    try {
      await API.payments.processWalletPayment(selectedPayment.id);
      
      toast.success('Payment completed successfully!');
      setShowConfirmModal(false);
      setSelectedPayment(null);
      fetchPayments();
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast.error(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const filteredPayments = filter === 'all'
    ? payments
    : payments.filter(p => p.status === filter);

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const completedPayments = payments.filter(p => p.status === 'completed');
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.gross_amount, 0);
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.gross_amount, 0);

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-600 mt-1">Track and process payments to processors</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{payments.length}</p>
              </div>
              <Wallet className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{pendingPayments.length}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  ₹{(walletData?.balance || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <Wallet className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  ₹{totalPending.toLocaleString('en-IN')}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="pt-6">
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
              All ({payments.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({pendingPayments.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({completedPayments.length})
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
        </CardContent>
      </Card>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'You have no payment transactions yet'
                  : `No ${filter} payments at this time`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Payment #{payment.id}</h3>
                    <p className="text-sm text-gray-600 mt-1">To: {payment.payee_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Payment Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Payment Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Order ID</p>
                    <p className="font-medium text-gray-900">{payment.lot || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Payment Method</p>
                    <p className="font-medium text-gray-900">{payment.payment_method || 'Wallet'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="font-bold text-primary">₹{payment.gross_amount.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Actions */}
                {payment.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePayNow(payment)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Pay Now
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Wallet Payment Confirmation Modal */}
      {showConfirmModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirm Payment</h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={processing}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Processor</p>
                <p className="font-semibold text-gray-900">{selectedPayment.payee_name}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{selectedPayment.gross_amount.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Wallet className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Wallet Balance</p>
                    <p className="text-lg font-bold text-blue-600">
                      ₹{(walletData?.balance || 0).toLocaleString('en-IN')}
                    </p>
                    {walletData && walletData.balance < selectedPayment.gross_amount && (
                      <p className="text-xs text-red-600 mt-1">
                        Insufficient balance
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={processing || (walletData && walletData.balance < selectedPayment.gross_amount)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RetailerPaymentsPage() {
  return (
    <ProtectedRoute allowedRoles={['retailer']}>
      <DashboardLayout>
        <RetailerPaymentsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
