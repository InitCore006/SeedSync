from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q, Avg, Sum, Count, Min, Max
from django.utils import timezone
from datetime import timedelta

from .models import (
    Warehouse, WarehouseSensorData, Shipment,
    GPSTrackingLog, RouteOptimization
)
from .serializers import (
    WarehouseSerializer, WarehouseListSerializer,
    WarehouseSensorDataSerializer, ShipmentSerializer,
    ShipmentListSerializer, GPSTrackingLogSerializer,
    RouteOptimizationSerializer
)


class WarehouseViewSet(viewsets.ModelViewSet):
    """
    Warehouse Management
    
    Custom Actions:
    - available_capacity: Get warehouses with available space
    - nearby_warehouses: Get warehouses near a location
    - sensor_status: Get real-time sensor data
    - capacity_analytics: Get capacity utilization analytics
    """
    
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['warehouse_type', 'state', 'district', 'is_active']
    search_fields = ['warehouse_id', 'name', 'district', 'state']
    ordering_fields = ['total_capacity', 'utilization_percentage', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return WarehouseListSerializer
        return WarehouseSerializer
    
    @action(detail=False, methods=['get'])
    def available_capacity(self, request):
        """Get warehouses with available capacity"""
        min_capacity = float(request.query_params.get('min_capacity', 0))
        state = request.query_params.get('state')
        warehouse_type = request.query_params.get('type')
        
        filters = {
            'is_active': True,
            'available_capacity__gte': min_capacity
        }
        
        if state:
            filters['state'] = state
        if warehouse_type:
            filters['warehouse_type'] = warehouse_type
        
        warehouses = Warehouse.objects.filter(**filters).order_by('-available_capacity')
        serializer = WarehouseListSerializer(warehouses, many=True)
        
        return Response({
            'total_warehouses': warehouses.count(),
            'total_available_capacity': float(
                warehouses.aggregate(Sum('available_capacity'))['available_capacity__sum'] or 0
            ),
            'warehouses': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def nearby_warehouses(self, request):
        """Get warehouses near a location"""
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        radius_km = float(request.data.get('radius_km', 50))
        
        if not latitude or not longitude:
            return Response({'error': 'latitude and longitude required'}, status=400)
        
        # Simplified distance calculation (Haversine formula for production)
        # For now, using basic lat/long filtering
        lat_range = radius_km / 111.0  # 1 degree latitude ≈ 111 km
        lng_range = radius_km / (111.0 * abs(float(latitude)))
        
        lat_min = float(latitude) - lat_range
        lat_max = float(latitude) + lat_range
        lng_min = float(longitude) - lng_range
        lng_max = float(longitude) + lng_range
        
        warehouses = Warehouse.objects.filter(
            latitude__gte=lat_min,
            latitude__lte=lat_max,
            longitude__gte=lng_min,
            longitude__lte=lng_max,
            is_active=True
        )
        
        serializer = WarehouseListSerializer(warehouses, many=True)
        return Response({
            'search_location': {'lat': latitude, 'lng': longitude},
            'radius_km': radius_km,
            'warehouses_found': warehouses.count(),
            'warehouses': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def sensor_status(self, request, pk=None):
        """Get latest sensor data for warehouse"""
        warehouse = self.get_object()
        
        if not warehouse.has_sensors:
            return Response({'error': 'Warehouse does not have sensors'}, status=400)
        
        # Get latest sensor data
        latest_data = WarehouseSensorData.objects.filter(
            warehouse=warehouse
        ).order_by('-timestamp').first()
        
        if not latest_data:
            return Response({'error': 'No sensor data available'}, status=404)
        
        serializer = WarehouseSensorDataSerializer(latest_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def capacity_analytics(self, request):
        """Get capacity utilization analytics"""
        state = request.query_params.get('state')
        
        filters = {'is_active': True}
        if state:
            filters['state'] = state
        
        warehouses = Warehouse.objects.filter(**filters)
        
        analytics = {
            'total_warehouses': warehouses.count(),
            'total_capacity': float(warehouses.aggregate(Sum('total_capacity'))['total_capacity__sum'] or 0),
            'total_occupied': float(warehouses.aggregate(Sum('current_occupancy'))['current_occupancy__sum'] or 0),
            'total_available': float(warehouses.aggregate(Sum('available_capacity'))['available_capacity__sum'] or 0),
            'average_utilization': float(warehouses.aggregate(Avg('utilization_percentage'))['utilization_percentage__avg'] or 0),
            'by_type': {},
            'utilization_ranges': {
                'under_utilized': warehouses.filter(utilization_percentage__lt=50).count(),
                'optimal': warehouses.filter(utilization_percentage__gte=50, utilization_percentage__lt=80).count(),
                'high_utilization': warehouses.filter(utilization_percentage__gte=80, utilization_percentage__lt=95).count(),
                'critical': warehouses.filter(utilization_percentage__gte=95).count()
            }
        }
        
        # Group by warehouse type
        for wh_type, _ in Warehouse.WAREHOUSE_TYPES:
            type_warehouses = warehouses.filter(warehouse_type=wh_type)
            if type_warehouses.exists():
                analytics['by_type'][wh_type] = {
                    'count': type_warehouses.count(),
                    'total_capacity': float(type_warehouses.aggregate(Sum('total_capacity'))['total_capacity__sum'] or 0),
                    'average_utilization': float(type_warehouses.aggregate(Avg('utilization_percentage'))['utilization_percentage__avg'] or 0)
                }
        
        return Response(analytics)
    
    @action(detail=True, methods=['post'])
    def update_occupancy(self, request, pk=None):
        """Update warehouse occupancy"""
        warehouse = self.get_object()
        
        new_occupancy = request.data.get('current_occupancy')
        if new_occupancy is None:
            return Response({'error': 'current_occupancy required'}, status=400)
        
        new_occupancy = float(new_occupancy)
        if new_occupancy > float(warehouse.total_capacity):
            return Response({'error': 'Occupancy cannot exceed total capacity'}, status=400)
        
        warehouse.current_occupancy = new_occupancy
        warehouse.save()
        
        return Response({
            'message': 'Occupancy updated',
            'current_occupancy': float(warehouse.current_occupancy),
            'available_capacity': float(warehouse.available_capacity),
            'utilization_percentage': float(warehouse.utilization_percentage)
        })


class WarehouseSensorDataViewSet(viewsets.ModelViewSet):
    """
    Warehouse IoT Sensor Data
    
    Custom Actions:
    - latest: Get latest sensor readings
    - alerts: Get sensor alerts
    - trends: Get sensor data trends
    """
    
    queryset = WarehouseSensorData.objects.select_related('warehouse').all()
    serializer_class = WarehouseSensorDataSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['warehouse', 'is_temperature_alert', 'is_humidity_alert', 'is_pest_detected']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest sensor readings for all warehouses"""
        warehouse_id = request.query_params.get('warehouse')
        
        if warehouse_id:
            data = WarehouseSensorData.objects.filter(
                warehouse_id=warehouse_id
            ).order_by('-timestamp').first()
            
            if not data:
                return Response({'error': 'No data available'}, status=404)
            
            serializer = self.get_serializer(data)
            return Response(serializer.data)
        
        # Get latest for each warehouse
        from django.db.models import Max
        latest_timestamps = WarehouseSensorData.objects.values('warehouse').annotate(
            max_timestamp=Max('timestamp')
        )
        
        latest_data = []
        for item in latest_timestamps:
            data = WarehouseSensorData.objects.get(
                warehouse_id=item['warehouse'],
                timestamp=item['max_timestamp']
            )
            latest_data.append(data)
        
        serializer = self.get_serializer(latest_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Get all sensor alerts"""
        warehouse_id = request.query_params.get('warehouse')
        
        filters = Q(is_temperature_alert=True) | Q(is_humidity_alert=True) | Q(is_pest_detected=True)
        
        if warehouse_id:
            alerts = WarehouseSensorData.objects.filter(
                warehouse_id=warehouse_id
            ).filter(filters).order_by('-timestamp')
        else:
            alerts = WarehouseSensorData.objects.filter(filters).order_by('-timestamp')
        
        serializer = self.get_serializer(alerts, many=True)
        return Response({
            'total_alerts': alerts.count(),
            'alerts': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get sensor data trends"""
        warehouse_id = request.query_params.get('warehouse')
        days = int(request.query_params.get('days', 7))
        
        if not warehouse_id:
            return Response({'error': 'warehouse parameter required'}, status=400)
        
        start_date = timezone.now() - timedelta(days=days)
        
        data = WarehouseSensorData.objects.filter(
            warehouse_id=warehouse_id,
            timestamp__gte=start_date
        ).order_by('timestamp')
        
        trends = {
            'warehouse_id': warehouse_id,
            'period_days': days,
            'data_points': data.count(),
            'temperature': {
                'average': float(data.aggregate(Avg('temperature'))['temperature__avg'] or 0),
                'min': float(data.aggregate(Min('temperature'))['temperature__min'] or 0),
                'max': float(data.aggregate(Max('temperature'))['temperature__max'] or 0)
            },
            'humidity': {
                'average': float(data.aggregate(Avg('humidity'))['humidity__avg'] or 0),
                'min': float(data.aggregate(Min('humidity'))['humidity__min'] or 0),
                'max': float(data.aggregate(Max('humidity'))['humidity__max'] or 0)
            },
            'readings': []
        }
        
        for reading in data:
            trends['readings'].append({
                'timestamp': reading.timestamp,
                'temperature': float(reading.temperature),
                'humidity': float(reading.humidity)
            })
        
        return Response(trends)


class ShipmentViewSet(viewsets.ModelViewSet):
    """
    Shipment Tracking
    
    Custom Actions:
    - my_shipments: Get current user's shipments
    - active_shipments: Get active/in-transit shipments
    - track: Real-time tracking
    - update_location: Update GPS location
    - confirm_pickup: Confirm pickup
    - confirm_delivery: Confirm delivery with POD
    """
    
    queryset = Shipment.objects.select_related(
        'order__listing__crop_type', 'logistics_partner'
    ).all()
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'logistics_partner']
    ordering_fields = ['scheduled_pickup', 'scheduled_delivery', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ShipmentListSerializer
        return ShipmentSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'LOGISTICS':
            return Shipment.objects.filter(logistics_partner__user=user)
        elif user.role == 'FARMER':
            return Shipment.objects.filter(order__listing__farmer__user=user)
        elif user.role == 'FPO':
            return Shipment.objects.filter(
                Q(order__listing__fpo__user=user) | Q(order__buyer_fpo__user=user)
            )
        elif user.role == 'PROCESSOR':
            return Shipment.objects.filter(order__buyer_processor__user=user)
        
        return Shipment.objects.all()
    
    @action(detail=False, methods=['get'])
    def my_shipments(self, request):
        """Get current user's shipments"""
        shipments = self.get_queryset()
        serializer = self.get_serializer(shipments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active_shipments(self, request):
        """Get active/in-transit shipments"""
        active = self.get_queryset().filter(
            status__in=['PENDING', 'PICKED_UP', 'IN_TRANSIT']
        )
        serializer = ShipmentListSerializer(active, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def track(self, request, pk=None):
        """Real-time shipment tracking"""
        shipment = self.get_object()
        
        # Get latest GPS tracking
        latest_log = shipment.tracking_logs.first()
        
        tracking_info = {
            'shipment_id': shipment.shipment_id,
            'status': shipment.status,
            'order_id': shipment.order.order_id,
            'origin': {
                'address': shipment.origin_address,
                'coords': {
                    'lat': float(shipment.origin_lat) if shipment.origin_lat else None,
                    'lng': float(shipment.origin_lng) if shipment.origin_lng else None
                }
            },
            'destination': {
                'address': shipment.destination_address,
                'coords': {
                    'lat': float(shipment.destination_lat) if shipment.destination_lat else None,
                    'lng': float(shipment.destination_lng) if shipment.destination_lng else None
                }
            },
            'current_location': None,
            'driver': {
                'name': shipment.driver_name,
                'phone': shipment.driver_phone
            },
            'scheduled_pickup': shipment.scheduled_pickup,
            'scheduled_delivery': shipment.scheduled_delivery,
            'actual_pickup': shipment.actual_pickup,
            'actual_delivery': shipment.actual_delivery
        }
        
        if latest_log:
            tracking_info['current_location'] = {
                'coords': {
                    'lat': float(latest_log.latitude),
                    'lng': float(latest_log.longitude)
                },
                'speed': float(latest_log.speed) if latest_log.speed else None,
                'is_moving': latest_log.is_moving,
                'last_updated': latest_log.created_at
            }
        
        return Response(tracking_info)
    
    @action(detail=True, methods=['post'])
    def update_location(self, request, pk=None):
        """Update GPS location"""
        shipment = self.get_object()
        
        # Only logistics partner can update
        if request.user.role != 'LOGISTICS' or shipment.logistics_partner.user != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        speed = request.data.get('speed')
        
        if not latitude or not longitude:
            return Response({'error': 'latitude and longitude required'}, status=400)
        
        # Create GPS log
        gps_log = GPSTrackingLog.objects.create(
            shipment=shipment,
            latitude=latitude,
            longitude=longitude,
            speed=speed,
            is_moving=float(speed) > 0 if speed else False
        )
        
        serializer = GPSTrackingLogSerializer(gps_log)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirm_pickup(self, request, pk=None):
        """Confirm shipment pickup"""
        shipment = self.get_object()
        
        if shipment.status != 'PENDING':
            return Response({'error': 'Shipment is not in pending state'}, status=400)
        
        shipment.status = 'PICKED_UP'
        shipment.actual_pickup = timezone.now()
        
        # Update location if provided
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        
        if latitude and longitude:
            GPSTrackingLog.objects.create(
                shipment=shipment,
                latitude=latitude,
                longitude=longitude,
                is_moving=False
            )
        
        shipment.save()
        
        # Update order status
        shipment.order.status = 'IN_TRANSIT'
        shipment.order.save()
        
        return Response({
            'message': 'Pickup confirmed',
            'shipment_id': shipment.shipment_id,
            'pickup_time': shipment.actual_pickup
        })
    
    @action(detail=True, methods=['post'])
    def confirm_delivery(self, request, pk=None):
        """Confirm delivery with proof of delivery"""
        shipment = self.get_object()
        
        if shipment.status not in ['PICKED_UP', 'IN_TRANSIT']:
            return Response({'error': 'Invalid shipment status for delivery'}, status=400)
        
        shipment.status = 'DELIVERED'
        shipment.actual_delivery = timezone.now()
        
        # Save POD signature/photo if provided
        if 'pod_signature' in request.FILES:
            shipment.pod_signature = request.FILES['pod_signature']
        if 'pod_photo' in request.FILES:
            shipment.pod_photo = request.FILES['pod_photo']
        
        shipment.save()
        
        # Update order
        shipment.order.status = 'DELIVERED'
        shipment.order.actual_delivery_date = shipment.actual_delivery.date()
        shipment.order.save()
        
        return Response({
            'message': 'Delivery confirmed',
            'shipment_id': shipment.shipment_id,
            'delivery_time': shipment.actual_delivery,
            'order_id': shipment.order.order_id
        })
    
    @action(detail=False, methods=['get'])
    def shipment_stats(self, request):
        """Get shipment statistics"""
        shipments = self.get_queryset()
        
        stats = {
            'total_shipments': shipments.count(),
            'by_status': {},
            'pending': shipments.filter(status='PENDING').count(),
            'in_transit': shipments.filter(status__in=['PICKED_UP', 'IN_TRANSIT']).count(),
            'delivered': shipments.filter(status='DELIVERED').count(),
            'cancelled': shipments.filter(status='CANCELLED').count(),
            'total_freight_charges': float(shipments.aggregate(Sum('freight_charges'))['freight_charges__sum'] or 0)
        }
        
        # Count by status
        for status_code, status_name in Shipment.STATUS_CHOICES:
            stats['by_status'][status_code] = shipments.filter(status=status_code).count()
        
        return Response(stats)


class RouteOptimizationViewSet(viewsets.ModelViewSet):
    """
    AI Route Optimization
    
    Custom Actions:
    - optimize_route: Generate optimized route
    - compare_routes: Compare multiple routes
    """
    
    queryset = RouteOptimization.objects.all()
    serializer_class = RouteOptimizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['distance', 'estimated_time', 'estimated_fuel_cost']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['post'])
    def optimize_route(self, request):
        """Generate AI-optimized route"""
        origin = request.data.get('origin')
        destination = request.data.get('destination')
        waypoints = request.data.get('waypoints', [])
        
        if not origin or not destination:
            return Response({'error': 'origin and destination required'}, status=400)
        
        # Placeholder for AI route optimization
        # In production, integrate with Google Maps API, OpenRouteService, etc.
        import random
        
        distance = random.uniform(100, 500)  # km
        estimated_time = distance / 50  # hours at 50 km/h average
        fuel_cost = distance * 8  # ₹8 per km
        
        route_optimization = RouteOptimization.objects.create(
            origin=origin,
            destination=destination,
            optimal_route=waypoints or [],
            distance=distance,
            estimated_time=estimated_time,
            estimated_fuel_cost=fuel_cost,
            traffic_conditions='Moderate',
            weather_impact='Clear'
        )
        
        serializer = self.get_serializer(route_optimization)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def compare_routes(self, request):
        """Compare multiple route options"""
        routes = request.data.get('routes', [])
        
        if not routes or len(routes) < 2:
            return Response({'error': 'At least 2 routes required for comparison'}, status=400)
        
        comparisons = []
        for route_data in routes:
            # Simulate route calculation
            import random
            distance = random.uniform(100, 500)
            
            comparisons.append({
                'route': route_data,
                'distance': round(distance, 2),
                'estimated_time': round(distance / 50, 2),
                'estimated_cost': round(distance * 8, 2),
                'traffic_level': random.choice(['Low', 'Moderate', 'High'])
            })
        
        # Find best route (lowest cost)
        best_route = min(comparisons, key=lambda x: x['estimated_cost'])
        
        return Response({
            'comparisons': comparisons,
            'recommended_route': best_route
        })


class GPSTrackingLogViewSet(viewsets.ReadOnlyModelViewSet):
    """GPS Tracking Logs (Read-only)"""
    
    queryset = GPSTrackingLog.objects.select_related('shipment').all()
    serializer_class = GPSTrackingLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['shipment']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def shipment_trail(self, request):
        """Get complete GPS trail for a shipment"""
        shipment_id = request.query_params.get('shipment_id')
        
        if not shipment_id:
            return Response({'error': 'shipment_id parameter required'}, status=400)
        
        logs = GPSTrackingLog.objects.filter(
            shipment__shipment_id=shipment_id
        ).order_by('created_at')
        
        trail = []
        for log in logs:
            trail.append({
                'latitude': float(log.latitude),
                'longitude': float(log.longitude),
                'speed': float(log.speed) if log.speed else 0,
                'timestamp': log.created_at
            })
        
        return Response({
            'shipment_id': shipment_id,
            'total_points': len(trail),
            'trail': trail
        })