"""Processors Serializers"""
from rest_framework import serializers
from .models import ProcessorProfile, ProcessingPlant, ProcessingBatch, ProcessingStageLog, FinishedProduct, ProcessedProduct

class ProcessingPlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessingPlant
        fields = '__all__'
        read_only_fields = ['processor']

class ProcessorProfileSerializer(serializers.ModelSerializer):
    plants = ProcessingPlantSerializer(many=True, read_only=True)
    
    # Make lat/long optional for create
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    
    class Meta:
        model = ProcessorProfile
        fields = '__all__'
        read_only_fields = ['user', 'is_verified']

class ProcessingStageLogSerializer(serializers.ModelSerializer):
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    yield_percentage = serializers.FloatField(read_only=True)
    loss_percentage = serializers.FloatField(read_only=True)
    operator_name = serializers.CharField(source='operator.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = ProcessingStageLog
        fields = '__all__'

class FinishedProductSerializer(serializers.ModelSerializer):
    product_type_display = serializers.CharField(source='get_product_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    
    class Meta:
        model = FinishedProduct
        fields = '__all__'

class ProcessingBatchSerializer(serializers.ModelSerializer):
    stage_logs = ProcessingStageLogSerializer(many=True, read_only=True)
    finished_products = FinishedProductSerializer(many=True, read_only=True)
    current_stage_display = serializers.CharField(source='get_current_stage_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    processing_method_display = serializers.CharField(source='get_processing_method_display', read_only=True)
    oil_yield_percentage = serializers.FloatField(read_only=True)
    cake_yield_percentage = serializers.FloatField(read_only=True)
    total_waste_percentage = serializers.FloatField(read_only=True)
    plant_name = serializers.CharField(source='plant.plant_name', read_only=True)
    crop_type = serializers.CharField(source='lot.crop_type', read_only=True)
    
    class Meta:
        model = ProcessingBatch
        fields = '__all__'
        read_only_fields = ['batch_number', 'current_stage', 'status', 'start_date', 'completion_date']
    
    def create(self, validated_data):
        """Auto-generate batch number if not provided"""
        if 'batch_number' not in validated_data or not validated_data['batch_number']:
            # Generate batch number: BATCH-YYYYMMDD-XXX
            from django.utils import timezone
            from django.db.models import Max
            
            today = timezone.now().strftime('%Y%m%d')
            prefix = f'BATCH-{today}'
            
            # Get last batch number for today
            last_batch = ProcessingBatch.objects.filter(
                batch_number__startswith=prefix
            ).aggregate(Max('batch_number'))
            
            if last_batch['batch_number__max']:
                last_num = int(last_batch['batch_number__max'].split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            validated_data['batch_number'] = f'{prefix}-{new_num:03d}'
        
        return super().create(validated_data)


class ProcessingBatchCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for batch creation"""
    batch_number = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = ProcessingBatch
        fields = ['plant', 'lot', 'batch_number', 'initial_quantity_quintals', 'processing_method', 'expected_completion_date', 'notes']
    
    def create(self, validated_data):
        """Auto-generate batch number if not provided"""
        if 'batch_number' not in validated_data or not validated_data.get('batch_number'):
            # Generate batch number: BATCH-YYYYMMDD-XXX
            from django.utils import timezone
            from django.db.models import Max
            
            today = timezone.now().strftime('%Y%m%d')
            prefix = f'BATCH-{today}'
            
            # Get last batch number for today
            last_batch = ProcessingBatch.objects.filter(
                batch_number__startswith=prefix
            ).aggregate(Max('batch_number'))
            
            if last_batch['batch_number__max']:
                last_num = int(last_batch['batch_number__max'].split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            validated_data['batch_number'] = f'{prefix}-{new_num:03d}'
        
        return ProcessingBatch.objects.create(**validated_data)


class ProcessedProductSerializer(serializers.ModelSerializer):
    """Serializer for processed oil products (in liters)"""
    product_type_display = serializers.CharField(source='get_product_type_display', read_only=True)
    processing_type_display = serializers.CharField(source='get_processing_type_display', read_only=True)
    quality_grade_display = serializers.CharField(source='get_quality_grade_display', read_only=True)
    packaging_type_display = serializers.CharField(source='get_packaging_type_display', read_only=True)
    
    processor_name = serializers.CharField(source='processor.company_name', read_only=True)
    processor_city = serializers.CharField(source='processor.city', read_only=True)
    processor_state = serializers.CharField(source='processor.state', read_only=True)
    
    is_expired = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    stock_status = serializers.CharField(read_only=True)
    
    class Meta:
        model = ProcessedProduct
        fields = '__all__'
        read_only_fields = ['processor', 'available_quantity_liters', 'reserved_quantity_liters']


class ProcessedProductCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating processed products"""
    
    class Meta:
        model = ProcessedProduct
        fields = [
            'batch', 'product_type', 'processing_type', 'batch_number', 'sku',
            'quantity_liters', 'min_order_quantity_liters', 'quality_grade',
            'fssai_license', 'packaging_type', 'packaging_date',
            'manufacturing_date', 'expiry_date', 'cost_price_per_liter',
            'selling_price_per_liter', 'is_available_for_sale', 'is_featured',
            'storage_location', 'storage_temperature', 'description', 'nutritional_info'
        ]
    
    def validate(self, data):
        """Validate product data"""
        # Check expiry date is after manufacturing date
        if data.get('expiry_date') and data.get('manufacturing_date'):
            if data['expiry_date'] <= data['manufacturing_date']:
                raise serializers.ValidationError({
                    'expiry_date': 'Expiry date must be after manufacturing date'
                })
        
        # Check selling price is greater than cost price
        if data.get('selling_price_per_liter') and data.get('cost_price_per_liter'):
            if data['selling_price_per_liter'] <= data['cost_price_per_liter']:
                raise serializers.ValidationError({
                    'selling_price_per_liter': 'Selling price must be greater than cost price'
                })
        
        # Check SKU is unique
        sku = data.get('sku')
        if sku:
            if ProcessedProduct.objects.filter(sku=sku).exists():
                raise serializers.ValidationError({
                    'sku': 'SKU must be unique'
                })
        
        return data
    
    def create(self, validated_data):
        """Create product with processor from request"""
        validated_data['processor'] = self.context['request'].user.processor_profile
        return super().create(validated_data)


class ProcessedProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listings"""
    product_type_display = serializers.CharField(source='get_product_type_display', read_only=True)
    processing_type_display = serializers.CharField(source='get_processing_type_display', read_only=True)
    quality_grade_display = serializers.CharField(source='get_quality_grade_display', read_only=True)
    processor_name = serializers.CharField(source='processor.company_name', read_only=True)
    processor_id = serializers.CharField(source='processor.id', read_only=True)
    stock_status = serializers.CharField(read_only=True)
    
    class Meta:
        model = ProcessedProduct
        fields = [
            'id', 'product_type', 'product_type_display', 'processing_type',
            'processing_type_display', 'quality_grade', 'quality_grade_display',
            'sku', 'batch_number', 'quantity_liters', 'available_quantity_liters',
            'min_order_quantity_liters', 'selling_price_per_liter', 'packaging_type',
            'manufacturing_date', 'expiry_date', 'is_available_for_sale',
            'processor_name', 'processor_id', 'stock_status', 'created_at'
        ]


class BidSuggestionSerializer(serializers.Serializer):
    """Serializer for bid suggestion response"""
    
    # Recommendation
    should_bid = serializers.BooleanField(help_text="Whether processor should place a bid")
    confidence_score = serializers.IntegerField(help_text="Confidence score 0-100")
    recommendation_reason = serializers.CharField(help_text="Explanation of recommendation")
    
    # Lot details
    lot_id = serializers.UUIDField()
    lot_crop_type = serializers.CharField()
    lot_quantity_quintals = serializers.DecimalField(max_digits=10, decimal_places=2)
    lot_expected_price_per_quintal = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    # Distance & logistics
    distance_km = serializers.FloatField(help_text="Road distance in kilometers")
    travel_duration_minutes = serializers.FloatField(help_text="Estimated travel time")
    distance_calculation_method = serializers.CharField(help_text="osrm or estimated")
    
    # Vehicle selection
    recommended_vehicle_type = serializers.CharField(help_text="Optimal vehicle for this load")
    vehicle_capacity_tons = serializers.FloatField(help_text="Vehicle capacity")
    
    # Cost breakdown
    logistics_cost_breakdown = serializers.DictField(help_text="Detailed logistics costs")
    total_logistics_cost = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    # Financial analysis
    lot_total_price = serializers.DecimalField(max_digits=15, decimal_places=2, help_text="Total cost to procure lot")
    total_cost_with_logistics = serializers.DecimalField(max_digits=15, decimal_places=2)
    expected_processing_revenue = serializers.DecimalField(max_digits=15, decimal_places=2, help_text="Estimated revenue after processing")
    expected_net_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    roi_percentage = serializers.DecimalField(max_digits=6, decimal_places=2, help_text="Return on investment")
    
    # Bid recommendations
    suggested_bid_min = serializers.DecimalField(max_digits=10, decimal_places=2, help_text="Minimum suggested bid per quintal")
    suggested_bid_max = serializers.DecimalField(max_digits=10, decimal_places=2, help_text="Maximum suggested bid per quintal")
    
    # Warnings
    warnings = serializers.ListField(child=serializers.CharField(), required=False)

