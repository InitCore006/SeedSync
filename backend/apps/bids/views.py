"""Bids Views"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Bid, BidAcceptance
from .serializers import BidSerializer, BidAcceptanceSerializer

class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.filter(is_active=True)
    serializer_class = BidSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['lot', 'bidder_user', 'status']
    
    @action(detail=True, methods=['post'])
    def accept_bid(self, request, pk=None):
        bid = self.get_object()
        bid.accept()
        return Response({'status': 'Bid accepted'})
    
    @action(detail=True, methods=['post'])
    def reject_bid(self, request, pk=None):
        bid = self.get_object()
        rejection_reason = request.data.get('reason', '')
        bid.reject(rejection_reason)
        return Response({'status': 'Bid rejected'})

class BidAcceptanceViewSet(viewsets.ModelViewSet):
    queryset = BidAcceptance.objects.filter(is_active=True)
    serializer_class = BidAcceptanceSerializer
    permission_classes = [IsAuthenticated]
