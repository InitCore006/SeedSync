"""
Serializers for Crops App
"""
from rest_framework import serializers
from .models import CropMaster, CropVariety, MandiPrice, MSPRecord, CropVarietyRequest


class CropMasterSerializer(serializers.ModelSerializer):
    crop_name_display = serializers.CharField(source='get_crop_name_display', read_only=True)
    
    class Meta:
        model = CropMaster
        fields = '__all__'


class CropVarietySerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source='crop.get_crop_name_display', read_only=True)
    season_display = serializers.CharField(source='get_season_display', read_only=True)
    
    class Meta:
        model = CropVariety
        fields = '__all__'


class MandiPriceSerializer(serializers.ModelSerializer):
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    state_display = serializers.CharField(source='get_state_display', read_only=True)
    
    class Meta:
        model = MandiPrice
        fields = '__all__'


class MSPRecordSerializer(serializers.ModelSerializer):
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    season_display = serializers.CharField(source='get_season_display', read_only=True)
    total_msp = serializers.SerializerMethodField()
    
    class Meta:
        model = MSPRecord
        fields = '__all__'
    
    def get_total_msp(self, obj):
        return float(obj.get_total_msp())


class CropVarietyRequestSerializer(serializers.ModelSerializer):
    """Serializer for crop variety requests"""
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requester_name = serializers.SerializerMethodField()
    requester_type = serializers.SerializerMethodField()
    
    class Meta:
        model = CropVarietyRequest
        fields = '__all__'
        read_only_fields = ['status', 'admin_notes', 'reviewed_by', 'reviewed_at', 'created_variety']
    
    def get_requester_name(self, obj):
        if obj.farmer:
            return obj.farmer.full_name
        elif obj.fpo:
            return obj.fpo.organization_name
        return None
    
    def get_requester_type(self, obj):
        if obj.farmer:
            return 'farmer'
        elif obj.fpo:
            return 'fpo'
        return None
