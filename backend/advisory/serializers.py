from rest_framework import serializers
from .models import (
    CropType, CropCycle, WeatherAlert,
    PestDiseaseDetection, CropAdvisory
)
from users.serializers import FarmerProfileListSerializer


class CropTypeSerializer(serializers.ModelSerializer):
    """Crop Type Master Data"""
    
    temperature_range = serializers.SerializerMethodField()
    
    class Meta:
        model = CropType
        fields = '__all__'
    
    def get_temperature_range(self, obj):
        return {
            'min': float(obj.ideal_temperature_min),
            'max': float(obj.ideal_temperature_max)
        }


class CropCycleSerializer(serializers.ModelSerializer):
    """Crop Cycle Management"""
    
    farmer_details = FarmerProfileListSerializer(source='farmer', read_only=True)
    crop_type_details = CropTypeSerializer(source='crop_type', read_only=True)
    days_since_sowing = serializers.SerializerMethodField()
    yield_accuracy = serializers.SerializerMethodField()
    
    class Meta:
        model = CropCycle
        fields = '__all__'
        read_only_fields = ['id', 'cycle_id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Auto-generate cycle_id
        import uuid
        from datetime import datetime
        validated_data['cycle_id'] = f"CC-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
        return super().create(validated_data)
    
    def get_days_since_sowing(self, obj):
        if obj.sowing_date:
            from django.utils import timezone
            delta = timezone.now().date() - obj.sowing_date
            return delta.days
        return None
    
    def get_yield_accuracy(self, obj):
        if obj.predicted_yield and obj.actual_yield:
            accuracy = (min(float(obj.actual_yield), float(obj.predicted_yield)) / 
                       max(float(obj.actual_yield), float(obj.predicted_yield))) * 100
            return round(accuracy, 2)
        return None


class CropCycleListSerializer(serializers.ModelSerializer):
    """Lightweight for list views"""
    
    farmer_name = serializers.CharField(source='farmer.user.get_full_name', read_only=True)
    crop_name = serializers.CharField(source='crop_type.name', read_only=True)
    
    class Meta:
        model = CropCycle
        fields = [
            'id', 'cycle_id', 'farmer_name', 'crop_name',
            'area_planted', 'status', 'sowing_date',
            'predicted_yield', 'actual_yield'
        ]


class WeatherAlertSerializer(serializers.ModelSerializer):
    """Weather Alerts"""
    
    farmer_details = FarmerProfileListSerializer(source='farmer', read_only=True)
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = WeatherAlert
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_active(self, obj):
        from django.utils import timezone
        return obj.valid_from <= timezone.now() <= obj.valid_till


class PestDiseaseDetectionSerializer(serializers.ModelSerializer):
    """Pest/Disease Detection with Image Upload"""
    
    crop_cycle_details = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PestDiseaseDetection
        fields = '__all__'
        read_only_fields = [
            'id', 'detected_pest', 'confidence_score',
            'treatment_recommendation', 'severity_level',
            'created_at', 'updated_at'
        ]
    
    def get_crop_cycle_details(self, obj):
        return {
            'cycle_id': obj.crop_cycle.cycle_id,
            'crop_type': obj.crop_cycle.crop_type.name,
            'farmer': obj.crop_cycle.farmer.user.get_full_name()
        }
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None


class CropAdvisorySerializer(serializers.ModelSerializer):
    """Crop Advisories"""
    
    farmer_details = FarmerProfileListSerializer(source='farmer', read_only=True)
    crop_cycle_id = serializers.CharField(source='crop_cycle.cycle_id', read_only=True, allow_null=True)
    
    class Meta:
        model = CropAdvisory
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class CropAdvisoryListSerializer(serializers.ModelSerializer):
    """Lightweight advisory list"""
    
    class Meta:
        model = CropAdvisory
        fields = [
            'id', 'advisory_type', 'title', 'message',
            'ai_confidence', 'is_read', 'created_at'
        ]