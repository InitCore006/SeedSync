"""Logistics Serializers"""
from rest_framework import serializers
from .models import LogisticsPartner, Vehicle, Shipment
from apps.users.serializers import UserSerializer


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for vehicle details"""
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    logistics_partner_name = serializers.CharField(source='logistics_partner.company_name', read_only=True)
    
    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ['id', 'logistics_partner', 'created_at', 'updated_at']


class VehicleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vehicles"""
    
    class Meta:
        model = Vehicle
        fields = [
            'vehicle_number', 'vehicle_type', 'capacity_quintals',
            'vehicle_model', 'year_of_manufacture', 'rc_document',
            'insurance_document', 'pollution_certificate'
        ]
    
    def validate_vehicle_number(self, value):
        """Validate vehicle number format and uniqueness"""
        value = value.upper().replace(' ', '').replace('-', '')
        if Vehicle.objects.filter(vehicle_number=value).exists():
            raise serializers.ValidationError("Vehicle with this number already exists")
        return value


class LogisticsPartnerSerializer(serializers.ModelSerializer):
    """Serializer for logistics partner profile"""
    user = UserSerializer(read_only=True)
    vehicles = VehicleSerializer(many=True, read_only=True)
    
    # Properties from UserProfile (read-only)
    contact_person = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)
    address = serializers.CharField(read_only=True)
    city = serializers.CharField(read_only=True)
    state = serializers.CharField(read_only=True)
    
    # Statistics
    total_vehicles = serializers.SerializerMethodField()
    total_shipments = serializers.SerializerMethodField()
    active_shipments = serializers.SerializerMethodField()
    completed_shipments = serializers.SerializerMethodField()
    
    class Meta:
        model = LogisticsPartner
        fields = '__all__'
        read_only_fields = [
            'id', 'user', 'is_verified', 'verification_documents',
            'average_rating', 'total_deliveries', 'on_time_delivery_rate',
            'created_at', 'updated_at'
        ]
    
    def get_total_vehicles(self, obj):
        return obj.vehicles.filter(is_active=True).count()
    
    def get_total_shipments(self, obj):
        return obj.shipments.count()
    
    def get_active_shipments(self, obj):
        return obj.shipments.filter(status__in=['accepted', 'in_transit']).count()
    
    def get_completed_shipments(self, obj):
        return obj.shipments.filter(status='delivered').count()


class LogisticsPartnerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating logistics partner profile - Only logistics-specific fields"""
    
    class Meta:
        model = LogisticsPartner
        fields = [
            'company_name', 'gst_number', 'transport_license',
            'bank_account_number', 'bank_ifsc_code', 'bank_name',
            'bank_branch', 'bank_account_holder_name', 'service_states'
        ]
    
    def validate(self, attrs):
        """Ensure required fields for registration"""
        if not attrs.get('company_name'):
            raise serializers.ValidationError({'company_name': 'Company name is required'})
        return attrs


class LogisticsPartnerUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating logistics partner profile"""
    
    class Meta:
        model = LogisticsPartner
        fields = [
            'company_name', 'gst_number', 'transport_license',
            'bank_account_number', 'bank_ifsc_code', 'bank_name',
            'bank_branch', 'bank_account_holder_name', 'service_states'
        ]


class ShipmentSerializer(serializers.ModelSerializer):
    """Serializer for shipment tracking"""
    logistics_partner_name = serializers.CharField(source='logistics_partner.company_name', read_only=True)
    logistics_partner_phone = serializers.CharField(source='logistics_partner.phone', read_only=True)
    lot_number = serializers.CharField(source='lot.lot_number', read_only=True)
    lot_crop_type = serializers.CharField(source='lot.crop_type_display', read_only=True)
    lot_quantity = serializers.DecimalField(source='lot.quantity_quintals', max_digits=10, decimal_places=2, read_only=True)
    vehicle_number = serializers.CharField(source='vehicle.vehicle_number', read_only=True, allow_null=True)
    vehicle_type = serializers.CharField(source='vehicle.vehicle_type', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Shipment
        fields = '__all__'
        read_only_fields = [
            'id', 'logistics_partner', 'actual_pickup_date', 'actual_delivery_date',
            'created_at', 'updated_at'
        ]


class ShipmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating shipments"""
    
    class Meta:
        model = Shipment
        fields = [
            'lot', 'vehicle', 'scheduled_pickup_date', 'scheduled_delivery_date',
            'pickup_address', 'delivery_address', 'quoted_price',
            'driver_name', 'driver_phone', 'notes'
        ]
    
    def validate(self, attrs):
        """Validate shipment data"""
        if attrs.get('scheduled_delivery_date') and attrs.get('scheduled_pickup_date'):
            if attrs['scheduled_delivery_date'] < attrs['scheduled_pickup_date']:
                raise serializers.ValidationError(
                    {"scheduled_delivery_date": "Delivery date cannot be before pickup date"}
                )
        return attrs
