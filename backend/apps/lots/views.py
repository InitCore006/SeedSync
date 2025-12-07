"""
Lots Views for SeedSync Platform
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import IsFarmer, IsFPO
from .models import ProcurementLot, LotImage, LotStatusHistory
from .serializers import ProcurementLotSerializer, ProcurementLotCreateSerializer, LotImageSerializer


class ProcurementLotViewSet(viewsets.ModelViewSet):
    """Procurement lot viewset"""
    queryset = ProcurementLot.objects.filter(is_active=True).select_related('farmer', 'fpo').prefetch_related('images', 'status_history')
    serializer_class = ProcurementLotSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['crop_type', 'status', 'quality_grade', 'farmer', 'fpo']
    search_fields = ['lot_number', 'description']
    ordering_fields = ['created_at', 'quantity_quintals', 'expected_price_per_quintal']
    ordering = ['-created_at']
    
    def retrieve(self, request, *args, **kwargs):
        """Get single lot with status history and related data"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'status': 'success',
            'message': 'Lot details fetched successfully',
            'data': serializer.data
        })
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProcurementLotCreateSerializer
        return ProcurementLotSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsFarmer()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update lot status"""
        lot = self.get_object()
        new_status = request.data.get('status')
        remarks = request.data.get('remarks', '')
        
        if new_status not in dict(lot._meta.get_field('status').choices):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = lot.status
        lot.status = new_status
        lot.save()
        
        # Create status history
        LotStatusHistory.objects.create(
            lot=lot,
            old_status=old_status,
            new_status=new_status,
            changed_by=request.user,
            remarks=remarks
        )
        
        return Response({'status': 'Status updated successfully'})
    
    @action(detail=False, methods=['get'])
    def my_lots(self, request):
        """Get current user's lots"""
        if hasattr(request.user, 'farmer_profile'):
            queryset = self.get_queryset().filter(farmer=request.user.farmer_profile)
        elif hasattr(request.user, 'fpo_profile'):
            queryset = self.get_queryset().filter(fpo=request.user.fpo_profile)
        else:
            queryset = self.get_queryset().none()
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def marketplace(self, request):
        """Get marketplace listings - both individual and FPO aggregated lots"""
        # Show only individual farmer lots and FPO aggregated bulk lots
        # Exclude fpo_managed lots (those are internal to FPO)
        queryset = self.get_queryset().filter(
            status='available',
            listing_type__in=['individual', 'fpo_aggregated']
        ).select_related('farmer', 'farmer__user', 'fpo')
        
        # Apply filters
        crop_type = request.query_params.get('crop_type')
        quality_grade = request.query_params.get('quality_grade')
        listing_type = request.query_params.get('listing_type')
        
        if crop_type:
            queryset = queryset.filter(crop_type=crop_type)
        if quality_grade:
            queryset = queryset.filter(quality_grade=quality_grade)
        if listing_type:
            queryset = queryset.filter(listing_type=listing_type)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
