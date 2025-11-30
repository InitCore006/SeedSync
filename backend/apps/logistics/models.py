from django.db import models
from django.db import models
import uuid

class Vehicle(models.Model):
    """Fleet management for FPO and hired vehicles"""
    
    VEHICLE_TYPE_CHOICES = [
        ('truck', 'Truck'),
        ('mini_truck', 'Mini Truck'),
        ('tractor_trolley', 'Tractor Trolley'),
        ('tempo', 'Tempo'),
        ('van', 'Van'),
    ]
    
    OWNERSHIP_CHOICES = [
        ('fpo_owned', 'FPO Owned'),
        ('hired', 'Hired'),
        ('member_owned', 'Member Owned'),
        ('contracted', 'Contracted'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Vehicle Details
    vehicle_number = models.CharField(max_length=20, unique=True, db_index=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    
    # Ownership
    ownership_type = models.CharField(max_length=20, choices=OWNERSHIP_CHOICES)
    fpo = models.ForeignKey(
        'fpos.FPO',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='vehicles'
    )
    owner_name = models.CharField(max_length=200, blank=True)
    owner_contact = models.CharField(max_length=10, blank=True)
    
    # Specifications
    capacity = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Capacity in quintals"
    )
    make_model = models.CharField(max_length=100)
    year_of_manufacture = models.IntegerField()
    
    # Registration & Insurance
    registration_date = models.DateField()
    registration_expiry = models.DateField()
    insurance_number = models.CharField(max_length=50)
    insurance_expiry = models.DateField()
    fitness_certificate_expiry = models.DateField()
    pollution_certificate_expiry = models.DateField()
    
    # Driver Details
    driver_name = models.CharField(max_length=200)
    driver_license_number = models.CharField(max_length=20)
    driver_contact = models.CharField(max_length=10)
    
    # GPS Tracking
    gps_device_id = models.CharField(max_length=50, blank=True)
    gps_enabled = models.BooleanField(default=False)
    
    # Current Location
    current_latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    last_location_update = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    current_trip = models.ForeignKey(
        'Shipment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_vehicle'
    )
    
    # Maintenance
    last_maintenance_date = models.DateField(null=True, blank=True)
    next_maintenance_date = models.DateField(null=True, blank=True)
    total_trips = models.IntegerField(default=0)
    total_distance_km = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vehicles'
        verbose_name = 'Vehicle'
        verbose_name_plural = 'Vehicles'
        indexes = [
            models.Index(fields=['vehicle_number']),
            models.Index(fields=['is_available']),
        ]
    
    def __str__(self):
        return f"{self.vehicle_number} - {self.get_vehicle_type_display()}"


class Route(models.Model):
    """Route optimization and management"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Route Details
    route_name = models.CharField(max_length=200)
    route_code = models.CharField(max_length=20, unique=True)
    
    # Origin & Destination
    origin = models.CharField(max_length=200)
    origin_latitude = models.FloatField(null=True, blank=True)
    origin_longitude = models.FloatField(null=True, blank=True)
    destination = models.CharField(max_length=200)
    destination_latitude = models.FloatField(null=True, blank=True)
    destination_longitude = models.FloatField(null=True, blank=True)
    
    # Route Path
    route_path = models.JSONField(null=True, blank=True)
    
    # Waypoints
    waypoints = models.JSONField(
        default=list,
        help_text="List of intermediate stops with coordinates"
    )
    
    # Distance & Duration
    total_distance_km = models.DecimalField(max_digits=8, decimal_places=2)
    estimated_duration_hours = models.DecimalField(max_digits=6, decimal_places=2)
    
    # Road Conditions
    road_type = models.CharField(
        max_length=20,
        choices=[
            ('highway', 'Highway'),
            ('state_highway', 'State Highway'),
            ('district_road', 'District Road'),
            ('village_road', 'Village Road'),
            ('mixed', 'Mixed'),
        ]
    )
    road_condition = models.CharField(
        max_length=20,
        choices=[
            ('excellent', 'Excellent'),
            ('good', 'Good'),
            ('average', 'Average'),
            ('poor', 'Poor'),
        ],
        default='good'
    )
    
    # Toll & Costs
    total_toll_cost = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    estimated_fuel_cost = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Optimization Score
    optimization_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Route efficiency score (0-100)"
    )
    
    # Usage Statistics
    times_used = models.IntegerField(default=0)
    average_actual_duration = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'routes'
        verbose_name = 'Route'
        verbose_name_plural = 'Routes'
    
    def __str__(self):
        return f"{self.route_name} ({self.origin} → {self.destination})"


class Shipment(models.Model):
    """Shipment tracking and management"""
    
    STATUS_CHOICES = [
        ('created', 'Created'),
        ('vehicle_assigned', 'Vehicle Assigned'),
        ('loading', 'Loading'),
        ('in_transit', 'In Transit'),
        ('reached_destination', 'Reached Destination'),
        ('unloading', 'Unloading'),
        ('completed', 'Completed'),
        ('delayed', 'Delayed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Shipment Details
    shipment_number = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Related Orders
    procurement_order = models.ForeignKey(
        'procurement.ProcurementOrder',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='shipments'
    )
    marketplace_order = models.ForeignKey(
        'marketplace.Order',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='shipment_ref'
    )
    
    # FPO
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='shipments')
    
    # Cargo Details
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE)
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Quantity in quintals"
    )
    number_of_bags = models.IntegerField()
    
    # Origin & Destination
    origin_location = models.CharField(max_length=200)
    origin_coordinates_lat = models.FloatField(null=True, blank=True)
    origin_coordinates_lng = models.FloatField(null=True, blank=True)
    destination_location = models.CharField(max_length=200)
    destination_coordinates_lat = models.FloatField(null=True, blank=True)
    destination_coordinates_lng = models.FloatField(null=True, blank=True)
    
    # Route
    route = models.ForeignKey('Route', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Vehicle & Driver
    vehicle = models.ForeignKey('Vehicle', on_delete=models.SET_NULL, null=True, related_name='shipments')
    driver_name = models.CharField(max_length=200)
    driver_contact = models.CharField(max_length=10)
    
    # Timeline
    scheduled_pickup_date = models.DateTimeField()
    actual_pickup_date = models.DateTimeField(null=True, blank=True)
    scheduled_delivery_date = models.DateTimeField()
    actual_delivery_date = models.DateTimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    
    # Tracking
    current_latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    last_tracking_update = models.DateTimeField(null=True, blank=True)
    tracking_history = models.JSONField(
        default=list,
        help_text="List of location updates with timestamps"
    )
    
    # Distance
    planned_distance_km = models.DecimalField(max_digits=8, decimal_places=2)
    actual_distance_km = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Costs
    transport_cost = models.DecimalField(max_digits=10, decimal_places=2)
    loading_charges = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    unloading_charges = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    other_charges = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Quality & Condition
    loading_quality_check = models.BooleanField(default=False)
    loading_condition = models.TextField(blank=True)
    unloading_quality_check = models.BooleanField(default=False)
    unloading_condition = models.TextField(blank=True)
    damage_reported = models.BooleanField(default=False)
    damage_details = models.TextField(blank=True)
    
    # Documents
    lr_number = models.CharField(max_length=50, blank=True, help_text="Lorry Receipt Number")
    e_way_bill_number = models.CharField(max_length=20, blank=True)
    delivery_challan = models.FileField(upload_to='shipments/challans/', null=True, blank=True)
    
    # Delay Management
    is_delayed = models.BooleanField(default=False)
    delay_reason = models.TextField(blank=True)
    delay_hours = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'shipments'
        verbose_name = 'Shipment'
        verbose_name_plural = 'Shipments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['shipment_number']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.shipment_number} - {self.status}"


class TransportBooking(models.Model):
    """Transport booking requests"""
    
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('quoted', 'Quoted'),
        ('confirmed', 'Confirmed'),
        ('assigned', 'Vehicle Assigned'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    booking_number = models.CharField(max_length=50, unique=True)
    fpo = models.ForeignKey('fpos.FPO', on_delete=models.CASCADE, related_name='transport_bookings')
    
    # Booking Details
    pickup_location = models.CharField(max_length=200)
    delivery_location = models.CharField(max_length=200)
    pickup_date = models.DateField()
    
    # Cargo
    crop = models.ForeignKey('crops.CropMaster', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Vehicle Requirements
    vehicle_type_required = models.CharField(max_length=20)
    vehicle_capacity_required = models.DecimalField(max_digits=8, decimal_places=2)
    
    # Quotations
    requested_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    quoted_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    final_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Assignment
    assigned_vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    assigned_shipment = models.OneToOneField(
        Shipment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'transport_bookings'
        verbose_name = 'Transport Booking'
        verbose_name_plural = 'Transport Bookings'
    
    def __str__(self):
        return f"{self.booking_number} - {self.status}"


class Delivery(models.Model):
    """Delivery confirmation and proof"""
    
    shipment = models.OneToOneField(Shipment, on_delete=models.CASCADE, related_name='delivery')
    
    # Delivery Details
    delivery_date = models.DateTimeField()
    delivered_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Receiver Information
    receiver_name = models.CharField(max_length=200)
    receiver_contact = models.CharField(max_length=10)
    receiver_signature = models.ImageField(upload_to='signatures/', null=True, blank=True)
    
    # Condition on Delivery
    condition_on_delivery = models.TextField()
    damaged_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    shortage_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    
    # Photos
    delivery_photos = models.JSONField(
        default=list,
        help_text="List of photo URLs"
    )
    
    # Proof of Delivery
    pod_document = models.FileField(upload_to='pod/', null=True, blank=True)
    
    # Feedback
    delivery_rating = models.IntegerField(
        null=True,
        blank=True,
        help_text="Rating 1-5"
    )
    delivery_feedback = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'deliveries'
        verbose_name = 'Delivery'
        verbose_name_plural = 'Deliveries'
    
    def __str__(self):
        return f"Delivery for {self.shipment.shipment_number}"


class FPOFleet(models.Model):
    """FPO fleet management and statistics"""
    
    fpo = models.OneToOneField('fpos.FPO', on_delete=models.CASCADE, related_name='fleet')
    
    # Fleet Statistics
    total_vehicles = models.IntegerField(default=0)
    owned_vehicles = models.IntegerField(default=0)
    hired_vehicles = models.IntegerField(default=0)
    
    # Capacity
    total_capacity_quintals = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    average_vehicle_capacity = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # Utilization
    total_trips_completed = models.IntegerField(default=0)
    total_distance_covered_km = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    average_trips_per_vehicle = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # Costs
    total_transport_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    average_cost_per_km = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    average_cost_per_quintal = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # Maintenance
    total_maintenance_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vehicles_under_maintenance = models.IntegerField(default=0)
    
    # Performance
    on_time_delivery_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    average_delay_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'fpo_fleets'
        verbose_name = 'FPO Fleet'
        verbose_name_plural = 'FPO Fleets'
    
    def __str__(self):
        return f"{self.fpo.name} Fleet"