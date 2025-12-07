"""
Logistics Models for SeedSync Platform
"""
from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.constants import INDIAN_STATES


class LogisticsPartner(TimeStampedModel):
    """Logistics partner profile - Logistics-specific fields only"""
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='logistics_profile')
    
    # Logistics-specific fields (not in UserProfile)
    company_name = models.CharField(max_length=200, help_text="Company/Business name")
    gst_number = models.CharField(max_length=15, blank=True, help_text="GST registration number")
    transport_license = models.CharField(max_length=50, blank=True, help_text="Transport license number")
    
    # Bank details for payments
    bank_account_number = models.CharField(max_length=20, blank=True)
    bank_ifsc_code = models.CharField(max_length=11, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_branch = models.CharField(max_length=100, blank=True)
    bank_account_holder_name = models.CharField(max_length=200, blank=True)
    
    # Verification status
    is_verified = models.BooleanField(default=False, help_text="Admin verified status")
    verification_documents = models.JSONField(default=dict, blank=True, help_text="Uploaded verification documents")
    
    # Service area
    service_states = models.JSONField(default=list, blank=True, help_text="States where service is available")
    
    # Ratings and performance
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_deliveries = models.IntegerField(default=0)
    on_time_delivery_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="Percentage")
    
    class Meta:
        db_table = 'logistics_partners'
        verbose_name = 'Logistics Partner'
        verbose_name_plural = 'Logistics Partners'
    
    def __str__(self):
        return f"{self.company_name} - {self.user.phone_number}"
    
    @property
    def contact_person(self):
        """Get contact person from UserProfile"""
        return self.user.profile.full_name if hasattr(self.user, 'profile') else self.user.phone_number
    
    @property
    def phone(self):
        """Get phone from User"""
        return self.user.phone_number
    
    @property
    def email(self):
        """Get email from User"""
        return self.user.email or ''
    
    @property
    def address(self):
        """Get address from UserProfile"""
        return self.user.profile.address if hasattr(self.user, 'profile') else ''
    
    @property
    def city(self):
        """Get city from UserProfile"""
        return self.user.profile.city if hasattr(self.user, 'profile') else ''
    
    @property
    def state(self):
        """Get state from UserProfile"""
        return self.user.profile.state if hasattr(self.user, 'profile') else ''


class Vehicle(TimeStampedModel):
    """Vehicle registered with logistics partner"""
    VEHICLE_TYPE_CHOICES = [
        ('mini_truck', 'Mini Truck (< 1 Ton)'),
        ('small_truck', 'Small Truck (1-3 Tons)'),
        ('medium_truck', 'Medium Truck (3-7 Tons)'),
        ('large_truck', 'Large Truck (7-15 Tons)'),
        ('trailer', 'Trailer (> 15 Tons)'),
        ('tempo', 'Tempo'),
    ]
    
    logistics_partner = models.ForeignKey(LogisticsPartner, on_delete=models.CASCADE, related_name='vehicles')
    vehicle_number = models.CharField(max_length=20, unique=True, help_text="Vehicle registration number")
    vehicle_type = models.CharField(max_length=50, choices=VEHICLE_TYPE_CHOICES)
    capacity_quintals = models.DecimalField(max_digits=8, decimal_places=2, help_text="Cargo capacity in quintals")
    
    # Vehicle details
    vehicle_model = models.CharField(max_length=100, blank=True)
    year_of_manufacture = models.IntegerField(null=True, blank=True)
    
    # Documentation
    rc_document = models.FileField(upload_to='vehicles/rc/', blank=True, null=True, help_text="Registration Certificate")
    insurance_document = models.FileField(upload_to='vehicles/insurance/', blank=True, null=True)
    pollution_certificate = models.FileField(upload_to='vehicles/pollution/', blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True, help_text="Currently available for booking")
    
    class Meta:
        db_table = 'vehicles'
        verbose_name = 'Vehicle'
        verbose_name_plural = 'Vehicles'
    
    def __str__(self):
        return f"{self.vehicle_number} ({self.get_vehicle_type_display()})"


class Shipment(TimeStampedModel):
    """Shipment tracking with detailed status"""
    SHIPMENT_STATUS_CHOICES = [
        ('pending', 'Pending Acceptance'),
        ('accepted', 'Accepted by Logistics'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    ]
    
    logistics_partner = models.ForeignKey(LogisticsPartner, on_delete=models.CASCADE, related_name='shipments')
    lot = models.ForeignKey('lots.ProcurementLot', on_delete=models.CASCADE, related_name='shipments')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='shipments')
    
    # Status tracking
    status = models.CharField(max_length=20, choices=SHIPMENT_STATUS_CHOICES, default='pending')
    
    # Dates
    scheduled_pickup_date = models.DateTimeField(null=True, blank=True)
    actual_pickup_date = models.DateTimeField(null=True, blank=True)
    scheduled_delivery_date = models.DateTimeField(null=True, blank=True)
    actual_delivery_date = models.DateTimeField(null=True, blank=True)
    
    # Locations
    pickup_address = models.TextField(blank=True)
    delivery_address = models.TextField(blank=True)
    current_location_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_location_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Pricing
    quoted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Quoted freight charges")
    final_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Additional info
    driver_name = models.CharField(max_length=200, blank=True)
    driver_phone = models.CharField(max_length=15, blank=True)
    notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    
    # Proof of delivery
    pod_image = models.ImageField(upload_to='shipments/pod/', blank=True, null=True, help_text="Proof of Delivery")
    receiver_signature = models.ImageField(upload_to='shipments/signatures/', blank=True, null=True)
    
    class Meta:
        db_table = 'shipments'
        verbose_name = 'Shipment'
        verbose_name_plural = 'Shipments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Shipment #{self.id} - {self.lot.lot_number} ({self.get_status_display()})"
