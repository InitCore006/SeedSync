"""
Crops Views for SeedSync Platform
"""
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import CropMaster, CropVariety, MandiPrice, MSPRecord
from .serializers import CropMasterSerializer, CropVarietySerializer, MandiPriceSerializer, MSPRecordSerializer


class CropMasterViewSet(viewsets.ReadOnlyModelViewSet):
    """Crop master viewset - read only"""
    queryset = CropMaster.objects.filter(is_active=True)
    serializer_class = CropMasterSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['crop_name', 'category']
    search_fields = ['crop_name', 'scientific_name']


class CropVarietyViewSet(viewsets.ReadOnlyModelViewSet):
    """Crop variety viewset - read only"""
    queryset = CropVariety.objects.filter(is_active=True).select_related('crop')
    serializer_class = CropVarietySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['crop', 'variety_name']
    search_fields = ['variety_name', 'characteristics']


class MandiPriceViewSet(viewsets.ReadOnlyModelViewSet):
    """Mandi price viewset - read only"""
    queryset = MandiPrice.objects.filter(is_active=True).select_related('crop').order_by('-date')
    serializer_class = MandiPriceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['crop', 'state', 'market_name', 'date']
    search_fields = ['market_name']
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest prices for all crops"""
        crop_id = request.query_params.get('crop')
        state = request.query_params.get('state')
        
        queryset = self.get_queryset()
        if crop_id:
            queryset = queryset.filter(crop_id=crop_id)
        if state:
            queryset = queryset.filter(state=state)
        
        latest_prices = queryset[:20]
        serializer = self.get_serializer(latest_prices, many=True)
        return Response(serializer.data)


class MSPRecordViewSet(viewsets.ReadOnlyModelViewSet):
    """MSP record viewset - read only"""
    queryset = MSPRecord.objects.filter(is_active=True).select_related('crop').order_by('-year', '-season')
    serializer_class = MSPRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['crop', 'year', 'season']
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current year MSP"""
        from datetime import datetime
        current_year = datetime.now().year
        
        crop_id = request.query_params.get('crop')
        queryset = self.get_queryset().filter(year=current_year)
        
        if crop_id:
            queryset = queryset.filter(crop_id=crop_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
