"""
Serializers for Farmers App
"""
from rest_framework import serializers
from .models import FarmerProfile, FarmLand, CropPlanning
from apps.users.serializers import UserSerializer


class FarmerProfileSerializer(serializers.ModelSerializer):
    """Serializer for farmer profile"""
    user = UserSerializer(read_only=True)
    fpo_name = serializers.CharField(source='get_fpo_name', read_only=True)
    state_display = serializers.CharField(source='get_state_display', read_only=True)
    kyc_status_display = serializers.CharField(source='get_kyc_status_display', read_only=True)
    
    class Meta:
        model = FarmerProfile
        fields = '__all__'
        read_only_fields = [
            'id', 'user', 'total_lots_created', 'total_quantity_sold_quintals',
            'total_earnings', 'kyc_status', 'created_at', 'updated_at'
        ]


class FarmerProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating farmer profile"""
    
    class Meta:
        model = FarmerProfile
        exclude = ['user', 'total_lots_created', 'total_quantity_sold_quintals', 'total_earnings']


class FarmerProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating farmer profile"""
    
    class Meta:
        model = FarmerProfile
        fields = [
            'full_name', 'father_name', 'date_of_birth', 'gender', 'profile_photo',
            'total_land_acres', 'farming_experience_years', 'primary_crops',
            'bank_account_number', 'bank_account_holder_name', 'ifsc_code',
            'bank_name', 'bank_branch', 'village', 'post_office', 'tehsil',
            'district', 'state', 'pincode', 'latitude', 'longitude',
            'preferred_language'
        ]


class FarmLandSerializer(serializers.ModelSerializer):
    """Serializer for farm land"""
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    soil_type_display = serializers.CharField(source='get_soil_type_display', read_only=True)
    
    class Meta:
        model = FarmLand
        fields = '__all__'
        read_only_fields = ['id', 'farmer', 'created_at', 'updated_at']


class FarmLandCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating farm land"""
    
    class Meta:
        model = FarmLand
        exclude = ['farmer']


class CropPlanningSerializer(serializers.ModelSerializer):
    """Serializer for crop planning"""
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    farm_land_name = serializers.CharField(source='farm_land.land_name', read_only=True)
    crop_type_display = serializers.CharField(source='get_crop_type_display', read_only=True)
    season_display = serializers.CharField(source='get_season_display', read_only=True)
    yield_per_acre = serializers.SerializerMethodField()
    
    class Meta:
        model = CropPlanning
        fields = '__all__'
        read_only_fields = ['id', 'farmer', 'created_at', 'updated_at']
    
    def get_yield_per_acre(self, obj):
        return obj.get_yield_per_acre()


class CropPlanningCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating crop planning"""
    
    class Meta:
        model = CropPlanning
        exclude = ['farmer']
