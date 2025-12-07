"""Logistics Serializers"""
from rest_framework import serializers
from .models import LogisticsPartner, Vehicle, Shipment
from apps.users.serializers import UserSerializer


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for vehicle details"""
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    
    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ['id', 'logistics_partner', 'created_at', 'updated_at']


class VehicleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vehicles"""
    
    class Meta:
        model = Vehicle
        fields = ['vehicle_number', 'vehicle_type', 'capacity_quintals']
    
    def validate_vehicle_number(self, value):
        """Validate vehicle number format and uniqueness"""
        if Vehicle.objects.filter(vehicle_number=value.upper()).exists():
            raise serializers.ValidationError("Vehicle with this number already exists")
        return value.upper()


class LogisticsPartnerSerializer(serializers.ModelSerializer):
    """Serializer for logistics partner profile"""
    user = UserSerializer(read_only=True)
    state_display = serializers.CharField(source='get_state_display', read_only=True)
    vehicles = VehicleSerializer(many=True, read_only=True)
    total_vehicles = serializers.SerializerMethodField()
    total_shipments = serializers.SerializerMethodField()
    
    class Meta:
        model = LogisticsPartner
        fields = '__all__'
        read_only_fields = ['id', 'user', 'is_verified', 'created_at', 'updated_at']
    
    def get_total_vehicles(self, obj):
        return obj.vehicles.count()
    
    def get_total_shipments(self, obj):
        return obj.shipments.count()


class LogisticsPartnerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating logistics partner profile - Single step registration"""
    
    class Meta:
        model = LogisticsPartner
        fields = [
            'company_name', 'contact_person', 'phone', 'email',
            'address', 'city', 'state'
        ]
    
    def validate(self, attrs):
        """Ensure required fields for registration"""
        required_fields = ['company_name', 'contact_person', 'phone', 'address', 'city', 'state']
        for field in required_fields:
            if field not in attrs or not attrs[field]:
                raise serializers.ValidationError({field: f"{field.replace('_', ' ').title()} is required"})
        return attrs


class LogisticsPartnerUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating logistics partner profile"""
    
    class Meta:
        model = LogisticsPartner
        fields = [
            'company_name', 'contact_person', 'phone', 'email',
            'address', 'city', 'state'
        ]


class ShipmentSerializer(serializers.ModelSerializer):
    """Serializer for shipment tracking"""
    logistics_partner_name = serializers.CharField(source='logistics_partner.company_name', read_only=True)
    lot_number = serializers.CharField(source='lot.lot_number', read_only=True)
    vehicle_number = serializers.CharField(source='vehicle.vehicle_number', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Shipment
        fields = '__all__'
        read_only_fields = ['id', 'logistics_partner', 'created_at', 'updated_at']


class ShipmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating shipments"""
    
    class Meta:
        model = Shipment
        fields = ['lot', 'vehicle', 'status', 'pickup_date', 'delivery_date']
    
    def validate(self, attrs):
        """Validate shipment data"""
        if attrs.get('delivery_date') and attrs.get('pickup_date'):
            if attrs['delivery_date'] < attrs['pickup_date']:
                raise serializers.ValidationError(
                    {"delivery_date": "Delivery date cannot be before pickup date"}
                )
        return attrs
