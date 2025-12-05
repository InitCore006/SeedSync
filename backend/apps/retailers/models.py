"""
Retailers Models for SeedSync Platform
"""
from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.constants import INDIAN_STATES


class RetailerProfile(TimeStampedModel):
    """Retailer profile"""
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='retailer_profile')
    business_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'retailer_profiles'
    
    def __str__(self):
        return self.business_name


class Store(TimeStampedModel):
    """Store/shop details"""
    retailer = models.ForeignKey(RetailerProfile, on_delete=models.CASCADE, related_name='stores')
    store_name = models.CharField(max_length=200)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    
    class Meta:
        db_table = 'stores'
    
    def __str__(self):
        return self.store_name
