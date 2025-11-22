from rest_framework import serializers
from .models import Batch, SupplyChainEvent, QualityTest, ProductTrace
from advisory.serializers import CropCycleSerializer


class BatchSerializer(serializers.ModelSerializer):
    """Batch/Lot Traceability"""
    
    crop_cycle_details = serializers.SerializerMethodField()
    farmer_details = serializers.SerializerMethodField()
    quality_info = serializers.SerializerMethodField()
    blockchain_status = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Batch
        fields = '__all__'
        read_only_fields = [
            'id', 'batch_id', 'blockchain_hash', 
            'blockchain_timestamp', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        # Auto-generate batch_id
        import uuid
        from datetime import datetime
        crop_code = validated_data['crop_cycle'].crop_type.name[:3].upper()
        validated_data['batch_id'] = f"BT-{crop_code}-{datetime.now().strftime('%y%m')}-{uuid.uuid4().hex[:6].upper()}"
        return super().create(validated_data)
    
    def get_crop_cycle_details(self, obj):
        return {
            'cycle_id': obj.crop_cycle.cycle_id,
            'crop_type': obj.crop_cycle.crop_type.name,
            'area': float(obj.crop_cycle.area_planted)
        }
    
    def get_farmer_details(self, obj):
        return {
            'farmer_id': obj.farmer.farmer_id,
            'name': obj.farmer.user.get_full_name(),
            'location': f"{obj.farmer.village}, {obj.farmer.district}, {obj.farmer.state}"
        }
    
    def get_quality_info(self, obj):
        return {
            'grade': obj.quality_grade,
            'moisture_content': float(obj.moisture_content),
            'oil_content': float(obj.oil_content),
            'is_organic': obj.is_organic
        }
    
    def get_blockchain_status(self, obj):
        return {
            'registered': bool(obj.blockchain_hash),
            'hash': obj.blockchain_hash[:16] + '...' if obj.blockchain_hash else None,
            'timestamp': obj.blockchain_timestamp
        }
    
    def get_qr_code_url(self, obj):
        if obj.qr_code:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_code.url)
        return None


class SupplyChainEventSerializer(serializers.ModelSerializer):
    """Supply Chain Event Tracking"""
    
    batch_id = serializers.CharField(source='batch.batch_id', read_only=True)
    actor_details = serializers.SerializerMethodField()
    location_coords = serializers.SerializerMethodField()
    
    class Meta:
        model = SupplyChainEvent
        fields = '__all__'
        read_only_fields = ['id', 'timestamp', 'blockchain_hash', 'created_at', 'updated_at']
    
    def get_actor_details(self, obj):
        if obj.actor_farmer:
            return {
                'type': 'farmer',
                'id': obj.actor_farmer.farmer_id,
                'name': obj.actor_farmer.user.get_full_name()
            }
        elif obj.actor_fpo:
            return {
                'type': 'fpo',
                'id': str(obj.actor_fpo.id),
                'name': obj.actor_fpo.fpo_name
            }
        elif obj.actor_processor:
            return {
                'type': 'processor',
                'id': str(obj.actor_processor.id),
                'name': obj.actor_processor.company_name
            }
        elif obj.actor_retailer:
            return {
                'type': 'retailer',
                'id': str(obj.actor_retailer.id),
                'name': obj.actor_retailer.business_name
            }
        return None
    
    def get_location_coords(self, obj):
        if obj.latitude and obj.longitude:
            return {
                'lat': float(obj.latitude),
                'lng': float(obj.longitude)
            }
        return None


class QualityTestSerializer(serializers.ModelSerializer):
    """Quality Test Records"""
    
    batch_id = serializers.CharField(source='batch.batch_id', read_only=True)
    parameters = serializers.SerializerMethodField()
    certificate_url_full = serializers.SerializerMethodField()
    
    class Meta:
        model = QualityTest
        fields = '__all__'
        read_only_fields = ['id', 'test_date', 'created_at', 'updated_at']
    
    def get_parameters(self, obj):
        return {
            'moisture_content': float(obj.moisture_content),
            'oil_content': float(obj.oil_content),
            'foreign_matter': float(obj.foreign_matter),
            'damaged_seeds': float(obj.damaged_seeds)
        }
    
    def get_certificate_url_full(self, obj):
        if obj.certificate_url:
            return obj.certificate_url
        return None


class ProductTraceSerializer(serializers.ModelSerializer):
    """Final Product Traceability"""
    
    source_batch_details = serializers.SerializerMethodField()
    processor_details = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()
    traceability_chain = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductTrace
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_source_batch_details(self, obj):
        return [
            {
                'batch_id': batch.batch_id,
                'quantity': float(batch.quantity),
                'farmer': batch.farmer.user.get_full_name(),
                'harvest_date': batch.harvest_date
            }
            for batch in obj.source_batches.all()
        ]
    
    def get_processor_details(self, obj):
        return {
            'company_name': obj.processor.company_name,
            'location': f"{obj.processor.district}, {obj.processor.state}",
            'fssai_license': obj.processor.fssai_license
        }
    
    def get_qr_code_url(self, obj):
        if obj.consumer_qr_code:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.consumer_qr_code.url)
        return None
    
    def get_traceability_chain(self, obj):
        """Complete farm-to-fork trace"""
        chain = []
        for batch in obj.source_batches.all():
            events = batch.events.order_by('timestamp').values(
                'event_type', 'timestamp', 'location'
            )
            chain.append({
                'batch_id': batch.batch_id,
                'events': list(events)
            })
        return chain


class BatchTraceabilitySerializer(serializers.ModelSerializer):
    """Complete batch traceability with all events"""
    
    events = SupplyChainEventSerializer(many=True, read_only=True)
    quality_tests = QualityTestSerializer(many=True, read_only=True)
    products = serializers.SerializerMethodField()
    
    class Meta:
        model = Batch
        fields = '__all__'
    
    def get_products(self, obj):
        products = obj.products.all()
        return ProductTraceSerializer(products, many=True, context=self.context).data