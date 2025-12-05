"""Payments Views"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Payment, Transaction, Wallet
from .serializers import PaymentSerializer, TransactionSerializer, WalletSerializer

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

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Wallet.objects.filter(is_active=True)
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]
