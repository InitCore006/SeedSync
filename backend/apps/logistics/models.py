"""
Logistics Models for SeedSync Platform
"""
from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.constants import INDIAN_STATES


class LogisticsPartner(TimeStampedModel):
    """Logistics partner profile"""
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='logistics_profile')
    company_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'logistics_partners'
    
    def __str__(self):
        return self.company_name


class Vehicle(TimeStampedModel):
    """Vehicle registered with logistics partner"""
    logistics_partner = models.ForeignKey(LogisticsPartner, on_delete=models.CASCADE, related_name='vehicles')
    vehicle_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=50)
    capacity_quintals = models.DecimalField(max_digits=8, decimal_places=2)
    
    class Meta:
        db_table = 'vehicles'
    
    def __str__(self):
        return self.vehicle_number


class Shipment(TimeStampedModel):
    """Shipment tracking"""
    logistics_partner = models.ForeignKey(LogisticsPartner, on_delete=models.CASCADE, related_name='shipments')
    lot = models.ForeignKey('lots.ProcurementLot', on_delete=models.CASCADE, related_name='shipments')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, related_name='shipments')
    status = models.CharField(max_length=20, default='pending')
    pickup_date = models.DateField(null=True, blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'shipments'
    
    def __str__(self):
        return f"Shipment for {self.lot.lot_number}"
