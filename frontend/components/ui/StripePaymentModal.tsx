/**
 * Stripe Payment Modal Component
 * Handles Stripe payment collection using Elements
 */
'use client';

import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import Modal from './Modal';
import Button from './Button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function StripePaymentForm({ amount, onSuccess, onCancel }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payments/success`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        toast.error(submitError.message || 'Payment failed');
      } else {
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast.error('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Amount to Pay:</span>
          <span className="text-xl font-bold text-green-600">
            ₹{amount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <PaymentElement />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </form>
  );
}

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string;
  amount: number;
  publishableKey: string;
  onSuccess: () => void;
}

export function StripePaymentModal({
  isOpen,
  onClose,
  clientSecret,
  amount,
  publishableKey,
  onSuccess,
}: StripePaymentModalProps) {
  const stripePromise = getStripe(publishableKey);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Payment"
      size="md"
    >
      <div className="p-6">
        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#10b981',
                },
              },
            }}
          >
            <StripePaymentForm
              amount={amount}
              onSuccess={onSuccess}
              onCancel={onClose}
            />
          </Elements>
        )}
      </div>
    </Modal>
  );
}
