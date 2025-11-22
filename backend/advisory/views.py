from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta

from .models import (
    CropType, CropCycle, WeatherAlert,
    PestDiseaseDetection, CropAdvisory
)
from .serializers import (
    CropTypeSerializer, CropCycleSerializer, CropCycleListSerializer,
    WeatherAlertSerializer, PestDiseaseDetectionSerializer,
    CropAdvisorySerializer, CropAdvisoryListSerializer
)


class CropTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Crop Type Master Data (Read-only)
    
    list: Get all crop types
    retrieve: Get specific crop type
    
    Custom Actions:
    - by_season: Filter crops by growing season
    - suitable_for_region: Get suitable crops for a region (AI-based)
    """
    
    queryset = CropType.objects.all()
    serializer_class = CropTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'scientific_name']
    ordering_fields = ['name', 'maturity_days']
    ordering = ['name']
    
    @action(detail=False, methods=['get'])
    def by_season(self, request):
        """Filter crops by growing season"""
        season = request.query_params.get('season', '').upper()
        if season not in ['KHARIF', 'RABI', 'ZAID']:
            return Response({'error': 'Invalid season. Use KHARIF, RABI, or ZAID'}, status=400)
        
        crops = CropType.objects.filter(growing_season__icontains=season)
        serializer = self.get_serializer(crops, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def suitable_for_region(self, request):
        """Get suitable crops based on climate data (AI placeholder)"""
        # In production, this would call ML model
        temp = float(request.data.get('temperature', 25))
        rainfall = float(request.data.get('rainfall', 500))
        
        suitable_crops = CropType.objects.filter(
            ideal_temperature_min__lte=temp,
            ideal_temperature_max__gte=temp,
            ideal_rainfall__lte=rainfall * 1.2,
            ideal_rainfall__gte=rainfall * 0.8
        )
        
        serializer = self.get_serializer(suitable_crops, many=True)
        return Response(serializer.data)


class CropCycleViewSet(viewsets.ModelViewSet):
    """
    Crop Cycle Management
    
    Custom Actions:
    - my_cycles: Get current user's crop cycles
    - active_cycles: Get active/ongoing cycles
    - predict_yield: AI yield prediction
    - harvest_ready: Get cycles ready for harvest
    """
    
    queryset = CropCycle.objects.select_related('farmer__user', 'crop_type').all()
    serializer_class = CropCycleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'crop_type', 'farmer']
    search_fields = ['cycle_id', 'farmer__farmer_id', 'crop_type__name']
    ordering_fields = ['sowing_date', 'expected_harvest_date', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CropCycleListSerializer
        return CropCycleSerializer
    
    def get_queryset(self):
        """Filter by user role"""
        user = self.request.user
        if user.role == 'FARMER':
            return CropCycle.objects.filter(farmer__user=user)
        elif user.role in ['POLICY', 'FPO']:
            # Policy makers and FPOs can see all
            return CropCycle.objects.all()
        return CropCycle.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_cycles(self, request):
        """Get current farmer's crop cycles"""
        if request.user.role != 'FARMER':
            return Response({'error': 'Only farmers can access this endpoint'}, status=403)
        
        try:
            cycles = CropCycle.objects.filter(farmer__user=request.user)
            serializer = self.get_serializer(cycles, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=False, methods=['get'])
    def active_cycles(self, request):
        """Get active/ongoing crop cycles"""
        active = self.get_queryset().filter(
            status__in=['SOWING', 'GROWING', 'HARVESTING']
        )
        serializer = CropCycleListSerializer(active, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def predict_yield(self, request, pk=None):
        """AI-based yield prediction"""
        cycle = self.get_object()
        
        # Placeholder for AI model integration
        # In production, this would call ML model with:
        # - Historical yield data
        # - Weather patterns
        # - Soil health
        # - Crop type characteristics
        
        import random
        predicted_yield = float(cycle.area_planted) * random.uniform(15, 25)  # quintals/hectare
        confidence = random.uniform(75, 95)
        
        cycle.predicted_yield = predicted_yield
        cycle.ai_recommendation_score = confidence
        cycle.save()
        
        return Response({
            'cycle_id': cycle.cycle_id,
            'predicted_yield': predicted_yield,
            'confidence_score': confidence,
            'recommendation': 'Based on current conditions, yield looks promising'
        })
    
    @action(detail=False, methods=['get'])
    def harvest_ready(self, request):
        """Get cycles ready for harvest"""
        today = timezone.now().date()
        ready_cycles = self.get_queryset().filter(
            expected_harvest_date__lte=today + timedelta(days=7),
            status__in=['GROWING', 'HARVESTING']
        )
        
        serializer = CropCycleListSerializer(ready_cycles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update crop cycle status"""
        cycle = self.get_object()
        new_status = request.data.get('status')
        
        valid_statuses = dict(CropCycle.STATUS_CHOICES).keys()
        if new_status not in valid_statuses:
            return Response({'error': 'Invalid status'}, status=400)
        
        cycle.status = new_status
        
        if new_status == 'HARVESTED':
            cycle.actual_harvest_date = timezone.now().date()
            actual_yield = request.data.get('actual_yield')
            if actual_yield:
                cycle.actual_yield = actual_yield
        
        cycle.save()
        
        serializer = self.get_serializer(cycle)
        return Response(serializer.data)


class WeatherAlertViewSet(viewsets.ModelViewSet):
    """
    Weather Alerts Management
    
    Custom Actions:
    - my_alerts: Get current user's alerts
    - active_alerts: Get active/valid alerts
    - mark_read: Mark alert as read
    """
    
    queryset = WeatherAlert.objects.select_related('farmer__user').all()
    serializer_class = WeatherAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['severity', 'alert_type', 'is_read']
    ordering_fields = ['valid_from', 'severity', 'created_at']
    ordering = ['-valid_from']
    
    def get_queryset(self):
        """Farmers see only their alerts"""
        user = self.request.user
        if user.role == 'FARMER':
            return WeatherAlert.objects.filter(farmer__user=user)
        return WeatherAlert.objects.all()
    
    @action(detail=False, methods=['get'])
    def my_alerts(self, request):
        """Get current user's weather alerts"""
        if request.user.role != 'FARMER':
            return Response({'error': 'Only farmers can access this endpoint'}, status=403)
        
        alerts = WeatherAlert.objects.filter(
            farmer__user=request.user
        ).order_by('-valid_from')
        
        serializer = self.get_serializer(alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active_alerts(self, request):
        """Get currently active alerts"""
        now = timezone.now()
        active = self.get_queryset().filter(
            valid_from__lte=now,
            valid_till__gte=now
        )
        
        serializer = self.get_serializer(active, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark alert as read"""
        alert = self.get_object()
        alert.is_read = True
        alert.save()
        return Response({'message': 'Alert marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all user's alerts as read"""
        if request.user.role != 'FARMER':
            return Response({'error': 'Only farmers can access this endpoint'}, status=403)
        
        updated = WeatherAlert.objects.filter(
            farmer__user=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({'message': f'{updated} alerts marked as read'})


class PestDiseaseDetectionViewSet(viewsets.ModelViewSet):
    """
    Pest/Disease Detection
    
    Custom Actions:
    - detect: Upload image for AI detection
    - my_detections: Get current user's detections
    - untreated: Get untreated pest detections
    """
    
    queryset = PestDiseaseDetection.objects.select_related('crop_cycle__farmer__user').all()
    serializer_class = PestDiseaseDetectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['severity_level', 'is_treated', 'crop_cycle']
    ordering_fields = ['confidence_score', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'FARMER':
            return PestDiseaseDetection.objects.filter(crop_cycle__farmer__user=user)
        return PestDiseaseDetection.objects.all()
    
    @action(detail=False, methods=['post'])
    def detect(self, request):
        """AI-based pest/disease detection from image"""
        # Placeholder for AI model integration
        # In production, this would:
        # 1. Process uploaded image
        # 2. Run through CNN model
        # 3. Return detected pest/disease with confidence
        
        import random
        
        pests = [
            'Aphids', 'Whiteflies', 'Pod Borer', 'Leaf Miner',
            'Stem Rot', 'Leaf Spot', 'Powdery Mildew'
        ]
        
        detected_pest = random.choice(pests)
        confidence = random.uniform(75, 98)
        severity = random.choice(['Low', 'Medium', 'High'])
        
        recommendation = f"Apply appropriate pesticide for {detected_pest}. Monitor closely."
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        detection = serializer.save(
            detected_pest=detected_pest,
            confidence_score=confidence,
            severity_level=severity,
            treatment_recommendation=recommendation
        )
        
        return Response(
            self.get_serializer(detection).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def my_detections(self, request):
        """Get current user's pest detections"""
        detections = self.get_queryset()
        serializer = self.get_serializer(detections, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def untreated(self, request):
        """Get untreated pest detections"""
        untreated = self.get_queryset().filter(is_treated=False)
        serializer = self.get_serializer(untreated, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_treated(self, request, pk=None):
        """Mark pest detection as treated"""
        detection = self.get_object()
        detection.is_treated = True
        detection.treatment_date = timezone.now().date()
        detection.save()
        
        return Response({'message': 'Marked as treated', 'treatment_date': detection.treatment_date})


class CropAdvisoryViewSet(viewsets.ModelViewSet):
    """
    Crop Advisory Management
    
    Custom Actions:
    - my_advisories: Get current user's advisories
    - unread: Get unread advisories
    - provide_feedback: Rate advisory
    """
    
    queryset = CropAdvisory.objects.select_related('farmer__user', 'crop_cycle').all()
    serializer_class = CropAdvisorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['advisory_type', 'is_read']
    ordering_fields = ['ai_confidence', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CropAdvisoryListSerializer
        return CropAdvisorySerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'FARMER':
            return CropAdvisory.objects.filter(farmer__user=user)
        return CropAdvisory.objects.all()
    
    @action(detail=False, methods=['get'])
    def my_advisories(self, request):
        """Get current user's advisories"""
        advisories = self.get_queryset()
        serializer = self.get_serializer(advisories, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread advisories"""
        unread = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark advisory as read"""
        advisory = self.get_object()
        advisory.is_read = True
        advisory.save()
        return Response({'message': 'Advisory marked as read'})
    
    @action(detail=True, methods=['post'])
    def provide_feedback(self, request, pk=None):
        """Provide feedback rating (1-5)"""
        advisory = self.get_object()
        rating = request.data.get('rating')
        
        if not rating or not (1 <= int(rating) <= 5):
            return Response({'error': 'Rating must be between 1 and 5'}, status=400)
        
        advisory.farmer_feedback = rating
        advisory.save()
        
        return Response({'message': 'Feedback recorded', 'rating': rating})