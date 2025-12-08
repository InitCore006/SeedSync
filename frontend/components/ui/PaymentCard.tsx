/**
 * Payment Card Component
 * Displays payment information in a card format
 */
'use client';

import { Payment } from '@/lib/api/payments';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, Calendar, User, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface PaymentCardProps {
  payment: Payment;
  onClick?: () => void;
}

export function PaymentCard({ payment, onClick }: PaymentCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          label: 'Completed',
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          label: 'Pending',
        };
      case 'processing':
        return {
          icon: AlertCircle,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          label: 'Processing',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          label: 'Failed',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(payment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border ${statusConfig.border} p-4 cursor-pointer hover:shadow-md transition-shadow`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{payment.payment_id}</p>
          <p className="text-xs text-gray-500 mt-1">
            <Calendar className="inline w-3 h-3 mr-1" />
            {formatDate(payment.initiated_at)}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusConfig.bg}`}>
          <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
          <span className={`text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Payer/Payee Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm">
          <User className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-gray-600">From:</span>
          <span className="ml-2 font-medium text-gray-900">{payment.payer_name}</span>
        </div>
        <div className="flex items-center text-sm">
          <User className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-gray-600">To:</span>
          <span className="ml-2 font-medium text-gray-900">{payment.payee_name}</span>
        </div>
      </div>

      {/* Amount Breakdown */}
      <div className="space-y-1 border-t pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Gross Amount:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(payment.gross_amount)}
          </span>
        </div>
        
        {payment.commission_amount > 0 && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>Commission ({payment.commission_percentage}%):</span>
            <span>- {formatCurrency(payment.commission_amount)}</span>
          </div>
        )}
        
        {payment.tax_amount > 0 && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tax:</span>
            <span>- {formatCurrency(payment.tax_amount)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-base font-semibold text-green-600 pt-2 border-t">
          <span>Net Amount:</span>
          <span>{formatCurrency(payment.net_amount)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="flex items-center mt-3 pt-3 border-t">
        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-xs text-gray-600">
          {payment.payment_method.replace('_', ' ').toUpperCase()}
        </span>
      </div>
    </div>
  );
}
