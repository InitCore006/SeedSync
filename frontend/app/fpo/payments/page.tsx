/**
 * FPO Payments Dashboard Page
 * Manage payments to farmers from FPO
 */
'use client';

import { useState, useEffect } from 'react';
import { API } from '@/lib/api';
import { Payment } from '@/lib/api/payments';
import Loading from '@/components/ui/Loading';
import Card, { CardContent } from '@/components/ui/Card';
import { Wallet, AlertCircle, Filter, Plus, X, TrendingUp, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

function FPOPaymentsContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [createPaymentForm, setCreatePaymentForm] = useState({
    farmer_id: '',
    amount: '',
    notes: '',
    payment_method: 'wallet'
  });

  useEffect(() => {
    fetchPayments();
    fetchMembers();
  }, []);

  const fetchPayments = async () => {
    try {
      const [paymentsRes, walletRes] = await Promise.all([
        API.payments.getMyPayments(),
        API.payments.getMyWallet(),
      ]);
      
      // Extract data from API response (backend wraps in { status, message, data })
      const paymentsData = (paymentsRes as any)?.data || paymentsRes || [];
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

  const fetchMembers = async () => {
    try {
      const response = await API.fpo.getMembers();
      setMembers(response.data?.results || []);
    } catch (error: any) {
      console.error('Failed to fetch members:', error);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createPaymentForm.farmer_id || !createPaymentForm.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await API.fpo.createPayment({
        farmer_id: createPaymentForm.farmer_id,
        amount: parseFloat(createPaymentForm.amount),
        notes: createPaymentForm.notes,
        payment_method: createPaymentForm.payment_method
      });
      
      toast.success('Payment created successfully!');
      setShowCreatePayment(false);
      setCreatePaymentForm({
        farmer_id: '',
        amount: '',
        notes: '',
        payment_method: 'wallet'
      });
      fetchPayments();
    } catch (error: any) {
      console.error('Failed to create payment:', error);
      toast.error(error.response?.data?.message || 'Failed to create payment');
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

  // Separate payments by payer type (outgoing vs incoming)
  const outgoingPayments = filteredPayments.filter(p => p.payer_type === 'fpo');
  const incomingPayments = filteredPayments.filter(p => p.payer_type !== 'fpo');
  
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Manage payments to farmers and track transactions</p>
        </div>
        <button
          onClick={() => setShowCreatePayment(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Payment
        </button>
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
                    <h3 className="text-lg font-bold text-gray-900">Payment #{payment.payment_id}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {payment.payer_type === 'fpo' ? `To: ${payment.payee_name}` : `From: ${payment.payer_name}`}
                    </p>
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
                    <p className="text-xs text-gray-600">Lot ID</p>
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

                {/* Commission Breakdown */}
                {payment.commission_amount > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-blue-900 mb-2">PAYMENT BREAKDOWN</p>
                    <div className="text-sm text-blue-900 space-y-1">
                      <div className="flex justify-between">
                        <span>Farmer receives:</span>
                        <span className="font-medium">₹{payment.net_amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>FPO Commission:</span>
                        <span className="font-medium">₹{payment.commission_amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {payment.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-1">Notes</p>
                    <p className="text-sm text-gray-600">{payment.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {payment.status === 'pending' && payment.payer_type === 'fpo' && (
                    <button
                      onClick={() => handlePayNow(payment)}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      Pay Now
                    </button>
                  )}
                  {payment.status === 'pending' && payment.payer_type !== 'fpo' && (
                    <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      Awaiting payment from {payment.payer_name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Payment Modal */}
      {showCreatePayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Payment to Farmer</h2>
              <button
                onClick={() => setShowCreatePayment(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4">
              {/* Farmer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Farmer *
                </label>
                <select
                  value={createPaymentForm.farmer_id}
                  onChange={(e) => setCreatePaymentForm({ ...createPaymentForm, farmer_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Choose a farmer...</option>
                  {members.map((member: any) => (
                    <option key={member.farmer.id} value={member.farmer.id}>
                      {member.farmer.full_name} - {member.farmer.user.phone_number}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={createPaymentForm.amount}
                  onChange={(e) => setCreatePaymentForm({ ...createPaymentForm, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={createPaymentForm.notes}
                  onChange={(e) => setCreatePaymentForm({ ...createPaymentForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Payment description or notes"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePayment(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Payment
                </button>
              </div>
            </form>
          </div>
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
                <p className="text-sm text-gray-600 mb-1">Payee</p>
                <p className="font-semibold text-gray-900">{selectedPayment.payee_name}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{selectedPayment.gross_amount.toLocaleString('en-IN')}
                </p>
              </div>

              {selectedPayment.commission_amount > 0 && (
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Farmer receives:</span>
                    <span className="font-medium">₹{selectedPayment.net_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FPO Commission:</span>
                    <span className="font-medium">₹{selectedPayment.commission_amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

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

export default function FPOPaymentsPage() {
  return (
    <ProtectedRoute allowedRoles={['fpo']}>
      <DashboardLayout>
        <FPOPaymentsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
