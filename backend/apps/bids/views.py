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
    
    @action(detail=False, methods=['get'])
    def my_bids(self, request):
        """
        Get bids for current user:
        - For farmers (not in FPO): Returns bids placed on their own lots (received) and bids they placed (sent)
        - For FPO/Processor/Retailer: Returns bids they placed (sent)
        """
        user = request.user
        
        # Bids sent by the user (bids they placed)
        sent_bids = Bid.objects.filter(
            bidder_user=user,
            is_active=True
        ).select_related('lot', 'bidder_user').order_by('-submitted_at')
        
        # Bids received (for farmers only)
        received_bids = Bid.objects.none()
        
        if user.role == 'farmer':
            # Check if farmer has FPO membership
            try:
                farmer_profile = user.farmer_profile
                # Only show received bids if farmer is NOT associated with FPO
                if not farmer_profile.fpo:
                    # Get all lots created by this farmer
                    from apps.lots.models import ProcurementLot
                    farmer_lots = ProcurementLot.objects.filter(
                        farmer=farmer_profile,
                        is_active=True
                    ).values_list('id', flat=True)
                    
                    # Get all bids on farmer's lots
                    received_bids = Bid.objects.filter(
                        lot_id__in=farmer_lots,
                        is_active=True
                    ).select_related('lot', 'bidder_user').order_by('-submitted_at')
            except Exception as e:
                # Farmer profile doesn't exist, no received bids
                pass
        
        # Serialize the data
        sent_serializer = BidSerializer(sent_bids, many=True)
        received_serializer = BidSerializer(received_bids, many=True)
        
        return Response({
            'received': received_serializer.data,
            'sent': sent_serializer.data
        })
    
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
