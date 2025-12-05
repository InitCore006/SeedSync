"""
Processors Models for SeedSync Platform
"""
from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.constants import INDIAN_STATES


class ProcessorProfile(TimeStampedModel):
    """Processor profile"""
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='processor_profile')
    company_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    processing_capacity_quintals_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'processor_profiles'
    
    def __str__(self):
        return self.company_name


class ProcessingPlant(TimeStampedModel):
    """Processing plant details"""
    processor = models.ForeignKey(ProcessorProfile, on_delete=models.CASCADE, related_name='plants')
    plant_name = models.CharField(max_length=200)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    capacity_quintals_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'processing_plants'
    
    def __str__(self):
        return self.plant_name


class ProcessingBatch(TimeStampedModel):
    """Processing batch tracking"""
    plant = models.ForeignKey(ProcessingPlant, on_delete=models.CASCADE, related_name='batches')
    lot = models.ForeignKey('lots.ProcurementLot', on_delete=models.CASCADE, related_name='processing_batches')
    batch_number = models.CharField(max_length=50, unique=True)
    processed_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    oil_extracted = models.DecimalField(max_digits=10, decimal_places=2)
    cake_produced = models.DecimalField(max_digits=10, decimal_places=2)
    processing_date = models.DateField()
    
    class Meta:
        db_table = 'processing_batches'
    
    def __str__(self):
        return self.batch_number
