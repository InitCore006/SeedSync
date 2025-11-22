from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone

from .models import (
    AgriStackSync, LandRecord, SoilHealthData,
    ExternalAPILog, SatelliteImagery
)
from .serializers import (
    AgriStackSyncSerializer, LandRecordSerializer,
    SoilHealthDataSerializer, ExternalAPILogSerializer,
    SatelliteImagerySerializer
)


class AgriStackSyncViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Agri-Stack Synchronization Status
    
    Custom Actions:
    - sync_farmer: Trigger sync for specific farmer
    - sync_status: Get overall sync status
    """
    
    queryset = AgriStackSync.objects.select_related('farmer__user').all()
    serializer_class = AgriStackSyncSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['farmer', 'is_verified']
    ordering = ['-last_sync_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'FARMER':
            return AgriStackSync.objects.filter(farmer__user=user)
        return AgriStackSync.objects.all()
    
    @action(detail=False, methods=['post'])
    def sync_farmer(self, request):
        """Trigger Agri-Stack sync for farmer"""
        farmer_id = request.data.get('farmer_id')
        
        if not farmer_id:
            return Response({'error': 'farmer_id required'}, status=400)
        
        try:
            from users.models import FarmerProfile
            farmer = FarmerProfile.objects.get(id=farmer_id)
        except FarmerProfile.DoesNotExist:
            return Response({'error': 'Farmer not found'}, status=404)
        
        # Placeholder for actual Agri-Stack API integration
        # In production, this would call government APIs
        
        sync_record, created = AgriStackSync.objects.get_or_create(
            farmer=farmer,
            defaults={'is_verified': False}
        )
        
        # Simulate API call
        import random
        sync_record.is_verified = random.choice([True, False])
        sync_record.last_sync_at = timezone.now()
        sync_record.save()
        
        return Response({
            'message': 'Sync completed',
            'farmer_id': str(farmer.id),
            'is_verified': sync_record.is_verified,
            'last_sync': sync_record.last_sync_at
        })
    
    @action(detail=False, methods=['get'])
    def sync_status(self, request):
        """Get overall Agri-Stack sync status"""
        total = AgriStackSync.objects.count()
        verified = AgriStackSync.objects.filter(is_verified=True).count()
        pending = total - verified
        
        return Response({
            'total_syncs': total,
            'verified': verified,
            'pending_verification': pending,
            'verification_rate': round((verified / total * 100), 2) if total > 0 else 0
        })


class LandRecordViewSet(viewsets.ModelViewSet):
    """
    Land Ownership Records
    
    Custom Actions:
    - my_lands: Get current farmer's land records
    - verify_ownership: Verify land ownership (admin)
    """
    
    queryset = LandRecord.objects.select_related('farmer__user').all()
    serializer_class = LandRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['farmer', 'state', 'district', 'village']
    search_fields = ['survey_number', 'khasra_number', 'village']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'FARMER':
            return LandRecord.objects.filter(farmer__user=user)
        return LandRecord.objects.all()
    
    def perform_create(self, serializer):
        """Auto-assign farmer from current user"""
        user = self.request.user
        if user.role == 'FARMER':
            serializer.save(farmer=user.farmer_profile)
    
    @action(detail=False, methods=['get'])
    def my_lands(self, request):
        """Get current farmer's land records"""
        if request.user.role != 'FARMER':
            return Response({'error': 'Only farmers can access this endpoint'}, status=403)
        
        lands = self.get_queryset()
        serializer = self.get_serializer(lands, many=True)
        
        total_area = sum(float(land.land_area) for land in lands)
        
        return Response({
            'total_parcels': lands.count(),
            'total_area_hectares': round(total_area, 2),
            'land_records': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify_ownership(self, request, pk=None):
        """Verify land ownership (admin only)"""
        land_record = self.get_object()
        
        # In production, this would verify against government land records
        verification_status = request.data.get('verified', True)
        
        land_record.is_verified = verification_status
        land_record.save()
        
        return Response({
            'message': 'Land ownership verification updated',
            'is_verified': land_record.is_verified
        })


class SoilHealthDataViewSet(viewsets.ModelViewSet):
    """
    Soil Health Card Data
    
    Custom Actions:
    - my_soil_data: Get current farmer's soil health data
    - analyze_soil: AI-based soil analysis and recommendations
    """
    
    queryset = SoilHealthData.objects.select_related('farmer__user', 'land_record').all()
    serializer_class = SoilHealthDataSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['farmer', 'land_record']
    ordering = ['-test_date']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'FARMER':
            return SoilHealthData.objects.filter(farmer__user=user)
        return SoilHealthData.objects.all()
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'FARMER':
            serializer.save(farmer=user.farmer_profile)
    
    @action(detail=False, methods=['get'])
    def my_soil_data(self, request):
        """Get current farmer's soil health data"""
        if request.user.role != 'FARMER':
            return Response({'error': 'Only farmers can access this endpoint'}, status=403)
        
        soil_data = self.get_queryset()
        serializer = self.get_serializer(soil_data, many=True)
        
        return Response({
            'total_tests': soil_data.count(),
            'soil_health_records': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def analyze_soil(self, request, pk=None):
        """AI-based soil analysis and crop recommendations"""
        soil_data = self.get_object()
        
        # Placeholder for ML-based soil analysis
        # In production, this would use ML model to analyze soil composition
        
        ph = float(soil_data.ph_level)
        nitrogen = soil_data.nitrogen
        phosphorus = soil_data.phosphorus
        potassium = soil_data.potassium
        
        recommendations = []
        suitable_crops = []
        
        # Simple rule-based recommendations (replace with ML in production)
        if ph < 5.5:
            recommendations.append("Soil is acidic. Apply lime to increase pH.")
        elif ph > 7.5:
            recommendations.append("Soil is alkaline. Add organic matter to lower pH.")
        else:
            recommendations.append("Soil pH is optimal.")
        
        if nitrogen == 'Low':
            recommendations.append("Apply nitrogen-rich fertilizers like urea.")
        if phosphorus == 'Low':
            recommendations.append("Add phosphate fertilizers.")
        if potassium == 'Low':
            recommendations.append("Use potassium-rich fertilizers like muriate of potash.")
        
        # Suggest suitable crops based on soil
        if 6.0 <= ph <= 7.5:
            suitable_crops.extend(['Groundnut', 'Soybean', 'Sunflower'])
        if nitrogen in ['Medium', 'High']:
            suitable_crops.append('Mustard')
        
        return Response({
            'soil_health_summary': {
                'ph_level': ph,
                'nitrogen': nitrogen,
                'phosphorus': phosphorus,
                'potassium': potassium,
                'organic_carbon': float(soil_data.organic_carbon)
            },
            'recommendations': recommendations,
            'suitable_crops': list(set(suitable_crops)),
            'fertilizer_plan': {
                'nitrogen_kg_per_hectare': 40 if nitrogen == 'Low' else 20,
                'phosphorus_kg_per_hectare': 30 if phosphorus == 'Low' else 15,
                'potassium_kg_per_hectare': 25 if potassium == 'Low' else 10
            }
        })


class SatelliteImageryViewSet(viewsets.ModelViewSet):
    """
    Satellite Imagery Analysis
    
    Custom Actions:
    - my_imagery: Get current farmer's satellite data
    - analyze_health: Analyze crop health from satellite data
    - detect_anomaly: Detect crop stress/anomalies
    """
    
    queryset = SatelliteImagery.objects.select_related('farmer__user', 'land_record').all()
    serializer_class = SatelliteImagerySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['farmer', 'land_record', 'anomaly_detected']
    ordering = ['-capture_date']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'FARMER':
            return SatelliteImagery.objects.filter(farmer__user=user)
        return SatelliteImagery.objects.all()
    
    @action(detail=False, methods=['get'])
    def my_imagery(self, request):
        """Get current farmer's satellite imagery"""
        if request.user.role != 'FARMER':
            return Response({'error': 'Only farmers can access this endpoint'}, status=403)
        
        imagery = self.get_queryset()
        serializer = self.get_serializer(imagery, many=True)
        
        return Response({
            'total_images': imagery.count(),
            'anomalies_detected': imagery.filter(anomaly_detected=True).count(),
            'imagery_data': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def analyze_health(self, request, pk=None):
        """Analyze crop health from satellite imagery"""
        imagery = self.get_object()
        
        # Placeholder for AI-based satellite image analysis
        # In production, use ML models to analyze NDVI, NDWI, etc.
        
        import random
        
        # Simulate NDVI/NDWI calculation
        ndvi = random.uniform(0.3, 0.9)
        ndwi = random.uniform(-0.5, 0.5)
        
        # Calculate crop health score
        health_score = (ndvi * 60) + (max(0, ndwi) * 40)
        
        # Determine health status
        if health_score >= 80:
            health_status = 'Excellent'
            action = 'Continue current practices'
        elif health_score >= 60:
            health_status = 'Good'
            action = 'Monitor regularly'
        elif health_score >= 40:
            health_status = 'Moderate'
            action = 'Check for water stress or nutrient deficiency'
        else:
            health_status = 'Poor'
            action = 'Immediate intervention required'
        
        # Update imagery record
        imagery.ndvi_value = ndvi
        imagery.ndwi_value = ndwi
        imagery.crop_health_score = health_score
        imagery.save()
        
        return Response({
            'capture_date': imagery.capture_date,
            'indices': {
                'ndvi': round(ndvi, 3),
                'ndwi': round(ndwi, 3)
            },
            'crop_health_score': round(health_score, 2),
            'health_status': health_status,
            'recommended_action': action,
            'water_stress': ndwi < -0.2,
            'vegetation_density': 'High' if ndvi > 0.7 else 'Medium' if ndvi > 0.5 else 'Low'
        })
    
    @action(detail=True, methods=['post'])
    def detect_anomaly(self, request, pk=None):
        """Detect crop stress/anomalies from satellite data"""
        imagery = self.get_object()
        
        # Placeholder for anomaly detection
        # In production, use ML models trained on satellite imagery
        
        import random
        
        anomaly_detected = random.choice([True, False])
        
        if anomaly_detected:
            anomaly_types = [
                'Water stress detected',
                'Pest infestation suspected',
                'Nutrient deficiency',
                'Disease outbreak probable'
            ]
            anomaly_type = random.choice(anomaly_types)
            
            imagery.anomaly_detected = True
            imagery.anomaly_type = anomaly_type
            imagery.save()
            
            return Response({
                'anomaly_detected': True,
                'anomaly_type': anomaly_type,
                'severity': random.choice(['Low', 'Medium', 'High']),
                'recommended_actions': [
                    'Conduct field inspection',
                    'Consult agricultural expert',
                    'Check soil moisture levels'
                ]
            })
        else:
            imagery.anomaly_detected = False
            imagery.save()
            
            return Response({
                'anomaly_detected': False,
                'message': 'No anomalies detected. Crop health appears normal.'
            })


class ExternalAPILogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    External API Call Logs (Read-only)
    
    Custom Actions:
    - api_stats: Get API usage statistics
    - performance_metrics: Get API performance metrics
    """
    
    queryset = ExternalAPILog.objects.all()
    serializer_class = ExternalAPILogSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['api_name', 'status_code', 'is_success']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def api_stats(self, request):
        """Get API usage statistics"""
        from django.db.models import Count, Avg, Q
        
        logs = ExternalAPILog.objects.all()
        
        stats = {
            'total_calls': logs.count(),
            'successful_calls': logs.filter(is_success=True).count(),
            'failed_calls': logs.filter(is_success=False).count(),
            'by_api': {},
            'average_response_time': float(logs.aggregate(Avg('response_time'))['response_time__avg'] or 0)
        }
        
        # Group by API name
        api_counts = logs.values('api_name').annotate(
            total=Count('id'),
            success=Count('id', filter=Q(is_success=True)),
            avg_time=Avg('response_time')
        )
        
        for item in api_counts:
            stats['by_api'][item['api_name']] = {
                'total_calls': item['total'],
                'successful': item['success'],
                'failed': item['total'] - item['success'],
                'average_response_time_ms': round(float(item['avg_time'] or 0), 2)
            }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def performance_metrics(self, request):
        """Get API performance metrics"""
        api_name = request.query_params.get('api_name')
        
        filters = {}
        if api_name:
            filters['api_name'] = api_name
        
        logs = ExternalAPILog.objects.filter(**filters)
        
        if not logs.exists():
            return Response({'error': 'No data available'}, status=404)
        
        from django.db.models import Avg, Min, Max
        
        performance = logs.aggregate(
            avg_time=Avg('response_time'),
            min_time=Min('response_time'),
            max_time=Max('response_time')
        )
        
        # Response time buckets
        fast = logs.filter(response_time__lt=500).count()
        medium = logs.filter(response_time__gte=500, response_time__lt=2000).count()
        slow = logs.filter(response_time__gte=2000).count()
        
        return Response({
            'api_name': api_name or 'All APIs',
            'total_calls': logs.count(),
            'average_response_time_ms': round(float(performance['avg_time']), 2),
            'min_response_time_ms': float(performance['min_time']),
            'max_response_time_ms': float(performance['max_time']),
            'response_time_distribution': {
                'fast_under_500ms': fast,
                'medium_500_2000ms': medium,
                'slow_over_2000ms': slow
            },
            'success_rate': round((logs.filter(is_success=True).count() / logs.count() * 100), 2)
        })