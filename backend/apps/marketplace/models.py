"""
Marketplace Models for SeedSync Platform
"""
from django.db import models
from apps.core.models import TimeStampedModel


class Listing(TimeStampedModel):
    """Marketplace listing"""
    lot = models.OneToOneField('lots.ProcurementLot', on_delete=models.CASCADE, related_name='listing')
    is_active = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'marketplace_listings'
    
    def __str__(self):
        return f"Listing for {self.lot.lot_number}"


class Order(TimeStampedModel):
    """Order tracking"""
    order_number = models.CharField(max_length=50, unique=True)
    buyer = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='orders')
    lot = models.ForeignKey('lots.ProcurementLot', on_delete=models.CASCADE, related_name='orders')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, default='pending')
    
    class Meta:
        db_table = 'orders'
    
    def __str__(self):
        return self.order_number


class Review(TimeStampedModel):
    """Reviews and ratings"""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='review')
    rating = models.IntegerField()
    comment = models.TextField(blank=True)
    
    class Meta:
        db_table = 'reviews'
    
    def __str__(self):
        return f"Review for {self.order.order_number}"
