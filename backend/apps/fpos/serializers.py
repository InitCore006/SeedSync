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
    available_capacity = serializers.SerializerMethodField()
    utilization_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = FPOWarehouse
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'current_stock_quintals']
        extra_kwargs = {
            'latitude': {'required': False, 'allow_null': True},
            'longitude': {'required': False, 'allow_null': True},
            'weighing_capacity_quintals': {'required': False, 'allow_null': True},
            'village': {'required': False, 'allow_blank': True},
            'incharge_name': {'required': False, 'allow_blank': True},
            'incharge_phone': {'required': False, 'allow_blank': True},
            'operational_since': {'required': False, 'allow_null': True},
            'notes': {'required': False, 'allow_blank': True},
        }
    
    def get_available_capacity(self, obj):
        return obj.get_available_capacity()
    
    def get_utilization_percentage(self, obj):
        return obj.get_capacity_utilization_percentage()
    
    def validate_capacity_quintals(self, value):
        if value <= 0:
            raise serializers.ValidationError("Capacity must be greater than zero")
        return value
    
    def validate_warehouse_code(self, value):
        if not value:
            raise serializers.ValidationError("Warehouse code is required")
        # Check uniqueness excluding current instance during update
        instance = self.instance
        queryset = FPOWarehouse.objects.filter(warehouse_code=value)
        if instance:
            queryset = queryset.exclude(id=instance.id)
        if queryset.exists():
            raise serializers.ValidationError("This warehouse code is already in use")
        return value
    
    def validate_pincode(self, value):
        """Validate pincode is exactly 6 digits"""
        if value and not value.isdigit():
            raise serializers.ValidationError("Pincode must contain only digits")
        if value and len(value) != 6:
            raise serializers.ValidationError("Pincode must be exactly 6 digits")
        return value
