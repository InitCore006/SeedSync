"""Processors Serializers"""
from rest_framework import serializers
from .models import ProcessorProfile, ProcessingPlant, ProcessingBatch, ProcessingStageLog, FinishedProduct

class ProcessingPlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessingPlant
        fields = '__all__'
        read_only_fields = ['processor']

class ProcessorProfileSerializer(serializers.ModelSerializer):
    plants = ProcessingPlantSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProcessorProfile
        fields = '__all__'

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
