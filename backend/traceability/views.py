from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone

from .models import Batch, SupplyChainEvent, QualityTest, ProductTrace
from .serializers import (
    BatchSerializer, SupplyChainEventSerializer,
    QualityTestSerializer, ProductTraceSerializer,
    BatchTraceabilitySerializer
)


class BatchViewSet(viewsets.ModelViewSet):
    """
    Batch/Lot Management
    
    Custom Actions:
    - my_batches: Get current farmer's batches
    - register_blockchain: Register batch on blockchain
    - generate_qr: Generate QR code for batch
    - track: Get complete traceability chain
    """
    
    queryset = Batch.objects.select_related(
        'crop_cycle__crop_type', 'farmer__user'
    ).all()
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['quality_grade', 'is_organic', 'farmer', 'crop_cycle']
    search_fields = ['batch_id', 'farmer__farmer_id']
    ordering_fields = ['harvest_date', 'quantity', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'FARMER':
            return Batch.objects.filter(farmer__user=user)
        return Batch.objects.all()
    
    def perform_create(self, serializer):
        """Auto-assign farmer from crop cycle"""
        crop_cycle = serializer.validated_data['crop_cycle']
        serializer.save(farmer=crop_cycle.farmer)
    
    @action(detail=False, methods=['get'])
    def my_batches(self, request):
        """Get current farmer's batches"""
        if request.user.role != 'FARMER':
            return Response({'error': 'Only farmers can access this endpoint'}, status=403)
        
        batches = self.get_queryset()
        serializer = self.get_serializer(batches, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def register_blockchain(self, request, pk=None):
        """Register batch on blockchain"""
        batch = self.get_object()
        
        if batch.blockchain_hash:
            return Response({'error': 'Batch already registered on blockchain'}, status=400)
        
        # Placeholder for blockchain integration
        # In production, this would:
        # 1. Create transaction on blockchain
        # 2. Store transaction hash
        # 3. Record timestamp
        
        import hashlib
        import json
        
        batch_data = {
            'batch_id': batch.batch_id,
            'farmer_id': batch.farmer.farmer_id,
            'crop_type': batch.crop_cycle.crop_type.name,
            'quantity': float(batch.quantity),
            'harvest_date': str(batch.harvest_date),
            'quality_grade': batch.quality_grade
        }
        
        # Simulate blockchain hash
        hash_input = json.dumps(batch_data, sort_keys=True).encode()
        blockchain_hash = hashlib.sha256(hash_input).hexdigest()
        
        batch.blockchain_hash = blockchain_hash
        batch.blockchain_timestamp = timezone.now()
        batch.save()
        
        return Response({
            'message': 'Batch registered on blockchain',
            'blockchain_hash': blockchain_hash,
            'timestamp': batch.blockchain_timestamp
        })
    
    @action(detail=True, methods=['post'])
    def generate_qr(self, request, pk=None):
        """Generate QR code for batch"""
        batch = self.get_object()
        
        # Placeholder for QR code generation
        # In production, use library like qrcode or python-qrcode
        
        import qrcode
        from io import BytesIO
        from django.core.files import File
        
        # QR data
        qr_data = f"https://seedsync.app/trace/{batch.batch_id}"
        
        # Generate QR
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to file
        blob = BytesIO()
        img.save(blob, 'PNG')
        
        batch.qr_code.save(
            f'batch_qr_{batch.batch_id}.png',
            File(blob),
            save=True
        )
        
        return Response({
            'message': 'QR code generated',
            'qr_code_url': request.build_absolute_uri(batch.qr_code.url)
        })
    
    @action(detail=True, methods=['get'])
    def track(self, request, pk=None):
        """Get complete traceability chain"""
        batch = self.get_object()
        serializer = BatchTraceabilitySerializer(batch, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def scan_qr(self, request):
        """Get batch details by scanning QR (public endpoint)"""
        batch_id = request.query_params.get('batch_id')
        
        if not batch_id:
            return Response({'error': 'batch_id parameter required'}, status=400)
        
        try:
            batch = Batch.objects.get(batch_id=batch_id)
            serializer = BatchTraceabilitySerializer(batch, context={'request': request})
            return Response(serializer.data)
        except Batch.DoesNotExist:
            return Response({'error': 'Batch not found'}, status=404)


class SupplyChainEventViewSet(viewsets.ModelViewSet):
    """
    Supply Chain Event Tracking
    
    Custom Actions:
    - batch_events: Get all events for a batch
    - recent_events: Get recent events
    - register_event: Register new supply chain event
    """
    
    queryset = SupplyChainEvent.objects.select_related('batch').all()
    serializer_class = SupplyChainEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['batch', 'event_type']
    ordering_fields = ['timestamp', 'created_at']
    ordering = ['-timestamp']
    
    @action(detail=False, methods=['get'])
    def batch_events(self, request):
        """Get all events for a specific batch"""
        batch_id = request.query_params.get('batch_id')
        
        if not batch_id:
            return Response({'error': 'batch_id parameter required'}, status=400)
        
        events = SupplyChainEvent.objects.filter(
            batch__batch_id=batch_id
        ).order_by('timestamp')
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent_events(self, request):
        """Get recent supply chain events"""
        limit = int(request.query_params.get('limit', 20))
        events = SupplyChainEvent.objects.all()[:limit]
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def register_event(self, request):
        """Register new supply chain event with blockchain"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Auto-assign actor based on user role
        user = request.user
        event_data = serializer.validated_data
        
        if user.role == 'FARMER':
            event_data['actor_farmer'] = user.farmer_profile
        elif user.role == 'FPO':
            event_data['actor_fpo'] = user.fpo_profile
        elif user.role == 'PROCESSOR':
            event_data['actor_processor'] = user.processor_profile
        elif user.role == 'RETAILER':
            event_data['actor_retailer'] = user.retailer_profile
        
        # Create event
        event = SupplyChainEvent.objects.create(**event_data)
        
        # Simulate blockchain registration
        import hashlib
        import json
        
        event_hash_data = {
            'batch_id': event.batch.batch_id,
            'event_type': event.event_type,
            'timestamp': str(event.timestamp),
            'location': event.location
        }
        
        hash_input = json.dumps(event_hash_data, sort_keys=True).encode()
        event.blockchain_hash = hashlib.sha256(hash_input).hexdigest()
        event.save()
        
        return Response(
            self.get_serializer(event).data,
            status=status.HTTP_201_CREATED
        )


class QualityTestViewSet(viewsets.ModelViewSet):
    """
    Quality Test Records
    
    Custom Actions:
    - batch_tests: Get all tests for a batch
    - recent_tests: Get recent quality tests
    """
    
    queryset = QualityTest.objects.select_related('batch').all()
    serializer_class = QualityTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['batch', 'final_grade', 'is_passed']
    ordering_fields = ['test_date', 'created_at']
    ordering = ['-test_date']
    
    @action(detail=False, methods=['get'])
    def batch_tests(self, request):
        """Get all quality tests for a batch"""
        batch_id = request.query_params.get('batch_id')
        
        if not batch_id:
            return Response({'error': 'batch_id parameter required'}, status=400)
        
        tests = QualityTest.objects.filter(batch__batch_id=batch_id)
        serializer = self.get_serializer(tests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent_tests(self, request):
        """Get recent quality tests"""
        limit = int(request.query_params.get('limit', 20))
        tests = QualityTest.objects.all()[:limit]
        
        serializer = self.get_serializer(tests, many=True)
        return Response(serializer.data)


class ProductTraceViewSet(viewsets.ModelViewSet):
    """
    Final Product Traceability
    
    Custom Actions:
    - consumer_trace: Get consumer-facing trace info
    - generate_consumer_qr: Generate consumer QR code
    """
    
    queryset = ProductTrace.objects.prefetch_related('source_batches').all()
    serializer_class = ProductTraceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['processor', 'is_organic_certified']
    search_fields = ['product_id', 'product_name', 'brand_name']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'PROCESSOR':
            return ProductTrace.objects.filter(processor__user=user)
        return ProductTrace.objects.all()
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'PROCESSOR':
            serializer.save(processor=user.processor_profile)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def consumer_trace(self, request, pk=None):
        """Get consumer-facing traceability info (public)"""
        product = self.get_object()
        serializer = self.get_serializer(product)
        
        # Simplified data for consumers
        consumer_data = {
            'product_name': product.product_name,
            'brand_name': product.brand_name,
            'processor': product.processor.company_name,
            'certifications': {
                'fssai': product.fssai_license_number,
                'organic': product.is_organic_certified
            },
            'manufacturing_date': product.packaging_date,
            'expiry_date': product.expiry_date,
            'source_farms': [
                {
                    'farmer': batch.farmer.user.get_full_name(),
                    'location': f"{batch.farmer.village}, {batch.farmer.district}",
                    'harvest_date': batch.harvest_date,
                    'quality_grade': batch.quality_grade
                }
                for batch in product.source_batches.all()
            ]
        }
        
        return Response(consumer_data)
    
    @action(detail=True, methods=['post'])
    def generate_consumer_qr(self, request, pk=None):
        """Generate consumer-facing QR code"""
        product = self.get_object()
        
        import qrcode
        from io import BytesIO
        from django.core.files import File
        
        qr_data = f"https://seedsync.app/product/{product.product_id}"
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        blob = BytesIO()
        img.save(blob, 'PNG')
        
        product.consumer_qr_code.save(
            f'product_qr_{product.product_id}.png',
            File(blob),
            save=True
        )
        
        return Response({
            'message': 'Consumer QR code generated',
            'qr_code_url': request.build_absolute_uri(product.consumer_qr_code.url)
        })