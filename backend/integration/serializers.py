from rest_framework import serializers
from .models import (
    AgriStackSync, LandRecord, SoilHealthData,
    ExternalAPILog, SatelliteImagery
)


class AgriStackSyncSerializer(serializers.ModelSerializer):
    """Agri-Stack Sync Status"""
    
    farmer_details = serializers.SerializerMethodField()
    
    class Meta:
        model = AgriStackSync
        fields = '__all__'
        read_only_fields = ['id', 'last_sync_at', 'created_at', 'updated_at']
    
    def get_farmer_details(self, obj):
        return {
            'farmer_id': obj.farmer.farmer_id,
            'name': obj.farmer.user.get_full_name()
        }


class LandRecordSerializer(serializers.ModelSerializer):
    """Land Ownership Records"""
    
    farmer_name = serializers.CharField(source='farmer.user.get_full_name', read_only=True)
    location = serializers.SerializerMethodField()
    
    class Meta:
        model = LandRecord
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_location(self, obj):
        return {
            'village': obj.village,
            'district': obj.district,
            'state': obj.state
        }


class SoilHealthDataSerializer(serializers.ModelSerializer):
    """Soil Health Card Data"""
    
    farmer_name = serializers.CharField(source='farmer.user.get_full_name', read_only=True)
    land_location = serializers.SerializerMethodField()
    nutrient_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = SoilHealthData
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_land_location(self, obj):
        if obj.land_record:
            return f"{obj.land_record.village}, {obj.land_record.district}"
        return None
    
    def get_nutrient_summary(self, obj):
        return {
            'ph_level': float(obj.ph_level),
            'organic_carbon': float(obj.organic_carbon),
            'npk': {
                'nitrogen': obj.nitrogen,
                'phosphorus': obj.phosphorus,
                'potassium': obj.potassium
            },
            'micronutrients': {
                'sulphur': obj.sulphur,
                'zinc': obj.zinc,
                'iron': obj.iron
            }
        }


class ExternalAPILogSerializer(serializers.ModelSerializer):
    """API Call Logs"""
    
    performance = serializers.SerializerMethodField()
    
    class Meta:
        model = ExternalAPILog
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_performance(self, obj):
        return {
            'response_time_ms': obj.response_time,
            'response_time_s': obj.response_time / 1000,
            'status': 'fast' if obj.response_time < 1000 else 'slow'
        }


class SatelliteImagerySerializer(serializers.ModelSerializer):
    """Satellite Imagery Analysis"""
    
    farmer_name = serializers.CharField(source='farmer.user.get_full_name', read_only=True)
    land_location = serializers.SerializerMethodField()
    health_analysis = serializers.SerializerMethodField()
    image_url_full = serializers.SerializerMethodField()
    
    class Meta:
        model = SatelliteImagery
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_land_location(self, obj):
        if obj.land_record:
            return f"{obj.land_record.village}, {obj.land_record.district}"
        return None
    
    def get_health_analysis(self, obj):
        return {
            'ndvi': float(obj.ndvi_value) if obj.ndvi_value else None,
            'ndwi': float(obj.ndwi_value) if obj.ndwi_value else None,
            'crop_health_score': float(obj.crop_health_score) if obj.crop_health_score else None,
            'status': self._get_health_status(obj.crop_health_score),
            'anomaly_detected': obj.anomaly_detected,
            'anomaly_type': obj.anomaly_type if obj.anomaly_detected else None
        }
    
    def _get_health_status(self, score):
        if not score:
            return 'unknown'
        score = float(score)
        if score >= 80:
            return 'excellent'
        elif score >= 60:
            return 'good'
        elif score >= 40:
            return 'moderate'
        else:
            return 'poor'
    
    def get_image_url_full(self, obj):
        if obj.image_url:
            return obj.image_url
        return None