"""FPO Serializers"""
from rest_framework import serializers
from .models import FPOProfile, FPOMembership, FPOWarehouse

class FPOProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FPOProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class FPOMembershipSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.user.get_full_name', read_only=True)
    fpo_name = serializers.CharField(source='fpo.fpo_name', read_only=True)
    
    class Meta:
        model = FPOMembership
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class FPOWarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FPOWarehouse
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
