from datetime import timezone
from rest_framework import serializers
from .models import (
    Vehicle, Warehouse, WarehouseSensorData, Shipment,
    GPSTrackingLog, RouteOptimization
)


# ============================================================================
# WAREHOUSE & VEHICLE SERIALIZERS
# ============================================================================

class WarehouseSerializer(serializers.ModelSerializer):
    """Warehouse Serializer (for FPO/Processor/Retailer/Logistics)"""
    
    occupancy_percentage = serializers.ReadOnlyField()
    available_capacity = serializers.ReadOnlyField()
    
    class Meta:
        model = Warehouse
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class VehicleSerializer(serializers.ModelSerializer):
    """Vehicle Serializer (for FPO/Processor/Logistics)"""
    
    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_insurance_valid_till(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Insurance has expired.")
        return value
    
    def validate_fitness_valid_till(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Fitness certificate has expired.")
        return value



class WarehouseListSerializer(serializers.ModelSerializer):
    """Lightweight warehouse list"""
    
    utilization = serializers.SerializerMethodField()
    
    class Meta:
        model = Warehouse
        fields = [
            'id', 'warehouse_id', 'warehouse_name', 'warehouse_type',
            'district', 'state', 'utilization', 'is_active'
        ]
    
    def get_utilization(self, obj):
        return round(obj.utilization_percentage, 2)


class WarehouseSensorDataSerializer(serializers.ModelSerializer):
    """IoT Sensor Data"""
    
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    alerts = serializers.SerializerMethodField()
    
    class Meta:
        model = WarehouseSensorData
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_alerts(self, obj):
        alerts = []
        if obj.is_temperature_alert:
            alerts.append({'type': 'temperature', 'message': 'Temperature out of range'})
        if obj.is_humidity_alert:
            alerts.append({'type': 'humidity', 'message': 'Humidity out of range'})
        if obj.is_pest_detected:
            alerts.append({'type': 'pest', 'message': 'Pest activity detected'})
        return alerts


class GPSTrackingLogSerializer(serializers.ModelSerializer):
    """GPS Tracking Logs"""
    
    coordinates = serializers.SerializerMethodField()
    
    class Meta:
        model = GPSTrackingLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_coordinates(self, obj):
        return {
            'lat': float(obj.latitude),
            'lng': float(obj.longitude)
        }


class ShipmentSerializer(serializers.ModelSerializer):
    """Shipment Tracking"""
    
    order_details = serializers.SerializerMethodField()
    logistics_details = serializers.SerializerMethodField()
    route_info = serializers.SerializerMethodField()
    tracking_data = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()
    pod_urls = serializers.SerializerMethodField()
    
    class Meta:
        model = Shipment
        fields = '__all__'
        read_only_fields = ['id', 'shipment_id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Auto-generate shipment_id
        import uuid
        from datetime import datetime
        validated_data['shipment_id'] = f"SHP-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        return super().create(validated_data)
    
    def get_order_details(self, obj):
        return {
            'order_id': obj.order.order_id,
            'crop_type': obj.order.listing.crop_type.name,
            'quantity': float(obj.order.quantity_ordered)
        }
    
    def get_logistics_details(self, obj):
        if obj.logistics_partner:
            return {
                'company_name': obj.logistics_partner.company_name,
                'rating': float(obj.logistics_partner.average_rating),
                'vehicle_number': obj.vehicle_number,
                'driver': {
                    'name': obj.driver_name,
                    'phone': obj.driver_phone
                }
            }
        return None
    
    def get_route_info(self, obj):
        return {
            'origin': {
                'address': obj.origin_address,
                'coords': {
                    'lat': float(obj.origin_lat) if obj.origin_lat else None,
                    'lng': float(obj.origin_lng) if obj.origin_lng else None
                }
            },
            'destination': {
                'address': obj.destination_address,
                'coords': {
                    'lat': float(obj.destination_lat) if obj.destination_lat else None,
                    'lng': float(obj.destination_lng) if obj.destination_lng else None
                }
            },
            'distance': float(obj.estimated_distance) if obj.estimated_distance else None
        }
    
    def get_tracking_data(self, obj):
        latest_log = obj.tracking_logs.first()  # Most recent due to ordering
        if latest_log:
            return {
                'current_location': {
                    'lat': float(latest_log.latitude),
                    'lng': float(latest_log.longitude)
                },
                'speed': float(latest_log.speed) if latest_log.speed else None,
                'is_moving': latest_log.is_moving,
                'last_updated': latest_log.created_at
            }
        return None
    
    def get_timeline(self, obj):
        from django.utils import timezone
        timeline = []
        
        if obj.actual_pickup:
            timeline.append({
                'event': 'picked_up',
                'timestamp': obj.actual_pickup,
                'status': 'completed'
            })
        elif obj.scheduled_pickup:
            timeline.append({
                'event': 'pickup',
                'timestamp': obj.scheduled_pickup,
                'status': 'scheduled'
            })
        
        if obj.actual_delivery:
            timeline.append({
                'event': 'delivered',
                'timestamp': obj.actual_delivery,
                'status': 'completed'
            })
        elif obj.expected_delivery_date:
            timeline.append({
                'event': 'delivery',
                'timestamp': obj.expected_delivery_date,
                'status': 'expected'
            })
        
        return timeline
    
    def get_pod_urls(self, obj):
        request = self.context.get('request')
        return {
            'signature': request.build_absolute_uri(obj.pod_signature.url) if obj.pod_signature and request else None,
            'photo': request.build_absolute_uri(obj.pod_photo.url) if obj.pod_photo and request else None
        }


class ShipmentListSerializer(serializers.ModelSerializer):
    """Lightweight shipment list"""
    
    order_id = serializers.CharField(source='order.order_id', read_only=True)
    
    class Meta:
        model = Shipment
        fields = [
            'id', 'shipment_id', 'order_id', 'status',
            'scheduled_pickup', 'scheduled_delivery',
            'freight_charges', 'created_at'
        ]


class RouteOptimizationSerializer(serializers.ModelSerializer):
    """AI Route Optimization"""
    
    route_details = serializers.SerializerMethodField()
    estimated_costs = serializers.SerializerMethodField()
    conditions = serializers.SerializerMethodField()
    
    class Meta:
        model = RouteOptimization
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_route_details(self, obj):
        return {
            'origin': obj.origin,
            'destination': obj.destination,
            'waypoints': obj.optimal_route,
            'distance': float(obj.distance),
            'estimated_time': obj.estimated_time
        }
    
    def get_estimated_costs(self, obj):
        return {
            'fuel': float(obj.estimated_fuel_cost),
            'total': float(obj.estimated_fuel_cost) * 1.2  # Add 20% for other costs
        }
    
    def get_conditions(self, obj):
        return {
            'traffic': obj.traffic_conditions,
            'weather': obj.weather_impact
        }