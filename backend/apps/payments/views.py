"""Payments Views"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from decimal import Decimal
from .models import Payment, Transaction, Wallet
from .serializers import PaymentSerializer, TransactionSerializer, WalletSerializer
from apps.core.utils import response_success, response_error

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.filter(is_active=True)
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'payer', 'payee']
    
    @action(detail=False, methods=['get'])
    def my_payments(self, request):
        payments = self.get_queryset().filter(payer=request.user) | self.get_queryset().filter(payee=request.user)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_wallet(self, request):
        """Get wallet balance and payment summary for current user"""
        try:
            # Get or create wallet for user
            wallet, created = Wallet.objects.get_or_create(
                user=request.user,
                defaults={'balance': Decimal('0.00')}
            )
            
            # Calculate pending payments (where user is payee)
            pending_payments = Payment.objects.filter(
                payee=request.user,
                status='pending',
                is_active=True
            ).aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
            
            # Calculate total earned (completed payments where user is payee)
            total_earned = Payment.objects.filter(
                payee=request.user,
                status='completed',
                is_active=True
            ).aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
            
            wallet_data = {
                'balance': float(wallet.balance),
                'pending_payments': float(pending_payments),
                'total_earned': float(total_earned),
                'currency': 'INR'
            }
            
            return Response(
                response_success(
                    message="Wallet data retrieved successfully",
                    data=wallet_data
                )
            )
        except Exception as e:
            return Response(
                response_error(message=f"Failed to retrieve wallet data: {str(e)}"),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Wallet.objects.filter(is_active=True)
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]
