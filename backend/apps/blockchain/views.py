"""Blockchain Views"""
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import BlockchainTransaction, TraceabilityRecord, QRCode
from .serializers import BlockchainTransactionSerializer, TraceabilityRecordSerializer, QRCodeSerializer

class BlockchainTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlockchainTransaction.objects.filter(is_active=True)
    serializer_class = BlockchainTransactionSerializer
    permission_classes = [IsAuthenticated]

class TraceabilityRecordViewSet(viewsets.ModelViewSet):
    queryset = TraceabilityRecord.objects.filter(is_active=True)
    serializer_class = TraceabilityRecordSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def trace(self, request, pk=None):
        record = self.get_object()
        return Response(record.journey)

class QRCodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QRCode.objects.filter(is_active=True)
    serializer_class = QRCodeSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def scan(self, request, pk=None):
        qr = self.get_object()
        qr.scan_count += 1
        qr.last_scanned_at = timezone.now()
        qr.save()
        return Response({'scan_count': qr.scan_count})
