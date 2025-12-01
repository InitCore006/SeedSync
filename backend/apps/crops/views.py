from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone

from .models import (
    Crop, CropInput, CropObservation,
    HarvestRecord, CropTransaction, CropPrediction
)
from .serializers import (
    CropCreateSerializer, CropUpdateSerializer, CropListSerializer, CropDetailSerializer,
    CropInputSerializer, CropObservationSerializer, HarvestRecordSerializer,
    CropTransactionSerializer, CropPredictionSerializer
)
from apps.crops.permissions import IsFarmer, IsFPOAdmin, IsProcessor, IsRetailer, IsAdmin


# ==================== CROP VIEWSET ====================
class CropViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Crop CRUD operations
    Farmers can manage their own crops
    FPO admins can manage crops of their FPO members
    Admins can manage all crops
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['crop_type', 'status', 'district', 'state', 'fpo']
    search_fields = ['crop_id', 'variety', 'farmer__full_name']
    ordering_fields = ['planting_date', 'created_at', 'planted_area']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'farmer':
            # Farmers see only their crops
            return Crop.objects.filter(farmer=user).select_related('farmer', 'fpo', 'added_by')
        
        elif user.role == 'fpo_admin':
            # FPO admins see crops of their FPO members
            if hasattr(user, 'fpo_profile') and user.fpo_profile.fpo:
                return Crop.objects.filter(fpo=user.fpo_profile.fpo).select_related('farmer', 'fpo', 'added_by')
            return Crop.objects.none()
        
        elif user.role in ['processor', 'retailer']:
            # Processors and retailers see crops they've transacted with
            return Crop.objects.filter(
                Q(transactions__to_user=user) | Q(transactions__from_user=user)
            ).distinct().select_related('farmer', 'fpo', 'added_by')
        
        elif user.role == 'admin':
            # Admins see all crops
            return Crop.objects.all().select_related('farmer', 'fpo', 'added_by')
        
        return Crop.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return CropCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CropUpdateSerializer
        elif self.action == 'list':
            return CropListSerializer
        return CropDetailSerializer

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'])
    def my_crops(self, request):
        """Get current user's crops"""
        if request.user.role != 'farmer':
            return Response(
                {'error': 'Only farmers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        crops = self.get_queryset()
        serializer = CropListSerializer(crops, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get crop statistics for the user"""
        queryset = self.get_queryset()
        
        stats = {
            'total_crops': queryset.count(),
            'total_area': queryset.aggregate(Sum('planted_area'))['planted_area__sum'] or 0,
            'by_status': {},
            'by_crop_type': {},
            'active_crops': queryset.filter(status__in=['planted', 'growing', 'flowering', 'matured']).count(),
            'harvested_crops': queryset.filter(status='harvested').count(),
        }
        
        # Group by status
        status_counts = queryset.values('status').annotate(count=Count('id'))
        for item in status_counts:
            stats['by_status'][item['status']] = item['count']
        
        # Group by crop type
        type_counts = queryset.values('crop_type').annotate(count=Count('id'))
        for item in type_counts:
            stats['by_crop_type'][item['crop_type']] = item['count']
        
        return Response(stats)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update crop status"""
        crop = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status transition
        serializer = CropUpdateSerializer(
            crop, 
            data={'status': new_status}, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(CropDetailSerializer(crop, context={'request': request}).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """Get crop lifecycle timeline"""
        crop = self.get_object()
        
        timeline = [
            {
                'event': 'Crop Planted',
                'date': crop.planting_date,
                'status': 'planted',
            }
        ]
        
        # Add observations
        for obs in crop.observations.all()[:5]:
            timeline.append({
                'event': 'Observation Recorded',
                'date': obs.observation_date,
                'notes': obs.notes,
            })
        
        # Add harvest
        if crop.actual_harvest_date:
            timeline.append({
                'event': 'Crop Harvested',
                'date': crop.actual_harvest_date,
                'yield': str(crop.actual_yield),
            })
        
        # Sort by date
        timeline.sort(key=lambda x: x['date'], reverse=True)
        
        return Response(timeline)


# ==================== CROP INPUT VIEWSET ====================
class CropInputViewSet(viewsets.ModelViewSet):
    """ViewSet for managing crop inputs"""
    serializer_class = CropInputSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['crop', 'input_type', 'application_date']
    ordering_fields = ['application_date', 'created_at']
    ordering = ['-application_date']

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'farmer':
            return CropInput.objects.filter(crop__farmer=user).select_related('crop', 'added_by')
        
        elif user.role == 'fpo_admin':
            if hasattr(user, 'fpo_profile') and user.fpo_profile.fpo:
                return CropInput.objects.filter(
                    crop__fpo=user.fpo_profile.fpo
                ).select_related('crop', 'added_by')
            return CropInput.objects.none()
        
        elif user.role == 'admin':
            return CropInput.objects.all().select_related('crop', 'added_by')
        
        return CropInput.objects.none()

    @action(detail=False, methods=['get'])
    def by_crop(self, request):
        """Get all inputs for a specific crop"""
        crop_id = request.query_params.get('crop_id')
        if not crop_id:
            return Response(
                {'error': 'crop_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        inputs = self.get_queryset().filter(crop_id=crop_id)
        serializer = self.get_serializer(inputs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def cost_summary(self, request):
        """Get cost summary of inputs"""
        crop_id = request.query_params.get('crop_id')
        queryset = self.get_queryset()
        
        if crop_id:
            queryset = queryset.filter(crop_id=crop_id)
        
        summary = queryset.values('input_type').annotate(
            total_cost=Sum('cost'),
            count=Count('id')
        )
        
        return Response(summary)


# ==================== CROP OBSERVATION VIEWSET ====================
class CropObservationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing crop observations"""
    serializer_class = CropObservationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['crop', 'observation_date', 'pest_infestation', 'disease_detected']
    ordering_fields = ['observation_date', 'created_at']
    ordering = ['-observation_date']

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'farmer':
            return CropObservation.objects.filter(crop__farmer=user).select_related('crop', 'recorded_by')
        
        elif user.role == 'fpo_admin':
            if hasattr(user, 'fpo_profile') and user.fpo_profile.fpo:
                return CropObservation.objects.filter(
                    crop__fpo=user.fpo_profile.fpo
                ).select_related('crop', 'recorded_by')
            return CropObservation.objects.none()
        
        elif user.role == 'admin':
            return CropObservation.objects.all().select_related('crop', 'recorded_by')
        
        return CropObservation.objects.none()

    @action(detail=False, methods=['get'])
    def by_crop(self, request):
        """Get all observations for a specific crop"""
        crop_id = request.query_params.get('crop_id')
        if not crop_id:
            return Response(
                {'error': 'crop_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        observations = self.get_queryset().filter(crop_id=crop_id)
        serializer = self.get_serializer(observations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def disease_alerts(self, request):
        """Get recent disease detections"""
        recent_days = int(request.query_params.get('days', 7))
        date_threshold = timezone.now().date() - timezone.timedelta(days=recent_days)
        
        alerts = self.get_queryset().filter(
            disease_detected=True,
            observation_date__gte=date_threshold
        )
        
        serializer = self.get_serializer(alerts, many=True)
        return Response(serializer.data)


# ==================== HARVEST RECORD VIEWSET ====================
class HarvestRecordViewSet(viewsets.ModelViewSet):
    """ViewSet for managing harvest records"""
    serializer_class = HarvestRecordSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['quality_grade', 'organic_certified', 'harvest_date']
    ordering_fields = ['harvest_date', 'total_yield', 'created_at']
    ordering = ['-harvest_date']

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'farmer':
            return HarvestRecord.objects.filter(crop__farmer=user).select_related('crop', 'harvested_by')
        
        elif user.role == 'fpo_admin':
            if hasattr(user, 'fpo_profile') and user.fpo_profile.fpo:
                return HarvestRecord.objects.filter(
                    crop__fpo=user.fpo_profile.fpo
                ).select_related('crop', 'harvested_by')
            return HarvestRecord.objects.none()
        
        elif user.role in ['processor', 'retailer']:
            return HarvestRecord.objects.filter(
                Q(crop__transactions__to_user=user) | Q(crop__transactions__from_user=user)
            ).distinct().select_related('crop', 'harvested_by')
        
        elif user.role == 'admin':
            return HarvestRecord.objects.all().select_related('crop', 'harvested_by')
        
        return HarvestRecord.objects.none()

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get harvest statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_harvests': queryset.count(),
            'total_yield': queryset.aggregate(Sum('total_yield'))['total_yield__sum'] or 0,
            'avg_yield': queryset.aggregate(Avg('total_yield'))['total_yield__avg'] or 0,
            'total_revenue': queryset.aggregate(Sum('total_revenue'))['total_revenue__sum'] or 0,
            'by_grade': {},
            'organic_count': queryset.filter(organic_certified=True).count(),
        }
        
        # Group by quality grade
        grade_counts = queryset.values('quality_grade').annotate(count=Count('id'))
        for item in grade_counts:
            stats['by_grade'][item['quality_grade']] = item['count']
        
        return Response(stats)


# ==================== CROP TRANSACTION VIEWSET ====================
class CropTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing crop transactions"""
    serializer_class = CropTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'payment_status', 'is_verified']
    ordering_fields = ['transaction_date', 'total_amount']
    ordering = ['-transaction_date']

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'farmer':
            return CropTransaction.objects.filter(
                Q(from_user=user) | Q(to_user=user) | Q(crop__farmer=user)
            ).select_related('crop', 'from_user', 'to_user')
        
        elif user.role in ['fpo_admin', 'processor', 'retailer']:
            return CropTransaction.objects.filter(
                Q(from_user=user) | Q(to_user=user)
            ).select_related('crop', 'from_user', 'to_user')
        
        elif user.role == 'admin':
            return CropTransaction.objects.all().select_related('crop', 'from_user', 'to_user')
        
        return CropTransaction.objects.none()

    @action(detail=False, methods=['get'])
    def my_transactions(self, request):
        """Get current user's transactions"""
        transactions = self.get_queryset().filter(
            Q(from_user=request.user) | Q(to_user=request.user)
        )
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_crop(self, request):
        """Get all transactions for a specific crop"""
        crop_id = request.query_params.get('crop_id')
        if not crop_id:
            return Response(
                {'error': 'crop_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transactions = self.get_queryset().filter(crop_id=crop_id)
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a transaction (admin/FPO only)"""
        if request.user.role not in ['admin', 'fpo_admin']:
            return Response(
                {'error': 'Only admins and FPO admins can verify transactions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transaction = self.get_object()
        transaction.is_verified = True
        transaction.save()
        
        serializer = self.get_serializer(transaction)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_payment_status(self, request, pk=None):
        """Update payment status"""
        transaction = self.get_object()
        new_status = request.data.get('payment_status')
        
        if new_status not in ['pending', 'completed', 'failed']:
            return Response(
                {'error': 'Invalid payment status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transaction.payment_status = new_status
        transaction.save()
        
        serializer = self.get_serializer(transaction)
        return Response(serializer.data)


# ==================== CROP PREDICTION VIEWSET ====================
class CropPredictionViewSet(viewsets.ModelViewSet):
    """ViewSet for AI predictions"""
    serializer_class = CropPredictionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['prediction_type', 'crop']
    ordering_fields = ['prediction_date', 'confidence_score']
    ordering = ['-prediction_date']

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'farmer':
            return CropPrediction.objects.filter(crop__farmer=user).select_related('crop')
        
        elif user.role == 'fpo_admin':
            if hasattr(user, 'fpo_profile') and user.fpo_profile.fpo:
                return CropPrediction.objects.filter(
                    crop__fpo=user.fpo_profile.fpo
                ).select_related('crop')
            return CropPrediction.objects.none()
        
        elif user.role == 'admin':
            return CropPrediction.objects.all().select_related('crop')
        
        return CropPrediction.objects.none()

    @action(detail=False, methods=['get'])
    def by_crop(self, request):
        """Get all predictions for a specific crop"""
        crop_id = request.query_params.get('crop_id')
        if not crop_id:
            return Response(
                {'error': 'crop_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        predictions = self.get_queryset().filter(crop_id=crop_id)
        serializer = self.get_serializer(predictions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def latest_predictions(self, request):
        """Get latest predictions by type"""
        crop_id = request.query_params.get('crop_id')
        if not crop_id:
            return Response(
                {'error': 'crop_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        predictions = {}
        for pred_type, _ in CropPrediction.PREDICTION_TYPES:
            latest = self.get_queryset().filter(
                crop_id=crop_id,
                prediction_type=pred_type
            ).first()
            
            if latest:
                predictions[pred_type] = self.get_serializer(latest).data
        
        return Response(predictions)