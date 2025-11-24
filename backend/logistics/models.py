from django.db import models
from core.models import TimeStampedModel
from users.models import LogisticsProfile
from marketplace.models import Order


class Warehouse(TimeStampedModel):
    """Warehouse details - Can belong to FPO, Processor, Retailer, or Logistics Partner"""
    
    WAREHOUSE_TYPE = [
        ('OWNED', 'Owned'),
        ('RENTED', 'Rented'),
        ('SHARED', 'Shared/Co-operative'),
    ]
    
    STORAGE_TYPE = [
        ('OPEN', 'Open Storage'),
        ('COVERED', 'Covered Warehouse'),
        ('COLD', 'Cold Storage'),
        ('SCIENTIFIC', 'Scientific Storage (Controlled Environment)'),
    ]
    
    # Polymorphic - can belong to any stakeholder
    owner_type = models.CharField(max_length=20, choices=[
        ('FPO', 'FPO'),
        ('PROCESSOR', 'Processor'),
        ('RETAILER', 'Retailer'),
        ('LOGISTICS', 'Logistics Partner'),
    ])
    owner_id = models.IntegerField()  # ID of the profile
    
    # Location
    warehouse_id = models.IntegerField()
    warehouse_name = models.CharField(max_length=200)
    address = models.TextField()
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Details
    warehouse_type = models.CharField(max_length=20, choices=WAREHOUSE_TYPE)
    storage_type = models.CharField(max_length=20, choices=STORAGE_TYPE)
    total_capacity = models.DecimalField(max_digits=10, decimal_places=2, help_text="In metric tonnes")
    current_occupancy = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Facilities
    has_weighbridge = models.BooleanField(default=False)
    has_quality_testing = models.BooleanField(default=False)
    has_security = models.BooleanField(default=False)
    
    is_active = models.BooleanField(default=True)
    
    @property
    def occupancy_percentage(self):
        if self.total_capacity > 0:
            return (self.current_occupancy / self.total_capacity) * 100
        return 0
    
    @property
    def available_capacity(self):
        return self.total_capacity - self.current_occupancy
    
    class Meta:
        db_table = 'warehouses'
        indexes = [
            models.Index(fields=['owner_type', 'owner_id']),
            models.Index(fields=['state', 'district']),
        ]
    
    def __str__(self):
        return f"{self.warehouse_name} ({self.state})"


class Vehicle(TimeStampedModel):
    """Transport vehicles - Owned by FPO, Processor, or Logistics Partner"""
    
    VEHICLE_TYPE = [
        ('TRACTOR', 'Tractor-Trolley'),
        ('SMALL_TRUCK', 'Small Truck (< 5 MT)'),
        ('MEDIUM_TRUCK', 'Medium Truck (5-10 MT)'),
        ('LARGE_TRUCK', 'Large Truck (> 10 MT)'),
        ('TANKER', 'Tanker'),
        ('REFRIGERATED', 'Refrigerated Vehicle'),
    ]
    
    # Polymorphic owner
    owner_type = models.CharField(max_length=20, choices=[
        ('FPO', 'FPO'),
        ('PROCESSOR', 'Processor'),
        ('LOGISTICS', 'Logistics Partner'),
    ])
    owner_id = models.IntegerField()
    
    vehicle_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE)
    capacity = models.DecimalField(max_digits=6, decimal_places=2, help_text="In metric tonnes")
    
    # GPS Tracking
    has_gps = models.BooleanField(default=False)
    gps_device_id = models.CharField(max_length=100, blank=True)
    
    # Documentation
    rc_number = models.CharField(max_length=50)
    insurance_valid_till = models.DateField()
    fitness_valid_till = models.DateField()
    
    # Status
    is_active = models.BooleanField(default=True)
    current_status = models.CharField(
        max_length=20,
        choices=[
            ('AVAILABLE', 'Available'),
            ('IN_TRANSIT', 'In Transit'),
            ('MAINTENANCE', 'Under Maintenance'),
        ],
        default='AVAILABLE'
    )
    
    class Meta:
        db_table = 'vehicles'
        indexes = [
            models.Index(fields=['owner_type', 'owner_id']),
            models.Index(fields=['vehicle_number']),
        ]
    
    def __str__(self):
        return f"{self.vehicle_number} ({self.get_vehicle_type_display()})"
    

class WarehouseSensorData(TimeStampedModel):
    """IoT sensor readings"""
    
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='sensor_data')
    
    # Environmental
    temperature = models.DecimalField(max_digits=5, decimal_places=2, help_text="°C")
    humidity = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage")
    
    # Alerts
    is_temperature_alert = models.BooleanField(default=False)
    is_humidity_alert = models.BooleanField(default=False)
    is_pest_detected = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'warehouse_sensor_data'
        ordering = ['-created_at']


class Shipment(TimeStampedModel):
    """Transportation tracking"""
    
    STATUS_CHOICES = [
        ('ASSIGNED', 'Assigned to Logistics'),
        ('PICKED_UP', 'Picked Up'),
        ('IN_TRANSIT', 'In Transit'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    shipment_id = models.CharField(max_length=50, unique=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment')
    logistics_partner = models.ForeignKey(LogisticsProfile, on_delete=models.SET_NULL, null=True)
    
    # Route
    origin_address = models.TextField()
    origin_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    origin_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    
    destination_address = models.TextField()
    destination_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    destination_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    
    # Vehicle
    vehicle_number = models.CharField(max_length=20, blank=True)
    driver_name = models.CharField(max_length=100, blank=True)
    driver_phone = models.CharField(max_length=15, blank=True)
    
    # Timing
    scheduled_pickup = models.DateTimeField()
    actual_pickup = models.DateTimeField(null=True, blank=True)
    scheduled_delivery = models.DateTimeField()
    actual_delivery = models.DateTimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ASSIGNED')
    
    # Distance & Cost
    estimated_distance = models.DecimalField(max_digits=8, decimal_places=2, null=True, help_text="In km")
    freight_charges = models.DecimalField(max_digits=10, decimal_places=2, help_text="₹")
    
    # Proof of Delivery
    pod_signature = models.ImageField(upload_to='pod_signatures/', null=True, blank=True)
    pod_photo = models.ImageField(upload_to='pod_photos/', null=True, blank=True)
    
    class Meta:
        db_table = 'shipments'
        indexes = [
            models.Index(fields=['shipment_id']),
            models.Index(fields=['status']),
        ]


class GPSTrackingLog(TimeStampedModel):
    """Real-time GPS tracking"""
    
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='tracking_logs')
    
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    speed = models.DecimalField(max_digits=5, decimal_places=2, null=True, help_text="km/h")
    
    # Additional data
    battery_level = models.IntegerField(null=True, help_text="Percentage")
    is_moving = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'gps_tracking_logs'
        ordering = ['-created_at']


class RouteOptimization(TimeStampedModel):
    """AI-generated optimal routes"""
    
    origin = models.JSONField()  # {"lat": 28.7041, "lng": 77.1025}
    destination = models.JSONField()
    
    # Route details
    optimal_route = models.JSONField()  # Array of waypoints
    distance = models.DecimalField(max_digits=8, decimal_places=2, help_text="In km")
    estimated_time = models.IntegerField(help_text="In minutes")
    estimated_fuel_cost = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Traffic & Weather
    traffic_conditions = models.CharField(max_length=50, blank=True)
    weather_impact = models.CharField(max_length=100, blank=True)
    
    # AI metadata
    algorithm_used = models.CharField(max_length=100, default='Dijkstra')
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2)
    
    class Meta:
        db_table = 'route_optimizations'